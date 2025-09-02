
import React, { useState } from 'react';
import { VehicleLicense, Attachment } from '../../../types';
import AttachmentInput from '../../../components/AttachmentInput';

interface LicenseEditModalProps {
    licenseToEdit: VehicleLicense;
    onClose: () => void;
    onSave: (license: VehicleLicense) => void;
}

const LicenseEditModal: React.FC<LicenseEditModalProps> = ({ licenseToEdit, onClose, onSave }) => {
    const [licenseNumber, setLicenseNumber] = useState(licenseToEdit.licenseNumber);
    const [issueDate, setIssueDate] = useState(licenseToEdit.issueDate.split('T')[0]);
    const [expiryDate, setExpiryDate] = useState(licenseToEdit.expiryDate.split('T')[0]);
    const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(licenseToEdit.insurancePolicyNumber || '');
    const [insuranceExpiryDate, setInsuranceExpiryDate] = useState(licenseToEdit.insuranceExpiryDate?.split('T')[0] || '');
    const [attachment, setAttachment] = useState<Attachment | null>(licenseToEdit.attachment || null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedLicense: VehicleLicense = {
            ...licenseToEdit,
            licenseNumber,
            issueDate: new Date(issueDate).toISOString(),
            expiryDate: new Date(expiryDate).toISOString(),
            insurancePolicyNumber: insurancePolicyNumber || undefined,
            insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate).toISOString() : undefined,
            attachment: attachment
        };
        onSave(updatedLicense);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-slate-800">Edit License Details</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="lic-num" className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                        <input id="lic-num" type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="lic-issue" className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                            <input id="lic-issue" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="lic-expiry" className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <input id="lic-expiry" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="ins-poly" className="block text-sm font-medium text-slate-700 mb-1">Insurance Policy # (Optional)</label>
                            <input id="ins-poly" type="text" value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="ins-expiry" className="block text-sm font-medium text-slate-700 mb-1">Insurance Expiry Date (Optional)</label>
                            <input id="ins-expiry" type="date" value={insuranceExpiryDate} onChange={e => setInsuranceExpiryDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                    <AttachmentInput attachment={attachment} setAttachment={setAttachment} id="license-attachment-input" label="License Attachment (Optional)" />
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default LicenseEditModal;
