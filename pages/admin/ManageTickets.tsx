

import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, Attachment, Faq, Category, User, UserRole, SubDepartment, ToastMessage } from '../../types';
import AttachmentInput from '../../components/AttachmentInput';
import AttachmentPreview from '../../components/AttachmentPreview';
import SearchIcon from '../../components/icons/SearchIcon';
import ThumbUpIcon from '../../components/icons/ThumbUpIcon';
import ThumbDownIcon from '../../components/icons/ThumbDownIcon';
import { getTicketStatusBadgeColor } from './utils';


interface ManageTicketsProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  faqs: Faq[];
  setFaqs: React.Dispatch<React.SetStateAction<Faq[]>>;
  categories: Category[];
  subDepartments: SubDepartment[];
  loggedInUser: User;
  addToast: (message: string, type: ToastMessage['type']) => void;
  users: User[];
}

const ManageTickets: React.FC<ManageTicketsProps> = ({ tickets, setTickets, faqs, setFaqs, categories, subDepartments, loggedInUser, addToast, users }) => {
  const [replyingTicket, setReplyingTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [adminAttachment, setAdminAttachment] = useState<Attachment | null>(null);
  const [promoteToFaq, setPromoteToFaq] = useState(false);
  const [newFaqCategory, setNewFaqCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTickets = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
        return tickets;
    }
    return tickets.filter(ticket =>
        ticket.phone.toLowerCase().includes(lowercasedQuery) ||
        (ticket.employeeId && ticket.employeeId.toLowerCase().includes(lowercasedQuery)) ||
        ticket.id.toLowerCase().includes(lowercasedQuery) ||
        ticket.name.toLowerCase().includes(lowercasedQuery)
    );
  }, [tickets, searchQuery]);


  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicket) return;

    const isFirstReply = replyingTicket.status === TicketStatus.New || replyingTicket.status === TicketStatus.Seen;

    setTickets(prev => prev.map(t => t.id === replyingTicket.id ? {
      ...t, 
      adminReply: replyText, 
      status: TicketStatus.Answered, 
      adminAttachment: adminAttachment,
      answeredAt: isFirstReply ? new Date().toISOString() : t.answeredAt,
      answeredByUserId: loggedInUser.id,
    } : t));

    if (promoteToFaq) {
      const now = new Date().toISOString();
      // Fix: Add missing question_ar and answer_ar properties to match the Faq type.
      const newFaq: Faq = {
        id: faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1,
        question: replyingTicket.subject,
        question_ar: replyingTicket.subject, // Admin should translate this
        answer: replyText,
        answer_ar: replyText, // Admin should translate this
        categoryId: newFaqCategory,
        attachment: adminAttachment,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        createdByUserId: loggedInUser.id,
        updatedByUserId: loggedInUser.id,
        satisfaction: 0,
        dissatisfaction: 0,
      };
      setFaqs(prev => [...prev, newFaq]);
    }

    addToast(promoteToFaq ? 'Reply sent and FAQ created!' : 'Reply sent successfully!', 'success');

    setReplyingTicket(null);
    setReplyText('');
    setAdminAttachment(null);
    setPromoteToFaq(false);
  };
  
  const handleOpenReplyModal = (ticket: Ticket) => {
    const updatedTicket = { ...ticket };
    if (ticket.status === TicketStatus.New) {
        updatedTicket.status = TicketStatus.Seen;
        setTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));
    }

    setReplyingTicket(updatedTicket);
    setReplyText(updatedTicket.adminReply || '');
    setAdminAttachment(updatedTicket.adminAttachment || null);
    setPromoteToFaq(false);
    
    // Default to ticket's category. The dropdown will be filtered based on user permissions.
    setNewFaqCategory(updatedTicket.categoryId);
  };

  const handleCloseReplyModal = () => {
    setReplyingTicket(null);
    setAdminAttachment(null);
    setReplyText('');
  }

  const handleCloseTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: TicketStatus.Closed } : t)));
    addToast('Ticket has been closed.', 'info');
  };
  
  const handleReopenTicket = (ticketId: string) => {
      setTickets(prev => prev.map(t => (t.id === ticketId ? { ...t, status: TicketStatus.Seen } : t)));
      addToast('Ticket has been re-opened for reply.', 'info');
  };

  const handleAssignTicket = (ticketId: string, employeeId: string) => {
    const employee = users.find(u => u.id === employeeId);
    setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, assignedEmployeeId: employeeId || null } : t
    ));
    if (employee) {
        addToast(`Ticket assigned to ${employee.username}.`, 'info');
    } else {
        addToast(`Ticket unassigned.`, 'info');
    }
  };

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const subDeptMap = useMemo(() => new Map(subDepartments.map(sd => [sd.id, sd.name])), [subDepartments]);
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);
  
  // Categories available for the "Promote to FAQ" dropdown
  const availableCategoriesForFaq = useMemo(() => {
    if(loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards')) {
        return categories;
    }
    return categories.filter(c => loggedInUser.assignedCategoryIds?.includes(c.id));
  }, [categories, loggedInUser]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {replyingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseReplyModal}>
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Ticket Details #{replyingTicket.id}</h3>
            
            <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold text-sm text-slate-600">Customer:</p>
                        <p className="p-2 bg-slate-100 rounded text-slate-800">{replyingTicket.name}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-sm text-slate-600">Phone:</p>
                        <p className="p-2 bg-slate-100 rounded text-slate-800">{replyingTicket.phone}</p>
                    </div>
                </div>
                {replyingTicket.employeeId && (
                    <div>
                        <p className="font-semibold text-sm text-slate-600">Employee ID:</p>
                        <p className="p-2 bg-slate-100 rounded text-slate-800">{replyingTicket.employeeId}</p>
                    </div>
                )}
                 <div>
                    <p className="font-semibold text-sm text-slate-600">Sub-department:</p>
                    <p className="p-2 bg-slate-100 rounded text-slate-800">{subDeptMap.get(replyingTicket.subDepartmentId || '') || 'N/A'}</p>
                </div>
                <div>
                    <p className="font-semibold text-sm text-slate-600">Subject:</p>
                    <p className="p-2 bg-slate-100 rounded text-slate-800">{replyingTicket.subject}</p>
                </div>
                <div>
                    <p className="font-semibold text-sm text-slate-600">Description:</p>
                    <p className="p-2 bg-slate-100 rounded text-slate-800 whitespace-pre-wrap">{replyingTicket.description}</p>
                </div>
                {replyingTicket.userAttachment && (
                    <div>
                        <p className="font-semibold text-sm text-slate-600">User's Attachment:</p>
                        <div className="p-2 border rounded-md border-slate-200">
                          <AttachmentPreview attachment={replyingTicket.userAttachment} />
                        </div>
                    </div>
                )}
                 {replyingTicket.customerRating && (
                    <div>
                      <p className="font-semibold text-sm text-slate-600">Customer Rating:</p>
                      <div className={`p-2 rounded inline-flex items-center gap-2 text-sm font-semibold ${replyingTicket.customerRating === 'satisfied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {replyingTicket.customerRating === 'satisfied' ? <ThumbUpIcon className="w-4 h-4" /> : <ThumbDownIcon className="w-4 h-4" />}
                          <span className="capitalize">{replyingTicket.customerRating}</span>
                      </div>
                    </div>
                )}
            </div>

            {(() => {
              const isEmployee = loggedInUser.role === UserRole.Employee;
              const canEmployeeCloseTicket = isEmployee && loggedInUser.permissions?.includes('close_tickets') && replyingTicket.answeredByUserId === loggedInUser.id;
              const isReadOnlyForEmployee = isEmployee && !canEmployeeCloseTicket && (replyingTicket.status === TicketStatus.Answered || replyingTicket.status === TicketStatus.Closed);

              if (isReadOnlyForEmployee) {
                return (
                  <div className="mt-6 flex justify-end">
                    <button type="button" onClick={handleCloseReplyModal} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300">Close</button>
                  </div>
                );
              }

              return (
                <form onSubmit={handleReplySubmit}>
                  <div className="space-y-4">
                    <textarea 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={5}
                      className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your reply..."
                      required
                    />
                    <AttachmentInput attachment={adminAttachment} setAttachment={setAdminAttachment} id="admin-reply-attachment"/>
                    <div className="mt-4 flex items-start gap-4">
                      <div className="flex items-center h-5 pt-0.5">
                          <input id="promote" type="checkbox" checked={promoteToFaq} onChange={e => setPromoteToFaq(e.target.checked)} className="h-4 w-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500" />
                      </div>
                      <div className="text-sm flex-1">
                          <label htmlFor="promote" className="font-medium text-slate-900">Promote to public FAQ</label>
                          <p className="text-xs text-slate-500">The ticket subject will be the question, and your reply will be the answer.</p>
                          {promoteToFaq && (
                              <div className="mt-2">
                                  <label htmlFor="faq-category" className="block text-xs font-medium text-slate-500 mb-1">Select a category</label>
                                  <select 
                                      id="faq-category"
                                      value={newFaqCategory}
                                      onChange={e => setNewFaqCategory(e.target.value)}
                                      className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                      {availableCategoriesForFaq.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                  </select>
                              </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={handleCloseReplyModal} className="px-4 py-2 bg-slate-200 rounded-md text-sm font-medium hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Send Reply</button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

       <div className="mb-4">
            <label htmlFor="ticket-search" className="sr-only">Search Tickets by ID, Subject, Name or Phone</label>
            <div className="relative w-full md:w-2/5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    id="ticket-search"
                    type="search"
                    placeholder="Search by ID, Subject, Name or Phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>
        </div>

      <div className="overflow-x-auto">
        <table className="min-w-full responsive-table">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sub-department</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Rating</th>
              <th scope="col" className="relative px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white md:divide-y md:divide-slate-200">
            {filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => {
                    const isManager = loggedInUser.role === UserRole.Admin || loggedInUser.role === UserRole.Supervisor;
                    const eligibleEmployees = isManager ? users.filter(u => {
                        if (u.role !== UserRole.Employee || !u.permissions?.includes('handle_tickets')) return false;
                        if (!ticket.subDepartmentId) return false; // Cannot assign if no sub-department
                        if (!u.assignedSubDepartmentIds?.includes(ticket.subDepartmentId)) return false;
                        
                        if (loggedInUser.role === UserRole.Admin) return true;
                        
                        if (loggedInUser.role === UserRole.Supervisor) {
                            // Supervisor can only assign to their own team members
                            return u.supervisorId === loggedInUser.id;
                        }
                        return false;
                    }) : [];

                    return (
                        <tr key={ticket.id}>
                            <td data-label="Status" className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTicketStatusBadgeColor(ticket.status)}`}>{ticket.status}</span>
                            </td>
                            <td data-label="Subject" className="px-4 py-4 max-w-sm"><p className="text-sm text-slate-900 truncate" title={ticket.subject}>{ticket.subject}</p></td>
                             <td data-label="Sub-dept" className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{subDeptMap.get(ticket.subDepartmentId || '') || 'N/A'}</td>
                            <td data-label="Assigned" className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 w-full md:w-48">
                                {isManager && (ticket.status === 'New' || ticket.status === 'Seen') ? (
                                    <select
                                    value={ticket.assignedEmployeeId || ''}
                                    onChange={(e) => handleAssignTicket(ticket.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-sm border-slate-300 rounded-md p-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    disabled={!ticket.subDepartmentId || eligibleEmployees.length === 0}
                                    title={!ticket.subDepartmentId ? "Ticket must have a sub-department to be assigned" : ""}
                                    >
                                    <option value="">{eligibleEmployees.length === 0 ? 'No eligible staff' : 'Unassigned'}</option>
                                    {eligibleEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.username}</option>
                                    ))}
                                    </select>
                                ) : (
                                    ticket.assignedEmployeeId ? (
                                    <span className="font-semibold">{userMap.get(ticket.assignedEmployeeId) || 'Unknown'}</span>
                                    ) : (
                                    <span className="italic text-slate-400">Unassigned</span>
                                    )
                                )}
                            </td>
                            <td data-label="User" className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{ticket.name}</td>
                            <td data-label="Date" className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                            <td data-label="Rating" className="px-4 py-4 whitespace-nowrap text-center">
                                {ticket.status === TicketStatus.Answered || ticket.status === TicketStatus.Closed ? (
                                    ticket.customerRating ? (
                                    ticket.customerRating === 'satisfied' ? (
                                        <span title="Satisfied" className="inline-flex items-center justify-center w-8 h-8 text-xl bg-green-100 text-green-800 rounded-full">👍</span>
                                    ) : (
                                        <span title="Dissatisfied" className="inline-flex items-center justify-center w-8 h-8 text-xl bg-red-100 text-red-800 rounded-full">👎</span>
                                    )
                                    ) : (
                                    <span title="Pending customer rating" className="inline-flex items-center justify-center w-8 h-8 text-lg bg-slate-100 text-slate-500 rounded-full font-semibold">?</span>
                                    )
                                ) : (
                                    <span className="text-slate-400 italic text-xs">N/A</span>
                                )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end items-center gap-4">
                                {(() => {
                                    const isManager = loggedInUser.role === UserRole.Admin || loggedInUser.role === UserRole.Supervisor;

                                    if (ticket.status === TicketStatus.Closed) {
                                        return <button onClick={(e) => { e.stopPropagation(); handleOpenReplyModal(ticket); }} className="text-xs font-semibold italic text-slate-500 cursor-pointer">View</button>;
                                    }

                                    if (ticket.status === TicketStatus.Answered) {
                                            const canEmployeeCloseTicket =
                                                loggedInUser.role === UserRole.Employee &&
                                                loggedInUser.permissions?.includes('close_tickets') &&
                                                ticket.answeredByUserId === loggedInUser.id;

                                    return (
                                        <>
                                            {isManager &&
                                                <button onClick={(e) => { e.stopPropagation(); handleReopenTicket(ticket.id); }} className="text-amber-600 hover:text-amber-800 font-medium">
                                                    Re-open
                                                </button>
                                            }
                                            {(isManager || canEmployeeCloseTicket) &&
                                                <button onClick={(e) => { e.stopPropagation(); handleCloseTicket(ticket.id); }} className="text-green-600 hover:text-green-800 font-medium">
                                                    Close
                                                </button>
                                            }
                                            {loggedInUser.role === UserRole.Employee && !canEmployeeCloseTicket && <span className="text-xs font-semibold italic text-green-600">Answered</span>}
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenReplyModal(ticket); }} className="text-blue-600 hover:text-blue-800 font-medium">
                                                Details
                                            </button>
                                        </>
                                    );
                                    }

                                    // Status is New or Seen
                                    return (
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenReplyModal(ticket); }} className="text-blue-600 hover:text-blue-800 font-medium">
                                            {ticket.adminReply ? 'View / Edit Reply' : 'Reply'}
                                        </button>
                                    );
                                })()}
                            </div>
                            </td>
                        </tr>
                    )
                })
            ) : (
                <tr>
                    <td colSpan={9} className="text-center py-10 px-6 text-slate-500 italic">
                        {searchQuery ? 'No tickets found matching your search.' : 'No tickets have been submitted for this category yet.'}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageTickets;