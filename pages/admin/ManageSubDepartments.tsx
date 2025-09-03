

import React, { useState } from 'react';
import { SubDepartment, Category, User, Ticket, Task, ToastMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
    const [nameAr, setNameAr] = useState('');
    const [mainCategoryId, setMainCategoryId] = useState(supervisorCategories[0]?.id || '');
    const [editingSubDept, setEditingSubDept] = useState<SubDepartment | null>(null);
    const { language, t } = useLanguage();

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedNameAr = nameAr.trim();

        if (!trimmedName || !trimmedNameAr || !mainCategoryId) {
            addToast(t('sub_department_name_required'), 'error');
            return;
        }
        if (subDepartments.some(sd => (sd.name.toLowerCase() === trimmedName.toLowerCase() || sd.name_ar.toLowerCase() === trimmedNameAr.toLowerCase()) && sd.supervisorId === loggedInUser.id)) {
            addToast(t('sub_department_name_exists'), 'error');
            return;
        }

        // Fix: Add the missing 'name_ar' property to the new SubDepartment object.
        const newSubDept: SubDepartment = {
            id: `sd_${Date.now()}`,
            name: trimmedName,
            name_ar: trimmedNameAr,
            mainCategoryId,
            supervisorId: loggedInUser.id
        };

        setSubDepartments(prev => [...prev, newSubDept].sort((a,b) => a.name.localeCompare(b.name)));
        addToast(t('sub_department_created_successfully'), 'success');
        setName('');
        setNameAr('');
    };

    const handleUpdate = () => {
        if (!editingSubDept || !editingSubDept.name.trim() || !editingSubDept.name_ar.trim()) {
            addToast(t('sub_department_name_empty'), 'error');
            return;
        }
        if (subDepartments.some(sd => (sd.name.toLowerCase() === editingSubDept.name.trim().toLowerCase() || sd.name_ar.toLowerCase() === editingSubDept.name_ar.trim().toLowerCase()) && sd.supervisorId === loggedInUser.id && sd.id !== editingSubDept.id)) {
            addToast(t('sub_department_name_exists'), 'error');
            return;
        }
        setSubDepartments(prev => prev.map(sd => sd.id === editingSubDept.id ? editingSubDept : sd));
        addToast(t('sub_department_updated_successfully'), 'success');
        setEditingSubDept(null);
    };

    const handleDelete = (subDeptId: string) => {
        const isUsedByEmployee = users.some(u => u.assignedSubDepartmentIds?.includes(subDeptId));
        const isUsedByTicket = tickets.some(t => t.subDepartmentId === subDeptId);
        const isUsedByTask = tasks.some(t => t.assignedSubDepartmentId === subDeptId);

        if (isUsedByEmployee || isUsedByTicket || isUsedByTask) {
            addToast(t('cannot_delete_sub_department_in_use'), 'error');
            return;
        }

        requestConfirm(
            t('confirm_sub_department_deletion'),
            t('are_you_sure_delete_sub_department'),
            () => {
                setSubDepartments(prev => prev.filter(sd => sd.id !== subDeptId));
                addToast(t('sub_department_deleted'), 'success');
            },
            t('yes_delete')
        );
    };

    const renderSubDepartment = (sd: SubDepartment) => {
        const category = supervisorCategories.find(c => c.id === sd.mainCategoryId);
        const categoryName = category ? (language === 'ar' ? category.name_ar : category.name) : 'Unknown Category';
        
        if (editingSubDept?.id === sd.id) {
            return (
                <div key={sd.id} className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50 space-y-3">
                    <input 
                        type="text" 
                        value={editingSubDept.name} 
                        onChange={e => setEditingSubDept({...editingSubDept, name: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-md"
                        placeholder={t('sub_department_name_en')}
                    />
                    <input 
                        type="text" 
                        value={editingSubDept.name_ar} 
                        onChange={e => setEditingSubDept({...editingSubDept, name_ar: e.target.value})}
                        className="w-full p-2 border border-slate-300 rounded-md"
                        placeholder={t('sub_department_name_ar')}
                        dir="rtl"
                    />
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setEditingSubDept(null)} className="text-sm font-medium text-slate-600">{t('cancel')}</button>
                        <button onClick={handleUpdate} className="text-sm font-medium text-white bg-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-700">{t('save_changes')}</button>
                    </div>
                </div>
            );
        }

        return (
            <div key={sd.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-2">
                <div>
                    <p className="font-bold text-slate-800">{sd.name} / {sd.name_ar}</p>
                    <p className="text-xs text-slate-500">{t('under_category').replace('{categoryName}', categoryName)}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setEditingSubDept(sd)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('edit')}</button>
                    <button onClick={() => handleDelete(sd.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">{t('delete')}</button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-slate-800">{t('create_new_sub_department')}</h3>
                <p className="text-sm text-slate-600 mt-1 mb-4">{t('create_sub_department_desc')}</p>
                <form onSubmit={handleCreate} className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="sd-name" className="block text-sm font-medium text-slate-700 mb-1">{t('sub_department_name_en')}</label>
                            <input
                                id="sd-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md"
                                placeholder={t('eg_domestic_shipping')}
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="sd-name-ar" className="block text-sm font-medium text-slate-700 mb-1">{t('sub_department_name_ar')}</label>
                            <input
                                id="sd-name-ar"
                                type="text"
                                value={nameAr}
                                onChange={e => setNameAr(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md"
                                placeholder="مثال: الشحن المحلي"
                                required
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label htmlFor="sd-category" className="block text-sm font-medium text-slate-700 mb-1">{t('parent_category')}</label>
                            <select
                                id="sd-category"
                                value={mainCategoryId}
                                onChange={e => setMainCategoryId(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md bg-white"
                                required
                                disabled={supervisorCategories.length === 0}
                            >
                                {supervisorCategories.length > 0 ? (
                                    supervisorCategories.map(cat => <option key={cat.id} value={cat.id}>{language === 'ar' ? cat.name_ar : cat.name}</option>)
                                ) : (
                                    <option>{t('no_categories_assigned')}</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700" disabled={supervisorCategories.length === 0}>
                            {t('create_section')}
                        </button>
                    </div>
                </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">{t('your_sub_departments')}</h3>
                 <div className="space-y-3">
                    {subDepartments.length > 0 ? (
                        subDepartments.map(renderSubDepartment)
                    ) : (
                        <p className="text-center text-slate-500 italic py-8">{t('no_sub_departments_created')}</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ManageSubDepartments;