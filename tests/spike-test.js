import { sleep } from 'k6';
import { setupAuth } from '../modules/auth.js';
import { getTopics } from '../modules/topics.js';
import { getCourses } from '../modules/courses.js';
import { enrollInCourse } from '../modules/enrollment.js';
import { selectRandom, getValidCoursesOnly, randomSleep } from '../utils/dataGenerator.js';
import { getTestOptions } from '../config/config.js';

export const options = {
  ...getTestOptions('spike'),
  tags: {
    test_type: 'spike',
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
  
  getTopics(accessToken);
  sleep(randomSleep(0.2, 0.5));
  
  getCourses(accessToken);
  sleep(randomSleep(0.2, 0.5));
  
  if (validCourses && validCourses.length > 0) {
    const course = selectRandom(validCourses);
    enrollInCourse(accessToken, course.id, user.id);
    sleep(randomSleep(0.2, 0.5));
  }
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/spike-test-summary.json': JSON.stringify(data),
  };
}

