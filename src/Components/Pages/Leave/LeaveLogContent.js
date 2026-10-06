// LeaveLogContent.js
import React, { useState, useCallback, useEffect, useMemo } from "react";
import styles from "./LeaveLogContent.module.css";
import { IoFilter } from "react-icons/io5";
import LeaveLogFilterPopup from "./LeaveLogFilterPopup";

const allLeaveData = [
  { id: 101, employee: 'Rajesh Kumar', date: '2025-04-19', type: 'Sick Leave', reason: 'Fever', startDate: '2025-04-19', endDate: '2025-04-19', days: 1, status: 'Approved', appliedOn: '2025-04-19', location: 'chennai', department: 'Sales'},
  { id: 102, employee: 'Sharma', date: '2025-04-19', type: 'Vacation', reason: 'Personal Trip', startDate: '2025-04-19', endDate: '2025-04-21', days: 3, status: 'Pending', appliedOn: '2025-04-10', location: 'Mumbai', department: 'Engineering'},
  { id: 1, employee: "Suresh", date: '2025-04-15', type: "Vacation", reason: "Family Trip", startDate: "2025-04-15", endDate: "2025-04-20", days: 5, status: "Rejected", appliedOn: "2025-04-19", location: "Mumbai", department: "Engineering" },
  { id: 3, employee: 'Ganesh', date: '2025-04-16', type: 'Sick Leave', reason: 'Fever', startDate: '2025-04-16', endDate: '2025-04-17', days: 2, status: 'Rejected', appliedOn: '2025-04-21', location: 'Chennai', department: 'IT'},
  { id: 4, employee: 'Vijay', date: '2025-04-15', type: 'Vacation', reason: 'Holiday', startDate: '2025-04-25', endDate: '2025-04-28', days: 4, status: 'Pending', appliedOn: '2025-04-21', location: 'Mumbai', department: 'Marketing'}
];

