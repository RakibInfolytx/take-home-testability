import { sleep } from 'k6';
import { setupAuth } from '../modules/auth.js';
import { getTopics, getAllCoursesFromTopics } from '../modules/topics.js';
import { getCourses, updateCourseProgress } from '../modules/courses.js';
import { enrollInCourse } from '../modules/enrollment.js';
import { 
  selectRandom, 
  generateProgressData,
  randomSleep 
} from '../utils/dataGenerator.js';
import { getTestOptions } from '../config/config.js';

export const options = {
  ...getTestOptions('soak'),
  tags: {
    test_type: 'soak',
  },
};

export function setup() {
  return setupAuth();
}

export default function (data) {
  const { accessToken } = data;
  
  const topics = getTopics(accessToken);
  sleep(randomSleep(2, 3));
  
  if (topics && topics.length > 0) {
    const courses = getCourses(accessToken);
    sleep(randomSleep(2, 3));
    
    const allCourses = getAllCoursesFromTopics(accessToken);
    
    if (allCourses && allCourses.length > 0) {
      const selectedCourse = selectRandom(allCourses);
      enrollInCourse(accessToken, selectedCourse.id);
      sleep(randomSleep(2, 3));
      
      const progressData = generateProgressData(selectedCourse.id, 0);
      updateCourseProgress(accessToken, progressData);
      sleep(randomSleep(2, 3));
    }
  }
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/soak-test-summary.json': JSON.stringify(data),
  };
}

