// Fix: Combined imports to adhere to @google/genai guidelines.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MOCK_USERS, MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_REVIEWS } from '../context/mockData';
import { User, Course, Enrollment, Role, UserStatus, EnrollmentStatus, Review, ReviewStatus } from '../types';


// Fix: Removed 'as string' type assertion to align with @google/genai guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCourseContent = async (title: string): Promise<{ description: string; modules: { title: string; content: string }[] }> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert instructional designer. For an online learning platform, generate a compelling course description and a list of 3 to 5 module titles with brief, engaging content for a course titled "${title}". The description should be exciting and highlight what students will learn.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A compelling and informative description for the course.",
            },
            modules: {
              type: Type.ARRAY,
              description: "An array of course modules.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The title of the course module.",
                  },
                  content: {
                    type: Type.STRING,
                    description: "A brief summary of the module's content.",
                  },
                },
                required: ['title', 'content'],
              },
            },
          },
          required: ['description', 'modules'],
        },
      },
    });

    const jsonString = response.text;
    const parsedData = JSON.parse(jsonString);
    return parsedData;

  } catch (error) {
    console.error("Error generating course content with Gemini API:", error);
    throw new Error("Failed to generate course content. Please check your API key and try again.");
  }
};

export const apiGenerateVideo = async (prompt: string): Promise<string> => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1
      }
    });

    while (!operation.done) {
      // Wait for 10 seconds before checking the status again
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (downloadLink) {
      return downloadLink;
    } else {
      throw new Error("Video generation completed, but no download link was found.");
    }
  } catch (error) {
    console.error("Error generating video with Gemini API:", error);
    throw new Error("Failed to generate video. Please try again later.");
  }
};


// --- API Simulation Layer ---

const DB_KEYS = {
  USERS: 'db_users',
  COURSES: 'db_courses',
  ENROLLMENTS: 'db_enrollments',
  REVIEWS: 'db_reviews',
  SESSION: 'db_session_user'
};

const SIMULATED_DELAY = 500; // ms

// --- Database Initialization ---
const initDatabase = () => {
  const initKeyIfNeeded = (key: string, mockData: any) => {
    const existingData = localStorage.getItem(key);
    // If no data exists, or if it's the erroneous "undefined" string, initialize it.
    if (!existingData || existingData === 'undefined') {
        localStorage.setItem(key, JSON.stringify(mockData));
    }
  };

  initKeyIfNeeded(DB_KEYS.USERS, MOCK_USERS);
  initKeyIfNeeded(DB_KEYS.COURSES, MOCK_COURSES);
  initKeyIfNeeded(DB_KEYS.ENROLLMENTS, MOCK_ENROLLMENTS);
  initKeyIfNeeded(DB_KEYS.REVIEWS, MOCK_REVIEWS);
};


initDatabase();

// --- Helper Functions ---
const simulateRequest = <T>(data: T, error?: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        reject(new Error(error));
      } else {
        // The `JSON.stringify(undefined)` returns `undefined`, which causes `JSON.parse` to fail.
        // This handles that specific case for API calls that resolve with no data (e.g., logout).
        if (data === undefined) {
          resolve(data);
          return;
        }
        // Deep copy to simulate immutable data from an API
        resolve(JSON.parse(JSON.stringify(data))); 
      }
    }, SIMULATED_DELAY);
  });
};

const getFromDb = <T>(key: string): T[] => {
  try {
    const item = localStorage.getItem(key);
    // Guard against null, or the literal string "undefined" which causes JSON.parse to fail.
    if (item === null || item === 'undefined') {
      return [];
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to parse localStorage item with key "${key}". Returning empty array.`, e);
    return [];
  }
};

const saveToDb = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};


// --- Auth API ---

export const apiLogin = (email: string, password: string): Promise<User> => {
  const users = getFromDb<User>(DB_KEYS.USERS);
  const foundUser = users.find(u => u.email === email && u.password === password);
  
  if (foundUser && foundUser.status === UserStatus.Active) {
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(foundUser));
    return simulateRequest(foundUser);
  }
  return simulateRequest(null as any, "Invalid credentials or account disabled.");
};

export const apiLogout = (): Promise<void> => {
    localStorage.removeItem(DB_KEYS.SESSION);
    return simulateRequest(undefined);
};

export const apiGetSession = (): Promise<User | null> => {
    const userJson = localStorage.getItem(DB_KEYS.SESSION);
    if (!userJson || userJson === 'undefined') {
        return simulateRequest(null);
    }
    try {
        const user = JSON.parse(userJson);
        return simulateRequest(user);
    } catch (e) {
        console.error(`Failed to parse session from localStorage:`, e);
        // If session data is corrupted, clear it and treat as logged out.
        localStorage.removeItem(DB_KEYS.SESSION);
        return simulateRequest(null);
    }
};

export const apiRegister = (name: string, email: string, role: Role, password: string): Promise<User> => {
  let users = getFromDb<User>(DB_KEYS.USERS);
  if (users.some(u => u.email === email)) {
    return simulateRequest(null as any, "An account with this email already exists.");
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    role,
    status: UserStatus.Active,
    profilePicture: `https://picsum.photos/seed/${Date.now()}/200`,
    bio: ''
  };
  users.push(newUser);
  saveToDb(DB_KEYS.USERS, users);
  // Don't return password to client
  const { password: _password, ...userToReturn } = newUser;
  return simulateRequest(userToReturn as User);
};

// --- User API ---
export const apiFetchUsers = (): Promise<User[]> => {
    const users = getFromDb<User>(DB_KEYS.USERS);
    // Sanitize passwords before returning
    const sanitizedUsers = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return simulateRequest(sanitizedUsers as User[]);
};

export const apiUpdateUser = (updatedUser: User): Promise<User> => {
    let users = getFromDb<User>(DB_KEYS.USERS);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
        // Preserve password if it exists and other sensitive fields
        const existingPassword = users[index].password;
        const existingProfilePicture = users[index].profilePicture;

        users[index] = { 
            ...users[index], // Preserve all existing fields
            ...updatedUser, // Overwrite with updated fields
            password: existingPassword, // Ensure password is not changed here
            profilePicture: updatedUser.profilePicture || existingProfilePicture // Preserve picture if not updated
        };
        saveToDb(DB_KEYS.USERS, users);

        const { password, ...userToReturn } = users[index];

        // Update session if the current user is being updated
        const sessionUserJson = localStorage.getItem(DB_KEYS.SESSION);
        if(sessionUserJson && sessionUserJson !== 'undefined'){
            try {
                const sessionUser = JSON.parse(sessionUserJson);
                if(sessionUser.id === updatedUser.id){
                    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(userToReturn));
                }
            } catch (e) {
                console.error(`Failed to parse session during user update:`, e);
            }
        }
        return simulateRequest(userToReturn as User);
    }
    return simulateRequest(null as any, "User not found.");
};

