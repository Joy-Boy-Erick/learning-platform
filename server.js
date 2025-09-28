const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for video uploads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- In-Memory Database ---
// Data copied and converted from context/mockData.ts

let MOCK_USERS = [
  { id: 'user-1', name: 'Make', email: 'shinmon3132002@gmail.com', password: '123456', role: 'Admin', status: 'Active', profilePicture: 'https://picsum.photos/seed/admin/200', pronoun: 'They/Them' },
  { id: 'user-2', name: 'Teacher Tia', email: 'teacher@yaymon.com', password: 'password123', role: 'Teacher', status: 'Active', profilePicture: 'https://picsum.photos/seed/teacher1/200', pronoun: 'She/Her' },
  { id: 'user-3', name: 'Student Sam', email: 'student@yaymon.com', password: 'password123', role: 'Student', status: 'Active', profilePicture: 'https://picsum.photos/seed/student1/200', pronoun: 'He/Him' },
  { id: 'user-4', name: 'Professor Plum', email: 'prof.plum@yaymon.com', password: 'password123', role: 'Teacher', status: 'Active', profilePicture: 'https://picsum.photos/seed/teacher2/200', pronoun: 'He/Him' },
  { id: 'user-5', name: 'Learner Lisa', email: 'lisa@yaymon.com', password: 'password123', role: 'Student', status: 'Active', profilePicture: 'https://picsum.photos/seed/student2/200', pronoun: 'She/Her' },
];

const MOCK_MODULES = [
    { id: 'm-1', title: 'Introduction to React', content: 'Learn the basics of React, including components, props, and state.', videoUrl: undefined },
    { id: 'm-2', title: 'State Management', content: 'Explore different state management solutions like Context API and Redux.', videoUrl: undefined },
    { id: 'm-3', title: 'Advanced Hooks', content: 'Deep dive into useEffect, useCallback, and custom hooks.', videoUrl: undefined },
];

let MOCK_COURSES = [
  { 
    id: 'course-1', 
    title: 'Advanced React Development', 
    description: 'Take your React skills to the next level with advanced concepts and best practices.', 
    category: 'Web Development', 
    thumbnail: 'https://picsum.photos/seed/react/600/400', 
    teacherId: 'user-2',
    modules: MOCK_MODULES,
    difficulty: 'Advanced',
  },
  { 
    id: 'course-2', 
    title: 'Introduction to UX Design', 
    description: 'Learn the fundamentals of User Experience design to create intuitive and user-friendly products.', 
    category: 'Design', 
    thumbnail: 'https://picsum.photos/seed/ux/600/400', 
    teacherId: 'user-4',
    modules: MOCK_MODULES.slice(0,2).map(m => ({...m, id: `m-${m.id}-2`})),
    difficulty: 'Beginner',
  },
  { 
    id: 'course-3', 
    title: 'Data Structures in Python', 
    description: 'Master essential data structures like arrays, linked lists, and trees using Python.', 
    category: 'Programming', 
    thumbnail: 'https://picsum.photos/seed/python/600/400', 
    teacherId: 'user-2',
    modules: MOCK_MODULES.slice(0,1).map(m => ({...m, id: `m-${m.id}-3`})),
    difficulty: 'Intermediate',
  },
  { 
    id: 'course-4', 
    title: 'Digital Marketing 101', 
    description: 'A comprehensive guide to the world of digital marketing, from SEO to social media.', 
    category: 'Marketing', 
    thumbnail: 'https://picsum.photos/seed/marketing/600/400', 
    teacherId: 'user-4',
    modules: [],
    difficulty: 'Beginner',
  },
];

let MOCK_ENROLLMENTS = [
  { id: 'enroll-1', courseId: 'course-1', studentId: 'user-3', status: 'Approved' },
  { id: 'enroll-2', courseId: 'course-2', studentId: 'user-3', status: 'Pending' },
  { id: 'enroll-3', courseId: 'course-1', studentId: 'user-5', status: 'Pending' },
  { id: 'enroll-4', courseId: 'course-3', studentId: 'user-5', status: 'Rejected' },
];

let MOCK_REVIEWS = [
    {
        id: 'review-1',
        courseId: 'course-1',
        studentId: 'user-3',
        rating: 5,
        comment: 'This course was fantastic! Teacher Tia is a great instructor and I learned so much about advanced React.',
        status: 'Approved',
        createdAt: '2023-10-26T10:00:00Z'
    },
    {
        id: 'review-2',
        courseId: 'course-3',
        studentId: 'user-3',
        rating: 4,
        comment: 'Good course, but I wish there were more exercises for practice.',
        status: 'Approved',
        createdAt: '2023-10-25T14:30:00Z'
    },
    {
        id: 'review-3',
        courseId: 'course-1',
        studentId: 'user-5',
        rating: 5,
        comment: 'Amazing content, highly recommend!',
        status: 'Pending',
        createdAt: '2023-10-27T11:00:00Z'
    },
    {
        id: 'review-4',
        courseId: 'course-2',
        studentId: 'user-5',
        rating: 2,
        comment: 'Not what I expected. The content was too basic.',
        status: 'Rejected',
        createdAt: '2023-10-22T09:00:00Z'
    }
];

