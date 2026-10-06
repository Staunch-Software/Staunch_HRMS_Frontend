import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../../../Contexts/EmployeeContext';
import { useDepartments } from '../../../Contexts/DepartmentContext';
import { useReferenceData } from '../../../Contexts/ReferenceDataContext';
import Stepper from './Stepper';
import BasicDetailsForm from './BasicDetails';
import SalaryDetailsForm from './SalaryDetails';
import PersonalDetailsForm from './PersonalDetails';
import PaymentMethodForm from './PaymentMethod';
import styles from './AddEmployeeFlow.module.css';

const steps = ['Basic Details', 'Salary Details', 'Personal Details', 'Payment Information'];

const AddEmployeeFlow = () => {
    const { addEmployee } = useEmployees();
    const { departments, designations } = useDepartments();
    const { locations, isLoading: refLoading, error: refError } = useReferenceData();
    const navigate = useNavigate();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const [formData, setFormData] = useState({
        firstName: '', middleName: '', lastName: '', employeeId: '', dateOfJoining: '',
        workEmail: '', mobileNumber: '', employeeType: '', workLocation: '', designation: '',
        department: '',
        basicSalary: '', allowanceA: '', allowanceB: '', deductionX: '', currency: '',
        dob: '', personalEmail: '', homeAddress: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '', gender: '',
        bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', paymentMethod: 'Bank Transfer',
        status: '', 
    });

    useEffect(() => {
        console.log("AddEmployeeFlow Mounted - Data:", { departments, designations, locations });
    }, [departments, designations, locations]);

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

    const handleSubmitFlow = () => {
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

             console.log("Data being sent to addEmployee context function:", submissionData);
             addEmployee(submissionData); // Pass the prepared data
             alert('Employee added successfully!'); // Optional user feedback
             navigate('/app/employee'); // Navigate on success

        } catch (error) {
            console.error("Error submitting employee data:", error);
            alert(`An unexpected error occurred: ${error.message}`); // Show error to user
        }
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

    return (
        <div className={styles.flowContainer}>
            <Stepper steps={steps} currentStepIndex={currentStepIndex} />
            <div className={styles.stepContent}>
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default AddEmployeeFlow;