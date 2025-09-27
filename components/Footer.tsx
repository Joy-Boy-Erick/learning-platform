
import React from 'react';
import Logo from './icons/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100/80 dark:bg-gray-800/50 text-dark dark:text-light mt-auto border-t border-gray-200 dark:border-gray-700/80">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center mb-4">
                <Logo className="h-10 w-10 text-primary" />
                <p className="ml-3 text-xl font-bold">Yay Mon Digital</p>
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Empowering Minds, One Course at a Time. Join our community and start your learning journey today.</p>
          </div>
           <div>
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-gray-800 dark:text-gray-200">Quick Links</h3>
            <nav className="flex flex-col space-y-2 text-gray-600 dark:text-gray-300">
              <a href="#/" className="hover:text-primary transition-colors">Home</a>
              <a href="#/courses" className="hover:text-primary transition-colors">Courses</a>
              <a href="#/login" className="hover:text-primary transition-colors">Login</a>
              <a href="#/register" className="hover:text-primary transition-colors">Register</a>
            </nav>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider text-gray-800 dark:text-gray-200">Contact</h3>
            <p className="text-gray-600 dark:text-gray-300">123 Learning Lane, Knowledge City</p>
            <p className="text-gray-600 dark:text-gray-300">contact@yaymon.com</p>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Yay Mon Digital Learning. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
