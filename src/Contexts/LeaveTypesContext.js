// src/contexts/LeaveTypesContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

// --- Dummy Data (Move initial data here) ---
const initialLeaveTypesData = [
  {
    id: 'vac', name: 'Vacation Leave', shortCode: 'VAC', description: 'Standard paid time off for employees.', annualEntitlement: 15, carryForward: true, carryForwardLimit: 5, proRata: true, resetCycle: 'Calendar Year', minApplicationDays: 1, maxApplicationDays: 10, weekendsBetween: false, holidaysBetween: true, applicableRoles: ['Manager', 'Engineer'], employeeType: ['Full-time'], locations: ['New York', 'London'], gender: 'All', maritalStatus: 'All', minServicePeriod: 6, isPaid: true, medicalCertRequired: false, additionalPerks: 'None', sandwichRule: true, enableAccrual: true, accrualFrequency: 'Monthly', accrualStart: 'Joining Date', accrualRate: 1.25, maxAccrualLimit: 20, negativeBalanceAllowed: false, approvalType: 'Multi Level', approvalHierarchy: ['Manager', 'HR'], autoApprovalTime: 48, allowEncashment: true, encashmentFrequency: 'On Exit', minBalanceRequiredEncash: 5, encashmentLimit: 10, encashmentFormula: 'Basic / 30 * Days', leaveYearStart: 'Jan-Dec', midYearJoinersRule: 'Pro-rata', leaveCutoffDate: 'Dec 31', carryForwardResetDate: 'Mar 31', requireDocs: false, allowedFormats: [], maxFileSize: 0, blockDuringNotice: true, blockDuringAppraisal: false, blockCriticalDates: [], restrictConsecutive: 5, notifyOnApply: true, notifyOnApprove: true, notifyExpireReminders: true, alertNegativeBalance: true, carryForwardExpiryDays: 0, allowedUnderNotice: false,
  },
  {
    id: 'sick', name: 'Sick Leave', shortCode: 'SL', description: 'Leave taken due to illness.', annualEntitlement: 10, carryForward: false, carryForwardLimit: 0, proRata: true, resetCycle: 'Calendar Year', minApplicationDays: 1, maxApplicationDays: 5, weekendsBetween: false, holidaysBetween: false, applicableRoles: ['All'], employeeType: ['Full-time', 'Part-time'], locations: ['All'], gender: 'All', maritalStatus: 'All', minServicePeriod: 0, isPaid: true, medicalCertRequired: true, additionalPerks: 'None', sandwichRule: false, enableAccrual: false, accrualFrequency: 'N/A', accrualStart: 'N/A', accrualRate: 0, maxAccrualLimit: 0, negativeBalanceAllowed: false, approvalType: 'Single Level', approvalHierarchy: ['Manager'], autoApprovalTime: 0, allowEncashment: false, encashmentFrequency: 'N/A', minBalanceRequiredEncash: 0, encashmentLimit: 0, encashmentFormula: 'N/A', leaveYearStart: 'Jan-Dec', midYearJoinersRule: 'Full', leaveCutoffDate: 'Dec 31', carryForwardResetDate: 'N/A', requireDocs: true, allowedFormats: ['pdf', 'jpg'], maxFileSize: 5, blockDuringNotice: false, blockDuringAppraisal: false, blockCriticalDates: [], restrictConsecutive: 0, notifyOnApply: true, notifyOnApprove: true, notifyExpireReminders: false, alertNegativeBalance: false, carryForwardExpiryDays: 0, allowedUnderNotice: true,
  },
];
// --- End Dummy Data ---

// 1. Create Context
const LeaveTypesContext = createContext(null);

// 2. Create Provider Component
export const LeaveTypesProvider = ({ children }) => {
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypesData);

  // Function to add a new leave type
  const addLeaveType = useCallback((newType) => {
    setLeaveTypes((prevTypes) => [...prevTypes, newType]);
    // In a real app, you'd likely also make an API call here to save to the backend
  }, []);

  // Function to update (you'll need this for editing later)
  // const updateLeaveType = useCallback((updatedType) => { ... }, []);

  // Function to delete (you'll need this later)
  // const deleteLeaveType = useCallback((typeId) => { ... }, []);

  const value = {
    leaveTypes,
    addLeaveType,
    // updateLeaveType, // Add these later if needed
    // deleteLeaveType,
  };

  return (
    <LeaveTypesContext.Provider value={value}>
      {children}
    </LeaveTypesContext.Provider>
  );
};

// 3. Create custom hook for easy consumption
export const useLeaveTypes = () => {
  const context = useContext(LeaveTypesContext);
  if (!context) {
    throw new Error('useLeaveTypes must be used within a LeaveTypesProvider');
  }
  return context;
};