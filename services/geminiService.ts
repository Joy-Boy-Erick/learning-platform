import { GoogleGenAI, Type } from '@google/genai';
import { User, Course, Enrollment, Role, UserStatus, EnrollmentStatus, Review, ReviewStatus, CourseModule } from '../types';
import { MOCK_USERS, MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_REVIEWS } from '../context/mockData';

// --- LocalStorage Mock Database ---

const DB_KEY = 'yay-mon-db';

interface MockDatabase {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  reviews: Review[];
  session: { userId: string | null };
}

const getDb = (): MockDatabase => {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse DB from localStorage", e);
  }
  // Initialize with mock data if DB is empty or fails to parse
  const initialDb: MockDatabase = {
    users: MOCK_USERS,
    courses: MOCK_COURSES,
    enrollments: MOCK_ENROLLMENTS,
    reviews: MOCK_REVIEWS,
    session: { userId: null },
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDb = (db: MockDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Gemini AI Service ---

export const isAiConfigured = (): boolean => {
  // This check is a placeholder. In a real application, the key would be
  // on a server and this check would be an API call or unnecessary.
  return !!process.env.API_KEY;
};

export const generateCourseContent = async (title: string): Promise<{ description: string; modules: { title: string; content: string }[] }> => {
  if (!isAiConfigured()) {
    throw new Error("AI features are not configured. Please set the API_KEY environment variable.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a course outline for a course titled "${title}". The output should be a JSON object with two properties: "description" (a string of 2-3 sentences) and "modules" (an array of objects, where each object has a "title" and a "content" property). Generate 3-5 modules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["description", "modules"],
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating course content:", error);
    throw new Error("Failed to generate course content with AI. The model may be unavailable or the request was invalid.");
  }
};


// --- Auth API ---

export const apiLogin = async (email: string, password: string): Promise<User> => {
  await delay(500);
  const db = getDb();
  const user = db.users.find(u => u.email === email && u.password === password);
  if (user && user.status === UserStatus.Active) {
    db.session.userId = user.id;
    saveDb(db);
    // Don't return password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  throw new Error('Invalid credentials or user is disabled.');
};

export const apiLogout = async (): Promise<void> => {
  await delay(200);
  const db = getDb();
  db.session.userId = null;
  saveDb(db);
};

export const apiGetSession = async (): Promise<User | null> => {
  await delay(300);
  const db = getDb();
  if (db.session.userId) {
    const user = db.users.find(u => u.id === db.session.userId);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
};

export const apiRegister = async (name: string, email: string, role: Role, password: string): Promise<User> => {
  await delay(600);
  const db = getDb();
  if (db.users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role,
    status: UserStatus.Active,
    profilePicture: `https://picsum.photos/seed/${Date.now()}/200`,
  };
  db.users.push(newUser);
  saveDb(db);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// --- User API ---
export const apiFetchUsers = async (): Promise<User[]> => {
  await delay(400);
  const db = getDb();
  return db.users.map(({ password, ...user }) => user);
};

export const apiUpdateUser = async (updatedUser: User): Promise<User> => {
  await delay(400);
  const db = getDb();
  const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
  if (userIndex > -1) {
    // Keep original password if not provided
    const originalPassword = db.users[userIndex].password;
    db.users[userIndex] = { ...db.users[userIndex], ...updatedUser, password: updatedUser.password || originalPassword };
    saveDb(db);
    const { password, ...userWithoutPassword } = db.users[userIndex];
    return userWithoutPassword;
  }
  throw new Error('User not found.');
};

export const apiDeleteUser = async (userId: string): Promise<string> => {
  await delay(500);
  const db = getDb();
  const initialLength = db.users.length;
  db.users = db.users.filter(u => u.id !== userId);
  if (db.users.length < initialLength) {
    // Also remove associated data
    db.enrollments = db.enrollments.filter(e => e.studentId !== userId);
    db.reviews = db.reviews.filter(r => r.studentId !== userId);
    db.courses = db.courses.filter(c => c.teacherId !== userId);
    saveDb(db);
    return userId;
  }
  throw new Error('User not found.');
};

// --- Course API ---
export const apiFetchCourses = async (): Promise<Course[]> => {
  await delay(500);
  return getDb().courses;
};

export const apiAddCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
  await delay(600);
  const db = getDb();
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    ...courseData,
  };
  db.courses.push(newCourse);
  saveDb(db);
  return newCourse;
};

export const apiUpdateCourse = async (updatedCourse: Course): Promise<Course> => {
  await delay(400);
  const db = getDb();
  const courseIndex = db.courses.findIndex(c => c.id === updatedCourse.id);
  if (courseIndex > -1) {
    db.courses[courseIndex] = updatedCourse;
    saveDb(db);
    return updatedCourse;
  }
  throw new Error('Course not found.');
};

// --- Enrollment API ---
export const apiFetchEnrollments = async (): Promise<Enrollment[]> => {
  await delay(450);
  return getDb().enrollments;
};

export const apiEnrollInCourse = async (courseId: string, studentId: string): Promise<Enrollment> => {
  await delay(300);
  const db = getDb();
  if (db.enrollments.some(e => e.courseId === courseId && e.studentId === studentId)) {
    throw new Error('You are already enrolled or have a pending enrollment for this course.');
  }
  const newEnrollment: Enrollment = {
    id: `enroll-${Date.now()}`,
    courseId,
    studentId,
    status: EnrollmentStatus.Pending,
  };
  db.enrollments.push(newEnrollment);
  saveDb(db);
  return newEnrollment;
};

export const apiUpdateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment> => {
  await delay(300);
  const db = getDb();
  const enrollment = db.enrollments.find(e => e.id === enrollmentId);
  if (enrollment) {
    enrollment.status = status;
    saveDb(db);
    return enrollment;
  }
  throw new Error('Enrollment not found.');
};

// --- Review API ---
export const apiFetchReviews = async (): Promise<Review[]> => {
  await delay(400);
  return getDb().reviews;
};

export const apiAddReview = async (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> => {
  await delay(500);
  const db = getDb();
  const newReview: Review = {
    id: `review-${Date.now()}`,
    status: ReviewStatus.Pending,
    createdAt: new Date().toISOString(),
    ...reviewData,
  };
  db.reviews.push(newReview);
  saveDb(db);
  return newReview;
};

export const apiUpdateReviewStatus = async (reviewId: string, status: ReviewStatus): Promise<Review> => {
  await delay(300);
  const db = getDb();
  const review = db.reviews.find(r => r.id === reviewId);
  if (review) {
    review.status = status;
    saveDb(db);
    return review;
  }
  throw new Error('Review not found.');
};

export const apiDeleteReview = async (reviewId: string): Promise<string> => {
  await delay(400);
  const db = getDb();
  db.reviews = db.reviews.filter(r => r.id !== reviewId);
  saveDb(db);
  return reviewId;
};
