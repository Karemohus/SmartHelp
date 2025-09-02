

import React, { useState, useMemo } from 'react';
import { User, SubDepartment, EmployeePermission } from '../../../types';
import { employeePermissionLabels } from '../utils';

interface EmployeePermissionModalProps {
    employee: User;
    availableSubDepartments: SubDepartment[];
    allUsers: User[];
    onClose: () => void;
    onSave: (user: User) => void;
}

const EmployeePermissionModal: React.FC<EmployeePermissionModalProps> = ({ employee, availableSubDepartments, allUsers, onClose, onSave }) => {
    const [assignedSubDepartmentIds, setAssignedSubDepartmentIds] = useState<string[]>(employee.assignedSubDepartmentIds || []);
    const [grantedPermissions, setGrantedPermissions] = useState<EmployeePermission[]>(employee.permissions || []);
    const [employeeId, setEmployeeId] = useState(employee.employeeId || '');
    const [designation, setDesignation] = useState(employee.designation || '');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleToggleSubDepartment = (subDeptId: string) => {
        setAssignedSubDepartmentIds(prev =>
            prev.includes(subDeptId)
                ? prev.filter(id => id !== subDeptId)
                : [...prev, subDeptId]
        );
    };

    const handleTogglePermission = (permission: EmployeePermission) => {
        setGrantedPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (employeeId.trim()) {
            const isEmployeeIdTaken = allUsers.some(u => 
                u.employeeId && u.employeeId.toLowerCase() === employeeId.trim().toLowerCase() && u.id !== employee.id
            );
            if (isEmployeeIdTaken) {
                setError("This Employee ID is already taken by another user.");
                return;
            }
        }
        
        const updatedUser: User = {
            ...employee,
            assignedSubDepartmentIds: assignedSubDepartmentIds,
            permissions: grantedPermissions,
            employeeId: employeeId.trim() ? employeeId.trim() : undefined,
            designation: designation.trim() ? designation.trim() : undefined,
        };

        if (newPassword.trim()) {
            updatedUser.password = newPassword.trim();
        }

        onSave(updatedUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
            <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-slate-800">Manage Permissions</h3>
                <p className="text-slate-600 mb-6">for <span className="font-semibold">{employee.username}</span></p>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Sub-departments</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                            {availableSubDepartments.length > 0 ? availableSubDepartments.map(sd => (
                                <div key={sd.id} className="flex items-center">
                                    <input
                                        id={`perm-sd-${sd.id}`}
                                        type="checkbox"
                                        checked={assignedSubDepartmentIds.includes(sd.id)}
                                        onChange={() => handleToggleSubDepartment(sd.id)}
                                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`perm-sd-${sd.id}`} className="ml-2 text-sm text-slate-700 truncate">{sd.name}</label>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500 italic col-span-full">You have no sub-departments to assign permissions from. Create them in the 'Sub-departments' tab.</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Granted Abilities</label>
                         <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
                            {(Object.keys(employeePermissionLabels) as EmployeePermission[]).map(permissionKey => (
                                <div key={permissionKey} className="flex items-center">
                                    <input
                                        id={`perm-ability-${permissionKey}`}
                                        type="checkbox"
                                        checked={grantedPermissions.includes(permissionKey)}
                                        onChange={() => handleTogglePermission(permissionKey)}
                                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`perm-ability-${permissionKey}`} className="ml-2 text-sm text-slate-700">{employeePermissionLabels[permissionKey]}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="pt-6 border-t border-slate-200 space-y-4">
                        <div>
                            <label htmlFor="employee-designation" className="block text-sm font-medium text-slate-700 mb-1">
                                Job Title / Designation
                            </label>
                            <input
                                id="employee-designation"
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Support Specialist"
                            />
                        </div>
                        <div>
                            <label htmlFor="employee-id-perm" className="block text-sm font-medium text-slate-700 mb-1">
                                Employee ID
                            </label>
                            <input
                                id="employee-id-perm"
                                type="text"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., E123"
                            />
                        </div>
                        <div>
                            <label htmlFor="employee-password" className="block text-sm font-medium text-slate-700 mb-1">
                                Set New Password
                            </label>
                            <input
                                id="employee-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Leave blank to keep unchanged"
                                autoComplete="new-password"
                            />
                             <p className="text-xs text-slate-500 mt-1">
                                The employee will need to be informed of their new password manually.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default EmployeePermissionModal;