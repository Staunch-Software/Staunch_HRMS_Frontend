// LeaveLogFilterPopup.js
import React, { useState, useEffect } from 'react';
import styles from './LeaveLogFilterPopup.module.css'; // Create or use this CSS file

// --- Dummy Data for Selects (Replace with actual data/fetch) ---
const leaveTypeOptions = [
    { value: 'Vacation', label: 'Vacation' },
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Personal', label: 'Personal' },
];
const departmentOptions = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'IT', label: 'IT' },
    { value: 'HR', label: 'HR' },
];
const locationOptions = [
    { value: 'chennai', label: 'chennai' },
    { value: 'mumbai', label: 'mumbai' },
];
// --- End Dummy Data ---

const LeaveLogFilterPopup = ({ isOpen, onClose, onApplyFilters, initialFilters }) => {
  const [status, setStatus] = useState(initialFilters.status || '');
  const [leaveType, setLeaveType] = useState(initialFilters.leaveType || '');
  const [department, setDepartment] = useState(initialFilters.department || '');
  const [location, setLocation] = useState(initialFilters.location || '');
  const [appliedOnDate, setAppliedOnDate] = useState(initialFilters.appliedOnDate || '');

  useEffect(() => {
    if (isOpen) {
        setStatus(initialFilters.status || '');
        setLeaveType(initialFilters.leaveType || '');
        setDepartment(initialFilters.department || '');
        setLocation(initialFilters.location || '');
        setAppliedOnDate(initialFilters.appliedOnDate || '');
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters({
      status,
      leaveType,
      department,
      location,
      appliedOnDate,
    });
    onClose();
  };

  const handleReset = () => {
    setStatus('');
    setLeaveType('');
    setDepartment('');
    setLocation('');
    setAppliedOnDate('');
    onApplyFilters({ status: '', leaveType: '', department: '', location: '', appliedOnDate: '' });
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.popupBackdrop} onClick={onClose}>
      <div className={styles.popupContent} onClick={handlePopupClick}>
        <h3>Filter Leave Log</h3>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="filterStatus">Status</label>
            <select id="filterStatus" value={status} onChange={(e) => setStatus(e.target.value)} className={styles.filterInput}>
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filterLeaveType">Leave Type</label>
            <select id="filterLeaveType" value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={styles.filterInput}>
                <option value="">All Types</option>
                {leaveTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filterDepartment">Department</label>
             <select id="filterDepartment" value={department} onChange={(e) => setDepartment(e.target.value)} className={styles.filterInput}>
                <option value="">All Departments</option>
                {departmentOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="filterLocation">Location</label>
             <select id="filterLocation" value={location} onChange={(e) => setLocation(e.target.value)} className={styles.filterInput}>
                <option value="">All Locations</option>
                {locationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

           <div className={styles.filterGroup}>
            <label htmlFor="filterAppliedOn">Applied On Date</label>
            <input type="date" id="filterAppliedOn" value={appliedOnDate} onChange={(e) => setAppliedOnDate(e.target.value)} className={styles.filterInput} />
          </div>

            <div></div>

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

export default LeaveLogFilterPopup;