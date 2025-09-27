
import React, { useState, useEffect, useMemo } from 'react';
import type { Course, Review } from '../types';
import { useCourseContext } from '../context/CourseContext';
import { Difficulty, ReviewStatus } from '../types';
import ErrorBoundary from './ErrorBoundary';

interface CourseCardProps {
  course: Course;
}

const getDifficultyClass = (difficulty: Difficulty) => {
    switch (difficulty) {
        case Difficulty.Beginner: 
            return 'bg-green-100 text-green-800 ring-green-600/20 dark:bg-green-900/50 dark:text-green-300 dark:ring-green-500/30';
        case Difficulty.Intermediate: 
            return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/50 dark:text-yellow-300 dark:ring-yellow-500/30';
        case Difficulty.Advanced: 
            return 'bg-red-100 text-red-800 ring-red-600/20 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-500/30';
        default: 
            return 'bg-gray-100 text-gray-800 ring-gray-500/20 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600';
    }
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        aria-hidden="true"
        className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);


const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { teachers, reviews } = useCourseContext();
  const teacher = teachers.find(t => t.id === course.teacherId);
  const [imageError, setImageError] = useState(false);
  const [teacherImageError, setTeacherImageError] = useState(false);

  useEffect(() => {
    setTeacherImageError(false);
  }, [teacher?.profilePicture]);

  const courseReviews = useMemo(() => reviews.filter(r => r.courseId === course.id && r.status === ReviewStatus.Approved), [reviews, course.id]);

  const avgRating = useMemo(() => {
    if (courseReviews.length === 0) return 0;
    const total = courseReviews.reduce((acc, review) => acc + review.rating, 0);
    return total / courseReviews.length;
  }, [courseReviews]);

  const teacherInitials = teacher?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  const placeholderImage = (
    <div role="img" aria-label="Course thumbnail placeholder" className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <ErrorBoundary>
      <a href={`#/courses/${course.id}`} className="block bg-white dark:bg-gray-800/50 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden group flex flex-col border border-gray-200 dark:border-gray-700/80 transition-all duration-300 hover:shadow-2xl hover:border-primary/50 dark:hover:border-primary hover:scale-[1.02] relative">
        <div className="relative">
          {imageError || !course.thumbnail ? (
            placeholderImage
          ) : (
            <img
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              src={course.thumbnail}
              alt={course.title}
              onError={handleImageError}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-4 right-4 z-10">
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide ring-1 ring-inset ${getDifficultyClass(course.difficulty)}`}>
                  {course.difficulty}
              </span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <span className="text-primary text-sm font-bold tracking-wide uppercase">
              {course.category}
          </span>
          <h3 className="mt-2 text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors duration-300 line-clamp-2">{course.title}</h3>
          <div className="flex items-center mt-2">
              <StarRating rating={avgRating} />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({courseReviews.length} reviews)</span>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3">{course.description}</p>
          <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
            <div className="flex items-center">
              {teacherImageError || !teacher?.profilePicture ? (
                  <div role="img" aria-label={`Instructor ${teacher?.name}`} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-500 dark:text-gray-400 mr-3 border-2 border-gray-300 dark:border-gray-600">
                      {teacherInitials}
                  </div>
              ) : (
                  <img className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-300 dark:border-gray-600" src={teacher.profilePicture} alt={`Instructor ${teacher.name}`} onError={() => setTeacherImageError(true)} />
              )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{teacher?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                </div>
            </div>
            <div className="text-right">
                <span className="font-bold text-lg text-primary">View</span>
            </div>
          </div>
        </div>
      </a>
    </ErrorBoundary>
  );
};

export default CourseCard;
