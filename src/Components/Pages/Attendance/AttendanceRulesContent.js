   import React, { useState } from 'react';
import Select from 'react-select';
import styles from './AttendanceRulesContent.module.css'; // Using a dedicated CSS module name
import { useNavigate } from 'react-router-dom';

const initialSettingsData = {
  // Step 1
  officeTimingType: 'Fixed', fixedInTime: '09:00', fixedOutTime: '18:00',
  gracePeriodIn: 10, gracePeriodOut: 10,
  fullDayHours: 8, halfDayHoursThreshold: 4,
  workWeek: { Mon: 'Full', Tue: 'Full', Wed: 'Full', Thu: 'Full', Fri: 'Full', Sat: 'Off', Sun: 'Off', },
  autoMarkWeekends: true, autoMarkHolidays: true, holidayListName: 'Default National Holidays',
  // Step 2
  enableShiftScheduling: false, enableCalendarManagement: false, shiftAllowanceType: 'None', fixedAllowanceAmount: 0, dynamicAllowanceDetails: '', allowMultiplePunches: true, duplicatePunchHandling: 'Ignore',
  // Step 3
  enableOvertime: true, overtimeThresholdMinutes: 30, overtimeRounding: 'Nearest15', overtimeCapHoursDaily: 2, overtimeCapHoursWeekly: 10, overtimeCapHoursMonthly: 40,
  enableCompOff: true,
  enableAttendanceIncentives: false, incentiveDetails: '',
  // Step 4 Defaults (Capture & Interpretation - Added from previous request)
  enableAutoLeaveDeduction: false,
  autoDeductionPriority: [], // Use array for multi-select
  markLOPIfNoLeave: true,
  integrateWithLeaveModule: true,
  enableBiometricIntegration: false,
  biometricDeviceDetails: '',
  // --- Step 5 Defaults ---
  lateMarkThresholdMinutes: 15,
  allowedLateMarksPerMonth: 3,
  lateMarkPenalty: 'HalfDayAfter3', // None, HalfDayAfter3, LOPAfter3, Custom
  earlyDepartureThresholdMinutes: 15,
  allowedEarlyDeparturesPerMonth: 3,
  earlyDeparturePenalty: 'CombineWithLate', // None, CombineWithLate, Custom
  enableAttendanceCorrections: true,
  correctionApprovalWorkflow: 'Manager', // Manager, HR, Manager->HR
  enableWFHRemoteAttendance: true,
  wfhProofRequired: false,
  enableGeofencing: false,
  geoFenceCoordinates: '',
  geoFenceRadiusMeters: 500,
  geoFenceRequireSelfie: false,
  attendanceApprovalWorkflow: 'Manager', // Default workflow for general exceptions
  // --- End Step 5 ---
};

// --- Options ---
const workDayOptions = [ { value: 'Full', label: 'Full Day' }, { value: 'Half', label: 'Half Day' }, { value: 'Off', label: 'Week Off' }, ];
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const shiftAllowanceOptions = [ { value: 'None', label: 'No Shift Allowance' }, { value: 'Fixed', label: 'Fixed Amount' }, { value: 'Dynamic', label: 'Dynamic (Based on Rules)' }, ];
const duplicatePunchOptions = [ { value: 'Ignore', label: 'Ignore Duplicates' }, { value: 'Flag', label: 'Flag Error for Duplicates' }, { value: 'Auto-correct', label: 'Attempt Auto-correction' }, ];
const overtimeRoundingOptions = [ { value: 'None', label: 'No Rounding' }, { value: 'Nearest15', label: 'Round to Nearest 15 Minutes' }, { value: 'Floor15', label: 'Round Down to Nearest 15 Minutes' }, { value: 'Ceil15', label: 'Round Up to Nearest 15 Minutes' }, { value: 'Exact', label: 'Use Exact Time' }, ];
const leaveTypeOptionsForPriority = [ { value: 'vac', label: 'Vacation Leave' }, { value: 'sick', label: 'Sick Leave' }, { value: 'pers', label: 'Personal Leave' }, ];
const lateMarkPenaltyOptions = [
    { value: 'None', label: 'No Penalty / Warning Only' },
    { value: 'HalfDayAfterX', label: 'Mark Half-Day After X Lates' }, // X is set by allowedLateMarksPerMonth
    { value: 'LOPAfterX', label: 'Mark LOP After X Lates' },
    // Add more complex options if needed
];
const earlyDeparturePenaltyOptions = [
    { value: 'None', label: 'No Penalty / Warning Only' },
    { value: 'CombineWithLate', label: 'Combine with Late Marks for Deduction' },
     // Add more complex options if needed
];
const approvalWorkflowOptions = [ // Reusable for different approvals
    { value: 'Manager', label: 'Direct Manager Only' },
    { value: 'HR', label: 'HR Only' },
    { value: 'Manager->HR', label: 'Manager then HR' },
    { value: 'Admin', label: 'System Administrator' },
    // Add more roles/levels
];
// --- End Options ---

