
import React, { useRef } from 'react';
import { Attachment } from '../types';
import XCircleIcon from './icons/XCircleIcon';

interface FileUploaderProps {
  attachment: Attachment | null;
  setAttachment: (attachment: Attachment | null) => void;
  id: string;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
}

const AttachmentInput: React.FC<FileUploaderProps> = ({ attachment, setAttachment, id, maxSizeMB = 15, accept = "*", label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const computedLabel = label || `Attachment (Optional, max ${maxSizeMB}MB)`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side validation for file type
      if (accept === "image/*" && !file.type.startsWith("image/")) {
          alert("Invalid file type. Please select an image file (e.g., PNG, JPG, SVG).");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
      }
      
      // Client-side validation for file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Please upload files smaller than ${maxSizeMB}MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setAttachment({
          name: file.name,
          type: file.type,
          dataUrl: loadEvent.target?.result as string,
        });
      };
      reader.onerror = () => {
        alert("There was an error reading the file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
            {computedLabel}
        </label>
        {!attachment ? (
            <input
                id={id}
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        ) : (
            <div className="mt-2 flex items-center justify-between p-2 bg-slate-100 rounded-md border border-slate-200">
                <span className="text-sm text-slate-800 truncate pr-2">{attachment.name}</span>
                <button
                    type="button"
                    onClick={removeAttachment}
                    className="text-slate-500 hover:text-red-600 flex-shrink-0"
                    aria-label="Remove attachment"
                >
                   <XCircleIcon className="w-5 h-5"/>
                </button>
            </div>
        )}
    </div>
  );
};

export default AttachmentInput;
