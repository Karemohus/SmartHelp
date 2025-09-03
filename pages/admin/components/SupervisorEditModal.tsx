

import React, { useState, useEffect } from 'react';
import { User, Category, UserRole, AdminPermission } from '../../../types';
// Fix: Import getAdminPermissionLabels function instead of the non-existent adminPermissionLabels.
import { getAdminPermissionLabels } from '../utils';
import { useLanguage } from '../../../context/LanguageContext';

interface SupervisorEditModalProps {
    userToEdit: User | null;
    allUsers: User[];
    categories: Category[];
    onClose: () => void;
    onSave: (userData: User) => void;
}

const SupervisorEditModal: React.FC<SupervisorEditModalProps> = ({ userToEdit, allUsers, categories, onClose, onSave }) => {
    // Fix: Use the useLanguage hook to get the translation function and generate the labels object.
    const { t, language } = useLanguage();
    const adminPermissionLabels = getAdminPermissionLabels(t);
    
    const [username, setUsername] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [designation, setDesignation] = useState('');
    const [password, setPassword] = useState('');
    const [assignedCategoryIds, setAssignedCategoryIds] = useState<string[]>([]);
    const [grantedAdminPermissions, setGrantedAdminPermissions] = useState<AdminPermission[]>([]);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (userToEdit) {
            setUsername(userToEdit.username);
            setEmployeeId(userToEdit.employeeId || '');
            setDesignation(userToEdit.designation || '');
            setPassword(''); // Password field is for updating only
            setAssignedCategoryIds(userToEdit.assignedCategoryIds || []);
            setGrantedAdminPermissions(userToEdit.adminPermissions || []);
        } else {
            setUsername('');
            setEmployeeId('');
            setDesignation('');
            setPassword('');
            setAssignedCategoryIds([]);
            setGrantedAdminPermissions([]);
        }
    }, [userToEdit]);

    const handleCategoryToggle = (categoryId: string) => {
        setAssignedCategoryIds(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleAdminPermissionToggle = (permission: AdminPermission) => {
        setGrantedAdminPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!username.trim() || (!userToEdit && !password.trim())) {
            setError("Username and password are required for new supervisors.");
            return;
        }

        const isUsernameTaken = allUsers.some(u => 
            u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== userToEdit?.id
        );

        if (isUsernameTaken) {
            setError("This username is already taken. Please choose another.");
            return;
        }
        
        if (employeeId.trim()) {
            const isEmployeeIdTaken = allUsers.some(u => 
                u.employeeId && u.employeeId.toLowerCase() === employeeId.trim().toLowerCase() && u.id !== userToEdit?.id
            );
            if (isEmployeeIdTaken) {
                setError("This Employee ID is already in use.");
                return;
            }
        }

        const savedUser: User = {
            id: userToEdit ? userToEdit.id : `user-${Date.now()}`,
            username: username.trim(),
            employeeId: employeeId.trim() ? employeeId.trim() : undefined,
            designation: designation.trim() ? designation.trim() : undefined,
            role: UserRole.Supervisor,
            assignedCategoryIds,
            adminPermissions: grantedAdminPermissions,
            password: password.trim() ? password.trim() : userToEdit?.password,
        };
        onSave(savedUser);
    };

    const modalTitle = userToEdit ? t('edit') + ' ' + t('nav_supervisors') : t('add') + ' ' + t('nav_supervisors');
    const hasFullAccess = grantedAdminPermissions.includes('view_all_dashboards');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h3 className="text-xl font-bold mb-6 text-slate-800">{modalTitle}</h3>
                    {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-md">{error}</p>}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="user-username" className="block text-sm font-medium text-slate-700 mb-1">{t('username')}</label>
                                <input id="user-username" type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                            <div>
                                <label htmlFor="user-employee-id" className="block text-sm font-medium text-slate-700 mb-1">{t('employee_id_short')}</label>
                                <input id="user-employee-id" type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="e.g., A123" className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="user-designation" className="block text-sm font-medium text-slate-700 mb-1">{t('designation')}</label>
                            <input id="user-designation" type="text" value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g., Shipping Supervisor" className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="user-password" className="block text-sm font-medium text-slate-700 mb-1">{userToEdit ? 'Set New Password' : t('password')}</label>
                            <input id="user-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={userToEdit ? "Leave blank to keep unchanged" : ""} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required={!userToEdit} />
                        </div>

                        <div className="pt-4 border-t mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">{t('assigned_categories')}</label>
                            {hasFullAccess ? (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                                    This user has 'View All Dashboards' permission, giving them access to all categories automatically.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center">
                                            <input 
                                                id={`cat-${cat.id}`}
                                                type="checkbox"
                                                checked={assignedCategoryIds.includes(cat.id)}
                                                onChange={() => handleCategoryToggle(cat.id)}
                                                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={`cat-${cat.id}`} className="ms-2 text-sm text-slate-700 truncate">{language === 'ar' ? cat.name_ar : cat.name}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t mt-4">
                           <label className="block text-sm font-medium text-slate-700 mb-2">{t('granted_permissions')}</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(Object.keys(adminPermissionLabels) as AdminPermission[]).map(key => (
                                    <div key={key} className="relative flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id={`perm-${key}`}
                                                type="checkbox"
                                                checked={grantedAdminPermissions.includes(key)}
                                                onChange={() => handleAdminPermissionToggle(key)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="ms-3 text-sm">
                                            <label htmlFor={`perm-${key}`} className="font-medium text-gray-700">{adminPermissionLabels[key].title}</label>
                                            <p className="text-xs text-gray-500">{adminPermissionLabels[key].description}</p>
                                        </div>
                                    </div>
                                ))}
                           </div>
                        </div>

                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">{t('save_changes')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupervisorEditModal;