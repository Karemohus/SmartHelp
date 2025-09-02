

import React from 'react';
import { Attachment } from '../types';

const FileIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const AttachmentPreview: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
    const { type, dataUrl, name } = attachment;

    const renderPreview = () => {
        if (!dataUrl) {
            return (
                <div className="flex items-center gap-4 p-3 bg-slate-100 rounded-lg">
                    <FileIcon className="w-10 h-10 text-slate-600 flex-shrink-0" />
                    <div className="flex-grow min-w-0">
                        <p className="font-medium text-slate-800 truncate" title={name}>{name}</p>
                        <p className="text-sm text-red-500">Preview not available.</p>
                    </div>
                </div>
            );
        }

        if (type.startsWith('image/')) {
            return <img src={dataUrl} alt={name} className="max-w-full h-auto rounded-md object-contain max-h-96" />;
        }
        if (type.startsWith('video/')) {
            return <video src={dataUrl} className="max-w-full h-auto rounded-md" autoPlay loop muted playsInline />;
        }
        if (type.startsWith('audio/')) {
            return <audio controls src={dataUrl} className="w-full" />;
        }
        // Generic preview for other file types
        return (
            <div className="flex items-center gap-4 p-3 bg-slate-100 rounded-lg">
                <FileIcon className="w-10 h-10 text-slate-600 flex-shrink-0" />
                <div className="flex-grow min-w-0">
                    <p className="font-medium text-slate-800 truncate" title={name}>{name}</p>
                    <p className="text-sm text-slate-500">{type}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="my-2">
            <div className="mb-2">
                {renderPreview()}
            </div>
            {dataUrl && (
                <a href={dataUrl} download={name} className="inline-block text-sm text-blue-600 hover:underline">
                    Download "{name}"
                </a>
            )}
        </div>
    );
};

export default AttachmentPreview;