import { check, sleep } from 'k6';
import { setupAuth } from '../../modules/auth.js';
import { getTopics, getAllCoursesFromTopics } from '../../modules/topics.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'topics',
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const { accessToken } = data;
  
  const topics = getTopics(accessToken);
  
  check(topics, {
    'topics retrieved': (t) => t !== null && t.length > 0,
    'topics have id': (t) => t.length > 0 && t[0].id !== undefined,
    'topics have title': (t) => t.length > 0 && t[0].title !== undefined,
    'topics have courses': (t) => t.length > 0 && t[0].courses !== undefined,
    'courses are array': (t) => t.length > 0 && Array.isArray(t[0].courses),
  });
  
  const allCourses = getAllCoursesFromTopics(accessToken);
  
  check(allCourses, {
    'courses extracted from topics': (c) => c.length > 0,
    'courses have course_id': (c) => c.length > 0 && c[0].id !== undefined,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/topics-test-summary.json': JSON.stringify(data),
  };
}

