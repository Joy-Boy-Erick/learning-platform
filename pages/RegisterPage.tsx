
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import Logo from '../components/icons/Logo';
import Spinner from '../components/Spinner';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, Role.Student, password);
      setSuccess(`Successfully registered! You can now login.`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const SocialButton = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <button
      type="button"
      aria-label={`Sign up with ${text}`}
      className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700/80 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      {icon}
      {text}
    </button>
  );

  const PasswordToggle = ({ visible, onClick, label }: { visible: boolean, onClick: () => void, label: string }) => (
    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
      <button type="button" onClick={onClick} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label={label}>
        {visible ? (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.274 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 4 10 4a9.95 9.95 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.305 6.536A10.027 10.027 0 01.458 10c1.732 5.057 6.522 7 9.542 7 .848 0 1.67-.11 2.454-.303z" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80">
          <div className="text-center mb-8">
            <a href="#/" className="inline-flex items-center space-x-2"><Logo className="h-10 w-10 text-primary" /></a>
            <h2 className="mt-4 text-2xl font-bold text-dark dark:text-light">Create a new account</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account? <a href="#/login" className="font-medium text-primary hover:text-red-700">Sign in</a>
            </p>
          </div>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">{error}</p>}
          {success && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm text-center">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative"><label htmlFor="name" className="sr-only">Full name</label><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg aria-hidden="true" className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Full name" disabled={isSubmitting} autoComplete="name" /></div>
            <div className="relative"><label htmlFor="email" className="sr-only">Email address</label><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg aria-hidden="true" className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></div><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Email address" disabled={isSubmitting} autoComplete="email" /></div>
            <div className="relative"><label htmlFor="password" className="sr-only">Password</label><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg aria-hidden="true" className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div><input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Password" disabled={isSubmitting} autoComplete="new-password" /><PasswordToggle visible={showPassword} onClick={() => setShowPassword(!showPassword)} label={showPassword ? "Hide password" : "Show password"} /></div>
            <div className="relative"><label htmlFor="confirm-password" className="sr-only">Confirm Password</label><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg aria-hidden="true" className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg></div><input type={showConfirmPassword ? 'text' : 'password'} id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="block w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Confirm Password" disabled={isSubmitting} autoComplete="new-password" /><PasswordToggle visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}/></div>

            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed">
              {isSubmitting && <Spinner className="w-5 h-5 mr-2" />}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6"><div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span></div></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <SocialButton icon={<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>} text="Google" />
              <SocialButton icon={<svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>} text="Facebook" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
