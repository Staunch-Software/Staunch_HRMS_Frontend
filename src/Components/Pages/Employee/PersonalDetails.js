import React, { useState, useMemo, useEffect } from 'react';
import Select from 'react-select';
import styles from './AddEmployeeFlow.module.css';

// Options for the Differently Abled dropdown
const differentlyAbledOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
];

// --- Options for Indian States/UTs ---
const indianStatesOptions = [
    { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Chandigarh', label: 'Chandigarh' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' },
    { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Ladakh', label: 'Ladakh' },
    { value: 'Lakshadweep', label: 'Lakshadweep' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Manipur', label: 'Manipur' },
    { value: 'Meghalaya', label: 'Meghalaya' },
    { value: 'Mizoram', label: 'Mizoram' },
    { value: 'Nagaland', label: 'Nagaland' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Puducherry', label: 'Puducherry' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Sikkim', label: 'Sikkim' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Tripura', label: 'Tripura' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'West Bengal', label: 'West Bengal' }
];
// Options for Marital Status dropdown
const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
];

const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
];

// Options for Blood Group dropdown
const bloodGroupOptions = [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
    { value: 'Prefer not to say', label: 'Prefer not to say' } // Optional
];


const PersonalDetailsForm = ({ data, updateData, onNext, onBack }) => {
    const [errors, setErrors] = useState({});
    const [calculatedAge, setCalculatedAge] = useState(null);

    // --- Calculate Age based on DOB ---
    useEffect(() => {
        if (data.dob) {
            try {
                const birthDate = new Date(data.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                setCalculatedAge(age >= 0 ? age : null);
            } catch (error) {
                console.error("Error calculating age:", error);
                setCalculatedAge(null);
            }
        } else {
            setCalculatedAge(null);
        }
    }, [data.dob]);


    // --- Input Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateData(name, value);
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Generic handler for Select components
    const handleSelectChange = (fieldName, selectedOption) => {
        const value = selectedOption ? selectedOption.value : '';
        updateData(fieldName, value);
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
    };


    // --- Validation (Ensure checks match required fields in JSX) ---
    const validate = () => {
        let tempErrors = {};
        // Required fields
        if (!data.dob) tempErrors.dob = "Date of Birth is required.";
        else if (calculatedAge === null || calculatedAge < 18) {
            tempErrors.dob = "Employee must be at least 18 years old.";
        }
        // PAN is now required
        if (!data.panNumber?.trim()) { 
            tempErrors.panNumber = "PAN is required.";
        } else if (data.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber.toUpperCase())) {
            tempErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F).";
        }
        if (!data.differentlyAbled) {
             tempErrors.differentlyAbled = "Please select Differently Abled status.";
        }
        // Address Fields
        if (!data.addressLine1?.trim()) tempErrors.addressLine1 = "Address Line 1 is required.";
        if (!data.city?.trim()) tempErrors.city = "City / Town is required.";
        if (!data.state) tempErrors.state = "State is required."; // Check if state value exists
        if (!data.country?.trim()) tempErrors.country = "Country is required.";
        if (!data.postalCode?.trim()) tempErrors.postalCode = "Postal Code / ZIP Code is required.";
        if (!data.gender) tempErrors.gender = "Gender is required.";

        // Emergency Contact
        if (!data.emergencyContactName?.trim()) tempErrors.emergencyContactName = "Emergency Contact Name is required.";
        if (!data.emergencyContactRelation?.trim()) tempErrors.emergencyContactRelation = "Emergency Contact Relation is required.";
        if (!data.emergencyContactNumber?.trim()) tempErrors.emergencyContactNumber = "Emergency Contact Number is required.";
         else if (!/^\+?[0-9]{10,}$/.test(data.emergencyContactNumber.replace(/\s/g, ''))) {
             tempErrors.emergencyContactNumber = "Please enter a valid phone number.";
        }

        // Optional fields with only format validation
        if (data.personalEmail && !/\S+@\S+\.\S+/.test(data.personalEmail)) {
            tempErrors.personalEmail = "Personal Email is not valid.";
        }
        // Marital Status and Blood Group are still optional based on labels

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleNextClick = () => {
        if (validate()) {
            onNext();
        }
    };

    // --- Find selected options for react-select value prop ---
    const selectedDifferentlyAbledOption = differentlyAbledOptions.find(option => option.value === data.differentlyAbled) || null;
    const selectedMaritalStatusOption = maritalStatusOptions.find(option => option.value === data.maritalStatus) || null;
    const selectedBloodGroupOption = bloodGroupOptions.find(option => option.value === data.bloodGroup) || null;
    const selectedStateOption = indianStatesOptions.find(option => option.value === data.state) || null;
    const selectedGenderOption = genderOptions.find(option => option.value === data.gender) || null;


    // --- Custom Styles for React Select (reuse or customize) ---
    const customSelectStyles = {
        option: (provided, state) => ({
            ...provided,
            paddingTop: '10px',
            paddingBottom: '10px',
            fontSize: '0.95rem',
            backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : '#fff',
            color: state.isSelected ? '#fff' : '#333',
            cursor: 'pointer',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
        }),
        control: (provided, state) => ({
            ...provided,
            minHeight: '40px',
            height: '40px',
            borderColor: errors[state.selectProps.name] ? 'red' : state.isFocused ? '#007bff' : '#ccc',
            boxShadow: errors[state.selectProps.name] ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px #007bff' : null,
            '&:hover': {
                borderColor: errors[state.selectProps.name] ? 'red' : state.isFocused ? '#007bff' : '#aaa',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#999',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 4,
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
            '&::-webkit-scrollbar': {
                width: '0px', // Hide scrollbar for WebKit browsers (Chrome, Edge, etc.)
            },
        }),
    };

    return (
        <div className={styles.formContainer}>
        <h2>Personal Details</h2>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>

            {/* --- DOB, Age, Father's Name, PAN --- */}
            <div className={styles.formRow}>
                {/* DOB */}
                <div className={styles.formGroup}>
                    <label htmlFor="dob" className={styles.label}>Date of Birth <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="date" id="dob" name="dob" value={data.dob || ''} onChange={handleInputChange} className={`${styles.input} ${errors.dob ? styles.inputError : ''}`} max={new Date().toISOString().split("T")[0]} />
                    {errors.dob && <span className={styles.errorMessage}>{errors.dob}</span>}
                </div>
                {/* Age */}
                <div className={styles.formGroup}>
                    <label htmlFor="ageDisplay" className={styles.label}>Age</label>
                    <input type="text" id="ageDisplay" name="ageDisplay" value={calculatedAge !== null ? calculatedAge : 'N/A'} className={styles.input} readOnly disabled style={{ backgroundColor: '#e9ecef', cursor: 'default' }} />
                    {/* No error for calculated field */}
                </div>
            </div>
            <div className={styles.formRow}>
                 {/* Father's Name */}
                 <div className={styles.formGroup}>
                    <label htmlFor="fatherName" className={styles.label}>Father's Name</label>
                    <input type="text" id="fatherName" name="fatherName" value={data.fatherName || ''} onChange={handleInputChange} className={styles.input} />
                    {/* No error for optional field */}
                </div>
                 {/* PAN */}
                <div className={styles.formGroup}>
                    {/* Added Required Asterisk */}
                    <label htmlFor="panNumber" className={styles.label}>PAN <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="panNumber" name="panNumber" value={data.panNumber || ''} onChange={handleInputChange} className={`${styles.input} ${errors.panNumber ? styles.inputError : ''}`} maxLength="10" style={{ textTransform: 'uppercase' }} />
                    {/* Ensured error message exists */}
                     {errors.panNumber && <span className={styles.errorMessage}>{errors.panNumber}</span>}
                </div>
            </div>


            {/* --- Marital Status, Blood Group, Differently Abled --- */}
            <div className={styles.formRow}>
                {/* Marital Status */}
                <div className={styles.formGroup}>
                    <label htmlFor="maritalStatus" className={styles.label}>Marital Status</label>
                    <Select
                        inputId="maritalStatus" name="maritalStatus"
                        options={maritalStatusOptions}
                        value={selectedMaritalStatusOption}
                        onChange={(selected) => handleSelectChange('maritalStatus', selected)}
                        styles={customSelectStyles}
                        placeholder="Select Status"
                        classNamePrefix="react-select"
                        isClearable
                     />
                    {/* No error message needed if optional */}
                </div>
                <div className={styles.formGroup}>
                        <label htmlFor="gender" className={styles.label}>Gender<span className={styles.requiredAsterisk}>*</span></label>
                        <Select
                            inputId="gender" name="gender"
                            options={genderOptions}
                            value={selectedGenderOption}
                            onChange={(selected) => handleSelectChange('gender', selected)}
                            styles={customSelectStyles}
                            placeholder="Select Gender"
                            classNamePrefix={`react-select ${errors.gender ? 'react-select-error' : ''}`}
                            isClearable
                        />
                        {errors.gender && <span className={styles.errorMessage}>{errors.gender}</span>}
                    </div>

            </div>


            <div className={styles.formRow}>
                
                 {/* Blood Group */}
                <div className={styles.formGroup}>
                    <label htmlFor="bloodGroup" className={styles.label}>Blood Group</label>
                    <Select
                        inputId="bloodGroup" name="bloodGroup"
                        options={bloodGroupOptions}
                        value={selectedBloodGroupOption}
                        onChange={(selected) => handleSelectChange('bloodGroup', selected)}
                        styles={customSelectStyles}
                        placeholder="Select Group"
                        classNamePrefix="react-select"
                        isClearable
                     />
                     {/* No error message needed if optional */}
                </div>
                 {/* Differently Abled */}
                <div className={styles.formGroup}>
                    <label htmlFor="differentlyAbled" className={styles.label}>Differently Abled <span className={styles.requiredAsterisk}>*</span></label>
                    <Select
                        inputId="differentlyAbled" name="differentlyAbled"
                        options={differentlyAbledOptions}
                        value={selectedDifferentlyAbledOption}
                        onChange={(selected) => handleSelectChange('differentlyAbled', selected)}
                        styles={customSelectStyles}
                        placeholder="Select Status"
                        classNamePrefix="react-select"
                        isClearable
                     />
                     {/* Ensured error message exists */}
                     {errors.differentlyAbled && <span className={styles.errorMessage}>{errors.differentlyAbled}</span>}
                </div>
            </div>


            {/* --- Personal Email --- */}
            <div className={styles.formRow}>
                <div className={styles.formGroup} style={{flexGrow: 2}}> {/* Allow more space for email */}
                    <label htmlFor="personalEmail" className={styles.label}>Personal Email</label>
                    <input type="email" id="personalEmail" name="personalEmail" value={data.personalEmail || ''} onChange={handleInputChange} className={styles.input} />
                     {errors.personalEmail && <span className={styles.errorMessage}>{errors.personalEmail}</span>}
                </div>
            </div>


            {/* --- Permanent Address Fields --- */}
             <hr style={{borderColor: '#eee', margin: '20px 0'}}/>
             <h4>Permanent Address</h4>

            {/* Address Line 1 */}
            <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: '1 1 100%' }}>
                    <label htmlFor="addressLine1" className={styles.label}>
                        Address Line 1 <span className={styles.requiredAsterisk}>*</span>
                        <small style={{display: 'block', fontWeight: 'normal', color: '#888'}}>e.g., House number, street name, building/apartment number</small>
                    </label>
                    <input type="text" id="addressLine1" name="addressLine1" value={data.addressLine1 || ''} onChange={handleInputChange} className={`${styles.input} ${errors.addressLine1 ? styles.inputError : ''}`} />
                    {/* Ensured error message exists */}
                    {errors.addressLine1 && <span className={styles.errorMessage}>{errors.addressLine1}</span>}
                </div>
             </div>
             {/* Address Line 2 */}
             <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: '1 1 100%' }}>
                     <label htmlFor="addressLine2" className={styles.label}>
                        Address Line 2 <small>(optional)</small>
                        <small style={{display: 'block', fontWeight: 'normal', color: '#888'}}>e.g., Landmark, additional info</small>
                    </label>
                    <input type="text" id="addressLine2" name="addressLine2" value={data.addressLine2 || ''} onChange={handleInputChange} className={styles.input} />
                    {/* No error needed for optional */}
                </div>
             </div>
             {/* City and State */}
             <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="city" className={styles.label}>City / Town <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="city" name="city" value={data.city || ''} onChange={handleInputChange} className={`${styles.input} ${errors.city ? styles.inputError : ''}`} />
                    {/* Ensured error message exists */}
                    {errors.city && <span className={styles.errorMessage}>{errors.city}</span>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="state" className={styles.label}>State <span className={styles.requiredAsterisk}>*</span></label>
                    <Select
                        inputId="state" name="state"
                        options={indianStatesOptions}
                        value={selectedStateOption}
                        onChange={(selected) => handleSelectChange('state', selected)}
                        styles={customSelectStyles}
                        placeholder="Select State"
                        classNamePrefix="react-select"
                        isClearable
                     />
                     {/* Ensured error message exists */}
                    {errors.state && <span className={styles.errorMessage}>{errors.state}</span>}
                </div>
             </div>
             {/* Country and Postal Code */}
            <div className={styles.formRow}>
                 <div className={styles.formGroup}>
                    <label htmlFor="country" className={styles.label}>Country <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="country" name="country" value={data.country || ''} onChange={handleInputChange} className={`${styles.input} ${errors.country ? styles.inputError : ''}`} />
                    {/* Ensured error message exists */}
                    {errors.country && <span className={styles.errorMessage}>{errors.country}</span>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="postalCode" className={styles.label}>Postal Code <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="postalCode" name="postalCode" value={data.postalCode || ''} onChange={handleInputChange} className={`${styles.input} ${errors.postalCode ? styles.inputError : ''}`} />
                    {/* Ensured error message exists */}
                    {errors.postalCode && <span className={styles.errorMessage}>{errors.postalCode}</span>}
                </div>
            </div>


             <hr style={{borderColor: '#eee', margin: '20px 0'}}/>
             <h4>Emergency Contact</h4>

            {/* --- Emergency Contact --- */}
             <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="emergencyContactName" className={styles.label}>Contact Name <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="emergencyContactName" name="emergencyContactName" value={data.emergencyContactName || ''} onChange={handleInputChange} className={`${styles.input} ${errors.emergencyContactName ? styles.inputError : ''}`} />
                     {/* Ensured error message exists */}
                     {errors.emergencyContactName && <span className={styles.errorMessage}>{errors.emergencyContactName}</span>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="emergencyContactRelation" className={styles.label}>Relation <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="text" id="emergencyContactRelation" name="emergencyContactRelation" value={data.emergencyContactRelation || ''} onChange={handleInputChange} className={`${styles.input} ${errors.emergencyContactRelation ? styles.inputError : ''}`} />
                     {/* Ensured error message exists */}
                     {errors.emergencyContactRelation && <span className={styles.errorMessage}>{errors.emergencyContactRelation}</span>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="emergencyContactNumber" className={styles.label}>Contact Number <span className={styles.requiredAsterisk}>*</span></label>
                    <input type="tel" id="emergencyContactNumber" name="emergencyContactNumber" value={data.emergencyContactNumber || ''} onChange={handleInputChange} className={`${styles.input} ${errors.emergencyContactNumber ? styles.inputError : ''}`} />
                     {/* Ensured error message exists */}
                     {errors.emergencyContactNumber && <span className={styles.errorMessage}>{errors.emergencyContactNumber}</span>}
                </div>
             </div>


            {/* --- Buttons --- */}
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

export default PersonalDetailsForm;