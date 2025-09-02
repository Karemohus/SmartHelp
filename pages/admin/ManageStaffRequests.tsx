

import React, { useState, useMemo } from 'react';
import { EmployeeRequest, User, UserRole, ToastMessage } from '../../types';
import RejectionModal from './components/RejectionModal';

interface ManageStaffRequestsProps {
    employeeRequests: EmployeeRequest[];
    setEmployeeRequests: React.Dispatch<React.SetStateAction<EmployeeRequest[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    loggedInUser: User;
    addToast: (message: string, type: ToastMessage['type']) => void;
    canApprove: boolean;
}

const AddDriverForm: React.FC<{
    loggedInUser: User;
    allUsers: User[];
    onDriverAdd: (newUser: User) => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}> = ({ loggedInUser, allUsers, onDriverAdd, addToast }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [designation, setDesignation] = useState('Driver');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [licenseExpiry, setLicenseExpiry] = useState('');

    const handleDriverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            addToast('Username and password are required for new drivers.', 'error');
            return;
        }
        if (allUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
            addToast('This username is already taken.', 'error');
            return;
        }
        if (employeeId.trim() && allUsers.some(u => u.employeeId && u.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) {
            addToast('This Employee ID is already taken.', 'error');
            return;
        }

        const newDriver: User = {
            id: `user-driver-${Date.now()}`,
            username: username.trim(),
            password: password.trim(),
            role: UserRole.Driver,
            supervisorId: loggedInUser.id,
            employeeId: employeeId.trim() || undefined,
            designation: designation.trim() || undefined,
            drivingLicenseNumber: licenseNumber.trim() || undefined,
            drivingLicenseExpiry: licenseExpiry || undefined,
        };

        onDriverAdd(newDriver);
        addToast(`Driver '${newDriver.username}' created successfully.`, 'success');
        
        // Reset form
        setUsername('');
        setPassword('');
        setEmployeeId('');
        setDesignation('Driver');
        setLicenseNumber('');
        setLicenseExpiry('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800">Add New Driver</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">Directly create a new driver account. The driver will be assigned to your team.</p>
            <form onSubmit={handleDriverSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Driver Username" required className="p-2 border rounded-md" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Temporary Password" required className="p-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="Employee ID (Optional)" className="p-2 border rounded-md" />
                    <input type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Job Title (e.g., Driver)" className="p-2 border rounded-md" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="Driving License Number" className="p-2 border rounded-md" />
                    <div>
                        <label htmlFor="driver-license-expiry" className="sr-only">License Expiry Date</label>
                        <input id="driver-license-expiry" type="date" value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} className="w-full p-2 border rounded-md text-slate-500" title="License Expiry Date" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">Add Driver</button>
                </div>
            </form>
        </div>
    );
};

const ManageStaffRequests: React.FC<ManageStaffRequestsProps> = ({ employeeRequests, setEmployeeRequests, users, setUsers, loggedInUser, addToast, canApprove }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [designation, setDesignation] = useState('');
    const [rejectingRequest, setRejectingRequest] = useState<EmployeeRequest | null>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);
    const supervisorCanCreateDirectly = loggedInUser.adminPermissions?.includes('manage_staff_directly');

    const myRequests = useMemo(() => {
        return employeeRequests
            .filter(req => req.requestedBySupervisorId === loggedInUser.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [employeeRequests, loggedInUser.id]);

    const { pendingRequests, resolvedRequests } = useMemo(() => {
        const pending = employeeRequests.filter(req => req.status === 'pending');
        const resolved = employeeRequests.filter(req => req.status !== 'pending');
        return { 
            pendingRequests: pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            resolvedRequests: resolved.sort((a, b) => new Date(b.resolvedAt || 0).getTime() - new Date(a.resolvedAt || 0).getTime()),
        };
    }, [employeeRequests]);


    const handleRequestSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            addToast('Username and password are required.', 'error');
            return;
        }
        if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
            addToast('This username is already taken.', 'error');
            return;
        }
        if (employeeId.trim() && users.some(u => u.employeeId && u.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) {
            addToast('This Employee ID is already taken.', 'error');
            return;
        }

        const newRequest: EmployeeRequest = {
            id: `REQ-${Date.now()}`,
            requestedBySupervisorId: loggedInUser.id,
            newEmployeeUsername: username.trim(),
            newEmployeePassword: password.trim(),
            newEmployeeDesignation: designation.trim() ? designation.trim() : undefined,
            newEmployeeId: employeeId.trim() ? employeeId.trim() : undefined,
            status: 'pending',
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            resolvedByAdminId: null,
            rejectionReason: null,
        };

        setEmployeeRequests(prev => [newRequest, ...prev]);
        addToast('Employee request submitted for approval.', 'success');
        setUsername('');
        setPassword('');
        setEmployeeId('');
        setDesignation('');
    };

