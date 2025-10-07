import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config/config.js';
import { getAuthHeaders } from './auth.js';
import { logError, logSuccess } from '../utils/logger.js';

export function enrollInCourse(token, courseId, userId, additionalData = {}) {
  const url = `${CONFIG.BASE_URL}/enroll`;
  
  const payload = JSON.stringify({
    course_id: courseId,
    user_id: userId,
    ...additionalData,
  });
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'EnrollInCourse' },
  };

  const response = http.post(url, payload, params);

  const success = check(response, {
    'enroll status is 200 or 201 or 409': (r) => 
      r.status === 200 || r.status === 201 || r.status === 409,
    'enrollment response is valid': (r) => {
      try {
        if (r.body) {
          JSON.parse(r.body);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    logError('EnrollInCourse', response.status, response.body);
    return null;
  }

  logSuccess('EnrollInCourse', response.status, response.timings.duration);
  
  try {
    return JSON.parse(response.body);
  } catch (e) {
    return { courseId, status: 'enrolled' };
  }
}

export function getUserEnrollments(token) {
  const url = `${CONFIG.BASE_URL}/enrollments`;
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'GetUserEnrollments' },
  };

  const response = http.get(url, params);

  const success = check(response, {
    'get enrollments status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  if (response.status === 200) {
    logSuccess('GetUserEnrollments', response.status, response.timings.duration);
    try {
      return JSON.parse(response.body);
    } catch (e) {
      return [];
    }
  }

  return [];
}

export function enrollInMultipleCourses(token, courseIds, userId) {
  const enrollments = [];
  
  courseIds.forEach(courseId => {
    const result = enrollInCourse(token, courseId, userId);
    if (result) {
      enrollments.push(result);
    }
    sleep(0.5);
  });
  
  return enrollments;
}

export default {
  enrollInCourse,
  getUserEnrollments,
  enrollInMultipleCourses,
};