// --- API Routes ---
const router = express.Router();

// --- Auth ---
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (user && user.status === 'Active') {
    const { password, ...userToReturn } = user;
    res.json(userToReturn);
  } else {
    res.status(401).json({ message: 'Invalid credentials or account disabled.' });
  }
});

router.post('/register', (req, res) => {
  const { name, email, role, password } = req.body;
  if (MOCK_USERS.some(u => u.email === email)) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role,
    status: 'Active',
    profilePicture: `https://picsum.photos/seed/${Date.now()}/200`,
    bio: ''
  };
  MOCK_USERS.push(newUser);
  const { password: _p, ...userToReturn } = newUser;
  res.status(201).json(userToReturn);
});


// --- Users ---
router.get('/users', (req, res) => {
  const sanitizedUsers = MOCK_USERS.map(u => {
    const { password, ...rest } = u;
    return rest;
  });
  res.json(sanitizedUsers);
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const index = MOCK_USERS.findIndex(u => u.id === id);
  if (index > -1) {
    const existingUser = MOCK_USERS[index];
    MOCK_USERS[index] = { ...existingUser, ...updatedUser, password: existingUser.password }; // Ensure password is not overwritten
    const { password, ...userToReturn } = MOCK_USERS[index];
    res.json(userToReturn);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = MOCK_USERS.length;
  MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
  if (MOCK_USERS.length < initialLength) {
    res.json({ id });
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
});

// --- Courses ---
router.get('/courses', (req, res) => {
  res.json(MOCK_COURSES);
});

router.post('/courses', (req, res) => {
  const courseData = req.body;
  const newCourse = { ...courseData, id: `course-${Date.now()}` };
  MOCK_COURSES.push(newCourse);
  res.status(201).json(newCourse);
});

router.put('/courses/:id', (req, res) => {
  const { id } = req.params;
  const updatedCourse = req.body;
  const index = MOCK_COURSES.findIndex(c => c.id === id);
  if (index > -1) {
    MOCK_COURSES[index] = updatedCourse;
    res.json(updatedCourse);
  } else {
    res.status(404).json({ message: 'Course not found.' });
  }
});

// --- Enrollments ---
router.get('/enrollments', (req, res) => {
  res.json(MOCK_ENROLLMENTS);
});

router.post('/enrollments', (req, res) => {
  const { courseId, studentId } = req.body;
  const existing = MOCK_ENROLLMENTS.find(e => e.courseId === courseId && e.studentId === studentId);
  if (existing) {
    return res.status(400).json({ message: 'You have already requested to enroll in this course.' });
  }
  const newEnrollment = {
    id: `enroll-${Date.now()}`,
    courseId,
    studentId,
    status: 'Pending',
  };
  MOCK_ENROLLMENTS.push(newEnrollment);
  res.status(201).json(newEnrollment);
});

router.put('/enrollments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = MOCK_ENROLLMENTS.findIndex(e => e.id === id);
  if (index > -1) {
    MOCK_ENROLLMENTS[index].status = status;
    res.json(MOCK_ENROLLMENTS[index]);
  } else {
    res.status(404).json({ message: 'Enrollment not found.' });
  }
});

// --- Reviews ---
router.get('/reviews', (req, res) => {
  res.json(MOCK_REVIEWS);
});

router.post('/reviews', (req, res) => {
  const reviewData = req.body;
  const newReview = {
    ...reviewData,
    id: `review-${Date.now()}`,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  MOCK_REVIEWS.push(newReview);
  res.status(201).json(newReview);
});

router.put('/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = MOCK_REVIEWS.findIndex(r => r.id === id);
  if (index > -1) {
    MOCK_REVIEWS[index].status = status;
    res.json(MOCK_REVIEWS[index]);
  } else {
    res.status(404).json({ message: 'Review not found.' });
  }
});

router.delete('/reviews/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = MOCK_REVIEWS.length;
  MOCK_REVIEWS = MOCK_REVIEWS.filter(r => r.id !== id);
  if (MOCK_REVIEWS.length < initialLength) {
    res.json({ id });
  } else {
    res.status(404).json({ message: 'Review not found.' });
  }
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
