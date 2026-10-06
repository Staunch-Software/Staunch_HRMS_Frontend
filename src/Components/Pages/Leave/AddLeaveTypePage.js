// AddLeaveTypePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import styles from "./AddLeaveTypePage.module.css";
import { useLeaveTypes } from "../../../Contexts/LeaveTypesContext"; // Adjust import path

const initialNewTypeData = {
  name: "",
  shortCode: "",
  description: "",
  annualEntitlement: 0,
  carryForward: false,
  carryForwardLimit: 0,
  proRata: false,
  resetCycle: "Calendar Year",
  minApplicationDays: 1,
  maxApplicationDays: 99,
  weekendsBetween: false,
  holidaysBetween: false,
  applicableRoles: "",
  employeeType: [],
  locations: "",
  gender: "All",
  maritalStatus: "All",
  allowedUnderNotice: false,
  minServicePeriod: 0,
  isPaid: true,
  medicalCertRequired: false,
  additionalPerks: "None",
  sandwichRule: false,
  enableAccrual: false,
  accrualFrequency: "Monthly",
  accrualRate: 0,
  accrualStart: "Joining Date",
  maxAccrualLimit: 0,
  negativeBalanceAllowed: false,
  carryForwardExpiryDays: 0,
  approvalType: "Single Level",
  approvalHierarchy: ["Manager"],
  autoApprovalTime: 0,
  allowEncashment: false,
  encashmentFrequency: "N/A",
  minBalanceRequiredEncash: 0,
  encashmentLimit: 0,
  encashmentFormula: "N/A",
  leaveYearStart: "Jan-Dec",
  midYearJoinersRule: "Pro-rata",
  leaveCutoffDate: "Dec 31",
  carryForwardResetDate: "N/A",
  requireDocs: false,
  allowedFormats: [],
  maxFileSize: 0,
  blockDuringNotice: false,
  blockDuringAppraisal: false,
  blockCriticalDates: [],
  restrictConsecutive: 0,
  notifyOnApply: true,
  notifyOnApprove: true,
  notifyExpireReminders: false,
  alertNegativeBalance: false,
};

const resetCycleOptions = [
  { value: "Calendar Year", label: "Calendar Year" },
  { value: "Work Anniversary", label: "Work Anniversary" },
  { value: "Financial Year", label: "Financial Year" },
];
const genderOptions = [
  { value: "All", label: "All" },
  { value: "Male", label: "Male Only" },
  { value: "Female", label: "Female Only" },
];
const maritalStatusOptions = [
  { value: "All", label: "All" },
  { value: "Married", label: "Married Only" },
  { value: "Single", label: "Single Only" },
];
const employeeTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Intern", label: "Intern" },
];
const accrualFrequencyOptions = [
  { value: "Monthly", label: "Monthly" },
  { value: "Bi-Weekly", label: "Bi-Weekly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Annually", label: "Annually" },
  { value: "Hourly", label: "Per Hour Worked" },
  { value: "N/A", label: "N/A (No Accrual)" },
];
const accrualStartOptions = [
  { value: "Joining Date", label: "From Date of Joining" },
  { value: "Probation End", label: "After Probation End" },
  { value: "Calendar Start", label: "From Start of Leave Cycle" },
  { value: "N/A", label: "N/A (No Accrual)" },
];

const customSelectStyles = {
  option: (provided, state) => ({
    ...provided,
    paddingTop: "10px",
    paddingBottom: "10px",
    fontSize: "0.9rem",
    backgroundColor: state.isSelected
      ? "#007bff"
      : state.isFocused
      ? "#e9ecef"
      : "#fff",
    color: state.isSelected ? "#fff" : "#495057",
    cursor: "pointer",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    fontWeight: "normal",
  }),
  control: (provided, state) => ({
    ...provided,
    minHeight: "40px",
    height: "40px",
    borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
    boxShadow: state.isFocused
      ? "0 0 0 0.10rem rgba(13, 110, 253, 0.25)"
      : null,
    "&:hover": { borderColor: state.isFocused ? "#86b7fe" : "#adb5bd" },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#adb5bd",
    fontSize: "0.9rem",
  }),
  input: (provided) => ({
    ...provided,
    height: "auto",
    paddingTop: "0",
    paddingBottom: "0",
    margin: "0",
    fontSize: "0.9rem",
    color: "#495057",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#495057",
    fontSize: "0.9rem",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 4,
    border: "1px solid #ced4da",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "6px",
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: "4px",
    paddingBottom: "4px",
    scrollbarWidth: "thin",
    scrollbarColor: "#adb5bd #f8f9fa",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": {
      background: "#f8f9fa",
      borderRadius: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#adb5bd",
      borderRadius: "6px",
    },
  }),
};

const AddLeaveTypePage = () => {
  const navigate = useNavigate();
  const { addLeaveType } = useLeaveTypes();
  const [newLeaveTypeData, setNewLeaveTypeData] = useState(initialNewTypeData);
  const [isShortCodeManuallyEdited, setIsShortCodeManuallyEdited] =
    useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (type === "number") {
      newValue = value === "" ? "" : Number(value);
    }
    setNewLeaveTypeData((prevData) => {
      const updatedData = { ...prevData, [name]: newValue };
      if (name === "name" && !isShortCodeManuallyEdited) {
        updatedData.shortCode = newValue.substring(0, 3).toUpperCase();
      }
      if (name === "carryForward" && !checked) {
        updatedData.carryForwardLimit = 0;
        updatedData.carryForwardExpiryDays = 0;
      }
      if (name === "enableAccrual" && !checked) {
        updatedData.accrualFrequency = "N/A";
        updatedData.accrualRate = 0;
        updatedData.accrualStart = "N/A";
        updatedData.maxAccrualLimit = 0;
      }
      return updatedData;
    });
    if (name === "shortCode") {
      setIsShortCodeManuallyEdited(true);
    }
  };
  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    let value;
    if (Array.isArray(selectedOption)) {
      value = selectedOption.map((option) => option.value);
    } else {
      value = selectedOption ? selectedOption.value : "";
    }
    setNewLeaveTypeData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleAddTypeSubmit = (e) => {
    e.preventDefault();
    if (!newLeaveTypeData.name.trim() || !newLeaveTypeData.shortCode.trim()) {
      alert("Leave Type Name and Short Code are required.");
      return;
    }
    if (newLeaveTypeData.shortCode.length > 3) {
      alert("Short Code cannot be longer than 3 characters.");
      return;
    }
    const newId = `new_${Date.now()}`;
    const finalDataToAdd = {
      id: newId,
      ...initialNewTypeData,
      ...newLeaveTypeData,
      shortCode: newLeaveTypeData.shortCode.toUpperCase(),
      annualEntitlement: Number(newLeaveTypeData.annualEntitlement) || 0,
      carryForwardLimit: newLeaveTypeData.carryForward
        ? Number(newLeaveTypeData.carryForwardLimit) || 0
        : 0,
      carryForwardExpiryDays: newLeaveTypeData.carryForward
        ? Number(newLeaveTypeData.carryForwardExpiryDays) || 0
        : 0,
      minApplicationDays: Number(newLeaveTypeData.minApplicationDays) || 1,
      maxApplicationDays: Number(newLeaveTypeData.maxApplicationDays) || 99,
      applicableRoles:
        typeof newLeaveTypeData.applicableRoles === "string"
          ? newLeaveTypeData.applicableRoles
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : newLeaveTypeData.applicableRoles || [],
      employeeType: Array.isArray(newLeaveTypeData.employeeType)
        ? newLeaveTypeData.employeeType
        : [],
      locations:
        typeof newLeaveTypeData.locations === "string"
          ? newLeaveTypeData.locations
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : newLeaveTypeData.locations || [],
      gender: newLeaveTypeData.gender,
      maritalStatus: newLeaveTypeData.maritalStatus,
      allowedUnderNotice: newLeaveTypeData.allowedUnderNotice,
      minServicePeriod: Number(newLeaveTypeData.minServicePeriod) || 0,
      enableAccrual: newLeaveTypeData.enableAccrual,
      accrualFrequency: newLeaveTypeData.enableAccrual
        ? newLeaveTypeData.accrualFrequency
        : "N/A",
      accrualRate: newLeaveTypeData.enableAccrual
        ? Number(newLeaveTypeData.accrualRate) || 0
        : 0,
      accrualStart: newLeaveTypeData.enableAccrual
        ? newLeaveTypeData.accrualStart
        : "N/A",
      maxAccrualLimit: newLeaveTypeData.enableAccrual
        ? Number(newLeaveTypeData.maxAccrualLimit) || 0
        : 0,
      negativeBalanceAllowed: newLeaveTypeData.negativeBalanceAllowed,
    };
    addLeaveType(finalDataToAdd);
    alert("Leave Type Added!");
    navigate("/app/leave/leave-types");
  };
  const handleCancel = () => {
    navigate("/app/leave/leave-types");
  };
  const getSelectedValue = (options, value) => {
    if (Array.isArray(value)) {
      return options.filter((option) => value.includes(option.value));
    }
    return options.find((option) => option.value === value);
  };

  return (
    <div className={styles.addFormContainer}>
      <h2>Add New Leave Type</h2>
      <form onSubmit={handleAddTypeSubmit}>
        <section className={styles.formSection}>
          <h4>General Info</h4>
          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.formGroupName}`}>
              <label htmlFor="name">Leave Type Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newLeaveTypeData.name}
                onChange={handleInputChange}
                required
                className={styles.inputField}
              />
            </div>
            <div className={`${styles.formGroup} ${styles.formGroupShortCode}`}>
              <label htmlFor="shortCode">Short Code *</label>
              <input
                type="text"
                id="shortCode"
                name="shortCode"
                value={newLeaveTypeData.shortCode}
                onChange={handleInputChange}
                required
                maxLength={3}
                placeholder="Auto"
                className={styles.inputField}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newLeaveTypeData.description}
              onChange={handleInputChange}
              rows={3}
              className={styles.inputField}
            />
          </div>
        </section>

        <section className={styles.formSection}>
          <h4>Leave Counts</h4>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="annualEntitlement">
                Annual Entitlement (Days)
              </label>
              <input
                type="number"
                id="annualEntitlement"
                name="annualEntitlement"
                min="0"
                value={newLeaveTypeData.annualEntitlement}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.carryForward ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="carryForwardLimit">
                Carry Forward Limit (Days)
              </label>
              <input
                type="number"
                id="carryForwardLimit"
                name="carryForwardLimit"
                min="0"
                value={newLeaveTypeData.carryForwardLimit}
                onChange={handleInputChange}
                disabled={!newLeaveTypeData.carryForward}
                className={styles.inputField}
              />
            </div>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.carryForward ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="carryForwardExpiryDays">
                Carry Forward Expiry (Days after Cycle End)
              </label>
              <input
                type="number"
                id="carryForwardExpiryDays"
                name="carryForwardExpiryDays"
                min="0"
                value={newLeaveTypeData.carryForwardExpiryDays}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled={!newLeaveTypeData.carryForward}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="resetCycle">Reset Cycle</label>
              <Select
                id="resetCycle"
                name="resetCycle"
                options={resetCycleOptions}
                styles={customSelectStyles}
                value={getSelectedValue(
                  resetCycleOptions,
                  newLeaveTypeData.resetCycle
                )}
                onChange={handleSelectChange}
                placeholder="Select Cycle..."
                classNamePrefix="react-select"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="minApplicationDays">Min Application Days</label>
              <input
                type="number"
                id="minApplicationDays"
                name="minApplicationDays"
                min="0"
                value={newLeaveTypeData.minApplicationDays}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maxApplicationDays">Max Application Days</label>
              <input
                type="number"
                id="maxApplicationDays"
                name="maxApplicationDays"
                min="0"
                value={newLeaveTypeData.maxApplicationDays}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroupCheckboxContainer}>
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="carryForward"
                  name="carryForward"
                  checked={newLeaveTypeData.carryForward}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                />
                <label htmlFor="carryForward">Allow Carry Forward</label>
              </div>
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="proRata"
                  name="proRata"
                  checked={newLeaveTypeData.proRata}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                />
                <label htmlFor="proRata">Pro-rata Calculation</label>
              </div>
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="weekendsBetween"
                  name="weekendsBetween"
                  checked={newLeaveTypeData.weekendsBetween}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                />
                <label htmlFor="weekendsBetween">
                  Count Weekends Between Leave
                </label>
              </div>
              <div className={styles.formGroupCheckbox}>
                <input
                  type="checkbox"
                  id="holidaysBetween"
                  name="holidaysBetween"
                  checked={newLeaveTypeData.holidaysBetween}
                  onChange={handleInputChange}
                  className={styles.checkboxInput}
                />
                <label htmlFor="holidaysBetween">
                  Count Holidays Between Leave
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <h4>Applicability</h4>
          <div className={styles.applicabilityFieldsGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="applicableRoles">
                Applicable Roles/Departments
              </label>
              <input
                type="text"
                id="applicableRoles"
                name="applicableRoles"
                placeholder=""
                value={newLeaveTypeData.applicableRoles}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="employeeType">Employee Type</label>
              <Select
                isMulti
                id="employeeType"
                name="employeeType"
                options={employeeTypeOptions}
                styles={customSelectStyles}
                value={getSelectedValue(
                  employeeTypeOptions,
                  newLeaveTypeData.employeeType
                )}
                onChange={handleSelectChange}
                placeholder="Select Employee Type(s)..."
                classNamePrefix="react-select"
                closeMenuOnSelect={false}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="locations">Locations</label>
              <input
                type="text"
                id="locations"
                name="locations"
                placeholder=""
                value={newLeaveTypeData.locations}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="gender">Gender-based Applicability</label>
              <Select
                id="gender"
                name="gender"
                options={genderOptions}
                styles={customSelectStyles}
                value={getSelectedValue(genderOptions, newLeaveTypeData.gender)}
                onChange={handleSelectChange}
                placeholder="Select Gender..."
                classNamePrefix="react-select"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="maritalStatus">
                Marital Status Applicability
              </label>
              <Select
                id="maritalStatus"
                name="maritalStatus"
                options={maritalStatusOptions}
                styles={customSelectStyles}
                value={getSelectedValue(
                  maritalStatusOptions,
                  newLeaveTypeData.maritalStatus
                )}
                onChange={handleSelectChange}
                placeholder="Select Status..."
                classNamePrefix="react-select"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="minServicePeriod">
                Min Service Period (Months)
              </label>
              <input
                type="number"
                id="minServicePeriod"
                name="minServicePeriod"
                min="0"
                value={newLeaveTypeData.minServicePeriod}
                onChange={handleInputChange}
                className={styles.inputField}
              />
            </div>
          </div>
          <div className={styles.applicabilityCheckboxContainer}>
            <div className={styles.formGroupCheckbox}>
              <input
                type="checkbox"
                id="allowedUnderNotice"
                name="allowedUnderNotice"
                checked={newLeaveTypeData.allowedUnderNotice}
                onChange={handleInputChange}
                className={styles.checkboxInput}
              />
              <label htmlFor="allowedUnderNotice">
                Allowed Under Notice Period
              </label>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <h4>Accrual Settings</h4>
          <div className={styles.accrualFieldsGrid}>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.enableAccrual ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="accrualFrequency">Accrual Frequency</label>
              <Select
                id="accrualFrequency"
                name="accrualFrequency"
                options={accrualFrequencyOptions}
                styles={customSelectStyles}
                value={getSelectedValue(
                  accrualFrequencyOptions,
                  newLeaveTypeData.accrualFrequency
                )}
                onChange={handleSelectChange}
                placeholder="Select Frequency..."
                classNamePrefix="react-select"
                isDisabled={!newLeaveTypeData.enableAccrual}
              />
            </div>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.enableAccrual ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="accrualRate">Accrual Rate</label>
              <input
                type="number"
                step="0.01"
                id="accrualRate"
                name="accrualRate"
                min="0"
                value={newLeaveTypeData.accrualRate}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled={!newLeaveTypeData.enableAccrual}
              />
            </div>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.enableAccrual ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="accrualStart">Start of Accrual</label>
              <Select
                id="accrualStart"
                name="accrualStart"
                options={accrualStartOptions}
                styles={customSelectStyles}
                value={getSelectedValue(
                  accrualStartOptions,
                  newLeaveTypeData.accrualStart
                )}
                onChange={handleSelectChange}
                placeholder="Select Start..."
                classNamePrefix="react-select"
                isDisabled={!newLeaveTypeData.enableAccrual}
              />
            </div>
            <div
              className={`${styles.formGroup} ${
                !newLeaveTypeData.enableAccrual ? styles.disabledInput : ""
              }`}
            >
              <label htmlFor="maxAccrualLimit">Max Accrual Cap (Days)</label>
              <input
                type="number"
                id="maxAccrualLimit"
                name="maxAccrualLimit"
                min="0"
                value={newLeaveTypeData.maxAccrualLimit}
                onChange={handleInputChange}
                className={styles.inputField}
                disabled={!newLeaveTypeData.enableAccrual}
              />
            </div>
          </div>
          <div className={styles.accrualCheckboxContainer}>
            <div className={styles.formGroupCheckbox}>
              <input
                type="checkbox"
                id="enableAccrual"
                name="enableAccrual"
                checked={newLeaveTypeData.enableAccrual}
                onChange={handleInputChange}
                className={styles.checkboxInput}
              />
              <label htmlFor="enableAccrual">Enable Accrual</label>
            </div>
            {/* <div className={styles.formGroupCheckbox}>
              <input
                type="checkbox"
                id="negativeBalanceAllowed"
                name="negativeBalanceAllowed"
                checked={newLeaveTypeData.negativeBalanceAllowed}
                onChange={handleInputChange}
                className={styles.checkboxInput}
              />
              <label htmlFor="negativeBalanceAllowed">
                Allow Negative Balance
              </label>
            </div> */}
          </div>
        </section>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>
            Save Leave Type
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLeaveTypePage;
