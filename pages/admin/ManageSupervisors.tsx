

import React, { useState, useMemo } from 'react';
import { User, Category, EmployeeRequest, ToastMessage } from '../../types';
import SupervisorEditModal from './components/SupervisorEditModal';
import SearchIcon from '../../components/icons/SearchIcon';
import { adminPermissionLabels } from './utils';

interface ManageSupervisorsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    categories: Category[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    employeeRequests: EmployeeRequest[];
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}


const ManageSupervisors: React.FC<ManageSupervisorsProps> = ({ users, setUsers, categories, addToast, employeeRequests, requestConfirm }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const supervisors = useMemo(() => users.filter(u => u.role === 'supervisor'), [users]);
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const filteredSupervisors = useMemo(() => {
        if (!searchQuery.trim()) {
            return supervisors;
        }
        const lowercasedQuery = searchQuery.trim().toLowerCase();
        return supervisors.filter(supervisor =>
            supervisor.username.toLowerCase().includes(lowercasedQuery) ||
            (supervisor.employeeId && supervisor.employeeId.toLowerCase().includes(lowercasedQuery))
        );
    }, [supervisors, searchQuery]);

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = (savedUser: User) => {
        const isEditing = users.some(u => u.id === savedUser.id);
        if (isEditing) {
            setUsers(prev => prev.map(u => (u.id === savedUser.id ? savedUser : u)));
        } else {
            setUsers(prev => [...prev, savedUser]);
        }
        addToast(isEditing ? 'Supervisor updated successfully!' : 'Supervisor added successfully!', 'success');
        handleCloseModal();
    };
    
    const handleDeleteUser = (userId: string) => {
        const hasAssignedEmployees = users.some(u => u.supervisorId === userId);
        if (hasAssignedEmployees) {
            window.alert('Cannot delete supervisor. Please reassign their employees first.');
            return;
        }

        const hasPendingRequests = employeeRequests.some(req => req.requestedBySupervisorId === userId && req.status === 'pending');
        if (hasPendingRequests) {
            window.alert('Cannot delete supervisor. They have pending staff requests that must be resolved first.');
            return;
        }

        requestConfirm(
            'Confirm Supervisor Deletion',
            'Are you sure you want to delete this supervisor? This action cannot be undone.',
            () => {
                setUsers(prev => prev.filter(u => u.id !== userId));
                addToast('Supervisor deleted successfully.', 'success');
            },
            'Yes, Delete'
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            {isModalOpen && (
                <SupervisorEditModal 
                    userToEdit={editingUser}
                    allUsers={users}
                    categories={categories}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-slate-800">Manage Supervisors</h3>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Add Supervisor</button>
            </div>

            <div className="mb-4">
                <label htmlFor="supervisor-search" className="sr-only">Search Supervisors</label>
                <div className="relative w-full md:w-1/2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="supervisor-search"
                        type="search"
                        placeholder="Search by username or Employee ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-md border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full responsive-table">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Designation</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Granted Permissions</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Categories</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white md:divide-y md:divide-slate-200">
                        {filteredSupervisors.length > 0 ? filteredSupervisors.map(user => (
                            <tr key={user.id}>
                                <td data-label="Username" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                                <td data-label="Employee ID" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.employeeId || 'N/A'}</td>
                                <td data-label="Designation" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.designation || 'N/A'}</td>
                                <td data-label="Permissions" className="px-6 py-4 max-w-sm">
                                    {user.adminPermissions && user.adminPermissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {user.adminPermissions.map(perm => (
                                                <span key={perm} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                                    {adminPermissionLabels[perm].title}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">None</span>
                                    )}
                                </td>
                                <td data-label="Categories" className="px-6 py-4 max-w-sm">
                                    <p className="text-sm text-slate-500 truncate" title={user.assignedCategoryIds?.map(id => categoryMap.get(id)).join(', ')}>
                                        {user.adminPermissions?.includes('view_all_dashboards') ? 'All Categories' : user.assignedCategoryIds?.map(id => categoryMap.get(id) || 'Unknown').join(', ') || 'None'}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenEditModal(user)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 italic">
                                     {searchQuery ? 'No supervisors found matching your search.' : 'No supervisors have been added yet.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageSupervisors;