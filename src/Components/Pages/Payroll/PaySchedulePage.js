import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./PaySchedulePage.module.css";
import {
  payrollApiService,
  formatPaymentDay,
  formatAppliesTo,
} from "../../../services/payrollApiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faUsers,
  faBuilding,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

// --- Default Structure for a New Schedule ---
const defaultSchedule = {
  id: null,
  scheduleName: "",
  payFrequency: "Monthly",
  paymentDayRule: { type: "LastDayOfMonth" },
  holidayAdjustment: "Before",
  isActive: true,
  appliesTo: { departments: [], locations: [] }, // Default to specific but empty for initial form state
  appliesToMode: "Specific", // Default mode to show selectors initially in form
  processingDayOffset: 2,
  firstEffectivePayDate: "",
  description: "",
};

// --- Pay Schedule Form Component ---
const PayScheduleForm = ({ initialData, onSave, onCancel, mode }) => {
  // Initialize form data, setting appliesToMode based on whether appliesTo is null in the actual data
  const initializeFormData = (data) => {
    const baseData = data || defaultSchedule; // Use default if adding new
    const isSpecific =
      baseData.appliesTo !== null &&
      (baseData.appliesTo?.departments?.length > 0 ||
        baseData.appliesTo?.locations?.length > 0);
    return {
      ...defaultSchedule, // Start with clean defaults
      ...baseData, // Overlay existing data if editing
      appliesToMode: isSpecific ? "Specific" : "All",
      // Ensure appliesTo is an object with arrays for the form state, even if null in original data
      appliesTo:
        baseData.appliesTo === null
          ? { departments: [], locations: [] }
          : {
              departments: baseData.appliesTo?.departments || [],
              locations: baseData.appliesTo?.locations || [],
            },
    };
  };

  const [formData, setFormData] = useState(initializeFormData(initialData));
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Re-initialize form when initialData changes (e.g., opening edit modal)
    setFormData(initializeFormData(initialData));
    setFormError(""); // Clear previous errors
  }, [initialData]);

  useEffect(() => {
    // Fetch reference data only if in 'Specific' mode
    const fetchRefs = async () => {
      if (formData.appliesToMode === "Specific") {
        setLoadingRefs(true);
        let fetchDepts = departments.length === 0;
        let fetchLocs = locations.length === 0;
        try {
          const promises = [];
          if (fetchDepts) promises.push(payrollApiService.getDepartments());
          else promises.push(Promise.resolve(departments));
          if (fetchLocs) promises.push(payrollApiService.getLocations());
          else promises.push(Promise.resolve(locations));

          const [fetchedDepts, fetchedLocs] = await Promise.all(promises);

          if (fetchDepts) setDepartments(fetchedDepts);
          if (fetchLocs) setLocations(fetchedLocs);
        } catch (err) {
          console.error("Error fetching reference data:", err);
          setFormError("Could not load departments/locations.");
        } finally {
          setLoadingRefs(false);
        }
      }
    };
    fetchRefs();
    // Dependencies: Run when mode changes, or initially if deps/locs are empty
  }, [formData.appliesToMode, departments.length, locations.length]);

  // --- Input Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePaymentRuleChange = (rulePart) => {
    setFormData((prev) => ({
      ...prev,
      paymentDayRule: { ...prev.paymentDayRule, ...rulePart },
    }));
  };

  const handleFrequencyChange = (e) => {
    const newFrequency = e.target.value;
    let newPaymentRule = {};
    switch (newFrequency) {
      case "Monthly":
        newPaymentRule = { type: "LastDayOfMonth" };
        break;
      case "Semi-Monthly":
        newPaymentRule = {
          type: "SpecificDays",
          dayOfMonth: 15,
          dayOfMonth2: null,
        };
        break;
      case "Weekly":
        newPaymentRule = { dayOfWeek: "Friday" };
        break;
      case "Bi-Weekly":
        newPaymentRule = { dayOfWeek: "Friday", firstPayDate: "" };
        break;
      default:
        newPaymentRule = {};
    }
    setFormData((prev) => ({
      ...prev,
      payFrequency: newFrequency,
      paymentDayRule: newPaymentRule,
    }));
  };

  // Handler for the 'All' vs 'Specific' toggle
  const handleAppliesToModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      appliesToMode: mode,
      // Clear specific selections if switching to 'All' JUST IN CASE (though API handles final state)
      // appliesTo: mode === 'All' ? { departments: [], locations: [] } : prev.appliesTo
    }));
  };

  // Handler for Checkbox Multi-Select
  const handleAppliesToCheckboxChange = (e, categoryType) => {
    // categoryType: 'departments' or 'locations'
    const { value, checked } = e.target; // value is the ID (dept_1, loc_hq etc)

    setFormData((prev) => {
      const currentSelection = prev.appliesTo[categoryType] || []; // Get current array
      let newSelection;

      if (checked) {
        // Add the ID if it's not already there
        newSelection = currentSelection.includes(value)
          ? currentSelection
          : [...currentSelection, value];
      } else {
        // Remove the ID
        newSelection = currentSelection.filter((id) => id !== value);
      }

      return {
        ...prev,
        appliesTo: {
          ...prev.appliesTo,
          [categoryType]: newSelection, // Update the specific category array
        },
      };
    });
  };

  // --- Form Submission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(""); // Clear previous errors

    // Basic Validation
    if (!formData.scheduleName.trim()) {
      setFormError("Schedule Name is required.");
      return;
    }
    if (!formData.payFrequency) {
      setFormError("Pay Frequency is required.");
      return;
    }
    if (
      formData.payFrequency === "Bi-Weekly" &&
      !formData.paymentDayRule?.firstPayDate
    ) {
      setFormError("First Pay Date is required for Bi-Weekly frequency.");
      return;
    }
    if (
      formData.payFrequency === "Semi-Monthly" &&
      (!formData.paymentDayRule?.dayOfMonth ||
        !formData.paymentDayRule?.dayOfMonth2)
    ) {
      setFormError(
        "Both payment days are required for Semi-Monthly frequency."
      );
      return;
    }

    // Validation for 'Applies To' when in 'Specific' mode
    if (
      formData.appliesToMode === "Specific" &&
      !formData.appliesTo?.departments?.length &&
      !formData.appliesTo?.locations?.length
    ) {
      setFormError(
        "Please select at least one Department or Location when applying to specific groups."
      );
      return;
    }

    // Construct final data object (API service will handle setting appliesTo to null if needed)
    const dataToSave = {
      ...formData, // Includes appliesTo object and appliesToMode
      processingDayOffset: parseInt(formData.processingDayOffset, 10) || 0,
      paymentDayRule: {
        ...formData.paymentDayRule,
        dayOfMonth: formData.paymentDayRule.dayOfMonth
          ? parseInt(formData.paymentDayRule.dayOfMonth, 10)
          : null,
        dayOfMonth2: formData.paymentDayRule.dayOfMonth2
          ? parseInt(formData.paymentDayRule.dayOfMonth2, 10)
          : null,
      },
    };

    onSave(dataToSave); // Pass data to parent component's save handler
  };

  // --- Memoized values ---
  const dayOptions = useMemo(
    () => Array.from({ length: 31 }, (_, i) => i + 1),
    []
  );
  const processingDayLabel =
    formData.holidayAdjustment === "After"
      ? "Process Business Days After Payday"
      : "Process Business Days Before Payday";

  // --- JSX ---
  return (
    <div className={styles.modalInnerContent}>
      <form onSubmit={handleSubmit} className={styles.modalForm}>
        <h3 className={styles.modalTitle}>
          {mode === "add" ? "Add New Pay Schedule" : "Edit Pay Schedule"}
        </h3>
        {formError && <p className={styles.errorTextModal}>{formError}</p>}
        <div className={styles.formGrid}>
          {/* Row 1: Name, Frequency */}
          <div className={styles.formGroup}>
            <label htmlFor="scheduleName">Schedule Name *</label>
            <input
              type="text"
              id="scheduleName"
              name="scheduleName"
              value={formData.scheduleName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="payFrequency">Pay Frequency *</label>
            <select
              id="payFrequency"
              name="payFrequency"
              value={formData.payFrequency}
              onChange={handleFrequencyChange}
              required
            >
              <option value="Monthly">Monthly</option>
              <option value="Semi-Monthly">Semi-Monthly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          {/* Row 2: Payment Day Rules */}
          <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
            <label>Payment Day *</label>
            <div className={styles.paymentRuleContainer}>
              {formData.payFrequency === "Monthly" && (
                <select
                  value={
                    formData.paymentDayRule?.type === "LastDayOfMonth"
                      ? "LastDayOfMonth"
                      : formData.paymentDayRule?.dayOfMonth || ""
                  }
                  onChange={(e) =>
                    handlePaymentRuleChange(
                      e.target.value === "LastDayOfMonth"
                        ? { type: "LastDayOfMonth", dayOfMonth: null }
                        : { type: "SpecificDay", dayOfMonth: e.target.value }
                    )
                  }
                >
                  <option value="LastDayOfMonth">Last Day of Month</option>
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              )}
              {formData.payFrequency === "Semi-Monthly" && (
                <div className={styles.inlineInputs}>
                  <select
                    value={formData.paymentDayRule?.dayOfMonth || ""}
                    onChange={(e) =>
                      handlePaymentRuleChange({ dayOfMonth: e.target.value })
                    }
                  >
                    <option value="">Day 1</option>
                    {dayOptions.map((d) => (
                      <option key={`d1-${d}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <span>&</span>
                  <select
                    value={formData.paymentDayRule?.dayOfMonth2 || ""}
                    onChange={(e) =>
                      handlePaymentRuleChange({ dayOfMonth2: e.target.value })
                    }
                  >
                    <option value="">Day 2</option>
                    {dayOptions.map((d) => (
                      <option key={`d2-${d}`} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {formData.payFrequency === "Weekly" && (
                <select
                  value={formData.paymentDayRule?.dayOfWeek || "Friday"}
                  onChange={(e) =>
                    handlePaymentRuleChange({ dayOfWeek: e.target.value })
                  }
                >
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              )}
              {formData.payFrequency === "Bi-Weekly" && (
                <div className={styles.inlineInputs}>
                  <select
                    value={formData.paymentDayRule?.dayOfWeek || "Friday"}
                    onChange={(e) =>
                      handlePaymentRuleChange({ dayOfWeek: e.target.value })
                    }
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                  <input
                    type="date"
                    placeholder="First Pay Date"
                    value={formData.paymentDayRule?.firstPayDate || ""}
                    onChange={(e) =>
                      handlePaymentRuleChange({ firstPayDate: e.target.value })
                    }
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Adjustments */}
          <div className={styles.formGroup}>
            <label htmlFor="holidayAdjustment">Holiday Adjustment *</label>
            <select
              id="holidayAdjustment"
              name="holidayAdjustment"
              value={formData.holidayAdjustment}
              onChange={handleChange}
              required
            >
              <option value="Before">Pay on Day Before</option>
              <option value="After">Pay on Day After</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="processingDayOffset">{processingDayLabel}</label>
            <input
              type="number"
              id="processingDayOffset"
              name="processingDayOffset"
              min="0"
              step="1"
              value={formData.processingDayOffset}
              onChange={handleChange}
            />
          </div>

          {/* Row 4: Applies To (Using Checkboxes) */}
          <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
            <label>Applies To *</label>
            {/* Mode Toggle Buttons */}
            <div className={styles.appliesToToggleContainer}>
              <button
                type="button"
                className={`${styles.appliesToButton} ${
                  formData.appliesToMode === "All"
                    ? styles.appliesToButtonActive
                    : ""
                }`}
                onClick={() => handleAppliesToModeChange("All")}
              >
                <FontAwesomeIcon icon={faUsers} /> All Employees
              </button>
              <button
                type="button"
                className={`${styles.appliesToButton} ${
                  formData.appliesToMode === "Specific"
                    ? styles.appliesToButtonActive
                    : ""
                }`}
                onClick={() => handleAppliesToModeChange("Specific")}
              >
                <FontAwesomeIcon icon={faBuilding} /> Specific Groups
              </button>
            </div>
            {/* Checkbox Section */}
            {formData.appliesToMode === "Specific" && (
              <div className={styles.specificGroupsContainer}>
                {loadingRefs && (
                  <p className={styles.loadingText}>Loading options...</p>
                )}
                {!loadingRefs && (
                  <>
                    {/* Department Checkboxes */}
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxGroupLabel}>
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className={styles.selectLabelIcon}
                        />{" "}
                        Departments
                      </label>
                      <div className={styles.checkboxList}>
                        {departments.length > 0 ? (
                          departments.map((dept) => (
                            <div key={dept.id} className={styles.checkboxItem}>
                              <input
                                type="checkbox"
                                id={`dept-${dept.id}`}
                                value={dept.id}
                                checked={formData.appliesTo.departments.includes(
                                  dept.id
                                )}
                                onChange={(e) =>
                                  handleAppliesToCheckboxChange(
                                    e,
                                    "departments"
                                  )
                                }
                              />
                              <label htmlFor={`dept-${dept.id}`}>
                                {dept.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className={styles.noOptionsText}>
                            No departments found.
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Location Checkboxes */}
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxGroupLabel}>
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className={styles.selectLabelIcon}
                        />{" "}
                        Locations
                      </label>
                      <div className={styles.checkboxList}>
                        {locations.length > 0 ? (
                          locations.map((loc) => (
                            <div key={loc.id} className={styles.checkboxItem}>
                              <input
                                type="checkbox"
                                id={`loc-${loc.id}`}
                                value={loc.id}
                                checked={formData.appliesTo.locations.includes(
                                  loc.id
                                )}
                                onChange={(e) =>
                                  handleAppliesToCheckboxChange(e, "locations")
                                }
                              />
                              <label htmlFor={`loc-${loc.id}`}>
                                {loc.name}
                              </label>
                            </div>
                          ))
                        ) : (
                          <p className={styles.noOptionsText}>
                            No locations found.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Row 5: Effective Date, Description */}
          <div className={styles.formGroup}>
            <label htmlFor="firstEffectivePayDate">
              Effective From (First Pay Date)
            </label>
            <input
              type="date"
              id="firstEffectivePayDate"
              name="firstEffectivePayDate"
              value={formData.firstEffectivePayDate || ""}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Notes / Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          {/* Row 6: Status Toggle */}
          <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
            <label>Status</label>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className={`${styles.toggleButtonStatus} ${
                formData.isActive
                  ? styles.toggleButtonActive
                  : styles.toggleButton
              }`}
            >
              <FontAwesomeIcon
                icon={formData.isActive ? faToggleOn : faToggleOff}
              />{" "}
              {formData.isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>{" "}
        {/* End formGrid */}
        {/* Modal Actions */}
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            {mode === "add" ? "Add Schedule" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Main Pay Schedule Page Component ---
const PaySchedulePage = () => {
  const [paySchedules, setPaySchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Page level errors (fetch, delete)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null); // For editing
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

  // Fetch initial data
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear previous page errors on fetch
    try {
      const data = await payrollApiService.getPaySchedules();
      setPaySchedules(data);
    } catch (err) {
      console.error("Failed to fetch pay schedules:", err);
      setError(err.message || "Could not fetch pay schedules.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // --- Modal Control ---
  const handleOpenAddModal = () => {
    setCurrentSchedule(null); // Pass null to form for default init
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (schedule) => {
    setCurrentSchedule(schedule); // Pass existing schedule data
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSchedule(null); // Clear editing state
  };

  // --- Data Operations ---
  const handleSaveSchedule = async (scheduleData) => {
  

    try {
      if (modalMode === "add") {
        await payrollApiService.addPaySchedule(scheduleData);
      } else {
        await payrollApiService.updatePaySchedule(scheduleData);
      }
      handleCloseModal(); // Close modal on success
      await fetchSchedules(); // Refresh the list
    } catch (err) {
      console.error(`Failed to ${modalMode} schedule:`, err);
     
      setError(err.message || `Could not ${modalMode} schedule.`);
      // setIsLoading(false); // Stop loading if set specifically for save
    }
  };

  const handleToggleStatus = async (schedule) => {
    const updatedSchedule = { ...schedule, isActive: !schedule.isActive };
    setIsLoading(true); // Show loading on main page for quick toggle
    try {
      await payrollApiService.updatePaySchedule(updatedSchedule);
      await fetchSchedules(); // Refresh list
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setError(err.message || "Could not update status.");
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this pay schedule? This cannot be undone."
      )
    ) {
      setIsLoading(true);
      try {
        await payrollApiService.deletePaySchedule(id);
        await fetchSchedules(); // Refresh list
      } catch (err) {
        console.error("Failed to delete schedule:", err);
        setError(err.message || "Could not delete schedule.");
        setIsLoading(false);
      }
    }
  };

  // --- Main JSX ---
  return (
    <div className={styles.payScheduleContainer}>
      {/* Action Bar */}
      <div className={styles.actionBar}>
        <h1 className={styles.title}>Pay Schedules</h1>
        <button onClick={handleOpenAddModal} className={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} /> Add New Schedule
        </button>
      </div>

      {/* Page Level Error Display */}
      {error && !isLoading && <p className={styles.errorTextPage}>{error}</p>}

      {/* Loading State */}
      {isLoading && <p className={styles.loadingText}>Loading schedules...</p>}

      {/* Empty State Table */}
      {!isLoading && !error && paySchedules.length === 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Schedule Name</th>
                <th>Frequency</th>
                <th>Payment Day(s)</th>
                <th>Applies To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.noItemsMessage}>
                <td colSpan="6">
                  No pay schedules found. Add one to get started!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && paySchedules.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Schedule Name</th>
                <th>Frequency</th>
                <th>Payment Day(s)</th>
                <th>Applies To</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paySchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{schedule.scheduleName}</td>
                  <td>{schedule.payFrequency}</td>
                  <td>{formatPaymentDay(schedule)}</td>
                  <td>{formatAppliesTo(schedule)}</td>
                  <td>
                    <button
                      // onClick={() => handleToggleStatus(schedule)}
                      className={`${styles.statusToggle} ${
                        schedule.isActive ? styles.active : styles.inactive
                      }`}
                    >
                      <FontAwesomeIcon
                        // icon={schedule.isActive ? faToggleOn : faToggleOff}
                      />{" "}
                      {schedule.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className={styles.actionButtons}>
                    <button
                      onClick={() => handleOpenEditModal(schedule)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <PayScheduleForm
              initialData={currentSchedule}
              onSave={handleSaveSchedule}
              onCancel={handleCloseModal}
              mode={modalMode}
              // Pass error state down if you implement error display inside modal
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaySchedulePage;
