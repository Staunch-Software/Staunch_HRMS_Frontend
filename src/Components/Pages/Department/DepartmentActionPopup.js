// src/Components/Pages/Department/DepartmentActionPopup.js
import React, { useState, useEffect } from "react";
import styles from "./ActionPopup.module.css";
import { IoTrash } from "react-icons/io5";

const DepartmentActionPopup = ({
  department,
  isOpen,
  onClose,
  onSaveStatus,
  onDelete,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (isOpen && department) {
      setSelectedStatus(department.status);
    } else if (!isOpen) {
      setSelectedStatus("");
    }
  }, [isOpen, department]);

  if (!isOpen || !department) {
    return null;
  }

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleSaveClick = () => {
    if (selectedStatus && selectedStatus !== department.status) {
      onSaveStatus(department.id, selectedStatus);
      onClose();
    } else {
      onClose();
    }
  };

  // --- MODIFIED: Remove window.confirm ---
  const handleDeleteClick = () => {
    console.log(`Initiating delete for department ID: ${department.id}`);
    onDelete(department.id); // Directly call the onDelete callback from parent
    onClose(); // Close the popup immediately after calling delete
  };
  // --- End Modification ---

  const departmentIdentifier = `${department.name} (${
    department.code || "N/A"
  })`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <h3>Department Actions</h3>
        <p className={styles.identifier}>{departmentIdentifier}</p>
        <hr className={styles.divider} />
        <h4>Update Status:</h4>
        <div className={styles.statusOptions}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`dept-status-${department.id}`}
              value="Active"
              checked={selectedStatus === "Active"}
              onChange={handleStatusChange}
            />{" "}
            Set as Active
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name={`dept-status-${department.id}`}
              value="Inactive"
              checked={selectedStatus === "Inactive"}
              onChange={handleStatusChange}
            />{" "}
            Set as Inactive
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.saveButton}
            onClick={handleSaveClick}
            disabled={!selectedStatus || selectedStatus === department.status}
          >
            Save Status Change
          </button>
        </div>

        <hr className={styles.divider} />

        <h4>Delete Department:</h4>
        {/* You can keep the warning text or remove it */}
        <p className={styles.warningText}>This cannot be undone. Proceed?</p>
        <div className={styles.buttonGroup}>
          {/* Delete button now calls modified handleDeleteClick */}
          <button
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            title={`Delete ${department.name}`}
          >
            <IoTrash /> Delete Department
          </button>
        </div>

        <div className={`${styles.buttonGroup} ${styles.closeButtonGroup}`}>
          <button className={styles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentActionPopup;
