import { User, Course, Enrollment, Role, UserStatus, EnrollmentStatus, Review, ReviewStatus } from '../types';

// The base URL for the backend API.
// In development, this will be http://localhost:3001 or similar.
// In production, the frontend and backend are served from the same origin, so we can use a relative path.
const API_BASE_URL = '/api';

// A helper function to handle fetch requests and responses.
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// --- Gemini AI Service (via Backend) ---

export const isAiConfigured = (): boolean => {
  // This check is now less relevant on the client, as the key is on the server.
  // We can assume it's configured if the endpoint exists.
  // A more robust check might involve a dedicated '/api/status' endpoint.
  return true;
};

export const generateCourseContent = async (title: string): Promise<{ description: string; modules: { title: string; content: string }[] }> => {
  const response = await fetch(`${API_BASE_URL}/generate-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse(response);
};

// --- Auth API ---

export const apiLogin = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const apiLogout = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
};

export const apiGetSession = async (): Promise<User | null> => {
  const response = await fetch(`${API_BASE_URL}/auth/session`);
  const data = await handleResponse<{ user: User | null }>(response);
  return data.user;
};

export const apiRegister = async (name: string, email: string, role: Role, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, role, password }),
  });
  return handleResponse(response);
};

// --- User API ---
export const apiFetchUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/users`);
  return handleResponse(response);
};

export const apiUpdateUser = async (updatedUser: User): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${updatedUser.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUser),
  });
  return handleResponse(response);
};

export const apiDeleteUser = async (userId: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// --- Course API ---
export const apiFetchCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${API_BASE_URL}/courses`);
  return handleResponse(response);
};

export const apiAddCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });
  return handleResponse(response);
};

export const apiUpdateCourse = async (updatedCourse: Course): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${updatedCourse.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCourse),
  });
  return handleResponse(response);
};

// --- Enrollment API ---
export const apiFetchEnrollments = async (): Promise<Enrollment[]> => {
  const response = await fetch(`${API_BASE_URL}/enrollments`);
  return handleResponse(response);
};

export const apiEnrollInCourse = async (courseId: string, studentId: string): Promise<Enrollment> => {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, studentId }),
  });
  return handleResponse(response);
};

export const apiUpdateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus): Promise<Enrollment> => {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

// --- Review API ---
export const apiFetchReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews`);
  return handleResponse(response);
};

export const apiAddReview = async (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<Review> => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  return handleResponse(response);
};

export const apiUpdateReviewStatus = async (reviewId: string, status: ReviewStatus): Promise<Review> => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

export const apiDeleteReview = async (reviewId: string): Promise<{ id: string }> => {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};
