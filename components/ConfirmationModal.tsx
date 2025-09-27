
import React, { useEffect, useRef } from 'react';
import Spinner from './Spinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isConfirming?: boolean;
  confirmText?: string;
  confirmingText?: string;
  variant?: 'danger' | 'default';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isConfirming = false,
  confirmText = 'Confirm',
  confirmingText = 'Confirming...',
  variant = 'danger',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) onClose();
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      // Set focus to the first focusable element in the modal, typically the cancel button
      setTimeout(() => {
          const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
          firstFocusable?.focus();
      }, 100);
    } else if (triggerRef.current) {
        triggerRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!isOpen && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, isConfirming]);


  if (!isOpen) return null;

  const iconColorClasses = variant === 'danger'
    ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300'
    : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-red-300';
    
  const buttonColorClasses = variant === 'danger'
    ? 'bg-primary hover:bg-red-700 disabled:bg-red-400'
    : 'bg-primary hover:bg-red-700 disabled:bg-red-400';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={() => !isConfirming && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        style={{ animation: 'scaleIn 0.2s ease-out forwards' }}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:flex sm:items-start">
          <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconColorClasses} sm:mx-0 sm:h-10 sm:w-10`}>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h2 id="modal-title" className="text-lg leading-6 font-bold text-dark dark:text-light">{title}</h2>
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:cursor-not-allowed ${buttonColorClasses}`}
          >
            {isConfirming && <Spinner className="w-5 h-5 mr-2" />}
            {isConfirming ? confirmingText : confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
