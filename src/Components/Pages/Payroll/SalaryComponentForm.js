import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import styles from "./SalaryComponentsPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const defaultComponentBase = {
  id: null,
  name: "",
  code: "",
  status: true,
  description: "",
  payslipOrder: null,
};
const defaultEarning = {
  ...defaultComponentBase,
  componentType: "Earning",
  earningSubType: "",
  isTaxable: "",
  taxSection: "",
  calculationMethod: "",
  value: "",
  affectsPF: false,
  affectsESI: false,
  isProrated: true,
  isRecurring: true,
};
const defaultDeduction = {
  ...defaultComponentBase,
  componentType: "Deduction",
  deductionSubType: "",
  statutoryType: "",
  calculationMethod: "",
  value: "",
  roundingRule: "",
};
const defaultReimbursement = {
  ...defaultComponentBase,
  componentType: "Reimbursement",
  isTaxable: "",
  taxSection: "",
  proofRequired: true,
  claimLimitType: "",
  claimLimitAmount: null,
};

const earningSubTypesRaw = ["Fixed Pay", "Variable Pay", "Allowance", "Bonus"];
const deductionSubTypesRaw = [
  "Statutory",
  "Voluntary",
  "Loan Repayment",
  "Other",
];
const calculationMethodsRaw = [
  "Fixed Amount",
  "Percentage/Formula",
  "Based on Attendance/Input",
  "Slab Based",
];
const taxableOptionsRaw = ["Yes", "No", "Partially Exempt", "Conditional"];
const statutoryTypesRaw = ["PF", "ESI", "PT", "TDS", "LWF", "Other"];
const roundingRulesRaw = [
  "None",
  "Nearest Rupee",
  "Upper Rupee",
  "Lower Rupee",
];
const claimLimitTypesRaw = ["None", "Per Claim", "Monthly", "Annually"];

const mapToOptions = (arr) => arr.map((item) => ({ value: item, label: item }));

const findOption = (options, value) => {
    if (!Array.isArray(options) || value == null || value === "") return null;
    return options.find(option => option.value === value) || null;
};


