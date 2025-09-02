


import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import BellIcon from './icons/BellIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import UserPlusIcon from './icons/UserPlusIcon';

interface NotificationModalProps {
  notification: AppNotification;
  onDismiss: () => void;
  onNavigate: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onDismiss, onNavigate }) => {
  const { type } = notification;

  const config = {
    task: {
      icon: <BriefcaseIcon className="w-10 h-10 text-red-500" />,
      iconBg: 'bg-red-100',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      buttonText: 'Go to Task',
      borderClass: 'border-t-4 border-red-500'
    },
    ticket: {
      icon: <BellIcon className="w-10 h-10 text-blue-500" />,
      iconBg: 'bg-blue-100',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      buttonText: 'Go to Tickets',
      borderClass: 'border-t-4 border-blue-500'
    },
    employee_approval: {
      icon: <UserPlusIcon className="w-10 h-10 text-green-500" />,
      iconBg: 'bg-green-100',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      buttonText: 'Go to Team',
      borderClass: 'border-t-4 border-green-500'
    }
  };

  const { 
    icon, 
    iconBg, 
    buttonClass, 
    buttonText, 
    borderClass 
  } = config[type];


  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
        document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fade-in"
        onClick={onDismiss}
        role="dialog"
        aria-labelledby="notification-title"
        aria-modal="true"
      >
        <div
          className={`bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all animate-scale-in ${borderClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full ${iconBg} mb-4`}>
              {icon}
            </div>
            <h3 id="notification-title" className="text-2xl font-bold text-slate-900">
              {notification.title}
            </h3>
            <div className="mt-2">
              <p className="text-md text-slate-600">
                {notification.message}
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-1 sm:text-sm"
                  onClick={onDismiss}
              >
                  Dismiss
              </button>
              <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${buttonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm`}
                  onClick={onNavigate}
              >
                  {buttonText}
              </button>
          </div>
        </div>
      </div>
  );
};

export default NotificationModal;