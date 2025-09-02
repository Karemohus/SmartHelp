
import React from 'react';

const TicketIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m3 0h.75M9 12h3.75m-3.75 0h.75m-3.75 0h.75m3-3h3.75m-3.75 0h.75m-3.75 0h.75M9 6h3.75m-3.75 0h.75m-3.75 0h.75M6 6v12c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V6H6Z" />
  </svg>
);

export default TicketIcon;