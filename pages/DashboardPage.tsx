
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <p>Please log in to view your dashboard.</p>;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case Role.Admin:
        return <AdminDashboard />;
      case Role.Teacher:
        return <TeacherDashboard />;
      case Role.Student:
        return <StudentDashboard />;
      default:
        return <p>No dashboard available for your role.</p>;
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-dark dark:text-light">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Welcome back, <span className="font-semibold text-primary">{user.name}</span>!
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
