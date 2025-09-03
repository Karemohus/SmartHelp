

import React, { useState, useMemo } from 'react';
import { User, Category, EmployeeRequest, ToastMessage } from '../../types';
import SupervisorEditModal from './components/SupervisorEditModal';
import SearchIcon from '../../components/icons/SearchIcon';
// Fix: Import getAdminPermissionLabels function instead of the non-existent adminPermissionLabels.
import { getAdminPermissionLabels } from './utils';
import { useLanguage } from '../../context/LanguageContext';

interface ManageSupervisorsProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    categories: Category[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    employeeRequests: EmployeeRequest[];
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}


const ManageSupervisors: React.FC<ManageSupervisorsProps> = ({ users, setUsers, categories, addToast, employeeRequests, requestConfirm }) => {
    // Fix: Use the useLanguage hook to get the translation function and generate the labels object.
    const { t, language } = useLanguage();
    const adminPermissionLabels = getAdminPermissionLabels(t);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const supervisors = useMemo(() => users.filter(u => u.role === 'supervisor'), [users]);
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, language === 'ar' ? c.name_ar : c.name])), [categories, language]);

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
        addToast(isEditing ? t('supervisor_updated_successfully') : t('supervisor_added_successfully'), 'success');
        handleCloseModal();
    };
    
    const handleDeleteUser = (userId: string) => {
        const hasAssignedEmployees = users.some(u => u.supervisorId === userId);
        if (hasAssignedEmployees) {
            window.alert(t('cannot_delete_supervisor_reassign'));
            return;
        }

        const hasPendingRequests = employeeRequests.some(req => req.requestedBySupervisorId === userId && req.status === 'pending');
        if (hasPendingRequests) {
            window.alert(t('cannot_delete_supervisor_requests'));
            return;
        }

        requestConfirm(
            t('confirm_supervisor_deletion'),
            t('are_you_sure_delete_supervisor'),
            () => {
                setUsers(prev => prev.filter(u => u.id !== userId));
                addToast(t('supervisor_deleted_successfully'), 'success');
            },
            t('yes_delete')
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
                <h3 className="text-xl font-bold text-slate-800">{t('manage_supervisors')}</h3>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">{t('add_supervisor')}</button>
            </div>

            <div className="mb-4">
                <label htmlFor="supervisor-search" className="sr-only">{t('search')}</label>
                <div className="relative w-full md:w-1/2">
                    <div className={`pointer-events-none absolute inset-y-0 flex items-center ${language === 'ar' ? 'end-0 pe-3' : 'start-0 ps-3'}`}>
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        id="supervisor-search"
                        type="search"
                        placeholder={t('search_supervisors_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`block w-full rounded-md border-slate-300 bg-white py-2 ${language === 'ar' ? 'pe-10 ps-3' : 'ps-10 pe-3'} text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full responsive-table">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('username')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('employee_id_short')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('designation')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('granted_permissions')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('assigned_categories')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white md:divide-y md:divide-slate-200">
                        {filteredSupervisors.length > 0 ? filteredSupervisors.map(user => (
                            <tr key={user.id}>
                                <td data-label={t('username')} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                                <td data-label={t('employee_id_short')} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.employeeId || 'N/A'}</td>
                                <td data-label={t('designation')} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{language === 'ar' ? user.designation_ar : user.designation || 'N/A'}</td>
                                <td data-label={t('granted_permissions')} className="px-6 py-4 max-w-sm">
                                    {user.adminPermissions && user.adminPermissions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 justify-end md:justify-start">
                                            {user.adminPermissions.map(perm => (
                                                <span key={perm} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                                    {adminPermissionLabels[perm].title}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">{t('none')}</span>
                                    )}
                                </td>
                                <td data-label={t('assigned_categories')} className="px-6 py-4 max-w-sm">
                                    <p className="text-sm text-slate-500 truncate" title={user.assignedCategoryIds?.map(id => categoryMap.get(id)).join(', ')}>
                                        {user.adminPermissions?.includes('view_all_dashboards') ? t('all_categories') : user.assignedCategoryIds?.map(id => categoryMap.get(id) || 'Unknown').join(', ') || t('none')}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenEditModal(user)} className="text-blue-600 hover:text-blue-900">{t('edit')}</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
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