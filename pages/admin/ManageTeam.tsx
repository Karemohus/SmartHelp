

import React, { useMemo } from 'react';
import { User, SubDepartment, UserRole } from '../../types';
// Fix: Import getEmployeePermissionLabels function instead of the non-existent employeePermissionLabels.
import { getEmployeePermissionLabels } from './utils';
import { useLanguage } from '../../context/LanguageContext';

interface ManageTeamProps {
    users: User[];
    subDepartments: SubDepartment[];
    loggedInUser: User;
    onEditPermissions: (employee: User) => void;
    onDeleteEmployee: (employeeId: string) => void;
}

const ManageTeam: React.FC<ManageTeamProps> = ({ users, subDepartments, loggedInUser, onEditPermissions, onDeleteEmployee }) => {
    // Fix: Use the useLanguage hook to get the translation function and generate the labels object.
    const { t, language } = useLanguage();
    const employeePermissionLabels = getEmployeePermissionLabels(t);

    const myTeam = useMemo(() => {
        return users.filter(u => (u.role === UserRole.Employee || u.role === UserRole.Driver) && u.supervisorId === loggedInUser.id);
    }, [users, loggedInUser.id]);
    
    const subDeptMap = useMemo(() => new Map(subDepartments.map(sd => [sd.id, language === 'ar' ? sd.name_ar : sd.name])), [subDepartments, language]);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('manage_your_team')}</h3>
            <p className="text-sm text-slate-600 mb-6">{t('manage_team_desc')}</p>
             <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('employee')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('employee_id_short')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('designation')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('assigned_sub_departments')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('granted_abilities')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {myTeam.length > 0 ? myTeam.map(employee => (
                            <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{employee.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.employeeId || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{language === 'ar' ? employee.designation_ar : employee.designation || 'N/A'}</td>
                                <td className="px-6 py-4 max-w-xs">
                                    {employee.assignedSubDepartmentIds && employee.assignedSubDepartmentIds.length > 0
                                        ? <p className="text-sm text-slate-500 truncate" title={employee.assignedSubDepartmentIds.map(id => subDeptMap.get(id)).join(', ')}>
                                            {employee.assignedSubDepartmentIds.map(id => subDeptMap.get(id) || 'Unknown').join(', ')}
                                          </p>
                                        : <span className="italic text-slate-400 text-sm">{t('no_sub_departments')}</span>
                                    }
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                     {employee.permissions && employee.permissions.length > 0
                                        ? <div className="flex flex-wrap gap-1.5">
                                            {employee.permissions.map(p => (
                                                <span key={p} className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{employeePermissionLabels[p].split(' ')[0]}</span>
                                            ))}
                                          </div>
                                        : <span className="italic text-slate-400 text-sm">{t('no_abilities')}</span>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                                    <button onClick={() => onEditPermissions(employee)} className="text-blue-600 hover:text-blue-900">{t('edit_permissions')}</button>
                                    <button onClick={() => onDeleteEmployee(employee.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 italic">{t('no_employees_on_team')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageTeam;