
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourseContext } from '../../context/CourseContext';
import { EnrollmentStatus } from '../../types';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { enrollments, courses } = useCourseContext();

  if (!user) return null;

  const myEnrollments = enrollments.filter(e => e.studentId === user.id);

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.Approved:
        return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Approved</span>;
      case EnrollmentStatus.Pending:
        return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pending</span>;
      case EnrollmentStatus.Rejected:
        return <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Rejected</span>;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/80">
      <h2 className="text-xl font-semibold mb-4 text-dark dark:text-light">My Courses & Enrollments</h2>
       <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course Title</th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {myEnrollments.length > 0 ? myEnrollments.map(enrollment => {
              const course = courses.find(c => c.id === enrollment.courseId);
              if (!course) return null;
              return (
                <tr key={enrollment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6 whitespace-nowrap font-medium text-dark dark:text-light">{course.title}</td>
                  <td className="py-4 px-6 whitespace-nowrap">{getStatusBadge(enrollment.status)}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <a href={`#/courses/${course.id}`} className="font-semibold text-primary hover:text-red-700 transition-colors">
                      {enrollment.status === EnrollmentStatus.Approved ? 'Go to Course' : 'View Details'}
                    </a>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500 dark:text-gray-400">
                  You are not enrolled in any courses yet. <a href="#/courses" className="text-primary font-semibold">Browse courses</a>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
       </div>
    </div>
  );
};

export default StudentDashboard;