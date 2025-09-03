

import React, { useState } from 'react';
import { Category, Faq, Ticket, Task, User, ToastMessage, SubDepartment } from '../../types';
import LinkIcon from '../../components/icons/LinkIcon';
import EyeIcon from '../../components/icons/EyeIcon';
import LockClosedIcon from '../../components/icons/LockClosedIcon';
import { useLanguage } from '../../context/LanguageContext';

interface ManageCategoriesProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  faqs: Faq[];
  tickets: Ticket[];
  tasks: Task[];
  users: User[];
  subDepartments: SubDepartment[];
  onCopyLink: (categoryId: string) => void;
  copiedLinkId: string | null;
  addToast: (message: string, type: ToastMessage['type']) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
}

const CategoryCard: React.FC<{ category: Category; onEdit: () => void; onDelete: () => void; onCopyLink: () => void; isCopied: boolean; }> = ({ category, onEdit, onDelete, onCopyLink, isCopied }) => {
    const { language, t } = useLanguage();
    return (
        <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-2">
            <div className="flex items-center gap-3">
                <div className="min-w-0">
                    <p className="font-bold text-slate-800">{language === 'ar' ? category.name_ar : category.name}</p>
                    {category.isPublic ? (
                        <span className="mt-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                            <EyeIcon className="w-3 h-3" /> {t('public')}
                        </span>
                    ) : (
                        <span className="mt-1 text-xs text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                            <LockClosedIcon className="w-3 h-3" /> {t('private')}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={onCopyLink} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isCopied ? 'text-green-600' : 'text-slate-600 hover:text-blue-700'}`}>
                    <LinkIcon className="w-4 h-4" />
                    {isCopied ? t('link_copied_short') : t('share_link')}
                </button>
                <div className="h-5 w-px bg-slate-200" />
                <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 font-medium text-sm">{t('edit')}</button>
                <button onClick={onDelete} className="text-red-600 hover:text-red-800 font-medium text-sm">{t('delete')}</button>
            </div>
        </div>
    );
}

const CategoryEditForm: React.FC<{ category: Category; onSave: (cat: Category) => void; onCancel: () => void; allCategories: Category[]; addToast: (message: string, type: ToastMessage['type']) => void; }> = ({ category, onSave, onCancel, allCategories, addToast }) => {
    const [editedCategory, setEditedCategory] = useState<Category>(category);
    const { t } = useLanguage();

    const handleSave = () => {
        if (allCategories.some(c => c.id !== editedCategory.id && (c.name.toLowerCase() === editedCategory.name.toLowerCase() || c.name_ar.toLowerCase() === editedCategory.name_ar.toLowerCase()))) {
            addToast(t('category_name_exists'), 'error');
            return;
        }
        if (editedCategory.slug && allCategories.some(c => c.id !== editedCategory.id && c.slug === editedCategory.slug)) {
            addToast(t('slug_in_use'), 'error');
            return;
        }
        onSave(editedCategory);
    };

    return (
        <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50 space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('category_name_en')}</label>
                    <input type="text" value={editedCategory.name} onChange={e => setEditedCategory({...editedCategory, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('category_name_ar')}</label>
                    <input type="text" value={editedCategory.name_ar} onChange={e => setEditedCategory({...editedCategory, name_ar: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md" dir="rtl" />
                </div>
            </div>
            <div>
                <label htmlFor={`slug-${category.id}`} className="block text-sm font-medium text-slate-700 mb-1">{t('custom_share_link')}</label>
                 <div className="flex items-center">
                    <span className="text-sm text-slate-500 bg-slate-200 px-3 py-2 rounded-s-md border border-e-0 border-slate-300 whitespace-nowrap">.../#/category/</span>
                    <input
                        id={`slug-${category.id}`}
                        type="text"
                        value={editedCategory.slug || ''}
                        onChange={e => {
                            const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                            setEditedCategory({...editedCategory, slug: newSlug });
                        }}
                        className="w-full p-2 border border-slate-300 rounded-e-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t('eg_shipping_info')}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('custom_share_link_desc')}</p>
            </div>
             <div className="relative flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id={`isPublic-${category.id}`}
                  type="checkbox"
                  checked={editedCategory.isPublic}
                  onChange={e => setEditedCategory({...editedCategory, isPublic: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="ms-3 text-sm">
                <label htmlFor={`isPublic-${category.id}`} className="font-medium text-gray-700">{t('publicly_visible')}</label>
                <p className="text-xs text-gray-500">{t('publicly_visible_desc')}</p>
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('general_category_context')}</label>
                <textarea
                    value={editedCategory.generalContext || ''}
                    onChange={e => setEditedCategory({...editedCategory, generalContext: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    placeholder={t('general_context_placeholder')}
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('general_category_context_ar')}</label>
                <textarea
                    value={editedCategory.generalContext_ar || ''}
                    onChange={e => setEditedCategory({...editedCategory, generalContext_ar: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    placeholder={t('general_context_placeholder_ar')}
                    dir="rtl"
                />
            </div>
            <div className="flex items-center gap-3 mt-4 justify-end">
                <button type="button" onClick={onCancel} className="text-slate-600 hover:text-slate-800 font-medium text-sm">{t('cancel')}</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">{t('save_changes')}</button>
            </div>
        </div>
    );
};


const ManageCategories: React.FC<ManageCategoriesProps> = ({ categories, setCategories, faqs, tickets, tasks, users, subDepartments, onCopyLink, copiedLinkId, addToast, requestConfirm }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { t } = useLanguage();

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    const trimmedNameAr = newCategoryNameAr.trim();

    if (!trimmedName || !trimmedNameAr) {
        addToast(t('category_name_empty'), 'error');
        return;
    }
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase() || c.name_ar.toLowerCase() === trimmedNameAr.toLowerCase())) {
        addToast(t('category_name_exists'), 'error');
        return;
    }
    const newId = trimmedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]+/g, '');
    const newSlug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '');

    if (categories.some(c => c.id === newId || (newSlug && c.slug === newSlug))) {
        addToast(t('slug_in_use'), 'error');
        return;
    }

    const newCategory: Category = {
        id: newId,
        name: trimmedName,
        name_ar: trimmedNameAr,
        isPublic: true, // Default new categories to public
        slug: newSlug,
        generalContext: ''
    };
    setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    addToast(t('category_added_successfully'), 'success');
    setNewCategoryName('');
    setNewCategoryNameAr('');
  };
  
  const handleUpdateCategory = (updatedCategory: Category) => {
    if (!updatedCategory.name.trim() || !updatedCategory.name_ar.trim()) {
        addToast(t('category_name_empty'), 'error');
        return;
    }
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    addToast(t('category_updated_successfully'), 'success');
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
      const isUsedByFaq = faqs.some(f => f.categoryId === categoryId);
      const isUsedByTicket = tickets.some(t => t.categoryId === categoryId);
      const isUsedByTask = tasks.some(t => t.assignedCategoryId === categoryId);
      const isUsedByUser = users.some(u => u.assignedCategoryIds?.includes(categoryId));
      const isUsedBySubDepartment = subDepartments.some(sd => sd.mainCategoryId === categoryId);

      if (isUsedByFaq || isUsedByTicket || isUsedByTask || isUsedByUser || isUsedBySubDepartment) {
          window.alert(t('cannot_delete_category_in_use'));
          return;
      }
      
      requestConfirm(
        t('confirm_category_deletion'),
        t('are_you_sure_delete_category'),
        () => {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
            addToast(t('category_deleted_successfully'), 'success');
        },
        t('yes_delete')
      );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800">{t('manage_categories')}</h3>
        
        <form onSubmit={handleAddCategory} className="mt-4 p-4 border border-slate-200 rounded-lg">
             <h4 className="font-semibold text-slate-700 mb-2">{t('add_new_category')}</h4>
            <div className="flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-grow w-full">
                     <label htmlFor="new-cat-name-en" className="block text-sm font-medium text-slate-600 mb-1">{t('category_name_en')}</label>
                     <input 
                        id="new-cat-name-en"
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder={t('eg_tech_support')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                 <div className="flex-grow w-full">
                     <label htmlFor="new-cat-name-ar" className="block text-sm font-medium text-slate-600 mb-1">{t('category_name_ar')}</label>
                     <input 
                        id="new-cat-name-ar"
                        type="text"
                        value={newCategoryNameAr}
                        onChange={e => setNewCategoryNameAr(e.target.value)}
                        placeholder="مثال: الدعم الفني"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                        dir="rtl"
                    />
                </div>
                <button type="submit" className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 h-10">{t('add')}</button>
            </div>
        </form>

        <div className="mt-6 space-y-4">
            {categories.map(cat => (
                editingCategory?.id === cat.id 
                ? <CategoryEditForm 
                    key={cat.id} 
                    category={editingCategory} 
                    onSave={handleUpdateCategory}
                    onCancel={() => setEditingCategory(null)}
                    allCategories={categories}
                    addToast={addToast}
                  />
                : <CategoryCard 
                    key={cat.id} 
                    category={cat} 
                    onEdit={() => setEditingCategory({...cat})} 
                    onDelete={() => handleDeleteCategory(cat.id)}
                    onCopyLink={() => onCopyLink(cat.id)}
                    isCopied={copiedLinkId === cat.id}
                  />
            ))}
        </div>
    </div>
  );
};

export default ManageCategories;