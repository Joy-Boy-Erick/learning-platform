import { User, Role, Course, Enrollment, EnrollmentStatus, CourseModule, Difficulty, UserStatus, Review, ReviewStatus } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Make', email: 'shinmon3132002@gmail.com', password: '123456', role: Role.Admin, status: UserStatus.Active, profilePicture: 'https://picsum.photos/seed/admin/200', pronoun: 'They/Them' },
  { id: 'user-2', name: 'Teacher Tia', email: 'teacher@yaymon.com', password: 'password123', role: Role.Teacher, status: UserStatus.Active, profilePicture: 'https://picsum.photos/seed/teacher1/200', pronoun: 'She/Her' },
  { id: 'user-3', name: 'Student Sam', email: 'student@yaymon.com', password: 'password123', role: Role.Student, status: UserStatus.Active, profilePicture: 'https://picsum.photos/seed/student1/200', pronoun: 'He/Him' },
  { id: 'user-4', name: 'Professor Plum', email: 'prof.plum@yaymon.com', password: 'password123', role: Role.Teacher, status: UserStatus.Active, profilePicture: 'https://picsum.photos/seed/teacher2/200', pronoun: 'He/Him' },
  { id: 'user-5', name: 'Learner Lisa', email: 'lisa@yaymon.com', password: 'password123', role: Role.Student, status: UserStatus.Active, profilePicture: 'https://picsum.photos/seed/student2/200', pronoun: 'She/Her' },
];

const MOCK_MODULES: CourseModule[] = [
    { id: 'm-1', title: 'Introduction to React', content: 'Learn the basics of React, including components, props, and state.'},
    { id: 'm-2', title: 'State Management', content: 'Explore different state management solutions like Context API and Redux.'},
    { id: 'm-3', title: 'Advanced Hooks', content: 'Deep dive into useEffect, useCallback, and custom hooks.'},
];

export const MOCK_COURSES: Course[] = [
  { 
    id: 'course-1', 
    title: 'Advanced React Development', 
    description: 'Take your React skills to the next level with advanced concepts and best practices.', 
    category: 'Web Development', 
    thumbnail: 'https://picsum.photos/seed/react/600/400', 
    teacherId: 'user-2',
    modules: MOCK_MODULES,
    difficulty: Difficulty.Advanced,
  },
  { 
    id: 'course-2', 
    title: 'Introduction to UX Design', 
    description: 'Learn the fundamentals of User Experience design to create intuitive and user-friendly products.', 
    category: 'Design', 
    thumbnail: 'https://picsum.photos/seed/ux/600/400', 
    teacherId: 'user-4',
    modules: MOCK_MODULES.slice(0,2).map(m => ({...m, id: `m-${m.id}-2`})),
    difficulty: Difficulty.Beginner,
  },
  { 
    id: 'course-3', 
    title: 'Data Structures in Python', 
    description: 'Master essential data structures like arrays, linked lists, and trees using Python.', 
    category: 'Programming', 
    thumbnail: 'https://picsum.photos/seed/python/600/400', 
    teacherId: 'user-2',
    modules: MOCK_MODULES.slice(0,1).map(m => ({...m, id: `m-${m.id}-3`})),
    difficulty: Difficulty.Intermediate,
  },
  { 
    id: 'course-4', 
    title: 'Digital Marketing 101', 
    description: 'A comprehensive guide to the world of digital marketing, from SEO to social media.', 
    category: 'Marketing', 
    thumbnail: 'https://picsum.photos/seed/marketing/600/400', 
    teacherId: 'user-4',
    modules: [],
    difficulty: Difficulty.Beginner,
  },
];

export const MOCK_ENROLLMENTS: Enrollment[] = [
  { id: 'enroll-1', courseId: 'course-1', studentId: 'user-3', status: EnrollmentStatus.Approved },
  { id: 'enroll-2', courseId: 'course-2', studentId: 'user-3', status: EnrollmentStatus.Pending },
  { id: 'enroll-3', courseId: 'course-1', studentId: 'user-5', status: EnrollmentStatus.Pending },
  { id: 'enroll-4', courseId: 'course-3', studentId: 'user-5', status: EnrollmentStatus.Rejected },
];

export const MOCK_REVIEWS: Review[] = [
    {
        id: 'review-1',
        courseId: 'course-1',
        studentId: 'user-3',
        rating: 5,
        comment: 'This course was fantastic! Teacher Tia is a great instructor and I learned so much about advanced React.',
        status: ReviewStatus.Approved,
        createdAt: '2023-10-26T10:00:00Z'
    },
    {
        id: 'review-2',
        courseId: 'course-3',
        studentId: 'user-3',
        rating: 4,
        comment: 'Good course, but I wish there were more exercises for practice.',
        status: ReviewStatus.Approved,
        createdAt: '2023-10-25T14:30:00Z'
    },
    {
        id: 'review-3',
        courseId: 'course-1',
        studentId: 'user-5',
        rating: 5,
        comment: 'Amazing content, highly recommend!',
        status: ReviewStatus.Pending,
        createdAt: '2023-10-27T11:00:00Z'
    },
    {
        id: 'review-4',
        courseId: 'course-2',
        studentId: 'user-5',
        rating: 2,
        comment: 'Not what I expected. The content was too basic.',
        status: ReviewStatus.Rejected,
        createdAt: '2023-10-22T09:00:00Z'
    }
];