import React, { useState, useEffect } from 'react';
import styles from './ActionPopup.module.css'; // Reuse ActionPopup styles
import { IoTrash } from "react-icons/io5";

const DesignationActionPopup = ({ designation, isOpen, onClose, onSaveStatus, onDelete }) => {
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (isOpen && designation) {
      setSelectedStatus(designation.status);
    } else if (!isOpen) {
       setSelectedStatus('');
    }
  }, [isOpen, designation]);

  if (!isOpen || !designation) return null;

  const handleStatusChange = (event) => setSelectedStatus(event.target.value);

  const handleSaveClick = () => {
    if (selectedStatus && selectedStatus !== designation.status) {
       onSaveStatus(designation.id, selectedStatus);
       onClose();
    } else {
       onClose();
    }
  };

  const handleDeleteClick = () => {
    // Confirmation is handled in the parent list component's handler now
    onDelete(designation.id);
    onClose();
  }

  // Display designation name and potentially department (if passed in designation object)
  const designationIdentifier = `${designation.name || 'Designation'}${designation.departmentName ? ` (${designation.departmentName.split(' ')[0]})` : ''}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <h3>Designation Actions</h3>
        <p className={styles.identifier}> {designationIdentifier} </p>

        <h4>Update Status:</h4>
        <div className={styles.statusOptions}>
          <label className={styles.radioLabel}>
            <input type="radio" name={`des-status-${designation.id}`} value="Active" checked={selectedStatus === 'Active'} onChange={handleStatusChange}/> Set as Active
          </label>
          <label className={styles.radioLabel}>
            <input type="radio" name={`des-status-${designation.id}`} value="Inactive" checked={selectedStatus === 'Inactive'} onChange={handleStatusChange}/> Set as Inactive
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={handleSaveClick} disabled={!selectedStatus || selectedStatus === designation.status} > Save Status Change </button>
        </div>

        <hr className={styles.divider} />

         <h4>Delete Designation:</h4>
         <p className={styles.warningText}>This action cannot be undone. Ensure no employees are assigned.</p>
         <div className={styles.buttonGroup}>
              <button className={styles.deleteButton} onClick={handleDeleteClick} title={`Delete ${designation.name}`}> <IoTrash /> Delete Designation </button>
         </div>

         <div className={`${styles.buttonGroup} ${styles.closeButtonGroup}`}>
             <button className={styles.cancelButton} onClick={onClose}> Close </button>
         </div>
      </div>
    </div>
  );
};

export default DesignationActionPopup;