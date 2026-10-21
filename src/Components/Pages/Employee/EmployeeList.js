import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../../Contexts/EmployeeContext";
import styles from "./EmployeeList.module.css";
import { IoFilterSharp } from "react-icons/io5";
import { BsListColumnsReverse } from "react-icons/bs";
import defaultAvatar from "../../../Images/ProfilePhoto.png";
import EmployeeActionPopup from "./ActionPopup";
import ColumnsPopup from "./ColumnsPopup";
import FilterPopup from "./FilterPopup";
import SalaryStructureAssignment from "./SalaryStructureAssignment";

// ... (ALL_POSSIBLE_COLUMNS definition remains the same)

const ALL_POSSIBLE_COLUMNS = [
  { key: "dateOfJoining", label: "Date of Joining" },
  { key: "workEmail", label: "Work Email" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "gender", label: "Gender" },
  { key: "workLocation", label: "Work Location" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" }, // Assuming 'department' stores the name/code used for display
  { key: "basicSalary", label: "Basic Salary" },
  { key: "personalEmail", label: "Personal Email" },
  { key: "bankName", label: "Bank Name" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
].reduce((map, obj) => {
  map[obj.key] = obj.label;
  return map;
}, {});


const EmployeeList = () => {
  const { employees, updateEmployeeStatus, deleteEmployee } = useEmployees();
  const navigate = useNavigate();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set());
  const selectAllCheckboxRef = useRef(null);

  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [isColumnsPopupOpen, setIsColumnsPopupOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryStructureEmployee, setSalaryStructureEmployee] = useState(null);

  const [selectedColumns, setSelectedColumns] = useState([
    "workEmail",
    "department", // Keep this if employee data has 'department' field
    "status",
    "action",
  ]);

  const [activeFilters, setActiveFilters] = useState({
    workLocation: "",
    department: "", // Assuming filter uses the same field as display ('department')
    designation: "",
    status: "",
  });

  const totalEmployeeCount = useMemo(() => (employees || []).length, [employees]);

  const filteredEmployees = useMemo(() => {
    let result = employees || [];
    const employeeList = Array.isArray(employees) ? employees : [];

    // Ensure filter checks against the correct field name (e.g., 'department' or 'departmentCode')
    if (activeFilters.workLocation) {
      result = employeeList.filter(
        (emp) => emp.workLocation === activeFilters.workLocation
      );
    }
    if (activeFilters.department) {
      // Adjust field if needed: e.g., emp.departmentCode === activeFilters.department
      result = result.filter(
        (emp) => emp.department === activeFilters.department
      );
    }
    if (activeFilters.designation) {
      result = result.filter(
        (emp) => emp.designation === activeFilters.designation
      );
    }
    if (activeFilters.status) {
      result = result.filter((emp) => emp.status === activeFilters.status);
    }
    return result;
  }, [employees, activeFilters]);


  const availableFilterOptions = useMemo(() => {
    const locations = new Set();
    const departments = new Set(); // Adjust field if needed (e.g., departmentCode)
    const designations = new Set();
    const statuses = new Set();
    (employees || []).forEach((emp) => {
      if (emp.workLocation) locations.add(emp.workLocation);
      if (emp.department) departments.add(emp.department); // Adjust if needed (e.g., emp.departmentCode)
      if (emp.designation) designations.add(emp.designation);
      if (emp.status) statuses.add(emp.status);
    });
    return {
      locations: Array.from(locations).sort(),
      departments: Array.from(departments).sort(),
      designations: Array.from(designations).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [employees]);


  useEffect(() => {
    setSelectedEmployeeIds(new Set());
     if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.checked = false;
            selectAllCheckboxRef.current.indeterminate = false;
        }
  }, [activeFilters, filteredEmployees]);


  const handleAddEmployeeClick = () => navigate("/app/employee/add");
  const formatName = (emp) =>
    `${emp.firstName || ""}${emp.middleName ? " " + emp.middleName : ""} ${
      emp.lastName || ""
    }`.trim();


  const handleCheckboxChange = (uniqueId) => {
    setSelectedEmployeeIds((prev) => {
      const newSelectedIds = new Set(prev);
      if (newSelectedIds.has(uniqueId)) newSelectedIds.delete(uniqueId);
      else newSelectedIds.add(uniqueId);
      return newSelectedIds;
    });
  };

  const handleSelectAllChange = (event) => {
    if (event.target.checked) {
      const filteredIds = filteredEmployees
        .map((emp) => emp.id || emp.employeeId)
        .filter((id) => id != null);
      setSelectedEmployeeIds(new Set(filteredIds));
    } else {
      setSelectedEmployeeIds(new Set());
    }
  };


  const isAllSelected =
    filteredEmployees.length > 0 &&
    selectedEmployeeIds.size === filteredEmployees.length;
  const isIndeterminate =
    selectedEmployeeIds.size > 0 &&
    selectedEmployeeIds.size < filteredEmployees.length;


  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
      selectAllCheckboxRef.current.checked = isAllSelected;
    }
  }, [isIndeterminate, isAllSelected, filteredEmployees.length]);


  const handleOpenActionPopup = (employee) => {
    setEditingEmployee(employee);
    setIsActionPopupOpen(true);
  };
  const handleCloseActionPopup = () => {
    setIsActionPopupOpen(false);
    setEditingEmployee(null);
  };
  const handleSaveStatus = (employeeId, newStatus) => {
    if (typeof updateEmployeeStatus === "function") {
        updateEmployeeStatus(employeeId, newStatus);
    } else { console.error("updateEmployeeStatus context function missing"); }
    handleCloseActionPopup();
  };

  const handleDeleteEmployee = useCallback((employeeIdToDelete) => {
    if (typeof deleteEmployee === 'function') {
        deleteEmployee(employeeIdToDelete)
            .then(() => console.log(`Employee ${employeeIdToDelete} deletion initiated.`))
            .catch(err => console.error(`Failed to delete employee ${employeeIdToDelete}:`, err));
        // Optionally close popup here if not handled inside the popup
        // handleCloseActionPopup();
    } else {
        console.error("deleteEmployee function not provided by context.");
        alert(`Deletion for Employee ID ${employeeIdToDelete} not implemented.`);
    }
  }, [deleteEmployee]);


  const handleColumnsIconClick = () => setIsColumnsPopupOpen(true);
  const handleCloseColumnsPopup = () => setIsColumnsPopupOpen(false);
  const handleSaveColumns = (newSelectedColumnKeys) => {
    setSelectedColumns(newSelectedColumnKeys);
    setIsColumnsPopupOpen(false);
  };


  const handleFilterIconClick = () => setIsFilterPopupOpen(true);
  const handleCloseFilterPopup = () => setIsFilterPopupOpen(false);
  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
  };


  const renderCellContent = (employee, columnKey) => {
    const value = employee[columnKey];
    switch (columnKey) {
      case "status":
        return (
          <span className={`${styles.statusIndicator} ${styles[value?.toLowerCase() || "unknown"]}`}>
            {value || "N/A"}
          </span>
        );
      case "action":
        return (
          <>
            <button className={styles.actionLink} onClick={() => handleOpenActionPopup(employee)} aria-label={`Actions for ${formatName(employee)}`}>
              Action
            </button>
            <button
              className={styles.actionLink}
              onClick={() => navigate(`/app/employee/edit/${employee.id}`)}
              aria-label={`Edit ${formatName(employee)}`}
              title="Edit employee details"
              style={{ marginLeft: 8 }}
            >
              Edit
            </button>
            <button
              className={styles.actionLink}
              onClick={() => setSalaryStructureEmployee(employee)}
              aria-label={`Salary structure for ${formatName(employee)}`}
              title="Assign salary components"
              style={{ marginLeft: 8 }}
            >
              Salary Structure
            </button>
          </>
        );
      case "dateOfJoining":
        try { return value ? new Date(value).toLocaleDateString() : "N/A"; }
        catch (error) { return "Invalid Date"; }
      case "basicSalary":
        const numSalary = parseFloat(value);
        return typeof numSalary === "number" && !isNaN(numSalary) ? `$${numSalary.toFixed(2)}` : value || "N/A"; // Adjust currency symbol/formatting as needed
      default:
        return value || "N/A";
    }
  };


  return (
    <div className={styles.container}>
      {/* == HEADER SECTION MODIFIED == */}
      <div className={styles.headerContainer}>
        <div className={styles.titleContainer}> {/* Optional: Wrapper for title and count */}
            <h1 className={styles.title}>Employee List</h1>
            <span className={styles.totalCount}>({totalEmployeeCount})</span>
        </div>
        <div className={styles.controlsContainer}>
          <button className={`${styles.iconButton} ${styles.filterButton}`} onClick={handleFilterIconClick} aria-label="Filter Employees" title="Filter Employees"> <IoFilterSharp /> </button>
          <button className={`${styles.iconButton} ${styles.columnsButton}`} onClick={handleColumnsIconClick} aria-label="Manage Columns" title="Manage Columns"> <BsListColumnsReverse /> </button>
          <button className={styles.addButton} onClick={handleAddEmployeeClick}> Add Employee </button>
        </div>
      </div>


      <div className={styles.employeeTable}>
        <div className={`${styles.tableRow} ${styles.tableHeader}`}>
          <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
            <input ref={selectAllCheckboxRef} type="checkbox" aria-label="Select all employees" onChange={handleSelectAllChange} disabled={filteredEmployees.length === 0}/>
          </div>
          <div className={`${styles.tableCell} ${styles.employeeInfoColumnHeader}`}> Employee </div>
          {selectedColumns.map((columnKey) => ( <div key={columnKey} className={styles.tableCell}> {ALL_POSSIBLE_COLUMNS[columnKey] || columnKey} </div> ))}
        </div>

        {filteredEmployees.length === 0 ? (
           <div className={`${styles.tableRow} ${styles.emptyRow}`}> {/* Wrap message in a row for consistent styling */}
                <p className={styles.noEmployeesMessage}>
                    {activeFilters.workLocation || activeFilters.department || activeFilters.designation || activeFilters.status
                        ? "No employees match the current filters."
                        : (employees || []).length > 0 ? "No employees found." : "No employees have been added yet."}
                </p>
           </div>
         ) : (
          filteredEmployees.map((employee) => {
            const uniqueId = employee.id || employee.employeeId;
            if (uniqueId == null) {
                console.warn("Employee missing unique identifier (id or employeeId):", employee);
                return null;
            }
            const isSelected = selectedEmployeeIds.has(uniqueId);
            return (
              <div key={uniqueId} className={`${styles.tableRow} ${isSelected ? styles.selectedRow : ''}`}> {/* Added selectedRow class */}
                <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
                  <input type="checkbox" aria-label={`Select employee ${formatName(employee)}`} checked={isSelected} onChange={() => handleCheckboxChange(uniqueId)}/>
                </div>
                <div className={`${styles.tableCell} ${styles.employeeInfoCell}`}>
                  <img src={employee.profilePictureUrl || defaultAvatar} alt={`Profile of ${formatName(employee)}`} className={styles.employeeImage} onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}/>
                  <div className={styles.employeeNameIdBlock}>
                    <span className={styles.employeeName}> {formatName(employee)} </span>
                    <span className={styles.employeeId}> (ID: {employee.employeeId || uniqueId || "N/A"}) </span>
                  </div>
                </div>
                {selectedColumns.map((columnKey) => (
                    <div key={columnKey} className={styles.tableCell} data-label={ALL_POSSIBLE_COLUMNS[columnKey] || columnKey}> {/* Added data-label for responsiveness */}
                        {renderCellContent(employee, columnKey)}
                    </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <EmployeeActionPopup
        employee={editingEmployee}
        isOpen={isActionPopupOpen}
        onClose={handleCloseActionPopup}
        onSaveStatus={handleSaveStatus}
        onDelete={handleDeleteEmployee}
      />
      <ColumnsPopup
        isOpen={isColumnsPopupOpen}
        onClose={handleCloseColumnsPopup}
        onSave={handleSaveColumns}
        currentSelectedColumns={selectedColumns}
        allPossibleColumns={ALL_POSSIBLE_COLUMNS}
      />
      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={handleCloseFilterPopup}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
        availableOptions={availableFilterOptions}
      />
      <SalaryStructureAssignment
        employee={salaryStructureEmployee}
        isOpen={!!salaryStructureEmployee}
        onClose={() => setSalaryStructureEmployee(null)}
      />
    </div>
  );
};

export default EmployeeList;