
import React, { useState } from 'react';
import { Task, Attachment } from '../../../types';
import AttachmentInput from '../../../components/AttachmentInput';
import AttachmentPreview from '../../../components/AttachmentPreview';
import CheckCircleIcon from '../../../components/icons/CheckCircleIcon';
import { useLanguage } from '../../../context/LanguageContext';

interface SupervisorTaskModalProps {
    task: Task;
    onClose: () => void;
    onConfirm: (taskId: string, notes: string, attachment: Attachment | null) => void;
}

const SupervisorTaskModal: React.FC<SupervisorTaskModalProps> = ({ task, onClose, onConfirm }) => {
    const { t } = useLanguage();
    const [notes, setNotes] = useState(task.supervisorNotes || '');
    const [supervisorAttachment, setSupervisorAttachment] = useState<Attachment | null>(task.supervisorAttachment || null);

    const handleConfirm = () => {
        onConfirm(task.id, notes, supervisorAttachment);
    };

    const isSubmitDisabled = !notes.trim();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-slate-800">Submit Task for Review: {task.title}</h3>
                
                <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                        <p className="font-semibold text-sm text-slate-600">{t('description')}:</p>
                        <p className="text-slate-800 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                    </div>
                    {task.adminAttachment && (
                        <div>
                            <p className="font-semibold text-sm text-slate-600">{t('admins_attachment')}:</p>
                            <div className="mt-1 p-2 border rounded-md border-slate-200 bg-white">
                                <AttachmentPreview attachment={task.adminAttachment} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="supervisor-notes" className="block text-sm font-medium text-slate-700 mb-1">
                            Completion Notes <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="supervisor-notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any comments or details about the task completion..."
                            required
                        />
                    </div>
                    <AttachmentInput
                        attachment={supervisorAttachment}
                        setAttachment={setSupervisorAttachment}
                        id="supervisor-task-attachment"
                        label="Add Attachment (Optional)"
                    />
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300 transition-colors">{t('cancel')}</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={isSubmitDisabled}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                         <CheckCircleIcon className="w-5 h-5"/>
                         Submit for Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupervisorTaskModal;