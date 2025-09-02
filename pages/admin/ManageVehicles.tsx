import React, { useState } from 'react';
import { Vehicle, VehicleLicense, Violation, User, ToastMessage } from '../../types';
import FleetManagement from './vehicles/FleetManagement';
import LicensingManagement from './vehicles/LicensingManagement';
import DriverTracking from './vehicles/DriverTracking';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import ClipboardListIcon from '../../components/icons/ClipboardListIcon';
import UsersIcon from '../../components/icons/UsersIcon';

type VehicleSubTab = 'fleet' | 'licensing' | 'drivers';

interface ManageVehiclesProps {
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
    vehicleLicenses: VehicleLicense[];
    setVehicleLicenses: React.Dispatch<React.SetStateAction<VehicleLicense[]>>;
    violations: Violation[];
    setViolations: React.Dispatch<React.SetStateAction<Violation[]>>;
    users: User[];
    loggedInUser: User;
    addToast: (message: string, type: ToastMessage['type']) => void;
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const ManageVehicles: React.FC<ManageVehiclesProps> = (props) => {
    const [activeSubTab, setActiveSubTab] = useState<VehicleSubTab>('fleet');

    const subNavItems = [
        { id: 'fleet', label: 'Fleet Management', icon: <BriefcaseIcon className="w-5 h-5"/> },
        { id: 'licensing', label: 'Licensing', icon: <ClipboardListIcon className="w-5 h-5"/> },
        { id: 'drivers', label: 'Drivers & Tracking', icon: <UsersIcon className="w-5 h-5"/> },
    ];

    const renderContent = () => {
        switch (activeSubTab) {
            case 'fleet':
                return <FleetManagement {...props} />;
            case 'licensing':
                return <LicensingManagement {...props} />;
            case 'drivers':
                return <DriverTracking {...props} />;
            default:
                return <FleetManagement {...props} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        {subNavItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSubTab(item.id as VehicleSubTab)}
                                className={`whitespace-nowrap flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                                    activeSubTab === item.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default ManageVehicles;