const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        const today = new Date();
        const year = today.getFullYear();
        const month = (`0${today.getMonth() + 1}`).slice(-2);
        const day = (`0${today.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    }
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};

const LeaveLogContent = () => {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date())); // For the header date picker
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  // State for the filters applied via the popup
  const [activeFilters, setActiveFilters] = useState({
    status: '', leaveType: '', department: '', location: '', appliedOnDate: ''
  });

  // *** Filtering Logic using BOTH selectedDate (header) AND activeFilters (popup) ***
  const filteredLeaveData = useMemo(() => {
    console.log("Filtering with date:", selectedDate, "and filters:", activeFilters); // Debug log
    return allLeaveData.filter(log => {
      // 1. Check against popup filters first
      if (activeFilters.status && log.status.toLowerCase() !== activeFilters.status.toLowerCase()) {
        return false;
      }
      // Use exact match for selects from popup
      if (activeFilters.leaveType && log.type?.toLowerCase() !== activeFilters.leaveType.toLowerCase()) {
        return false;
      }
       if (activeFilters.department && log.department?.toLowerCase() !== activeFilters.department.toLowerCase()) {
        return false;
      }
      if (activeFilters.location && log.location?.toLowerCase() !== activeFilters.location.toLowerCase()) {
        return false;
      }
      // Primary date filter is the 'appliedOnDate' from the popup IF IT'S SET
      if (activeFilters.appliedOnDate && log.appliedOn !== activeFilters.appliedOnDate) {
        return false;
      }

      // 2. If appliedOnDate filter is NOT set in the popup,
      //    then apply the main date picker's filter (optional behavior)
      //    Comment this block out if the header date picker should *not* filter the main list
      if (!activeFilters.appliedOnDate) {
         // Example: Filter logs where the selectedDate falls within the leave duration
         // const selDate = new Date(selectedDate);
         // const startDate = new Date(log.startDate);
         // const endDate = new Date(log.endDate);
         // selDate.setHours(0, 0, 0, 0);
         // startDate.setHours(0, 0, 0, 0);
         // endDate.setHours(0, 0, 0, 0);
         // if (!(selDate >= startDate && selDate <= endDate)) {
         //    return false;
         // }

         // OR: Filter where appliedOn matches the header date picker (like before)
          if (log.appliedOn !== selectedDate) {
              return false;
          }
      }

      // If all active filters pass (or are empty), include the log
      return true;
    });
    // Depend on BOTH activeFilters and selectedDate
  }, [activeFilters, selectedDate]);

  const handleDateChange = (event) => {
    // If filters are active, changing the main date might reset appliedOnDate filter?
    // Decide on desired behavior. For now, just update selectedDate.
    // You could potentially clear activeFilters.appliedOnDate here too.
    // setActiveFilters(prev => ({ ...prev, appliedOnDate: '' }));
    setSelectedDate(event.target.value);
  };

  const handleActionClick = useCallback((leaveId) => {
    alert(`Action for leave ID: ${leaveId}`);
  }, []);

   const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return styles.statusApproved;
            case 'pending': return styles.statusPending;
            case 'rejected': return styles.statusRejected;
            default: return '';
        }
   };

  const handleOpenFilterPopup = () => setIsFilterPopupOpen(true);
  const handleCloseFilterPopup = () => setIsFilterPopupOpen(false);

  // Updates activeFilters state, which triggers the useMemo filter
  const handleApplyFilters = (newFilters) => {
    console.log("Applying Filters:", newFilters);
    setActiveFilters(newFilters);
    // If a date is selected in the filter, maybe update the main date picker?
    if (newFilters.appliedOnDate) {
        setSelectedDate(newFilters.appliedOnDate);
    }
    handleCloseFilterPopup(); // Close popup
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.titleContainer}>
            <h2 className={styles.title}>Leave Log</h2>
            <button onClick={handleOpenFilterPopup} className={styles.filterButton} title="Filter Logs">
                 <IoFilter size="1.1em"/>
            </button>
        </div>
        <div className={styles.datePickerContainer}>
          {/* Label clarified: This is an overview date unless filtering by it */}
          <label htmlFor="logDate" className={styles.datePickerLabel}>Overview Date:</label>
          <input
            type="date"
            id="logDate"
            name="logDate"
            value={selectedDate}
            onChange={handleDateChange}
            className={styles.datePicker}
          />
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.tableContainer}>
        <div className={styles.leaveLogTable}>
          {/* Table Header */}
          <div className={`${styles.tableRow} ${styles.tableHeader}`}>
            <div className={`${styles.tableCell} ${styles.checkboxCell} ${styles.sticky}`}>
              <input type="checkbox" aria-label="Select all leaves" disabled />
            </div>
            <div className={`${styles.tableCell} ${styles.employeeCell} ${styles.sticky}`}>Employee (ID)</div>
            <div className={styles.tableCell}>Leave Type</div>
            <div className={styles.tableCell}>Reason</div>
            <div className={styles.tableCell}>Status</div>
            <div className={styles.tableCell}>Start Date</div>
            <div className={styles.tableCell}>End Date</div>
            <div className={styles.tableCell}>Days</div>
            <div className={styles.tableCell}>Applied On</div>
            <div className={styles.tableCell}>Location</div>
            <div className={styles.tableCell}>Department</div>
            <div className={styles.tableCell}>Action</div>
          </div>

          {/* Table Body */}
          {filteredLeaveData.length > 0 ? (
            filteredLeaveData.map((leave) => (
              <div className={styles.tableRow} key={leave.id + leave.startDate}>
                <div className={`${styles.tableCell} ${styles.checkboxCell} ${styles.sticky}`}>
                  <input type="checkbox" aria-label={`Select leave ${leave.id}`} />
                </div>
                <div className={`${styles.tableCell} ${styles.employeeCell} ${styles.sticky}`} data-label="Employee">
                  {leave.employee} ({leave.id})
                </div>
                <div className={styles.tableCell} data-label="Leave Type"> {leave.type} </div>
                <div className={styles.tableCell} data-label="Reason"> {leave.reason} </div>
                <div className={`${styles.tableCell} ${styles.statusCell} ${getStatusClass(leave.status)}`} data-label="Status"> {leave.status} </div>
                <div className={styles.tableCell} data-label="Start Date"> {leave.startDate} </div>
                <div className={styles.tableCell} data-label="End Date"> {leave.endDate} </div>
                <div className={styles.tableCell} data-label="Days"> {leave.days} </div>
                <div className={styles.tableCell} data-label="Applied On"> {leave.appliedOn} </div>
                <div className={styles.tableCell} data-label="Location"> {leave.location} </div>
                <div className={styles.tableCell} data-label="Department"> {leave.department || 'N/A'} </div>
                <div className={styles.tableCell} data-label="Action">
                  <button className={styles.actionLink} onClick={() => handleActionClick(leave.id)}> Action </button>
                </div>
              </div>
            ))
          ) : (
            <div className={`${styles.tableCell} ${styles.noItemsMessage}`}>
              No leave records match the current date/filters.
            </div>
          )}
        </div>
      </div>

       <LeaveLogFilterPopup
          isOpen={isFilterPopupOpen}
          onClose={handleCloseFilterPopup}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
       />
    </div>
  );
};

export default LeaveLogContent;