

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Faq, Ticket, SiteConfig, User, UserRole, Category, Task, ToastMessage, AppNotification, TicketStatus, TaskStatus, EmployeeRequest, Promotion, SubDepartment, Vehicle, VehicleLicense, Violation, ViolationRule } from '../types';
import { INITIAL_FAQS, INITIAL_TICKETS, INITIAL_CATEGORIES, INITIAL_TASKS, INITIAL_USERS, INITIAL_SUB_DEPARTMENTS, INITIAL_VEHICLES, INITIAL_VEHICLE_LICENSES, INITIAL_VIOLATIONS, INITIAL_VIOLATION_RULES } from '../constants';
import useLocalStorage from './useLocalStorage';
import usePrevious from './usePrevious';

export const useDataStore = () => {
    // All data persistence logic is centralized here.
    const [loggedInUser, setLoggedInUser] = useLocalStorage<User | null>('smartfaq_loggedInUser', null);
    const [users, setUsers] = useLocalStorage<User[]>('smartfaq_users', INITIAL_USERS);
    const [faqs, setFaqs] = useLocalStorage<Faq[]>('smartfaq_faqs', INITIAL_FAQS);
    const [tickets, setTickets] = useLocalStorage<Ticket[]>('smartfaq_tickets', INITIAL_TICKETS);
    const [categories, setCategories] = useLocalStorage<Category[]>('smartfaq_categories', INITIAL_CATEGORIES);
    const [subDepartments, setSubDepartments] = useLocalStorage<SubDepartment[]>('smartfaq_subDepartments', INITIAL_SUB_DEPARTMENTS);
    const [tasks, setTasks] = useLocalStorage<Task[]>('smartfaq_tasks', INITIAL_TASKS);
    const [promotions, setPromotions] = useLocalStorage<Promotion[]>('smartfaq_promotions', []);
    const [employeeRequests, setEmployeeRequests] = useLocalStorage<EmployeeRequest[]>('smartfaq_employee_requests', []);
    const [siteConfig, setSiteConfig] = useLocalStorage<SiteConfig>('smartfaq_siteConfig', {
        name: 'SmartHelp',
        logo: null,
        notificationSettings: {
            persistentNotificationsEnabled: false,
        },
        promotionDisplayStrategy: 'show-once',
    });
    // New vehicle data stores
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('smartfaq_vehicles', INITIAL_VEHICLES);
    const [vehicleLicenses, setVehicleLicenses] = useLocalStorage<VehicleLicense[]>('smartfaq_vehicleLicenses', INITIAL_VEHICLE_LICENSES);
    const [violations, setViolations] = useLocalStorage<Violation[]>('smartfaq_violations', INITIAL_VIOLATIONS);
    const [violationRules, setViolationRules] = useLocalStorage<ViolationRule[]>('smartfaq_violation_rules', INITIAL_VIOLATION_RULES);


    // Ephemeral state for real-time toasts and notifications.
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [notification, setNotification] = useState<AppNotification | null>(null);
    const [notificationQueue, setNotificationQueue] = useState<AppNotification[]>([]);

    const navigate = useNavigate();
    const prevTickets = usePrevious(tickets);
    const prevTasks = usePrevious(tasks);
    const prevLoggedInUser = usePrevious(loggedInUser);
    const prevEmployeeRequests = usePrevious(employeeRequests);
    const prevUsers = usePrevious(users);
    const prevVehicles = usePrevious(vehicles);

    const addToast = useCallback((message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const pushToQueue = useCallback((notification: AppNotification) => {
        setNotificationQueue(prev => [...prev, notification]);
    }, []);
    
    // Effect to listen for global storage errors from useLocalStorage hook
    useEffect(() => {
        const handleStorageError = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.message) {
                addToast(customEvent.detail.message, 'error');
            }
        };
        
        window.addEventListener('storage_error', handleStorageError);
        
        return () => {
            window.removeEventListener('storage_error', handleStorageError);
        };
    }, [addToast]);

    // Effect to process the notification queue one by one
    useEffect(() => {
        if (!notification && notificationQueue.length > 0) {
            const [nextNotification, ...rest] = notificationQueue;
            setNotification(nextNotification);
            setNotificationQueue(rest);
        }
    }, [notification, notificationQueue]);

    // Effect to populate notification queue on login or initial load with a logged-in user
    useEffect(() => {
        if (!prevLoggedInUser && loggedInUser) {
            const now = Date.now();

            // --- SUPERVISOR LOGIN ---
            if (loggedInUser.role === UserRole.Supervisor) {
                const canViewAll = loggedInUser.adminPermissions?.includes('view_all_dashboards');
                const userCategoryIds = canViewAll ? categories.map(c => c.id) : (loggedInUser.assignedCategoryIds || []);
                const myEmployeeIds = users.filter(u => u.supervisorId === loggedInUser.id).map(u => u.id);

                const ticketCount = tickets.filter(t => userCategoryIds.includes(t.categoryId) && (t.status === TicketStatus.New || t.status === TicketStatus.Seen)).length;
                if (ticketCount > 0) {
                    pushToQueue({ id: now + 1, itemId: 'tickets-summary', type: 'ticket', title: 'Pending Support Tickets', message: `You have ${ticketCount} pending ticket(s) awaiting a response.`, navigateTo: 'tickets' });
                }

                const adminTasksCount = tasks.filter(t => userCategoryIds.includes(t.assignedCategoryId) && !t.assignedEmployeeId && (t.status === TaskStatus.ToDo || t.status === TaskStatus.Seen)).length;
                if (adminTasksCount > 0) {
                    pushToQueue({ id: now + 2, itemId: 'tasks-admin-summary', type: 'task', title: 'New Tasks From Admin', message: `You have ${adminTasksCount} new task(s) from an admin.`, navigateTo: 'tasks' });
                }

                const reviewTasksCount = tasks.filter(t => t.status === TaskStatus.PendingSupervisorReview && t.assignedEmployeeId && myEmployeeIds.includes(t.assignedEmployeeId)).length;
                if (reviewTasksCount > 0) {
                    pushToQueue({ id: now + 3, itemId: 'tasks-review-summary', type: 'task', title: 'Tasks Awaiting Review', message: `You have ${reviewTasksCount} task(s) from your team for review.`, navigateTo: 'tasks' });
                }

                const approvalCount = employeeRequests.filter(req => req.requestedBySupervisorId === loggedInUser.id && req.status === 'approved' && !req.acknowledgedBySupervisor).length;
                if (approvalCount > 0) {
                    pushToQueue({ id: now + 4, itemId: 'staff-approval-summary', type: 'employee_approval', title: 'Employee Request Approved', message: `You have ${approvalCount} new employee request(s) that have been approved.`, navigateTo: 'manageTeam' });
                }
            }

            // --- ADMIN / PRIVILEGED SUPERVISOR LOGIN ---
            if (loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards')) {
                const reviewCount = tasks.filter(t => t.status === TaskStatus.PendingReview).length;
                if (reviewCount > 0) {
                    pushToQueue({ id: now + 5, itemId: 'admin-review-summary', type: 'task', title: 'Tasks Ready for Review', message: `There are ${reviewCount} tasks from supervisors ready for your review.`, navigateTo: 'tasks' });
                }

                if (loggedInUser.adminPermissions?.includes('approve_staff_requests') || loggedInUser.role === UserRole.Admin) {
                    const pendingStaffCount = employeeRequests.filter(req => req.status === 'pending').length;
                    if (pendingStaffCount > 0) {
                        pushToQueue({ id: now + 7, itemId: 'admin-staff-request-summary', type: 'employee_approval', title: 'Pending Staff Requests', message: `There are ${pendingStaffCount} new employee requests awaiting your approval.`, navigateTo: 'staffRequests' });
                    }
                }
            }

            // --- EMPLOYEE LOGIN ---
            if (loggedInUser.role === UserRole.Employee) {
                const employeeTasksCount = tasks.filter(t => t.assignedEmployeeId === loggedInUser.id && (t.status === TaskStatus.ToDo || t.status === TaskStatus.Seen)).length;
                if (employeeTasksCount > 0) {
                    pushToQueue({ id: now + 6, itemId: 'employee-tasks-summary', type: 'task', title: 'You Have Open Tasks', message: `You have ${employeeTasksCount} open task(s) that require your attention.`, navigateTo: 'tasks' });
                }
            }
        }
    }, [loggedInUser, prevLoggedInUser, categories, users, tickets, tasks, employeeRequests, pushToQueue]);


    // --- START: REAL-TIME NOTIFICATION EFFECTS ---

    // Effect for new TICKETS
    useEffect(() => {
        if (!loggedInUser || !prevTickets) return;
        const newTicket = tickets.find(t => !prevTickets.some(pt => pt.id === t.id) && t.status === TicketStatus.New);

        if (newTicket) {
            const categoryName = categories.find(c => c.id === newTicket.categoryId)?.name || 'a category';
            const isAdminOrSuperAdmin = loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards');

            const notificationPayload: AppNotification = {
                id: Date.now(),
                itemId: newTicket.id,
                type: 'ticket',
                title: 'New Support Ticket',
                message: `A new ticket "${newTicket.subject}" has been submitted to ${categoryName}.`,
                navigateTo: 'tickets'
            };

            // For Admins and SuperAdmins: Notify for any new ticket
            if (isAdminOrSuperAdmin) {
                pushToQueue(notificationPayload);
            }
            // For Supervisors: Notify if the ticket is in one of their main categories.
            else if (loggedInUser.role === UserRole.Supervisor) {
                const supervisorCategoryIds = loggedInUser.assignedCategoryIds || [];
                if (supervisorCategoryIds.includes(newTicket.categoryId)) {
                    pushToQueue(notificationPayload);
                }
            }
            // For Employees: Notify if the ticket is in one of their sub-departments.
            else if (loggedInUser.role === UserRole.Employee && loggedInUser.permissions?.includes('handle_tickets')) {
                if (newTicket.subDepartmentId && loggedInUser.assignedSubDepartmentIds?.includes(newTicket.subDepartmentId)) {
                    const subDeptName = subDepartments.find(sd => sd.id === newTicket.subDepartmentId)?.name || 'your team';
                    pushToQueue({ ...notificationPayload, title: 'New Ticket For You', message: `A new ticket for "${subDeptName}" has been submitted: "${newTicket.subject}".` });
                }
            }
        }
    }, [tickets, prevTickets, loggedInUser, categories, subDepartments, pushToQueue]);


    // Effect for new TICKET ASSIGNMENTS
    useEffect(() => {
        if (!loggedInUser || !prevTickets) return;
    
        for (const currentTicket of tickets) {
            const prevTicket = prevTickets.find(pt => pt.id === currentTicket.id);
            // Check for transition from unassigned/differently-assigned to newly assigned
            if (prevTicket && prevTicket.assignedEmployeeId !== currentTicket.assignedEmployeeId && currentTicket.assignedEmployeeId) {
                const assignedEmployee = users.find(u => u.id === currentTicket.assignedEmployeeId);
                if (!assignedEmployee) continue;
                
                const supervisor = users.find(u => u.id === assignedEmployee.supervisorId);

                // Notification for the assigned employee
                if (loggedInUser.id === assignedEmployee.id) {
                    const message = supervisor 
                        ? `Supervisor "${supervisor.username}" has assigned you a new ticket: "${currentTicket.subject}".`
                        : `A new ticket has been assigned to you: "${currentTicket.subject}".`;
                    pushToQueue({ id: Date.now(), itemId: currentTicket.id, type: 'ticket', title: 'New Ticket Assignment', message, navigateTo: 'tickets' });
                } 
                // Notification for the employee's supervisor
                else if (supervisor && loggedInUser.id === supervisor.id) {
                    pushToQueue({ id: Date.now(), itemId: currentTicket.id, type: 'ticket', title: 'Team Ticket Assigned', message: `Ticket "${currentTicket.subject}" was assigned to your team member, ${assignedEmployee.username}.`, navigateTo: 'tickets'});
                }
                // Notification for Admins/SuperAdmins (if they are not the supervisor being notified)
                else if ((loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards')) && loggedInUser.id !== supervisor?.id) {
                     pushToQueue({ id: Date.now(), itemId: currentTicket.id, type: 'ticket', title: 'Ticket Assigned', message: `Ticket "${currentTicket.subject}" has been assigned to ${assignedEmployee.username}.`, navigateTo: 'tickets'});
                }
            }
        }
    }, [tickets, prevTickets, loggedInUser, users, pushToQueue]);


    // Effect for new TASKS
    useEffect(() => {
        if (!loggedInUser || !prevTasks) return;

        const newTask = tasks.find(t => !prevTasks.some(pt => pt.id === t.id));

        if (newTask) {
            const isAdminOrSuperAdmin = loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards');
            
            // Notification for Admins/SuperAdmins for ANY new task
            if (isAdminOrSuperAdmin) {
                 const categoryName = categories.find(c => c.id === newTask.assignedCategoryId)?.name || 'a category';
                 const assigneeName = newTask.assignedEmployeeId ? users.find(u => u.id === newTask.assignedEmployeeId)?.username : (newTask.assignedSubDepartmentId ? subDepartments.find(sd => sd.id === newTask.assignedSubDepartmentId)?.name : categoryName);
                 pushToQueue({ id: Date.now(), itemId: newTask.id, type: 'task', title: 'New Task Created', message: `Task "${newTask.title}" was created for ${assigneeName}.`, navigateTo: 'tasks'});
            }
            // For Supervisor: new task from Admin
            else if (loggedInUser.role === UserRole.Supervisor) {
                const isForMyCategory = !newTask.assignedEmployeeId && !newTask.assignedSubDepartmentId && (loggedInUser.assignedCategoryIds || []).includes(newTask.assignedCategoryId);
                if (isForMyCategory) {
                    const categoryName = categories.find(c => c.id === newTask.assignedCategoryId)?.name || 'your assigned category';
                    pushToQueue({ id: Date.now(), itemId: newTask.id, type: 'task', title: 'New Task Assigned', message: `A new task "${newTask.title}" has been assigned to the ${categoryName} category.`, navigateTo: 'tasks' });
                }
            }
            // For Employee: new task from Supervisor
            else if (loggedInUser.role === UserRole.Employee) {
                const isForMe = newTask.assignedEmployeeId === loggedInUser.id;
                const isForMySubDept = !newTask.assignedEmployeeId && newTask.assignedSubDepartmentId && (loggedInUser.assignedSubDepartmentIds || []).includes(newTask.assignedSubDepartmentId);
                
                if (isForMe || isForMySubDept) {
                    pushToQueue({ id: Date.now(), itemId: newTask.id, type: 'task', title: 'New Task Assigned', message: `You have been assigned a new task: "${newTask.title}".`, navigateTo: 'tasks' });
                }
            }
        }
    }, [tasks, prevTasks, loggedInUser, categories, users, subDepartments, pushToQueue]);


    // Effect for new STAFF REQUESTS (for Admins/Approvers)
    useEffect(() => {
        if (!loggedInUser || !prevEmployeeRequests) return;

        const canApprove = loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('approve_staff_requests');
        if (!canApprove) return;

        const newRequest = employeeRequests.find(
            req => !prevEmployeeRequests.some(pReq => pReq.id === req.id) && req.status === 'pending'
        );
        
        if (newRequest) {
            const requester = users.find(u => u.id === newRequest.requestedBySupervisorId);
            const message = requester 
                ? `Supervisor "${requester.username}" has requested a new employee account for "${newRequest.newEmployeeUsername}".`
                : `A new employee account for "${newRequest.newEmployeeUsername}" has been requested.`;

            pushToQueue({
                id: Date.now(),
                itemId: newRequest.id,
                type: 'employee_approval',
                title: 'New Staff Request',
                message: message,
                navigateTo: 'staffRequests'
            });
        }
    }, [employeeRequests, prevEmployeeRequests, loggedInUser, users, pushToQueue]);

    // Effect for STATUS CHANGE notifications
    useEffect(() => {
        if (!loggedInUser || !prevTasks || !tasks) return;
    
        for (const currentTask of tasks) {
            const previousTask = prevTasks.find(pt => pt.id === currentTask.id);
            if (!previousTask || previousTask.status === currentTask.status) continue;
    
            const wasInProgress = previousTask.status === TaskStatus.ToDo || previousTask.status === TaskStatus.Seen;
            const wasPendingReviewBySupervisor = previousTask.status === TaskStatus.PendingSupervisorReview;
            const isAdminOrSuperAdmin = loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards');
    
            // --- Case 1: Employee submits to Supervisor ---
            if (currentTask.status === TaskStatus.PendingSupervisorReview && wasInProgress && currentTask.performedByUserId) {
                const employee = users.find(u => u.id === currentTask.performedByUserId);
                if (!employee) continue;
    
                const supervisor = users.find(u => u.id === employee.supervisorId);
    
                // Notify Supervisor
                if (supervisor && loggedInUser.id === supervisor.id) {
                    pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Task Submitted for Review', message: `Employee "${employee.username}" submitted task "${currentTask.title}" for your review.`, navigateTo: 'tasks' });
                }
                // Notify Admin/SuperAdmin
                else if (isAdminOrSuperAdmin) {
                    pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Task Submitted to Supervisor', message: `Employee "${employee.username}" submitted task "${currentTask.title}" to their supervisor.`, navigateTo: 'tasks' });
                }
            }
    
            // --- Case 2: Supervisor submits to Admin ---
            else if (currentTask.status === TaskStatus.PendingReview && wasInProgress && currentTask.performedByUserId) {
                if (isAdminOrSuperAdmin) {
                    const performer = users.find(u => u.id === currentTask.performedByUserId);
                    const category = categories.find(c => c.id === currentTask.assignedCategoryId);
                    const message = performer
                        ? `Supervisor "${performer.username}" submitted a task for review in the "${category?.name}" category: "${currentTask.title}".`
                        : `A task in the "${category?.name}" category is ready for review: "${currentTask.title}".`;
                    pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Task Ready for Review', message, navigateTo: 'tasks' });
                }
            }
    
            // --- Case 3: Supervisor/Admin approves Employee's work ---
            else if (currentTask.status === TaskStatus.Completed && wasPendingReviewBySupervisor) {
                // Notify the Employee whose task was approved
                if (loggedInUser.id === currentTask.assignedEmployeeId) {
                    pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Task Approved!', message: `Your task "${currentTask.title}" has been approved and completed by your supervisor.`, navigateTo: 'tasks' });
                }
                // Notify Admin/SuperAdmin
                else if (isAdminOrSuperAdmin) {
                    const employee = users.find(u => u.id === currentTask.assignedEmployeeId);
                    const approver = users.find(u => u.id === currentTask.completedByUserId);
                    if (employee && approver) {
                        pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Employee Task Approved', message: `${approver.username} approved task "${currentTask.title}" for ${employee.username}.`, navigateTo: 'tasks' });
                    }
                }
            }
    
            // --- Case 4: Supervisor/Admin rejects Employee's work ---
            else if (currentTask.status === TaskStatus.ToDo && wasPendingReviewBySupervisor) {
                // Notify the Employee whose task was rejected
                if (loggedInUser.id === currentTask.assignedEmployeeId) {
                    const feedbackMessage = currentTask.adminFeedback
                        ? `Your supervisor requested changes for "${currentTask.title}": ${currentTask.adminFeedback}`
                        : `Your supervisor requested changes for task "${currentTask.title}". Please review and resubmit.`;
                    pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Task Requires Changes', message: feedbackMessage, navigateTo: 'tasks' });
                }
                // Notify Admin/SuperAdmin
                else if (isAdminOrSuperAdmin) {
                    const employee = users.find(u => u.id === currentTask.assignedEmployeeId);
                    if (employee) {
                        pushToQueue({ id: Date.now(), itemId: currentTask.id, type: 'task', title: 'Employee Task Rejected', message: `A submission for task "${currentTask.title}" from ${employee.username} was rejected and needs rework.`, navigateTo: 'tasks' });
                    }
                }
            }
        }
    }, [tasks, prevTasks, loggedInUser, users, categories, pushToQueue]);

    
    // Effect for re-opened TICKET notifications for employees
    useEffect(() => {
        if (!loggedInUser || !prevTickets || !tickets) return;
    
        for (const currentTicket of tickets) {
            const previousTicket = prevTickets.find(pt => pt.id === currentTicket.id);
            if (!previousTicket) continue;
    
            if (previousTicket.status === TicketStatus.Answered && currentTicket.status === TicketStatus.Seen) {
                const isAdminOrSuperAdmin = loggedInUser.role === UserRole.Admin || loggedInUser.adminPermissions?.includes('view_all_dashboards');
                const answeringUser = users.find(u => u.id === currentTicket.answeredByUserId);
                
                // Notify the original responder
                if (answeringUser && loggedInUser.id === answeringUser.id) {
                    pushToQueue({ id: Date.now(), itemId: currentTicket.id, type: 'ticket', title: 'Ticket Re-opened', message: `Ticket "${currentTicket.subject}" has been re-opened for your review.`, navigateTo: 'tickets' });
                } 
                // Notify Admins/Supervisors who weren't the original responder
                else if (isAdminOrSuperAdmin) {
                    pushToQueue({ id: Date.now(), itemId: currentTicket.id, type: 'ticket', title: 'Ticket Re-opened', message: `Ticket "${currentTicket.subject}" was re-opened by the customer.`, navigateTo: 'tickets' });
                }
            }
        }
    }, [tickets, prevTickets, loggedInUser, users, pushToQueue]);


    // Effect for Employee Request RESOLUTION notifications (for Supervisors)
    useEffect(() => {
        if (!loggedInUser || !prevEmployeeRequests) return;

        if (loggedInUser.role !== UserRole.Supervisor) return;

        for (const currentReq of employeeRequests) {
            const prevReq = prevEmployeeRequests.find(pr => pr.id === currentReq.id);
            if (!prevReq || prevReq.status === currentReq.status) continue;

            if (currentReq.status !== 'pending' && currentReq.requestedBySupervisorId === loggedInUser.id) {
                pushToQueue({
                    id: Date.now(),
                    itemId: currentReq.id,
                    type: 'employee_approval',
                    title: `Request ${currentReq.status}`,
                    message: `Your request for employee "${currentReq.newEmployeeUsername}" was ${currentReq.status}.`,
                    navigateTo: 'staffRequests'
                });
            }
        }
    }, [employeeRequests, prevEmployeeRequests, loggedInUser, pushToQueue]);

    // Effect for Automated Violations
    useEffect(() => {
      if (!violationRules || violationRules.length === 0 || !prevUsers || !prevVehicles) return;

      const now = new Date();
      const newViolations: Violation[] = [];

      // --- Speeding Check ---
      const speedingRule = violationRules.find(r => r.type === 'speeding' && r.isEnabled);
      if (speedingRule) {
        const currentDrivers = users.filter(u => u.role === 'driver');
        currentDrivers.forEach(driver => {
            const prevDriverState = prevUsers.find(u => u.id === driver.id);
            const wasNotSpeeding = !prevDriverState?.currentSpeed || prevDriverState.currentSpeed <= speedingRule.threshold;
            const isSpeedingNow = driver.currentSpeed && driver.currentSpeed > speedingRule.threshold;

            // Trigger violation only when crossing the speed limit threshold
            if (isSpeedingNow && wasNotSpeeding) {
                const vehicle = vehicles.find(v => v.assignedDriverId === driver.id);
                if (vehicle) {
                    newViolations.push({
                        id: `vio_${Date.now()}_${driver.id}`,
                        driverId: driver.id,
                        vehicleId: vehicle.id,
                        date: now.toISOString(),
                        description: speedingRule.description.replace('{speed}', driver.currentSpeed!.toString()).replace('{threshold}', speedingRule.threshold.toString()),
                        amount: speedingRule.fineAmount,
                        status: 'pending',
                    });
                }
            }
        });
      }

      // --- Maintenance Check ---
      const maintenanceRule = violationRules.find(r => r.type === 'missed_maintenance' && r.isEnabled);
      if (maintenanceRule) {
        vehicles.forEach(vehicle => {
          if (vehicle.nextMaintenanceDate && new Date(vehicle.nextMaintenanceDate) < now) {
            const triggerId = `maintenance-${vehicle.id}-${vehicle.nextMaintenanceDate}`;
            if (vehicle.assignedDriverId && !violations.some(v => v.triggerEventId === triggerId)) {
              newViolations.push({
                id: `vio_${Date.now()}_${vehicle.id}`,
                driverId: vehicle.assignedDriverId,
                vehicleId: vehicle.id,
                date: now.toISOString(),
                description: maintenanceRule.description.replace('{date}', new Date(vehicle.nextMaintenanceDate!).toLocaleDateString()),
                amount: maintenanceRule.fineAmount,
                status: 'pending',
                triggerEventId: triggerId,
              });
            }
          }
        });
      }

      if (newViolations.length > 0) {
        setViolations(prev => [...prev, ...newViolations]);
        addToast(`${newViolations.length} new violation(s) automatically generated.`, 'info');
      }
    }, [users, prevUsers, vehicles, prevVehicles, violationRules, violations, setViolations, addToast]);

    // --- Core Action Handlers ---

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const handleLogin = useCallback((username: string, password: string): boolean => {
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
        if (user) {
            const userToLogin = { ...user };
            // Ensure password is not stored in loggedInUser state for security.
            delete userToLogin.password;
            setLoggedInUser(userToLogin);
            addToast(`Welcome back, ${user.username}!`, 'success');
            return true;
        }
        return false;
    }, [users, setLoggedInUser, addToast]);

    const handleLogout = useCallback(() => {
        setLoggedInUser(null);
    }, [setLoggedInUser]);

    const handleTicketSubmit = useCallback((ticket: Ticket) => {
        setTickets(prev => [ticket, ...prev].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        addToast('Your ticket has been submitted successfully!', 'success');
    }, [setTickets, addToast]);

    const handleFaqView = useCallback((id: number) => {
        setFaqs(prevFaqs => prevFaqs.map(faq =>
            faq.id === id ? { ...faq, viewCount: faq.viewCount + 1 } : faq
        ));
    }, [setFaqs]);

    const handleFaqRate = useCallback((id: number, rating: 'satisfied' | 'dissatisfied') => {
        setFaqs(prevFaqs => prevFaqs.map(faq => {
            if (faq.id === id) {
                return {
                    ...faq,
                    satisfaction: faq.satisfaction + (rating === 'satisfied' ? 1 : 0),
                    dissatisfaction: faq.dissatisfaction + (rating === 'dissatisfied' ? 1 : 0),
                };
            }
            return faq;
        }));
    }, [setFaqs]);

    const handleTicketRate = useCallback((ticketId: string, rating: 'satisfied' | 'dissatisfied') => {
        setTickets(prev => prev.map(t =>
            t.id === ticketId ? { ...t, customerRating: rating } : t
        ));
        addToast('Thank you for your feedback on the support ticket!', 'info');
    }, [setTickets, addToast]);

    const handleNotificationDismiss = useCallback(() => {
        setNotification(null);
    }, []);
    
    const handleNotificationNavigate = useCallback(() => {
        if (notification) {
            navigate('/admin', { state: { a_t: notification.navigateTo } });
            setNotification(null);
        }
    }, [notification, navigate]);
    
    return {
        loggedInUser,
        users, setUsers,
        faqs, setFaqs,
        tickets, setTickets,
        categories, setCategories,
        subDepartments, setSubDepartments,
        tasks, setTasks,
        promotions, setPromotions,
        employeeRequests, setEmployeeRequests,
        siteConfig, setSiteConfig,
        toasts,
        notification,
        vehicles, setVehicles,
        vehicleLicenses, setVehicleLicenses,
        violations, setViolations,
        violationRules, setViolationRules,
        handleLogin,
        handleLogout,
        handleTicketSubmit,
        handleFaqView,
        handleFaqRate,
        handleTicketRate,
        addToast,
        removeToast,
        handleNotificationDismiss,
        handleNotificationNavigate,
    };
};