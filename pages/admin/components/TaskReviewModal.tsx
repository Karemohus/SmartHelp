
import React, { useState } from 'react';
import { Task, User } from '../../../types';
import AttachmentPreview from '../../../components/AttachmentPreview';
import CheckCircleIcon from '../../../components/icons/CheckCircleIcon';
import { useLanguage } from '../../../context/LanguageContext';


interface TaskReviewModalProps {
    task: Task;
    onClose: () => void;
    onApprove: (taskId: string) => void;
    onReject: (taskId: string, feedback: string) => void;
    loggedInUser: User;
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({ task, onClose, onApprove, onReject, loggedInUser }) => {
    const { t } = useLanguage();
    const [rejectionFeedback, setRejectionFeedback] = useState('');

    const handleReject = () => {
        if (!rejectionFeedback.trim()) {
            alert('Please provide feedback for rejection.');
            return;
        }
        onReject(task.id, rejectionFeedback);
    };

    const approveButtonText = 'Approve & Complete Task';
    const approveButtonClass = 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-slate-800">Review Task: {task.title}</h3>

                <div className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-slate-800">Submission Details</h4>
                    <div>
                        <p className="font-semibold text-sm text-slate-600">Notes:</p>
                        {task.supervisorNotes ? (
                           <p className="text-slate-800 whitespace-pre-wrap">{task.supervisorNotes}</p>
                        ) : (
                           <p className="text-slate-500 italic">No notes provided.</p>
                        )}
                    </div>
                    {task.supervisorAttachment && (
                        <div>
                            <p className="font-semibold text-sm text-slate-600">Attachment:</p>
                            <div className="mt-1 p-2 border rounded-md border-slate-200 bg-white">
                                <AttachmentPreview attachment={task.supervisorAttachment} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="rejection-feedback" className="block text-sm font-medium text-slate-700 mb-1">
                            Rejection Feedback (if needed)
                        </label>
                        <textarea
                            id="rejection-feedback"
                            value={rejectionFeedback}
                            onChange={e => setRejectionFeedback(e.target.value)}
                            rows={3}
                            className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="If rejecting, provide clear reasons and next steps here..."
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-4 flex-wrap">
                    <button
                        onClick={handleReject}
                        disabled={!rejectionFeedback.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed">
                        {t('reject')} & Re-assign
                    </button>
                    <button onClick={() => onApprove(task.id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${approveButtonClass}`}>
                         <CheckCircleIcon className="w-5 h-5"/>
                         {approveButtonText}
                    </button>
                    <button type="button" onClick={onClose} className="text-sm text-slate-600 hover:text-slate-800">{t('cancel')}</button>
                </div>
            </div>
        </div>
    );
};

export default TaskReviewModal;