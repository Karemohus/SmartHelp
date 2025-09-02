

import React from 'react';
import { User } from '../../../types';

// A simple map pin icon to use in the placeholder
const MapPinIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);


interface DriverMapModalProps {
    driver: User;
    onClose: () => void;
}

const DriverMapModal: React.FC<DriverMapModalProps> = ({ driver, onClose }) => {
    // The image and zoom functionality have been removed as requested,
    // and replaced with a clear placeholder to show it as an example.

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Live Tracking: {driver.username}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold leading-none">&times;</button>
                </div>
                
                {/* This is now a placeholder div instead of an img tag loading a map. */}
                <div className="bg-slate-100 rounded-lg border h-56 flex flex-col items-center justify-center text-slate-500">
                    <MapPinIcon className="w-12 h-12 text-slate-400" />
                    <p className="font-semibold mt-2">Live Map Example</p>
                    <p className="text-xs">The driver's location would be shown here.</p>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Current Speed</p>
                        <p className="text-2xl font-bold text-blue-900">{driver.currentSpeed ?? 'N/A'} <span className="text-lg">km/h</span></p>
                    </div>
                     <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Last Known Location</p>
                        <p className="text-xl font-bold text-blue-900 font-mono">
                            {driver.currentLocation ? `${driver.currentLocation.lat.toFixed(4)}, ${driver.currentLocation.lng.toFixed(4)}` : 'Not Available'}
                        </p>
                    </div>
                </div>

                 <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300">Close</button>
                 </div>
            </div>
        </div>
    );
};

export default DriverMapModal;