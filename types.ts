

import { Type } from "@google/genai";

export interface SubDepartment {
  id: string;
  name: string;
  supervisorId: string;
  mainCategoryId: string;
}

export interface Promotion {
  id: string;
  title: string;
  attachment: Attachment;
  audience: 'customer' | 'supervisor' | 'employee' | 'all';
  isActive: boolean;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  createdByUserId: string;
}

export interface SiteConfig {
  name: string;
  logo: string | null; // dataURL for the image
  notificationSettings: {
    persistentNotificationsEnabled: boolean;
  };
  promotionDisplayStrategy: 'show-once' | 'show-always';
}

export interface Attachment {
  name:string;
  type: string;
  dataUrl?: string;
}

export enum TicketStatus {
  New = 'New',
  Seen = 'Seen',
  Answered = 'Answered',
  Closed = 'Closed',
}

export enum UserRole {
    Admin = 'admin',
    Supervisor = 'supervisor',
    Employee = 'employee',
    Driver = 'driver',
}

export enum TaskStatus {
  ToDo = 'To Do',
  Seen = 'Seen',
  PendingReview = 'Pending Review',
  PendingSupervisorReview = 'Pending Supervisor Review',
  Completed = 'Completed'
}

export type EmployeePermission = 'handle_tickets' | 'handle_tasks' | 'add_faqs' | 'view_analytics' | 'close_tickets';

export type AdminPermission =
    | 'view_all_dashboards'
    | 'manage_categories'
    | 'manage_promotions'
    | 'approve_staff_requests'
    | 'manage_site_config'
    | 'manage_supervisors'
    | 'view_user_activity'
    | 'manage_staff_directly';

export interface User {
    id: string;
    username: string;
    employeeId?: string;
    password?: string; // Stored in backend state (localStorage), but not in loggedInUser session state
    role: UserRole;
    designation?: string;
    adminPermissions?: AdminPermission[]; // For supervisors with special admin-level permissions
    assignedCategoryIds?: string[]; // For regular supervisors, list of category IDs they manage
    assignedSubDepartmentIds?: string[]; // For employees, list of sub-department IDs they are assigned to
    supervisorId?: string; // For employees, the ID of their direct supervisor
    permissions?: EmployeePermission[]; // For employees, specific abilities granted by their supervisor
    // Driver-specific fields
    drivingLicenseNumber?: string;
    drivingLicenseExpiry?: string;
    currentLocation?: { lat: number, lng: number } | null;
    currentSpeed?: number | null;
}


export interface Category {
    id: string;
    name: string;
    slug?: string;
    isPublic: boolean;
    generalContext?: string; // General answer/context for the category for AI suggestions
}

export interface Faq {
  id: number;
  categoryId: string;
  subDepartmentId?: string | null;
  question: string;
  answer: string;
  attachment?: Attachment | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  createdByUserId: string;
  updatedByUserId: string;
  satisfaction: number;
  dissatisfaction: number;
}

export interface Ticket {
  id: string;
  name: string;
  phone: string;
  employeeId?: string | null;
  subject: string;
  description: string;
  categoryId: string;
  subDepartmentId?: string | null;
  userAttachment?: Attachment | null;
  status: TicketStatus;
  adminReply: string | null;
  adminAttachment?: Attachment | null;
  createdAt: string;
  answeredAt: string | null;
  answeredByUserId?: string;
  customerRating?: 'satisfied' | 'dissatisfied' | null;
  assignedEmployeeId?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedCategoryId: string;
  assignedSubDepartmentId?: string | null;
  assignedEmployeeId?: string; // ID of the employee if assigned by a supervisor
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  adminAttachment?: Attachment | null;
  supervisorAttachment?: Attachment | null;
  supervisorNotes?: string | null;
  adminFeedback?: string | null;
  completedByUserId?: string;
  performedByUserId?: string;
}

// Vehicle Management Types
export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    vin: string;
    status: 'active' | 'in_maintenance' | 'out_of_service';
    photos: Attachment[];
    assignedDriverId: string;
    createdAt: string;
    updatedAt: string;
    notes?: string;
    nextMaintenanceDate?: string;
}

export interface VehicleLicense {
    id: string;
    vehicleId: string;
    licenseNumber: string;
    issueDate: string;
    expiryDate: string;
    insurancePolicyNumber?: string;
    insuranceExpiryDate?: string;
    status?: 'active' | 'expiring_soon' | 'expired'; // Optional as it can be computed
    attachment?: Attachment | null;
}

export interface Violation {
    id: string;
    driverId: string;
    vehicleId: string;
    date: string;
    description: string;
    amount: number;
    status: 'pending' | 'paid';
    attachment?: Attachment | null;
    triggerEventId?: string; // Used to prevent duplicate automatic violations
}

export interface ViolationRule {
  id: string;
  type: 'speeding' | 'missed_maintenance';
  threshold: number;
  fineAmount: number;
  description: string;
  isEnabled: boolean;
}


export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AdminTab = 'dashboard' | 'faqs' | 'tickets' | 'categories' | 'subDepartments' | 'tasks' | 'promotions' | 'supervisors' | 'staffRequests' | 'manageTeam' | 'userActivity' | 'vehicles' | 'settings';

export interface AppNotification {
  id: number;
  itemId: string;
  type: 'task' | 'ticket' | 'employee_approval';
  title: string;
  message: string;
  navigateTo: AdminTab;
}

export interface EmployeeRequest {
    id: string;
    requestedBySupervisorId: string;
    newEmployeeUsername: string;
    newEmployeeDesignation?: string;
    newEmployeeId?: string;
    newEmployeePassword?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    resolvedAt: string | null;
    resolvedByAdminId: string | null;
    rejectionReason: string | null;
    acknowledgedBySupervisor?: boolean;
}

export interface ActivityLogItem {
  date: string;
  user: string;
  role: UserRole;
  activity: string;
  details: string;
  itemId: string | number;
}

export interface AppBackup {
  version: string;
  exportDate: string;
  users: User[];
  categories: Category[];
  subDepartments: SubDepartment[];
  faqs: Faq[];
  tickets: Ticket[];
  tasks: Task[];
  promotions: Promotion[];
  employeeRequests: EmployeeRequest[];
  siteConfig: SiteConfig;
  userActivityLog?: ActivityLogItem[];
  vehicles?: Vehicle[];
  vehicleLicenses?: VehicleLicense[];
  violations?: Violation[];
}

export enum GeminiSafetyRating {
    HARM_SEVERITY_UNSPECIFIED = 'HARM_SEVERITY_UNSPECIFIED',
    NEGLIGIBLE = 'NEGLIGIBLE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export interface GeminiSafetySetting {
  category: string;
  threshold: GeminiSafetyRating;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}