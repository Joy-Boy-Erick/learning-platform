
import React, { useState, useEffect } from 'react';
import HomePage from '../pages/HomePage';
import CoursesPage from '../pages/CoursesPage';
import CourseDetailPage from '../pages/CourseDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../context/AuthContext';

const AppRouter: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const { user } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const routeParts = route.replace(/^#\//, '').split('/');
  const page = routeParts[0] || '';
  const param = routeParts[1];

  switch (page) {
    case 'courses':
      return param ? <CourseDetailPage courseId={param} /> : <CoursesPage />;
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'dashboard':
      return user ? <DashboardPage /> : <LoginPage />;
    case 'profile':
      return user ? <ProfilePage /> : <LoginPage />;
    default:
      return <HomePage />;
  }
};

export default AppRouter;
