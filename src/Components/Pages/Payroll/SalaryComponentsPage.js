import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Select from "react-select"; // Import react-select
import styles from "./SalaryComponentsPage.module.css";
import {
  payrollApiService,
  formatCalculationMethod,
} from "../../../services/payrollApiService"; // Adjust path
import SalaryComponentForm from "./SalaryComponentForm"; // Adjust path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faToggleOn, // Keep for status toggle
  faToggleOff, // Keep for status toggle
  faFilter,
  faSearch,
  faHandHoldingUsd,
  faFileInvoiceDollar,
  faReceipt,
  // faCaretDown, // Can remove if not using caret in button
} from "@fortawesome/free-solid-svg-icons";

// Options for the filter dropdown
const filterOptions = [
  { value: "All", label: "All Types" },
  { value: "Earning", label: "Earnings" },
  { value: "Deduction", label: "Deductions" },
  { value: "Reimbursement", label: "Reimbursements" },
];

const filterSelectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '30px',
    height: '35px',
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent', 
    cursor: 'pointer',
    minWidth: '130px', 
  }),
  valueContainer: (provided) => ({
      ...provided,
      height: '38px',
      padding: '0 6px',
  }),
  indicatorsContainer: (provided) => ({
      ...provided,
      height: '38px',
  }),
  indicatorSeparator: () => ({ display: 'none' }), // Hide separator
  dropdownIndicator: (provided) => ({
      ...provided,
      padding: '6px',
      color: '#adb5bd', // grey-600
  }),
  option: (provided, state) => ({
    ...provided,
    padding: '8px 12px',
    fontSize: '0.9rem',
    backgroundColor: state.isSelected ? '#0c70fc' : state.isFocused ? '#e9ecef' : '#fff',
    color: state.isSelected ? '#fff' : '#343a40',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
      ...provided,
      marginTop: '2px',
      minWidth: '190px',
  })
};


const SalaryComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [componentTypeToAdd, setComponentTypeToAddState] = useState("Earning");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(filterOptions[0]); // Default to 'All Types' object

  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const addDropdownRef = useRef(null);
  const addButtonContainerRef = useRef(null);

  const existingCodes = useMemo(
    () => components.map((c) => ({ id: c.id, code: c.code })),
    [components]
  );

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await payrollApiService.getSalaryComponents();
      setComponents(data);
    } catch (err) {
      console.error("Failed fetch:", err);
      setError(err.message || "Could not fetch components.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Click outside handler for Add dropdown (Keep as is)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAddDropdownOpen &&
        addDropdownRef.current &&
        !addDropdownRef.current.contains(event.target) &&
        addButtonContainerRef.current &&
        !addButtonContainerRef.current.contains(event.target)
      ) {
        setIsAddDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddDropdownOpen]);

  // Filtered Components (Update filter logic to use filterType.value)
  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      const typeMatch =
        filterType.value === "All" || comp.componentType === filterType.value;
      const searchMatch =
        searchTerm === "" ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.code.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
    });
  }, [components, searchTerm, filterType]);

  // Modal Handlers (Keep as is)
  const handleOpenAddModal = (type) => {
    setCurrentComponent(null);
    setComponentTypeToAddState(type);
    setModalMode("add");
    setIsModalOpen(true);
    setIsAddDropdownOpen(false);
  };

  const handleOpenEditModal = (component) => {
    setCurrentComponent(component);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentComponent(null);
    // Reset potential errors shown in modal if needed (form should handle its own errors now)
  };

  const toggleAddDropdown = () => {
    setIsAddDropdownOpen((prev) => !prev);
  };

  // Save Handler (Keep as is, form handles validation)
  const handleSaveComponent = async (componentData) => {
    // No need to set loading here if Form shows its own indicator, but keep for page feedback
    // setIsLoading(true); // Optional: Keep page loading state during save
    setError(null); // Clear previous page errors
    try {
      if (modalMode === "add") {
        await payrollApiService.addSalaryComponent(componentData);
      } else {
        await payrollApiService.updateSalaryComponent(componentData);
      }
      handleCloseModal();
      await fetchComponents(); // Refetch data on success
    } catch (err) {
      console.error(`Failed to ${modalMode} component:`, err);
       // Let the form display the error, maybe set a general page error as fallback
      setError(`Could not ${modalMode} component. ${err.message || ''}`);
      // setIsLoading(false); // Stop loading indicator on error if set above
    }
  };

  // --- Status Toggle Handler (FIXED) ---
  const handleToggleStatus = async (component) => {
    const updatedComponent = { ...component, status: !component.status };
    // Optionally disable the button briefly or show specific loading
    // For simplicity, using the general page loading state
    setIsLoading(true);
    setError(null);
    try {
      await payrollApiService.updateSalaryComponent(updatedComponent);
      // No need to manually update state, fetchComponents will get the latest
      await fetchComponents();
    } catch (err) {
      console.error("Failed toggle status:", err);
      setError(err.message || "Could not update component status.");
      setIsLoading(false); // Ensure loading stops on error
    }
    // fetchComponents resets loading to false on success
  };

  // Delete Handler (Keep as is)
  const handleDeleteComponent = async (id) => {
    const componentToDelete = components.find((c) => c.id === id);
    if (componentToDelete?.code === "BASIC") { // Example: Prevent deletion of core component
      alert("The 'BASIC' salary component is essential and cannot be deleted.");
      return;
    }
    if (
      window.confirm(`Are you sure you want to delete the component "${componentToDelete?.name || id}"? This action cannot be undone.`)
    ) {
      setIsLoading(true);
      setError(null);
      try {
        await payrollApiService.deleteSalaryComponent(id);
        await fetchComponents(); // Refetch after delete
      } catch (err) {
        console.error("Failed delete:", err);
        setError(err.message || "Could not delete component.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.salaryComponentContainer}>
      <div className={styles.actionBar}>
        <h1 className={styles.title}>Salary Components</h1>
        <div className={styles.actionBarControls}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Name or Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
           {/* Filter Box using React Select */}
          <div className={styles.filterBox}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
             <Select
                options={filterOptions}
                value={filterType}
                onChange={(selectedOption) => setFilterType(selectedOption)}
                styles={filterSelectStyles}
                classNamePrefix="react-select-filter" // Optional prefix
                isSearchable={false} // Not needed for short list
              />
          </div>
          {/* Add Button with Dropdown */}
          <div
            className={styles.addButtonContainer}
            ref={addButtonContainerRef}
          >
            <button
              onClick={toggleAddDropdown}
              className={styles.addButtonMain}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Component
            </button>
            {isAddDropdownOpen && (
              <div className={styles.addDropdown} ref={addDropdownRef}>
                <button
                  onClick={() => handleOpenAddModal("Earning")}
                  className={styles.addDropdownOption}
                >
                  <FontAwesomeIcon icon={faHandHoldingUsd} /> Add Earning
                </button>
                <button
                  onClick={() => handleOpenAddModal("Deduction")}
                  className={styles.addDropdownOption}
                >
                  <FontAwesomeIcon icon={faFileInvoiceDollar} /> Add Deduction
                </button>
                <button
                  onClick={() => handleOpenAddModal("Reimbursement")}
                  className={styles.addDropdownOption}
                >
                  <FontAwesomeIcon icon={faReceipt} /> Add Reimbursement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading and Error Display */}
      {isLoading && <p className={styles.loadingText}>Loading...</p>}
      {error && !isLoading && <p className={styles.errorTextPage}>{error}</p>}

      {/* Table Display */}
      {!isLoading && error === null && ( // Only show table when not loading and no error
        <div className={styles.tableContainer}>
          <table className={styles.componentTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Calculation / Basis</th>
                <th>Taxable</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.length === 0 ? (
                <tr className={styles.noItemsMessage}>
                  <td colSpan="7">
                    {components.length === 0
                      ? "No salary components have been added yet."
                      : "No components match your search or filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredComponents.map((comp) => (
                  <tr key={comp.id}>
                    <td>{comp.name}</td>
                    <td>{comp.code}</td>
                    <td>{comp.componentType}</td>
                    <td>{formatCalculationMethod(comp)}</td>
                    <td>
                      {comp.componentType === "Deduction"
                        ? "N/A" // Deductions aren't taxed, they affect taxable income
                        : comp.isTaxable ?? "N/A"}
                    </td>
                    <td>
                      {/* --- FIXED STATUS TOGGLE --- */}
                      <button
                        className={`${styles.statusToggle} ${
                          comp.status ? styles.active : styles.inactive
                        }`}
                        title={`Click to set to ${comp.status ? 'Inactive' : 'Active'}`}
                      >
                        <FontAwesomeIcon
                          style={{fontSize: '1.2em', marginRight: '5px'}} // Style icon
                        />
                        {comp.status ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className={styles.actionButtons}>
                      <button
                        onClick={() => handleOpenEditModal(comp)}
                        title="Edit Component"
                        aria-label={`Edit ${comp.name}`}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(comp.id)}
                        title="Delete Component"
                        aria-label={`Delete ${comp.name}`}
                        disabled={comp.code === "BASIC"} // Keep disable logic
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <SalaryComponentForm
              initialData={currentComponent}
              componentTypeToAdd={
                modalMode === "add" ? componentTypeToAdd : null
              }
              onSave={handleSaveComponent}
              onCancel={handleCloseModal}
              mode={modalMode}
              existingCodes={existingCodes}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryComponentsPage;