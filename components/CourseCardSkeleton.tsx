import React from 'react';

const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden border border-gray-200 dark:border-gray-700/80 animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="mt-4 h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="mt-3 space-y-2 flex-grow">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          <div className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
