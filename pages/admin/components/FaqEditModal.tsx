
import React, { useState, useEffect, useMemo } from 'react';
import { Faq, Category, Attachment, SubDepartment } from '../../../types';
import AttachmentInput from '../../../components/AttachmentInput';

interface FaqEditModalProps {
    faqToEdit: Faq | null;
    categories: Category[];
    subDepartments: SubDepartment[];
    onClose: () => void;
    onSave: (faqData: Faq) => void;
}

const FaqEditModal: React.FC<FaqEditModalProps> = ({ faqToEdit, categories, subDepartments, onClose, onSave }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [subDepartmentId, setSubDepartmentId] = useState<string | null>(null);
    const [attachment, setAttachment] = useState<Attachment | null>(null);

    const subDepartmentsForCategory = useMemo(() => {
        if (!categoryId) return [];
        return subDepartments.filter(sd => sd.mainCategoryId === categoryId);
    }, [categoryId, subDepartments]);
    
    useEffect(() => {
        if (faqToEdit) {
            setQuestion(faqToEdit.question);
            setAnswer(faqToEdit.answer);
            setCategoryId(faqToEdit.categoryId);
            setSubDepartmentId(faqToEdit.subDepartmentId || null);
            setAttachment(faqToEdit.attachment || null);
        } else {
            // Reset for new FAQ, default to first available category
            setQuestion('');
            setAnswer('');
            const firstCatId = categories[0]?.id || '';
            setCategoryId(firstCatId);
            setSubDepartmentId(null);
            setAttachment(null);
        }
    }, [faqToEdit, categories]);

    useEffect(() => {
        // When category changes, reset sub-department if it's no longer valid
        if (!subDepartmentsForCategory.some(sd => sd.id === subDepartmentId)) {
            setSubDepartmentId(null);
        }
    }, [categoryId, subDepartmentsForCategory, subDepartmentId]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question || !answer || !categoryId) {
            alert("Please fill all fields.");
            return;
        }

        const savedFaq: Faq = {
            // this is partial, will be completed in the parent component
            ...faqToEdit,
            id: faqToEdit ? faqToEdit.id : Date.now(),
            question,
            answer,
            categoryId,
            subDepartmentId,
            attachment,
            createdAt: faqToEdit ? faqToEdit.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: faqToEdit ? faqToEdit.viewCount : 0,
            satisfaction: faqToEdit ? faqToEdit.satisfaction : 0,
            dissatisfaction: faqToEdit ? faqToEdit.dissatisfaction : 0,
        } as Faq;
        onSave(savedFaq);
    };

    const modalTitle = faqToEdit && faqToEdit.answer ? 'Edit FAQ' : 'Add New FAQ';
    const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || "Category";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h3 className="text-xl font-bold mb-6 text-slate-800">{modalTitle}</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="faq-question" className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                            <input
                                id="faq-question"
                                type="text"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="faq-answer" className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
                            <textarea
                                id="faq-answer"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                rows={4}
                                className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                placeholder="Provide a detailed answer to the question."
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="faq-category-modal" className="block text-sm font-medium text-slate-700 mb-1">Main Category</label>
                                <select
                                    id="faq-category-modal"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                >
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="faq-subdepartment-modal" className="block text-sm font-medium text-slate-700 mb-1">Sub-department (Optional)</label>
                                <select
                                    id="faq-subdepartment-modal"
                                    value={subDepartmentId || ''}
                                    onChange={e => setSubDepartmentId(e.target.value || null)}
                                    className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-slate-50"
                                    disabled={subDepartmentsForCategory.length === 0}
                                >
                                    <option value="">All of {selectedCategoryName}</option>
                                    {subDepartmentsForCategory.map(sd => (
                                        <option key={sd.id} value={sd.id}>{sd.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <AttachmentInput attachment={attachment} setAttachment={setAttachment} id="faq-attachment-input" />
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors">Cancel</button>
                        <button type="submit" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FaqEditModal;
