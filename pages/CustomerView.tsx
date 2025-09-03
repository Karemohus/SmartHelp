

import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Faq, Ticket, Category, Promotion, SiteConfig, SubDepartment } from '../types';
import FaqItem from '../components/FaqItem';
import TicketForm from '../components/TicketForm';
import PromotionModal from '../components/PromotionModal';
import { useLanguage } from '../context/LanguageContext';

interface CustomerViewProps {
  faqs: Faq[];
  tickets: Ticket[];
  categories: Category[];
  subDepartments: SubDepartment[];
  promotions: Promotion[];
  siteConfig: SiteConfig;
  onTicketSubmit: (ticket: Ticket) => void;
  onFaqView: (id: number) => void;
  onFaqRate: (id: number, rating: 'satisfied' | 'dissatisfied') => void;
  onTicketRate: (ticketId: string, rating: 'satisfied' | 'dissatisfied') => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ faqs, tickets, categories, subDepartments, promotions, siteConfig, onTicketSubmit, onFaqView, onFaqRate, onTicketRate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState<'all' | string>('all');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);
  const location = useLocation();
  const { language, t } = useLanguage();

  const publicCategories = useMemo(() => categories.filter(c => c.isPublic), [categories]);
  const publicCategoryIds = useMemo(() => new Set(publicCategories.map(c => c.id)), [publicCategories]);

  useEffect(() => {
    if (siteConfig.promotionDisplayStrategy === 'show-always') {
      setIsPromotionDismissed(false);
    }
  }, [location.pathname, siteConfig.promotionDisplayStrategy]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubDepartment('all'); // Reset sub-department filter when main category changes
  };

  const handleTicketSubmit = (ticket: Ticket) => {
    onTicketSubmit(ticket);
    setSubmittedTicketId(ticket.id);
    window.scrollTo(0, document.body.scrollHeight);
  };
  
  const subDepartmentsForCategory = useMemo(() => {
    if (selectedCategory === 'all') return [];
    return subDepartments.filter(sd => sd.mainCategoryId === selectedCategory);
  }, [subDepartments, selectedCategory]);

  const filteredFaqs = useMemo(() => {
    const allPublicFaqs = faqs.filter(faq => publicCategoryIds.has(faq.categoryId));
    
    if (selectedCategory === 'all') {
      return allPublicFaqs;
    }
    
    const categoryFaqs = allPublicFaqs.filter(faq => faq.categoryId === selectedCategory);

    if (selectedSubDepartment === 'all') {
        return categoryFaqs;
    }
    
    return categoryFaqs.filter(faq => faq.subDepartmentId === selectedSubDepartment);
  }, [faqs, selectedCategory, selectedSubDepartment, publicCategoryIds]);

  const activePromotion = useMemo(() => {
    const now = new Date();
    return promotions.find(p => {
        if (!p.isActive || (p.audience !== 'all' && p.audience !== 'customer')) {
            return false;
        }
        
        const hasStartDate = !!p.startDate;
        const hasEndDate = !!p.endDate;

        if (!hasStartDate && !hasEndDate) {
            return true; // Active if no dates are set
        }

        const start = hasStartDate ? new Date(p.startDate as string) : null;
        const end = hasEndDate ? new Date(p.endDate as string) : null;

        if (end) {
            end.setHours(23, 59, 59, 999); // Make end date inclusive
        }

        const afterStart = start ? now >= start : true;
        const beforeEnd = end ? now <= end : true;

        return afterStart && beforeEnd;
    });
  }, [promotions]);
  
  const selectedCategoryName = useMemo(() => {
      const category = categories.find(c => c.id === selectedCategory);
      if (!category) return t('all_topics');
      return language === 'ar' ? category.name_ar : category.name;
  }, [categories, selectedCategory, language, t]);

  return (
    <>
      {!isPromotionDismissed && activePromotion && (
          <PromotionModal
              promotion={activePromotion}
              onDismiss={() => setIsPromotionDismissed(true)}
          />
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">{t('how_can_we_help')}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            {t('browse_knowledge_base')}
          </p>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <button
              onClick={() => handleSelectCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('all_topics')}
            </button>
            {publicCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {language === 'ar' ? category.name_ar : category.name}
              </button>
            ))}
          </div>
          
           {selectedCategory !== 'all' && subDepartmentsForCategory.length > 0 && (
             <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 mb-8 p-3 bg-slate-100 border border-slate-200 rounded-lg animate-fade-in">
                <button
                onClick={() => setSelectedSubDepartment('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedSubDepartment === 'all'
                    ? 'bg-slate-700 text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
                >
                {t('all')} {selectedCategoryName}
                </button>
                {subDepartmentsForCategory.map((subDept) => (
                <button
                    key={subDept.id}
                    onClick={() => setSelectedSubDepartment(subDept.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedSubDepartment === subDept.id
                        ? 'bg-slate-700 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                >
                    {language === 'ar' ? subDept.name_ar : subDept.name}
                </button>
                ))}
            </div>
          )}


          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-2 bg-white p-6 rounded-lg shadow-md border border-slate-200">
                {filteredFaqs.map(faq => (
                  <FaqItem key={faq.id} faq={faq} onView={onFaqView} onRate={onFaqRate} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border border-slate-200">
                  <h3 className="text-xl font-semibold text-slate-700">{t('no_faqs_found')}</h3>
                  <p className="text-slate-500 mt-2">{t('no_faqs_for_topic')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {submittedTicketId ? (
            <div className="mt-12 p-8 bg-green-50 rounded-lg shadow-lg border border-green-200 text-center animate-scale-in">
              <h3 className="text-2xl font-bold text-green-800 mb-2">{t('ticket_submitted_successfully')}</h3>
              <p className="text-green-700 mb-4">{t('ticket_received_shortly')}</p>
              <p className="text-slate-600">{t('your_reference_number_is')}</p>
              <p className="text-2xl font-mono bg-green-100 text-green-900 inline-block px-4 py-2 rounded-md mt-2">
                {submittedTicketId}
              </p>
            </div>
          ) : (
            <TicketForm allFaqs={faqs} allTickets={tickets} categories={categories} subDepartments={subDepartments} onTicketSubmit={handleTicketSubmit} onTicketRate={onTicketRate} />
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerView;