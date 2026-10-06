import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import styles from "./AddEmployeeFlow.module.css";

const ADD_NEW_LOCATION_VALUE = "__ADD_NEW_LOCATION__";
const ADD_NEW_DESIGNATION_VALUE = "__ADD_NEW_DESIGNATION__";
const ADD_NEW_DEPARTMENT_VALUE = "__ADD_NEW_DEPARTMENT__";
const NO_ITEMS_MESSAGE_VALUE = "__NO_ITEMS_MESSAGE__";
const SELECT_DEPT_FIRST_VALUE = "__SELECT_DEPT_FIRST__";

const employeeTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contractor", label: "Contractor" },
  { value: "Intern", label: "Intern" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const BasicDetailsForm = ({
  data,
  updateData,
  onNext,
  onCancel,
  departments = [],
  designations = [],
  locations = [],
  isLoadingReferenceData,
  referenceDataError,
}) => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log("BasicDetailsForm Props Received:", {
      departments,
      designations,
      locations,
      data,
    });
  }, [departments, designations, locations, data]);

  const selectedDepartmentId = useMemo(() => {
    const selectedDept = departments.find((d) => d.name === data?.department);
    console.log(
      "Selected Department in Form:",
      data?.department,
      "Found ID:",
      selectedDept?.id
    );
    return selectedDept ? selectedDept.id : null;
  }, [data?.department, departments]);

  const locationOptions = useMemo(() => {
    const isLocationListEmpty = !locations || locations.length === 0;
    const baseOptions = isLocationListEmpty
      ? [
          {
            value: NO_ITEMS_MESSAGE_VALUE,
            label: "No locations added yet",
            isDisabled: true,
          },
        ]
      : (locations || []).map((loc) => ({ value: loc.name, label: loc.name }));
    return [
      ...baseOptions,
      { value: ADD_NEW_LOCATION_VALUE, label: "+ Add New Location" },
    ];
  }, [locations]);

  const departmentOptions = useMemo(() => {
    const isDepartmentListEmpty = !departments || departments.length === 0;
    const baseOptions = isDepartmentListEmpty
      ? [
          {
            value: NO_ITEMS_MESSAGE_VALUE,
            label: "No departments added yet",
            isDisabled: true,
          },
        ]
      : departments.map((dep) => ({
          value: dep.name,
          label: `${dep.name} (${dep.code})`,
        }));
    return [
      ...baseOptions,
      { value: ADD_NEW_DEPARTMENT_VALUE, label: "+ Add New Department" },
    ];
  }, [departments]);

  const designationOptions = useMemo(() => {
    console.log(
      `Recalculating designation options. Selected Dept ID: ${selectedDepartmentId}`
    );
    if (!selectedDepartmentId) {
      return [
        {
          value: SELECT_DEPT_FIRST_VALUE,
          label: "Select Department First",
          isDisabled: true,
        },
      ];
    }
    const filtered = designations.filter(
      (des) => des.departmentId === selectedDepartmentId
    );
    console.log(
      `Filtered designations for Dept ID ${selectedDepartmentId}:`,
      filtered
    );
    const baseOptions =
      filtered.length === 0
        ? [
            {
              value: NO_ITEMS_MESSAGE_VALUE,
              label: "No designations for this dept",
              isDisabled: true,
            },
          ]
        : filtered.map((des) => ({ value: des.name, label: des.name }));
    return [
      ...baseOptions,
      { value: ADD_NEW_DESIGNATION_VALUE, label: "+ Add New Designation" },
    ];
  }, [selectedDepartmentId, designations]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "employeeId" ? value.toUpperCase() : value;
    updateData(name, processedValue);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (fieldName, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    const prevValue = data ? data[fieldName] : undefined;

    if ([NO_ITEMS_MESSAGE_VALUE, SELECT_DEPT_FIRST_VALUE].includes(value))
      return;

    // *** Corrected Navigation Paths (Assuming settings structure) ***
    if (value === ADD_NEW_LOCATION_VALUE) {
      navigate("/app/locations/add");
      return;
    }
    if (value === ADD_NEW_DESIGNATION_VALUE) {
      navigate("/app/designation/add", {
        state: { departmentId: selectedDepartmentId },
      });
      return;
    }
    if (value === ADD_NEW_DEPARTMENT_VALUE) {
      navigate("/app/department/add");
      return;
    }

    updateData(fieldName, value);

    if (fieldName === "department" && value !== prevValue) {
      console.log("Department changed, clearing designation field.");
      updateData("designation", "");
      if (errors.designation) {
        setErrors((prev) => ({ ...prev, designation: null }));
      }
    }

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validate = () => {
    let tempErrors = {};
    const currentData = data || {};

    if (!currentData.firstName?.trim())
      tempErrors.firstName = "First Name is required.";
    if (!currentData.lastName?.trim())
      tempErrors.lastName = "Last Name is required.";
    if (!currentData.employeeId?.trim())
      tempErrors.employeeId = "Employee ID is required.";
    if (!currentData.dateOfJoining)
      tempErrors.dateOfJoining = "Date of Joining is required.";
    // *** Removed Gender validation based on the JSX below ***
    // if (!currentData.gender) tempErrors.gender = "Gender is required.";
    if (!currentData.workEmail?.trim())
      tempErrors.workEmail = "Work Email is required.";
    else if (!/\S+@\S+\.\S+/.test(currentData.workEmail))
      tempErrors.workEmail = "Please enter a valid email address.";
    if (!currentData.mobileNumber?.trim())
      tempErrors.mobileNumber = "Mobile Number is required.";
    else if (
      !/^\+?[0-9\s-()]{10,}$/.test(
        currentData.mobileNumber.replace(/[\s-()]/g, "")
      )
    ) {
      tempErrors.mobileNumber = "Enter a valid phone number (min. 10 digits).";
    }
    if (!currentData.employeeType)
      tempErrors.employeeType = "Employee Type is required.";
    if (!currentData.workLocation)
      tempErrors.workLocation = "Work Location is required.";
    if (!currentData.department)
      tempErrors.department = "Department is required.";
    if (currentData.department && !currentData.designation) {
      tempErrors.designation = "Designation is required.";
    }
    if (currentData.department && currentData.designation) {
      const selectedDeptId = departments.find(
        (d) => d.name === currentData.department
      )?.id;
      const isValidDesignation = designations.some(
        (des) =>
          des.name === currentData.designation &&
          des.departmentId === selectedDeptId
      );
      if (!isValidDesignation) {
        tempErrors.designation =
          "Selected designation not valid for chosen department.";
      }
    }

    setErrors(tempErrors);
    console.log("Basic Details - Validation Errors:", tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // *** CORRECTED: handleNextClick calls preventDefault ***
  const handleNextClick = (e) => {
    e.preventDefault(); // Prevent default form submission
    if (validate()) {
      console.log("Basic Details Validated Successfully");
      onNext(); // Call the prop function to move to the next step
    } else {
      console.log("Validation failed for Basic Details");
    }
  };

  const findSelectedOption = (options, value) => {
    if (!Array.isArray(options) || value == null) return null;
    return (
      options.find(
        (option) =>
          option.value === value &&
          ![
            NO_ITEMS_MESSAGE_VALUE,
            SELECT_DEPT_FIRST_VALUE,
            ADD_NEW_LOCATION_VALUE,
            ADD_NEW_DESIGNATION_VALUE,
            ADD_NEW_DEPARTMENT_VALUE,
          ].includes(option.value)
      ) || null
    );
  };

  const selectedLocationOption = findSelectedOption(
    locationOptions,
    data?.workLocation
  );
  const selectedDepartmentOption = findSelectedOption(
    departmentOptions,
    data?.department
  );
  const selectedDesignationOption = findSelectedOption(
    designationOptions,
    data?.designation
  );
  const selectedEmployeeTypeOption = findSelectedOption(
    employeeTypeOptions,
    data?.employeeType
  );
  const selectedGenderOption = findSelectedOption(genderOptions, data?.gender); // Keep if gender field exists

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      paddingTop: "10px",
      paddingBottom: "10px",
      fontSize: "0.95rem",
      backgroundColor: state.isSelected
        ? "#007bff"
        : state.isFocused
        ? "#e9ecef"
        : "#fff",
      color: state.isSelected ? "#fff" : "#333",
      cursor: "pointer",
      minHeight: "40px",
      display: "flex",
      alignItems: "center",
      fontWeight: [
        ADD_NEW_LOCATION_VALUE,
        ADD_NEW_DESIGNATION_VALUE,
        ADD_NEW_DEPARTMENT_VALUE,
      ].includes(state.value)
        ? "bold"
        : "normal",
      fontStyle: [
        ADD_NEW_LOCATION_VALUE,
        ADD_NEW_DESIGNATION_VALUE,
        ADD_NEW_DEPARTMENT_VALUE,
      ].includes(state.value)
        ? "italic"
        : "normal",
      color: [
        ADD_NEW_LOCATION_VALUE,
        ADD_NEW_DESIGNATION_VALUE,
        ADD_NEW_DEPARTMENT_VALUE,
      ].includes(state.value)
        ? "#0056b3"
        : state.isSelected
        ? "#fff"
        : "#333",
    }),
    control: (provided, state) => ({
      ...provided,
      minHeight: "40px",
      height: "40px",
      borderColor: errors[state.selectProps.name]
        ? "red"
        : state.isFocused
        ? "#007bff"
        : "#ccc",
      boxShadow: errors[state.selectProps.name]
        ? "0 0 0 1px red"
        : state.isFocused
        ? "0 0 0 1px #007bff"
        : null,
      "&:hover": {
        borderColor: errors[state.selectProps.name]
          ? "red"
          : state.isFocused
          ? "#007bff"
          : "#aaa",
      },
    }),
    placeholder: (provided) => ({ ...provided, color: "#999" }),
    menu: (provided) => ({
      ...provided,
      zIndex: 4,
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { width: "0px" },
    }),
  };

  const getSelectWrapperClass = (fieldName) => {
    return errors[fieldName] ? styles.selectError : "";
  };

  return (
    <div className={styles.formContainer}>
      <h2>Basic Details</h2>
      {isLoadingReferenceData && (
        <p className={styles.loadingMessage}>Loading reference data...</p>
      )}
      {referenceDataError && (
        <p className={styles.errorMessage}>
          {" "}
          Error loading reference data: {referenceDataError}{" "}
        </p>
      )}

      <form className={styles.form} onSubmit={handleNextClick} noValidate>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.label}>
              {" "}
              First Name <span className={styles.requiredAsterisk}>*</span>{" "}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={data?.firstName || ""}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.firstName ? styles.inputError : ""
              }`}
              required
              autoComplete="given-name"
            />
            {errors.firstName && (
              <span className={styles.errorMessage}>{errors.firstName}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="middleName" className={styles.label}>
              {" "}
              Middle Name{" "}
            </label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={data?.middleName || ""}
              onChange={handleInputChange}
              className={styles.input}
              autoComplete="additional-name"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.label}>
              {" "}
              Last Name <span className={styles.requiredAsterisk}>*</span>{" "}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={data?.lastName || ""}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.lastName ? styles.inputError : ""
              }`}
              required
              autoComplete="family-name"
            />
            {errors.lastName && (
              <span className={styles.errorMessage}>{errors.lastName}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="employeeId" className={styles.label}>
              {" "}
              Employee ID <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={data?.employeeId || ""}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.employeeId ? styles.inputError : ""
              }`}
              required
              style={{ textTransform: "uppercase" }}
              autoComplete="off"
            />
            {errors.employeeId && (
              <span className={styles.errorMessage}>{errors.employeeId}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dateOfJoining" className={styles.label}>
              {" "}
              Date of Joining <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <input
              type="date"
              id="dateOfJoining"
              name="dateOfJoining"
              value={data?.dateOfJoining || ""}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.dateOfJoining ? styles.inputError : ""
              }`}
              required
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.dateOfJoining && (
              <span className={styles.errorMessage}>
                {" "}
                {errors.dateOfJoining}{" "}
              </span>
            )}
          </div>
          {/* *** Removed Gender Dropdown - Add back if needed *** */}
          {/* <div className={styles.formGroup}>
             <label htmlFor="gender" className={styles.label}>Gender <span className={styles.requiredAsterisk}>*</span></label>
             <Select inputId="gender" name="gender" options={genderOptions} value={selectedGenderOption} onChange={(s) => handleSelectChange('gender', s)} styles={customSelectStyles} placeholder="Select Gender" classNamePrefix="react-select" className={getSelectWrapperClass('gender')} isClearable aria-label="Select Gender" />
             {errors.gender && (<span className={styles.errorMessage}>{errors.gender}</span>)}
           </div> */}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="workEmail" className={styles.label}>
              {" "}
              Work Email <span className={styles.requiredAsterisk}>*</span>{" "}
            </label>
            <input
              type="email"
              id="workEmail"
              name="workEmail"
              value={data?.workEmail || ""}
              onChange={handleInputChange}
              className={`${styles.input} ${
                errors.workEmail ? styles.inputError : ""
              }`}
              required
              autoComplete="email"
            />
            {errors.workEmail && (
              <span className={styles.errorMessage}>{errors.workEmail}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mobileNumber" className={styles.label}>
              {" "}
              Mobile Number <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={data?.mobileNumber || ""}
              onChange={handleInputChange}
              placeholder="e.g., +91 98765 43210"
              className={`${styles.input} ${
                errors.mobileNumber ? styles.inputError : ""
              }`}
              required
              autoComplete="tel"
            />
            {errors.mobileNumber && (
              <span className={styles.errorMessage}>{errors.mobileNumber}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="employeeType" className={styles.label}>
              {" "}
              Employee Type <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <Select
              inputId="employeeType"
              name="employeeType"
              options={employeeTypeOptions}
              value={selectedEmployeeTypeOption}
              onChange={(s) => handleSelectChange("employeeType", s)}
              styles={customSelectStyles}
              placeholder="Select Employee Type"
              classNamePrefix="react-select"
              className={getSelectWrapperClass("employeeType")}
              isClearable
              aria-label="Select Employee Type"
            />
            {errors.employeeType && (
              <span className={styles.errorMessage}>{errors.employeeType}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="workLocation" className={styles.label}>
              {" "}
              Work Location <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <Select
              inputId="workLocation"
              name="workLocation"
              options={locationOptions}
              value={selectedLocationOption}
              onChange={(s) => handleSelectChange("workLocation", s)}
              styles={customSelectStyles}
              placeholder="Select or Add Location"
              classNamePrefix="react-select"
              className={getSelectWrapperClass("workLocation")}
              isClearable
              isLoading={isLoadingReferenceData}
              isDisabled={isLoadingReferenceData}
              aria-label="Select or Add Work Location"
            />
            {errors.workLocation && (
              <span className={styles.errorMessage}>{errors.workLocation}</span>
            )}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.label}>
              {" "}
              Department <span className={styles.requiredAsterisk}>*</span>{" "}
            </label>
            <Select
              inputId="department"
              name="department"
              options={departmentOptions}
              value={selectedDepartmentOption}
              onChange={(s) => handleSelectChange("department", s)}
              styles={customSelectStyles}
              placeholder="Select or Add Department"
              classNamePrefix="react-select"
              className={getSelectWrapperClass("department")}
              isClearable
              aria-label="Select or Add Department"
            />
            {errors.department && (
              <span className={styles.errorMessage}>{errors.department}</span>
            )}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="designation" className={styles.label}>
              {" "}
              Designation <span className={styles.requiredAsterisk}>
                *
              </span>{" "}
            </label>
            <Select
              inputId="designation"
              name="designation"
              options={designationOptions}
              value={selectedDesignationOption}
              onChange={(s) => handleSelectChange("designation", s)}
              styles={customSelectStyles}
              placeholder={
                !selectedDepartmentId
                  ? "Select Department First"
                  : "Select or Add Designation"
              }
              classNamePrefix="react-select"
              className={getSelectWrapperClass("designation")}
              isClearable
              isDisabled={!selectedDepartmentId}
              aria-label="Select or Add Designation"
            />
            {errors.designation && (
              <span className={styles.errorMessage}>{errors.designation}</span>
            )}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              {" "}
              Cancel{" "}
            </button>
          )}
          <button type="submit" className={styles.nextButton}>
            {" "}
            Save & Continue{" "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicDetailsForm;
