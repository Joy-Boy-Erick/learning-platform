

import React from 'react';
import { useCourseContext } from '../context/CourseContext';
import CourseCard from '../components/CourseCard';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg dark:shadow-black/20 flex items-center space-x-4 transform hover:-translate-y-2 transition-transform duration-300 border border-gray-200/80 dark:border-gray-700/80 hover:border-primary/50">
        <div className="bg-primary/10 text-primary p-4 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-4xl font-extrabold text-dark dark:text-light">{value}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
        </div>
    </div>
);

const HomePage: React.FC = () => {
  const { courses, teachers, students, isLoading } = useCourseContext();
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Hero Section */}
      <section className="text-center">
        <div className="bg-white dark:bg-gray-800/30 p-8 md:p-12 rounded-2xl shadow-xl dark:shadow-black/20 border border-gray-200 dark:border-gray-700">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-dark dark:text-light tracking-tight leading-tight">
                Welcome to <span className="text-primary">Yay Mon</span> Digital Learning
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Your gateway to knowledge and skill development. Explore courses taught by industry experts and unlock your potential today.</p>
            <div className="mt-8">
            <a href="#/courses" className="bg-primary text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg hover:shadow-2xl">
                Explore All Courses
            </a>
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>}
            value={courses.length}
            label="Courses Available"
        />
        <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            value={teachers.length}
            label="Expert Instructors"
        />
        <StatCard 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20M1 12l11 6 11-6M1 12v6a1 1 0 001 1h20a1 1 0 001-1v-6" /></svg>}
            value={students.length}
            label="Happy Students"
        />
      </section>

      {/* Featured Courses */}
      <section>
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark dark:text-light">Featured Courses</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Handpicked courses to get you started on your learning path.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : (
            featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-br from-dark to-gray-700 text-white p-12 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center transform hover:scale-[1.01] transition-transform duration-300 max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold">Ready to Start Your Learning Journey?</h3>
        <p className="mt-4 max-w-xl">Enroll in a course today and start your journey towards a new skill. Our platform is designed to help you succeed.</p>
        <a href="#/register" className="mt-8 inline-block bg-primary text-white font-semibold px-8 py-3 rounded-full hover:bg-red-700 transition-transform transform hover:scale-105 shadow-md">
          Sign Up Now
        </a>
      </section>
    </div>
  );
};

export default HomePage;