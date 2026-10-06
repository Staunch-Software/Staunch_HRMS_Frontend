// src/Components/Pages/Employee/Forms/SalaryDetailsForm.js
import React, { useState } from 'react';
import styles from './AddEmployeeFlow.module.css';

const SalaryDetailsForm = ({ data, updateData, onNext, onBack }) => {
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        // ... same as BasicDetailsForm ...
         const { name, value } = e.target;
         // Basic numeric validation example
         if (['basicSalary', 'allowanceA', 'allowanceB', 'deductionX'].includes(name)) {
             if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) { // Allow empty or numbers/decimals
                 updateData(name, value);
                 if (errors[name]) {
                    setErrors(prev => ({ ...prev, [name]: null }));
                 }
             } else {
                  setErrors(prev => ({ ...prev, [name]: "Please enter a valid number." }));
             }
         } else {
            updateData(name, value); // For other potential fields
            if (errors[name]) {
                 setErrors(prev => ({ ...prev, [name]: null }));
            }
         }

    };

    const validate = () => {
        let tempErrors = {};
        if (!data.basicSalary) tempErrors.basicSalary = "Basic Salary is required.";
        // Add more validations for salary fields if needed
         else if (isNaN(parseFloat(data.basicSalary))) tempErrors.basicSalary = "Basic Salary must be a number.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

     const handleNextClick = () => {
        if (validate()) {
            onNext();
        }
    };


    return (
        <div className={styles.formContainer}>
            <h2>Salary Details</h2>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                 <div className={styles.formRow}>
                     <div className={styles.formGroup}>
                        <label htmlFor="basicSalary" className={styles.label}>Basic Salary <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" /* Using text allows easier decimal input, validation handles check */
                               id="basicSalary" name="basicSalary"
                               value={data.basicSalary} onChange={handleInputChange}
                               className={`${styles.input} ${errors.basicSalary ? styles.inputError : ''}`}placeholder="e.g., 50000" />
                         {errors.basicSalary && <span className={styles.errorMessage}>{errors.basicSalary}</span>}
                     </div>
                     {/* Add groups for Allowance A, Allowance B, Deduction X similarly */}
                     <div className={styles.formGroup}>
                         <label htmlFor="allowanceA" className={styles.label}>Allowance A</label>
                         <input type="text" id="allowanceA" name="allowanceA" value={data.allowanceA} onChange={handleInputChange} className={styles.input} placeholder="e.g., 5000"/>
                         {errors.allowanceA && <span className={styles.errorMessage}>{errors.allowanceA}</span>}
                     </div>
                 </div>
                 <div className={styles.formRow}>
                     <div className={styles.formGroup}>
                         <label htmlFor="allowanceB" className={styles.label}>Allowance B</label>
                         <input type="text" id="allowanceB" name="allowanceB" value={data.allowanceB} onChange={handleInputChange} className={styles.input} placeholder="e.g., 2500"/>
                         {errors.allowanceB && <span className={styles.errorMessage}>{errors.allowanceB}</span>}
                     </div>
                     <div className={styles.formGroup}>
                         <label htmlFor="deductionX" className={styles.label}>Deduction X</label>
                         <input type="text" id="deductionX" name="deductionX" value={data.deductionX} onChange={handleInputChange} className={styles.input} placeholder="e.g., 1500"/>
                         {errors.deductionX && <span className={styles.errorMessage}>{errors.deductionX}</span>}
                     </div>
                 </div>

                 <div className={styles.buttonGroup}>
                     <button type="button" className={styles.backButton} onClick={onBack}>
                         Back
                     </button>
                     <button type="button" className={styles.nextButton} onClick={handleNextClick}>
                         Save & Continue
                     </button>
                 </div>
            </form>
        </div>
    );
};

export default SalaryDetailsForm;