
import React, { useMemo } from 'react';
import { Faq, Category, SubDepartment } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ManageFaqsProps {
  faqs: Faq[];
  categories: Category[];
  subDepartments: SubDepartment[];
  deleteFaq: (id: number) => void;
  onEditFaq: (faq: Faq) => void;
  onAddFaq: () => void;
  canAddFaq: boolean;
}

const ManageFaqs: React.FC<ManageFaqsProps> = ({ faqs, categories, subDepartments, deleteFaq, onEditFaq, onAddFaq, canAddFaq }) => {
  const { language, t } = useLanguage();

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, language === 'ar' ? c.name_ar : c.name])), [categories, language]);
  const subDeptMap = useMemo(() => new Map(subDepartments.map(sd => [sd.id, language === 'ar' ? sd.name_ar : sd.name])), [subDepartments, language]);
  
  const faqsByCategory = useMemo(() => {
    const sortedFaqs = [...faqs].sort((a, b) => (language === 'ar' ? a.question_ar : a.question).localeCompare(language === 'ar' ? b.question_ar : b.question));
    
    return sortedFaqs.reduce<Record<string, { name: string; faqs: Faq[] }>>((acc, faq) => {
        const categoryName = categoryMap.get(faq.categoryId) || 'Uncategorized';
        if (!acc[faq.categoryId]) {
            acc[faq.categoryId] = { name: categoryName, faqs: [] };
        }
        acc[faq.categoryId].faqs.push(faq);
        return acc;
    }, {});
  }, [faqs, categoryMap, language]);

  const sortedCategoryIds = Object.keys(faqsByCategory).sort((a, b) => faqsByCategory[a].name.localeCompare(faqsByCategory[b].name));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h3 className="text-xl font-bold text-slate-800">{t('manage_faqs')}</h3>
        {canAddFaq && (
          <button onClick={onAddFaq} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">{t('add_new_faq')}</button>
        )}
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-lg md:border-0">
        <table className="min-w-full divide-y divide-slate-200 responsive-table">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('question')}</th>
              <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t('sub_department')}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">{t('views')}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" title={t('satisfied')}>{t('satisfied_short')}</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider" title={t('dissatisfied')}>{t('dissatisfied_short')}</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
            </tr>
          </thead>
          <tbody className="bg-white md:divide-y md:divide-slate-200">
            {sortedCategoryIds.length > 0 ? (
                sortedCategoryIds.map(categoryId => (
                    <React.Fragment key={categoryId}>
                        <tr className="bg-slate-50 border-t border-b border-slate-200 hidden md:table-row">
                            <td colSpan={6} className="px-6 py-2 text-start text-sm font-semibold text-slate-800">
                                {faqsByCategory[categoryId].name}
                            </td>
                        </tr>
                        {faqsByCategory[categoryId].faqs.map((faq) => (
                          <tr key={faq.id}>
                            <td data-label={t('question')} className="px-6 py-4 max-w-md">
                                <p className="text-sm text-slate-900 truncate" title={language === 'ar' ? faq.question_ar : faq.question}>{language === 'ar' ? faq.question_ar : faq.question}</p>
                            </td>
                            <td data-label={t('sub_department')} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {subDeptMap.get(faq.subDepartmentId || '') || <span className="italic text-slate-400">{t('main_category')}</span>}
                            </td>
                            <td data-label={t('views')} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center">{faq.viewCount}</td>
                            <td data-label={t('satisfied_short')} className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-center">{faq.satisfaction}</td>
                            <td data-label={t('dissatisfied_short')} className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold text-center">{faq.dissatisfaction}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium space-x-4">
                              <button onClick={() => onEditFaq(faq)} className="text-blue-600 hover:text-blue-900">{t('edit')}</button>
                              <button onClick={() => deleteFaq(faq.id)} className="text-red-600 hover:text-red-900">{t('delete')}</button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                ))
            ) : (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500">
                        {t('no_faqs_created')}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFaqs;