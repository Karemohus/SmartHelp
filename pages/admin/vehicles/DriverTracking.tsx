import React, { useMemo, useState } from 'react';
import { User, Violation, Vehicle, ToastMessage } from '../../../types';
import DriverMapModal from './DriverMapModal';
import TrashIcon from '../../../components/icons/TrashIcon';

interface DriverTrackingProps {
    users: User[];
    violations: Violation[];
    setViolations: React.Dispatch<React.SetStateAction<Violation[]>>;
    vehicles: Vehicle[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const DriverTracking: React.FC<DriverTrackingProps> = ({ users, violations, setViolations, vehicles, addToast, requestConfirm }) => {
    
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<User | null>(null);

    // Form state for new violations
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [driverIdForViolation, setDriverIdForViolation] = useState('');

    const drivers = useMemo(() => users.filter(u => u.role === 'driver'), [users]);
    const vehicleMap = useMemo(() => new Map(vehicles.map(v => [v.id, v])), [vehicles]);

    const handleOpenMap = (driver: User) => {
        setSelectedDriver(driver);
        setIsMapModalOpen(true);
    };

    const handleViolationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !driverIdForViolation) {
            addToast('Driver and description are required.', 'error');
            return;
        }

        const driver = drivers.find(d => d.id === driverIdForViolation);
        const assignedVehicle = vehicles.find(v => v.assignedDriverId === driver?.id);

        if (!assignedVehicle) {
            addToast('This driver is not currently assigned to a vehicle.', 'error');
            return;
        }

        const newViolation: Violation = {
            id: `vio_${Date.now()}`,
            driverId: driverIdForViolation,
            vehicleId: assignedVehicle.id,
            date: new Date(date).toISOString(),
            description,
            amount,
            status: 'pending'
        };

        setViolations(prev => [newViolation, ...prev]);
        addToast('Violation logged successfully.', 'success');
        setDescription('');
        setAmount(0);
        setDriverIdForViolation('');
    };

    const handleDeleteViolation = (id: string) => {
        requestConfirm(
            'Confirm Deletion',
            'Are you sure you want to delete this violation record?',
            () => {
                setViolations(prev => prev.filter(v => v.id !== id));
                addToast('Violation deleted.', 'success');
            },
            'Yes, Delete'
        );
    };
    
    const toggleViolationStatus = (id: string) => {
        setViolations(prev => prev.map(v => v.id === id ? {...v, status: v.status === 'paid' ? 'pending' : 'paid'} : v));
    };

    return (
        <div className="space-y-6">
            {isMapModalOpen && selectedDriver && <DriverMapModal driver={selectedDriver} onClose={() => setIsMapModalOpen(false)} />}
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Drivers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drivers.map(driver => (
                        <div key={driver.id} className="p-4 border rounded-lg shadow-sm">
                            <p className="font-bold text-slate-800">{driver.username}</p>
                            <p className="text-sm text-slate-500">{driver.designation || 'Driver'}</p>
                            <p className="text-xs text-slate-400">ID: {driver.employeeId || 'N/A'}</p>
                            <div className="mt-4 pt-4 border-t">
                                <button onClick={() => handleOpenMap(driver)} className="w-full text-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200">
                                    View on Map
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Log a Violation</h3>
                 <form onSubmit={handleViolationSubmit} className="p-4 border rounded-lg bg-slate-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={driverIdForViolation} onChange={e => setDriverIdForViolation(e.target.value)} required className="p-2 border rounded-md bg-white">
                            <option value="" disabled>Select a Driver</option>
                            {drivers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
                        </select>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="p-2 border rounded-md" />
                    </div>
                    <input type="text" placeholder="Description of violation..." value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded-md" />
                    <input type="number" placeholder="Fine Amount (if any)" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 border rounded-md" />
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Log Violation</button>
                    </div>
                 </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Violation History</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full responsive-table">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Driver</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="relative px-4 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white md:divide-y md:divide-slate-200">
                            {violations.length > 0 ? violations.map(v => {
                                const driver = users.find(u => u.id === v.driverId);
                                return (
                                <tr key={v.id}>
                                    <td data-label="Driver" className="px-4 py-3 text-sm font-medium text-slate-800">{driver?.username || 'Unknown'}</td>
                                    <td data-label="Date" className="px-4 py-3 text-sm text-slate-600">{new Date(v.date).toLocaleDateString()}</td>
                                    <td data-label="Description" className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{v.description}</td>
                                    <td data-label="Amount" className="px-4 py-3 text-sm text-slate-600">${v.amount.toFixed(2)}</td>
                                    <td data-label="Status" className="px-4 py-3 text-sm">
                                        <button onClick={() => toggleViolationStatus(v.id)} className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${v.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {v.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDeleteViolation(v.id)} className="text-red-500 hover:text-red-700">
                                            <TrashIcon className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan={6} className="text-center py-10 text-slate-500 italic">No violations recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default DriverTracking;