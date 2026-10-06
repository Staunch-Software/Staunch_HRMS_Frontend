// ShiftManagementPage.js
import React from 'react';
import ShiftDefinitionList from './ShiftDefinitionList';
import ShiftRosterCalendar from './ShiftRosterCalendar';
import styles from './ShiftManagement.module.css'; // Your specific styles

const ShiftManagementPage = () => {
  return (
    <div className={styles.shiftManagementPageContainer}>
      <h2>Shift Management</h2>
      {/* Layout these components as needed (e.g., side-by-side, tabs) */}
      <div className={styles.shiftSections}>
          <ShiftDefinitionList />
          <ShiftRosterCalendar />
      </div>
    </div>
  );
};

export default ShiftManagementPage;