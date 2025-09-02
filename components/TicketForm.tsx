

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Faq, Ticket, TicketStatus, Attachment, Category, SubDepartment } from '../types';
import { getSuggestedFaqs } from '../services/geminiService';

interface TicketFormProps {
  allFaqs: Faq[];
  allTickets: Ticket[];
  categories: Category[];
  subDepartments: SubDepartment[];
  onTicketSubmit: (ticket: Ticket) => void;
  onTicketRate: (ticketId: string, rating: 'satisfied' | 'dissatisfied') => void;
}

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

const TicketForm: React.FC<TicketFormProps> = ({ allFaqs, allTickets, categories, subDepartments, onTicketSubmit, onTicketRate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubDeptId, setSelectedSubDeptId] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [suggestions, setSuggestions] = useState<Faq[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [isLoadingPastTickets, setIsLoadingPastTickets] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [locallyRated, setLocallyRated] = useState<Record<string, 'satisfied' | 'dissatisfied'>>({});


  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const publicCategories = useMemo(() => {
    return categories.filter(c => c.isPublic);
  }, [categories]);

  const availableSubDepts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subDepartments.filter(sd => sd.mainCategoryId === selectedCategoryId);
  }, [subDepartments, selectedCategoryId]);


  useEffect(() => {
    const handler = setTimeout(() => {
      if (phone.trim().length > 4) {
        setIsLoadingPastTickets(true);
        setSearchPerformed(true);
        // Simulate API call for searching tickets
        setTimeout(() => {
          const found = allTickets.filter(t => t.phone === phone.trim()).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setPastTickets(found);
          setIsLoadingPastTickets(false);
        }, 300);
      } else {
        setPastTickets([]);
        setSearchPerformed(false);
      }
    }, 500); // Debounce search

    return () => clearTimeout(handler);
  }, [phone, allTickets]);
  

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (description.length > 15 && selectedCategoryId) {
        const category = categories.find(c => c.id === selectedCategoryId);
        if (category) {
            setIsLoadingSuggestions(true);
            try {
                const suggestedIds = await getSuggestedFaqs(description, allFaqs, category.generalContext);
                const relevantFaqs = allFaqs.filter(faq => suggestedIds.includes(faq.id));
                setSuggestions(relevantFaqs);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoadingSuggestions(false);
            }
        }
      } else {
        setSuggestions([]);
      }
    }, 1000); // Debounce API call

    return () => clearTimeout(handler);
  }, [description, selectedCategoryId, categories, allFaqs]);

  const handleRate = (ticketId: string, rating: 'satisfied' | 'dissatisfied') => {
    onTicketRate(ticketId, rating);
    setLocallyRated(prev => ({ ...prev, [ticketId]: rating }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File is too large. Please upload files smaller than 10MB.");
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
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
        console.error("Failed to read file.");
        alert("There was an error reading the file. Please try again.");
      }
      reader.readAsDataURL(file);
    } else {
      setAttachment(null);
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex for English letters and spaces only
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex for numbers only
    if (/^[0-9]*$/.test(value)) {
      setPhone(value);
    }
  };
  
  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Regex for numbers only
    if (/^[0-9]*$/.test(value)) {
      setEmployeeId(value);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow any characters in subject for flexibility, as per user request for English only (no specific restrictions).
    setSubject(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasSubDepts = availableSubDepts.length > 0;
    
    if (!name || !phone || !subject || !description || !selectedCategoryId || (hasSubDepts && !selectedSubDeptId)) {
        alert("Please fill out all required fields, including main topic and specific issue if applicable.");
        return;
    }


    const newTicket: Ticket = {
      id: `TKT-${Date.now()}`,
      name,
      phone,
      employeeId: employeeId || null,
      subject,
      description,
      categoryId: selectedCategoryId,
      subDepartmentId: selectedSubDeptId || null,
      userAttachment: attachment,
      status: TicketStatus.New,
      adminReply: null,
      adminAttachment: null,
      createdAt: new Date().toISOString(),
      answeredAt: null,
    };
    onTicketSubmit(newTicket);
    setName('');
    setPhone('');
    setEmployeeId('');
    setSubject('');
    setSelectedCategoryId('');
    setSelectedSubDeptId('');
    setDescription('');
    setSuggestions([]);
    setPastTickets([]);
    setAttachment(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mt-12 p-6 bg-white rounded-lg shadow-md border border-slate-200">
      <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Didn't find your answer?</h3>
      <p className="text-center text-slate-600 mb-8">Submit a ticket and our support team will get back to you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
            <label htmlFor="name" className="md:text-right text-sm font-medium text-slate-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., John Doe"
              required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
            <label htmlFor="phone" className="md:text-right text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="e.g., 055000111"
              required
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
            <label htmlFor="employeeId" className="md:text-right text-sm font-medium text-slate-700">
                Employee ID
                <span className="text-xs text-slate-500 ml-1">(Optional)</span>
            </label>
            <input
                type="text"
                id="employeeId"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={employeeId}
                onChange={handleEmployeeIdChange}
                placeholder="e.g., 12345"
            />
        </div>

        {isLoadingPastTickets && <div className="text-center text-sm text-slate-500 pt-4">Searching for your past tickets...</div>}
        {searchPerformed && !isLoadingPastTickets && (
           <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
             <h4 className="font-semibold text-slate-800 mb-2">Your Ticket History</h4>
             {pastTickets.length > 0 ? (
                 <ul className="space-y-3">
                   {pastTickets.map(ticket => {
                    const currentRating = ticket.customerRating || locallyRated[ticket.id];
                    return (
                     <li key={ticket.id}>
                       <details className="group text-sm">
                         <summary className="cursor-pointer font-medium hover:underline flex justify-between items-center">
                           <span>{ticket.subject}</span>
                           <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`}>{ticket.status}</span>
                         </summary>
                         <div className="mt-2 pl-4 border-l-2 border-slate-200">
                           <p className="text-slate-600 mb-2 whitespace-pre-wrap">{ticket.description}</p>
                           {ticket.adminReply && (
                             <div className="p-3 bg-blue-50 border-l-4 border-blue-300 text-slate-800 mt-2">
                               <p className="font-semibold text-xs text-blue-900 mb-1">Support Reply</p>
                                {ticket.adminReply}
                             </div>
                           )}
                           {ticket.adminReply && (
                                <div className="mt-3">
                                {!currentRating ? (
                                    <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-md border border-slate-200">
                                        <p className="text-xs font-medium text-slate-700">Was this reply helpful?</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRate(ticket.id, 'satisfied')}
                                                className="flex items-center justify-center w-8 h-8 text-lg bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                                                aria-label="Satisfied"
                                                title="Satisfied"
                                            >
                                                👍
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRate(ticket.id, 'dissatisfied')}
                                                className="flex items-center justify-center w-8 h-8 text-lg bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                                aria-label="Dissatisfied"
                                                title="Dissatisfied"
                                            >
                                                👎
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-2 bg-green-50 text-green-800 rounded-md text-xs font-medium text-center animate-fade-in">
                                        Thank you for your feedback!
                                    </div>
                                )}
                                </div>
                            )}
                           <p className="text-xs text-slate-400 mt-2">
                             Created on: {new Date(ticket.createdAt).toLocaleDateString()}
                           </p>
                         </div>
                       </details>
                     </li>
                   )})}
                 </ul>
             ) : (
                <p className="text-sm text-slate-500 italic">No past tickets found for this phone number.</p>
             )}
           </div>
        )}

        <hr className="!my-6 border-slate-200" />
        
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
              <label htmlFor="main-category" className="md:text-right text-sm font-medium text-slate-700">
                Main Topic
              </label>
              <select
                id="main-category"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                value={selectedCategoryId}
                onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedSubDeptId(''); // Reset sub-department on change
                }}
                required
              >
                <option value="" disabled>Select a main topic...</option>
                {publicCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
              <label htmlFor="sub-department" className="md:text-right text-sm font-medium text-slate-700">
                Specific Issue
              </label>
              <select
                id="sub-department"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed"
                value={selectedSubDeptId}
                onChange={(e) => setSelectedSubDeptId(e.target.value)}
                required={availableSubDepts.length > 0}
                disabled={!selectedCategoryId || availableSubDepts.length === 0}
              >
                <option value="" disabled>
                    {availableSubDepts.length > 0 ? 'Select a specific issue...' : 'No specific issue required'}
                </option>
                {availableSubDepts.map(subDept => (
                    <option key={subDept.id} value={subDept.id}>
                        {subDept.name}
                    </option>
                ))}
              </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-center gap-2 md:gap-4">
              <label htmlFor="subject" className="md:text-right text-sm font-medium text-slate-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={subject}
                onChange={handleSubjectChange}
                placeholder="e.g., Issue with my order"
                required
              />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-start gap-2 md:gap-4">
          <label htmlFor="description" className="md:text-right md:pt-2 text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] md:items-start gap-2 md:gap-4">
          <label htmlFor="attachment" className="md:text-right md:pt-2 text-sm font-medium text-slate-700">
              Attachment
              <span className="block text-xs text-slate-500 leading-tight">(Optional, max 10MB)</span>
          </label>
          <div>
              <input
                  type="file"
                  id="attachment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {attachment && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-slate-100 rounded-md text-sm border border-slate-200">
                      <p className="text-slate-800 truncate pr-2">{attachment.name}</p>
                      <button type="button" onClick={() => { setAttachment(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-700 font-bold text-lg flex-shrink-0">&times;</button>
                  </div>
              )}
          </div>
        </div>


        {isLoadingSuggestions && <div className="text-center text-sm text-slate-500 !mt-6">Checking for similar questions...</div>}
        {suggestions.length > 0 && (
          <div className="!mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Are you looking for one of these?</h4>
            <ul className="space-y-2">
              {suggestions.map(faq => (
                <li key={faq.id} className="text-sm text-blue-700">
                  <details className="group">
                    <summary className="cursor-pointer font-medium hover:underline">{faq.question}</summary>
                    <p className="mt-1 pl-4 text-slate-600">{faq.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="!mt-8 md:pl-[156px]">
          <button
            type="submit"
            className="w-full md:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;