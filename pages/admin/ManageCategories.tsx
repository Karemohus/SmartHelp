

import React, { useState } from 'react';
import { Category, Faq, Ticket, Task, User, ToastMessage, SubDepartment } from '../../types';
import LinkIcon from '../../components/icons/LinkIcon';
import EyeIcon from '../../components/icons/EyeIcon';
import LockClosedIcon from '../../components/icons/LockClosedIcon';

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

const CategoryCard: React.FC<{ category: Category; onEdit: () => void; onDelete: () => void; onCopyLink: () => void; isCopied: boolean; }> = ({ category, onEdit, onDelete, onCopyLink, isCopied }) => (
    <div className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors flex-wrap gap-2">
        <div className="flex items-center gap-3">
            <div className="min-w-0">
                <p className="font-bold text-slate-800">{category.name}</p>
                 {category.isPublic ? (
                    <span className="mt-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                        <EyeIcon className="w-3 h-3" /> Public
                    </span>
                ) : (
                     <span className="mt-1 text-xs text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 w-fit">
                        <LockClosedIcon className="w-3 h-3" /> Private
                    </span>
                )}
            </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
            <button onClick={onCopyLink} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isCopied ? 'text-green-600' : 'text-slate-600 hover:text-blue-700'}`}>
                <LinkIcon className="w-4 h-4" />
                {isCopied ? 'Link Copied!' : 'Share Link'}
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
            <button onClick={onDelete} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
        </div>
    </div>
);

const CategoryEditForm: React.FC<{ category: Category; onSave: (cat: Category) => void; onCancel: () => void; allCategories: Category[]; addToast: (message: string, type: ToastMessage['type']) => void; }> = ({ category, onSave, onCancel, allCategories, addToast }) => {
    const [editedCategory, setEditedCategory] = useState<Category>(category);

    const handleSave = () => {
        if (allCategories.some(c => c.id !== editedCategory.id && c.name.toLowerCase() === editedCategory.name.toLowerCase())) {
            addToast('A category with this name already exists.', 'error');
            return;
        }
        if (editedCategory.slug && allCategories.some(c => c.id !== editedCategory.id && c.slug === editedCategory.slug)) {
            addToast('This custom link (slug) is already in use by another category.', 'error');
            return;
        }
        onSave(editedCategory);
    };

    return (
        <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50 space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input type="text" value={editedCategory.name} onChange={e => setEditedCategory({...editedCategory, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-md" />
            </div>
            <div>
                <label htmlFor={`slug-${category.id}`} className="block text-sm font-medium text-slate-700 mb-1">Custom Share Link</label>
                 <div className="flex items-center">
                    <span className="text-sm text-slate-500 bg-slate-200 px-3 py-2 rounded-l-md border border-r-0 border-slate-300 whitespace-nowrap">.../#/category/</span>
                    <input
                        id={`slug-${category.id}`}
                        type="text"
                        value={editedCategory.slug || ''}
                        onChange={e => {
                            const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                            setEditedCategory({...editedCategory, slug: newSlug });
                        }}
                        className="w-full p-2 border border-slate-300 rounded-r-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., shipping-info"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional, URL-friendly identifier. Use letters, numbers, and hyphens only.</p>
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
              <div className="ml-3 text-sm">
                <label htmlFor={`isPublic-${category.id}`} className="font-medium text-gray-700">Publicly Visible</label>
                <p className="text-xs text-gray-500">If checked, this category will appear on the main customer page. If unchecked, it's private and only accessible via direct link.</p>
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">General Category Context (for AI Assistant)</label>
                <textarea
                    value={editedCategory.generalContext || ''}
                    onChange={e => setEditedCategory({...editedCategory, generalContext: e.target.value})}
                    rows={3}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    placeholder="Provide general information about this category for the AI to use when suggesting answers to customers. e.g., 'We ship via FedEx and DHL. Standard shipping takes 5-7 days.'"
                />
            </div>
            <div className="flex items-center gap-3 mt-4 justify-end">
                <button onClick={onCancel} className="text-slate-600 hover:text-slate-800 font-medium text-sm">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save Changes</button>
            </div>
        </div>
    );
};


const ManageCategories: React.FC<ManageCategoriesProps> = ({ categories, setCategories, faqs, tickets, tasks, users, subDepartments, onCopyLink, copiedLinkId, addToast, requestConfirm }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
        addToast('Category name cannot be empty.', 'error');
        return;
    }
    if (categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        addToast('Category name already exists.', 'error');
        return;
    }
    const newId = trimmedName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]+/g, '');
    const newSlug = trimmedName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '');

    if (categories.some(c => c.id === newId || (newSlug && c.slug === newSlug))) {
        addToast('A category with a similar name (generating a duplicate ID or link) already exists.', 'error');
        return;
    }

    const newCategory: Category = {
        id: newId,
        name: trimmedName,
        isPublic: true, // Default new categories to public
        slug: newSlug,
        generalContext: ''
    };
    setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    addToast('Category added successfully.', 'success');
    setNewCategoryName('');
  };
  
  const handleUpdateCategory = (updatedCategory: Category) => {
    if (!updatedCategory.name.trim()) {
        addToast("Category name cannot be empty.", 'error');
        return;
    }
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
    addToast('Category updated successfully.', 'success');
    setEditingCategory(null);
  };
  
  const handleDeleteCategory = (categoryId: string) => {
      const isUsedByFaq = faqs.some(f => f.categoryId === categoryId);
      const isUsedByTicket = tickets.some(t => t.categoryId === categoryId);
      const isUsedByTask = tasks.some(t => t.assignedCategoryId === categoryId);
      const isUsedByUser = users.some(u => u.assignedCategoryIds?.includes(categoryId));
      const isUsedBySubDepartment = subDepartments.some(sd => sd.mainCategoryId === categoryId);

      if (isUsedByFaq || isUsedByTicket || isUsedByTask || isUsedByUser || isUsedBySubDepartment) {
          window.alert("Cannot delete this category because it is currently in use by FAQs, tickets, tasks, supervisors, or sub-departments. Please remove these associations first.");
          return;
      }
      
      requestConfirm(
        'Confirm Category Deletion',
        'Are you sure you want to delete this category? This action cannot be undone.',
        () => {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
            addToast('Category deleted successfully.', 'success');
        },
        'Yes, Delete'
      );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-slate-800">Manage Categories</h3>
        
        <form onSubmit={handleAddCategory} className="mt-4 p-4 border border-slate-200 rounded-lg">
             <h4 className="font-semibold text-slate-700 mb-2">Add New Category</h4>
            <div className="flex gap-2 items-end">
                <div className="flex-grow">
                     <label htmlFor="new-cat-name" className="block text-sm font-medium text-slate-600 mb-1">Category Name</label>
                     <input 
                        id="new-cat-name"
                        type="text"
                        value={newCategoryName}
                        onChange={e => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Technical Support"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 h-10">Add</button>
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