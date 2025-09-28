// Fix: Combined imports to adhere to @google/genai guidelines.
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { User, Course, Enrollment, Role, UserStatus, EnrollmentStatus, Review, ReviewStatus } from '../types';


let ai: GoogleGenAI | null = null;
const API_BASE_URL = '/api';

// --- Helper Functions for API calls ---
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
            // Attempt to parse a JSON error body from our backend
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // If the body is not JSON, use the status text.
            // This is common for proxy/dev server errors returning HTML pages.
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }
    // Handle responses that might not have a body (e.g., DELETE 204 or 200)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }
    return response.json();
}

// Helper for handling network errors (e.g., server is down)
const handleFetchError = (error: unknown) => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Could not connect to the server. Please ensure the backend server is running and accessible.');
    }
    throw error; // Re-throw other types of errors
};

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

// --- Auth API ---

export const apiLogin = async (email: string, password: string): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiLogout = async (): Promise<void> => {
    try {
        await fetch(`${API_BASE_URL}/logout`, { method: 'POST' });
    } catch (error) {
        handleFetchError(error);
    }
};

export const apiGetSession = (): Promise<User | null> => {
    const userJson = localStorage.getItem('db_session_user');
    if (!userJson || userJson === 'undefined') {
        return Promise.resolve(null);
    }
    try {
        const user = JSON.parse(userJson);
        return Promise.resolve(user);
    } catch (e) {
        console.error(`Failed to parse session from localStorage:`, e);
        localStorage.removeItem('db_session_user');
        return Promise.resolve(null);
    }
};

export const apiRegister = async (name: string, email: string, role: Role, password: string): Promise<User> => {
  try {
      const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role, password })
      });
      return handleResponse(response);
  } catch (error) {
      handleFetchError(error);
      throw error;
  }
};

// --- User API ---
export const apiFetchUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users`);
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiUpdateUser = async (updatedUser: User): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${updatedUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUser)
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiDeleteUser = async (userId: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
        const data = await handleResponse(response);
        return data?.id || userId;
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};


// --- Course API ---
export const apiFetchCourses = async (): Promise<Course[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiAddCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiUpdateCourse = async (updatedCourse: Course): Promise<Course> => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${updatedCourse.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCourse)
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

// --- Enrollment API ---
export const apiFetchEnrollments = async (): Promise<Enrollment[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`);
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiEnrollInCourse = async (courseId: string, studentId: string): Promise<Enrollment> => {
    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId, studentId })
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiUpdateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment> => {
    try {
        const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

// --- Review API ---
export const apiFetchReviews = async (): Promise<Review[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews`);
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiAddReview = async (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiUpdateReviewStatus = async (reviewId: string, status: ReviewStatus): Promise<Review> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};

export const apiDeleteReview = async (reviewId: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, { method: 'DELETE' });
        const data = await handleResponse(response);
        return data?.id || reviewId;
    } catch (error) {
        handleFetchError(error);
        throw error;
    }
};