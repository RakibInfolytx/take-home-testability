import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config/config.js';
import { getAuthHeaders } from './auth.js';
import { logError, logSuccess } from '../utils/logger.js';

export function getTopics(token) {
  const url = `${CONFIG.BASE_URL}/topics`;
  
  const params = {
    headers: getAuthHeaders(token),
    tags: { name: 'GetTopics' },
  };

  const response = http.get(url, params);

  const success = check(response, {
    'get topics status is 200': (r) => r.status === 200,
    'topics list is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
    'topics have required fields': (r) => {
      try {
        const body = JSON.parse(r.body);
        if (body.length === 0) return true;
        const topic = body[0];
        return topic.id !== undefined && 
               topic.title !== undefined && 
               topic.courses !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    logError('GetTopics', response.status, response.body);
    return [];
  }

  logSuccess('GetTopics', response.status, response.timings.duration);
  return JSON.parse(response.body);
}

export function getTopicById(token, topicId) {
  const topics = getTopics(token);
  return topics.find(topic => topic.id === topicId);
}

export function getAllCoursesFromTopics(token) {
  const topics = getTopics(token);
  let allCourses = [];
  
  topics.forEach(topic => {
    if (topic.courses && Array.isArray(topic.courses)) {
      allCourses = allCourses.concat(topic.courses.map(course => ({
        ...course,
        topicId: topic.id,
        topicTitle: topic.title,
      })));
    }
  });
  
  return allCourses;
}

export default {
  getTopics,
  getTopicById,
  getAllCoursesFromTopics,
};

