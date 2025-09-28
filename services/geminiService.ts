// Fix: Combined imports to adhere to @google/genai guidelines.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { User, Course, Enrollment, Role, UserStatus, EnrollmentStatus, Review, ReviewStatus } from '../types';


let ai: GoogleGenAI | null = null;

// Helper function to centralize the API key check.
export const isAiConfigured = (): boolean => {
    return !!process.env.API_KEY;
};

// Lazily initialize the AI client to prevent crashes on load if the API key is missing.
const getAiClient = (): GoogleGenAI => {
    if (ai) return ai;
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // This specific error message will be caught by the UI components.
        throw new Error("Gemini API key not found. AI features are disabled. Please contact an administrator to configure the application.");
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
};

export const generateCourseContent = async (title: string): Promise<{ description: string; modules: { title: string; content: string }[] }> => {
  try {
    const aiInstance = getAiClient();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
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
    if (error instanceof Error) { // Propagate the specific error message
        throw error;
    }
    throw new Error("Failed to generate course content. Please check your API key and try again.");
  }
};

// --- Backend API Service ---

const API_BASE_URL = '/api'; // Use relative path for proxy

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("API endpoint not found (404). This is likely a proxy configuration issue. Please restart the Vite development server to apply proxy settings and ensure it is set up correctly as described in the README.md file.");
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'An unknown server error occurred.');
  }
  // Handle cases with no content
  if (response.status === 204) {
      return null;
  }
  return response.json();
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return handleResponse(response);
  } catch (error) {
     if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the server. Please ensure the backend server is running and accessible.');
    }
    throw error;
  }
};

// --- Auth API ---

export const apiLogin = (email: string, password: string): Promise<User> => {
  return apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const apiRegister = (name: string, email: string, role: Role, password: string): Promise<User> => {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, role, password }),
  });
};

// --- User API ---
export const apiFetchUsers = (): Promise<User[]> => {
    return apiRequest('/users');
};

export const apiUpdateUser = (updatedUser: User): Promise<User> => {
    return apiRequest(`/users/${updatedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedUser),
    });
};

export const apiDeleteUser = (userId: string): Promise<{ id: string }> => {
    return apiRequest(`/users/${userId}`, {
        method: 'DELETE',
    });
};

// --- Course API ---
export const apiFetchCourses = (): Promise<Course[]> => {
    return apiRequest('/courses');
};

export const apiAddCourse = (courseData: Omit<Course, 'id'>): Promise<Course> => {
    return apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
    });
};

export const apiUpdateCourse = (updatedCourse: Course): Promise<Course> => {
    return apiRequest(`/courses/${updatedCourse.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCourse),
    });
};

// --- Enrollment API ---
export const apiFetchEnrollments = (): Promise<Enrollment[]> => {
    return apiRequest('/enrollments');
};

export const apiEnrollInCourse = (courseId: string, studentId: string): Promise<Enrollment> => {
    return apiRequest('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId, studentId }),
    });
};

export const apiUpdateEnrollmentStatus = (enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment> => {
    return apiRequest(`/enrollments/${enrollmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

// --- Review API ---
export const apiFetchReviews = (): Promise<Review[]> => {
    return apiRequest('/reviews');
};

export const apiAddReview = (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> => {
    return apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
    });
};

export const apiUpdateReviewStatus = (reviewId: string, status: ReviewStatus): Promise<Review> => {
    return apiRequest(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
    });
};

export const apiDeleteReview = (reviewId: string): Promise<{ id: string }> => {
    return apiRequest(`/reviews/${reviewId}`, {
        method: 'DELETE',
    });
};
