import React, { useState, useRef } from 'react';
import { Faq } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import AttachmentPreview from './AttachmentPreview';
import { useLanguage } from '../context/LanguageContext';

interface FaqItemProps {
  faq: Faq;
  onView: (id: number) => void;
  onRate: (faqId: number, rating: 'satisfied' | 'dissatisfied') => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, onView, onRate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rated, setRated] = useState<'satisfied' | 'dissatisfied' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { language, t } = useLanguage();

  // A subtle, highly-compatible 'pop' sound using a WAV data URL to avoid loading issues.
  const popSound = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  
  const playSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(popSound);
      }
      audioRef.current.currentTime = 0;
      // play() returns a promise. We attach a no-op catch to prevent
      // unhandled promise rejection errors if the browser blocks playback.
      audioRef.current.play().catch(() => {});
    } catch (error) {
      // If any other error occurs (e.g., AudioContext not supported), fail silently.
      // This sound is non-essential UX flair.
    }
  };

  const toggleOpen = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      onView(faq.id);
      playSound();
    }
  };
  
  const handleRate = (rating: 'satisfied' | 'dissatisfied') => {
    if (rated) return;
    onRate(faq.id, rating);
    setRated(rating);
  };


  return (
    <div className="border-b border-slate-200">
      <button
        className="w-full flex justify-between items-center text-start py-4 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        onClick={toggleOpen}
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-slate-800">{language === 'ar' ? faq.question_ar : faq.question}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="prose prose-slate max-w-none text-slate-600 p-4 pt-0">
            <p className="mt-0 leading-relaxed">
              {language === 'ar' ? faq.answer_ar : faq.answer}
            </p>
            {faq.attachment && <AttachmentPreview attachment={faq.attachment} />}
          </div>
          <div className="px-4 pb-4">
              {!rated ? (
                 <div className="flex items-center gap-4 mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">{t('was_this_answer_helpful')}</p>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleRate('satisfied')} 
                            className="flex items-center justify-center w-10 h-10 text-xl bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                            aria-label={t('satisfied')}
                            title={t('satisfied')}
                        >
                            👍
                        </button>
                         <button 
                            onClick={() => handleRate('dissatisfied')} 
                            className="flex items-center justify-center w-10 h-10 text-xl bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                            aria-label={t('dissatisfied')}
                            title={t('dissatisfied')}
                        >
                            👎
                        </button>
                    </div>
                 </div>
              ) : (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium text-center animate-fade-in">
                    {t('thank_you_for_feedback')}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;