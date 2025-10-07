import { sleep } from 'k6';
import { setupAuth } from '../modules/auth.js';
import { getTopics } from '../modules/topics.js';
import { getCourses } from '../modules/courses.js';
import { enrollInCourse } from '../modules/enrollment.js';
import { markQuizComplete } from '../modules/courses.js';
import { 
  selectRandom, 
  extractCourseIds,
  generateQuizData,
  randomSleep 
} from '../utils/dataGenerator.js';
import { getTestOptions } from '../config/config.js';

export const options = {
  ...getTestOptions('stress'),
  tags: {
    test_type: 'stress',
  },
};

export function setup() {
  const authData = setupAuth();
  const topics = getTopics(authData.accessToken);
  const courseIds = extractCourseIds(topics);
  
  return {
    ...authData,
    courseIds,
  };
}

export default function (data) {
  const { accessToken, courseIds } = data;
  
  const topics = getTopics(accessToken);
  sleep(randomSleep(0.5, 1));
  
  const courses = getCourses(accessToken);
  sleep(randomSleep(0.5, 1));
  
  if (courseIds && courseIds.length > 0) {
    const courseId = selectRandom(courseIds);
    enrollInCourse(accessToken, courseId);
    sleep(randomSleep(0.3, 0.7));
    
    const sectionIndex = Math.floor(Math.random() * 3);
    const quizData = generateQuizData();
    markQuizComplete(accessToken, courseId, sectionIndex, quizData);
    sleep(randomSleep(0.3, 0.7));
  }
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/stress-test-summary.json': JSON.stringify(data),
  };
}

