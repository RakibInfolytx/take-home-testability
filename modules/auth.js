import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config/config.js';
import { logError, logSuccess } from '../utils/logger.js';

export function login(email = CONFIG.USER_EMAIL, password = CONFIG.USER_PASSWORD) {
  const url = `${CONFIG.BASE_URL}/log_in`;


  const payload = `grant_type=password&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  const params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    tags: { name: 'Login' },
  };

  const response = http.post(url, payload, params);

  const success = check(response, {
    'login status is 200': (r) => r.status === 200,
    'access token exists': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!body.access_token;
      } catch (e) {
        return false;
      }
    },
    'user data exists': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.user && body.user.id;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    logError('Login', response.status, response.body);
    return null;
  }

  const authData = JSON.parse(response.body);
  const cleanToken = authData.access_token.trim().replace(/^"|"$/g, ''); 

  logSuccess('Login', response.status, response.timings.duration);

  return {
    accessToken: cleanToken,
    tokenType: authData.token_type,
    user: authData.user,
  };
}

export function getAuthHeaders(token) {
  const cleanToken = token.trim().replace(/^"|"$/g, '');
  return {
    'Authorization': `Bearer ${cleanToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export function setupAuth() {
  const authData = login();
  if (!authData) {
    throw new Error('Authentication failed during setup');
  }
  return authData;
}

export default {
  login,
  getAuthHeaders,
  setupAuth,
};
