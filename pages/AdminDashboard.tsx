

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Faq, Ticket, SiteConfig, Category, User, UserRole, Task, ToastMessage, AdminTab, Promotion, EmployeeRequest, AdminPermission, TicketStatus, SubDepartment, Vehicle, VehicleLicense, Violation, ViolationRule } from '../types';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import MenuIcon from '../components/icons/MenuIcon';
import BellIcon from '../components/icons/BellIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import UsersIcon from '../components/icons/UsersIcon';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import ClipboardListIcon from '../components/icons/ClipboardListIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import TicketIcon from '../components/icons/TicketIcon';
import MagnifyingGlassCircleIcon from '../components/icons/MagnifyingGlassCircleIcon';
import EyeIcon from '../components/icons/EyeIcon';
import LockClosedIcon from '../components/icons/LockClosedIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import MegaphoneIcon from '../components/icons/MegaphoneIcon';
import DocumentDuplicateIcon from '../components/icons/DocumentDuplicateIcon';
import CarIcon from '../components/icons/CarIcon';
import { useLanguage } from '../context/LanguageContext';

// Import newly created modular components
import AnalyticsOverview from './admin/AnalyticsOverview';
import ManageFaqs from './admin/ManageFaqs';
import ManageTickets from './admin/ManageTickets';
import ManageTasks from './admin/ManageTasks';
import ManageCategories from './admin/ManageCategories';
import ManageSubDepartments from './admin/ManageSubDepartments';
import ManagePromotions from './admin/ManagePromotions';
import ManageSupervisors from './admin/ManageSupervisors';
import ManageStaffRequests from './admin/ManageStaffRequests';
import ManageTeam from './admin/ManageTeam';
import UserActivityReport from './admin/UserActivityReport';
import Settings from './admin/Settings';
import ManageVehicles from './admin/ManageVehicles';

// Import modal components
import FaqEditModal from './admin/components/FaqEditModal';
import EmployeePermissionModal from './admin/components/EmployeePermissionModal';


