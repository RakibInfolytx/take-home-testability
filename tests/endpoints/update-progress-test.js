import { check, sleep } from 'k6';
import { setupAuth } from '../../modules/auth.js';
import { getTopics } from '../../modules/topics.js';
import { updateCourseProgress } from '../../modules/courses.js';
import { enrollInCourse } from '../../modules/enrollment.js';
import { getValidCoursesOnly, selectRandom, generateRealisticProgress } from '../../utils/dataGenerator.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'update-progress',
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
    console.error('No valid courses available for update progress test');
    return;
  }
  
  const course = selectRandom(validCourses);
  
  enrollInCourse(accessToken, course.id, user.id);
  sleep(0.5);
  
  const progress = generateRealisticProgress();
  const result = updateCourseProgress(accessToken, course.id, progress);
  
  check(result, {
    'progress updated successfully': (r) => r !== null,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/update-progress-test-summary.json': JSON.stringify(data),
  };
}

