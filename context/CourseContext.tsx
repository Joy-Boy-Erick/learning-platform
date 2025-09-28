import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Course, Enrollment, EnrollmentStatus, User, Role, Review, ReviewStatus } from '../types';
import { useAuth } from './AuthContext';
import { 
    apiFetchCourses, 
    apiFetchEnrollments, 
    apiAddCourse, 
    apiUpdateCourse,
    apiEnrollInCourse, 
    apiUpdateEnrollmentStatus,
    apiFetchReviews,
    apiAddReview,
    apiUpdateReviewStatus,
    apiDeleteReview
} from '../services/geminiService';

interface CourseContextType {
  courses: Course[];
  enrollments: Enrollment[];
  reviews: Review[];
  teachers: User[];
  students: User[];
  isLoading: boolean;
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course>;
  updateCourse: (course: Course) => Promise<void>;
  enrollInCourse: (courseId: string, studentId: string) => Promise<Enrollment>;
  updateEnrollmentStatus: (enrollmentId: string, status: EnrollmentStatus) => Promise<void>;
  addReview: (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>) => Promise<Review>;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { users, isAuthLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        const [fetchedCourses, fetchedEnrollments, fetchedReviews] = await Promise.all([
            apiFetchCourses(),
            apiFetchEnrollments(),
            apiFetchReviews()
        ]);
        setCourses(fetchedCourses);
        setEnrollments(fetchedEnrollments);
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Failed to fetch course data", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch course data after user authentication status and user data are resolved.
    if (!isAuthLoading) {
        fetchCourseData();
    }
  }, [isAuthLoading]);

  const teachers = users.filter(u => u.role === Role.Teacher);
  const students = users.filter(u => u.role === Role.Student);

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    const newCourse = await apiAddCourse(courseData);
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };
  
  const updateCourse = async (courseData: Course) => {
    const updatedCourse = await apiUpdateCourse(courseData);
    setCourses(prev =>
      prev.map(c => (c.id === updatedCourse.id ? updatedCourse : c))
    );
  };

  const enrollInCourse = async (courseId: string, studentId: string) => {
    const newEnrollment = await apiEnrollInCourse(courseId, studentId);
    setEnrollments(prev => [...prev, newEnrollment]);
    return newEnrollment;
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: EnrollmentStatus) => {
    const updatedEnrollment = await apiUpdateEnrollmentStatus(enrollmentId, status);
    setEnrollments(prev =>
      prev.map(e => (e.id === enrollmentId ? updatedEnrollment : e))
    );
  };

  const addReview = async (reviewData: Omit<Review, 'id' | 'status' | 'createdAt'>) => {
    const newReview = await apiAddReview(reviewData);
    setReviews(prev => [...prev, newReview]);
    return newReview;
  };

  const updateReviewStatus = async (reviewId: string, status: ReviewStatus) => {
    const updatedReview = await apiUpdateReviewStatus(reviewId, status);
    setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
  };

  const deleteReview = async (reviewId: string) => {
    await apiDeleteReview(reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const combinedIsLoading = isLoading || isAuthLoading;

  return (
    <CourseContext.Provider value={{ 
      courses, 
      enrollments,
      reviews, 
      teachers, 
      students, 
      isLoading: combinedIsLoading, 
      addCourse, 
      updateCourse,
      enrollInCourse, 
      updateEnrollmentStatus,
      addReview,
      updateReviewStatus,
      deleteReview
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};