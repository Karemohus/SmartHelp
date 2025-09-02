
import React, { useState } from 'react';
import { SubDepartment, Category, User, Ticket, Task, ToastMessage } from '../../types';

interface ManageSubDepartmentsProps {
    subDepartments: SubDepartment[];
    setSubDepartments: React.Dispatch<React.SetStateAction<SubDepartment[]>>;
    supervisorCategories: Category[];
    loggedInUser: User;
    users: User[];
    tickets: Ticket[];
    tasks: Task[];
    addToast: (message: string, type: ToastMessage['type']) => void;
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const ManageSubDepartments: React.FC<ManageSubDepartmentsProps> = ({ 
    subDepartments, setSubDepartments, supervisorCategories, loggedInUser, 
    users, tickets, tasks, addToast, requestConfirm 
}) => {
    const [name, setName] = useState('');
    const [mainCategoryId, setMainCategoryId] = useState(supervisorCategories[0]?.id || '');
    const [editingSubDept, setEditingSubDept] = useState<SubDepartment | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !mainCategoryId) {
            addToast('Name and a main category are required.', 'error');
            return;
        }
        if (subDepartments.some(sd => sd.name.toLowerCase() === name.trim().toLowerCase() && sd.supervisorId === loggedInUser.id)) {
            addToast('You already have a sub-department with this name.', 'error');
            return;
        }

        const newSubDept: SubDepartment = {
            id: `sd_${Date.now()}`,
            name: name.trim(),
            mainCategoryId,
            supervisorId: loggedInUser.id
        };

        setSubDepartments(prev => [...prev, newSubDept].sort((a,b) => a.name.localeCompare(b.name)));
        addToast('Sub-department created successfully!', 'success');
        setName('');
    };

    const handleUpdate = () => {
        if (!editingSubDept || !editingSubDept.name.trim()) {
            addToast('Name cannot be empty.', 'error');
            return;
        }
        if (subDepartments.some(sd => sd.name.toLowerCase() === editingSubDept.name.trim().toLowerCase() && sd.supervisorId === loggedInUser.id && sd.id !== editingSubDept.id)) {
            addToast('You already have another sub-department with this name.', 'error');
            return;
        }
        setSubDepartments(prev => prev.map(sd => sd.id === editingSubDept.id ? editingSubDept : sd));
        addToast('Sub-department updated successfully.', 'success');
        setEditingSubDept(null);
    };

    const handleDelete = (subDeptId: string) => {
        const isUsedByEmployee = users.some(u => u.assignedSubDepartmentIds?.includes(subDeptId));
        const isUsedByTicket = tickets.some(t => t.subDepartmentId === subDeptId);
        const isUsedByTask = tasks.some(t => t.assignedSubDepartmentId === subDeptId);

        if (isUsedByEmployee || isUsedByTicket || isUsedByTask) {
            addToast('Cannot delete. This sub-department is in use by employees, tickets, or tasks.', 'error');
            return;
        }

        requestConfirm(
            'Confirm Deletion',
            'Are you sure you want to delete this sub-department?',
            () => {
                setSubDepartments(prev => prev.filter(sd => sd.id !== subDeptId));
                addToast('Sub-department deleted.', 'success');
            },
            'Yes, Delete'
        );
    };

    const renderSubDepartment = (sd: SubDepartment) => {
        const categoryName = supervisorCategories.find(c => c.id === sd.mainCategoryId)?.name || 'Unknown Category';
        
        if (editingSubDept?.id === sd.id) {
            return (
                <div key={sd.id} className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50 space-y-3">
                    <input 
                        type="text" 
                        value={editingSubDept.name} 
                        onChange={e => setEditingSubDept({...editingSubDept, name: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-md"
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingSubDept(null)} className="text-sm font-medium text-slate-600">Cancel</button>
                        <button onClick={handleUpdate} className="text-sm font-medium text-white bg-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            );
        }

        return (
            <div key={sd.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-2">
                <div>
                    <p className="font-bold text-slate-800">{sd.name}</p>
                    <p className="text-xs text-slate-500">Under Category: {categoryName}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setEditingSubDept(sd)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                    <button onClick={() => handleDelete(sd.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-slate-800">Create New Sub-department</h3>
                <p className="text-sm text-slate-600 mt-1 mb-4">Create specific sections within your main categories. You can then assign employees to these sections in the 'Manage Team' tab.</p>
                <form onSubmit={handleCreate} className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sd-name" className="block text-sm font-medium text-slate-700 mb-1">Sub-department Name</label>
                            <input
                                id="sd-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md"
                                placeholder="e.g., Domestic Shipping"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="sd-category" className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
                            <select
                                id="sd-category"
                                value={mainCategoryId}
                                onChange={e => setMainCategoryId(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md bg-white"
                                required
                                disabled={supervisorCategories.length === 0}
                            >
                                {supervisorCategories.length > 0 ? (
                                    supervisorCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                                ) : (
                                    <option>No categories assigned to you</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" disabled={supervisorCategories.length === 0}>
                            Create Section
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Your Sub-departments</h3>
                 <div className="space-y-3">
                    {subDepartments.length > 0 ? (
                        subDepartments.map(renderSubDepartment)
                    ) : (
                        <p className="text-center text-slate-500 italic py-8">You haven't created any sub-departments yet.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ManageSubDepartments;
