

import React, { useState } from 'react';
import { Ticket, TicketStatus } from '../types';
import AttachmentPreview from '../components/AttachmentPreview';
import { useLanguage } from '../context/LanguageContext';

interface CheckTicketViewProps {
  tickets: Ticket[];
  onTicketRate: (ticketId: string, rating: 'satisfied' | 'dissatisfied') => void;
}

const CheckTicketView: React.FC<CheckTicketViewProps> = ({ tickets, onTicketRate }) => {
  const [ticketId, setTicketId] = useState('');
  const [foundTicket, setFoundTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [isRated, setIsRated] = useState(false);
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFoundTicket(null);
    setIsRated(false);
    const ticket = tickets.find(t => t.id.toLowerCase() === ticketId.toLowerCase());
    if (ticket) {
      setFoundTicket(ticket);
    } else {
      setError(t('ticket_not_found'));
    }
  };

  const handleRate = (rating: 'satisfied' | 'dissatisfied') => {
    if (!foundTicket) return;
    onTicketRate(foundTicket.id, rating);
    setIsRated(true);
  };


  const getStatusBadgeColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.New:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.Seen:
        return 'bg-amber-100 text-amber-800';
      case TicketStatus.Answered:
        return 'bg-green-100 text-green-800';
      case TicketStatus.Closed:
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200">
          <h1 className="text-2xl font-bold text-center text-slate-900">{t('check_your_ticket_status')}</h1>
          <p className="text-center text-slate-600 mt-2 mb-6">{t('enter_ticket_ref_id')}</p>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g., TKT-1698336000"
              className="flex-grow px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('search')}
            </button>
          </form>

          {error && <p className="mt-4 text-center text-red-600">{error}</p>}
        </div>

        {foundTicket && (
          <div className="mt-8 bg-white p-8 rounded-lg shadow-md border border-slate-200 animate-fade-in">
            <h2 className="text-xl font-bold text-slate-800">{t('ticket_details')}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <span className="font-semibold">{t('ticket_id')}:</span>
                <span className="ms-2 font-mono text-slate-600">{foundTicket.id}</span>
              </div>
              <div>
                <span className="font-semibold">{t('status')}:</span>
                <span className={`ms-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(foundTicket.status)}`}>
                  {foundTicket.status}
                </span>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('subject')}:</p>
                <p className="text-slate-700">{foundTicket.subject}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">{t('your_description')}:</p>
                <blockquote className="p-4 bg-slate-50 border-s-4 border-slate-300 text-slate-700">
                  {foundTicket.description}
                </blockquote>
              </div>

              {foundTicket.userAttachment && (
                <div>
                  <p className="font-semibold mb-1">{t('your_attachment')}:</p>
                  <div className="p-2 border rounded-md border-slate-200">
                    <AttachmentPreview attachment={foundTicket.userAttachment} />
                  </div>
                </div>
              )}

              <div>
                <p className="font-semibold mb-1">{t('admins_reply')}:</p>
                {foundTicket.adminReply ? (
                  <div className="p-4 bg-blue-50 border-s-4 border-blue-300 text-slate-800">
                    {foundTicket.adminReply}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">{t('no_admin_reply')}</p>
                )}
              </div>

              {foundTicket.adminAttachment && (
                  <div>
                      <p className="font-semibold mb-1">{t('admins_attachment')}:</p>
                      <div className="p-2 border rounded-md border-slate-200">
                        <AttachmentPreview attachment={foundTicket.adminAttachment} />
                      </div>
                  </div>
              )}

              {foundTicket.adminReply && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  {!foundTicket.customerRating && !isRated ? (
                    <div className="p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 text-center animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-800">{t('your_feedback_is_important')}</h3>
                        <p className="mt-2 text-md font-medium text-slate-700">{t('was_our_support_helpful')}</p>
                        <div className="flex items-center justify-center gap-4 mt-4">
                            <button 
                                onClick={() => handleRate('satisfied')} 
                                className="flex flex-col items-center justify-center w-20 h-20 text-3xl bg-green-100 rounded-lg hover:bg-green-200 transition-transform hover:scale-110"
                                aria-label={t('satisfied')}
                                title={t('satisfied')}
                            >
                                <span>👍</span>
                                <span className="text-xs font-semibold mt-1">{t('yes')}</span>
                            </button>
                            <button 
                                onClick={() => handleRate('dissatisfied')} 
                                className="flex flex-col items-center justify-center w-20 h-20 text-3xl bg-red-100 rounded-lg hover:bg-red-200 transition-transform hover:scale-110"
                                aria-label={t('dissatisfied')}
                                title={t('dissatisfied')}
                            >
                                <span>👎</span>
                                <span className="text-xs font-semibold mt-1">{t('no')}</span>
                            </button>
                        </div>
                    </div>
                  ) : (
                    <div className="mt-2 p-4 bg-green-50 text-green-800 rounded-lg text-center animate-fade-in">
                        <p className="text-lg font-semibold flex items-center justify-center gap-2">
                          <span>{t('thank_you_for_feedback')}</span>
                          {foundTicket.customerRating === 'satisfied' || (isRated && foundTicket.customerRating !== 'dissatisfied') ? 
                              <span className="text-xl">👍</span> : 
                              <span className="text-xl">👎</span>
                          }
                        </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckTicketView;