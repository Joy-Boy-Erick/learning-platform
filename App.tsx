
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider, useCourseContext } from './context/CourseContext';
import AppRouter from './components/AppRouter';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import Spinner from './components/Spinner';
import LiveChatWidget from './components/LiveChatWidget';
import { Role } from './types';

const ConnectionErrorScreen = ({ error }: { error: string }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light dark:bg-gray-900 text-center p-6">
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-2xl border border-red-500/30 w-full max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="mt-4 text-2xl font-extrabold text-red-500">Connection Error</h1>
            <p className="mt-2 text-lg text-dark dark:text-light max-w-lg mx-auto">
                The application could not connect to the backend server.
            </p>
             <div className="mt-4 w-full text-left bg-red-100/50 dark:bg-red-900/20 p-3 rounded-md">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error Details:</p>
                <code className="mt-1 block text-xs text-red-600 dark:text-red-400 font-mono break-words">{error}</code>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                This error occurs during local development if:
            </p>
            <ol className="mt-2 text-left text-sm text-gray-500 dark:text-gray-400 list-decimal list-inside space-y-2 p-4 bg-gray-100 dark:bg-gray-700/80 rounded-md">
                <li>The backend server isn't running. Start it with the command: <code className="font-mono bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded">npm run server</code></li>
                <li>The frontend development server proxy is missing or misconfigured.</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Please ensure the server is running and check the <strong>Backend Proxy Configuration</strong> instructions in the project's <code>README.md</code> file.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-6 w-full sm:w-auto bg-primary text-white text-md font-semibold px-8 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg hover:shadow-xl"
            >
                Retry Connection
            </button>
        </div>
    </div>
);


const MainContent = () => {
  const { user, isAuthLoading, authError } = useAuth();
  const { courseError } = useCourseContext();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light dark:bg-gray-900">
        <Spinner className="w-12 h-12 text-primary" />
      </div>
    );
  }

  // Any error during initial data load will trigger the connection error screen
  const connectionError = authError || courseError;
  if (connectionError) {
    return <ConnectionErrorScreen error={connectionError} />;
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