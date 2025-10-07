import { check, sleep } from 'k6';
import { login } from '../../modules/auth.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'login',
  },
};

export default function () {
  const authData = login();
  
  check(authData, {
    'authentication successful': (data) => data !== null,
    'access token received': (data) => data && data.accessToken !== undefined,
    'user data present': (data) => data && data.user !== undefined,
    'user id exists': (data) => data && data.user && data.user.id !== undefined,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/login-test-summary.json': JSON.stringify(data),
  };
}

