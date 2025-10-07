import { sleep, check, group } from 'k6';
import { login, getAuthHeaders } from '../../modules/auth.js';
import { getTopics, getAllCoursesFromTopics } from '../../modules/topics.js';
import { getCourses, updateCourseProgress, markQuizComplete, getCourseById } from '../../modules/courses.js';
import { enrollInCourse, getUserEnrollments } from '../../modules/enrollment.js';
import { 
  selectRandom, 
  generateProgressData,
  generateQuizData,
  randomSleep 
} from '../../utils/dataGenerator.js';
import { getTestOptions } from '../../config/config.js';
import { logInfo } from '../../utils/logger.js';

export const options = {
  ...getTestOptions('load'),
  tags: {
    test_type: 'workflow',
    workflow: 'course-completion',
  },
};

export default function () {
  let authData, selectedCourse;
  
  group('01_User_Login', () => {
    authData = login();
    check(authData, {
      'user logged in successfully': (data) => data !== null && data.accessToken !== undefined,
    });
    sleep(randomSleep(1, 2));
  });
  
  if (!authData) {
    logInfo('Authentication failed, aborting workflow');
    return;
  }
  
  const { accessToken, user } = authData;
  
  group('02_Browse_Topics', () => {
    const topics = getTopics(accessToken);
    check(topics, {
      'topics loaded successfully': (t) => t !== null && t.length > 0,
    });
    sleep(randomSleep(2, 3));
  });
  
  group('03_View_All_Courses', () => {
    const courses = getCourses(accessToken);
    check(courses, {
      'courses loaded successfully': (c) => c !== null,
    });
    sleep(randomSleep(2, 3));
  });
  
  group('04_Select_Course', () => {
    const allCourses = getAllCoursesFromTopics(accessToken);
    if (allCourses && allCourses.length > 0) {
      selectedCourse = selectRandom(allCourses);
      check(selectedCourse, {
        'course selected': (c) => c !== null && c.id !== undefined,
      });
      logInfo(`Selected course: ${selectedCourse.course_title} (ID: ${selectedCourse.id})`);
    }
    sleep(randomSleep(1, 2));
  });
  
  if (!selectedCourse) {
    logInfo('No course selected, aborting workflow');
    return;
  }
  
  group('05_Enroll_In_Course', () => {
    const enrollResult = enrollInCourse(accessToken, selectedCourse.id);
    check(enrollResult, {
      'enrollment successful': (r) => r !== null,
    });
    sleep(randomSleep(1, 2));
  });
  
  group('06_View_Course_Details', () => {
    const courseDetails = getCourseById(accessToken, selectedCourse.id);
    sleep(randomSleep(2, 3));
  });
  
  group('07_Progress_Through_Sections', () => {
    for (let sectionIndex = 0; sectionIndex < 3; sectionIndex++) {
      const progressData = generateProgressData(selectedCourse.id, sectionIndex);
      progressData.progress_percentage = ((sectionIndex + 1) / 3) * 100;
      
      const progressResult = updateCourseProgress(accessToken, progressData);
      check(progressResult, {
        [`section ${sectionIndex} progress updated`]: (r) => r !== null,
      });
      
      sleep(randomSleep(2, 4));
      
      const quizData = generateQuizData(Math.floor(Math.random() * 30) + 70);
      const quizResult = markQuizComplete(accessToken, selectedCourse.id, sectionIndex, quizData);
      check(quizResult, {
        [`section ${sectionIndex} quiz completed`]: (r) => r !== null,
      });
      
      sleep(randomSleep(2, 3));
    }
  });
  
  group('08_Complete_Course', () => {
    const finalProgressData = {
      course_id: selectedCourse.id,
      progress_percentage: 100,
      completed: true,
      completed_at: new Date().toISOString(),
    };
    
    const completeResult = updateCourseProgress(accessToken, finalProgressData);
    check(completeResult, {
      'course marked as complete': (r) => r !== null,
    });
    sleep(randomSleep(1, 2));
  });
  
  group('09_View_Enrollments', () => {
    const enrollments = getUserEnrollments(accessToken);
    sleep(randomSleep(1, 2));
  });
  
  logInfo(`Workflow completed for user: ${user.email}, course: ${selectedCourse.course_title}`);
  sleep(1);
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'results/course-completion-workflow-summary.json': JSON.stringify(data),
  };
}

