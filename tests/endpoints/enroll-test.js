import { check, sleep } from 'k6';
import { setupAuth } from '../../modules/auth.js';
import { getTopics } from '../../modules/topics.js';
import { enrollInCourse } from '../../modules/enrollment.js';
import { getValidCoursesOnly, selectRandom } from '../../utils/dataGenerator.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'enroll',
  },
};

export function setup() {
  const authData = setupAuth();
  
  const topics = getTopics(authData.accessToken);
  const validCourses = getValidCoursesOnly(topics);
  
  return {
    ...authData,
    validCourses,
  };
}

export default function (data) {
  const { accessToken, validCourses, user } = data;
  
  if (!validCourses || validCourses.length === 0) {
    console.error('No valid courses available for enrollment test');
    return;
  }
  
  const course = selectRandom(validCourses);
  const enrollmentResult = enrollInCourse(accessToken, course.id, user.id);
  
  check(enrollmentResult, {
    'enrollment successful': (result) => result !== null,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/enroll-test-summary.json': JSON.stringify(data),
  };
}

