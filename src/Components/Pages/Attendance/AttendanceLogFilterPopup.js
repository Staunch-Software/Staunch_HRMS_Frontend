// AttendanceLogFilterPopup.js
import React, { useState, useEffect } from 'react';
import styles from './AttendanceLogFilterPopup.module.css'; // Create this new CSS file

// --- Dummy Data for Selects (Replace with actual data/fetch) ---
// Define potential statuses used in your attendance log
const statusOptions = [
    { value: 'Present', label: 'Present' },
    { value: 'Absent', label: 'Absent' },
    { value: 'Leave', label: 'Leave' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Week Off', label: 'Week Off' },
    { value: 'Half Day', label: 'Half Day' },
    // Add other statuses if applicable
];
const departmentOptions = [ // Should ideally come from context or props
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'IT', label: 'IT' },
    { value: 'HR', label: 'HR' },
];
const locationOptions = [ // Should ideally come from context or props
    { value: 'Chennai', label: 'Chennai' },
];
// --- End Dummy Data ---

const AttendanceLogFilterPopup = ({ isOpen, onClose, onApplyFilters, initialFilters }) => {
  // State specifically for attendance filters
  const [status, setStatus] = useState(initialFilters.status || '');
  const [department, setDepartment] = useState(initialFilters.department || '');
  const [location, setLocation] = useState(initialFilters.location || '');
  // Optional: Add employee name filter if needed later
  // const [employeeName, setEmployeeName] = useState(initialFilters.employeeName || '');

  useEffect(() => {
    // Reset form when popup opens or initial filters change
    if (isOpen) {
        setStatus(initialFilters.status || '');
        setDepartment(initialFilters.department || '');
        setLocation(initialFilters.location || '');
        // setEmployeeName(initialFilters.employeeName || '');
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Pass only the relevant filters for attendance
    onApplyFilters({
      status,
      department,
      location,
      // employeeName, // Include if you add the input
    });
    onClose();
  };

  const handleReset = () => {
    setStatus('');
    setDepartment('');
    setLocation('');
    // setEmployeeName('');
    // Apply empty filters
    onApplyFilters({ status: '', department: '', location: '' /*, employeeName: ''*/ });
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.popupBackdrop} onClick={onClose}>
      <div className={styles.popupContent} onClick={handlePopupClick}>
        <h3>Filter Attendance Log</h3>
        <div className={styles.filterGrid}>
          {/* Status */}
          <div className={styles.filterGroup}>
            <label htmlFor="filterStatus">Status</label>
            <select id="filterStatus" value={status} onChange={(e) => setStatus(e.target.value)} className={styles.filterInput}>
              <option value="">All Status</option>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Department */}
          <div className={styles.filterGroup}>
            <label htmlFor="filterDepartment">Department</label>
             <select id="filterDepartment" value={department} onChange={(e) => setDepartment(e.target.value)} className={styles.filterInput}>
                <option value="">All Departments</option>
                {departmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
             {/* Or use text input: <input type="text" id="filterDepartment" placeholder="Enter Department" value={department} onChange={(e) => setDepartment(e.target.value)} className={styles.filterInput} /> */}
          </div>

          {/* Location */}
          <div className={styles.filterGroup}>
            <label htmlFor="filterLocation">Location</label>
             <select id="filterLocation" value={location} onChange={(e) => setLocation(e.target.value)} className={styles.filterInput}>
                <option value="">All Locations</option>
                {locationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
              {/* Or use text input: <input type="text" id="filterLocation" placeholder="Enter Location" value={location} onChange={(e) => setLocation(e.target.value)} className={styles.filterInput} /> */}
          </div>

           {/* Optional: Add Employee Name Filter */}
          {/* <div className={styles.filterGroup}>
            <label htmlFor="filterEmployeeName">Employee Name</label>
            <input type="text" id="filterEmployeeName" placeholder="Enter Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className={styles.filterInput}/>
          </div> */}

           {/* Optional: Add an empty div if needed for grid alignment */}
           {/* <div></div> */}

        </div>
        <div className={styles.popupActions}>
          <button onClick={handleReset} className={styles.resetButton}>Reset</button>
          <button onClick={handleApply} className={styles.applyButton}>Apply Filters</button>
          <button onClick={onClose} className={styles.cancelButton}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogFilterPopup;