

import React, { useState, useMemo, useCallback } from 'react';
import { User, Ticket, Task, Faq, Promotion, EmployeeRequest, Category, UserRole, ActivityLogItem } from '../../types';
import SearchIcon from '../../components/icons/SearchIcon';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import TicketIcon from '../../components/icons/TicketIcon';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import ClipboardListIcon from '../../components/icons/ClipboardListIcon';
import MegaphoneIcon from '../../components/icons/MegaphoneIcon';
import UserPlusIcon from '../../components/icons/UserPlusIcon';
import ThumbUpIcon from '../../components/icons/ThumbUpIcon';
import ThumbDownIcon from '../../components/icons/ThumbDownIcon';
import { formatDuration } from './utils';

interface UserActivityReportProps {
    users: User[];
    tickets: Ticket[];
    tasks: Task[];
    faqs: Faq[];
    promotions: Promotion[];
    employeeRequests: EmployeeRequest[];
    categories: Category[];
}

const UserPerformanceTable: React.FC<{ users: User[], tickets: Ticket[] }> = ({ users, tickets }) => {
    const performanceData = useMemo(() => {
        const userStats: Record<string, { username: string, role: UserRole, answered: number, satisfied: number, dissatisfied: number }> = {};

        for (const user of users) {
             userStats[user.id] = { username: user.username, role: user.role, answered: 0, satisfied: 0, dissatisfied: 0 };
        }

        for (const ticket of tickets) {
            if (ticket.answeredByUserId) {
                const userId = ticket.answeredByUserId;
                if (userStats[userId]) {
                    userStats[userId].answered++;
                    if (ticket.customerRating === 'satisfied') {
                        userStats[userId].satisfied++;
                    } else if (ticket.customerRating === 'dissatisfied') {
                        userStats[userId].dissatisfied++;
                    }
                }
            }
        }
        
        return Object.values(userStats)
            .filter(stats => stats.answered > 0)
            .map(stats => {
                const totalRatings = stats.satisfied + stats.dissatisfied;
                const satisfactionRate = totalRatings > 0 ? (stats.satisfied / totalRatings) * 100 : 0;
                return { ...stats, satisfactionRate };
            })
            .sort((a,b) => b.answered - a.answered);

    }, [users, tickets]);

    if (performanceData.length === 0) {
        return <p className="text-center py-8 text-slate-500 italic">No ticket performance data available yet.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full responsive-table">
                <thead className="bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Answered</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Satisfied 👍</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Dissatisfied 👎</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Satisfaction Rate</th>
                    </tr>
                </thead>
                <tbody className="bg-white md:divide-y md:divide-slate-200">
                    {performanceData.map(stat => (
                        <tr key={stat.username}>
                            <td data-label="User" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{stat.username}</td>
                            <td data-label="Role" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{stat.role}</td>
                            <td data-label="Answered" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-center font-semibold">{stat.answered}</td>
                            <td data-label="Satisfied 👍" className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-semibold">{stat.satisfied}</td>
                            <td data-label="Dissatisfied 👎" className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-center font-semibold">{stat.dissatisfied}</td>
                            <td data-label="Satisfaction Rate" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div 
                                            className={`${stat.satisfactionRate >= 75 ? 'bg-green-500' : stat.satisfactionRate >= 50 ? 'bg-yellow-400' : 'bg-red-500'} h-2.5 rounded-full`} 
                                            style={{width: `${stat.satisfactionRate}%`}}
                                        ></div>
                                    </div>
                                    <span className="font-semibold text-slate-700 w-12 text-right">{stat.satisfactionRate.toFixed(0)}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ActivitySection: React.FC<{
    title: string;
    icon: React.ReactNode;
    items: any[];
    columns: { header: string; accessor: (item: any) => React.ReactNode; className?: string }[];
    emptyMessage: string;
}> = ({ title, icon, items, columns, emptyMessage }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="border border-slate-200 rounded-lg">
            <button
                className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-t-lg"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h4 className="font-bold text-slate-800">{title}</h4>
                    <span className="text-sm font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">{items.length}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-0 md:p-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full responsive-table">
                            <thead className="border-b border-slate-200">
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.header} scope="col" className={`px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='md:divide-y md:divide-slate-200'>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        {columns.map(col => (
                                            <td key={col.header} data-label={col.header} className={`px-4 py-3 text-sm text-slate-600 align-top ${col.className || ''}`}>
                                                {col.accessor(item)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};


const UserActivityReport: React.FC<UserActivityReportProps> = ({ users, tickets, tasks, faqs, promotions, employeeRequests, categories }) => {
    type ActivityColumn<T> = {
        header: string;
        accessor: (item: T) => React.ReactNode;
        className?: string;
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const reportableUsers = useMemo(() => users.filter(u => u.role === UserRole.Employee || u.role === UserRole.Supervisor), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);
    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const lowercasedQuery = searchQuery.trim().toLowerCase();
        return reportableUsers.filter(u =>
            u.username.toLowerCase().includes(lowercasedQuery) ||
            (u.employeeId && u.employeeId.toLowerCase().includes(lowercasedQuery))
        );
    }, [searchQuery, reportableUsers]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setSearchQuery('');
    };

    const performanceData = useMemo(() => {
        const usersToReportOn = selectedUser ? [selectedUser] : reportableUsers;
        if (usersToReportOn.length === 0) {
            return { ticketsAnswered: 0, avgResponseTime: 'N/A', tasksPerformed: 0, avgTaskTime: 'N/A', tasksApproved: 0, satisfiedTickets: 0, dissatisfiedTickets: 0 };
        }

        let totalResponseTime = 0;
        let totalTaskTime = 0;
        let tasksWithCompletionTimeCount = 0;
        let answeredTicketsCount = 0;
        let totalTasksPerformed = 0;
        let totalTasksApproved = 0;
        
        let satisfiedTicketsCount = 0;
        let dissatisfiedTicketsCount = 0;

        usersToReportOn.forEach(user => {
            const answeredTickets = tickets.filter(t => t.answeredByUserId === user.id && t.createdAt && t.answeredAt);
            answeredTicketsCount += answeredTickets.length;
            answeredTickets.forEach(t => {
                totalResponseTime += new Date(t.answeredAt!).getTime() - new Date(t.createdAt).getTime();
                if(t.customerRating === 'satisfied') {
                    satisfiedTicketsCount++;
                } else if(t.customerRating === 'dissatisfied') {
                    dissatisfiedTicketsCount++;
                }
            });

            const performedTasks = tasks.filter(t => t.performedByUserId === user.id);
            totalTasksPerformed += performedTasks.length;

            const tasksWithCompletionTime = performedTasks.filter(t => t.createdAt && t.updatedAt && (t.status === 'Pending Review' || t.status === 'Pending Supervisor Review' || t.status === 'Completed'));
            tasksWithCompletionTimeCount += tasksWithCompletionTime.length;
            tasksWithCompletionTime.forEach(t => {
                totalTaskTime += new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
            });

            totalTasksApproved += tasks.filter(t => t.completedByUserId === user.id).length;
        });

        const avgResponseTime = answeredTicketsCount > 0 ? formatDuration(totalResponseTime / answeredTicketsCount) : 'N/A';
        const avgTaskTime = tasksWithCompletionTimeCount > 0 ? formatDuration(totalTaskTime / tasksWithCompletionTimeCount) : 'N/A';

        return {
            ticketsAnswered: answeredTicketsCount,
            avgResponseTime,
            tasksPerformed: totalTasksPerformed,
            avgTaskTime,
            tasksApproved: totalTasksApproved,
            satisfiedTickets: satisfiedTicketsCount,
            dissatisfiedTickets: dissatisfiedTicketsCount
        };
    }, [selectedUser, reportableUsers, tickets, tasks]);

    const {
        answeredTickets,
        performedTasks,
        approvedTasks,
        createdFaqs,
        updatedFaqs,
        createdPromotions,
        createdStaffRequests
    } = useMemo(() => {
        const isUserMatch = (userId: string | undefined | null) => {
            if (!userId) return false;
            if (selectedUser) return userId === selectedUser.id;
            return reportableUsers.some(ru => ru.id === userId);
        };

        const answered = tickets.filter(t => isUserMatch(t.answeredByUserId)).sort((a,b) => new Date(b.answeredAt!).getTime() - new Date(a.answeredAt!).getTime());
        const performed = tasks.filter(t => isUserMatch(t.performedByUserId)).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const approved = tasks.filter(t => isUserMatch(t.completedByUserId)).sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
        const createdF = faqs.filter(f => isUserMatch(f.createdByUserId)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const updatedF = faqs.filter(f => isUserMatch(f.updatedByUserId) && f.createdByUserId !== f.updatedByUserId).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const createdP = promotions.filter(p => isUserMatch(p.createdByUserId)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const createdR = employeeRequests.filter(r => isUserMatch(r.requestedBySupervisorId)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return {
            answeredTickets: answered,
            performedTasks: performed,
            approvedTasks: approved,
            createdFaqs: createdF,
            updatedFaqs: updatedF,
            createdPromotions: createdP,
            createdStaffRequests: createdR,
        };
    }, [selectedUser, reportableUsers, tickets, tasks, faqs, promotions, employeeRequests]);
    
    const allActivities = [
        ...answeredTickets, ...performedTasks, ...approvedTasks,
        ...createdFaqs, ...updatedFaqs, ...createdPromotions, ...createdStaffRequests
    ];

    const ActivityLog = () => {
        const answeredTicketsCols: ActivityColumn<Ticket>[] = [
            { header: 'Ticket ID', accessor: (item: Ticket) => <span className="font-mono text-xs">{item.id}</span> },
            { header: 'Subject', accessor: (item: Ticket) => item.subject, className: 'max-w-xs truncate' },
            { header: 'Rating', accessor: (item: Ticket) => (
                item.customerRating ? (
                    <span className={`capitalize font-semibold inline-flex items-center gap-1 ${item.customerRating === 'satisfied' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.customerRating === 'satisfied' ? <ThumbUpIcon className="w-4 h-4" /> : <ThumbDownIcon className="w-4 h-4" />}
                    </span>
                ) : <span className="text-slate-400 italic">N/A</span>
            ), className: 'text-center' },
            { header: 'Response Time', accessor: (item: Ticket) => <span className="font-mono">{formatDuration(new Date(item.answeredAt!).getTime() - new Date(item.createdAt).getTime())}</span>, className: 'text-center' },
            { header: 'Date Answered', accessor: (item: Ticket) => new Date(item.answeredAt!).toLocaleDateString(), className: 'text-center' },
        ];
        if (!selectedUser) answeredTicketsCols.unshift({ header: 'User', accessor: (item: Ticket) => <span className="font-semibold">{userMap.get(item.answeredByUserId!)}</span> });
        
        const performedTasksCols: ActivityColumn<Task>[] = [
            { header: 'Task Title', accessor: (item: Task) => item.title, className: 'max-w-xs truncate' },
            { header: 'Category', accessor: (item: Task) => categoryMap.get(item.assignedCategoryId) || 'N/A' },
            { header: 'Time Taken', accessor: (item: Task) => <span className="font-mono">{formatDuration(new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime())}</span>, className: 'text-center' },
            { header: 'Status', accessor: (item: Task) => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>{item.status}</span>, className: 'text-center' },
            { header: 'Date Submitted', accessor: (item: Task) => new Date(item.updatedAt).toLocaleDateString(), className: 'text-center' },
        ];
        if (!selectedUser) performedTasksCols.unshift({ header: 'User', accessor: (item: Task) => <span className="font-semibold">{userMap.get(item.performedByUserId!)}</span> });

        const approvedTasksCols: ActivityColumn<Task>[] = [
            { header: 'Task Title', accessor: (item: Task) => item.title, className: 'max-w-xs truncate' },
            { header: 'Performed By', accessor: (item: Task) => userMap.get(item.performedByUserId || '') || 'N/A' },
            { header: 'Date Approved', accessor: (item: Task) => new Date(item.completedAt!).toLocaleDateString() },
        ];
         if (!selectedUser) approvedTasksCols.unshift({ header: 'User', accessor: (item: Task) => <span className="font-semibold">{userMap.get(item.completedByUserId!)}</span> });

        const faqsCols: ActivityColumn<Faq>[] = [
            { header: 'Action', accessor: (item: Faq) => item.createdByUserId === (selectedUser?.id || item.createdByUserId) ? 'Created' : 'Edited' },
            { header: 'Question', accessor: (item: Faq) => item.question, className: 'max-w-xs truncate' },
            { header: 'Date', accessor: (item: Faq) => new Date(item.updatedAt).toLocaleDateString() },
        ];
        if (!selectedUser) faqsCols.unshift({ header: 'User', accessor: (item: Faq) => <span className="font-semibold">{userMap.get(item.updatedByUserId!)}</span> });

        const promotionsCols: ActivityColumn<Promotion>[] = [
            { header: 'Title', accessor: (item: Promotion) => item.title, className: 'max-w-xs truncate' },
            { header: 'Audience', accessor: (item: Promotion) => <span className="capitalize">{item.audience}</span> },
            { header: 'Date Created', accessor: (item: Promotion) => new Date(item.createdAt).toLocaleDateString() },
        ];
        if (!selectedUser) promotionsCols.unshift({ header: 'User', accessor: (item: Promotion) => <span className="font-semibold">{userMap.get(item.createdByUserId!)}</span> });

        const requestsCols: ActivityColumn<EmployeeRequest>[] = [
            { header: 'Requested User', accessor: (item: EmployeeRequest) => item.newEmployeeUsername },
            { header: 'Status', accessor: (item: EmployeeRequest) => <span className="capitalize">{item.status}</span> },
            { header: 'Date', accessor: (item: EmployeeRequest) => new Date(item.createdAt).toLocaleDateString() },
        ];
        if (!selectedUser) requestsCols.unshift({ header: 'User', accessor: (item: EmployeeRequest) => <span className="font-semibold">{userMap.get(item.requestedBySupervisorId!)}</span> });
        
        return (
            <div className="space-y-6">
                <ActivitySection title="Answered Tickets" icon={<TicketIcon className="w-6 h-6 text-blue-500" />} items={answeredTickets} columns={answeredTicketsCols} emptyMessage="No tickets answered." />
                <ActivitySection title="Tasks Performed" icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} items={performedTasks} columns={performedTasksCols} emptyMessage="No tasks performed."/>
                <ActivitySection title="Tasks Approved" icon={<BriefcaseIcon className="w-6 h-6 text-purple-500" />} items={approvedTasks} columns={approvedTasksCols} emptyMessage="No tasks approved." />
                <ActivitySection title="FAQs Created / Edited" icon={<ClipboardListIcon className="w-6 h-6 text-yellow-500" />} items={[...createdFaqs, ...updatedFaqs]} columns={faqsCols} emptyMessage="No FAQs managed." />
                <ActivitySection title="Promotions Created" icon={<MegaphoneIcon className="w-6 h-6 text-pink-500" />} items={createdPromotions} columns={promotionsCols} emptyMessage="No promotions created." />
                <ActivitySection title="Staff Requests Created" icon={<UserPlusIcon className="w-6 h-6 text-indigo-500" />} items={createdStaffRequests} columns={requestsCols} emptyMessage="No staff requests created." />
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-8">
            <div>
                <h3 className="text-xl font-bold text-slate-800">Performance & Activity Report</h3>
                <p className="text-sm text-slate-600 mt-1">
                    View overall team performance or search for a specific user to see their individual metrics and detailed activity log.
                </p>
            </div>
            
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="search"
                    placeholder="Search by username or Employee ID to view a specific user's report..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchQuery && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-slate-200 max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <button key={user.id} onClick={() => handleSelectUser(user)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-500 hover:text-white transition-colors">
                                    {user.username} <span className="text-xs capitalize opacity-70">({user.role})</span>
                                </button>
                            ))
                        ) : (
                            <p className="px-4 py-2 text-sm text-slate-500 italic">No users found.</p>
                        )}
                    </div>
                )}
            </div>

            {selectedUser ? (
                 <div key={selectedUser.id} className="animate-fade-in space-y-8">
                     <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start">
                             <h4 className="text-lg font-semibold text-slate-800 mb-3">
                                Performance Summary for {selectedUser.username}
                            </h4>
                            <button onClick={() => setSelectedUser(null)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex-shrink-0 ml-4">View Full Team Report</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="text-slate-500 text-sm font-medium">Tickets Answered</h5>
                                <p className="text-3xl font-bold mt-1 text-blue-600">{performanceData.ticketsAnswered.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="text-slate-500 text-sm font-medium">Satisfied Replies 👍</h5>
                                <p className="text-3xl font-bold mt-1 text-green-600">{performanceData.satisfiedTickets.toLocaleString()}</p>
                            </div>
                             <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="text-slate-500 text-sm font-medium">Dissatisfied Replies 👎</h5>
                                <p className="text-3xl font-bold mt-1 text-red-600">{performanceData.dissatisfiedTickets.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <h5 className="text-slate-500 text-sm font-medium">Avg. Ticket Response</h5>
                                <p className="text-3xl font-bold mt-1 text-blue-600 font-mono">{performanceData.avgResponseTime}</p>
                            </div>
                        </div>
                     </div>
                     <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">
                           Activity Log for {selectedUser.username}
                        </h4>
                        <ActivityLog />
                     </div>
                 </div>
            ) : (
                <div className="space-y-8">
                    <div>
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">
                            Overall Team Ticket Performance
                        </h4>
                        <UserPerformanceTable users={reportableUsers} tickets={tickets} />
                    </div>
                    <div>
                         <h4 className="text-lg font-semibold text-slate-800 mb-3">
                            Combined Activity Log
                        </h4>
                         {allActivities.length === 0 ? (
                            <div className="text-center py-16 px-6 text-slate-500 italic">
                                <p>No user activity has been recorded yet.</p>
                            </div>
                        ) : (
                            <ActivityLog />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserActivityReport;