// src/Components/Pages/Department/DepartmentFilterPopup.js
import React, { useState, useEffect, useMemo } from 'react';
import styles from './FilterPopup.module.css'; // Reuse or create specific styles

// Define status options locally
const statusOptions = [
    { value: '', label: 'Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
];

const DepartmentFilterPopup = ({
    isOpen,
    onClose,
    onApplyFilters,
    initialFilters,
    departments = [] // <<< Receive the full departments list as a prop
}) => {
    const [tempFilters, setTempFilters] = useState({ name: '', code: '', status: '' });

    // --- Derive unique options for dropdowns ---
    const uniqueNames = useMemo(() => {
        const names = new Set(departments.map(dept => dept.name));
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [departments]);

    const uniqueCodes = useMemo(() => {
        const codes = new Set(departments.map(dept => dept.code));
        return Array.from(codes).sort((a, b) => a.localeCompare(b));
    }, [departments]);

    // Update temporary filters when the popup opens or initial filters change
    useEffect(() => {
        if (isOpen) {
            setTempFilters({
                name: initialFilters?.name || '',
                code: initialFilters?.code || '',
                status: initialFilters?.status || ''
            });
        }
    }, [isOpen, initialFilters]);

    // Handle changes in inputs/dropdowns
    const handleChange = (event) => {
        const { name, value } = event.target;
        setTempFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply the temporary filters
    const handleApplyClick = () => {
        onApplyFilters(tempFilters);
        onClose();
    };

    // Clear temporary filters and apply
    const handleClearFilters = () => {
        const clearedFilters = { name: '', code: '', status: '' };
        setTempFilters(clearedFilters);
        onApplyFilters(clearedFilters);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <h3>Filter Departments</h3>

                {/* Department Name Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="departmentNameFilter">Department Name:</label>
                    <select
                        id="departmentNameFilter"
                        name="name" // Matches state key
                        value={tempFilters.name}
                        onChange={handleChange}
                        className={styles.selectDropdown} // Use appropriate select style
                    >
                        <option value="">All Departments</option>
                        {uniqueNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                {/* Department Code Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="departmentCodeFilter">Department Code:</label>
                    <select
                        id="departmentCodeFilter"
                        name="code" // Matches state key
                        value={tempFilters.code}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                         <option value="">All Codes</option>
                         {uniqueCodes.map(code => (
                            <option key={code} value={code}>{code}</option>
                        ))}
                    </select>
                </div>

                {/* Status Dropdown */}
                <div className={styles.filterGroup}>
                    <label htmlFor="statusFilter">Status:</label>
                    <select
                        id="statusFilter"
                        name="status" // Matches state key
                        value={tempFilters.status}
                        onChange={handleChange}
                        className={styles.selectDropdown}
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Action Buttons */}
                <div className={styles.buttonGroup}>
                    <button className={styles.clearButton} onClick={handleClearFilters}>
                        Clear Filters
                    </button>
                    <div>
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

export default DepartmentFilterPopup;