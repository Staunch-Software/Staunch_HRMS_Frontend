import React from 'react';
import styles from './Sidebar.module.css'; // Ensure this is Sidebar.module.css
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// IMPORT EACH ICON INDIVIDUALLY
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';


const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          Staunch Payroll
        </div>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={`${styles.navItem} ${styles.navItemSelected}`}>
            <FontAwesomeIcon icon={faTachometerAlt} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Dashboard</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faBuilding} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Organization Profile</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faUsers} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Employees</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faSitemap} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Department</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Designation</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faMoneyBillAlt} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Payroll Runs</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Leave & Attendance</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faFileAlt} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Templates</span>
          </li>

          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faCog} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Settings</span>
          </li>
          <li className={styles.navItem}>
            <FontAwesomeIcon icon={faQuestionCircle} className={styles.navIcon} />
            <span className={styles.navItemSpan}>Help Center</span>
          </li>
        </ul>
      </nav>
    </div>
    
    
  );
};

export default Sidebar;