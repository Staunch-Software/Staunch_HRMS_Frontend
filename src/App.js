import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Admin_Login from "./Components/AdminLoginPage/Admin_Login";
import MainLayout from "./Components/Pages/MainLayout";
import RequireAuth from "./Components/Pages/RequireAuth";
import DashboardPage from "./Components/Pages/Dashboard";
import EmployeeList from "./Components/Pages/Employee/EmployeeList";
import DepartmentList from "./Components/Pages/Department/DepartmentList";
import DesignationList from "./Components/Pages/Designation/DesignationList";
import AddEmployeeFlow from "./Components/Pages/Employee/AddEmployeeFlow";
import AddDesignationPage from "./Components/Pages/Designation/AddDesignation";
import AddDepartmentPage from "./Components/Pages/Department/AddDepartment";
import AddLocationPage from "./Components/Pages/Location/AddLocation";
import LeavePage from "./Components/Pages/Leave/LeavePage";
import AttendancePage from "./Components/Pages/Attendance/AttendancePage";
import ShiftManagementPage from "./Components/Pages//Attendance/Shifts/ShiftManagementPage";

import PaySchedulePage from './Components/Pages/Payroll/PaySchedulePage';
import SalaryComponentsPage from './Components/Pages/Payroll/SalaryComponentsPage';
import RunPayrollPage from './Components/Pages/Payroll/RunPayrollPage';
import PayrollRunDetailPage from './Components/Pages/Payroll/PayrollRunDetailPage';
import PayBatchPage from './Components/Pages/Payroll/PayBatchPage';
import CompanyBankSettingsPage from './Components/Pages/Payroll/CompanyBankSettingsPage';

import { EmployeeProvider } from "./Contexts/EmployeeContext";
import { ReferenceDataProvider } from "./Contexts/ReferenceDataContext";
import { DepartmentProvider } from "./Contexts/DepartmentContext";
import { LeaveTypesProvider } from "./Contexts/LeaveTypesContext";

// --- PLACEHOLDERS FOR *OTHER* COMPONENTS ---
const Placeholder = ({ title }) => <div style={{ padding: '20px' }}><h2>{title}</h2><p>Content coming soon...</p></div>;
// REMOVE THE PaySchedulePage PLACEHOLDER DEFINITION
// const PaySchedulePage = () => <Placeholder title="Pay Schedule" />; // <-- DELETE THIS LINE
const PayPeriodPage = () => <Placeholder title="Pay Period" />;
// const SalaryComponentsPage = () => <Placeholder title="Salary & Deduction Components" />;
const CompliancePage = () => <Placeholder title="Compliance" />;
const AdvanceSalaryPage = () => <Placeholder title="Advance Salary" />;
// RunPayrollPage is now a real component (imported above) — placeholder removed.
const PayrollSummaryPage = () => <Placeholder title="Payroll Summary" />;
const RoundRulesPage = () => <Placeholder title="Round Rules" />;
// PayBatchPage is now a real component (imported above) — placeholder removed.
const ApprovalFlowPage = () => <Placeholder title="Approval Flow" />;
// DirectDepositsPage is now the real CompanyBankSettingsPage (imported above) — placeholder removed.
const PayslipSettingsPage = () => <Placeholder title="Payslip Settings" />;
const FinalSettlementsPage = () => <Placeholder title="Final Settlements" />;

function App() {
  return (
    <ReferenceDataProvider>
      <EmployeeProvider>
        <DepartmentProvider>
          <LeaveTypesProvider>
            <Routes>
              <Route path="/" element={<Admin_Login />} />
              <Route path="/login" element={<Admin_Login />} />
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <MainLayout />
                  </RequireAuth>
                }
              >
                {/* ... other non-payroll routes ... */}
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="employee" element={<EmployeeList />} />
                <Route path="department" element={<DepartmentList />} />
                <Route path="designation" element={<DesignationList />} />
                <Route path="employee/add" element={<AddEmployeeFlow />} />
                <Route path="locations/add" element={<AddLocationPage />} />
                <Route
                  path="designation/add"
                  element={<AddDesignationPage />}
                />
                <Route path="department/add" element={<AddDepartmentPage />} />

                <Route path="leave/*" element={<LeavePage />} />
                <Route path="attendance/*" element={<AttendancePage />} />
                <Route path="shifts" element={<ShiftManagementPage />} />

                {/* --- Payroll Routes --- */}
                {/* This now correctly uses the IMPORTED component */}
                <Route path="payroll/schedule" element={<PaySchedulePage />} />
                <Route path="payroll/period" element={<PayPeriodPage />} />
                <Route path="payroll/components" element={<SalaryComponentsPage />} />
                <Route path="payroll/compliance" element={<CompliancePage />} />
                <Route path="payroll/advance-salary" element={<AdvanceSalaryPage />} />
                <Route path="payroll/run-payroll" element={<RunPayrollPage />} />
                <Route path="payroll/run-payroll/:runId" element={<PayrollRunDetailPage />} />
                <Route path="payroll/summary" element={<PayrollSummaryPage />} />
                <Route path="payroll/round-rules" element={<RoundRulesPage />} />
                <Route path="payroll/pay-batch" element={<PayBatchPage />} />
                <Route path="payroll/approval-flow" element={<ApprovalFlowPage />} />
                <Route path="payroll/direct-deposits" element={<CompanyBankSettingsPage />} />
                <Route path="payroll/payslip-settings" element={<PayslipSettingsPage />} />
                <Route path="payroll/final-settlements" element={<FinalSettlementsPage />} />
                <Route path="payroll" element={<Navigate to="/app/payroll/schedule" replace />} />


                <Route path="*" element={<div>App Section Not Found</div>} />
              </Route>
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </LeaveTypesProvider>
        </DepartmentProvider>
      </EmployeeProvider>
    </ReferenceDataProvider>
  );
}

export default App;