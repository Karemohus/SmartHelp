
import React, { useMemo, useState } from 'react';
import { Faq, Ticket, Category, Task, Promotion, User, UserRole, AdminTab } from '../../types';
import PromotionModal from '../../components/PromotionModal';

interface AnalyticsOverviewProps {
  faqs: Faq[];
  tickets: Ticket[];
  categories: Category[];
  tasks: Task[];
  promotions: Promotion[];
  users: User[];
  loggedInUser: User;
  canViewAllDashboards: boolean;
  onCreateFaqFromSuggestion: (subject: string, categoryId: string) => void;
  onEditEmployeePermissions: (employee: User) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onNavigateToTab: (tab: AdminTab) => void;
}

const FaqOpportunities: React.FC<{
    tickets: Ticket[];
    faqs: Faq[];
    categories: Category[];
    onCreateFaq: (subject: string, categoryId: string) => void;
}> = ({ tickets, faqs, categories, onCreateFaq }) => {

    const opportunities = useMemo(() => {
        const faqQuestions = new Set(faqs.map(f => f.question.trim().toLowerCase()));
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));

        const ticketSubjects = tickets.reduce<Record<string, { count: number; categoryId: string; originalCasing: string }>>((acc, ticket) => {
            const subjectLower = ticket.subject.trim().toLowerCase();
            if (!subjectLower || faqQuestions.has(subjectLower)) {
                return acc; // Skip empty subjects or those that already exist as FAQs
            }
            
            if (!acc[subjectLower]) {
                acc[subjectLower] = { count: 0, categoryId: ticket.categoryId, originalCasing: ticket.subject.trim() };
            }
            acc[subjectLower].count++;
            return acc;
        }, {});

        return Object.values(ticketSubjects)
            .filter(data => data.count > 1) // Only show if asked more than once
            .map(data => ({
                ...data,
                categoryName: categoryMap.get(data.categoryId) || 'Unknown'
            }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5); // Show top 5 opportunities

    }, [tickets, faqs, categories]);

    if (opportunities.length === 0) {
        return null;
    }

    return (
        <div>
            <h4 className="font-semibold text-slate-700 mb-3">Improvement Opportunities</h4>
            <p className="text-xs text-slate-500 mb-4">The following topics are frequently asked about in tickets but are not in your FAQ. Consider adding them.</p>
            <ul className="space-y-2">
                {opportunities.map(opp => (
                    <li key={opp.originalCasing} className="text-sm flex justify-between items-center bg-yellow-50 p-3 rounded-md border border-yellow-200 hover:bg-yellow-100 transition-colors">
                        <div className="flex-1 min-w-0">
                            <p className="text-yellow-900 font-medium truncate" title={opp.originalCasing}>{opp.originalCasing}</p>
                            <p className="text-xs text-yellow-700">{opp.categoryName} &middot; Asked {opp.count} times</p>
                        </div>
                        <button 
                            onClick={() => onCreateFaq(opp.originalCasing, opp.categoryId)}
                            className="ml-4 flex-shrink-0 text-blue-700 hover:text-blue-900 font-medium text-xs px-3 py-1 border border-blue-300 rounded-full hover:bg-blue-100 transition-colors"
                            aria-label={`Create FAQ for: ${opp.originalCasing}`}
                        >
                            Create FAQ
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ faqs, tickets, categories, tasks, promotions, users, loggedInUser, canViewAllDashboards, onCreateFaqFromSuggestion, onEditEmployeePermissions, onDeleteEmployee, onNavigateToTab }) => {
    const { 
      totalViews,
      openTicketsCount,
      answeredPendingClosureCount,
      categoryViews,
      topFaqs,
      faqSatisfactionRate,
    } = useMemo(() => {
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));
        const totalViews = faqs.reduce((sum, faq) => sum + faq.viewCount, 0);
        
        const openTicketsCount = tickets.filter(t => t.status === 'New' || t.status === 'Seen').length;
        const answeredPendingClosureCount = tickets.filter(t => t.status === 'Answered').length;

        const categoryViewsData = faqs.reduce<Record<string, number>>((acc, faq) => {
            const categoryName = categoryMap.get(faq.categoryId) || 'Uncategorized';
            acc[categoryName] = (acc[categoryName] || 0) + faq.viewCount;
            return acc;
        }, {});
        
        const sortedCategoryViews = Object.entries(categoryViewsData).sort(([,a],[,b]) => b - a);
        
        const topFaqs = [...faqs].map(faq => ({...faq, categoryName: categoryMap.get(faq.categoryId) || ''}))
            .sort((a,b) => b.viewCount - a.viewCount)
            .slice(0, 5);

        // Satisfaction calculations
        const totalSatisfiedFaqs = faqs.reduce((sum, faq) => sum + faq.satisfaction, 0);
        const totalDissatisfiedFaqs = faqs.reduce((sum, faq) => sum + faq.dissatisfaction, 0);
        const totalFaqRatings = totalSatisfiedFaqs + totalDissatisfiedFaqs;
        const faqSatisfactionRate = totalFaqRatings > 0 ? (totalSatisfiedFaqs / totalFaqRatings) * 100 : null;

        return { 
            totalViews, 
            openTicketsCount, 
            answeredPendingClosureCount,
            categoryViews: sortedCategoryViews, 
            topFaqs,
            faqSatisfactionRate,
        };
    }, [faqs, tickets, categories]);

    const activePromotionForUser = useMemo(() => {
        // Admin role doesn't get these pop-up promotions
        if (loggedInUser.role === UserRole.Admin) return null;
        
        const now = new Date();

        return promotions.find(p => {
            if (!p.isActive) return false;

            // Audience check
            let isAudienceMatch = false;
            if (p.audience === 'all') {
                isAudienceMatch = true;
            } else if (loggedInUser.role === UserRole.Supervisor && p.audience === 'supervisor') {
                isAudienceMatch = true;
            } else if (loggedInUser.role === UserRole.Employee && p.audience === 'employee') {
                isAudienceMatch = true;
            }
            
            if (!isAudienceMatch) return false;

            // Date range check
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
    }, [promotions, loggedInUser]);
    
    const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);


    const maxCategoryView = categoryViews.length > 0 ? categoryViews[0][1] : 0;

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-8">
            <h3 className="text-xl font-bold text-slate-800">Analytics & Insights</h3>
            
            {activePromotionForUser && !isPromotionDismissed && (
                <div className="!my-4">
                     <PromotionModal promotion={activePromotionForUser} onDismiss={() => setIsPromotionDismissed(true)} />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-slate-500 text-sm font-medium">FAQ Satisfaction</h4>
                    <p className={`text-3xl font-bold mt-1 ${faqSatisfactionRate === null ? 'text-slate-400' : 'text-green-600'}`}>
                        {faqSatisfactionRate !== null ? `${faqSatisfactionRate.toFixed(0)}%` : 'N/A'}
                    </p>
                </div>
                <button
                    onClick={() => onNavigateToTab('tickets')}
                    className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                    aria-label={`View ${openTicketsCount} pending tickets`}
                >
                    <h4 className="text-slate-500 text-sm font-medium">Pending Tickets</h4>
                    <p className="text-3xl font-bold mt-1 text-blue-600">{openTicketsCount}</p>
                </button>
                 { (loggedInUser.role === UserRole.Admin || loggedInUser.role === UserRole.Supervisor) && (
                    <button
                        onClick={() => onNavigateToTab('tickets')}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left hover:bg-amber-50 hover:border-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                        aria-label={`View ${answeredPendingClosureCount} answered tickets pending closure`}
                    >
                        <h4 className="text-slate-500 text-sm font-medium">Answered (Pending Closure)</h4>
                        <p className="text-3xl font-bold mt-1 text-amber-600">{answeredPendingClosureCount}</p>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Category Performance by Views</h4>
                    <div className="space-y-3">
                        {categoryViews.length > 0 ? categoryViews.map(([category, views]) => (
                            <div key={category} className="group">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium text-slate-600">{category}</span>
                                    <span className="font-semibold text-slate-800">{views.toLocaleString()} views</span>
                                </div>
                                <div className="bg-slate-200 rounded-full h-2.5 w-full overflow-hidden">
                                    <div 
                                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${maxCategoryView > 0 ? (views / maxCategoryView) * 100 : 0}%` }}
                                        title={`${views} views`}
                                    />
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 italic">No view data available yet.</p>}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-slate-700">Top Performing FAQs</h4>
                    </div>
                    <ul className="space-y-2">
                       {topFaqs.length > 0 ? topFaqs.map(faq => (
                          <li key={faq.id} className="text-sm flex justify-between items-center bg-slate-50 p-3 rounded-md">
                                <div className="min-w-0">
                                  <p className="text-slate-800 font-medium truncate" title={faq.question}>{faq.question}</p>
                                  <p className="text-xs text-slate-500">{faq.categoryName}</p>
                                </div>
                                <span className="font-bold text-slate-800 flex-shrink-0 ml-4">{faq.viewCount.toLocaleString()}</span>
                            </li>
                       )) : <p className="text-sm text-slate-500 italic">No FAQs viewed yet.</p>}
                    </ul>
                </div>
            </div>
            
            {(canViewAllDashboards) && (
                 <FaqOpportunities tickets={tickets} faqs={faqs} categories={categories} onCreateFaq={onCreateFaqFromSuggestion} />
            )}
        </div>
    );
};

export default AnalyticsOverview;