// --- Prop Types ---
interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  faqs: Faq[];
  setFaqs: React.Dispatch<React.SetStateAction<Faq[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  subDepartments: SubDepartment[];
  setSubDepartments: React.Dispatch<React.SetStateAction<SubDepartment[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  employeeRequests: EmployeeRequest[];
  setEmployeeRequests: React.Dispatch<React.SetStateAction<EmployeeRequest[]>>;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  vehicleLicenses: VehicleLicense[];
  setVehicleLicenses: React.Dispatch<React.SetStateAction<VehicleLicense[]>>;
  violations: Violation[];
  setViolations: React.Dispatch<React.SetStateAction<Violation[]>>;
  violationRules: ViolationRule[];
  setViolationRules: React.Dispatch<React.SetStateAction<ViolationRule[]>>;
  loggedInUser: User;
  addToast: (message: string, type: ToastMessage['type']) => void;
}


// --- Main Admin Dashboard Component ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    users, setUsers, faqs, setFaqs, tickets, setTickets, categories, setCategories, subDepartments, setSubDepartments, 
    tasks, setTasks, promotions, setPromotions, employeeRequests, setEmployeeRequests, siteConfig, setSiteConfig,
    vehicles, setVehicles, vehicleLicenses, setVehicleLicenses, violations, setViolations,
    violationRules, setViolationRules,
    loggedInUser, addToast 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  const hasAdminPermission = useCallback((permission: AdminPermission): boolean => {
    if (loggedInUser.role === UserRole.Admin) {
      return true; // Full admin has all permissions.
    }
    if (loggedInUser.role === UserRole.Supervisor) {
      return loggedInUser.adminPermissions?.includes(permission) ?? false;
    }
    return false;
  }, [loggedInUser]);

  const requestConfirm = (title: string, message: string, onConfirm: () => void, confirmText?: string) => {
    setConfirmationState({
        isOpen: true,
        title,
        message,
        confirmText,
        onConfirm: () => {
            onConfirm();
            setConfirmationState(null);
        }
    });
  };
  
  const employeePermissions = useMemo(() => {
    if (loggedInUser.role !== UserRole.Employee) return null;
    const perms = loggedInUser.permissions || [];
    return {
        canHandleTickets: perms.includes('handle_tickets'),
        canHandleTasks: perms.includes('handle_tasks'),
        canAddFaqs: perms.includes('add_faqs'),
        canViewAnalytics: perms.includes('view_analytics'),
    };
  }, [loggedInUser]);

  const getInitialTab = useCallback((): AdminTab => {
    if (loggedInUser.role === UserRole.Employee) {
        if (employeePermissions?.canViewAnalytics) return 'dashboard';
        if (employeePermissions?.canHandleTasks) return 'tasks';
        if (employeePermissions?.canHandleTickets) return 'tickets';
        return 'faqs'; // Default for employee if no other perm, can always view
    }
    if (loggedInUser.role === UserRole.Supervisor) {
        return 'dashboard'; // All supervisors default to dashboard
    }
    return 'dashboard'; // Default for admin
  }, [loggedInUser.role, employeePermissions]);
  
  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialTab());

  useEffect(() => {
    const targetTab = location.state?.a_t as AdminTab | undefined;
    if (targetTab) {
      setActiveTab(targetTab);
      // Clean the location state to prevent this from re-firing on browser refresh.
      navigate(location.pathname, { state: {}, replace: true });
    }
  }, [location.state, navigate, location.pathname]);


  const { 
    isFullAdmin,
    isSupervisor,
    isEmployee,
    visibleFaqs, 
    visibleTickets, 
    visibleTasks,
    visibleCategories,
    supervisorCategories,
    supervisorSubDepartments,
    openTicketsCount, 
    openTasksCount,
    pendingReviewTasksCount,
    pendingStaffRequestsCount,
    unacknowledgedApprovalsCount,
  } = useMemo(() => {
    const isFullAdmin = loggedInUser.role === UserRole.Admin;
    const isSupervisor = loggedInUser.role === UserRole.Supervisor;
    const isEmployee = loggedInUser.role === UserRole.Employee;
    const canViewAll = hasAdminPermission('view_all_dashboards');
    const pendingStaffReqCount = employeeRequests.filter(req => req.status === 'pending').length;
    
    let approvalCount = 0;
    if (isSupervisor) {
        approvalCount = employeeRequests.filter(req =>
            req.requestedBySupervisorId === loggedInUser.id &&
            req.status === 'approved' &&
            !req.acknowledgedBySupervisor
        ).length;
    }


    // Determine which categories the user has visibility over.
    let supervisorVisibleCategoryIds: string[] = [];
    if (canViewAll) {
        supervisorVisibleCategoryIds = categories.map(c => c.id);
    } else if (isSupervisor) {
        supervisorVisibleCategoryIds = loggedInUser.assignedCategoryIds || [];
    }
    
    // Determine the categories a supervisor can manage (for dropdowns, etc.)
    const supervisorManagableCategories = isSupervisor 
        ? categories.filter(c => loggedInUser.assignedCategoryIds?.includes(c.id)) 
        : [];
    
    const supervisorManagableSubDepartments = isSupervisor
        ? subDepartments.filter(sd => sd.supervisorId === loggedInUser.id)
        : [];

    const visibleCategories = categories.filter(c => supervisorVisibleCategoryIds.includes(c.id));
    const visibleFaqs = faqs.filter(f => supervisorVisibleCategoryIds.includes(f.categoryId));
    
    // --- START: Ticket Filtering Logic ---
    let filteredTickets: Ticket[] = [];
    if (isFullAdmin) {
        filteredTickets = tickets; // Admins see all tickets
    } else if (isSupervisor) {
        // Supervisors see all tickets in their assigned main categories
        filteredTickets = tickets.filter(t => supervisorVisibleCategoryIds.includes(t.categoryId));
    } else if (isEmployee) {
        // Employees only see tickets assigned to their specific sub-departments
        const mySubDeptIds = loggedInUser.assignedSubDepartmentIds || [];
        if (employeePermissions?.canHandleTickets) {
            filteredTickets = tickets.filter(t =>
                (t.subDepartmentId && mySubDeptIds.includes(t.subDepartmentId)) || // in their sub-department
                t.assignedEmployeeId === loggedInUser.id // or explicitly assigned to them
            );
        }
    }


    // --- START: Task Filtering Logic ---
    let filteredTasks: Task[] = [];
    if (canViewAll) {
        filteredTasks = tasks;
    } else if (isSupervisor) {
        const myEmployeeIds = users.filter(u => u.supervisorId === loggedInUser.id).map(u => u.id);
        // Supervisors see tasks in their main categories OR tasks assigned to their team members.
        filteredTasks = tasks.filter(t =>
            supervisorVisibleCategoryIds.includes(t.assignedCategoryId) ||
            (t.assignedEmployeeId && myEmployeeIds.includes(t.assignedEmployeeId))
        );
    } else if (isEmployee) {
        const mySubDeptIds = loggedInUser.assignedSubDepartmentIds || [];
        // Employees see tasks assigned to them OR tasks in their sub-department that are unassigned to a specific person
        filteredTasks = tasks.filter(t =>
            (t.assignedEmployeeId === loggedInUser.id) ||
            (t.assignedSubDepartmentId && mySubDeptIds.includes(t.assignedSubDepartmentId) && !t.assignedEmployeeId)
        );
    }
    // --- END: Task Filtering Logic ---

    // Calculate notification badge counts based on the *filtered* data for the logged-in user.
    const ticketCount = filteredTickets.filter(t => t.status === TicketStatus.New || t.status === TicketStatus.Seen).length;

    let openCount = 0;
    let reviewCount = 0;

    if (isSupervisor) {
      const myEmployeeIds = users.filter(u => u.supervisorId === loggedInUser.id).map(u => u.id);
      const supervisorAdminTasks = tasks.filter(t => supervisorVisibleCategoryIds.includes(t.assignedCategoryId) && !t.assignedEmployeeId);
      openCount = supervisorAdminTasks.filter(t => t.status === 'To Do' || t.status === 'Seen').length;
      reviewCount = tasks.filter(t => t.status === 'Pending Supervisor Review' && t.assignedEmployeeId && myEmployeeIds.includes(t.assignedEmployeeId)).length;
    } else if (isEmployee) {
      openCount = filteredTasks.filter(t => t.status === 'To Do' || t.status === 'Seen').length;
    } else if (canViewAll) {
      reviewCount = tasks.filter(t => t.status === 'Pending Review').length;
    }
    
    return { 
        isFullAdmin, isSupervisor, isEmployee,
        visibleFaqs, 
        visibleTickets: filteredTickets,
        visibleTasks: filteredTasks,
        visibleCategories,
        supervisorCategories: supervisorManagableCategories,
        supervisorSubDepartments: supervisorManagableSubDepartments,
        openTicketsCount: ticketCount,
        openTasksCount: openCount,
        pendingReviewTasksCount: reviewCount,
        pendingStaffRequestsCount: pendingStaffReqCount,
        unacknowledgedApprovalsCount: approvalCount,
    };
  }, [loggedInUser, faqs, tickets, categories, subDepartments, tasks, employeeRequests, employeePermissions, users, hasAdminPermission]);

  const deleteFaq = (id: number) => {
    requestConfirm(
        t('confirm_deletion'),
        t('are_you_sure_delete_faq'),
        () => {
            setFaqs(prev => prev.filter(f => f.id !== id));
            addToast(t('faq_deleted_successfully'), 'success');
        },
        t('yes_delete')
    );
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const hasOpenTasks = tasks.some(t => t.assignedEmployeeId === employeeId && t.status !== 'Completed');
    if (hasOpenTasks) {
        window.alert(t('cannot_delete_employee_tasks'));
        return;
    }
    
    const hasAssignedTickets = tickets.some(t => t.assignedEmployeeId === employeeId && t.status !== 'Closed');
    if (hasAssignedTickets) {
         window.alert(t('cannot_delete_employee_tickets'));
        return;
    }

    requestConfirm(
        t('confirm_employee_deletion'),
        t('are_you_sure_delete_employee'),
        () => {
            setUsers(prev => prev.filter(u => u.id !== employeeId));
            addToast(t('employee_deleted_successfully'), 'success');
        },
        t('yes_delete')
    );
  };

  const handleCopyLink = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
        addToast(t('failed_to_copy_link'), 'error');
        return;
    }
    const linkIdentifier = category.slug || category.id;
    const url = `${window.location.origin}${window.location.pathname}#/category/${linkIdentifier}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLinkId(categoryId);
      addToast(t('link_copied'), 'info');
      setTimeout(() => setCopiedLinkId(null), 2500);
    }, (err) => {
      console.error('Failed to copy link: ', err);
      addToast(t('failed_to_copy_link'), 'error');
    });
  };

  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: Faq) => {
    setEditingFaq(faq);
    setIsFaqModalOpen(true);
  };
  
  const handleSaveFaq = (faqData: Faq) => {
      const isEditing = faqs.some(f => f.id === faqData.id);
      const updatedFaq = { 
          ...faqData, 
          updatedByUserId: loggedInUser.id,
          // If it's a new FAQ, also set the creator
          ...(!isEditing && { createdByUserId: loggedInUser.id })
      };
      if (isEditing) {
          setFaqs(faqs.map(f => f.id === updatedFaq.id ? updatedFaq : f));
          addToast(t('faq_updated_successfully'), 'success');
      } else {
          setFaqs([...faqs, updatedFaq]);
          addToast(t('faq_added_successfully'), 'success');
      }
      setIsFaqModalOpen(false);
      setEditingFaq(null);
  };

  const handleEditEmployeePermissions = (employee: User) => {
      setEditingEmployee(employee);
  };
  
  const handleSaveEmployeePermissions = (updatedUser: User) => {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingEmployee(null);
      addToast(t('permissions_updated_for').replace('{username}', updatedUser.username), 'success');
  };

  const canAddFaq = isFullAdmin || isSupervisor || employeePermissions?.canAddFaqs;

  const handleCreateFaqFromSuggestion = (subject: string, categoryId: string) => {
      // Fix: Add missing question_ar and answer_ar properties to match the Faq type.
      setEditingFaq({
          id: 0, // Placeholder ID for new FAQ
          question: subject,
          question_ar: subject, // Admin should translate this
          answer: '', // Admin should fill this in
          answer_ar: '', // Admin should fill this in
          categoryId: categoryId,
          createdAt: '',
          updatedAt: '',
          viewCount: 0,
          createdByUserId: '',
          updatedByUserId: '',
          satisfaction: 0,
          dissatisfaction: 0,
      });
      setIsFaqModalOpen(true);
      setActiveTab('faqs'); // Switch to FAQ tab
  };
  
  const handleTabClick = (tabId: AdminTab) => {
      setActiveTab(tabId);
      setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const navItemsUnfiltered: Array<{ id: AdminTab; label: string; icon: JSX.Element; notificationCount?: number; isVisible: boolean; }> = [
      { id: 'dashboard', label: t('nav_dashboard'), icon: <BriefcaseIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: (isFullAdmin || isSupervisor || employeePermissions?.canViewAnalytics) },
      { id: 'faqs', label: t('nav_faqs'), icon: <ClipboardListIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: true },
      { id: 'tickets', label: t('nav_tickets'), icon: <TicketIcon className="w-5 h-5"/>, notificationCount: openTicketsCount, isVisible: (isFullAdmin || isSupervisor || employeePermissions?.canHandleTickets) },
      { id: 'tasks', label: t('nav_tasks'), icon: <CheckCircleIcon className="w-5 h-5"/>, notificationCount: openTasksCount + pendingReviewTasksCount, isVisible: (isFullAdmin || isSupervisor || employeePermissions?.canHandleTasks) },
      { id: 'vehicles', label: t('nav_vehicles'), icon: <CarIcon className="w-5 h-5" />, notificationCount: 0, isVisible: isFullAdmin || isSupervisor },
      { id: 'manageTeam', label: t('nav_manage_team'), icon: <UsersIcon className="w-5 h-5"/>, notificationCount: unacknowledgedApprovalsCount, isVisible: isSupervisor },
      { id: 'subDepartments', label: t('nav_sub_departments'), icon: <DocumentDuplicateIcon className="w-5 h-5" />, notificationCount: 0, isVisible: isSupervisor },
      { id: 'staffRequests', label: t('nav_staff_requests'), icon: <UserPlusIcon className="w-5 h-5"/>, notificationCount: hasAdminPermission('approve_staff_requests') || hasAdminPermission('manage_staff_directly') ? pendingStaffRequestsCount : 0, isVisible: (hasAdminPermission('approve_staff_requests') || hasAdminPermission('manage_staff_directly') || isSupervisor) },
      { id: 'promotions', label: t('nav_promotions'), icon: <MegaphoneIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: hasAdminPermission('manage_promotions') },
      { id: 'categories', label: t('nav_categories'), icon: <MagnifyingGlassCircleIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: hasAdminPermission('manage_categories') },
      { id: 'supervisors', label: t('nav_supervisors'), icon: <UsersIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: hasAdminPermission('manage_supervisors') },
      { id: 'userActivity', label: t('nav_user_activity'), icon: <EyeIcon className="w-5 h-5"/>, notificationCount: 0, isVisible: hasAdminPermission('view_user_activity') },
  ];
  
  const navItems = navItemsUnfiltered.filter(item => item.isVisible);

  if (isFullAdmin) {
    navItems.push({ 
        id: 'settings', 
        label: t('nav_settings'), 
        icon: <LockClosedIcon className="w-5 h-5"/>, 
        isVisible: true,
        notificationCount: 0,
    });
  }
  
  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard':
              return <AnalyticsOverview 
                          faqs={visibleFaqs} 
                          tickets={visibleTickets}
                          categories={visibleCategories} 
                          tasks={visibleTasks} 
                          promotions={promotions}
                          users={users}
                          loggedInUser={loggedInUser}
                          canViewAllDashboards={hasAdminPermission('view_all_dashboards')}
                          onCreateFaqFromSuggestion={handleCreateFaqFromSuggestion}
                          onEditEmployeePermissions={handleEditEmployeePermissions}
                          onDeleteEmployee={handleDeleteEmployee}
                          onNavigateToTab={setActiveTab}
                      />;
          case 'faqs':
              return <ManageFaqs 
                          faqs={visibleFaqs}
                          categories={visibleCategories}
                          subDepartments={isFullAdmin ? subDepartments : supervisorSubDepartments}
                          deleteFaq={deleteFaq}
                          onEditFaq={handleOpenEditFaq}
                          onAddFaq={handleOpenAddFaq}
                          canAddFaq={canAddFaq}
                      />;
          case 'tickets':
              return <ManageTickets 
                          tickets={visibleTickets}
                          setTickets={setTickets}
                          faqs={faqs}
                          setFaqs={setFaqs}
                          categories={visibleCategories}
                          subDepartments={subDepartments}
                          loggedInUser={loggedInUser}
                          addToast={addToast}
                          users={users}
                      />;
          case 'tasks':
              return <ManageTasks 
                          tasks={tasks} // Pass full tasks list for accurate filtering inside
                          setTasks={setTasks}
                          categories={categories} // Pass full categories for lookups
                          subDepartments={subDepartments}
                          users={users}
                          loggedInUser={loggedInUser}
                          addToast={addToast}
                          requestConfirm={requestConfirm}
                          hasViewAllPermission={hasAdminPermission('view_all_dashboards')}
                       />;
          case 'vehicles':
              return <ManageVehicles
                          vehicles={vehicles}
                          setVehicles={setVehicles}
                          vehicleLicenses={vehicleLicenses}
                          setVehicleLicenses={setVehicleLicenses}
                          violations={violations}
                          setViolations={setViolations}
                          users={users}
                          loggedInUser={loggedInUser}
                          addToast={addToast}
                          requestConfirm={requestConfirm}
                      />;
          case 'categories':
              return <ManageCategories 
                          categories={categories}
                          setCategories={setCategories}
                          faqs={faqs}
                          tickets={tickets}
                          tasks={tasks}
                          users={users}
                          subDepartments={subDepartments}
                          onCopyLink={handleCopyLink}
                          copiedLinkId={copiedLinkId}
                          addToast={addToast}
                          requestConfirm={requestConfirm}
                      />;
           case 'subDepartments':
                return <ManageSubDepartments
                            subDepartments={supervisorSubDepartments}
                            setSubDepartments={setSubDepartments}
                            supervisorCategories={supervisorCategories}
                            loggedInUser={loggedInUser}
                            users={users}
                            tickets={tickets}
                            tasks={tasks}
                            addToast={addToast}
                            requestConfirm={requestConfirm}
                        />;
          case 'promotions':
              return <ManagePromotions
                          promotions={promotions}
                          setPromotions={setPromotions}
                          addToast={addToast}
                          siteConfig={siteConfig}
                          setSiteConfig={setSiteConfig}
                          requestConfirm={requestConfirm}
                          loggedInUser={loggedInUser}
                      />;
          case 'supervisors':
              return <ManageSupervisors
                          users={users}
                          setUsers={setUsers}
                          categories={categories}
                          addToast={addToast}
                          employeeRequests={employeeRequests}
                          requestConfirm={requestConfirm}
                      />;
          case 'staffRequests':
              return <ManageStaffRequests
                          employeeRequests={employeeRequests}
                          setEmployeeRequests={setEmployeeRequests}
                          users={users}
                          setUsers={setUsers}
                          loggedInUser={loggedInUser}
                          addToast={addToast}
                          canApprove={hasAdminPermission('approve_staff_requests')}
                      />;
          case 'manageTeam':
              return <ManageTeam
                          users={users}
                          subDepartments={supervisorSubDepartments}
                          loggedInUser={loggedInUser}
                          onEditPermissions={handleEditEmployeePermissions}
                          onDeleteEmployee={handleDeleteEmployee}
                      />;
          case 'userActivity':
              return <UserActivityReport
                          users={users}
                          tickets={tickets}
                          tasks={tasks}
                          faqs={faqs}
                          promotions={promotions}
                          employeeRequests={employeeRequests}
                          categories={categories}
                      />;
          case 'settings':
              return (
                  <Settings
                      users={users} setUsers={setUsers}
                      faqs={faqs} setFaqs={setFaqs}
                      tickets={tickets} setTickets={setTickets}
                      categories={categories} setCategories={setCategories}
                      subDepartments={subDepartments} setSubDepartments={setSubDepartments}
                      tasks={tasks} setTasks={setTasks}
                      promotions={promotions} setPromotions={setPromotions}
                      employeeRequests={employeeRequests} setEmployeeRequests={setEmployeeRequests}
                      siteConfig={siteConfig} setSiteConfig={setSiteConfig}
                      vehicles={vehicles} setVehicles={setVehicles}
                      vehicleLicenses={vehicleLicenses} setVehicleLicenses={setVehicleLicenses}
                      violations={violations} setViolations={setViolations}
                      violationRules={violationRules}
                      setViolationRules={setViolationRules}
                      requestConfirm={requestConfirm}
                      addToast={addToast}
                  />
              );
          default:
              return <AnalyticsOverview 
                          faqs={visibleFaqs} 
                          tickets={visibleTickets} 
                          categories={visibleCategories} 
                          tasks={visibleTasks} 
                          promotions={promotions} 
                          users={users} 
                          loggedInUser={loggedInUser} 
                          canViewAllDashboards={hasAdminPermission('view_all_dashboards')}
                          onCreateFaqFromSuggestion={handleCreateFaqFromSuggestion}
                          onEditEmployeePermissions={handleEditEmployeePermissions}
                          onDeleteEmployee={handleDeleteEmployee}
                          onNavigateToTab={setActiveTab}
                      />;
      }
  };

  return (
    <>
      {isFaqModalOpen && (
        <FaqEditModal
          faqToEdit={editingFaq}
          categories={isFullAdmin ? categories : supervisorCategories}
          subDepartments={isFullAdmin ? subDepartments : supervisorSubDepartments}
          onClose={() => setIsFaqModalOpen(false)}
          onSave={handleSaveFaq}
        />
      )}
      {editingEmployee && (
        <EmployeePermissionModal
          employee={editingEmployee}
          availableSubDepartments={supervisorSubDepartments}
          allUsers={users}
          onClose={() => setEditingEmployee(null)}
          onSave={handleSaveEmployeePermissions}
        />
      )}
      {confirmationState?.isOpen && (
        <ConfirmationModal
          title={confirmationState.title}
          message={confirmationState.message}
          confirmText={confirmationState.confirmText}
          onConfirm={confirmationState.onConfirm}
          onClose={() => setConfirmationState(null)}
        />
      )}
      <div className="bg-slate-100 min-h-[calc(100vh-128px)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-3 xl:col-span-2">
              <div className="lg:hidden mb-4">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-full flex justify-between items-center px-4 py-2 bg-white rounded-md shadow-sm border border-slate-200">
                  <span className="font-semibold text-slate-700">{navItems.find(item => item.id === activeTab)?.label}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <nav className={`space-y-1 ${isMobileMenuOpen ? 'block mb-6' : 'hidden'} lg:block`}>
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${ language === 'ar' ? 'text-right' : 'text-left' } ${
                      activeTab === item.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.icon}
                    <span className="mx-3 flex-1">{item.label}</span>
                    {item.notificationCount && item.notificationCount > 0 ? (
                      <span className="ms-auto inline-block py-0.5 px-2.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {item.notificationCount}
                      </span>
                    ) : null}
                  </button>
                ))}
              </nav>
            </div>
            <main className="lg:col-span-9 xl:col-span-10">
              {(isSupervisor || isEmployee) && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">{loggedInUser.username}</h3>
                    {loggedInUser.designation && <p className="text-sm text-slate-500">{language === 'ar' ? loggedInUser.designation_ar : loggedInUser.designation}</p>}
                </div>
              )}
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;