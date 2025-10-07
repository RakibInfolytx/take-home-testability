import { check, sleep } from 'k6';
import { setupAuth } from '../../modules/auth.js';
import { getTopics } from '../../modules/topics.js';
import { markQuizComplete } from '../../modules/courses.js';
import { enrollInCourse } from '../../modules/enrollment.js';
import { 
  createCourseSectionPairs, 
  selectRandom,
  generateQuizData 
} from '../../utils/dataGenerator.js';
import { CONFIG, getTestOptions } from '../../config/config.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'endpoint',
    endpoint: 'quiz-complete',
  },
};

export function setup() {
  const authData = setupAuth();
  
  const topics = getTopics(authData.accessToken);
  const courseSectionPairs = createCourseSectionPairs(topics);
  
  return {
    ...authData,
    courseSectionPairs,
  };
}

export default function (data) {
  const { accessToken, courseSectionPairs } = data;
  
  if (!courseSectionPairs || courseSectionPairs.length === 0) {
    console.error('No course-section pairs available for quiz complete test');
    return;
  }
  
  const pair = selectRandom(courseSectionPairs);
  const { courseId, sectionIndex } = pair;
  
  enrollInCourse(accessToken, courseId);
  sleep(0.5);
  
  const quizData = generateQuizData();
  const result = markQuizComplete(accessToken, courseId, sectionIndex, quizData);
  
  check(result, {
    'quiz marked as complete': (r) => r !== null,
  });
  
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/quiz-complete-test-summary.json': JSON.stringify(data),
  };
}

