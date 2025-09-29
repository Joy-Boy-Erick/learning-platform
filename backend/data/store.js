// This file acts as a temporary in-memory database using the mock data.
// In a real application, the functions here would interact with a database (e.g., using the MySQL pool from config/db.js).

import { MOCK_USERS, MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_REVIEWS } from './mockData.js';

// Deep copy mock data to prevent modification of the original objects during runtime
let users = JSON.parse(JSON.stringify(MOCK_USERS));
let courses = JSON.parse(JSON.stringify(MOCK_COURSES));
let enrollments = JSON.parse(JSON.stringify(MOCK_ENROLLMENTS));
let reviews = JSON.parse(JSON.stringify(MOCK_REVIEWS));
let session = { userId: null };

// --- Auth Functions ---
export const login = (email, password) => {
  const user = users.find(u => u.email === email && u.password === password);
  if (user && user.status === 'Active') {
    session.userId = user.id;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  throw new Error('Invalid credentials or user is disabled.');
};

export const logout = () => {
  session.userId = null;
};

export const getSessionUser = () => {
  if (session.userId) {
    const user = users.find(u => u.id === session.userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
};

export const register = (name, email, role, password) => {
  if (users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role,
    status: 'Active',
    profilePicture: `https://picsum.photos/seed/${Date.now()}/200`,
  };
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// --- User Functions ---
export const getUsers = () => users.map(({ password, ...user }) => user);

export const updateUser = (updatedUser) => {
  const userIndex = users.findIndex(u => u.id === updatedUser.id);
  if (userIndex > -1) {
    const originalPassword = users[userIndex].password;
    users[userIndex] = { ...users[userIndex], ...updatedUser, password: updatedUser.password || originalPassword };
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  }
  throw new Error('User not found.');
};

export const deleteUser = (userId) => {
  const initialLength = users.length;
  users = users.filter(u => u.id !== userId);
  if (users.length < initialLength) {
    enrollments = enrollments.filter(e => e.studentId !== userId);
    reviews = reviews.filter(r => r.studentId !== userId);
    courses = courses.filter(c => c.teacherId !== userId);
    return userId;
  }
  throw new Error('User not found.');
};

// --- Course Functions ---
export const getCourses = () => courses;

export const addCourse = (courseData) => {
  const newCourse = {
    id: `course-${Date.now()}`,
    ...courseData,
  };
  courses.push(newCourse);
  return newCourse;
};

export const updateCourse = (updatedCourse) => {
  const courseIndex = courses.findIndex(c => c.id === updatedCourse.id);
  if (courseIndex > -1) {
    courses[courseIndex] = updatedCourse;
    return updatedCourse;
  }
  throw new Error('Course not found.');
};

// --- Module-specific Functions ---
export const addModuleToCourse = (courseId, moduleData) => {
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    throw new Error('Course not found.');
  }
  const newModule = {
    id: `mod-${Date.now()}`,
    ...moduleData
  };
  course.modules.push(newModule);
  return newModule;
};

export const updateModuleInCourse = (courseId, moduleId, moduleData) => {
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    throw new Error('Course not found.');
  }
  const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
  if (moduleIndex === -1) {
    throw new Error('Module not found.');
  }
  course.modules[moduleIndex] = { ...course.modules[moduleIndex], ...moduleData };
  return course.modules[moduleIndex];
};

export const deleteModuleFromCourse = (courseId, moduleId) => {
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    throw new Error('Course not found.');
  }
  const initialLength = course.modules.length;
  course.modules = course.modules.filter(m => m.id !== moduleId);
  if (course.modules.length === initialLength) {
    throw new Error('Module not found.');
  }
  return { id: moduleId };
};

// This function can handle reordering or any batch update of modules.
export const updateCourseModules = (courseId, newModules) => {
  const course = courses.find(c => c.id === courseId);
  if (!course) {
    throw new Error('Course not found.');
  }
  course.modules = newModules;
  return course;
};


// --- Enrollment Functions ---
export const getEnrollments = () => enrollments;

export const addEnrollment = (courseId, studentId) => {
  if (enrollments.some(e => e.courseId === courseId && e.studentId === studentId)) {
    throw new Error('You are already enrolled or have a pending enrollment for this course.');
  }
  const newEnrollment = {
    id: `enroll-${Date.now()}`,
    courseId,
    studentId,
    status: 'Pending',
  };
  enrollments.push(newEnrollment);
  return newEnrollment;
};

export const updateEnrollment = (enrollmentId, status) => {
  const enrollment = enrollments.find(e => e.id === enrollmentId);
  if (enrollment) {
    enrollment.status = status;
    return enrollment;
  }
  throw new Error('Enrollment not found.');
};

// --- Review Functions ---
export const getReviews = () => reviews;

export const addReview = (reviewData) => {
  const newReview = {
    id: `review-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    ...reviewData,
  };
  reviews.push(newReview);
  return newReview;
};

export const updateReview = (reviewId, status) => {
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    review.status = status;
    return review;
  }
  throw new Error('Review not found.');
};

export const deleteReview = (reviewId) => {
  reviews = reviews.filter(r => r.id !== reviewId);
  return reviewId;
};