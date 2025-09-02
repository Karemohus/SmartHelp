

import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskStatus, Attachment, Category, User, UserRole, ToastMessage, SubDepartment } from '../../types';
import AttachmentInput from '../../components/AttachmentInput';
import SupervisorTaskModal from './components/SupervisorTaskModal';
import TaskReviewModal from './components/TaskReviewModal';
import CheckCircleIcon from '../../components/icons/CheckCircleIcon';
import ClipboardListIcon from '../../components/icons/ClipboardListIcon';
import TrashIcon from '../../components/icons/TrashIcon';

interface ManageTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  categories: Category[];
  subDepartments: SubDepartment[];
  users: User[];
  loggedInUser: User;
  addToast: (message: string, type: ToastMessage['type']) => void;
  requestConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  hasViewAllPermission: boolean;
}

const ManageTasks: React.FC<ManageTasksProps> = ({ tasks, setTasks, categories, subDepartments, users, loggedInUser, addToast, requestConfirm, hasViewAllPermission }) => {
    // Admin/Vice-Admin state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState(categories[0]?.id || '');
    const [newTaskAdminAttachment, setNewTaskAdminAttachment] = useState<Attachment | null>(null);

    // Supervisor state for assigning tasks to employees
    const [teamTaskTitle, setTeamTaskTitle] = useState('');
    const [teamTaskDescription, setTeamTaskDescription] = useState('');
    const [teamTaskSubDept, setTeamTaskSubDept] = useState('');
    const [teamTaskEmployee, setTeamTaskEmployee] = useState('');
    const [teamTaskAttachment, setTeamTaskAttachment] = useState<Attachment | null>(null);

    const [submittingTask, setSubmittingTask] = useState<Task | null>(null);
    const [reviewingTask, setReviewingTask] = useState<Task | null>(null);

    const isSupervisor = loggedInUser.role === UserRole.Supervisor;
    const isEmployee = loggedInUser.role === UserRole.Employee;

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
    const subDeptMap = useMemo(() => new Map(subDepartments.map(sd => [sd.id, sd.name])), [subDepartments]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.username])), [users]);
    const myTeam = useMemo(() => users.filter(u => u.supervisorId === loggedInUser.id), [users, loggedInUser.id]);
    const mySubDepartments = useMemo(() => subDepartments.filter(sd => sd.supervisorId === loggedInUser.id), [subDepartments, loggedInUser.id]);
    
    useEffect(() => {
        if(isSupervisor && mySubDepartments.length > 0 && !teamTaskSubDept) {
            setTeamTaskSubDept(mySubDepartments[0].id);
        }
    }, [isSupervisor, mySubDepartments, teamTaskSubDept]);

    const employeesInSelectedSubDept = useMemo(() => {
        if (!teamTaskSubDept) return [];
        return myTeam.filter(emp => emp.assignedSubDepartmentIds?.includes(teamTaskSubDept));
    }, [teamTaskSubDept, myTeam]);

    useEffect(() => {
        setTeamTaskEmployee(employeesInSelectedSubDept[0]?.id || '');
    }, [employeesInSelectedSubDept]);

    const handleCreateAdminTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskCategory) {
            addToast('Please provide a title and select a category.', 'error');
            return;
        }

        const now = new Date().toISOString();
        const newTask: Task = {
            id: `TASK-${Date.now()}`,
            title: newTaskTitle.trim(),
            description: newTaskDescription.trim(),
            assignedCategoryId: newTaskCategory,
            status: TaskStatus.ToDo,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            adminAttachment: newTaskAdminAttachment,
        };

        setTasks(prev => [newTask, ...prev]);
        addToast('Task created successfully!', 'success');
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskAdminAttachment(null);
    };

    const handleCreateTeamTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamTaskTitle.trim() || !teamTaskSubDept) {
            addToast('Title and sub-department are required.', 'error');
            return;
        }

        const subDept = subDepartments.find(sd => sd.id === teamTaskSubDept);
        if (!subDept) {
            addToast('Invalid sub-department selected.', 'error');
            return;
        }

        const now = new Date().toISOString();
        const newTask: Task = {
            id: `TASK-${Date.now()}`,
            title: teamTaskTitle.trim(),
            description: teamTaskDescription.trim(),
            assignedCategoryId: subDept.mainCategoryId,
            assignedSubDepartmentId: teamTaskSubDept,
            assignedEmployeeId: teamTaskEmployee || undefined,
            status: TaskStatus.ToDo,
            createdAt: now,
            updatedAt: now,
            completedAt: null,
            adminAttachment: teamTaskAttachment,
        };

        setTasks(prev => [newTask, ...prev]);
        const assigneeName = teamTaskEmployee ? userMap.get(teamTaskEmployee) : `the ${subDeptMap.get(teamTaskSubDept)} sub-department`;
        addToast(`Task assigned to ${assigneeName}.`, 'success');
        setTeamTaskTitle('');
        setTeamTaskDescription('');
        setTeamTaskAttachment(null);
    };
    
    const handleWorkSubmit = (taskId: string, notes: string, attachment: Attachment | null) => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task,
              status: isEmployee ? TaskStatus.PendingSupervisorReview : TaskStatus.PendingReview,
              supervisorNotes: notes.trim() ? notes.trim() : null,
              supervisorAttachment: attachment,
              updatedAt: new Date().toISOString(),
              adminFeedback: null, // Clear previous feedback on resubmission
              performedByUserId: loggedInUser.id,
            } 
          : task
      ));
      addToast('Task submitted for review.', 'success');
      setSubmittingTask(null);
    };
    
    const handleApproval = (taskId: string) => {
      const taskToApprove = tasks.find(t => t.id === taskId);
      if (!taskToApprove) return;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: TaskStatus.Completed, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedByUserId: loggedInUser.id } 
          : task
      ));
      addToast('Task approved and completed!', 'success');
      setReviewingTask(null);
    };

    const handleRejection = (taskId: string, feedback: string) => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: TaskStatus.ToDo, adminFeedback: feedback, updatedAt: new Date().toISOString() } 
          : task
      ));
      addToast('Task rejected and re-assigned.', 'info');
      setReviewingTask(null);
    };

    const handleDeleteTask = (taskId: string) => {
        requestConfirm(
            'Confirm Deletion',
            'Are you sure you want to delete this task?',
            () => {
                setTasks(prev => prev.filter(task => task.id !== taskId));
                addToast('Task deleted.', 'success');
            },
            'Yes, Delete'
        );
    };

    const handleOpenSubmitModal = (task: Task) => {
        const updatedTask = { ...task };
        if (task.status === TaskStatus.ToDo) {
            updatedTask.status = TaskStatus.Seen;
            setTasks(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
        }
        setSubmittingTask(updatedTask);
    };

    const handleTaskRowInteraction = (task: Task) => {
        // Only change status if the logged-in user is the intended recipient of the task.
        const isMyAssignedTask =
            (isEmployee && (task.assignedEmployeeId === loggedInUser.id || (task.assignedSubDepartmentId && loggedInUser.assignedSubDepartmentIds?.includes(task.assignedSubDepartmentId) && !task.assignedEmployeeId))) ||
            (isSupervisor && !task.assignedEmployeeId && (hasViewAllPermission || loggedInUser.assignedCategoryIds?.includes(task.assignedCategoryId)));

        if (task.status === TaskStatus.ToDo && isMyAssignedTask) {
            setTasks(prev => prev.map(t => t.id === task.id ? {...t, status: TaskStatus.Seen, updatedAt: new Date().toISOString()} : t));
        }
    };
    
    const getTaskStatusBadgeColor = (status: TaskStatus) => {
      switch (status) {
        case TaskStatus.ToDo: return 'bg-yellow-100 text-yellow-800';
        case TaskStatus.Seen: return 'bg-amber-100 text-amber-800';
        case TaskStatus.PendingReview: return 'bg-blue-100 text-blue-800';
        case TaskStatus.PendingSupervisorReview: return 'bg-purple-100 text-purple-800';
        case TaskStatus.Completed: return 'bg-green-100 text-green-800';
        default: return 'bg-slate-100 text-slate-800';
      }
    };

    // Filter tasks based on role
    const { adminTasks, teamTasks, myTasks, supervisorAdminTasks } = useMemo(() => {
      const allAdminTasks = tasks.filter(t => !t.assignedEmployeeId && !t.assignedSubDepartmentId);
      const teamTasks = tasks.filter(t => t.assignedSubDepartmentId && mySubDepartments.some(sd => sd.id === t.assignedSubDepartmentId));
      const myTasks = tasks.filter(t => (t.assignedEmployeeId === loggedInUser.id) || (t.assignedSubDepartmentId && loggedInUser.assignedSubDepartmentIds?.includes(t.assignedSubDepartmentId) && !t.assignedEmployeeId));
      
      let supervisorViewableAdminTasks: Task[] = [];
      if (isSupervisor) {
          supervisorViewableAdminTasks = hasViewAllPermission
            ? allAdminTasks
            : allAdminTasks.filter(t => loggedInUser.assignedCategoryIds?.includes(t.assignedCategoryId));
      }
      
      return { 
        adminTasks: allAdminTasks, 
        teamTasks, 
        myTasks, 
        supervisorAdminTasks: supervisorViewableAdminTasks 
      };
    }, [tasks, loggedInUser, mySubDepartments, isSupervisor, hasViewAllPermission]);

    const TaskTable = ({ taskList, title }: { taskList: Task[], title: string }) => (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                {isSupervisor && title === "Team Tasks" && <ClipboardListIcon className="w-6 h-6 text-slate-500" />}
                {title}
            </h3>
             <div className="overflow-x-auto">
                <table className="min-w-full responsive-table">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                            {(hasViewAllPermission || isSupervisor) && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Update</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white md:divide-y md:divide-slate-200">
                        {taskList.length > 0 ? taskList.map(task => (
                            <tr 
                                key={task.id} 
                                onMouseEnter={() => handleTaskRowInteraction(task)}
                            >
                                <td data-label="Status" className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTaskStatusBadgeColor(task.status)}`}>{task.status}</span>
                                </td>
                                <td data-label="Title" className="px-6 py-4 max-w-xs">
                                    <p className="text-sm font-semibold text-slate-900 truncate" title={task.title}>{task.title}</p>
                                    {task.adminFeedback && (task.status === TaskStatus.ToDo || task.status === TaskStatus.Seen) && (
                                        <p className="text-xs text-red-600 mt-1 truncate" title={`Feedback: ${task.adminFeedback}`}>
                                            <span className="font-bold">Feedback:</span> {task.adminFeedback}
                                        </p>
                                    )}
                                </td>
                                {(hasViewAllPermission || isSupervisor) && <td data-label="Assigned To" className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{task.assignedEmployeeId ? userMap.get(task.assignedEmployeeId) : (task.assignedSubDepartmentId ? subDeptMap.get(task.assignedSubDepartmentId) : categoryMap.get(task.assignedCategoryId)) || 'N/A'}</td>}
                                <td data-label="Updated" className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(task.updatedAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                        {hasViewAllPermission && task.status === TaskStatus.PendingReview && (
                                            <button onClick={() => setReviewingTask(task)} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">Review</button>
                                        )}
                                        {isSupervisor && task.status === TaskStatus.PendingSupervisorReview && (
                                            <button onClick={() => setReviewingTask(task)} className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-md hover:bg-purple-700">Review Submission</button>
                                        )}
                                        {(isSupervisor || isEmployee) && (task.status === TaskStatus.ToDo || task.status === TaskStatus.Seen) && (
                                            <button onClick={() => handleOpenSubmitModal(task)} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700">Submit Work</button>
                                        )}
                                        {task.status === TaskStatus.Completed && <span className="text-xs text-green-600 font-semibold italic">Completed</span>}
                                        {hasViewAllPermission && <button onClick={() => handleDeleteTask(task.id)} className="text-slate-500 hover:text-red-600 p-1" aria-label="Delete task"><TrashIcon className="w-4 h-4" /></button>}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={(hasViewAllPermission || isSupervisor) ? 5 : 4} className="text-center py-10 text-slate-500 italic">
                                    {hasViewAllPermission ? "No tasks have been created yet." : "No tasks found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {submittingTask && (
                <SupervisorTaskModal 
                    task={submittingTask}
                    onClose={() => setSubmittingTask(null)}
                    onConfirm={handleWorkSubmit}
                />
            )}
            {reviewingTask && (
                <TaskReviewModal
                    task={reviewingTask}
                    onClose={() => setReviewingTask(null)}
                    onApprove={handleApproval}
                    onReject={handleRejection}
                    loggedInUser={loggedInUser}
                />
            )}
            {hasViewAllPermission && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-slate-800">Assign Task to Supervisor Category</h3>
                    <form onSubmit={handleCreateAdminTask} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                                <input id="task-title" type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="e.g., Review pending tickets" required />
                            </div>
                            <div>
                                <label htmlFor="task-category" className="block text-sm font-medium text-slate-700 mb-1">Assign to Category</label>
                                <select id="task-category" value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 bg-white" required >
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <textarea id="task-description" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md p-2" placeholder="Description (Optional)" />
                        <AttachmentInput attachment={newTaskAdminAttachment} setAttachment={setNewTaskAdminAttachment} id="admin-task-attachment" label="Attach File (Optional)" />
                        <div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Create Task</button></div>
                    </form>
                </div>
            )}
            {isSupervisor && (
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><ClipboardListIcon className="w-6 h-6 text-slate-500" />Assign Task to Your Team</h3>
                    <form onSubmit={handleCreateTeamTask} className="mt-4 space-y-4">
                         <input type="text" value={teamTaskTitle} onChange={e => setTeamTaskTitle(e.target.value)} className="w-full border border-slate-300 rounded-md p-2" placeholder="Task Title" required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="team-task-subdept" className="block text-sm font-medium text-slate-700 mb-1">Sub-department</label>
                                <select id="team-task-subdept" value={teamTaskSubDept} onChange={e => setTeamTaskSubDept(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 bg-white" required>
                                     {mySubDepartments.length > 0 ? mySubDepartments.map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>) : <option disabled>No sub-departments created</option>}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="team-task-employee" className="block text-sm font-medium text-slate-700 mb-1">Assign To Employee (Optional)</label>
                                <select id="team-task-employee" value={teamTaskEmployee} onChange={e => setTeamTaskEmployee(e.target.value)} className="w-full border border-slate-300 rounded-md p-2 bg-white" disabled={employeesInSelectedSubDept.length === 0}>
                                     <option value="">(Entire Sub-department)</option>
                                     {employeesInSelectedSubDept.map(emp => <option key={emp.id} value={emp.id}>{emp.username}</option>)}
                                </select>
                            </div>
                        </div>
                        <textarea value={teamTaskDescription} onChange={e => setTeamTaskDescription(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-md p-2" placeholder="Description (Optional)" />
                        <AttachmentInput attachment={teamTaskAttachment} setAttachment={setTeamTaskAttachment} id="team-task-attachment" label="Attach File (Optional)" />
                        <div className="flex justify-end"><button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700" disabled={mySubDepartments.length === 0}>Assign Task</button></div>
                    </form>
                </div>
            )}
            
            {hasViewAllPermission && <TaskTable taskList={adminTasks} title="Tasks for Supervisors" />}
            {isSupervisor && <TaskTable taskList={supervisorAdminTasks} title="Tasks from Admin" />}
            {isSupervisor && <TaskTable taskList={teamTasks} title="Team Tasks" />}
            {isEmployee && <TaskTable taskList={myTasks} title="Your Assigned Tasks" />}
        </div>
    );
};

export default ManageTasks;