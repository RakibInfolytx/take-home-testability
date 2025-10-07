import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config/config.js';
import { getAuthHeaders } from './auth.js';
import { logError, logSuccess } from '../utils/logger.js';

export function getCourses(token) {
  const url = `${CONFIG.BASE_URL}/courses`;
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'GetCourses' },
  };

  const response = http.get(url, params);

  const success = check(response, {
    'get courses status is 200': (r) => r.status === 200,
    'courses response is valid': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    logError('GetCourses', response.status, response.body);
    return [];
  }

  logSuccess('GetCourses', response.status, response.timings.duration);
  return JSON.parse(response.body);
}

export function getCourseById(token, courseId) {
  const url = `${CONFIG.BASE_URL}/courses/${courseId}`;
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'GetCourseById' },
  };

  const response = http.get(url, params);

  const success = check(response, {
    'get course by id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  if (response.status === 200) {
    logSuccess('GetCourseById', response.status, response.timings.duration);
    return JSON.parse(response.body);
  }

  return null;
}

export function updateCourseProgress(token, courseId, progress) {
  const url = `${CONFIG.BASE_URL}/courses/update_progress`;
  
  const payload = JSON.stringify({
    course_id: courseId,
    progress: progress,
  });
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'UpdateCourseProgress' },
  };

  const response = http.put(url, payload, params);

  const success = check(response, {
    'update progress status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  if (!success) {
    logError('UpdateCourseProgress', response.status, response.body);
    return null;
  }

  logSuccess('UpdateCourseProgress', response.status, response.timings.duration);
  
  try {
    return JSON.parse(response.body);
  } catch (e) {
    return response.body;
  }
}

export function markQuizComplete(token, courseId, sectionIndex, quizData = {}) {
  const url = `${CONFIG.BASE_URL}/courses/${courseId}/sections/${sectionIndex}/quiz-complete`;
  
  const payload = JSON.stringify(quizData);
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'MarkQuizComplete' },
  };

  const response = http.post(url, payload, params);

  const success = check(response, {
    'mark quiz complete status is 200 or 201': (r) => r.status === 200 || r.status === 201 || r.status === 204,
  });

  if (!success) {
    logError('MarkQuizComplete', response.status, response.body);
    return null;
  }

  logSuccess('MarkQuizComplete', response.status, response.timings.duration);
  
  try {
    return JSON.parse(response.body);
  } catch (e) {
    return { status: 'completed' };
  }
}

export default {
  getCourses,
  getCourseById,
  updateCourseProgress,
  markQuizComplete,
};

