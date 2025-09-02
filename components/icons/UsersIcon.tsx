import React from 'react';

const UsersIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.253 9.597 9.597 0 0 0-2.007-5.633L18.75 12.25l-2.625-2.625a9.337 9.337 0 0 0-4.121-2.253 9.597 9.597 0 0 0-2.007 5.633L9.25 12.25l2.625 2.625a9.337 9.337 0 0 0 4.121 2.253Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.75-6.102 9.004 9.004 0 0 0-8.75-6.102A9.004 9.004 0 0 0 3.25 14.898 9.004 9.004 0 0 0 12 21Z" />
  </svg>
);

export default UsersIcon;
