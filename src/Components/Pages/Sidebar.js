import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faSitemap,
  faBriefcase,
  faMoneyBillAlt,
  faCalendarAlt,
  faFileAlt,
  faCog,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GoOrganization } from "react-icons/go";

const navItems = [
  {
    id: "dashboard",
    path: "/app/dashboard",
    label: "Dashboard",
    IconComponent: MdOutlineSpaceDashboard,
    isReactIcon: true,
  },
  {
    id: "organization",
    path: "/app/organization",
    label: "Organization",
    IconComponent: GoOrganization,
    isReactIcon: true,
  },
  {
    id: "employee",
    path: "/app/employee",
    label: "Employee",
    IconComponent: faUsers,
    isReactIcon: false,
  },
  {
    id: "department",
    path: "/app/department",
    label: "Department",
    IconComponent: faSitemap,
    isReactIcon: false,
  },
  {
    id: "designation",
    path: "/app/designation",
    label: "Designation",
    IconComponent: faBriefcase,
    isReactIcon: false,
  },
  {
    id: "payroll",
    path: "/app/payroll",
    basePath: "/app/payroll",
    label: "Payroll Runs",
    IconComponent: faMoneyBillAlt,
    isReactIcon: false,
    hasPopup: true,
  },
  {
    id: "leave_attendance",
    path: "/app/leave",
    basePath: "/app/leave_attendance",
    label: "Leave & Attendance",
    IconComponent: faCalendarAlt,
    isReactIcon: false,
    hasPopup: true,
  },
  {
    id: "templates",
    path: "/app/templates",
    label: "Templates",
    IconComponent: faFileAlt,
    isReactIcon: false,
  },
  {
    id: "settings",
    path: "/app/settings",
    label: "Settings",
    IconComponent: faCog,
    isReactIcon: false,
  },
  {
    id: "help",
    path: "/app/help",
    label: "Help Center",
    IconComponent: faQuestionCircle,
    isReactIcon: false,
  },
];

const payrollSubItems = [
  { id: "schedule", path: "/app/payroll/schedule", label: "Payroll Schedule" },
  { id: "components", path: "/app/payroll/components", label: "Earnings and Deductions" },
  { id: "compliance", path: "/app/payroll/compliance", label: "Statutory Compliance" },
  { id: "advance", path: "/app/payroll/advance-salary", label: "Advance Salary" },
  { id: "summary", path: "/app/payroll/summary", label: "Payroll Summary" },
  { id: "roundrules", path: "/app/payroll/round-rules", label: "Rounding Rules" },
  { id: "paybatch", path: "/app/payroll/pay-batch", label: "Payroll Batch" },
  { id: "approval", path: "/app/payroll/approval-flow", label: "Approval Workflow" },
  { id: "deposits", path: "/app/payroll/direct-deposits", label: "Company Bank Settings" },
  { id: "payslip", path: "/app/payroll/payslip-settings", label: "Payslip Settings" },
  { id: "settlements", path: "/app/payroll/final-settlements", label: "Final Settlements" },
];

