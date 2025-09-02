
import React from 'react';

const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639l4.436-7.106A1.012 1.012 0 0 1 7.5 4.029h9a1.012 1.012 0 0 1 .528.327l4.436 7.106a1.012 1.012 0 0 1 0 .639l-4.436 7.106a1.012 1.012 0 0 1-.528.327h-9a1.012 1.012 0 0 1-.528-.327L2.036 12.322Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export default EyeIcon;
