import React from 'react';
import { Promotion } from '../types';

interface PromotionModalProps {
    promotion: Promotion;
    onDismiss: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onDismiss }) => {
    const isVideo = promotion.attachment.type.startsWith('video/');

    // Prevent background scroll when modal is open
    React.useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onDismiss}
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-title"
        >
            <div
                className="relative animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {isVideo ? (
                    <video
                        src={promotion.attachment.dataUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                        aria-label={promotion.title}
                    />
                ) : (
                    <img
                        id="promotion-title"
                        src={promotion.attachment.dataUrl}
                        alt={promotion.title}
                        className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                    />
                )}
                 <button
                    type="button"
                    className="absolute -top-3 -right-3 p-1.5 bg-slate-800 rounded-full text-white hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white"
                    onClick={onDismiss}
                    aria-label="Dismiss promotion"
                >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default PromotionModal;