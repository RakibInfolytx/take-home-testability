import { check, sleep } from 'k6';
import { setupAuth } from '../../modules/auth.js';
import { getCourses } from '../../modules/courses.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'courses',
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const { accessToken } = data;
  
  const courses = getCourses(accessToken);
  
  check(courses, {
    'courses endpoint responded': (c) => c !== null,
    'courses data is valid': (c) => c !== null,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/courses-test-summary.json': JSON.stringify(data),
  };
}

