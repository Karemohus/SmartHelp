import { TicketStatus, EmployeePermission, AdminPermission } from '../../types';

export const getEmployeePermissionLabels = (t: (key: string) => string): Record<EmployeePermission, string> => ({
    handle_tickets: t('perm_handle_tickets'),
    handle_tasks: t('perm_handle_tasks'),
    add_faqs: t('perm_add_faqs'),
    view_analytics: t('perm_view_analytics'),
    close_tickets: t('perm_close_tickets')
});

export const getAdminPermissionLabels = (t: (key: string) => string): Record<AdminPermission, { title: string, description: string }> => ({
    view_all_dashboards: { title: t('perm_view_all_dashboards_title'), description: t('perm_view_all_dashboards_desc') },
    manage_categories: { title: t('perm_manage_categories_title'), description: t('perm_manage_categories_desc') },
    manage_promotions: { title: t('perm_manage_promotions_title'), description: t('perm_manage_promotions_desc') },
    approve_staff_requests: { title: t('perm_approve_staff_requests_title'), description: t('perm_approve_staff_requests_desc') },
    manage_site_config: { title: t('perm_manage_site_config_title'), description: t('perm_manage_site_config_desc') },
    manage_supervisors: { title: t('perm_manage_supervisors_title'), description: t('perm_manage_supervisors_desc') },
    view_user_activity: { title: t('perm_view_user_activity_title'), description: t('perm_view_user_activity_desc') },
    manage_staff_directly: { title: t('perm_manage_staff_directly_title'), description: t('perm_manage_staff_directly_desc') },
});

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