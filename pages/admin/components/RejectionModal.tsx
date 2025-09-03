
import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';

interface RejectionModalProps {
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4 text-slate-800">Reason for Rejection</h3>
                    <p className="text-sm text-slate-600 mb-4">Please provide a reason for rejecting this employee request. This will be visible to the supervisor.</p>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Position no longer available."
                        required
                    />
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">{t('reject')} Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RejectionModal;