    const handleDirectCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            addToast('Username and password are required.', 'error');
            return;
        }
        if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
            addToast('This username is already taken.', 'error');
            return;
        }
        if (employeeId.trim() && users.some(u => u.employeeId && u.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) {
            addToast('This Employee ID is already taken.', 'error');
            return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            username: username.trim(),
            designation: designation.trim() ? designation.trim() : undefined,
            employeeId: employeeId.trim() ? employeeId.trim() : undefined,
            password: password.trim(),
            role: UserRole.Employee,
            supervisorId: loggedInUser.id,
            assignedCategoryIds: [],
            permissions: [],
        };

        setUsers(prev => [...prev, newUser]);
        addToast(`Employee account for '${newUser.username}' created. You must now grant permissions in 'Manage Team'.`, 'success');
        setUsername('');
        setPassword('');
        setEmployeeId('');
        setDesignation('');
    };
    
    const handleApprove = (request: EmployeeRequest) => {
        if (users.some(u => u.username.toLowerCase() === request.newEmployeeUsername.toLowerCase())) {
            addToast(`Username "${request.newEmployeeUsername}" is now taken. Request rejected.`, 'error');
            setEmployeeRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected', rejectionReason: 'Username became unavailable.', resolvedAt: new Date().toISOString(), resolvedByAdminId: loggedInUser.id } : r));
            return;
        }

        if (request.newEmployeeId && users.some(u => u.employeeId && u.employeeId.toLowerCase() === request.newEmployeeId.toLowerCase())) {
            addToast(`Employee ID "${request.newEmployeeId}" is now taken. Request rejected.`, 'error');
            setEmployeeRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected', rejectionReason: 'Employee ID became unavailable.', resolvedAt: new Date().toISOString(), resolvedByAdminId: loggedInUser.id } : r));
            return;
        }
        
        const requestingSupervisor = users.find(u => u.id === request.requestedBySupervisorId);
        if(!requestingSupervisor){
             addToast(`Requesting supervisor could not be found.`, 'error');
             setEmployeeRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'rejected', rejectionReason: 'Original supervisor account not found.', resolvedAt: new Date().toISOString(), resolvedByAdminId: loggedInUser.id } : r));
             return;
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            username: request.newEmployeeUsername,
            designation: request.newEmployeeDesignation,
            employeeId: request.newEmployeeId,
            password: request.newEmployeePassword,
            role: UserRole.Employee,
            supervisorId: request.requestedBySupervisorId,
            assignedCategoryIds: [], // Start with no categories
            permissions: [], // Start with no abilities
        };

        setUsers(prev => [...prev, newUser]);
        setEmployeeRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'approved', resolvedAt: new Date().toISOString(), resolvedByAdminId: loggedInUser.id, acknowledgedBySupervisor: false } : r));
        addToast(`Employee account for '${newUser.username}' created. Their supervisor must now grant them category and ability permissions via the 'Manage Team' tab.`, 'success');
    };
    
    const handleRejectSubmit = (reason: string) => {
        if (!rejectingRequest) return;
        setEmployeeRequests(prev => prev.map(r => r.id === rejectingRequest.id ? { ...r, status: 'rejected', rejectionReason: reason, resolvedAt: new Date().toISOString(), resolvedByAdminId: loggedInUser.id } : r));
        addToast('Request has been rejected.', 'info');
        setRejectingRequest(null);
    };

    const getStatusBadgeColor = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
        }
    };
    
    if(canApprove) {
        return (
            <div className="space-y-8">
                {rejectingRequest && <RejectionModal onClose={() => setRejectingRequest(null)} onSubmit={handleRejectSubmit} />}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Pending Employee Requests</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {pendingRequests.length > 0 ? pendingRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{req.newEmployeeUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{userMap.get(req.requestedBySupervisorId) || 'Unknown User'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleApprove(req)} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700">Approve</button>
                                            <button onClick={() => setRejectingRequest(req)} className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700">Reject</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-10 text-slate-500 italic">No pending requests.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Resolved Requests</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                       <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved By</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-slate-200">
                                {resolvedRequests.length > 0 ? resolvedRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(req.status)}`}>{req.status}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.newEmployeeUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{userMap.get(req.resolvedByAdminId || '') || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {req.rejectionReason ? `Reason: ${req.rejectionReason}`: `Approved on ${new Date(req.resolvedAt!).toLocaleDateString()}`}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-10 text-slate-500 italic">No resolved requests.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
    
    // Supervisor View (for requesting or creating new staff)
    if (loggedInUser.role === UserRole.Supervisor) {
        return (
            <div className="space-y-8">
                 {supervisorCanCreateDirectly ? (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-bold text-slate-800">Create New Employee Account</h3>
                        <p className="text-sm text-slate-600 mt-1 mb-4">You have permission to create employee accounts directly. The new user will be assigned to your team.</p>
                        <form onSubmit={handleDirectCreateSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="direct-username" className="block text-sm font-medium text-slate-700 mb-1">New Employee Username</label>
                                    <input id="direct-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label htmlFor="direct-designation" className="block text-sm font-medium text-slate-700 mb-1">Job Title / Designation</label>
                                    <input id="direct-designation" type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g., Support Specialist" className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="direct-employee-id" className="block text-sm font-medium text-slate-700 mb-1">Employee ID (Optional)</label>
                                    <input id="direct-employee-id" type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="direct-password" className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                                    <input id="direct-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Create Account</button>
                            </div>
                        </form>
                    </div>
                 ) : (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-bold text-slate-800">Request New Employee Account</h3>
                        <p className="text-sm text-slate-600 mt-1 mb-4">Submit a request to create a new employee account. The new user will be assigned to your same categories upon approval by an admin.</p>
                        <form onSubmit={handleRequestSubmit} className="space-y-4 p-4 border rounded-lg bg-slate-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="req-username" className="block text-sm font-medium text-slate-700 mb-1">New Employee Username</label>
                                    <input id="req-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                                <div>
                                    <label htmlFor="req-designation" className="block text-sm font-medium text-slate-700 mb-1">Job Title / Designation (Optional)</label>
                                    <input id="req-designation" type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g., Support Specialist" className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="req-employee-id" className="block text-sm font-medium text-slate-700 mb-1">Employee ID (Optional)</label>
                                    <input id="req-employee-id" type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                    <div>
                                    <label htmlFor="req-password" className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                                    <input id="req-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Submit Request</button>
                            </div>
                        </form>
                    </div>
                 )}
                 
                <AddDriverForm loggedInUser={loggedInUser} allUsers={users} onDriverAdd={(newUser) => setUsers(prev => [...prev, newUser])} addToast={addToast} />

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Your Past Requests</h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested Designation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested Employee ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                {myRequests.length > 0 ? myRequests.map(req => (
                                    <tr key={req.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(req.status)}`}>{req.status}</span></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{req.newEmployeeUsername}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.newEmployeeDesignation || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{req.newEmployeeId || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {req.status === 'rejected' && `Reason: ${req.rejectionReason}`}
                                            {req.status === 'approved' && `Approved by ${userMap.get(req.resolvedByAdminId || '') || 'Admin'}`}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center py-10 text-slate-500 italic">You have not submitted any requests.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return null;
}

export default ManageStaffRequests;