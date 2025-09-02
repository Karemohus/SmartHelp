
import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onClose }) => {
  // Prevent background scroll
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fade-in" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full transform transition-all animate-scale-in" 
        onClick={e => e.stopPropagation()}
        dir="ltr"
      >
        <h3 id="confirmation-title" className="text-xl font-bold text-slate-800 text-center">{title}</h3>
        <p className="text-slate-600 my-4 text-center">{message}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-800 rounded-md font-medium hover:bg-slate-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
