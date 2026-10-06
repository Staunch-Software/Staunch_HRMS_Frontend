// ShiftRotationCalendarSetup.js
import React, { useState } from 'react';
import Select from 'react-select'; // Assuming you might use react-select again
import styles from './AttendanceRulesContent.module.css'; // Reuse styles for consistency

const initialShiftSetup = {
  enableShiftScheduling: false,
  enableCalendarManagement: false,
  shiftAllowanceType: 'None', // None, Fixed, Dynamic
  fixedAllowanceAmount: 0,
  dynamicAllowanceDetails: '', // Placeholder for complex rules
  allowMultiplePunches: true,
  duplicatePunchHandling: 'Ignore', // Ignore, Flag, Auto-correct
};

const shiftAllowanceOptions = [
    { value: 'None', label: 'No Shift Allowance' },
    { value: 'Fixed', label: 'Fixed Amount' },
    { value: 'Dynamic', label: 'Dynamic (Based on Rules)' },
];

const duplicatePunchOptions = [
    { value: 'Ignore', label: 'Ignore Duplicates' },
    { value: 'Flag', label: 'Flag Error for Duplicates' },
    { value: 'Auto-correct', label: 'Attempt Auto-correction' },
];

// Reusing react-select styles if needed
const customSelectStyles = {
  option: (provided, state) => ({ ...provided, paddingTop: "10px", paddingBottom: "10px", fontSize: "0.9rem", backgroundColor: state.isSelected ? "#007bff" : state.isFocused ? "#e9ecef" : "#fff", color: state.isSelected ? "#fff" : "#495057", cursor: "pointer", minHeight: "40px", display: "flex", alignItems: "center", fontWeight: "normal", }),
  control: (provided, state) => ({ ...provided, minHeight: "40px", height: "40px", borderColor: state.isFocused ? "#86b7fe" : "#ced4da", boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)" : null, '&:hover': { borderColor: state.isFocused ? "#86b7fe" : "#adb5bd", }, }),
  placeholder: (provided) => ({ ...provided, color: "#adb5bd", fontSize: "0.9rem" }),
  input: (provided) => ({ ...provided, height: 'auto', paddingTop: '0', paddingBottom: '0', margin: '0', fontSize: "0.9rem", color: "#495057", }),
  singleValue: (provided) => ({ ...provided, color: '#495057', fontSize: "0.9rem", }),
  menu: (provided) => ({ ...provided, zIndex: 4, border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '6px', }),
  menuList: (provided) => ({ ...provided, paddingTop: '4px', paddingBottom: '4px', scrollbarWidth: "thin", scrollbarColor: "#adb5bd #f8f9fa", '&::-webkit-scrollbar': { width: "6px", }, '&::-webkit-scrollbar-track': { background: "#f8f9fa", borderRadius: '6px', }, '&::-webkit-scrollbar-thumb': { backgroundColor: "#adb5bd", borderRadius: '6px', } }),
};


const ShiftRotationCalendarSetup = () => {
  const [shiftSetup, setShiftSetup] = useState(initialShiftSetup);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    if (type === 'number') { newValue = value === '' ? '' : Number(value); }

    setShiftSetup(prevData => {
      const updatedData = { ...prevData, [name]: newValue };
       // Reset fixed amount if allowance type changes from Fixed
      if (name === 'shiftAllowanceType' && prevData.shiftAllowanceType === 'Fixed' && newValue !== 'Fixed') {
        updatedData.fixedAllowanceAmount = 0;
      }
       // Reset dynamic details if type changes from Dynamic
      if (name === 'shiftAllowanceType' && prevData.shiftAllowanceType === 'Dynamic' && newValue !== 'Dynamic') {
        updatedData.dynamicAllowanceDetails = '';
      }
      return updatedData;
    });
  };

   const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    const value = selectedOption ? selectedOption.value : '';
     setShiftSetup(prevData => {
        const updatedData = {...prevData, [name]: value};
        // Reset fields conditionally based on the select change
        if (name === 'shiftAllowanceType' && prevData.shiftAllowanceType === 'Fixed' && value !== 'Fixed') {
            updatedData.fixedAllowanceAmount = 0;
        }
        if (name === 'shiftAllowanceType' && prevData.shiftAllowanceType === 'Dynamic' && value !== 'Dynamic') {
            updatedData.dynamicAllowanceDetails = '';
        }
        return updatedData;
     });
  };

   const handleSaveChanges = (e) => {
      e.preventDefault();
      console.log("Saving Shift Setup Rules:", shiftSetup);
      alert("Shift Setup Rules Saved (Simulated)!");
  };

   const getSelectedValue = (options, value) => {
    return options.find(option => option.value === value);
   };

  return (
    <div className={styles.rulesContainer}>
      <form onSubmit={handleSaveChanges}>
        <section className={styles.formSection}>
          <h4>Shift Rotation & Calendar Setup</h4>

          <div className={styles.subSection}>
            <h5>1. Shift Scheduling</h5>
             <div className={styles.formGroupCheckbox}>
                 <input type="checkbox" id="enableShiftScheduling" name="enableShiftScheduling" checked={shiftSetup.enableShiftScheduling} onChange={handleInputChange} className={styles.checkboxInput}/>
                 <label htmlFor="enableShiftScheduling">Enable Shift Scheduling Feature</label>
             </div>
             {shiftSetup.enableShiftScheduling && (
                <p className={styles.infoText}>
                    Define specific shift timings (e.g., Morning, Evening, Night) and assign them to employees or departments.
                    <button type="button" className={`${styles.linkButton} ${styles.manageButton}`} disabled>Manage Shifts</button>
                </p>
             )}
             {!shiftSetup.enableShiftScheduling && (
                 <p className={styles.infoText}>Shift scheduling is disabled. Employees follow standard or fixed timings.</p>
             )}
          </div>

          <div className={styles.subSection}>
            <h5>2. Calendar Management</h5>
             <div className={styles.formGroupCheckbox}>
                 <input type="checkbox" id="enableCalendarManagement" name="enableCalendarManagement" checked={shiftSetup.enableCalendarManagement} onChange={handleInputChange} className={styles.checkboxInput}/>
                 <label htmlFor="enableCalendarManagement">Enable Advanced Shift Calendar / Roster Management</label>
             </div>
             {shiftSetup.enableCalendarManagement && (
                <p className={styles.infoText}>
                    Allows HR/Admins to plan and assign shifts in advance using a calendar view.
                    <button type="button" className={`${styles.linkButton} ${styles.manageButton}`} disabled>View/Manage Roster</button>
                </p>
             )}
             {!shiftSetup.enableCalendarManagement && (
                 <p className={styles.infoText}>Standard calendar views apply.</p>
             )}
          </div>

           <div className={styles.subSection}>
               <h5>3. Shift Allowance</h5>
               <div className={styles.formGrid}>
                   <div className={styles.formGroup}>
                       <label htmlFor="shiftAllowanceType">Allowance Type</label>
                       <Select
                           id="shiftAllowanceType"
                           name="shiftAllowanceType"
                           options={shiftAllowanceOptions}
                           styles={customSelectStyles}
                           value={getSelectedValue(shiftAllowanceOptions, shiftSetup.shiftAllowanceType)}
                           onChange={handleSelectChange}
                           placeholder="Select Allowance Type..."
                           classNamePrefix="react-select"
                       />
                   </div>
                   {shiftSetup.shiftAllowanceType === 'Fixed' && (
                       <div className={styles.formGroup}>
                           <label htmlFor="fixedAllowanceAmount">Fixed Allowance Amount</label>
                           <input
                               type="number"
                               id="fixedAllowanceAmount"
                               name="fixedAllowanceAmount"
                               min="0"
                               step="0.01"
                               value={shiftSetup.fixedAllowanceAmount}
                               onChange={handleInputChange}
                               className={styles.inputField}
                           />
                       </div>
                   )}
                   {shiftSetup.shiftAllowanceType === 'Dynamic' && (
                       <div className={styles.formGroup}>
                          <label htmlFor="dynamicAllowanceDetails">Dynamic Rule Details</label>
                          <textarea
                               id="dynamicAllowanceDetails"
                               name="dynamicAllowanceDetails"
                               value={shiftSetup.dynamicAllowanceDetails}
                               onChange={handleInputChange}
                               rows={3}
                               className={styles.inputField}
                               placeholder="Describe dynamic rules (e.g., based on shift type, hours, grade)... Configuration might be needed elsewhere."
                           />
                       </div>
                   )}
               </div>
          </div>

          <div className={styles.subSection}>
            <h5>4. Multiple Punches Per Day</h5>
             <div className={styles.formGroupCheckbox}>
                 <input type="checkbox" id="allowMultiplePunches" name="allowMultiplePunches" checked={shiftSetup.allowMultiplePunches} onChange={handleInputChange} className={styles.checkboxInput}/>
                 <label htmlFor="allowMultiplePunches">Allow Multiple Check-ins/Check-outs Per Day (e.g., for breaks, split shifts)</label>
             </div>
          </div>

          <div className={styles.subSection}>
            <h5>5. Duplicate Punch Handling</h5>
             <div className={styles.formGroup}>
                 <label htmlFor="duplicatePunchHandling">How to Handle Duplicate Punches</label>
                 <Select
                     id="duplicatePunchHandling"
                     name="duplicatePunchHandling"
                     options={duplicatePunchOptions}
                     styles={customSelectStyles}
                     value={getSelectedValue(duplicatePunchOptions, shiftSetup.duplicatePunchHandling)}
                     onChange={handleSelectChange}
                     placeholder="Select Handling Method..."
                     classNamePrefix="react-select"
                 />
             </div>
          </div>

        </section>

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveButton}>Save Shift Rules</button>
        </div>
      </form>
    </div>
  );
};

export default ShiftRotationCalendarSetup;