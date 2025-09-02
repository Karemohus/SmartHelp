

import React, { useState, useRef, useCallback } from 'react';
import { SiteConfig, Attachment, ToastMessage, User, Category, Faq, Ticket, Task, Promotion, EmployeeRequest, AppBackup, ActivityLogItem, SubDepartment, Vehicle, VehicleLicense, Violation, ViolationRule } from '../../types';
import AttachmentInput from '../../components/AttachmentInput';
import ViolationRulesEditor from './components/ViolationRulesEditor';

declare var XLSX: any;

interface SiteConfigurationProps {
    siteConfig: SiteConfig;
    setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const SiteConfiguration: React.FC<SiteConfigurationProps> = ({ siteConfig, setSiteConfig, addToast }) => {
    const [name, setName] = useState(siteConfig.name);
    const [logoAttachment, setLogoAttachment] = useState<Attachment | null>(
        siteConfig.logo ? { name: 'logo.png', type: 'image/png', dataUrl: siteConfig.logo } : null
    );
    const [isPersistent, setIsPersistent] = useState(siteConfig.notificationSettings?.persistentNotificationsEnabled ?? false);


    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSiteConfig(prev => ({
            ...prev,
            name: name,
            logo: logoAttachment ? logoAttachment.dataUrl : null,
            notificationSettings: {
                ...prev.notificationSettings,
                persistentNotificationsEnabled: isPersistent,
            },
        }));
        addToast('Site configuration updated successfully!', 'success');
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-slate-500 uppercase text-sm font-medium">Site Configuration</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                    <label htmlFor="site-name" className="block text-sm font-medium text-slate-700 mb-1">Site Name</label>
                    <input
                        id="site-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                
                <AttachmentInput 
                    attachment={logoAttachment}
                    setAttachment={setLogoAttachment}
                    id="logo-uploader"
                    maxSizeMB={2}
                    accept="image/*"
                    label="Site Logo (Optional, max 2MB, image files only)"
                />

                {logoAttachment && logoAttachment.dataUrl && (
                    <div>
                        <p className="block text-sm font-medium text-slate-700 mb-1">Logo Preview</p>
                        <div className="mt-2 p-2 bg-slate-50 border rounded-md inline-block">
                            <img src={logoAttachment.dataUrl} alt="logo preview" className="h-10 w-auto" />
                        </div>
                    </div>
                 )}

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-slate-500 uppercase text-sm font-medium">Notification Settings</h4>
                    <div className="mt-4 space-y-4">
                        <div className="relative flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="persistent-notifs"
                                    aria-describedby="persistent-notifs-description"
                                    name="persistent-notifs"
                                    type="checkbox"
                                    checked={isPersistent}
                                    onChange={e => setIsPersistent(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="persistent-notifs" className="font-medium text-slate-700">
                                    Enable Persistent Reminders
                                </label>
                                <p id="persistent-notifs-description" className="text-xs text-slate-500">
                                    If enabled, supervisors will receive periodic reminder notifications for any open tasks or new tickets until they are addressed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                     <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save Configuration</button>
                </div>
            </form>
        </div>
    );
};


interface DataManagementZoneProps {
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
    requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
    addToast: (message: string, type: ToastMessage['type']) => void;
}

const DataManagementZone: React.FC<DataManagementZoneProps> = ({
    users, setUsers, faqs, setFaqs, tickets, setTickets, categories, setCategories, subDepartments, setSubDepartments, tasks, setTasks,
    promotions, setPromotions, employeeRequests, setEmployeeRequests, siteConfig, setSiteConfig,
    vehicles, setVehicles, vehicleLicenses, setVehicleLicenses, violations, setViolations,
    requestConfirm, addToast
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateActivityLog = useCallback((): ActivityLogItem[] => {
        const log: ActivityLogItem[] = [];
        const userMap = new Map(users.map(u => [u.id, u]));

        tickets.forEach(ticket => {
            if (ticket.answeredByUserId && ticket.answeredAt) {
                const user = userMap.get(ticket.answeredByUserId);
                if (user) log.push({ date: ticket.answeredAt, user: user.username, role: user.role, activity: 'Answered Ticket', details: `Replied to: "${ticket.subject}"`, itemId: ticket.id });
            }
        });

        tasks.forEach(task => {
            if (task.performedByUserId && (task.status === 'Pending Review' || task.status === 'Pending Supervisor Review' || task.status === 'Completed')) {
                const user = userMap.get(task.performedByUserId);
                if (user) log.push({ date: task.updatedAt, user: user.username, role: user.role, activity: 'Submitted Task', details: `Submitted work for: "${task.title}"`, itemId: task.id });
            }
            if (task.completedByUserId && task.completedAt) {
                const user = userMap.get(task.completedByUserId);
                if (user) log.push({ date: task.completedAt, user: user.username, role: user.role, activity: 'Approved Task', details: `Approved task: "${task.title}"`, itemId: task.id });
            }
        });

        faqs.forEach(faq => {
            const creator = userMap.get(faq.createdByUserId);
            if (creator) log.push({ date: faq.createdAt, user: creator.username, role: creator.role, activity: 'Created FAQ', details: `Question: "${faq.question}"`, itemId: faq.id });
            if (faq.updatedAt !== faq.createdAt) {
                const updater = userMap.get(faq.updatedByUserId);
                if (updater) log.push({ date: faq.updatedAt, user: updater.username, role: updater.role, activity: 'Updated FAQ', details: `Question: "${faq.question}"`, itemId: faq.id });
            }
        });

        promotions.forEach(promo => {
            const user = userMap.get(promo.createdByUserId);
            if (user) log.push({ date: promo.createdAt, user: user.username, role: user.role, activity: 'Created Promotion', details: `Title: "${promo.title}"`, itemId: promo.id });
        });

        employeeRequests.forEach(req => {
            const requester = userMap.get(req.requestedBySupervisorId);
            if (requester) log.push({ date: req.createdAt, user: requester.username, role: requester.role, activity: 'Requested Staff', details: `Requested new user: "${req.newEmployeeUsername}"`, itemId: req.id });
            if (req.resolvedByAdminId && req.resolvedAt) {
                const resolver = userMap.get(req.resolvedByAdminId);
                if (resolver) log.push({ date: req.resolvedAt, user: resolver.username, role: resolver.role, activity: req.status === 'approved' ? 'Approved Staff Request' : 'Rejected Staff Request', details: `${req.status === 'approved' ? 'Approved' : 'Rejected'} request for: "${req.newEmployeeUsername}"`, itemId: req.id });
            }
        });

        return log.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [users, tickets, tasks, faqs, promotions, employeeRequests]);


    const handleExportJson = () => {
        const userActivityLog = generateActivityLog();
        const backupData: AppBackup = {
            version: '1.0.1',
            exportDate: new Date().toISOString(),
            users,
            categories,
            subDepartments,
            faqs,
            tickets,
            tasks,
            promotions,
            employeeRequests,
            siteConfig,
            userActivityLog,
            vehicles,
            vehicleLicenses,
            violations
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `smartfaq-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('Data exported to JSON successfully!', 'success');
    };

    const handleExportXlsx = () => {
        try {
            if (typeof XLSX === 'undefined') {
                addToast('Excel export library is not available.', 'error');
                console.error('SheetJS library (XLSX) not found. Make sure it is included in the HTML.');
                return;
            }

            const wb = XLSX.utils.book_new();
            const date = new Date().toISOString().slice(0, 10);
            const fileName = `smartfaq-backup-${date}.xlsx`;

            // 1. Users (excluding password)
            const usersSheet = users.map(({ password, ...user }) => ({ 
                id: user.id,
                username: user.username,
                employeeId: user.employeeId,
                role: user.role,
                supervisorId: user.supervisorId,
                adminPermissions: user.adminPermissions?.join(', '), 
                assignedCategoryIds: user.assignedCategoryIds?.join(', '),
                permissions: user.permissions?.join(', '),
                assignedSubDepartmentIds: user.assignedSubDepartmentIds?.join(', '),
            }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usersSheet), 'Users');

            // 2. Categories
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categories), 'Categories');
            
            // 3. Sub-departments
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subDepartments), 'Sub-departments');

            // 4. FAQs
            const faqsSheet = faqs.map(faq => ({ ...faq, attachment: faq.attachment?.name || '' }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(faqsSheet), 'FAQs');

            // 5. Tickets
            const ticketsSheet = tickets.map(ticket => ({ ...ticket, userAttachment: ticket.userAttachment?.name || '', adminAttachment: ticket.adminAttachment?.name || '' }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ticketsSheet), 'Tickets');

            // 6. Tasks
            const tasksSheet = tasks.map(task => ({ ...task, adminAttachment: task.adminAttachment?.name || '', supervisorAttachment: task.supervisorAttachment?.name || '' }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tasksSheet), 'Tasks');
            
            // 7. Promotions
            const promotionsSheet = promotions.map(promo => ({ ...promo, attachment: promo.attachment?.name || '' }));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(promotionsSheet), 'Promotions');

            // 8. Employee Requests (excluding password)
            const requestsSheet = employeeRequests.map(({ newEmployeePassword, ...req }) => req);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(requestsSheet), 'Employee Requests');
            
            // 9. Vehicles
            const vehiclesSheet = vehicles.map(v => ({...v, photos: v.photos.map(p => p.name).join(', ')}));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vehiclesSheet), 'Vehicles');

            // 10. Vehicle Licenses
            const licensesSheet = vehicleLicenses.map(l => ({...l, attachment: l.attachment?.name || ''}));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(licensesSheet), 'Vehicle Licenses');
            
            // 11. Violations
            const violationsSheet = violations.map(v => ({...v, attachment: v.attachment?.name || ''}));
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(violationsSheet), 'Violations');

            // 12. User Activity Log
            const activityLogSheet = generateActivityLog();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activityLogSheet), 'User Activity Log');
            
            // 13. Site Config
            const configData = [
                { setting: 'Site Name', value: siteConfig.name },
                { setting: 'Logo Attached', value: siteConfig.logo ? 'Yes' : 'No' },
                { setting: 'Persistent Reminders', value: siteConfig.notificationSettings.persistentNotificationsEnabled },
                { setting: 'Promotion Strategy', value: siteConfig.promotionDisplayStrategy },
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(configData), 'Site Config');

            XLSX.writeFile(wb, fileName);
            addToast('Data exported to XLSX successfully!', 'success');
        } catch (error) {
            console.error('Error exporting to XLSX:', error);
            addToast('An error occurred during XLSX export.', 'error');
        }
    };


    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            requestConfirm(
                'Confirm Data Import',
                'Are you sure you want to import this JSON file? This will overwrite ALL existing data in this browser. This action cannot be undone.',
                () => {
                    try {
                        const parsedData: AppBackup = JSON.parse(text);

                        // Basic validation to ensure it's a valid backup file
                        if (parsedData.version && parsedData.users && parsedData.tickets && parsedData.siteConfig) {
                            setUsers(parsedData.users || []);
                            setCategories(parsedData.categories || []);
                            setSubDepartments(parsedData.subDepartments || []);
                            setFaqs(parsedData.faqs || []);
                            setTickets(parsedData.tickets || []);
                            setTasks(parsedData.tasks || []);
                            setPromotions(parsedData.promotions || []);
                            setEmployeeRequests(parsedData.employeeRequests || []);
                            setSiteConfig(parsedData.siteConfig || siteConfig);
                            setVehicles(parsedData.vehicles || []);
                            setVehicleLicenses(parsedData.vehicleLicenses || []);
                            setViolations(parsedData.violations || []);
                            
                            addToast('Data imported successfully! The page will now refresh.', 'success');
                            
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);

                        } else {
                            addToast('Invalid backup file format.', 'error');
                        }
                    } catch (err) {
                        addToast('Failed to parse backup file. Ensure it is a valid JSON file.', 'error');
                        console.error("Import error:", err);
                    }
                },
                'Yes, Import Data'
            );
        };
        reader.readAsText(file);

        // Reset file input so the same file can be selected again
        event.target.value = '';
    };

    const handleResetAllData = () => {
        requestConfirm(
            'Critical Warning!',
            'This will permanently delete all support tickets and tasks, and reset all FAQ view counts to zero. This action cannot be undone. Are you sure you want to proceed?',
            () => {
                setTickets([]);
                setFaqs(prevFaqs => prevFaqs.map(faq => ({ ...faq, viewCount: 0 })));
                setTasks([]);
                addToast('All analytics, ticket, and task data have been successfully reset.', 'success');
            },
            'Yes, I understand, reset data'
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <h3 className="text-xl font-bold text-slate-800">Data Management</h3>
            <p className="text-sm text-slate-600 mt-1 mb-6">
                Use these tools to back up, restore, or reset your application data. These actions are intended for administrators.
            </p>

            <div className="p-4 border border-slate-200 rounded-lg space-y-4">
                <h4 className="font-semibold text-slate-700">Backup & Restore</h4>
                <p className="text-sm text-slate-500">
                    Export system data to create a backup or transfer to another computer. Importing a JSON file will overwrite all current data.
                </p>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={handleExportJson}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Export as JSON
                    </button>
                    <button
                        onClick={handleExportXlsx}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        Export as XLSX
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="px-4 py-2 bg-slate-600 text-white rounded-md text-sm font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                    >
                        Import from JSON
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelected}
                        className="hidden"
                        accept=".json"
                    />
                </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-6">
                <h4 className="text-lg font-bold text-red-800">Danger Zone</h4>
                <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                    <div>
                        <p className="font-semibold text-slate-800">Reset All Analytics & Ticket Data</p>
                        <p className="text-sm text-slate-600">This will permanently delete all support tickets, tasks and reset all FAQ view counts to zero.</p>
                    </div>
                    <button
                        onClick={handleResetAllData}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex-shrink-0"
                        aria-label="Reset all analytics and ticket data"
                    >
                        Reset All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

const Settings: React.FC<DataManagementZoneProps> = (props) => {
    return (
        <div className="space-y-8">
            <SiteConfiguration 
                siteConfig={props.siteConfig} 
                setSiteConfig={props.setSiteConfig} 
                addToast={props.addToast} 
            />
             <ViolationRulesEditor 
                violationRules={props.violationRules}
                setViolationRules={props.setViolationRules}
                addToast={props.addToast}
            />
            <DataManagementZone {...props} />
        </div>
    );
};


export default Settings;