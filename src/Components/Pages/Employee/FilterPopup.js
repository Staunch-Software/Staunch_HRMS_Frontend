// src/Components/Pages/Employee/FilterPopup.js
import React, { useState, useEffect } from 'react';
import styles from './FilterPopup.module.css'; // Create this CSS file

const FilterPopup = ({ isOpen, onClose, onApplyFilters, initialFilters, availableOptions }) => {
    // State to hold temporary filter selections within the popup
    const [tempFilters, setTempFilters] = useState({
        workLocation: '',
        department: '',
        designation: '', // State key is correct
        status: ''
    });


    // Update temporary filters when the popup opens or initial filters change
    useEffect(() => {
        if (isOpen) {
            setTempFilters({
                workLocation: initialFilters?.workLocation || '',
                department: initialFilters?.department || '',
                designation: initialFilters?.designation || '', // Initial filter key is correct
                status: initialFilters?.status || ''
            });
        }
    }, [isOpen, initialFilters]);

    // Handle changes in dropdowns
    const handleChange = (event) => {
        const { name, value } = event.target;
        setTempFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply the temporary filters
    const handleApplyClick = () => {
        onApplyFilters(tempFilters); // Pass the selected filters back
        onClose(); // Close the popup
    };

    // Clear temporary filters and apply immediately
    const handleClearFilters = () => {
        // Ensure designation is cleared correctly
        const clearedFilters = { workLocation: '', department: '', designation: '', status: '' };
        setTempFilters(clearedFilters);
        onApplyFilters(clearedFilters); // Apply cleared filters
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    // --- Defensive check for availableOptions ---
    const locations = availableOptions?.locations || [];
    const departments = availableOptions?.departments || [];
    // *** CORRECTED TYPO HERE ***
    const designations = availableOptions?.designations || [];
    const statuses = availableOptions?.statuses || [];


    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3>Filter by Employee Details</h3>
                {/* Work Location Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="workLocationFilter">Work Location:</label>
                    <select
                        id="workLocationFilter"
                        name="workLocation"
                        value={tempFilters.workLocation}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                        <option value="">All Locations</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                {/* Department Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="departmentFilter">Department:</label>
                    <select
                        id="departmentFilter"
                        name="department"
                        value={tempFilters.department}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                        <option value="">All Departments</option>
                        {departments.map(dep => (
                            <option key={dep} value={dep}>{dep}</option>
                        ))}
                    </select>
                </div>

                {/* Designation Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="designationFilter">Designation:</label>
                    <select
                        id="designationFilter"
                        name="designation" // HTML name attribute is correct
                        value={tempFilters.designation}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                        <option value="">All Designations</option>
                        {/* *** Ensure mapping over the CORRECTED variable *** */}
                        {designations.map(des => (
                            <option key={des} value={des}>{des}</option>
                        ))}
                    </select>
                </div>

                {/* Status Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="statusFilter">Status:</label>
                    <select
                        id="statusFilter"
                        name="status"
                        value={tempFilters.status}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                       
                        {statuses.map(stat => (
                            <option key={stat} value={stat}>{stat}</option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                    <button className={styles.clearButton} onClick={handleClearFilters}>
                        Clear Filters
                    </button>
                    <div> {/* Group apply/cancel together */}
                        <button className={styles.cancelButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button className={styles.applyButton} onClick={handleApplyClick}>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterPopup;