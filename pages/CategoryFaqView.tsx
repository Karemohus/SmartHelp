import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Faq, Category } from '../types';
import FaqItem from '../components/FaqItem';

interface CategoryFaqViewProps {
  faqs: Faq[];
  categories: Category[];
  onFaqView: (id: number) => void;
  onFaqRate: (id: number, rating: 'satisfied' | 'dissatisfied') => void;
}

const CategoryFaqView: React.FC<CategoryFaqViewProps> = ({ faqs, categories, onFaqView, onFaqRate }) => {
  const { categoryId: identifier } = useParams<{ categoryId: string }>();

  const category = useMemo(() => {
    if (!identifier) return undefined;
    return categories.find(c => c.slug === identifier || c.id === identifier);
  }, [categories, identifier]);

  const filteredFaqs = useMemo(() => {
    if (!category) return [];
    return faqs.filter(faq => faq.categoryId === category.id);
  }, [faqs, category]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 text-center">
        <h1 className="text-4xl font-bold text-slate-800">Category Not Found</h1>
        <p className="mt-4 text-slate-600">The category you are looking for does not exist or you may not have permission to view it.</p>
        <Link to="/" className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">{category.name}</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Frequently asked questions for the {category.name} category.
        </p>
      </div>

      <div className="mt-12 max-w-4xl mx-auto">
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2 bg-white p-6 rounded-lg shadow-md border border-slate-200">
              {filteredFaqs.map(faq => (
                <FaqItem key={faq.id} faq={faq} onView={onFaqView} onRate={onFaqRate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700">No FAQs Found</h3>
                <p className="text-slate-500 mt-2">There are currently no FAQs in the {category.name} category.</p>
            </div>
          )}
        <div className="text-center mt-8">
            <Link to="/" className="text-blue-600 hover:underline">
                &larr; Back to all FAQs
            </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryFaqView;