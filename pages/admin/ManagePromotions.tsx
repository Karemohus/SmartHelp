
import React, { useState, useMemo } from 'react';
import { Promotion, Attachment, User, SiteConfig, ToastMessage } from '../../types';
import AttachmentInput from '../../components/AttachmentInput';
import AttachmentPreview from '../../components/AttachmentPreview';
import MegaphoneIcon from '../../components/icons/MegaphoneIcon';
import TrashIcon from '../../components/icons/TrashIcon';

interface ManagePromotionsProps {
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  addToast: (message: string, type: ToastMessage['type']) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  loggedInUser: User;
}

const ManagePromotions: React.FC<ManagePromotionsProps> = ({ promotions, setPromotions, addToast, siteConfig, setSiteConfig, requestConfirm, loggedInUser }) => {
    const [title, setTitle] = useState('');
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const [audience, setAudience] = useState<'customer' | 'supervisor' | 'employee' | 'all'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const handleCreatePromotion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !attachment) {
            addToast('Please provide a title and media for the promotion.', 'error');
            return;
        }

        const newPromotion: Promotion = {
            id: `PROMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            attachment,
            audience,
            isActive: true,
            createdAt: new Date().toISOString(),
            startDate: startDate || null,
            endDate: endDate || null,
            createdByUserId: loggedInUser.id,
        };
        
        setPromotions(prev => [newPromotion, ...prev]);
        addToast('Promotion created successfully!', 'success');

        setTitle('');
        setAttachment(null);
        setAudience('all');
        setStartDate('');
        setEndDate('');
    };

    const handleDeletePromotion = (id: string) => {
        requestConfirm(
            'Confirm Deletion',
            'Are you sure you want to delete this promotion?',
            () => {
                setPromotions(prev => prev.filter(p => p.id !== id));
                addToast('Promotion deleted.', 'success');
            },
            'Yes, Delete'
        );
    };
    
    const handleToggleActive = (id: string) => {
        setPromotions(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
        addToast('Promotion status updated.', 'info');
    };
    
    const handleStrategyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSiteConfig(prev => ({
            ...prev,
            promotionDisplayStrategy: e.target.value as 'show-once' | 'show-always'
        }));
    };
    
    const sortedPromotions = useMemo(() => {
        return [...promotions].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [promotions]);

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-slate-800">Create New Promotion</h3>
                <form onSubmit={handleCreatePromotion} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="promo-title" className="block text-sm font-medium text-slate-700 mb-1">Promotion Title</label>
                        <input id="promo-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Summer Sale" className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    
                    <AttachmentInput 
                        attachment={attachment}
                        setAttachment={setAttachment}
                        id="promo-attachment"
                        label="Promotion Media (Image or Video)"
                        accept="image/*,video/*"
                        maxSizeMB={25}
                    />
                    
                    {attachment && (
                        <div>
                            <p className="block text-sm font-medium text-slate-700 mb-1">Media Preview</p>
                            <div className="mt-2 p-2 bg-slate-50 border rounded-md inline-block max-w-sm">
                                <AttachmentPreview attachment={attachment} />
                            </div>
                        </div>
                     )}

                    <div>
                        <label htmlFor="promo-audience" className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                        <select id="promo-audience" value={audience} onChange={e => setAudience(e.target.value as any)} className="w-full border border-slate-300 rounded-md p-2 bg-white focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="all">All Users (Customers, Supervisors, Employees)</option>
                            <option value="customer">Customers Only</option>
                            <option value="supervisor">Supervisors Only</option>
                            <option value="employee">Employees Only</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="promo-start-date" className="block text-sm font-medium text-slate-700 mb-1">Start Date (Optional)</label>
                            <input id="promo-start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="promo-end-date" className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                            <input id="promo-end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Create Promotion</button>
                    </div>
                </form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Manage Promotions</h3>
                 
                 <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="text-slate-500 uppercase text-sm font-medium">Global Promotion Display Strategy</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-3">Control how promotional pop-ups are shown to customers.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center">
                            <input
                                id="promo-show-once"
                                name="promo-strategy"
                                type="radio"
                                value="show-once"
                                checked={siteConfig.promotionDisplayStrategy === 'show-once'}
                                onChange={handleStrategyChange}
                                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <label htmlFor="promo-show-once" className="ml-3 block text-sm font-medium text-slate-700">
                                Show Once Per Visit
                                <span className="block text-xs text-slate-500">Appears once and is dismissed until the next visit.</span>
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="promo-show-always"
                                name="promo-strategy"
                                type="radio"
                                value="show-always"
                                checked={siteConfig.promotionDisplayStrategy === 'show-always'}
                                onChange={handleStrategyChange}
                                className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            />
                            <label htmlFor="promo-show-always" className="ml-3 block text-sm font-medium text-slate-700">
                                Show On Every Page Load
                                <span className="block text-xs text-slate-500">Reappears on every page navigation.</span>
                            </label>
                        </div>
                    </div>
                </div>

                 <div className="mt-6 space-y-3">
                    {sortedPromotions.length > 0 ? sortedPromotions.map(promo => (
                        <div key={promo.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                     {promo.attachment && promo.attachment.type.startsWith('image/') ? (
                                        <img src={promo.attachment.dataUrl} alt={promo.title} className="w-full h-full object-cover" />
                                     ) : (
                                        <MegaphoneIcon className="w-8 h-8 text-slate-400"/>
                                     )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 truncate">{promo.title}</p>
                                    <p className="text-xs text-slate-500 capitalize">Audience: {promo.audience}</p>
                                    {(promo.startDate || promo.endDate) && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Active: {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '...'} - {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '...'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 self-end md:self-center">
                                <label htmlFor={`toggle-${promo.id}`} className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" id={`toggle-${promo.id}`} className="sr-only" checked={promo.isActive} onChange={() => handleToggleActive(promo.id)} />
                                        <div className={`block w-10 h-6 rounded-full transition ${promo.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${promo.isActive ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="ml-2 text-sm font-medium text-slate-600">{promo.isActive ? 'Active' : 'Inactive'}</div>
                                </label>
                                <button onClick={() => handleDeletePromotion(promo.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-100 transition-colors" aria-label="Delete promotion"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-slate-500 italic py-8">No promotions have been created yet.</p>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default ManagePromotions;