const customSelectStyles = {
  option: (provided, state) => ({ ...provided, paddingTop: "10px", paddingBottom: "10px", fontSize: "0.9rem", backgroundColor: state.isSelected ? "#007bff" : state.isFocused ? "#e9ecef" : "#fff", color: state.isSelected ? "#fff" : "#495057", cursor: "pointer", minHeight: "40px", display: "flex", alignItems: "center", fontWeight: "normal", }),
  control: (provided, state) => ({ ...provided, minHeight: "40px", height: "auto", borderColor: state.isFocused ? "#86b7fe" : "#ced4da", boxShadow: state.isFocused ? "0 0 0 0.10rem rgba(13, 110, 253, 0.25)" : null, '&:hover': { borderColor: state.isFocused ? "#86b7fe" : "#adb5bd", }, }),
  placeholder: (provided) => ({ ...provided, color: "#adb5bd", fontSize: "0.9rem" }),
  input: (provided) => ({ ...provided, height: 'auto', paddingTop: '0', paddingBottom: '0', margin: '0', fontSize: "0.9rem", color: "#495057", }),
  singleValue: (provided) => ({ ...provided, color: '#495057', fontSize: "0.9rem", }),
  multiValue: (provided) => ({ ...provided, backgroundColor: '#e9ecef', borderRadius: '4px' }),
  multiValueLabel: (provided) => ({ ...provided, color: '#495057', fontSize: '0.85rem' }),
  multiValueRemove: (provided) => ({ ...provided, color: '#6c757d', ':hover': { backgroundColor: '#dc3545', color: 'white',}, }),
  menu: (provided) => ({ ...provided, zIndex: 4, border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '6px', }),
  menuList: (provided) => ({ ...provided, paddingTop: '4px', paddingBottom: '4px', scrollbarWidth: "thin", scrollbarColor: "#adb5bd #f8f9fa", '&::-webkit-scrollbar': { width: "6px", }, '&::-webkit-scrollbar-track': { background: "#f8f9fa", borderRadius: '6px', }, '&::-webkit-scrollbar-thumb': { backgroundColor: "#adb5bd", borderRadius: '6px', } }),
};


const AttendanceSettingsWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialSettingsData);
  const totalSteps = 5;
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    if (type === 'number') { newValue = value === '' ? '' : Number(value); }
    setFormData(prevData => {
        const updatedData = { ...prevData, [name]: newValue };
        if (name === 'officeTimingType' && newValue !== 'Fixed') { updatedData.fixedInTime = ''; updatedData.fixedOutTime = ''; }
        if (name === 'shiftAllowanceType' && newValue !== 'Fixed') { updatedData.fixedAllowanceAmount = 0; }
        if (name === 'shiftAllowanceType' && newValue !== 'Dynamic') { updatedData.dynamicAllowanceDetails = ''; }
        if (name === 'enableOvertime' && !checked) { updatedData.overtimeThresholdMinutes = 0; updatedData.overtimeRounding = 'None'; updatedData.overtimeCapHoursDaily = 0; updatedData.overtimeCapHoursWeekly = 0; updatedData.overtimeCapHoursMonthly = 0; }
        if (name === 'enableAttendanceIncentives' && !checked) { updatedData.incentiveDetails = ''; }
        if (name === 'enableAutoLeaveDeduction' && !checked) { updatedData.autoDeductionPriority = []; updatedData.markLOPIfNoLeave = true; }
        if (name === 'enableBiometricIntegration' && !checked) { updatedData.biometricDeviceDetails = ''; }
        if (name === 'enableGeofencing' && !checked) { updatedData.geoFenceCoordinates = ''; updatedData.geoFenceRadiusMeters = 500; updatedData.geoFenceRequireSelfie = false; }
        return updatedData;
    });
  };

   const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    let value;
    if (actionMeta.action === 'select-option' || actionMeta.action === 'remove-value' || actionMeta.action === 'clear') {
        if(name === 'autoDeductionPriority'){
             value = selectedOption ? selectedOption.map(option => option.value) : [];
        } else {
             value = selectedOption ? selectedOption.value : '';
        }
    } else {
         value = selectedOption ? selectedOption.value : '';
    }
     setFormData(prevData => {
        const updatedData = {...prevData, [name]: value};
        if (name === 'shiftAllowanceType' && value !== 'Fixed') { updatedData.fixedAllowanceAmount = 0; }
        if (name === 'shiftAllowanceType' && value !== 'Dynamic') { updatedData.dynamicAllowanceDetails = ''; }
        return updatedData;
     });
  };

  const handleWorkdayChange = (day, value) => { setFormData(prevData => ({ ...prevData, workWeek: { ...prevData.workWeek, [day]: value, }, })); };
  const nextStep = () => { if (currentStep < totalSteps) { setCurrentStep(prev => prev + 1); } };
  const prevStep = () => { if (currentStep > 1) { setCurrentStep(prev => prev - 1); } };
  const handleFinalSubmit = (e) => { e.preventDefault(); console.log("Saving ALL Attendance Settings:", formData); alert("All Attendance Settings Saved (Simulated)!"); };
  const getSelectedValue = (options, value, isMulti = false) => { if (isMulti) { if (!Array.isArray(value)) return []; return options?.filter(option => value.includes(option.value)) ?? []; } return options?.find(option => option.value === value) ?? null; };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // General Rules
        return (
          <section className={styles.formSection}>
            <h4>General Attendance Rules</h4>
            <div className={styles.subSection}>
              <h5>Office Timings</h5>
              <div className={styles.radioGroup}>
                <div className={styles.radioOption}>
                  <input type="radio" id="timingFixed" name="officeTimingType" value="Fixed" checked={formData.officeTimingType === 'Fixed'} onChange={handleInputChange} className={styles.radioInput}/>
                  <label htmlFor="timingFixed">Fixed Timings</label>
                </div>
                <div className={styles.radioOption}>
                  <input type="radio" id="timingShift" name="officeTimingType" value="Shift-Based" checked={formData.officeTimingType === 'Shift-Based'} onChange={handleInputChange} className={styles.radioInput}/>
                  <label htmlFor="timingShift">Shift-Based</label>
                </div>
              </div>
              {formData.officeTimingType === 'Fixed' && (
                <div className={`${styles.formGrid} ${styles.timingGrid}`}>
                  <div className={styles.formGroup}>
                    <label htmlFor="fixedInTime">Fixed In-Time</label>
                    <input type="time" id="fixedInTime" name="fixedInTime" value={formData.fixedInTime} onChange={handleInputChange} className={styles.inputField} required={formData.officeTimingType === 'Fixed'}/>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="fixedOutTime">Fixed Out-Time</label>
                    <input type="time" id="fixedOutTime" name="fixedOutTime" value={formData.fixedOutTime} onChange={handleInputChange} className={styles.inputField} required={formData.officeTimingType === 'Fixed'}/>
                  </div>
                </div>
              )}
              {formData.officeTimingType === 'Shift-Based' && ( <p className={styles.infoText}>Enable Shift Scheduling in the next step to manage shifts.</p> )}
            </div>
            <div className={styles.subSection}>
              <h5>Grace Period</h5>
              <div className={`${styles.formGrid} ${styles.graceGrid}`}>
                <div className={styles.formGroup}>
                  <label htmlFor="gracePeriodIn">Check-In Grace Time (Minutes)</label>
                  <input type="number" id="gracePeriodIn" name="gracePeriodIn" min="0" value={formData.gracePeriodIn} onChange={handleInputChange} className={styles.inputField}/>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="gracePeriodOut">Check-Out Grace Time (Minutes)</label>
                  <input type="number" id="gracePeriodOut" name="gracePeriodOut" min="0" value={formData.gracePeriodOut} onChange={handleInputChange} className={styles.inputField}/>
                </div>
              </div>
            </div>
            <div className={styles.subSection}>
              <h5>Working Hours & Half-Day</h5>
              <div className={`${styles.formGrid} ${styles.hoursGrid}`}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullDayHours">Full-Day Working Hours</label>
                  <input type="number" id="fullDayHours" name="fullDayHours" min="0" step="0.1" value={formData.fullDayHours} onChange={handleInputChange} className={styles.inputField}/>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="halfDayHoursThreshold">Half-Day Threshold (Hours Worked Below)</label>
                  <input type="number" id="halfDayHoursThreshold" name="halfDayHoursThreshold" min="0" step="0.1" value={formData.halfDayHoursThreshold} onChange={handleInputChange} className={styles.inputField}/>
                </div>
              </div>
            </div>
            <div className={styles.subSection}>
              <h5>Work Week Configuration</h5>
              <div className={styles.workWeekGrid}>
                {daysOfWeek.map((day) => (
                  <div key={day} className={styles.formGroup}>
                    <label htmlFor={`workWeek${day}`}>{day}</label>
                    <select id={`workWeek${day}`} name={`workWeek${day}`} value={formData.workWeek[day]} onChange={(e) => handleWorkdayChange(day, e.target.value)} className={styles.inputField}>
                      {workDayOptions.map((option) => ( <option key={option.value} value={option.value}>{option.label}</option> ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.subSection}>
              <h5>Weekend & Holiday Marking</h5>
              <div className={styles.checkboxGroupContainer}>
                <div className={styles.formGroupCheckbox}>
                  <input type="checkbox" id="autoMarkWeekends" name="autoMarkWeekends" checked={formData.autoMarkWeekends} onChange={handleInputChange} className={styles.checkboxInput}/>
                  <label htmlFor="autoMarkWeekends">Auto-Mark Attendance on Defined Week Offs</label>
                </div>
                <div className={styles.formGroupCheckbox}>
                  <input type="checkbox" id="autoMarkHolidays" name="autoMarkHolidays" checked={formData.autoMarkHolidays} onChange={handleInputChange} className={styles.checkboxInput}/>
                  <label htmlFor="autoMarkHolidays">Auto-Mark Attendance on Defined Holidays</label>
                </div>
              </div>
            </div>
            {/* <div className={styles.subSection}>
              <h5>Holiday Configuration</h5>
              <div className={styles.formGroup}>
                <label>Currently Applied Holiday List</label>
                <input type="text" value={formData.holidayListName} className={styles.inputField} disabled readOnly/>
                <button type="button" className={`${styles.linkButton} ${styles.manageButton}`} disabled>Manage Holidays</button>
              </div>
            </div> */}
          </section>
        );
      case 2: // Shift Rotation & Calendar Setup
        return (
          <section className={styles.formSection}>
            <h4>Shift Rotation & Calendar Setup</h4>
            <div className={styles.subSection}>
              <h5>Shift Scheduling</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="enableShiftScheduling" name="enableShiftScheduling" checked={formData.enableShiftScheduling} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="enableShiftScheduling">Enable Shift Scheduling Feature</label>
              </div>
              {formData.enableShiftScheduling && (
                <p className={styles.infoText}>
                  Define specific shift timings and assign them.
                  <button type="button" className={`${styles.linkButton} ${styles.manageButton}`} onClick={() => navigate('/app/shift')}>Manage Shifts</button>
                </p>
              )}
            </div>
            <div className={styles.subSection}>
              <h5>Calendar Management</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="enableCalendarManagement" name="enableCalendarManagement" checked={formData.enableCalendarManagement} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="enableCalendarManagement">Enable Advanced Shift Calendar / Roster Management</label>
              </div>
              {formData.enableCalendarManagement && (
                <p className={styles.infoText}>
                  Plan and assign shifts using a calendar view.
                  <button type="button" className={`${styles.linkButton} ${styles.manageButton}`} onClick={() => navigate('/app/shift')}>View/Manage Roster</button>
                </p>
              )}
            </div>
            <div className={styles.subSection}>
              <h5>Shift Allowance</h5>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="shiftAllowanceType">Allowance Type</label>
                  <Select id="shiftAllowanceType" name="shiftAllowanceType" options={shiftAllowanceOptions} styles={customSelectStyles} value={getSelectedValue(shiftAllowanceOptions, formData.shiftAllowanceType)} onChange={handleSelectChange} placeholder="Select Type..." classNamePrefix="react-select"/>
                </div>
                {formData.shiftAllowanceType === 'Fixed' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="fixedAllowanceAmount">Fixed Allowance Amount</label>
                    <input type="number" id="fixedAllowanceAmount" name="fixedAllowanceAmount" min="0" step="0.01" value={formData.fixedAllowanceAmount} onChange={handleInputChange} className={styles.inputField}/>
                  </div>
                )}
                {formData.shiftAllowanceType === 'Dynamic' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="dynamicAllowanceDetails">Dynamic Rule Details</label>
                    <textarea id="dynamicAllowanceDetails" name="dynamicAllowanceDetails" value={formData.dynamicAllowanceDetails} onChange={handleInputChange} rows={3} className={styles.inputField} placeholder="Describe dynamic rules..."/>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.subSection}>
              <h5>Multiple Punches Per Day</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="allowMultiplePunches" name="allowMultiplePunches" checked={formData.allowMultiplePunches} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="allowMultiplePunches">Allow Multiple Check-ins/Check-outs Per Day</label>
              </div>
            </div>
            <div className={styles.subSection}>
              <h5>Duplicate Punch Handling</h5>
              <div className={styles.formGroup}>
                <label htmlFor="duplicatePunchHandling">How to Handle Duplicate Punches</label>
                <Select id="duplicatePunchHandling" name="duplicatePunchHandling" options={duplicatePunchOptions} styles={customSelectStyles} value={getSelectedValue(duplicatePunchOptions, formData.duplicatePunchHandling)} onChange={handleSelectChange} placeholder="Select Method..." classNamePrefix="react-select"/>
              </div>
            </div>
          </section>
        );
      case 3: // Overtime & Comp-Offs
        return (
          <section className={styles.formSection}>
            <h4>Overtime & Compensatory Offs</h4>
            <div className={styles.subSection}>
              <h5>Overtime Rules</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="enableOvertime" name="enableOvertime" checked={formData.enableOvertime} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="enableOvertime">Enable Overtime Calculation</label>
              </div>
              <div className={`${styles.formGrid} ${!formData.enableOvertime ? styles.disabledSection : ''}`}>
                <div className={styles.formGroup}>
                  <label htmlFor="overtimeThresholdMinutes">Threshold (Minutes After Shift End)</label>
                  <input type="number" id="overtimeThresholdMinutes" name="overtimeThresholdMinutes" min="0" value={formData.overtimeThresholdMinutes} onChange={handleInputChange} className={styles.inputField} disabled={!formData.enableOvertime}/>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="overtimeRounding">Rounding Logic</label>
                  <Select id="overtimeRounding" name="overtimeRounding" options={overtimeRoundingOptions} styles={customSelectStyles} value={getSelectedValue(overtimeRoundingOptions, formData.overtimeRounding)} onChange={handleSelectChange} placeholder="Select Rounding..." classNamePrefix="react-select" isDisabled={!formData.enableOvertime}/>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="overtimeCapHoursDaily">Max OT Per Day (Hours)</label>
                  <input type="number" id="overtimeCapHoursDaily" name="overtimeCapHoursDaily" min="0" step="0.1" value={formData.overtimeCapHoursDaily} onChange={handleInputChange} className={styles.inputField} disabled={!formData.enableOvertime}/>
                </div>
                
              </div>
              <div className={`${styles.formGrid} ${!formData.enableOvertime ? styles.disabledSection : ''}`}>
              <div className={styles.formGroup}>
                  <label htmlFor="overtimeCapHoursWeekly">Max OT Per Week (Hours)</label>
                  <input type="number" id="overtimeCapHoursWeekly" name="overtimeCapHoursWeekly" min="0" step="0.1" value={formData.overtimeCapHoursWeekly} onChange={handleInputChange} className={styles.inputField} disabled={!formData.enableOvertime}/>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="overtimeCapHoursMonthly">Max OT Per Month (Hours)</label>
                  <input type="number" id="overtimeCapHoursMonthly" name="overtimeCapHoursMonthly" min="0" step="0.1" value={formData.overtimeCapHoursMonthly} onChange={handleInputChange} className={styles.inputField} disabled={!formData.enableOvertime}/>
                </div>
              </div>

              
            </div>
            <div className={styles.subSection}>
              <h5>Compensatory Off (Comp-Off)</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="enableCompOff" name="enableCompOff" checked={formData.enableCompOff} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="enableCompOff">Enable Comp-Off Eligibility (Instead of Paid OT)</label>
              </div>
              {formData.enableCompOff && ( <p className={styles.infoText}>Employees can earn time off for extra hours worked or work on non-working days.</p> )}
            </div>
            <div className={styles.subSection}>
              <h5>Attendance-Based Incentives</h5>
              <div className={styles.formGroupCheckbox}>
                <input type="checkbox" id="enableAttendanceIncentives" name="enableAttendanceIncentives" checked={formData.enableAttendanceIncentives} onChange={handleInputChange} className={styles.checkboxInput}/>
                <label htmlFor="enableAttendanceIncentives">Enable Attendance-Based Incentives Program</label>
              </div>
              {formData.enableAttendanceIncentives && (
                <div className={styles.formGroup}>
                  <label htmlFor="incentiveDetails">Incentive Program Details</label>
                  <textarea id="incentiveDetails" name="incentiveDetails" value={formData.incentiveDetails} onChange={handleInputChange} rows={4} className={styles.inputField} placeholder="Describe the rules, rewards, and criteria..."/>
                </div>
              )}
            </div>
          </section>
        );
        case 4: // Attendance Capture & Interpretation
        return (
            <section className={styles.formSection}>
                <h4>Attendance Capture & Interpretation</h4>
                 <div className={styles.subSection}>
                    <h5>Auto Leave Deduction</h5>
                    <div className={styles.formGroupCheckbox}>
                       <input type="checkbox" id="enableAutoLeaveDeduction" name="enableAutoLeaveDeduction" checked={formData.enableAutoLeaveDeduction} onChange={handleInputChange} className={styles.checkboxInput}/>
                       <label htmlFor="enableAutoLeaveDeduction">Enable Auto Leave Deduction for Absences</label>
                    </div>
                    <div className={`${styles.formGrid} ${!formData.enableAutoLeaveDeduction ? styles.disabledSection : ''}`}>
                        <div className={styles.formGroup}>
                            <label htmlFor="autoDeductionPriority">Leave Deduction Priority</label>
                            <Select
                                isMulti
                                id="autoDeductionPriority"
                                name="autoDeductionPriority"
                                options={leaveTypeOptionsForPriority} // Use your fetched leave types here
                                styles={customSelectStyles}
                                value={getSelectedValue(leaveTypeOptionsForPriority, formData.autoDeductionPriority, true)}
                                onChange={handleSelectChange}
                                placeholder="Select Leave Type Order..."
                                classNamePrefix="react-select"
                                isDisabled={!formData.enableAutoLeaveDeduction}
                                closeMenuOnSelect={false}
                            />
                        </div>
                         <div className={styles.formGroupCheckbox}>
                           <input
                             type="checkbox"
                             id="markLOPIfNoLeave"
                             name="markLOPIfNoLeave"
                             checked={formData.markLOPIfNoLeave}
                             onChange={handleInputChange}
                             className={styles.checkboxInput}
                             disabled={!formData.enableAutoLeaveDeduction}
                           />
                           <label htmlFor="markLOPIfNoLeave">Mark as LOP (Loss of Pay) if No Leave Balance Available</label>
                        </div>
                    </div>
                </div>
                 <div className={styles.subSection}>
                    <h5>Leave Integration</h5>
                     <div className={styles.formGroupCheckbox}>
                        <input
                           type="checkbox"
                           id="integrateWithLeaveModule"
                           name="integrateWithLeaveModule"
                           checked={formData.integrateWithLeaveModule}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                        />
                        <label htmlFor="integrateWithLeaveModule">Integrate with Leave Module (Block Attendance on Approved Leave)</label>
                     </div>
                     {formData.integrateWithLeaveModule && <p className={styles.infoText}>Ensures approved leave requests automatically reflect in attendance.</p>}
                </div>
                 <div className={styles.subSection}>
                    <h5>Biometric/Access Integration</h5>
                    <div className={styles.formGroupCheckbox}>
                        <input
                           type="checkbox"
                           id="enableBiometricIntegration"
                           name="enableBiometricIntegration"
                           checked={formData.enableBiometricIntegration}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                        />
                        <label htmlFor="enableBiometricIntegration">Enable Biometric/Access Device Integration</label>
                     </div>
                      {formData.enableBiometricIntegration && (
                        <div className={styles.formGroup}>
                            <label htmlFor="biometricDeviceDetails">Device Details / Connection Info</label>
                            <textarea
                               id="biometricDeviceDetails"
                               name="biometricDeviceDetails"
                               value={formData.biometricDeviceDetails}
                               onChange={handleInputChange}
                               rows={3}
                               className={styles.inputField}
                               placeholder="Enter details about device type, connection methods, IP address, etc. Further configuration might be needed separately."
                            />
                        </div>
                      )}
                      {!formData.enableBiometricIntegration && <p className={styles.infoText}>Attendance will rely on manual entry, web check-in, or other methods.</p>}
                </div>
            </section>
        );
        case 5: // Exceptions & Adjustments
        return (
            <section className={styles.formSection}>
                <h4>Exceptions & Adjustments</h4>

                <div className={styles.subSection}>
                    <h5>Late Marks Policy</h5>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="lateMarkThresholdMinutes">Late Mark Threshold (Minutes)</label>
                            <input
                                type="number"
                                id="lateMarkThresholdMinutes"
                                name="lateMarkThresholdMinutes"
                                min="0"
                                value={formData.lateMarkThresholdMinutes}
                                onChange={handleInputChange}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="allowedLateMarksPerMonth">Allowed Late Marks per Month</label>
                            <input
                                type="number"
                                id="allowedLateMarksPerMonth"
                                name="allowedLateMarksPerMonth"
                                min="0"
                                value={formData.allowedLateMarksPerMonth}
                                onChange={handleInputChange}
                                className={styles.inputField}
                            />
                        </div>
                         <div className={styles.formGroup}>
                            <label htmlFor="lateMarkPenalty">Penalty After Allowed Lates</label>
                            <Select
                                id="lateMarkPenalty"
                                name="lateMarkPenalty"
                                options={lateMarkPenaltyOptions}
                                styles={customSelectStyles}
                                value={getSelectedValue(lateMarkPenaltyOptions, formData.lateMarkPenalty)}
                                onChange={handleSelectChange}
                                placeholder="Select Penalty..."
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.subSection}>
                    <h5>Early Departure Rules</h5>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="earlyDepartureThresholdMinutes">Early Departure Threshold (Minutes)</label>
                            <input
                                type="number"
                                id="earlyDepartureThresholdMinutes"
                                name="earlyDepartureThresholdMinutes"
                                min="0"
                                value={formData.earlyDepartureThresholdMinutes}
                                onChange={handleInputChange}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="allowedEarlyDeparturesPerMonth">Allowed Early Departures per Month</label>
                            <input
                                type="number"
                                id="allowedEarlyDeparturesPerMonth"
                                name="allowedEarlyDeparturesPerMonth"
                                min="0"
                                value={formData.allowedEarlyDeparturesPerMonth}
                                onChange={handleInputChange}
                                className={styles.inputField}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="earlyDeparturePenalty">Penalty After Allowed Early Outs</label>
                            <Select
                                id="earlyDeparturePenalty"
                                name="earlyDeparturePenalty"
                                options={earlyDeparturePenaltyOptions}
                                styles={customSelectStyles}
                                value={getSelectedValue(earlyDeparturePenaltyOptions, formData.earlyDeparturePenalty)}
                                onChange={handleSelectChange}
                                placeholder="Select Penalty..."
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.subSection}>
                    <h5>Attendance Corrections</h5>
                    <div className={styles.formGroupCheckbox}>
                       <input
                           type="checkbox"
                           id="enableAttendanceCorrections"
                           name="enableAttendanceCorrections"
                           checked={formData.enableAttendanceCorrections}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                       />
                       <label htmlFor="enableAttendanceCorrections">Allow Employees/Managers to Submit Corrections</label>
                    </div>
                     <div className={`${styles.formGroup} ${!formData.enableAttendanceCorrections ? styles.disabledSection : ''}`}>
                        <label htmlFor="correctionApprovalWorkflow">Correction Approval Workflow</label>
                        <Select
                            id="correctionApprovalWorkflow"
                            name="correctionApprovalWorkflow"
                            options={approvalWorkflowOptions}
                            styles={customSelectStyles}
                            value={getSelectedValue(approvalWorkflowOptions, formData.correctionApprovalWorkflow)}
                            onChange={handleSelectChange}
                            placeholder="Select Workflow..."
                            classNamePrefix="react-select"
                            isDisabled={!formData.enableAttendanceCorrections}
                        />
                    </div>
                </div>

                 <div className={styles.subSection}>
                    <h5>Work From Home / Remote Attendance</h5>
                     <div className={styles.formGroupCheckbox}>
                       <input
                           type="checkbox"
                           id="enableWFHRemoteAttendance"
                           name="enableWFHRemoteAttendance"
                           checked={formData.enableWFHRemoteAttendance}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                       />
                       <label htmlFor="enableWFHRemoteAttendance">Enable WFH/Remote Attendance Marking (Web/Mobile)</label>
                    </div>
                     <div className={`${styles.formGroupCheckbox} ${!formData.enableWFHRemoteAttendance ? styles.disabledSection : ''}`}>
                       <input
                           type="checkbox"
                           id="wfhProofRequired"
                           name="wfhProofRequired"
                           checked={formData.wfhProofRequired}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                           disabled={!formData.enableWFHRemoteAttendance}
                       />
                       <label htmlFor="wfhProofRequired">Require Task Proof/Comments for WFH/Remote</label>
                    </div>
                </div>

                 <div className={styles.subSection}>
                    <h5>Approval Workflow for Attendance Exceptions</h5>
                    <div className={styles.formGroup}>
                        <label htmlFor="attendanceApprovalWorkflow">Default Workflow (e.g., Late/Early Waivers)</label>
                         <Select
                            id="attendanceApprovalWorkflow"
                            name="attendanceApprovalWorkflow"
                            options={approvalWorkflowOptions}
                            styles={customSelectStyles}
                            value={getSelectedValue(approvalWorkflowOptions, formData.attendanceApprovalWorkflow)}
                            onChange={handleSelectChange}
                            placeholder="Select Workflow..."
                            classNamePrefix="react-select"
                        />
                         <small className={styles.fieldHelpText}>Workflow for approving exceptions like late mark waivers, correction requests etc.</small>
                    </div>
                </div>

                <div className={styles.subSection}>
                    <h5>Geofencing for Mobile Attendance</h5>
                     <div className={styles.formGroupCheckbox}>
                       <input
                           type="checkbox"
                           id="enableGeofencing"
                           name="enableGeofencing"
                           checked={formData.enableGeofencing}
                           onChange={handleInputChange}
                           className={styles.checkboxInput}
                       />
                       <label htmlFor="enableGeofencing">Enable Geofencing Restriction for Mobile Punch</label>
                    </div>
                     <div className={`${styles.formGrid} ${!formData.enableGeofencing ? styles.disabledSection : ''}`}>
                        <div className={styles.formGroup}>
                           <label htmlFor="geoFenceCoordinates">Center Coordinates (Lat, Long)</label>
                            <input
                                type="text"
                                id="geoFenceCoordinates"
                                name="geoFenceCoordinates"
                                value={formData.geoFenceCoordinates}
                                onChange={handleInputChange}
                                className={styles.inputField}
                                placeholder="e.g., 40.7128, -74.0060"
                                disabled={!formData.enableGeofencing}
                            />
                        </div>
                         <div className={styles.formGroup}>
                           <label htmlFor="geoFenceRadiusMeters">Radius (Meters)</label>
                            <input
                                type="number"
                                id="geoFenceRadiusMeters"
                                name="geoFenceRadiusMeters"
                                min="50" // Example minimum
                                value={formData.geoFenceRadiusMeters}
                                onChange={handleInputChange}
                                className={styles.inputField}
                                disabled={!formData.enableGeofencing}
                            />
                        </div>
                         <div className={styles.formGroupCheckbox}>
                           <input
                               type="checkbox"
                               id="geoFenceRequireSelfie"
                               name="geoFenceRequireSelfie"
                               checked={formData.geoFenceRequireSelfie}
                               onChange={handleInputChange}
                               className={styles.checkboxInput}
                               disabled={!formData.enableGeofencing}
                           />
                           <label htmlFor="geoFenceRequireSelfie">Require Selfie Capture with Mobile Punch</label>
                        </div>
                     </div>
                </div>
            </section>
        );
              default: return <div>Step 1: General Rules</div>;
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <h2>
        Attendance Configuration
        <span className={styles.stepCounter}>
          Step {currentStep} of {totalSteps}
        </span>
      </h2>
      <form onSubmit={handleFinalSubmit}>
        {renderStepContent()}
        <div className={styles.wizardNav}>
          {currentStep > 1 && ( <button type="button" className={styles.prevButton} onClick={prevStep}> Previous </button> )}
          {/* Conditionally render Next/Save */}
          <div style={{marginLeft: 'auto'}}> {/* Push buttons to the right */}
            {currentStep < totalSteps && ( <button type="button" className={styles.nextButton} onClick={nextStep}> Next </button> )}
            {currentStep === totalSteps && ( <button type="submit" className={styles.saveButton}> Save All Settings </button> )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AttendanceSettingsWizard;