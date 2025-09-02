

import React, { useMemo } from 'react';
import { User, SubDepartment, UserRole } from '../../types';
import { employeePermissionLabels } from './utils';

interface ManageTeamProps {
    users: User[];
    subDepartments: SubDepartment[];
    loggedInUser: User;
    onEditPermissions: (employee: User) => void;
    onDeleteEmployee: (employeeId: string) => void;
}

const ManageTeam: React.FC<ManageTeamProps> = ({ users, subDepartments, loggedInUser, onEditPermissions, onDeleteEmployee }) => {

    const myTeam = useMemo(() => {
        return users.filter(u => u.role === UserRole.Employee && u.supervisorId === loggedInUser.id);
    }, [users, loggedInUser.id]);
    
    const subDeptMap = useMemo(() => new Map(subDepartments.map(sd => [sd.id, sd.name])), [subDepartments]);

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Manage Your Team</h3>
            <p className="text-sm text-slate-600 mb-6">Grant or revoke sub-department access and specific abilities for employees on your team.</p>
             <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Designation</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Sub-departments</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Granted Abilities</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {myTeam.length > 0 ? myTeam.map(employee => (
                            <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{employee.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.employeeId || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{employee.designation || 'N/A'}</td>
                                <td className="px-6 py-4 max-w-xs">
                                    {employee.assignedSubDepartmentIds && employee.assignedSubDepartmentIds.length > 0
                                        ? <p className="text-sm text-slate-500 truncate" title={employee.assignedSubDepartmentIds.map(id => subDeptMap.get(id)).join(', ')}>
                                            {employee.assignedSubDepartmentIds.map(id => subDeptMap.get(id) || 'Unknown').join(', ')}
                                          </p>
                                        : <span className="italic text-slate-400 text-sm">No sub-departments</span>
                                    }
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                     {employee.permissions && employee.permissions.length > 0
                                        ? <div className="flex flex-wrap gap-1.5">
                                            {employee.permissions.map(p => (
                                                <span key={p} className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{employeePermissionLabels[p].split(' ')[0]}</span>
                                            ))}
                                          </div>
                                        : <span className="italic text-slate-400 text-sm">No abilities</span>
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => onEditPermissions(employee)} className="text-blue-600 hover:text-blue-900">Edit Permissions</button>
                                    <button onClick={() => onDeleteEmployee(employee.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-slate-500 italic">You have no employees on your team.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageTeam;