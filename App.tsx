

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import CustomerView from './pages/CustomerView';
import CheckTicketView from './pages/CheckTicketView';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import CategoryFaqView from './pages/CategoryFaqView';
import ToastContainer from './components/ToastContainer';
import NotificationModal from './components/NotificationModal';
import { useDataStore } from './hooks/useDataStore';

function App() {
  const {
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
    vehicles, setVehicles,
    vehicleLicenses, setVehicleLicenses,
    violations, setViolations,
    violationRules, setViolationRules,
    toasts,
    notification,
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
  } = useDataStore();

  return (
    <>
       {notification && (
        <NotificationModal
          notification={notification}
          onDismiss={handleNotificationDismiss}
          onNavigate={handleNotificationNavigate}
        />
      )}
       <ToastContainer toasts={toasts} onDismiss={removeToast} />
      <div className="flex flex-col min-h-screen">
        <Header loggedInUser={loggedInUser} handleLogout={handleLogout} siteConfig={siteConfig} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<CustomerView faqs={faqs} tickets={tickets} categories={categories} subDepartments={subDepartments} promotions={promotions} siteConfig={siteConfig} onTicketSubmit={handleTicketSubmit} onFaqView={handleFaqView} onFaqRate={handleFaqRate} onTicketRate={handleTicketRate} />} />
            <Route path="/category/:categoryId" element={<CategoryFaqView faqs={faqs} categories={categories} onFaqView={handleFaqView} onFaqRate={handleFaqRate} />} />
            <Route path="/check-ticket" element={<CheckTicketView tickets={tickets} onTicketRate={handleTicketRate} />} />
            <Route path="/login" element={!loggedInUser ? <LoginPage onLogin={handleLogin} users={users} /> : <Navigate to="/admin" replace />} />
            <Route path="/admin" element={
              loggedInUser ? (
                <AdminDashboard 
                  users={users}
                  setUsers={setUsers}
                  faqs={faqs} 
                  setFaqs={setFaqs} 
                  tickets={tickets} 
                  setTickets={setTickets}
                  categories={categories}
                  setCategories={setCategories}
                  subDepartments={subDepartments}
                  setSubDepartments={setSubDepartments}
                  tasks={tasks}
                  setTasks={setTasks}
                  promotions={promotions}
                  setPromotions={setPromotions}
                  employeeRequests={employeeRequests}
                  setEmployeeRequests={setEmployeeRequests}
                  siteConfig={siteConfig}
                  setSiteConfig={setSiteConfig}
                  vehicles={vehicles}
                  setVehicles={setVehicles}
                  vehicleLicenses={vehicleLicenses}
                  setVehicleLicenses={setVehicleLicenses}
                  violations={violations}
                  setViolations={setViolations}
                  violationRules={violationRules}
                  setViolationRules={setViolationRules}
                  loggedInUser={loggedInUser}
                  addToast={addToast}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
        </main>
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} {siteConfig.name} Inc. All rights reserved.</p>
            </div>
        </footer>
      </div>
    </>
  );
}

// Wrap App in HashRouter to make hooks like useNavigate available
const AppWrapper = () => (
    <HashRouter>
        <App />
    </HashRouter>
);

export default AppWrapper;
