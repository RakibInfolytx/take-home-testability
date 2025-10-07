export function selectRandom(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function selectRandomMultiple(array, count) {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export function selectVariedItems(array, count) {
  if (!array || array.length === 0) return [];
  const result = [];
  const step = Math.floor(array.length / count);
  
  for (let i = 0; i < count && i * step < array.length; i++) {
    result.push(array[i * step]);
  }
  
  return result;
}

export function generateRealisticProgress() {
  const progressLevels = [0, 25, 50, 75, 100];
  return progressLevels[Math.floor(Math.random() * progressLevels.length)];
}

export function generateQuizData(score = null) {
  const realisticScores = [65, 70, 75, 80, 85, 90, 95, 100];
  const actualScore = score !== null ? score : realisticScores[Math.floor(Math.random() * realisticScores.length)];
  const realisticTimes = [120, 180, 240, 300, 360, 420, 480];
  
  return {
    score: actualScore,
    passed: actualScore >= 70,
    completed_at: new Date().toISOString(),
    time_spent: realisticTimes[Math.floor(Math.random() * realisticTimes.length)],
  };
}

export function generateEnrollmentData(courseId) {
  return {
    course_id: courseId,
    enrollment_date: new Date().toISOString(),
    notification_preference: Math.random() > 0.5,
  };
}

export function randomSleep(min = 1, max = 3) {
  return min + Math.random() * (max - min);
}

export function extractCourseIds(topics) {
  const courseIds = [];
  
  topics.forEach(topic => {
    if (topic.courses && Array.isArray(topic.courses)) {
      topic.courses.forEach(course => {
        if (course.id) {
          courseIds.push(course.id);
        }
      });
    }
  });
  
  return courseIds;
}

export function createCourseSectionPairs(topics) {
  const pairs = [];
  const validSectionIndices = [0, 1, 2];
  
  topics.forEach(topic => {
    if (topic.courses && Array.isArray(topic.courses)) {
      topic.courses.forEach(course => {
        validSectionIndices.forEach(sectionIndex => {
          pairs.push({
            courseId: course.id,
            sectionIndex: sectionIndex,
            topicId: topic.id,
            courseTitle: course.course_title,
            courseLevel: course.course_level,
          });
        });
      });
    }
  });
  
  return pairs;
}

export function getValidCoursesOnly(topics) {
  const validCourses = [];
  
  topics.forEach(topic => {
    if (topic.courses && Array.isArray(topic.courses) && topic.courses.length > 0) {
      topic.courses.forEach(course => {
        if (course.id && course.course_title) {
          validCourses.push({
            ...course,
            topicId: topic.id,
            topicTitle: topic.title,
          });
        }
      });
    }
  });
  
  return validCourses;
}

export default {
  selectRandom,
  selectRandomMultiple,
  selectVariedItems,
  generateRealisticProgress,
  generateQuizData,
  generateEnrollmentData,
  randomSleep,
  extractCourseIds,
  createCourseSectionPairs,
  getValidCoursesOnly,
};

