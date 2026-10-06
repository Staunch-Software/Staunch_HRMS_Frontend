import React, { useState, useEffect, useMemo } from "react";
import styles from "./FilterPopup.module.css"; // Reuse FilterPopup styles

// Define status options locally
const statusOptions = [
  { value: "", label: "Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const DesignationFilterPopup = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
  departments = [], // Receive departments for department filter
  designations = [], // Receive all designations for name filter
}) => {
  const [tempFilters, setTempFilters] = useState({
    departmentId: "",
    name: "",
    status: "",
  });

  // --- Derive unique options for dropdowns ---
  const departmentFilterOptions = useMemo(() => {
    const options = departments.map((dept) => ({
      value: dept.id,
      label: `${dept.name} (${dept.code})`,
    }));
    return [
      { value: "", label: "All Departments" },
      ...options.sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [departments]);

  const designationNameOptions = useMemo(() => {
    const names = new Set(designations.map((des) => des.name));
    const options = Array.from(names).map((name) => ({
      value: name,
      label: name,
    }));
    return [
      { value: "", label: "All Designations" },
      ...options.sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [designations]);

  // Update temporary filters when the popup opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters({
        departmentId: initialFilters?.departmentId || "",
        name: initialFilters?.name || "",
        status: initialFilters?.status || "",
      });
    }
  }, [isOpen, initialFilters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyClick = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = { departmentId: "", name: "", status: "" };
    setTempFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <h3>Filter Designations</h3>

        {/* Department Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="deptFilter">Department:</label>
          <select
            id="deptFilter"
            name="departmentId" // Matches state key
            value={tempFilters.departmentId}
            onChange={handleChange}
            className={styles.selectDropdown}
          >
            {departmentFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Designation Name Dropdown */}
        <div className={styles.filterGroup}>
          <label htmlFor="desNameFilter">Designation Name:</label>
          <select
            id="desNameFilter"
            name="name" // Matches state key
            value={tempFilters.name}
            onChange={handleChange}
            className={styles.selectDropdown}
          >
            {designationNameOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
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
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
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
              {" "}
              Cancel{" "}
            </button>
            <button className={styles.applyButton} onClick={handleApplyClick}>
              {" "}
              Apply Filters{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignationFilterPopup;
