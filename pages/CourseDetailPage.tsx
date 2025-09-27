

import React, { useState, useMemo } from 'react';
import { useCourseContext } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { EnrollmentStatus, Role, ReviewStatus } from '../types';
import Spinner from '../components/Spinner';

interface CourseDetailPageProps {
  courseId: string;
}

const StarRatingDisplay = ({ rating, size = 'h-5 w-5' }: { rating: number, size?: string }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
        <svg
            key={i}
            className={`${size} ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
        >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        ))}
    </div>
);


const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId }) => {
  const { courses, teachers, enrollInCourse, enrollments, reviews, students, addReview } = useCourseContext();
  const { user } = useAuth();
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  const course = courses.find(c => c.id === courseId);
  
  const courseReviews = useMemo(() => reviews.filter(r => r.courseId === courseId && r.status === ReviewStatus.Approved), [reviews, courseId]);
  
  const avgRating = useMemo(() => {
    if (courseReviews.length === 0) return 0;
    const total = courseReviews.reduce((acc, review) => acc + review.rating, 0);
    return total / courseReviews.length;
  }, [courseReviews]);

  if (!course) {
    return <div className="text-center text-2xl font-bold">Course not found.</div>;
  }

  const teacher = teachers.find(t => t.id === course.teacherId);

  const userEnrollment = user ? enrollments.find(e => e.studentId === user.id && e.courseId === course.id) : undefined;
  const isEnrolledAndApproved = userEnrollment?.status === EnrollmentStatus.Approved;
  const userHasReviewed = user ? reviews.some(r => r.studentId === user.id && r.courseId === courseId) : false;


  const handleEnroll = async () => {
    if (user && user.role === Role.Student) {
      setIsEnrolling(true);
      try {
        await enrollInCourse(course.id, user.id);
      } catch (err: any) {
        alert(err.message || "Failed to enroll in course.");
      } finally {
        setIsEnrolling(false);
      }
    } else if (!user) {
        window.location.hash = '#/login';
    } else {
        alert('Only students can enroll in courses.');
    }
  };
  
  const toggleModule = (moduleId: string) => {
    setOpenModule(openModule === moduleId ? null : moduleId);
  };
  
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
        setReviewError('Please write a comment.');
        return;
    }
    if (!user) return;

    setIsSubmittingReview(true);
    setReviewError('');
    try {
        await addReview({
            courseId: course.id,
            studentId: user.id,
            rating,
            comment,
        });
        setRating(0);
        setComment('');
    } catch (error) {
        setReviewError('Failed to submit review. Please try again.');
    } finally {
        setIsSubmittingReview(false);
    }
  };


  const getEnrollmentButton = () => {
    if (isEnrolling) {
      return (
        <button className="w-full flex items-center justify-center bg-primary text-white py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
          <Spinner className="w-5 h-5 mr-2" />
          Enrolling...
        </button>
      );
    }

    if (!user || user.role !== Role.Student) {
      return (
        <button onClick={handleEnroll} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
          Login as Student to Enroll
        </button>
      );
    }
    if (userEnrollment) {
      const statusText: Record<EnrollmentStatus, string> = {
        [EnrollmentStatus.Pending]: "Enrollment Pending",
        [EnrollmentStatus.Approved]: "Enrolled",
        [EnrollmentStatus.Rejected]: "Enrollment Rejected",
      };
      const statusClass: Record<EnrollmentStatus, string> = {
        [EnrollmentStatus.Pending]: "bg-yellow-500",
        [EnrollmentStatus.Approved]: "bg-green-600",
        [EnrollmentStatus.Rejected]: "bg-red-500",
      }
      return <button className={`w-full ${statusClass[userEnrollment.status]} text-white py-3 rounded-lg font-semibold cursor-not-allowed`} disabled>{statusText[userEnrollment.status]}</button>;
    }
    return <button onClick={handleEnroll} className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">Enroll Now</button>;
  };
  
  const ReviewForm = () => (
    <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
        <h3 className="text-xl font-bold text-dark dark:text-light mb-4">Leave a Review</h3>
        {userHasReviewed ? (
            <div className="text-center bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 p-4 rounded-md">
                <p className="font-semibold">Thank you for your feedback!</p>
                <p className="text-sm">Your review is being processed by our team.</p>
            </div>
        ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="text-2xl focus:outline-none"
                                aria-label={`Rate ${star} star`}
                            >
                                <svg className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Comment</label>
                    <textarea 
                        id="comment" 
                        rows={4} 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                <button type="submit" disabled={isSubmittingReview} className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400">
                    {isSubmittingReview && <Spinner className="w-5 h-5 mr-2" />}
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 sm:p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/80">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          <span className="inline-block bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full uppercase font-bold tracking-wide ring-1 ring-inset ring-secondary/20 dark:bg-secondary/20 dark:text-secondary/90 dark:ring-secondary/30">{course.category}</span>
          <h1 className="mt-4 text-4xl lg:text-5xl font-extrabold text-dark dark:text-light tracking-tight">{course.title}</h1>
          <div className="mt-4 flex items-center space-x-2">
            <StarRatingDisplay rating={avgRating} />
            <span className="text-gray-600 dark:text-gray-400">{avgRating.toFixed(1)} average rating from {courseReviews.length} review(s)</span>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{course.description}</p>
          
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-dark dark:text-light mb-4 border-b-2 border-primary pb-2">Course Modules</h2>
            <div className="space-y-3">
              {isEnrolledAndApproved ? (
                course.modules.length > 0 ? course.modules.map((module, index) => (
                  <div key={module.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                    <button 
                      onClick={() => toggleModule(module.id)} 
                      className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                      id={`module-button-${module.id}`}
                      aria-expanded={openModule === module.id}
                      aria-controls={`module-content-${module.id}`}
                      >
                      <h3 className="font-semibold text-dark dark:text-light">{index + 1}. {module.title}</h3>
                      <svg className={`w-6 h-6 transform transition-transform text-gray-500 dark:text-gray-400 ${openModule === module.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {openModule === module.id && (
                        <div 
                          id={`module-content-${module.id}`}
                          role="region"
                          aria-labelledby={`module-button-${module.id}`}
                          className="p-5 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                         <p className="text-gray-700 dark:text-gray-300 mt-1 prose dark:prose-invert max-w-none">{module.content}</p>
                        </div>
                    )}
                  </div>
                )) : <p className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">Course content is being prepared and will be available soon.</p>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <p className="mt-4 text-gray-700 dark:text-gray-200 font-semibold text-lg">Enroll to Unlock Course Content</p>
                  <p className="text-gray-500 dark:text-gray-400">Once your enrollment is approved, you'll get full access to all modules.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-28">
             <div className="rounded-xl shadow-xl overflow-hidden mb-6 border dark:border-gray-700">
                <img src={course.thumbnail} alt={course.title} className="w-full h-auto object-cover" />
             </div>
             <div className="bg-light dark:bg-gray-800 p-6 rounded-xl border border-gray-200/80 dark:border-gray-700/80 shadow-lg">
                {getEnrollmentButton()}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center">
                    <img src={teacher?.profilePicture} alt={teacher?.name} className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-primary/50" />
                    <div>
                        <p className="font-bold text-lg text-dark dark:text-light">{teacher?.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">Instructor</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-dark dark:text-light mb-6">Student Reviews</h2>
        {isEnrolledAndApproved && <ReviewForm />}
        <div className="mt-8 space-y-6">
            {courseReviews.length > 0 ? courseReviews.map(review => {
                const student = students.find(s => s.id === review.studentId);
                return (
                    <div key={review.id} className="flex space-x-4">
                        <img src={student?.profilePicture} alt={student?.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-dark dark:text-light">{student?.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                                <StarRatingDisplay rating={review.rating} />
                            </div>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>
                        </div>
                    </div>
                )
            }) : <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to leave one!</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;