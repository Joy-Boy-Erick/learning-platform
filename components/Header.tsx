
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from './icons/Logo';
import ThemeToggle from './ThemeToggle';
import Spinner from './Spinner';
import ConfirmationModal from './ConfirmationModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pfpError, setPfpError] = useState(false);
  const [mobilePfpError, setMobilePfpError] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPfpError(false);
    setMobilePfpError(false);
  }, [user?.profilePicture]);
  
  useEffect(() => {
    if (isMenuOpen) {
      // Focus first item in mobile menu
      const firstFocusable = mobileMenuRef.current?.querySelector('a, button');
      (firstFocusable as HTMLElement)?.focus();
    } else {
      // Return focus to menu button, but only if it was the last focused element (to avoid hijacking focus)
      menuButtonRef.current?.focus();
    }
  }, [isMenuOpen]);


  const userInitials = user?.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed to sync with the server:", error);
      // The user is still logged out on the client, so we can proceed.
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      // Redirect after state has been updated to close the modal.
      window.location.hash = '#/';
    }
  };


  const UserAvatar = ({ isMobile = false }) => {
    const hasError = isMobile ? mobilePfpError : pfpError;
    const setError = isMobile ? setMobilePfpError : setPfpError;
  
    if (hasError || !user?.profilePicture) {
      return (
        <div role="img" aria-label={`${user?.name}'s profile picture`} className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary transition-all duration-300">
          {userInitials}
        </div>
      );
    }
    
    return (
      <img
        src={user.profilePicture}
        alt={`${user.name}'s profile picture`}
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary transition-all duration-300"
        onError={() => setError(true)}
      />
    );
  };
  

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm dark:shadow-black/20 text-dark dark:text-light transition-colors duration-300 border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <a href="#/" className="flex items-center space-x-3 text-xl font-bold transition-transform hover:scale-105">
              <Logo className="h-9 w-9 text-primary" />
              <span className="hidden sm:inline font-bold text-lg">Yay Mon Digital</span>
            </a>
            
            <nav className="hidden md:flex items-center space-x-8 font-semibold text-gray-600 dark:text-gray-300">
              <a href="#/" className="hover:text-primary transition-colors duration-300">Home</a>
              <a href="#/courses" className="hover:text-primary transition-colors duration-300">Courses</a>
              {user && <a href="#/dashboard" className="hover:text-primary transition-colors duration-300">Dashboard</a>}
            </nav>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    <a href="#/profile" className="flex items-center space-x-3 group">
                      <UserAvatar />
                      <span className="hidden lg:inline font-bold group-hover:text-primary transition-colors">{user.name}</span>
                    </a>
                    <button onClick={handleLogoutClick} className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20 transition-all duration-300 transform hover:scale-105">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a href="#/login" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-300">Login</a>
                    <a href="#/register" className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                      Register
                    </a>
                  </>
                )}
              </div>
              <div className="md:hidden">
                <button 
                  ref={menuButtonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  aria-label="Toggle mobile menu"
                  >
                  <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
              </div>
            </div>
          </div>
          
          {isMenuOpen && (
            <div ref={mobileMenuRef} id="mobile-menu" className="md:hidden pb-4 px-2 space-y-3">
              <a href="#/" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#/courses" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Courses</a>
              {user && <a href="#/dashboard" className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold" onClick={() => setIsMenuOpen(false)}>Dashboard</a>}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                {user ? (
                    <>
                      <a href="#/profile" className="flex items-center space-x-3 group p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>
                        <UserAvatar isMobile={true} />
                        <span className="font-bold group-hover:text-primary">{user.name}</span>
                      </a>
                      <button onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }} className="w-full text-left bg-primary/10 text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary/20">
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <a href="#/login" className="flex-1 text-center font-semibold py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setIsMenuOpen(false)}>Login</a>
                      <a href="#/register" className="flex-1 block bg-primary text-white text-center px-5 py-2 rounded-lg font-semibold hover:bg-red-700" onClick={() => setIsMenuOpen(false)}>
                        Register
                      </a>
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        isConfirming={isLoggingOut}
        confirmText="Logout"
        confirmingText="Logging out..."
        variant="danger"
      />
    </>
  );
};

export default Header;
