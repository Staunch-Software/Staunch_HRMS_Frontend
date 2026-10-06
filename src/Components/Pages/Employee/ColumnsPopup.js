// src/Components/Pages/Employee/ColumnsPopup.js
import React, { useState, useEffect } from 'react';
import styles from './ColumnsPopup.module.css'; // We'll create this CSS file

const ALL_POSSIBLE_COLUMNS = [
    { key: 'dateOfJoining', label: 'Date of Joining' },
    { key: 'workEmail', label: 'Work Email' },
    { key: 'mobileNumber', label: 'Mobile Number' },
    { key: 'gender', label: 'Gender' },
    { key: 'workLocation', label: 'Work Location' },
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department' },
    { key: 'basicSalary', label: 'Basic Salary' },
    { key: 'personalEmail', label: 'Personal Email' },
    { key: 'bankName', label: 'Bank Name' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }, 
];

const MAX_COLUMNS = 4;

const ColumnsPopup = ({ isOpen, onClose, onSave, currentSelectedColumns }) => {
    const [tempSelection, setTempSelection] = useState(new Set());

    useEffect(() => {
        if (isOpen) {
            setTempSelection(new Set(currentSelectedColumns));
        }
    }, [isOpen, currentSelectedColumns]);


    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        const currentSize = tempSelection.size;

        setTempSelection(prevSelection => {
            const newSelection = new Set(prevSelection); // Create a copy

            if (checked) {
                if (currentSize < MAX_COLUMNS) {
                    newSelection.add(value);
                } else {
                    // Optionally provide feedback: alert('You can only select 4 columns');
                    // Prevent checking the box visually by not updating state if limit reached
                    event.preventDefault(); // May not work reliably across browsers for checkbox
                    return prevSelection; // Return original set if limit reached
                }
            } else {
                // Remove if unchecked
                newSelection.delete(value);
            }
            return newSelection;
        });
    };


    const handleSaveClick = () => {
        // Convert the Set back to an array before saving
        onSave(Array.from(tempSelection));
    };

    // Determine if the save button should be enabled
    const canSaveChanges = tempSelection.size === MAX_COLUMNS;

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3>Pick Columns to Show</h3>
                <div className={styles.divider}></div>
                <p className={styles.instructions}>Limit your selection to {MAX_COLUMNS} columns .</p>
                <div className={styles.columnList}>
                    {ALL_POSSIBLE_COLUMNS.map(col => {
                        const isChecked = tempSelection.has(col.key);
                        const isDisabled = !isChecked && tempSelection.size >= MAX_COLUMNS;
                        return (
                            <label
                                key={col.key}
                                className={`${styles.checkboxLabel} ${isDisabled ? styles.disabledLabel : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    value={col.key}
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={handleCheckboxChange}
                                />
                                {col.label}
                            </label>
                        );
                    })}
                </div>
                <div className={styles.buttonGroup}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.saveButton}
                        onClick={handleSaveClick}
                        disabled={!canSaveChanges} // Disable if not exactly 4 selected
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColumnsPopup;