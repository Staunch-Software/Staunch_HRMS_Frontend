import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartments } from '../../../Contexts/DepartmentContext';
import { useEmployees } from '../../../Contexts/EmployeeContext';
import styles from './DepartmentList.module.css';
import { IoFilterSharp, IoAdd, IoTrash } from "react-icons/io5";

import DepartmentActionPopup from './DepartmentActionPopup';
import DepartmentFilterPopup from './DepartmentFilterPopup';

const DepartmentList = () => {
    const { departments, updateDepartmentStatus, deleteDepartment } = useDepartments();
    const { employees } = useEmployees();
    const navigate = useNavigate();

    const [activeFilters, setActiveFilters] = useState({ name: '', code: '', status: '' });
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState(null);
    const [selectedDeptIds, setSelectedDeptIds] = useState([]);
    const selectAllCheckboxRef = useRef(null);

    const filteredDepartments = useMemo(() => {
        const filterName = activeFilters.name;
        const filterCode = activeFilters.code;
        const statusValue = activeFilters.status;

        const employeeList = Array.isArray(employees) ? employees : [];

        return (departments || [])
            .map(dept => {
                const deptCode = dept.code;
                if (!deptCode) {
                    console.warn(`Department ${dept.id} has no code.`);
                }
                const count = employeeList.filter(
                    emp => emp.departmentCode?.toUpperCase() === deptCode?.toUpperCase()
                ).length;

                return { ...dept, employeeCount: count };
            })
            .filter(dept => {
                const statusMatch = !statusValue || dept.status === statusValue;
                const nameMatch = !filterName || dept.name === filterName;
                const codeMatch = !filterCode || dept.code === filterCode;
                return statusMatch && nameMatch && codeMatch;
            })
            .sort((a, b) => a.name.localeCompare(b.name));

    }, [departments, employees, activeFilters]);

    useEffect(() => {
        setSelectedDeptIds([]);
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.checked = false;
            selectAllCheckboxRef.current.indeterminate = false;
        }
    }, [activeFilters, filteredDepartments]);

    const handleAddDepartmentClick = () => navigate('/app/department/add');

    const handleOpenFilterPopup = () => setIsFilterPopupOpen(true);
    const handleOpenActionPopup = (department) => {
        setCurrentDepartment(department);
        setIsActionPopupOpen(true);
    };
    const handleClosePopups = () => {
        setIsFilterPopupOpen(false);
        setIsActionPopupOpen(false);
        setCurrentDepartment(null);
    };

    const handleApplyFilters = useCallback((newFilters) => {
        setActiveFilters(newFilters);
    }, []);

    const handleSaveStatusAction = useCallback((deptId, newStatus) => {
        updateDepartmentStatus(deptId, newStatus);
    }, [updateDepartmentStatus]);

    const handleDeleteAction = useCallback((deptId) => {
        const departmentToDelete = departments.find(d => d.id === deptId);
        if (departmentToDelete) {
            const deptCode = departmentToDelete.code;
            const employeesInDept = (employees || []).filter(
                e => e.departmentCode?.toUpperCase() === deptCode?.toUpperCase()
            ).length;

            if (employeesInDept > 0) {
                alert(
                    `Cannot delete department "${departmentToDelete.name}". It currently has ${employeesInDept} employee(s) assigned (matched by code).`
                );
                return;
            }
        } else {
             console.warn(`Department with ID ${deptId} not found for pre-delete check.`);
        }

        if (typeof deleteDepartment === 'function') {
             deleteDepartment(deptId)
                 .then(() => console.log(`Department ${deptId} deletion initiated.`))
                 .catch(err => {
                    console.error(`Failed to delete department ${deptId}:`, err);
                 });
        } else {
            console.warn("deleteDepartment function not provided by context.");
            alert(`Deletion for Department ID ${deptId} not implemented.`);
        }
    }, [deleteDepartment, employees, departments]);


    const handleSelectAllChange = (event) => {
        if (event.target.checked) {
            const allFilteredIds = filteredDepartments.map(dept => dept.id);
            setSelectedDeptIds(allFilteredIds);
        } else {
            setSelectedDeptIds([]);
        }
    };

    const handleRowCheckboxChange = (event, deptId) => {
        setSelectedDeptIds(prev =>
            event.target.checked ? [...prev, deptId] : prev.filter(id => id !== deptId)
        );
    };

    const isAllFilteredSelected = filteredDepartments.length > 0 && selectedDeptIds.length === filteredDepartments.length;
    const isIndeterminate = selectedDeptIds.length > 0 && selectedDeptIds.length < filteredDepartments.length;

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = isIndeterminate;
            selectAllCheckboxRef.current.checked = isAllFilteredSelected;
        }
    }, [isIndeterminate, isAllFilteredSelected]);


    const renderCellContent = useCallback((department, columnKey) => {
        const value = department[columnKey];
        switch (columnKey) {
            case 'status':
                const statusClass = (value || 'unknown').toLowerCase();
                return <span className={`${styles.statusIndicator} ${styles[statusClass]}`}>{value || 'N/A'}</span>;
            case 'action':
                return (
                    <button
                        className={styles.actionLink}
                        onClick={() => handleOpenActionPopup(department)}
                        aria-label={`Actions for ${department.name}`}
                    >
                        Action
                    </button>
                );
            case 'description':
                const displayDesc = value && value.length > 50 ? `${value.substring(0, 50)}...` : value;
                return <span title={value || 'No Description'}>{displayDesc || 'N/A'}</span>;
            case 'employeeCount':
                 return value ?? 0;
            default:
                return value || 'N/A';
        }
    }, [handleOpenActionPopup]);


    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <h1 className={styles.title}>Department List</h1>
                 <div className={styles.controlsContainer}>
                    {selectedDeptIds.length > 0 && (
                        <button
                            className={`${styles.iconButton} ${styles.deleteButton}`}
                            // onClick={handleBulkDelete}
                            aria-label={`Delete ${selectedDeptIds.length} selected departments`}
                            title={`Delete ${selectedDeptIds.length} selected departments`}
                            disabled
                        >
                            <IoTrash />
                        </button>
                    )}
                    <button
                        className={`${styles.iconButton} ${styles.filterButton}`}
                        onClick={handleOpenFilterPopup}
                        aria-label="Filter Departments"
                        title="Filter Departments"
                    > <IoFilterSharp /> </button>
                    <button className={styles.addButton} onClick={handleAddDepartmentClick}>
                       <IoAdd /> Add Department
                    </button>
                 </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.departmentTable}>
                <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                    <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
                         <input
                             type="checkbox"
                             ref={selectAllCheckboxRef}
                             className={styles.checkbox}
                             checked={isAllFilteredSelected}
                             onChange={handleSelectAllChange}
                             disabled={filteredDepartments.length === 0}
                             aria-label="Select all departments"
                         />
                    </div>
                    <div className={styles.tableCell}>Name</div>
                    <div className={styles.tableCell}>Code</div>
                    <div className={`${styles.tableCell} ${styles.descriptionCell}`}>Description</div>
                    <div className={`${styles.tableCell} ${styles.countCell}`}>Employees</div>
                    <div className={styles.tableCell}>Status</div>
                    <div className={styles.tableCell}>Action</div>
                </div>

                {filteredDepartments.length === 0 ? (
                     <div className={`${styles.tableRow} ${styles.emptyRow}`}>
                         <p className={styles.noItemsMessage}>
                              {activeFilters.name || activeFilters.code || activeFilters.status ? "No departments match filters." : "No departments have been added yet."}
                         </p>
                     </div>
                ) : (
                    filteredDepartments.map((dept) => (
                        <div key={dept.id} className={`${styles.tableRow} ${selectedDeptIds.includes(dept.id) ? styles.selectedRow : ''}`}>
                             <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
                                 <input
                                     type="checkbox"
                                     className={styles.checkbox}
                                     checked={selectedDeptIds.includes(dept.id)}
                                     onChange={(e) => handleRowCheckboxChange(e, dept.id)}
                                     aria-label={`Select department ${dept.name}`}
                                 />
                             </div>
                            <div className={styles.tableCell} data-label="Name">{renderCellContent(dept, 'name')}</div>
                            <div className={styles.tableCell} data-label="Code">{renderCellContent(dept, 'code')}</div>
                            <div className={`${styles.tableCell} ${styles.descriptionCell}`} data-label="Description">{renderCellContent(dept, 'description')}</div>
                            <div className={`${styles.tableCell} ${styles.countCell}`} data-label="Employees">{renderCellContent(dept, 'employeeCount')}</div>
                            <div className={styles.tableCell} data-label="Status">{renderCellContent(dept, 'status')}</div>
                            <div className={styles.tableCell} data-label="Action">{renderCellContent(dept, 'action')}</div>
                        </div>
                    ))
                )}
            </div>

            <DepartmentFilterPopup
                isOpen={isFilterPopupOpen}
                onClose={handleClosePopups}
                onApplyFilters={handleApplyFilters}
                initialFilters={activeFilters}
                departments={departments}
            />
            <DepartmentActionPopup
                isOpen={isActionPopupOpen}
                onClose={handleClosePopups}
                department={currentDepartment}
                onSaveStatus={handleSaveStatusAction}
                onDelete={handleDeleteAction}
            />
        </div>
    );
};

export default DepartmentList;