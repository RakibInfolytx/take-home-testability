import { sleep } from 'k6';
import { setupAuth } from '../modules/auth.js';
import { getTopics, getAllCoursesFromTopics } from '../modules/topics.js';
import { getCourses } from '../modules/courses.js';
import { enrollInCourse } from '../modules/enrollment.js';
import { updateCourseProgress } from '../modules/courses.js';
import { 
  selectRandom, 
  generateProgressData,
  randomSleep 
} from '../utils/dataGenerator.js';
import { getTestOptions } from '../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'load',
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const { accessToken } = data;
  
  const topics = getTopics(accessToken);
  sleep(randomSleep(1, 2));
  
  if (topics && topics.length > 0) {
    const courses = getCourses(accessToken);
    sleep(randomSleep(1, 2));
    
    const allCourses = getAllCoursesFromTopics(accessToken);
    
    if (allCourses && allCourses.length > 0) {
      const selectedCourse = selectRandom(allCourses);
      const enrollResult = enrollInCourse(accessToken, selectedCourse.id);
      sleep(randomSleep(1, 2));
      
      if (enrollResult) {
        const progressData = generateProgressData(selectedCourse.id, 0);
        updateCourseProgress(accessToken, progressData);
        sleep(randomSleep(1, 2));
      }
    }
  }
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/load-test-summary.json': JSON.stringify(data),
  };
}

