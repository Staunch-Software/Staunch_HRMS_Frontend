// src/Components/Pages/Employee/ActionPopup.js
import React, { useState, useEffect } from 'react';
import styles from './ActionPopup.module.css'; // Use the same CSS file as DepartmentActionPopup
import { IoTrash } from "react-icons/io5"; // Icon for delete

// Renamed component for clarity, ensure you update the import in EmployeeList.js
const EmployeeActionPopup = ({ employee, isOpen, onClose, onSaveStatus, onDelete }) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  // Update internal state when popup opens or employee changes
  useEffect(() => {
    if (isOpen && employee) {
      setSelectedStatus(employee.status || ''); // Pre-select current status, default to empty string
    } else if (!isOpen) {
      setSelectedStatus(''); // Clear when closed
    }
  }, [isOpen, employee]);

  // Don't render if not open or no employee data
  if (!isOpen || !employee) {
    return null;
  }

  // Handle radio button changes for status
  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  // Call the onSaveStatus callback passed from parent
  const handleSaveClick = () => {
    // Only save if a status is selected and it's different from the original
    if (selectedStatus && selectedStatus !== employee.status) {
       // Use the primary employee ID (assuming 'id' is preferred, fallback to employeeId)
       const idToUse = employee.id || employee.employeeId;
       onSaveStatus(idToUse, selectedStatus); // Pass ID and new status
       onClose(); // Close after saving
    } else {
       onClose(); // If same status or no selection, just close
    }
  };

  // Handle delete action (no confirmation here, happens in parent if needed)
  const handleDeleteClick = () => {
    console.log(`Initiating delete for employee ID: ${employee.id || employee.employeeId}`);
    const idToUse = employee.id || employee.employeeId;
    onDelete(idToUse); // Directly call the onDelete callback from parent
    onClose(); // Close the popup immediately after calling delete
  }

  // Construct display info
  const employeeName = `${employee.firstName || ''} ${employee.middleName || ''} ${employee.lastName || ''}`.replace(/\s+/g, ' ').trim();
  // Prefer employee.id if available, otherwise use employee.employeeId
  const displayId = employee.id || employee.employeeId || 'N/A';
  const employeeIdentifier = `${employeeName || 'Employee'} (ID: ${displayId})`;

  return (
    // Overlay to close popup on background click
    <div className={styles.overlay} onClick={onClose}>
      {/* Popup container, stop propagation to prevent closing when clicking inside */}
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* --- Changed Title --- */}
        <h3>Employee Actions</h3>
        {/* --- Use consistent class name --- */}
        <p className={styles.identifier}>
            {employeeIdentifier}
        </p>
         {/* Using hr like Department popup */}

        {/* --- Status Update Section (same structure as Department) --- */}
        <h4>Update Status:</h4>
        <div className={styles.statusOptions}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`emp-status-${displayId}`} // Use unique employee ID
              value="Active"
              checked={selectedStatus === 'Active'}
              onChange={handleStatusChange}
            />
            Set as Active
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`emp-status-${displayId}`}
              value="Inactive"
              checked={selectedStatus === 'Inactive'}
              onChange={handleStatusChange}
            />
           Set as Inactive
          </label>
          {/* Add other statuses like 'Terminated', 'On Leave' if applicable */}
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.saveButton} // Use consistent button style
            onClick={handleSaveClick}
            // Disable if selection hasn't changed from original
            disabled={!selectedStatus || selectedStatus === employee.status}
           >
            Save Status Change
          </button>
        </div>

        {/* --- Added Divider --- */}
        <hr className={styles.divider} />

         {/* --- ADDED: Delete Section (Mirrors Department) --- */}
         <h4>Delete Employee:</h4>
         <p className={styles.warningText}>Deleting an employee is permanent and cannot be undone.</p>
         <div className={styles.buttonGroup}>
              <button
                  className={styles.deleteButton} // Use consistent delete style
                  onClick={handleDeleteClick} // Calls the new handler
                  title={`Delete ${employeeName}`}
              >
                  <IoTrash /> Delete Employee
              </button>
         </div>
         {/* --- End Delete Section --- */}


         {/* --- Close Button (Mirrors Department) --- */}
         <div className={`${styles.buttonGroup} ${styles.closeButtonGroup}`}>
             <button className={styles.cancelButton} onClick={onClose}>
                 Close
             </button>
         </div>

      </div>
    </div>
  );
};

// Ensure export name matches if renamed
export default EmployeeActionPopup;