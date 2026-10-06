// AttendanceLogContent.js
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import styles from './AttendanceLogContent.module.css';
import { IoFilter } from "react-icons/io5";
import AttendanceLogFilterPopup from "./AttendanceLogFilterPopup";

const allLogData = [
    { id: 'EMP001', employee: 'Rajesh', date: '2025-04-19', status: 'Present', inTime: '09:32', outTime: '15:58', workDuration: '6h 26m', location: 'Chennai', department: 'Engineering' },
    { id: 'EMP002', employee: 'Ganesh', date: '2025-04-19', status: 'Absent', inTime: null, outTime: null, workDuration: '0h 0m', location: 'Chennai', department: 'Marketing' },
    { id: 'EMP003', employee: 'Suresh', date: '2025-04-19', status: 'Leave', inTime: null, outTime: null, workDuration: '0h 0m', location: 'Chennai', department: 'Sales' },
    { id: 'EMP004', employee: 'Ramesh', date: '2025-04-19', status: 'Holiday', inTime: null, outTime: null, workDuration: '0h 0m', location: 'Chennai', department: 'Sales' },
    // Add more data including different dates and appliedOn dates if filtering by appliedOn
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

const AttendanceLogContent = () => {
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        status: '',
        // Reset other potential filter fields if LeaveLogFilterPopup was copied
        // leaveType: '', // Remove if not applicable to attendance
        department: '',
        location: '',
        // appliedOnDate: '', // Remove if filtering by log date picker
        employeeName: '' // Add if needed
    });

    // Filter data based on selectedDate AND activeFilters
    const logData = useMemo(() => {
        return allLogData.filter(log => {
            // Date match (based on the primary date picker)
            const dateMatch = log.date === selectedDate;

            // Filter matches
            const statusMatch = !activeFilters.status || log.status.toLowerCase() === activeFilters.status.toLowerCase();
            const departmentMatch = !activeFilters.department || log.department?.toLowerCase().includes(activeFilters.department.toLowerCase());
            const locationMatch = !activeFilters.location || log.location?.toLowerCase().includes(activeFilters.location.toLowerCase());
            const employeeMatch = !activeFilters.employeeName || log.employee.toLowerCase().includes(activeFilters.employeeName.toLowerCase());
            // Add appliedOn match from filters if LeaveLogFilterPopup was copied and is still used
            // const appliedOnMatch = !activeFilters.appliedOnDate || log.appliedOn === activeFilters.appliedOnDate;

            // Combine all conditions
            return dateMatch && statusMatch && departmentMatch && locationMatch && employeeMatch /* && appliedOnMatch (if using applied date filter) */;
        });
    }, [selectedDate, activeFilters]); // Re-filter when date OR filters change

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'present': return styles.statusPresent;
            case 'absent': return styles.statusAbsent;
            case 'leave': return styles.statusLeave;
            case 'holiday': return styles.statusHoliday;
            case 'week off': return styles.statusWeekOff;
            case 'half day': return styles.statusHalfDay;
            default: return '';
        }
    };

    const handleOpenFilterPopup = () => setIsFilterPopupOpen(true);
    const handleCloseFilterPopup = () => setIsFilterPopupOpen(false);

    const handleApplyFilters = (newFilters) => {
        // Update active filters which triggers the useMemo to re-filter
        setActiveFilters(newFilters);
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                 <div className={styles.titleContainer}>
                    <h2 className={styles.title}>Attendance Log</h2>
                    <button onClick={handleOpenFilterPopup} className={styles.filterButton} title="Filter Logs">
                         <IoFilter size="1.1em"/>
                    </button>
                </div>
                <div className={styles.datePickerContainer}>
                    <label htmlFor="logDate" className={styles.datePickerLabel}>Select Date:</label>
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
                <div className={styles.attendanceLogTable}>
                    <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                        <div className={`${styles.tableCell} ${styles.idCell} ${styles.sticky}`}>ID</div>
                        <div className={`${styles.tableCell} ${styles.employeeCell} ${styles.sticky}`}>Employee</div>
                        <div className={styles.tableCell}>Status</div>
                        <div className={styles.tableCell}>In Time</div>
                        <div className={styles.tableCell}>Out Time</div>
                        <div className={styles.tableCell}>Work Duration</div>
                        <div className={styles.tableCell}>Location</div>
                        <div className={styles.tableCell}>Department</div>
                    </div>

                    {logData.length > 0 ? (
                        logData.map(log => (
                            <div className={styles.tableRow} key={log.id + log.date}>
                                <div className={`${styles.tableCell} ${styles.idCell} ${styles.sticky}`}>{log.id}</div>
                                <div className={`${styles.tableCell} ${styles.employeeCell} ${styles.sticky}`}>{log.employee}</div>
                                <div className={`${styles.tableCell} ${styles.statusCell} ${getStatusClass(log.status)}`}>{log.status || 'N/A'}</div>
                                <div className={styles.tableCell}>{log.inTime || '-'}</div>
                                <div className={styles.tableCell}>{log.outTime || '-'}</div>
                                <div className={styles.tableCell}>{log.workDuration || '-'}</div>
                                <div className={styles.tableCell}>{log.location || 'N/A'}</div>
                                <div className={styles.tableCell}>{log.department || 'N/A'}</div>
                            </div>
                        ))
                    ) : (
                        <div className={`${styles.tableCell} ${styles.noItemsMessage}`}>
                            No attendance records found for {selectedDate} with the applied filters.
                        </div>
                    )}
                </div>
            </div>

             <AttendanceLogFilterPopup
                isOpen={isFilterPopupOpen}
                onClose={handleCloseFilterPopup}
                onApplyFilters={handleApplyFilters}
                initialFilters={activeFilters}
             />

        </div>
    );
};

export default AttendanceLogContent;