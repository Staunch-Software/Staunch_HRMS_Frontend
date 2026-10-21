import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from '../../../Contexts/EmployeeContext';
import { useDepartments } from '../../../Contexts/DepartmentContext';
import { useReferenceData } from '../../../Contexts/ReferenceDataContext';
import { employeeApiService } from '../../../services/employeeApiService';
import Stepper from './Stepper';
import BasicDetailsForm from './BasicDetails';
import SalaryDetailsForm from './SalaryDetails';
import PersonalDetailsForm from './PersonalDetails';
import PaymentMethodForm from './PaymentMethod';
import SalaryStructureAssignment from './SalaryStructureAssignment';
import styles from './AddEmployeeFlow.module.css';

const steps = ['Basic Details', 'Salary Details', 'Personal Details', 'Payment Information'];

const blankFormData = {
    firstName: '', middleName: '', lastName: '', employeeId: '', dateOfJoining: '',
    workEmail: '', mobileNumber: '', employeeType: '', workLocation: '', designation: '',
    department: '',
    basicSalary: '', allowanceA: '', allowanceB: '', deductionX: '', currency: '',
    dob: '', personalEmail: '', homeAddress: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '', gender: '',
    bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', paymentMethod: 'Bank Transfer',
    status: '',
};

const AddEmployeeFlow = () => {
    const { addEmployee, updateEmployee, getEmployeeById } = useEmployees();
    const { departments, designations } = useDepartments();
    const { locations, isLoading: refLoading, error: refError } = useReferenceData();
    const navigate = useNavigate();
    const { id: editingEmployeeId } = useParams();
    const isEditMode = !!editingEmployeeId;
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [createdEmployee, setCreatedEmployee] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(isEditMode);
    const [loadError, setLoadError] = useState('');

    const [formData, setFormData] = useState(blankFormData);

    useEffect(() => {
        console.log("AddEmployeeFlow Mounted - Data:", { departments, designations, locations });
    }, [departments, designations, locations]);

    // Edit mode: pre-fill the wizard from the existing employee (already in
    // EmployeeContext's list) plus their bank account (a separate fetch,
    // since EmployeeContext's list doesn't carry bank details). Note: DOB,
    // PAN, marital status, blood group, address, and emergency contact are
    // Personal Details fields that were never persisted to the backend for
    // ANY employee (Add Employee never saved them either) — they'll show
    // blank here too; editing them won't currently have anywhere to save to.
    useEffect(() => {
        if (!isEditMode) return;
        const existing = getEmployeeById(editingEmployeeId);
        if (!existing) return; // EmployeeContext may still be loading its list
        setLoadError('');
        employeeApiService
            .getBankAccount(existing.id)
            .catch(() => null) // no bank account on file yet — fine, just leave those fields blank
            .then((bankAccount) => {
                setFormData({
                    ...blankFormData,
                    firstName: existing.firstName || '',
                    lastName: existing.lastName || '',
                    employeeId: existing.employeeId || '',
                    dateOfJoining: existing.dateOfJoining || '',
                    workEmail: existing.workEmail || '',
                    mobileNumber: existing.mobileNumber || '',
                    workLocation: existing.workLocation || '',
                    designation: existing.designation || '',
                    department: existing.department || '',
                    basicSalary: existing.basicSalary ?? '',
                    personalEmail: existing.personalEmail || '',
                    gender: existing.gender || '',
                    status: existing.status || '',
                    bankName: bankAccount?.bank_name || '',
                    accountHolderName: bankAccount?.account_holder_name || '',
                    accountNumber: bankAccount?.account_number || '',
                    ifscCode: bankAccount?.ifsc_code || '',
                });
                setLoadingExisting(false);
            })
            .catch((err) => {
                setLoadError(err.message || 'Failed to load employee for editing.');
                setLoadingExisting(false);
            });
        // Only re-run if the employee being edited changes, or once the
        // context's employee list first becomes available (existing flips
        // from undefined to a real record).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, editingEmployeeId, getEmployeeById(editingEmployeeId)]);

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleBack = () => {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
    };

    const handleCancel = () => {
        navigate('/app/employee');
    };

    const handleSubmitFlow = async () => {
        console.log("Attempting to submit final employee data:", formData);
        try {
             const selectedDepartmentName = formData.department;
             const selectedDesignationName = formData.designation;

             const departmentObject = departments.find(d => d.name === selectedDepartmentName);

             if (!departmentObject) {
                 console.error("Selected department not found in context:", selectedDepartmentName);
                 alert(`Error: Department "${selectedDepartmentName}" not found. Please select a valid department.`);
                 return; // Stop submission
             }

             // Find designation within the selected department
             const designationObject = designations.find(des =>
                 des.name === selectedDesignationName &&
                 des.departmentId === departmentObject.id
             );

             if (!designationObject) {
                 console.error("Selected designation not found within the selected department:", selectedDesignationName, selectedDepartmentName);
                 alert(`Error: Designation "${selectedDesignationName}" not found within department "${selectedDepartmentName}". Please select a valid designation.`);
                 return; // Stop submission
             }

             const submissionData = {
                 ...formData,
                 departmentId: departmentObject.id,          // Include ID if needed elsewhere
                 departmentCode: departmentObject.code,      // CRUCIAL: Pass the code
                 designationId: designationObject.id,       // Include ID if needed elsewhere
                 designation: selectedDesignationName,       // CRUCIAL: Pass the name
                 status: formData.status || 'Active',       // Ensure status defaults if empty
             };

             if (isEditMode) {
                 console.log("Data being sent to updateEmployee context function:", submissionData);
                 const updated = await updateEmployee(editingEmployeeId, submissionData);
                 if (!updated) return; // updateEmployee already alerted on failure
                 alert('Employee updated successfully!');
                 navigate('/app/employee');
                 return;
             }

             console.log("Data being sent to addEmployee context function:", submissionData);
             const newEmployee = await addEmployee(submissionData); // Pass the prepared data
             if (!newEmployee) return; // addEmployee already alerted (validation/duplicate/API error)

             // Instead of navigating away immediately, offer to assign salary
             // components (BASIC is already auto-created from basicSalary by
             // the backend) right here, so payroll setup happens in one flow
             // instead of a separate trip to the Employee List afterward.
             setCreatedEmployee(newEmployee);

        } catch (error) {
            console.error("Error submitting employee data:", error);
            alert(`An unexpected error occurred: ${error.message}`); // Show error to user
        }
    };

    const handleFinishAfterSalaryStep = () => {
        setCreatedEmployee(null);
        navigate('/app/employee');
    };

    const renderCurrentStep = () => {
        switch (currentStepIndex) {
            case 0:
                return <BasicDetailsForm
                           data={formData}
                           updateData={updateFormData}
                           onNext={handleNext}
                           onCancel={handleCancel}
                           departments={departments || []}
                           locations={locations || []}
                           designations={designations || []}
                           isLoadingReferenceData={refLoading}
                           referenceDataError={refError}
                       />;
            case 1:
                return <SalaryDetailsForm
                           data={formData}
                           updateData={updateFormData}
                           onNext={handleNext}
                           onBack={handleBack}
                           onCancel={handleCancel}
                       />;
            case 2:
                return <PersonalDetailsForm
                           data={formData}
                           updateData={updateFormData}
                           onNext={handleNext}
                           onBack={handleBack}
                           onCancel={handleCancel}
                        />;
            case 3:
                return <PaymentMethodForm
                           data={formData}
                           updateData={updateFormData}
                           onSubmit={handleSubmitFlow} // Final submit happens here
                           onBack={handleBack}
                           onCancel={handleCancel}
                       />;
            default:
                 setCurrentStepIndex(0);
                 return <div>Error: Invalid Step</div>;
        }
    };

    if (loadingExisting) {
        return <div className={styles.flowContainer}><p style={{ padding: 24 }}>Loading employee...</p></div>;
    }
    if (loadError) {
        return <div className={styles.flowContainer}><p style={{ padding: 24, color: '#dc3545' }}>{loadError}</p></div>;
    }

    return (
        <div className={styles.flowContainer}>
            <Stepper steps={steps} currentStepIndex={currentStepIndex} />
            {isEditMode && (
                <p style={{ padding: '0 24px', color: '#495057' }}>
                    Editing {formData.firstName} {formData.lastName} (ID: {formData.employeeId})
                </p>
            )}
            <div className={styles.stepContent}>
                {renderCurrentStep()}
            </div>
            <SalaryStructureAssignment
                employee={createdEmployee}
                isOpen={!!createdEmployee}
                onClose={handleFinishAfterSalaryStep}
                introText="Employee added. Assign any additional salary components (HRA, PF, PT, etc.) now, or click Done to finish — you can always do this later from the Employee List."
            />
        </div>
    );
};

export default AddEmployeeFlow;