const SalaryComponentForm = ({
  initialData,
  componentTypeToAdd,
  onSave,
  onCancel,
  mode,
  existingCodes = [],
}) => {
  const initializeFormData = (data, typeToAdd) => {
    const effectiveType = data?.componentType || typeToAdd || "Earning";
    const defaultStructure =
      effectiveType === "Earning"
        ? defaultEarning
        : effectiveType === "Deduction"
        ? defaultDeduction
        : effectiveType === "Reimbursement"
        ? defaultReimbursement
        : defaultEarning;

    const base = { ...defaultStructure };
    if (data) {
      for (const key in base) {
          if (data.hasOwnProperty(key)) {
            if (typeof base[key] === 'boolean') {
                base[key] = data[key] === true;
            } else if (data[key] !== null && data[key] !== undefined) {
                base[key] = data[key];
            }
          }
      }
      base.value =
        data.value !== null && data.value !== undefined
          ? String(data.value)
          : "";
      base.payslipOrder =
        data.payslipOrder !== null && data.payslipOrder !== undefined
          ? String(data.payslipOrder)
          : "";
      base.claimLimitAmount =
        data.claimLimitAmount !== null && data.claimLimitAmount !== undefined
          ? String(data.claimLimitAmount)
          : "";
    } else if (typeToAdd) {
      base.componentType = typeToAdd;
    }
    return base;
  };

  const [formData, setFormData] = useState(
    initializeFormData(initialData, componentTypeToAdd)
  );
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setFormData(
      initializeFormData(
        initialData,
        initialData?.componentType || componentTypeToAdd
      )
    );
    setFormErrors({});
  }, [initialData, componentTypeToAdd]);

  const earningSubTypeOptions = useMemo(() => mapToOptions(earningSubTypesRaw), []);
  const deductionSubTypeOptions = useMemo(() => mapToOptions(deductionSubTypesRaw), []);
  const calculationMethodOptions = useMemo(() => mapToOptions(calculationMethodsRaw), []);
  const taxableOptionsMapped = useMemo(() => mapToOptions(taxableOptionsRaw), []);
  const statutoryTypeOptions = useMemo(() => [{ value: "", label: "-- Select --", isDisabled: true }, ...mapToOptions(statutoryTypesRaw)], []);
  const roundingRuleOptions = useMemo(() => mapToOptions(roundingRulesRaw), []);
  const claimLimitTypeOptions = useMemo(() => mapToOptions(claimLimitTypesRaw), []);

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      paddingTop: '10px',
      paddingBottom: '10px',
      fontSize: '0.95rem',
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : '#fff',
      color: state.isSelected ? '#fff' : '#333',
      cursor: state.isDisabled ? 'not-allowed' : 'pointer',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
    }),
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      borderColor: formErrors[state.selectProps.name]
          ? 'red'
          : state.isFocused
          ? '#007bff'
          : '#ccc',
      boxShadow: formErrors[state.selectProps.name]
          ? '0 0 0 1px red'
          : state.isFocused
          ? '0 0 0 1px #007bff'
          : null,
      '&:hover': {
          borderColor: formErrors[state.selectProps.name]
              ? 'red'
              : state.isFocused
              ? '#007bff'
              : '#aaa',
      },
      outline: 'none',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#999',
    }),
    input: (provided, state) => ({
        ...provided,
        margin: '0px',
        padding: '0px',
        outline: 'none !important',
        boxShadow: 'none !important',
        border: '0 !important',
        borderColor: 'transparent !important',
        backgroundColor: 'transparent !important',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 5,
      border: '1px solid #e0e0e0',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      scrollbarWidth: 'none',
      '&::-webkit-scrollbar': {
          width: '0px',
      },
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '38px',
        padding: '0 14px',
        alignItems: 'center',
        overflow: 'hidden',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '38px',
    }),
  };

  const handleChange = (eOrOption, actionMeta) => {
    let name, value, type, checked;

    if (eOrOption && typeof eOrOption === 'object' && 'target' in eOrOption) {
      ({ name, value, type, checked } = eOrOption.target);
      value = type === 'checkbox' ? checked : value;
       if (name === "status" && type === 'radio') {
           value = value === 'true';
       }
       if (name === "proofRequired" && type === 'radio') {
           value = value === 'true';
       }

    } else if (actionMeta && actionMeta.name) {
       name = actionMeta.name;
       value = eOrOption ? eOrOption.value : "";
    } else {
       console.warn("Unhandled change input:", eOrOption, actionMeta);
       return;
    }

    if (name === "name" && mode === "add") {
      const suggestedCode = value
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_")
        .substring(0, 15);
      setFormData((prev) => ({ ...prev, name: value, code: suggestedCode }));
      if (formErrors.name || formErrors.code) {
          setFormErrors(prev => ({ ...prev, name: null, code: null }));
      }
      return;
    }

    setFormData((prev) => {
      let newState = { ...prev, [name]: value };

      if (name === "deductionSubType" && value !== "Statutory") {
        newState.statutoryType = "";
      }
      if (name === "isTaxable" && (value === "Yes" || value === "No")) {
        newState.taxSection = "";
      }
      if (name === "claimLimitType" && value === "None") {
        newState.claimLimitAmount = "";
      }
      if (name === "calculationMethod" && value === "Based on Attendance/Input") {
          newState.value = "";
      }
       if (name === "calculationMethod" && value === "Slab Based") {
          newState.value = "";
      }

      return newState;
    });

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };


  const validateForm = () => {
    let errors = {};
    const currentData = formData;

    if (!currentData.name?.trim()) errors.name = "Component Name is required.";
    if (!currentData.code?.trim()) errors.code = "Component Code is required.";
    else {
        const currentId = currentData.id;
        if (
          existingCodes
            .filter((c) => c.id !== currentId)
            .some((c) => c.code.toUpperCase() === currentData.code.toUpperCase())
        ) {
          errors.code = `Component Code '${currentData.code}' already exists.`;
        }
    }

    if (currentData.componentType === "Earning") {
      if (!currentData.earningSubType) errors.earningSubType = "Earning Sub-Type is required.";
      if (!currentData.isTaxable) errors.isTaxable = "Taxability is required.";
      if (
        (currentData.isTaxable === "Partially Exempt") &&
        !currentData.taxSection?.trim()
      ) {
        errors.taxSection = "Tax Exemption Section/Rule is required.";
      }
      if (!currentData.calculationMethod) errors.calculationMethod = "Calculation Method is required.";
      if (
        currentData.calculationMethod === "Percentage/Formula" &&
        !currentData.value?.trim()
      ) {
        errors.value = "Formula is required for this calculation method.";
      }
       if (currentData.calculationMethod === "Fixed Amount" && currentData.value && isNaN(parseFloat(currentData.value))) {
         errors.value = "Default Amount must be a valid number.";
       }
    } else if (currentData.componentType === "Deduction") {
      if (!currentData.deductionSubType) errors.deductionSubType = "Deduction Sub-Type is required.";
      if (currentData.deductionSubType === "Statutory" && !currentData.statutoryType) {
        errors.statutoryType = "Statutory Type is required for statutory deductions.";
      }
      if (!currentData.calculationMethod) errors.calculationMethod = "Calculation Method is required.";
      if (
        currentData.calculationMethod === "Percentage/Formula" &&
        !currentData.value?.trim()
      ) {
        errors.value = "Formula is required for this calculation method.";
      }
       if (currentData.calculationMethod === "Fixed Amount" && currentData.value && isNaN(parseFloat(currentData.value))) {
         errors.value = "Default Amount must be a valid number.";
       }
      if (currentData.calculationMethod === "Slab Based" && currentData.statutoryType !== "PT") {
        console.warn("Slab based config UI/validation needed for non-PT deductions.");
      }
       if (!currentData.roundingRule) errors.roundingRule = "Rounding Rule is required.";

    } else {
        if (!currentData.isTaxable) errors.isTaxable = "Taxability is required.";
        if (currentData.isTaxable === "Conditional" && !currentData.taxSection?.trim()) {
            errors.taxSection = "Exemption Rule/Section is required for Conditional taxability.";
        }
        if (!currentData.claimLimitType) errors.claimLimitType = "Claim Limit Type is required.";
        if (
            currentData.claimLimitType !== "None" &&
            (currentData.claimLimitAmount === null || currentData.claimLimitAmount === "" || isNaN(parseFloat(currentData.claimLimitAmount)) || parseFloat(currentData.claimLimitAmount) < 0)
        ) {
            errors.claimLimitAmount = "Valid positive Claim Limit Amount is required.";
        }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form validation failed:", formErrors);
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          if (element) {
              element.focus();
          }
      }
      return;
    }

    const dataToSave = { ...formData };

    dataToSave.payslipOrder = dataToSave.payslipOrder
      ? parseInt(dataToSave.payslipOrder, 10)
      : null;

    if (
      (dataToSave.componentType === "Earning" || dataToSave.componentType === "Deduction") &&
      dataToSave.calculationMethod === "Fixed Amount"
    ) {
      const numVal = parseFloat(dataToSave.value);
      dataToSave.value = isNaN(numVal) ? null : numVal;
    }

    if (dataToSave.componentType === "Reimbursement") {
      const limitAmount = parseFloat(dataToSave.claimLimitAmount);
      dataToSave.claimLimitAmount = (dataToSave.claimLimitType !== 'None' && !isNaN(limitAmount)) ? limitAmount : null;
    }

    const finalType = dataToSave.componentType;
    const baseKeys = Object.keys(defaultComponentBase);
    let allowedKeys = [...baseKeys];

    if (finalType === "Earning") {
        allowedKeys = [...allowedKeys, ...Object.keys(defaultEarning).filter(k => !baseKeys.includes(k))];
    } else if (finalType === "Deduction") {
        allowedKeys = [...allowedKeys, ...Object.keys(defaultDeduction).filter(k => !baseKeys.includes(k))];
        if(dataToSave.deductionSubType !== 'Statutory') {
            dataToSave.statutoryType = null;
        }
    } else if (finalType === "Reimbursement") {
        allowedKeys = [...allowedKeys, ...Object.keys(defaultReimbursement).filter(k => !baseKeys.includes(k))];
        if(dataToSave.claimLimitType === 'None') {
            dataToSave.claimLimitAmount = null;
        }
    }

    const cleanedDataToSave = {};
    allowedKeys.forEach(key => {
        if (dataToSave.hasOwnProperty(key)) {
             cleanedDataToSave[key] = dataToSave[key];
        }
    });

    cleanedDataToSave.status = cleanedDataToSave.status === true;
    if (finalType === 'Earning') {
        cleanedDataToSave.affectsPF = cleanedDataToSave.affectsPF === true;
        cleanedDataToSave.affectsESI = cleanedDataToSave.affectsESI === true;
        cleanedDataToSave.isProrated = cleanedDataToSave.isProrated === true;
        cleanedDataToSave.isRecurring = cleanedDataToSave.isRecurring === true;
    }
    if (finalType === 'Reimbursement') {
        cleanedDataToSave.proofRequired = cleanedDataToSave.proofRequired === true;
    }

    onSave(cleanedDataToSave);
  };

  const getSelectWrapperClass = (fieldName) => {
      return formErrors[fieldName] ? styles.selectError : "";
  };

  const generalFormError = Object.values(formErrors).find(msg => typeof msg === 'string' && msg) || "";


  return (
    <div className={styles.modalInnerContent}>
      <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
        <h3 className={styles.modalTitle}>
          {mode === "add"
            ? `Add New ${formData.componentType}`
            : `Edit ${formData.componentType}: ${initialData?.name || ""}`}
        </h3>
        {generalFormError && <p className={styles.errorTextModal}>{generalFormError}</p>}

        <fieldset className={styles.formSection}>
          <legend className={styles.sectionLegend}>Basic Information</legend>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Component Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                className={formErrors.name ? styles.inputError : ""}
                aria-invalid={!!formErrors.name}
                aria-describedby={formErrors.name ? "name-error" : undefined}
              />
              {formErrors.name && <span id="name-error" className={styles.inlineErrorText}>{formErrors.name}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="code">Component Code *</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                maxLength={15}
                style={{ textTransform: "uppercase" }}
                className={formErrors.code ? styles.inputError : ""}
                aria-invalid={!!formErrors.code}
                aria-describedby={formErrors.code ? "code-error" : undefined}
              />
               {formErrors.code && <span id="code-error" className={styles.inlineErrorText}>{formErrors.code}</span>}
              <small className={styles.helpText}>
                Unique code (A-Z, 0-9, _).
              </small>
            </div>
            <div className={styles.formGroup}>
              <label>Status</label>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="true"
                    checked={formData.status === true}
                    onChange={handleChange}
                  />{" "}
                  Active
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="false"
                    checked={formData.status === false}
                    onChange={handleChange}
                  />{" "}
                  Inactive
                </label>
              </div>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="payslipOrder">Payslip Display Order</label>
              <input
                type="number"
                id="payslipOrder"
                name="payslipOrder"
                value={formData.payslipOrder}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="e.g., 10"
                 className={formErrors.payslipOrder ? styles.inputError : ""}
                 aria-invalid={!!formErrors.payslipOrder}
                 aria-describedby={formErrors.payslipOrder ? "payslipOrder-error" : undefined}
              />
               {formErrors.payslipOrder && <span id="payslipOrder-error" className={styles.inlineErrorText}>{formErrors.payslipOrder}</span>}
              <small className={styles.helpText}>Controls position. Lower numbers appear first.</small>
            </div>
          </div>
        </fieldset>

        {formData.componentType === "Earning" && (
          <fieldset className={styles.formSection}>
            <legend className={styles.sectionLegend}>Earning Details</legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${getSelectWrapperClass('earningSubType')}`}>
                <label htmlFor="earningSubType">Earning Sub-Type *</label>
                <Select
                  inputId="earningSubType"
                  name="earningSubType"
                  options={earningSubTypeOptions}
                  value={findOption(earningSubTypeOptions, formData.earningSubType)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Sub-Type"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.earningSubType}
                  aria-describedby={formErrors.earningSubType ? "earningSubType-error" : undefined}
                />
                 {formErrors.earningSubType && <span id="earningSubType-error" className={styles.inlineErrorText}>{formErrors.earningSubType}</span>}
              </div>
              <div className={`${styles.formGroup} ${getSelectWrapperClass('isTaxable')}`}>
                <label htmlFor="isTaxable">Taxability *</label>
                <Select
                  inputId="isTaxable"
                  name="isTaxable"
                  options={taxableOptionsMapped.filter(o => o.value !== 'Conditional')}
                  value={findOption(taxableOptionsMapped, formData.isTaxable)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Taxability"
                  classNamePrefix="react-select"
                  isClearable
                   aria-invalid={!!formErrors.isTaxable}
                   aria-describedby={formErrors.isTaxable ? "isTaxable-error" : undefined}
                />
                {formErrors.isTaxable && <span id="isTaxable-error" className={styles.inlineErrorText}>{formErrors.isTaxable}</span>}
              </div>
              {(formData.isTaxable === "No" || formData.isTaxable === "Partially Exempt") && (
                <div className={styles.formGroup}>
                  <label htmlFor="taxSection">
                    Tax Exemption Section{" "}
                    {formData.isTaxable === "Partially Exempt" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    id="taxSection"
                    name="taxSection"
                    value={formData.taxSection}
                    onChange={handleChange}
                    maxLength={50}
                    className={formErrors.taxSection ? styles.inputError : ""}
                    aria-invalid={!!formErrors.taxSection}
                    aria-describedby={formErrors.taxSection ? "taxSection-error" : undefined}
                  />
                   {formErrors.taxSection && <span id="taxSection-error" className={styles.inlineErrorText}>{formErrors.taxSection}</span>}
                  <small className={styles.helpText}>E.g., Sec 10(13A)</small>
                </div>
              )}
              <div className={`${styles.formGroup} ${getSelectWrapperClass('calculationMethod')}`}>
                <label htmlFor="calculationMethod">Calculation Method *</label>
                <Select
                  inputId="calculationMethod"
                  name="calculationMethod"
                  options={calculationMethodOptions.filter(o => o.value !== 'Slab Based')}
                  value={findOption(calculationMethodOptions, formData.calculationMethod)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Method"
                  classNamePrefix="react-select"
                  isClearable
                   aria-invalid={!!formErrors.calculationMethod}
                   aria-describedby={formErrors.calculationMethod ? "calculationMethod-error" : undefined}
                />
                 {formErrors.calculationMethod && <span id="calculationMethod-error" className={styles.inlineErrorText}>{formErrors.calculationMethod}</span>}
              </div>
              {(formData.calculationMethod === "Fixed Amount" || formData.calculationMethod === "Percentage/Formula") && (
                <div
                  className={styles.formGroup}
                  style={{
                    gridColumn: formData.calculationMethod === "Percentage/Formula" ? "span 2" : "span 1",
                  }}
                >
                  <label htmlFor="value">
                    {formData.calculationMethod === "Fixed Amount" ? "Default Amount" : "Formula *"}
                  </label>
                  {formData.calculationMethod === "Fixed Amount" ? (
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="Enter amount or leave blank"
                      className={formErrors.value ? styles.inputError : ""}
                      aria-invalid={!!formErrors.value}
                      aria-describedby={formErrors.value ? "value-error" : undefined}
                    />
                  ) : (
                    <textarea
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      rows="3"
                      placeholder="e.g., 0.4 * BASIC + 0.1 * HRA_BASIC"
                      className={`${styles.formulaInput} ${formErrors.value ? styles.inputError : ""}`}
                      aria-invalid={!!formErrors.value}
                      aria-describedby={formErrors.value ? "value-error" : undefined}
                    ></textarea>
                  )}
                  {formErrors.value && <span id="value-error" className={styles.inlineErrorText}>{formErrors.value}</span>}
                  <small className={styles.helpText}>
                    {formData.calculationMethod === "Fixed Amount"
                      ? "Leave blank if specific per employee."
                      : "Use component codes (e.g., 0.4 * BASIC)."}
                  </small>
                </div>
              )}
            </div>
          </fieldset>
        )}

        {formData.componentType === "Deduction" && (
          <fieldset className={styles.formSection}>
            <legend className={styles.sectionLegend}>Deduction Details</legend>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${getSelectWrapperClass('deductionSubType')}`}>
                <label htmlFor="deductionSubType">Deduction Sub-Type *</label>
                <Select
                  inputId="deductionSubType"
                  name="deductionSubType"
                  options={deductionSubTypeOptions}
                  value={findOption(deductionSubTypeOptions, formData.deductionSubType)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Sub-Type"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.deductionSubType}
                  aria-describedby={formErrors.deductionSubType ? "deductionSubType-error" : undefined}
                />
                {formErrors.deductionSubType && <span id="deductionSubType-error" className={styles.inlineErrorText}>{formErrors.deductionSubType}</span>}
              </div>
              {formData.deductionSubType === "Statutory" && (
                <div className={`${styles.formGroup} ${getSelectWrapperClass('statutoryType')}`}>
                  <label htmlFor="statutoryType">Statutory Type *</label>
                  <Select
                    inputId="statutoryType"
                    name="statutoryType"
                    options={statutoryTypeOptions}
                    value={findOption(statutoryTypeOptions, formData.statutoryType)}
                    onChange={handleChange}
                    styles={customSelectStyles}
                    placeholder="-- Select --"
                    classNamePrefix="react-select"
                    isClearable={false}
                    aria-invalid={!!formErrors.statutoryType}
                    aria-describedby={formErrors.statutoryType ? "statutoryType-error" : undefined}
                  />
                   {formErrors.statutoryType && <span id="statutoryType-error" className={styles.inlineErrorText}>{formErrors.statutoryType}</span>}
                </div>
              )}
              <div className={`${styles.formGroup} ${getSelectWrapperClass('calculationMethod')}`}>
                <label htmlFor="calculationMethod">Calculation Method *</label>
                 <Select
                  inputId="calculationMethod"
                  name="calculationMethod"
                  options={calculationMethodOptions}
                  value={findOption(calculationMethodOptions, formData.calculationMethod)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Method"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.calculationMethod}
                  aria-describedby={formErrors.calculationMethod ? "calculationMethod-error" : undefined}
                />
                 {formErrors.calculationMethod && <span id="calculationMethod-error" className={styles.inlineErrorText}>{formErrors.calculationMethod}</span>}
              </div>
              {(formData.calculationMethod === "Fixed Amount" || formData.calculationMethod === "Percentage/Formula") && (
                <div
                  className={styles.formGroup}
                   style={{
                    gridColumn: formData.calculationMethod === "Percentage/Formula" ? "span 2" : "span 1",
                  }}
                >
                  <label htmlFor="value">
                    {formData.calculationMethod === "Fixed Amount" ? "Default Amount" : "Formula *"}
                  </label>
                   {formData.calculationMethod === "Fixed Amount" ? (
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="Enter amount or leave blank"
                      className={formErrors.value ? styles.inputError : ""}
                      aria-invalid={!!formErrors.value}
                      aria-describedby={formErrors.value ? "value-error" : undefined}
                    />
                  ) : (
                    <textarea
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      rows="3"
                      placeholder="e.g., 0.12 * PF_WAGES"
                      className={`${styles.formulaInput} ${formErrors.value ? styles.inputError : ""}`}
                      aria-invalid={!!formErrors.value}
                      aria-describedby={formErrors.value ? "value-error" : undefined}
                    ></textarea>
                  )}
                   {formErrors.value && <span id="value-error" className={styles.inlineErrorText}>{formErrors.value}</span>}
                  <small className={styles.helpText}>
                     {formData.calculationMethod === "Fixed Amount"
                      ? "Leave blank if specific per employee."
                      : "Use codes (e.g., 0.12 * PF_WAGES)."}
                  </small>
                </div>
              )}
              {formData.calculationMethod === "Slab Based" && (
                <div className={styles.formGroup} style={{ gridColumn: "span 2" }}>
                  <label>Slab Configuration</label>
                  <div className={styles.slabPlaceholder}>
                    <FontAwesomeIcon icon={faInfoCircle} />{" "}
                    {formData.statutoryType === "PT"
                      ? "PT slabs are configured per state in Payroll Settings."
                      : "Custom slab configuration UI needed here or link to settings."}
                  </div>
                </div>
              )}
              <div className={`${styles.formGroup} ${getSelectWrapperClass('roundingRule')}`}>
                 <label htmlFor="roundingRule">Rounding Rule *</label>
                 <Select
                  inputId="roundingRule"
                  name="roundingRule"
                  options={roundingRuleOptions}
                  value={findOption(roundingRuleOptions, formData.roundingRule)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Rule"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.roundingRule}
                  aria-describedby={formErrors.roundingRule ? "roundingRule-error" : undefined}
                />
                {formErrors.roundingRule && <span id="roundingRule-error" className={styles.inlineErrorText}>{formErrors.roundingRule}</span>}
              </div>
            </div>
          </fieldset>
        )}

        {formData.componentType === "Reimbursement" && (
          <fieldset className={styles.formSection}>
             <legend className={styles.sectionLegend}>Reimbursement Details</legend>
             <div className={styles.formGrid}>
               <div className={`${styles.formGroup} ${getSelectWrapperClass('isTaxable')}`}>
                <label htmlFor="isTaxable">Taxability *</label>
                <Select
                  inputId="isTaxable"
                  name="isTaxable"
                  options={taxableOptionsMapped.filter(o => o.value !== 'Partially Exempt')}
                  value={findOption(taxableOptionsMapped, formData.isTaxable)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Taxability"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.isTaxable}
                  aria-describedby={formErrors.isTaxable ? "isTaxable-error" : undefined}
                />
                 {formErrors.isTaxable && <span id="isTaxable-error" className={styles.inlineErrorText}>{formErrors.isTaxable}</span>}
                <small className={styles.helpText}>
                  Conditional: Taxable only if proofs not submitted.
                </small>
               </div>
              {(formData.isTaxable === "No" || formData.isTaxable === "Conditional") && (
                <div className={styles.formGroup}>
                  <label htmlFor="taxSection">
                    Exemption Rule/Section{" "}
                    {formData.isTaxable === "Conditional" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    id="taxSection"
                    name="taxSection"
                    value={formData.taxSection}
                    onChange={handleChange}
                    maxLength={50}
                    className={formErrors.taxSection ? styles.inputError : ""}
                    aria-invalid={!!formErrors.taxSection}
                    aria-describedby={formErrors.taxSection ? "taxSection-error" : undefined}
                  />
                  {formErrors.taxSection && <span id="taxSection-error" className={styles.inlineErrorText}>{formErrors.taxSection}</span>}
                  <small className={styles.helpText}>E.g., Rule 2BB, Sec 10(5)</small>
                </div>
              )}
              <div className={styles.formGroup}>
                 <label>Proof Required?</label>
                 <div className={styles.radioGroup}>
                     <label>
                      <input type="radio" name="proofRequired" value="true" checked={formData.proofRequired === true} onChange={handleChange} /> Yes
                     </label>
                     <label>
                      <input type="radio" name="proofRequired" value="false" checked={formData.proofRequired === false} onChange={handleChange}/> No
                     </label>
                 </div>
              </div>
               <div className={`${styles.formGroup} ${getSelectWrapperClass('claimLimitType')}`}>
                 <label htmlFor="claimLimitType">Claim Limit Type *</label>
                 <Select
                  inputId="claimLimitType"
                  name="claimLimitType"
                  options={claimLimitTypeOptions}
                  value={findOption(claimLimitTypeOptions, formData.claimLimitType)}
                  onChange={handleChange}
                  styles={customSelectStyles}
                  placeholder="Select Limit Type"
                  classNamePrefix="react-select"
                  isClearable
                  aria-invalid={!!formErrors.claimLimitType}
                  aria-describedby={formErrors.claimLimitType ? "claimLimitType-error" : undefined}
                />
                 {formErrors.claimLimitType && <span id="claimLimitType-error" className={styles.inlineErrorText}>{formErrors.claimLimitType}</span>}
              </div>
              {formData.claimLimitType !== "None" && (
                <div className={styles.formGroup}>
                  <label htmlFor="claimLimitAmount">Claim Limit Amount *</label>
                  <input
                    type="number"
                    id="claimLimitAmount"
                    name="claimLimitAmount"
                    value={formData.claimLimitAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter limit amount"
                    className={formErrors.claimLimitAmount ? styles.inputError : ""}
                    aria-invalid={!!formErrors.claimLimitAmount}
                    aria-describedby={formErrors.claimLimitAmount ? "claimLimitAmount-error" : undefined}
                  />
                   {formErrors.claimLimitAmount && <span id="claimLimitAmount-error" className={styles.inlineErrorText}>{formErrors.claimLimitAmount}</span>}
                </div>
              )}
             </div>
          </fieldset>
        )}

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            {mode === "add" ? "Add Component" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryComponentForm;