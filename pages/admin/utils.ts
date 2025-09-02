
import { TicketStatus, EmployeePermission, AdminPermission } from '../../types';

export const employeePermissionLabels: Record<EmployeePermission, string> = {
    handle_tickets: 'Handle Tickets & Complaints',
    handle_tasks: 'Handle Assigned Tasks',
    add_faqs: 'Add FAQs',
    view_analytics: 'View Analytics Dashboard',
    close_tickets: 'Close Answered Tickets'
};

export const adminPermissionLabels: Record<AdminPermission, { title: string, description: string }> = {
    view_all_dashboards: { title: 'View All Dashboards', description: 'Access analytics & performance for all categories and teams.' },
    manage_categories: { title: 'Manage Categories', description: 'Create, edit, and delete all support categories.' },
    manage_promotions: { title: 'Manage Promotions', description: 'Create and manage site-wide promotions for customers.' },
    approve_staff_requests: { title: 'Approve Staff Requests', description: 'Approve or reject new employee account requests from other supervisors.' },
    manage_site_config: { title: 'Manage Site Configuration', description: 'Edit site name, logo, and global settings.' },
    manage_supervisors: { title: 'Manage Supervisors', description: 'Add, edit, or delete other supervisor accounts.' },
    view_user_activity: { title: 'View User Activity', description: 'Search for and view detailed activity logs for any employee or supervisor.' },
    manage_staff_directly: { title: 'Manage Staff Directly', description: 'Create employee accounts directly, bypassing the admin approval process.' },
};

export const formatDuration = (ms: number): string => {
    if (ms < 0) ms = 0;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
};

export const getTicketStatusBadgeColor = (status: TicketStatus) => {
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