const Sidebar = () => {
  const location = useLocation();

  const [isLeaveAttendanceOpen, setIsLeaveAttendanceOpen] = useState(false);
  const [isPayrollPopupOpen, setIsPayrollPopupOpen] = useState(false);

  const leavePopupRef = useRef(null);
  const payrollPopupRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const payrollTimeoutRef = useRef(null);

  const popupTimeoutDuration = 200;

  const handleLeaveMouseEnter = () => {
    clearTimeout(leaveTimeoutRef.current);
    clearTimeout(payrollTimeoutRef.current);
    setIsPayrollPopupOpen(false);
    setIsLeaveAttendanceOpen(true);
  };

  const handleLeaveMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsLeaveAttendanceOpen(false);
    }, popupTimeoutDuration);
  };

    const handleLeavePopupMouseEnter = () => {
    clearTimeout(leaveTimeoutRef.current);
  };


  const closeLeavePopup = () => {
    clearTimeout(leaveTimeoutRef.current);
    setIsLeaveAttendanceOpen(false);
  };

  const handlePayrollMouseEnter = () => {
    clearTimeout(payrollTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);
    setIsLeaveAttendanceOpen(false);
    setIsPayrollPopupOpen(true);
  };

  const handlePayrollMouseLeave = () => {
    payrollTimeoutRef.current = setTimeout(() => {
      setIsPayrollPopupOpen(false);
    }, popupTimeoutDuration);
  };

    const handlePayrollPopupMouseEnter = () => {
    clearTimeout(payrollTimeoutRef.current);
  };

  const closePayrollPopup = () => {
    clearTimeout(payrollTimeoutRef.current);
    setIsPayrollPopupOpen(false);
  };


  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link to="/app/dashboard" className={styles.logoLink}>
          <div className={styles.logo}>Staunch Payroll</div>
        </Link>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isDirectlyActive =
              location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path) && !item.hasPopup);

            const isLeaveOrAttendanceSectionActive =
                item.id === "leave_attendance" &&
                (location.pathname.startsWith("/app/leave") ||
                 location.pathname.startsWith("/app/attendance"));

            const isPayrollSectionActive =
                 item.id === "payroll" &&
                 location.pathname.startsWith("/app/payroll");

            const itemClassName = `${styles.navItem} ${
              isDirectlyActive || isLeaveOrAttendanceSectionActive || isPayrollSectionActive
                ? styles.navItemSelected
                : ""
            }`;

            const Icon = item.IconComponent;
            const defaultLinkPath = item.hasPopup ? (item.id === "leave_attendance" ? "/app/leave/leave-log" : "/app/payroll/schedule") : item.path;


            if (item.id === "leave_attendance") {
              return (
                <li
                  key={item.id}
                  className={itemClassName}
                  onMouseEnter={handleLeaveMouseEnter}
                  onMouseLeave={handleLeaveMouseLeave}
                >
                  <Link to="/app/leave/leave-log" className={styles.navLink}>
                    {item.isReactIcon ? (
                      <Icon className={styles.navIcon} />
                    ) : (
                      <FontAwesomeIcon icon={Icon} className={styles.navIcon} />
                    )}
                    <span className={styles.navItemSpan}>{item.label}</span>
                  </Link>
                  {isLeaveAttendanceOpen && (
                    <div
                      className={`${styles.popupCommon} ${styles.LeaveAttendancePopup}`}
                      ref={leavePopupRef}
                      onMouseEnter={handleLeavePopupMouseEnter}
                      onMouseLeave={handleLeaveMouseLeave}
                    >
                      <Link
                        to="/app/leave/leave-log"
                        className={styles.popupLink}
                        onClick={closeLeavePopup}
                      >
                        Leave
                      </Link>
                      <Link
                        to="/app/attendance/attendance-log"
                        className={styles.popupLink}
                        onClick={closeLeavePopup}
                      >
                        Attendance
                      </Link>
                    </div>
                  )}
                </li>
              );
            }

            if (item.id === "payroll") {
              return (
                <li
                  key={item.id}
                  className={itemClassName}
                  onMouseEnter={handlePayrollMouseEnter}
                  onMouseLeave={handlePayrollMouseLeave}
                >
                  <Link to="/app/payroll/schedule" className={styles.navLink}>
                    {item.isReactIcon ? (
                      <Icon className={styles.navIcon} />
                    ) : (
                      <FontAwesomeIcon icon={Icon} className={styles.navIcon} />
                    )}
                    <span className={styles.navItemSpan}>{item.label}</span>
                  </Link>
                  {isPayrollPopupOpen && (
                    <div
                      className={`${styles.popupCommon} ${styles.PayrollPopup}`}
                      ref={payrollPopupRef}
                      onMouseEnter={handlePayrollPopupMouseEnter}
                      onMouseLeave={handlePayrollMouseLeave}
                    >
                     {payrollSubItems.map(subItem => (
                         <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={styles.popupLink}
                            onClick={closePayrollPopup}
                        >
                           {subItem.label}
                        </Link>
                     ))}
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id} className={itemClassName}>
                <Link to={item.path} className={styles.navLink}>
                  {item.isReactIcon ? (
                    <Icon className={styles.navIcon} />
                  ) : (
                    <FontAwesomeIcon icon={Icon} className={styles.navIcon} />
                  )}
                  <span className={styles.navItemSpan}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;