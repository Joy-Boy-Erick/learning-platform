
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import AppRouter from './components/AppRouter';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import Spinner from './components/Spinner';
import LiveChatWidget from './components/LiveChatWidget';
import { Role } from './types';

const MainContent = () => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light dark:bg-gray-900">
        <Spinner className="w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-light dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-light via-gray-50 to-light dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 -z-10"></div>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <AppRouter />
      </main>
      {user && user.role === Role.Student && <LiveChatWidget />}
      <Footer />
    </div>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <MainContent />
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;