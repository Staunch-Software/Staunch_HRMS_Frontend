// ShiftRosterCalendar.js (Conceptual Example using react-big-calendar)
import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
// import { useShifts } from '../../contexts/ShiftContext'; // For definitions and assignments
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import default styles
import styles from './ShiftManagement.module.css';
// import AssignShiftModal from './AssignShiftModal'; // You'll need this modal

const localizer = momentLocalizer(moment);

const ShiftRosterCalendar = () => {
    // const { shiftDefinitions, shiftAssignments, assignShift } = useShifts();
    // --- Dummy Data ---
    const shiftDefinitions = [
        { id: 'sh1', name: 'Morning', color: '#aeeeee' }, { id: 'sh2', name: 'Evening', color: '#f5deb3' }, { id: 'sh3', name: 'Night', color: '#d3d3d3' }
    ];
    const [shiftAssignments, setShiftAssignments] = useState([
        { id: 'a1', employeeId: 'emp101', employeeName: 'Alice', date: '2024-03-15', shiftId: 'sh1' },
        { id: 'a2', employeeId: 'emp102', employeeName: 'Bob', date: '2024-03-15', shiftId: 'sh2' },
        { id: 'a3', employeeId: 'emp101', employeeName: 'Alice', date: '2024-03-16', shiftId: 'sh1' },
    ]);
    const assignShift = (assignment) => setShiftAssignments(a => [...a, { ...assignment, id: `a${Date.now()}` }]);
    // --- End Dummy Data ---

    const [selectedSlot, setSelectedSlot] = useState(null); // For assigning
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Memoize events for the calendar
    const events = useMemo(() => {
        const defMap = new Map(shiftDefinitions.map(d => [d.id, d]));
        return shiftAssignments.map(assignment => {
            const definition = defMap.get(assignment.shiftId);
            const eventDate = moment(assignment.date).toDate();
            return {
                id: assignment.id,
                title: `${assignment.employeeName} - ${definition?.name || 'Unknown Shift'}`,
                start: eventDate,
                end: eventDate, // All-day event for simplicity, adjust if needed
                allDay: true,
                resourceId: assignment.employeeId, // Optional: for resource views
                style: { backgroundColor: definition?.color || '#808080' }, // Apply color
            };
        });
    }, [shiftAssignments, shiftDefinitions]);

    const handleSelectSlot = ({ start, end, resourceId }) => {
        // Trigger modal to assign a shift for this slot/date/resource
        console.log('Selected slot:', start, resourceId);
        setSelectedSlot({ start, end, resourceId }); // Store selected slot info
        setIsAssignModalOpen(true);
    };

    const handleAssignShift = (employeeId, employeeName, shiftId, date) => {
         // Usually call context/API here
         assignShift({ employeeId, employeeName, shiftId, date: moment(date).format('YYYY-MM-DD') });
         console.log(`Assigning ${shiftId} to ${employeeName} (${employeeId}) on ${moment(date).format('YYYY-MM-DD')}`);
         setIsAssignModalOpen(false);
         setSelectedSlot(null);
    };

    return (
        <div className={styles.calendarContainer}>
            <h3>Shift Roster</h3>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }} // Adjust height as needed
                selectable={true} // Allow selecting slots
                onSelectSlot={handleSelectSlot}
                // Other props: views, defaultView, onSelectEvent, eventPropGetter for styling etc.
                eventPropGetter={(event) => ({ style: event.style })} // Apply custom style from event data
            />
            {/* You need to create the AssignShiftModal component */}
            {/* {isAssignModalOpen && selectedSlot && (
                <AssignShiftModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    slotInfo={selectedSlot}
                    shiftDefinitions={shiftDefinitions}
                    onAssign={handleAssignShift}
                    // Pass employee list if needed for selection
                />
            )} */}
             {isAssignModalOpen && <p>Assign Shift Modal Placeholder (Implement AssignShiftModal.js)</p>}

        </div>
    );
};

export default ShiftRosterCalendar;