export const apiDeleteUser = (userId: string): Promise<string> => {
    let users = getFromDb<User>(DB_KEYS.USERS);
    const newUsers = users.filter(u => u.id !== userId);
    if (users.length === newUsers.length) {
        return simulateRequest('', "User not found.");
    }
    saveToDb(DB_KEYS.USERS, newUsers);
    return simulateRequest(userId);
};


// --- Course API ---
export const apiFetchCourses = (): Promise<Course[]> => {
    const courses = getFromDb<Course>(DB_KEYS.COURSES);
    return simulateRequest(courses);
};

export const apiAddCourse = (courseData: Omit<Course, 'id'>): Promise<Course> => {
    let courses = getFromDb<Course>(DB_KEYS.COURSES);
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
    };
    courses.push(newCourse);
    saveToDb(DB_KEYS.COURSES, courses);
    return simulateRequest(newCourse);
};

// --- Enrollment API ---
export const apiFetchEnrollments = (): Promise<Enrollment[]> => {
    const enrollments = getFromDb<Enrollment>(DB_KEYS.ENROLLMENTS);
    return simulateRequest(enrollments);
};

export const apiEnrollInCourse = (courseId: string, studentId: string): Promise<Enrollment> => {
    let enrollments = getFromDb<Enrollment>(DB_KEYS.ENROLLMENTS);
    const existingEnrollment = enrollments.find(e => e.courseId === courseId && e.studentId === studentId);
    if(existingEnrollment) {
        return simulateRequest(null as any, "You have already requested to enroll in this course.");
    }
    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      courseId,
      studentId,
      status: EnrollmentStatus.Pending,
    };
    enrollments.push(newEnrollment);
    saveToDb(DB_KEYS.ENROLLMENTS, enrollments);
    return simulateRequest(newEnrollment);
};

export const apiUpdateEnrollmentStatus = (enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment> => {
    let enrollments = getFromDb<Enrollment>(DB_KEYS.ENROLLMENTS);
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if(index > -1) {
        enrollments[index].status = status;
        saveToDb(DB_KEYS.ENROLLMENTS, enrollments);
        return simulateRequest(enrollments[index]);
    }
    return simulateRequest(null as any, "Enrollment not found.");
};

// --- Review API ---
export const apiFetchReviews = (): Promise<Review[]> => {
    const reviews = getFromDb<Review>(DB_KEYS.REVIEWS);
    return simulateRequest(reviews);
};

export const apiAddReview = (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> => {
    let reviews = getFromDb<Review>(DB_KEYS.REVIEWS);
    const newReview: Review = {
        ...reviewData,
        id: `review-${Date.now()}`,
        status: ReviewStatus.Pending,
        createdAt: new Date().toISOString()
    };
    reviews.push(newReview);
    saveToDb(DB_KEYS.REVIEWS, reviews);
    return simulateRequest(newReview);
};

export const apiUpdateReviewStatus = (reviewId: string, status: ReviewStatus): Promise<Review> => {
    let reviews = getFromDb<Review>(DB_KEYS.REVIEWS);
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index > -1) {
        reviews[index].status = status;
        saveToDb(DB_KEYS.REVIEWS, reviews);
        return simulateRequest(reviews[index]);
    }
    return simulateRequest(null as any, "Review not found.");
};

export const apiDeleteReview = (reviewId: string): Promise<string> => {
    let reviews = getFromDb<Review>(DB_KEYS.REVIEWS);
    const newReviews = reviews.filter(r => r.id !== reviewId);
    if (reviews.length === newReviews.length) {
        return simulateRequest('', "Review not found.");
    }
    saveToDb(DB_KEYS.REVIEWS, newReviews);
    return simulateRequest(reviewId);
};