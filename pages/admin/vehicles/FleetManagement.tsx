

import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Attachment, User, ToastMessage, VehicleLicense } from '../../../types';
import AttachmentInput from '../../../components/AttachmentInput';
import AttachmentPreview from '../../../components/AttachmentPreview';
import TrashIcon from '../../../components/icons/TrashIcon';

interface FleetManagementProps {
    vehicles: Vehicle[];
    setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
    setVehicleLicenses: React.Dispatch<React.SetStateAction<VehicleLicense[]>>;
    users: User[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const FleetManagement: React.FC<FleetManagementProps> = ({ vehicles, setVehicles, setVehicleLicenses, users, addToast, requestConfirm }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    const drivers = useMemo(() => users.filter(u => u.role === 'driver'), [users]);

    // Form state
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [plateNumber, setPlateNumber] = useState('');
    const [vin, setVin] = useState('');
    const [status, setStatus] = useState<'active' | 'in_maintenance' | 'out_of_service'>('active');
    const [assignedDriverId, setAssignedDriverId] = useState<string>(drivers[0]?.id || '');
    const [photos, setPhotos] = useState<Attachment[]>([]);
    const [notes, setNotes] = useState('');
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');
    // New state for license details
    const [licenseIssueDate, setLicenseIssueDate] = useState('');
    const [licenseExpiryDate, setLicenseExpiryDate] = useState('');

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);
    
    useEffect(() => {
        if (drivers.length > 0 && !assignedDriverId) {
            setAssignedDriverId(drivers[0].id);
        }
    }, [drivers, assignedDriverId]);

    const resetForm = () => {
        setMake('');
        setModel('');
        setYear(new Date().getFullYear());
        setPlateNumber('');
        setVin('');
        setStatus('active');
        setAssignedDriverId(drivers[0]?.id || '');
        setPhotos([]);
        setNotes('');
        setNextMaintenanceDate('');
        setLicenseIssueDate('');
        setLicenseExpiryDate('');
        setEditingVehicle(null);
        setIsFormVisible(false);
    };

    const handleEditClick = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setMake(vehicle.make);
        setModel(vehicle.model);
        setYear(vehicle.year);
        setPlateNumber(vehicle.plateNumber);
        setVin(vehicle.vin);
        setStatus(vehicle.status);
        setAssignedDriverId(vehicle.assignedDriverId);
        setPhotos(vehicle.photos);
        setNotes(vehicle.notes || '');
        setNextMaintenanceDate(vehicle.nextMaintenanceDate?.split('T')[0] || '');
        // Note: Editing license details is handled in the licensing tab. This form is for vehicle core details.
        setLicenseIssueDate('');
        setLicenseExpiryDate('');
        setIsFormVisible(true);
        window.scrollTo(0, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!make || !model || !plateNumber || !assignedDriverId) {
            addToast('Make, Model, Plate Number, and Assigned Driver are required.', 'error');
            return;
        }
        if ((licenseIssueDate && !licenseExpiryDate) || (!licenseIssueDate && licenseExpiryDate)) {
             addToast('Both license issue and expiry dates must be provided together.', 'error');
            return;
        }

        const now = new Date().toISOString();
        if (editingVehicle) {
            const updatedVehicle: Vehicle = {
                ...editingVehicle,
                make, model, year, plateNumber, vin, status, assignedDriverId, photos, notes,
                nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : undefined,
                updatedAt: now,
            };
            setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
            addToast('Vehicle updated successfully!', 'success');
        } else {
            const vehicleId = `veh_${Date.now()}`;
            const newVehicle: Vehicle = {
                id: vehicleId,
                make, model, year, plateNumber, vin, status, assignedDriverId, photos, notes,
                nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate).toISOString() : undefined,
                createdAt: now,
                updatedAt: now,
            };
            setVehicles(prev => [newVehicle, ...prev]);

            // If license info is provided, create a license record too
            if (licenseIssueDate && licenseExpiryDate) {
                const newLicense: VehicleLicense = {
                    id: `lic_${Date.now()}`,
                    vehicleId: vehicleId,
                    licenseNumber: 'TEMP-' + plateNumber, // Placeholder license number
                    issueDate: new Date(licenseIssueDate).toISOString(),
                    expiryDate: new Date(licenseExpiryDate).toISOString(),
                };
                setVehicleLicenses(prev => [newLicense, ...prev]);
                addToast('Vehicle and license added successfully!', 'success');
            } else {
                addToast('Vehicle added successfully!', 'success');
            }
        }
        resetForm();
    };

    const handleDelete = (id: string) => {
        requestConfirm(
            'Confirm Deletion',
            'Are you sure you want to delete this vehicle? This will also remove associated licenses and violations.',
            () => {
                setVehicles(prev => prev.filter(v => v.id !== id));
                // Note: In a real app, you'd also want to delete licenses and violations from their respective state slices.
                setVehicleLicenses(prev => prev.filter(l => l.vehicleId !== id));
                addToast('Vehicle deleted successfully.', 'success');
            },
            'Yes, Delete'
        );
    };
    
    const getStatusBadgeColor = (status: Vehicle['status']) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'in_maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'out_of_service': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Vehicle Fleet</h3>
                {!isFormVisible && (
                    <button onClick={() => { setIsFormVisible(true); setEditingVehicle(null); resetForm(); }} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        Add New Vehicle
                    </button>
                )}
            </div>
            
            {isFormVisible && (
                <div className="p-6 border-2 border-blue-300 rounded-lg bg-slate-50 animate-fade-in">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Make (e.g., Toyota)" value={make} onChange={e => setMake(e.target.value)} required className="p-2 border rounded-md" />
                            <input type="text" placeholder="Model (e.g., Camry)" value={model} onChange={e => setModel(e.target.value)} required className="p-2 border rounded-md" />
                            <input type="number" placeholder="Year" value={year} onChange={e => setYear(parseInt(e.target.value))} required className="p-2 border rounded-md" />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Plate Number" value={plateNumber} onChange={e => setPlateNumber(e.target.value)} required className="p-2 border rounded-md" />
                            <input type="text" placeholder="VIN (Vehicle Identification Number)" value={vin} onChange={e => setVin(e.target.value)} className="p-2 border rounded-md" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="p-2 border rounded-md bg-white">
                                <option value="active">Active</option>
                                <option value="in_maintenance">In Maintenance</option>
                                <option value="out_of_service">Out of Service</option>
                            </select>
                            <select value={assignedDriverId || ''} onChange={e => setAssignedDriverId(e.target.value)} required className="p-2 border rounded-md bg-white" disabled={drivers.length === 0}>
                                {drivers.length > 0 ? (
                                    drivers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)
                                ) : (
                                    <option value="" disabled>No drivers available</option>
                                )}
                            </select>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-700" htmlFor="maintenance-date">Next Maintenance Date</label>
                            <input id="maintenance-date" type="date" value={nextMaintenanceDate} onChange={e => setNextMaintenanceDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                        </div>
                        {!editingVehicle && (
                            <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
                                <h5 className="font-semibold text-blue-800 mb-2">Initial License Details (Optional)</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-sm font-medium text-slate-700" htmlFor="issue-date">Issue Date</label>
                                        <input id="issue-date" type="date" value={licenseIssueDate} onChange={e => setLicenseIssueDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                                     </div>
                                     <div>
                                        <label className="text-sm font-medium text-slate-700" htmlFor="expiry-date">Expiry Date</label>
                                        <input id="expiry-date" type="date" value={licenseExpiryDate} onChange={e => setLicenseExpiryDate(e.target.value)} className="w-full mt-1 p-2 border rounded-md" />
                                     </div>
                                </div>
                            </div>
                        )}
                        <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-md" rows={3}></textarea>
                        <AttachmentInput attachment={null} setAttachment={(att) => att && setPhotos(p => [...p, att])} id="vehicle-photos" label="Add Photos" />
                        <div className="flex flex-wrap gap-2">
                            {photos.map((photo, index) => (
                                <div key={index} className="relative">
                                    <img src={photo.dataUrl} className="w-24 h-24 object-cover rounded-md" alt="vehicle"/>
                                    <button type="button" onClick={() => setPhotos(p => p.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">{editingVehicle ? 'Save Changes' : 'Add Vehicle'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.length > 0 ? vehicles.map(vehicle => (
                    <div key={vehicle.id} className="border rounded-lg shadow-sm overflow-hidden flex flex-col">
                        <div className="h-48 bg-slate-200">
                           {vehicle.photos.length > 0 && vehicle.photos[0].dataUrl ? (
                                <img src={vehicle.photos[0].dataUrl} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-full object-cover"/>
                           ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                           )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="flex justify-between items-start">
                                <h4 className="text-lg font-bold text-slate-900">{vehicle.make} {vehicle.model}</h4>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(vehicle.status)}`}>{vehicle.status.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-slate-500">{vehicle.year} &middot; {vehicle.plateNumber}</p>
                            <p className="text-xs text-slate-400 mt-1">VIN: {vehicle.vin || 'N/A'}</p>
                            <div className="mt-4 flex-grow">
                               <p className="text-sm"><span className="font-semibold">Driver:</span> {vehicle.assignedDriverId ? userMap.get(vehicle.assignedDriverId) : <span className="italic text-slate-500">Unassigned</span>}</p>
                               <p className="text-sm mt-1"><span className="font-semibold">Maintenance Due:</span> {vehicle.nextMaintenanceDate ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString() : <span className="italic text-slate-500">Not set</span>}</p>
                               <p className="text-sm mt-2"><span className="font-semibold">Notes:</span> {vehicle.notes || <span className="italic text-slate-500">None</span>}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end gap-3">
                                <button onClick={() => handleDelete(vehicle.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                                <button onClick={() => handleEditClick(vehicle)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <p className="col-span-full text-center py-12 text-slate-500 italic">No vehicles have been added yet.</p>
                )}
            </div>
        </div>
    );
};

export default FleetManagement;