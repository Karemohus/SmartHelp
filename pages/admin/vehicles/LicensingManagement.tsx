

import React, { useMemo, useState } from 'react';
import { Vehicle, VehicleLicense, User, ToastMessage } from '../../../types';
import LicenseEditModal from './LicenseEditModal';

interface LicensingManagementProps {
    vehicles: Vehicle[];
    vehicleLicenses: VehicleLicense[];
    setVehicleLicenses: React.Dispatch<React.SetStateAction<VehicleLicense[]>>;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const LicensingManagement: React.FC<LicensingManagementProps> = ({ vehicles, vehicleLicenses, setVehicleLicenses, addToast }) => {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState<VehicleLicense | null>(null);

    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const enrichedLicenses = useMemo(() => {
        return vehicleLicenses.map(license => {
            const vehicle = vehicleMap.get(license.vehicleId);
            
            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);

            const expiry = new Date(license.expiryDate);
            const insuranceExpiry = license.insuranceExpiryDate ? new Date(license.insuranceExpiryDate) : null;
            
            let status: 'active' | 'expiring_soon' | 'expired' = 'active';

            if (expiry < now || (insuranceExpiry && insuranceExpiry < now)) {
                status = 'expired';
            } else if (expiry < thirtyDaysFromNow || (insuranceExpiry && insuranceExpiry < thirtyDaysFromNow)) {
                status = 'expiring_soon';
            }

            return {
                ...license,
                vehicleInfo: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})` : 'Unknown Vehicle',
                vehicleStatus: vehicle?.status,
                computedStatus: status
            };
        }).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [vehicleLicenses, vehicleMap]);

    const handleEditClick = (license: VehicleLicense) => {
        setSelectedLicense(license);
        setIsEditModalOpen(true);
    };

    const handleSaveLicense = (updatedLicense: VehicleLicense) => {
        setVehicleLicenses(prev => prev.map(l => l.id === updatedLicense.id ? updatedLicense : l));
        addToast('License details updated successfully!', 'success');
        setIsEditModalOpen(false);
        setSelectedLicense(null);
    };
    
    const getStatusBadgeColor = (status: 'active' | 'expiring_soon' | 'expired') => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expiring_soon': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-red-100 text-red-800';
        }
    };

    const getVehicleStatusBadgeColor = (status: Vehicle['status'] | undefined) => {
        if (!status) return 'bg-slate-100 text-slate-800';
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'in_maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'out_of_service': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            {isEditModalOpen && selectedLicense && (
                <LicenseEditModal
                    licenseToEdit={selectedLicense}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveLicense}
                />
            )}
            <h3 className="text-xl font-bold text-slate-800 mb-4">Vehicle Licensing & Insurance</h3>
            <p className="text-sm text-slate-500 mb-6">Track renewal dates for all vehicle licenses and insurance policies. Items expiring within 30 days are flagged.</p>
            <div className="overflow-x-auto">
                <table className="min-w-full responsive-table">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">License Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">License Expiry</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Insurance Expiry</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white md:divide-y md:divide-slate-200">
                        {enrichedLicenses.length > 0 ? enrichedLicenses.map(item => (
                            <tr key={item.id}>
                                <td data-label="License Status" className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadgeColor(item.computedStatus)}`}>
                                        {item.computedStatus.replace('_', ' ')}
                                    </span>
                                </td>
                                <td data-label="Vehicle" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.vehicleInfo}</td>
                                <td data-label="Vehicle Status" className="px-6 py-4 whitespace-nowrap text-sm">
                                    {item.vehicleStatus ? (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getVehicleStatusBadgeColor(item.vehicleStatus)}`}>
                                            {item.vehicleStatus.replace('_', ' ')}
                                        </span>
                                    ) : (
                                        <span className="italic text-slate-400">N/A</span>
                                    )}
                                </td>
                                <td data-label="License Expiry" className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(item.expiryDate).toLocaleDateString()}</td>
                                <td data-label="Insurance Expiry" className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.insuranceExpiryDate ? new Date(item.insuranceExpiryDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEditClick(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-500 italic">No license information has been added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LicensingManagement;