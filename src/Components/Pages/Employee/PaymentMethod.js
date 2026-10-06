// src/Components/Pages/Employee/Forms/PaymentMethodForm.js
import React, { useState } from 'react';
import styles from './AddEmployeeFlow.module.css'; // Use common styles

const PaymentMethodForm = ({ data, updateData, onSubmit, onBack }) => {
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateData(name, value);
         // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        let tempErrors = {};
        if (!data.bankName) tempErrors.bankName = "Bank Name is required.";
        if (!data.accountHolderName) tempErrors.accountHolderName = "Account Holder Name is required.";
        if (!data.accountNumber) tempErrors.accountNumber = "Account Number is required.";
         // Basic validation example - can be improved
        else if (!/^[0-9]+$/.test(data.accountNumber)) tempErrors.accountNumber = "Account Number should only contain digits.";
        if (!data.ifscCode) tempErrors.ifscCode = "IFSC Code is required.";
        // Basic IFSC format check (example - needs refinement for real-world use)
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode.toUpperCase())) tempErrors.ifscCode = "IFSC Code format seems incorrect.";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmitClick = () => {
        if (validate()) {
            onSubmit(); // Call parent's final submit handler
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Payment Information</h2>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                {/* --- Bank Details --- */}
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="bankName" className={styles.label}>Bank Name <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" id="bankName" name="bankName" value={data.bankName} onChange={handleInputChange} className={styles.input} />
                        {errors.bankName && <span className={styles.errorMessage}>{errors.bankName}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="accountHolderName" className={styles.label}>Account Holder Name <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" id="accountHolderName" name="accountHolderName" value={data.accountHolderName} onChange={handleInputChange} className={styles.input} />
                        {errors.accountHolderName && <span className={styles.errorMessage}>{errors.accountHolderName}</span>}
                    </div>
                </div>
                <div className={styles.formRow}>
                     <div className={styles.formGroup}>
                        <label htmlFor="accountNumber" className={styles.label}>Account Number <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" // Use text to avoid issues with leading zeros if any
                               id="accountNumber" name="accountNumber"
                               value={data.accountNumber} onChange={handleInputChange}
                               className={styles.input}
                        />
                         {errors.accountNumber && <span className={styles.errorMessage}>{errors.accountNumber}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ifscCode" className={styles.label}>IFSC Code <span className={styles.requiredAsterisk}>*</span></label>
                        <input type="text" id="ifscCode" name="ifscCode" value={data.ifscCode} onChange={handleInputChange} className={styles.input} style={{ textTransform: 'uppercase' }} /* Suggest uppercase */ />
                         {errors.ifscCode && <span className={styles.errorMessage}>{errors.ifscCode}</span>}
                    </div>
                </div>

                {/* --- Buttons --- */}
                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.backButton} onClick={onBack}>
                        Back
                    </button>
                    <button type="button" className={styles.submitButton} onClick={handleSubmitClick}>
                        Submit Employee Details
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethodForm;