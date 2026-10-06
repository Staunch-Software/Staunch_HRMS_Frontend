import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { useDepartments } from '../../../Contexts/DepartmentContext';
import styles from './AddDesignation.module.css';

const AddDesignation = () => {
    const { departments, addDesignation } = useDepartments();
    const navigate = useNavigate();
    const location = useLocation();

    const [designationName, setDesignationName] = useState('');
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(location.state?.departmentId || '');
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const departmentOptions = useMemo(() => {
        if (!departments || departments.length === 0) {
            return [{ value: '', label: 'No departments available', isDisabled: true }];
        }
        return (departments || [])
            .map(dept => ({
                value: dept.id,
                label: `${dept.name} (${dept.code})`
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [departments]);

    const handleNameChange = (e) => {
        setDesignationName(e.target.value);
        if (formErrors.designationName) {
            setFormErrors(prev => ({ ...prev, designationName: null }));
        }
    };

    const handleDepartmentChange = (selectedOption) => {
        setSelectedDepartmentId(selectedOption ? selectedOption.value : '');
        if (formErrors.departmentId) {
            setFormErrors(prev => ({ ...prev, departmentId: null }));
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!designationName.trim()) {
            tempErrors.designationName = 'Designation name cannot be empty.';
        } else if (designationName.length > 100) {
            tempErrors.designationName = 'Designation name cannot exceed 100 characters.';
        }

        if (!selectedDepartmentId) {
            tempErrors.departmentId = 'Please select the department this designation belongs to.';
        }
        setFormErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) {
            console.log("Validation failed:", formErrors);
            return;
        }

        try {
            const designationData = {
                name: designationName.trim(),
                departmentId: selectedDepartmentId
            };

            console.log("Submitting designation data:", designationData);

            addDesignation(designationData);

            navigate('/app/designation');
        } catch (err) {
            console.error("Error adding designation:", err);
            setError(err.message || "Failed to add designation. Please check the console.");
        }
    };

    const selectedDepartmentOption = departmentOptions.find(opt => opt.value === selectedDepartmentId) || null;

    const customSelectStyles = {
        option: (provided, state) => ({
            ...provided, paddingTop: '10px', paddingBottom: '10px', fontSize: '0.95rem', backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : '#fff', color: state.isSelected ? '#fff' : '#333', cursor: 'pointer', minHeight: '40px', display: 'flex', alignItems: 'center',
        }),
        control: (provided, state) => ({
            ...provided, minHeight: '40px', height: '40px', borderColor: formErrors.departmentId ? 'red' : state.isFocused ? '#007bff' : '#ccc', boxShadow: formErrors.departmentId ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px #007bff' : null,
            '&:hover': { borderColor: formErrors.departmentId ? 'red' : state.isFocused ? '#007bff' : '#aaa' },
        }),
        placeholder: (provided) => ({ ...provided, color: '#999' }),
        menu: (provided) => ({ ...provided, zIndex: 5 }),
    };

    const getSelectWrapperClass = (fieldName) => {
        return formErrors[fieldName] ? styles.selectError : '';
    };

    return (
        <div className={styles.formContainer}>
            <h2>Add New Designation</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <p className={`${styles.errorMessage} ${styles.generalError}`}>{error}</p>}

                <div className={styles.formGroup}></div>

                {/* Department Selection Dropdown */}
                <div className={styles.formGroup}>
                    <label htmlFor="departmentId" className={styles.label}>
                        Department <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <Select
                        inputId="departmentId"
                        name="departmentId"
                        options={departmentOptions}
                        value={selectedDepartmentOption}
                        onChange={handleDepartmentChange}
                        styles={customSelectStyles}
                        placeholder="Select Department..."
                        classNamePrefix="react-select"
                        className={getSelectWrapperClass('departmentId')} 
                        aria-label="Select Department"
                        isClearable
                    />
                    {formErrors.departmentId && <span className={styles.errorMessage}>{formErrors.departmentId}</span>}
                </div>

                {/* Designation Name Input */}
                <div className={styles.formGroup}>
                    <label htmlFor="designationName" className={styles.label}>
                        Designation Name <span className={styles.requiredAsterisk}>*</span>
                    </label>
                    <input
                        type="text"
                        id="designationName"
                        name="designationName" 
                        value={designationName}
                        onChange={handleNameChange}
                        className={`${styles.input} ${formErrors.designationName ? styles.inputError : ''}`}
                        placeholder="e.g., Senior Software Engineer"
                        maxLength={100} 
                        autoFocus 
                    />
                     {formErrors.designationName && <span className={styles.errorMessage}>{formErrors.designationName}</span>}
                </div>

                {/* Action Buttons */}
                 <div className={styles.buttonGroup}>
                     <button
                        type="button" 
                        className={styles.cancelButton}
                        onClick={() => navigate('/app/designation')} // Or navigate(-1)
                     >
                        Cancel
                    </button>
                    {/* Submit Button */}
                     <button type="submit" className={styles.submitButton} >
                        Add Designation
                    </button>
                 </div>
            </form>
        </div>
    );
};

export default AddDesignation;