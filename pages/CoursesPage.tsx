

import React, { useState, useMemo } from 'react';
import { useCourseContext } from '../context/CourseContext';
import CourseCard from '../components/CourseCard';
import { Difficulty } from '../types';
import CourseCardSkeleton from '../components/CourseCardSkeleton';

// Fix: Refactored FilterSelect to use a dedicated interface for its props and defined it as a React.FC. This resolves a TypeScript error where the 'children' prop was not being correctly identified.
interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ id, label, value, onChange, children }) => (
      <div className="relative">
        <label htmlFor={id} className="sr-only">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full appearance-none bg-white dark:bg-gray-700/80 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
  );

const CoursesPage: React.FC = () => {
  const { courses, teachers, isLoading } = useCourseContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [instructor, setInstructor] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(courses.map(c => c.category))], [courses]);
  const difficulties = useMemo(() => ['All', ...Object.values(Difficulty)], []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const teacher = teachers.find(t => t.id === course.teacherId);
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (teacher && teacher.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = category === 'All' || course.category === category;
      const matchesInstructor = instructor === 'All' || course.teacherId === instructor;
      const matchesDifficulty = difficulty === 'All' || course.difficulty === difficulty;
      return matchesSearch && matchesCategory && matchesInstructor && matchesDifficulty;
    });
  }, [courses, searchTerm, category, instructor, difficulty, teachers]);

  return (
    <div className="space-y-10">
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/80">
        <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">Explore Our Courses</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Find the perfect course to advance your skills.</p>
        </div>
        <div className="space-y-4">
            <div className="relative">
                <label htmlFor="search-courses" className="sr-only">Search for courses</label>
                <input
                    type="text"
                    id="search-courses"
                    placeholder="Search courses, categories, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {/* Fix: Corrected typo in SVG path data. */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FilterSelect id="category-filter" label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </FilterSelect>
                <FilterSelect id="instructor-filter" label="Filter by instructor" value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                    <option value="All">All Instructors</option>
                    {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </FilterSelect>
                <FilterSelect id="difficulty-filter" label="Filter by difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="All">All Difficulties</option>
                    {difficulties.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                    ))}
                </FilterSelect>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => <CourseCardSkeleton key={index} />)
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 col-span-full bg-white dark:bg-gray-800/50 p-12 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-dark dark:text-light">No Courses Found</h3>
            <p className="mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;