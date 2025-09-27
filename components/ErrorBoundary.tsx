import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Initialize state in the constructor. This is the standard and most compatible way to set initial state in a React class component, resolving TypeScript errors about missing 'state' or 'props' properties.
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="block bg-white dark:bg-gray-800/50 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden flex flex-col border border-red-400 dark:border-red-600">
            <div className="p-6 flex flex-col flex-grow items-center justify-center text-center h-full min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-dark dark:text-light">Oops!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Something went wrong while loading this course.</p>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
