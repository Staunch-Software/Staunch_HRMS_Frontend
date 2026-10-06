// src/Components/Pages/Employee/AddEmployee.js (or adjust path)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../../Contexts/EmployeeContext'; // Correct path
import styles from './AddEmployee.module.css';
import { FaCheck } from 'react-icons/fa';

const AddEmployee = () => {
    const { addEmployee } = useEmployees();
    const navigate = useNavigate();

    // Define the steps
    const steps = ['Basic Details', 'Salary Details', 'Personal Details', 'Payment Information'];
    const currentStepIndex = 0; // 0-based index

    // --- State for all form fields ---
    // Ensure ALL these declarations are present and uncommented
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState(''); // Add this back
    const [lastName, setLastName] = useState(''); // Add this back
    const [employeeId, setEmployeeId] = useState(''); // Add this back
    const [dateOfJoining, setDateOfJoining] = useState(''); // Add this back
    const [workEmail, setWorkEmail] = useState(''); // Add this back
    const [mobileNumber, setMobileNumber] = useState(''); // Add this back
    const [gender, setGender] = useState(''); // Add this back
    const [workLocation, setWorkLocation] = useState(''); // Add this back
    const [designation, setDesignation] = useState(''); // Add this back
    const [department, setDepartment] = useState(''); // Add this back (was likely present)


    const handleSubmit = (event) => {
        event.preventDefault();
        if (!firstName || !lastName || !employeeId || !dateOfJoining || !workEmail || !designation) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        const newEmployee = {
            firstName, middleName, lastName, employeeId, dateOfJoining,
            workEmail, mobileNumber, gender, workLocation, designation, department,
        };
        addEmployee(newEmployee);
        // In a real multi-step form, you might navigate to the next step
        // For now, it navigates back to the list
        navigate('/app/employee');
    };

    return (
        <div className={styles.container}>
             <div className={styles.stepperContainer}>
                {steps.map((label, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const stepClasses = `
                        ${styles.stepItem}
                        ${isCompleted ? styles.completed : ''}
                        ${isActive ? styles.active : ''}
                    `;

                    return (
                        <div key={label} className={stepClasses.trim()}>
                            <div className={styles.stepCircle}>
                                {isCompleted ? <FaCheck className={styles.stepIcon} /> : (index + 1)}
                            </div>
                            <div className={styles.stepLabel}>{label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Form content using the state variables... */}
                {/* (Your existing form rows and groups go here) */}

                 {/* --- Name Fields --- */}
                 <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName" className={styles.label}>First Name <span className={styles.requiredAsterisk}>*</span></label>
                        {/* This input uses firstName and setFirstName */}
                        <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="middleName" className={styles.label}>Middle Name</label>
                        {/* This input uses middleName and setMiddleName */}
                        <input type="text" id="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="lastName" className={styles.label}>Last Name <span className={styles.requiredAsterisk}>*</span></label>
                         {/* This input uses lastName and setLastName */}
                        <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={styles.input} required />
                    </div>
                </div>

                 {/* --- ID and Joining Date --- */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="employeeId" className={styles.label}>Employee ID <span className={styles.requiredAsterisk}>*</span></label>
                         {/* This input uses employeeId and setEmployeeId */}
                        <input type="text" id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="dateOfJoining" className={styles.label}>Date of Joining <span className={styles.requiredAsterisk}>*</span></label>
                         {/* This input uses dateOfJoining and setDateOfJoining */}
                        <input type="date" id="dateOfJoining" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} className={styles.input} required />
                    </div>
                 </div>

                 {/* --- Contact Info --- */}
                 <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="workEmail" className={styles.label}>Work Email <span className={styles.requiredAsterisk}>*</span></label>
                         {/* This input uses workEmail and setWorkEmail */}
                        <input type="email" id="workEmail" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} className={styles.input} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="mobileNumber" className={styles.label}>Mobile Number</label>
                         {/* This input uses mobileNumber and setMobileNumber */}
                        <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className={styles.input} />
                    </div>
                 </div>

                  {/* --- Gender and Location --- */}
                 <div className={styles.formRow}>
                     <div className={styles.formGroup}>
                        <label htmlFor="gender" className={styles.label}>Gender</label>
                         {/* This select uses gender and setGender */}
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={styles.input}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="workLocation" className={styles.label}>Work Location</label>
                         {/* This input uses workLocation and setWorkLocation */}
                        <input type="text" id="workLocation" value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className={styles.input} />
                    </div>
                 </div>

                 {/* --- Work Details --- */}
                 <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="designation" className={styles.label}>Designation <span className={styles.requiredAsterisk}>*</span></label>
                         {/* This input uses designation and setDesignation */}
                        <input type="text" id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} className={styles.input} required />
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="department" className={styles.label}>Department</label>
                         {/* This input uses department and setDepartment */}
                        <input type="text" id="department" value={department} onChange={(e) => setDepartment(e.target.value)} className={styles.input} />
                    </div>
                 </div>


                {/* --- Buttons --- */}
                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>Save & Continue</button>
                    <button type="button" className={styles.cancelButton} onClick={() => navigate('/app/employee')}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmployee;