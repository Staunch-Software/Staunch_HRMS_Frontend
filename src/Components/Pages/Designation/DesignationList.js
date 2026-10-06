import React, {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
  } from "react";
  import { useNavigate } from "react-router-dom";
  import { useDepartments } from '../../../Contexts/DepartmentContext';
  import { useEmployees } from '../../../Contexts/EmployeeContext';
  import styles from "./DesignationList.module.css";
  import { IoFilterSharp, IoAdd, IoTrash } from "react-icons/io5";
  import DesignationActionPopup from "./DesignationActionPopup";
  import DesignationFilterPopup from "./DesignationFilterPopup";

  const DesignationList = () => {
    const { departments, designations, updateDesignationStatus, deleteDesignation } = useDepartments();
    const { employees } = useEmployees();
    const navigate = useNavigate();

    const [activeFilters, setActiveFilters] = useState({ departmentId: "", name: "", status: "" });
    const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
    const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
    const [currentDesignation, setCurrentDesignation] = useState(null);
    const [selectedDesIds, setSelectedDesIds] = useState([]);
    const selectAllCheckboxRef = useRef(null);

    const filteredDesignationsWithDetails = useMemo(() => {
      const filterDeptId = activeFilters.departmentId;
      const filterName = activeFilters.name;
      const statusValue = activeFilters.status;
      const employeeList = Array.isArray(employees) ? employees : [];

      const departmentMap = new Map(
        (departments || []).map((dept) => [dept.id, dept])
      );

      return (designations || [])
        .map((des) => {
          const department = departmentMap.get(des.departmentId);
          const expectedDeptCode = department ? department.code : null;
          const expectedDesName = des.name;

          const count = employeeList.filter(
            (emp) => {
              const matchesDeptCode = emp.departmentCode?.toUpperCase() === expectedDeptCode?.toUpperCase();
              const matchesDesName = emp.designation?.toLowerCase() === expectedDesName?.toLowerCase();
              return matchesDeptCode && matchesDesName;
            }
          ).length;

          return {
            ...des,
            employeeCount: count,
            departmentName: department
              ? `${department.name} (${department.code})`
              : "Unknown Dept.",
          };
        })
        .filter((des) => {
          const statusMatch = !statusValue || des.status === statusValue;
          const nameMatch = !filterName || des.name.toLowerCase().includes(filterName.toLowerCase());
          const departmentMatch = !filterDeptId || des.departmentId === filterDeptId;
          return statusMatch && nameMatch && departmentMatch;
        })
        .sort(
          (a, b) =>
            a.departmentName.localeCompare(b.departmentName) ||
            a.name.localeCompare(b.name)
        );
    }, [designations, departments, employees, activeFilters]);

    useEffect(() => {
      setSelectedDesIds([]);
      if (selectAllCheckboxRef.current) {
          selectAllCheckboxRef.current.checked = false;
          selectAllCheckboxRef.current.indeterminate = false;
      }
    }, [activeFilters, filteredDesignationsWithDetails]);

    const handleAddDesignationClick = () => navigate("/app/designation/add");

    const handleOpenFilterPopup = () => setIsFilterPopupOpen(true);

    const handleOpenActionPopup = (designation) => {
      setCurrentDesignation(designation);
      setIsActionPopupOpen(true);
    };

    const handleClosePopups = () => {
      setIsFilterPopupOpen(false);
      setIsActionPopupOpen(false);
      setCurrentDesignation(null);
    };

    const handleApplyFilters = useCallback((newFilters) => {
      setActiveFilters(newFilters);
    }, []);

    const handleSaveStatusAction = useCallback(
      (desId, newStatus) => {
        updateDesignationStatus(desId, newStatus);
      },
      [updateDesignationStatus]
    );

    const handleDeleteAction = useCallback(
      (desId) => {
        const designationToDelete = designations.find(d => d.id === desId);
        if (!designationToDelete) {
            console.error(`Designation with ID ${desId} not found.`);
            return;
        }

        const deptForDesignation = departments.find(d => d.id === designationToDelete.departmentId);
        const expectedDesName = designationToDelete.name;
        const expectedDeptCode = deptForDesignation?.code;

        const employeesInDes = (employees || []).filter(
          (e) =>
            e.designation?.toLowerCase() === expectedDesName?.toLowerCase() &&
            e.departmentCode?.toUpperCase() === expectedDeptCode?.toUpperCase()
        ).length;

        if (employeesInDes > 0) {
          alert(
            `Cannot delete designation "${expectedDesName}". It currently has ${employeesInDes} employee(s) assigned.`
          );
          return;
        }

        if (typeof deleteDesignation === 'function') {
          deleteDesignation(desId)
            .then(() => console.log(`Designation ${desId} deletion initiated.`))
            .catch((err) =>
              console.error(`Failed to delete designation ${desId}:`, err)
            );
        } else {
          console.warn("deleteDesignation function not provided by context.");
          alert(`Deletion for Designation ID ${desId} not implemented.`);
        }
      },
      [deleteDesignation, employees, designations, departments]
    );

    const handleSelectAllChange = (event) => {
      if (event.target.checked) {
        const allFilteredIds = filteredDesignationsWithDetails.map((des) => des.id);
        setSelectedDesIds(allFilteredIds);
      } else {
        setSelectedDesIds([]);
      }
    };

    const handleRowCheckboxChange = (event, desId) => {
      setSelectedDesIds((prev) =>
        event.target.checked
          ? [...prev, desId]
          : prev.filter((id) => id !== desId)
      );
    };

    const isAllFilteredSelected =
      filteredDesignationsWithDetails.length > 0 &&
      selectedDesIds.length === filteredDesignationsWithDetails.length;
    const isIndeterminate =
      selectedDesIds.length > 0 &&
      selectedDesIds.length < filteredDesignationsWithDetails.length;

    useEffect(() => {
      if (selectAllCheckboxRef.current) {
        selectAllCheckboxRef.current.indeterminate = isIndeterminate;
        selectAllCheckboxRef.current.checked = isAllFilteredSelected;
      }
    }, [
      isIndeterminate,
      isAllFilteredSelected,
      filteredDesignationsWithDetails,
    ]);

    const renderCellContent = useCallback(
      (designation, columnKey) => {
        const value = designation[columnKey];
        switch (columnKey) {
          case "status":
            const statusClass = (value || "unknown").toLowerCase();
            return (
              <span className={`${styles.statusIndicator} ${styles[statusClass]}`}>
                {value || "N/A"}
              </span>
            );
          case "action":
            return (
              <button
                className={styles.actionLink}
                onClick={() => handleOpenActionPopup(designation)}
                aria-label={`Actions for ${designation.name}`}
              >
                Action
              </button>
            );
          case "departmentName":
            return value ?? "N/A";
          case "name":
            return value ?? "N/A";
          case "employeeCount":
            return value ?? 0;
          default:
            return value || "N/A";
        }
      },
      [handleOpenActionPopup]
    );

    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Designation List</h1>
          <div className={styles.controlsContainer}>
             {selectedDesIds.length > 0 && (
                <button
                  className={`${styles.iconButton} ${styles.deleteButton}`}
                  // onClick={handleBulkDelete}
                  aria-label={`Delete ${selectedDesIds.length} selected designations`}
                  title={`Delete ${selectedDesIds.length} selected designations`}
                  disabled
                >
                  <IoTrash />
                </button>
             )}
            <button
              className={`${styles.iconButton} ${styles.filterButton}`}
              onClick={handleOpenFilterPopup}
              aria-label="Filter Designations"
              title="Filter Designations"
            >
              <IoFilterSharp />
            </button>
            <button
              className={styles.addButton}
              onClick={handleAddDesignationClick}
            >
              <IoAdd /> Add Designation
            </button>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.designationTable || styles.departmentTable}>
          <div className={`${styles.tableRow} ${styles.tableHeader}`}>
            <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
              <input
                type="checkbox"
                ref={selectAllCheckboxRef}
                className={styles.checkbox}
                checked={isAllFilteredSelected}
                onChange={handleSelectAllChange}
                disabled={filteredDesignationsWithDetails.length === 0}
                aria-label="Select all designations"
              />
            </div>
            <div className={styles.tableCell}>Department</div>
            <div className={styles.tableCell}>Designation Name</div>
            <div className={`${styles.tableCell} ${styles.countCell}`}>
              Employees
            </div>
            <div className={styles.tableCell}>Status</div>
            <div className={styles.tableCell}>Action</div>
          </div>

          {filteredDesignationsWithDetails.length === 0 ? (
            <div className={`${styles.tableRow} ${styles.emptyRow}`}>
              <p className={styles.noItemsMessage}>
                {activeFilters.departmentId ||
                activeFilters.name ||
                activeFilters.status
                  ? "No designations match your filters."
                  : "No designations have been added yet."}
              </p>
            </div>
          ) : (
            filteredDesignationsWithDetails.map((des) => (
              <div
                key={des.id}
                className={`${styles.tableRow} ${
                  selectedDesIds.includes(des.id) ? styles.selectedRow : ""
                }`}
              >
                <div className={`${styles.tableCell} ${styles.checkboxCell}`}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectedDesIds.includes(des.id)}
                    onChange={(e) => handleRowCheckboxChange(e, des.id)}
                    aria-label={`Select designation ${des.name}`}
                  />
                </div>
                <div className={styles.tableCell} data-label="Department">
                  {renderCellContent(des, "departmentName")}
                </div>
                <div className={styles.tableCell} data-label="Designation Name">
                  {renderCellContent(des, "name")}
                </div>
                <div
                  className={`${styles.tableCell} ${styles.countCell}`}
                  data-label="Employees"
                >
                  {renderCellContent(des, "employeeCount")}
                </div>
                <div className={styles.tableCell} data-label="Status">
                  {renderCellContent(des, "status")}
                </div>
                <div className={styles.tableCell} data-label="Action">
                  {renderCellContent(des, "action")}
                </div>
              </div>
            ))
          )}
        </div>

        <DesignationFilterPopup
          isOpen={isFilterPopupOpen}
          onClose={handleClosePopups}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
          departments={departments}
          designations={designations}
        />
        <DesignationActionPopup
          isOpen={isActionPopupOpen}
          onClose={handleClosePopups}
          designation={currentDesignation}
          onSaveStatus={handleSaveStatusAction}
          onDelete={handleDeleteAction}
        />
      </div>
    );
  };

  export default DesignationList;