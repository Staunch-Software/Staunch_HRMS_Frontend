import React, { useRef, useEffect } from 'react';
import { Link, useLocation, Route, Routes } from 'react-router-dom';
import styles from './LeavePage.module.css';
import LeaveLogContent from './LeaveLogContent';
import LeaveTypesContent from './LeaveTypesContent';
import LeaveSettingsContent from './LeaveSettingsContent';
import AddLeaveTypePage from './AddLeaveTypePage';

const LeavePage = () => {
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
            {/* <h1 className={styles.mainTitle}>Leave</h1> */}

            <nav className={styles.leaveNav} ref={navRef}>
                <div className={styles.navIndicator} ref={lineRef}></div>
                <ul className={styles.leaveNavList}>
                    <li className={styles.leaveNavItem}>
                        <Link to="/app/leave/leave-log" className={`${styles.leaveNavLink} ${isActive('/app/leave/leave-log')}`}>
                            Leave Logs
                        </Link>
                    </li>
                    <li className={styles.leaveNavItem}>
                        <Link to="/app/leave/leave-types" className={`${styles.leaveNavLink} ${isActive('/app/leave/leave-types')}`}>
                            Leave Types
                        </Link>
                    </li>
                    <li className={styles.leaveNavItem}>
                        <Link to="/app/leave/settings" className={`${styles.leaveNavLink} ${isActive('/app/leave/settings')}`}>
                            Settings
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className={styles.leaveContent}>
                <Routes>
                    <Route path="leave-log" element={<LeaveLogContent />} />
                    <Route path="leave-types" element={<LeaveTypesContent />} />
                    <Route path="leave-types/add" element={<AddLeaveTypePage />} />
                    <Route path="settings" element={<LeaveSettingsContent />} />
                    <Route path="*" element={<LeaveLogContent />} />
                </Routes>
            </div>
        </div>
    );
};

export default LeavePage;