// AttendancePage.js
import React, { useRef, useEffect } from 'react';
import { Link, useLocation, Route, Routes, Navigate } from 'react-router-dom';
import styles from '../Leave/LeavePage.module.css'; // Reusing styles
import AttendanceLogContent from './AttendanceLogContent';
import ShiftScheduleContent from './AttendanceRulesContent';
import AttendanceSettingsContent from './AttendanceSettingsContent';

const AttendancePage = () => {
    const location = useLocation();
    const navRef = useRef(null);
    const lineRef = useRef(null);

    useEffect(() => {
        const handleActive = () => {
            if (navRef.current.querySelector("." + styles.activeLink)) {
                const active = navRef.current.querySelector("." + styles.activeLink);
                const left = active.offsetLeft + "px";
                lineRef.current.style.left = left;
            }
        }

        handleActive();

        window.addEventListener("resize", handleActive)
        return () => {
            window.removeEventListener('resize', handleActive);
        }
    }, [location]);


    const isActive = (path) => location.pathname.startsWith(path) ? styles.activeLink : '';

    return (
        <div className={styles.leaveLogPage}>
            <nav className={styles.leaveNav} ref={navRef}>
                 <div className={styles.navIndicator} ref={lineRef}></div>
                <ul className={styles.leaveNavList}>
                    <li className={styles.leaveNavItem}>
                        <Link
                            to="/app/attendance/attendance-log"
                            className={`${styles.leaveNavLink} ${isActive('/app/attendance/attendance-log')}`}
                        >
                            Attendance Log
                        </Link>
                    </li>
                    <li className={styles.leaveNavItem}>
                        <Link
                             to="/app/attendance/shift-schedule"
                             className={`${styles.leaveNavLink} ${isActive('/app/attendance/shift-schedule')}`}
                        >
                            Attendance Rules
                        </Link>
                    </li>
                    <li className={styles.leaveNavItem}>
                        <Link
                            to="/app/attendance/settings"
                            className={`${styles.leaveNavLink} ${isActive('/app/attendance/settings')}`}
                        >
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className={styles.leaveContent}>
                <Routes>
                    <Route index element={<Navigate to="attendance-log" replace />} />
                    <Route path="attendance-log" element={<AttendanceLogContent />} />
                    <Route path="shift-schedule" element={<ShiftScheduleContent />} />
                    <Route path="settings" element={<AttendanceSettingsContent />} />
                    <Route path="*" element={<Navigate to="attendance-log" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default AttendancePage;