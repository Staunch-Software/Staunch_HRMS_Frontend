// src/Components/Pages/Department/AddDepartment.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartments } from "../../../Contexts/DepartmentContext"; // Adjust path if needed
import styles from "./AddDepartment.module.css"; // Make sure this CSS file exists

const AddDepartment = () => {
  const { addDepartment } = useDepartments();
  const navigate = useNavigate();

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleNameChange = (event) => {
    setDepartmentName(event.target.value);
    if (error && event.target.value.trim()) setError("");
  };

  const handleCodeChange = (event) => {
    setDepartmentCode(event.target.value.toUpperCase());
    if (error && event.target.value.trim()) setError("");
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!departmentName.trim() || !departmentCode.trim()) {
      setError("Department Name and Code are required.");
      return;
    }

    // Consider checking if code already exists if needed (would require context changes)

    const newDepartmentData = {
      name: departmentName.trim(),
      code: departmentCode.trim(),
      description: description.trim(),
      // Context will add ID, and use defaults for status/count if not provided
      status: "Active",      // Set default status explicitly
      employeeCount: 0,    // Set default count explicitly
    };

    try {
      addDepartment(newDepartmentData);
      // Navigate back to the department list page upon successful addition
      // Changed from /app/department to ensure it works within the nested route structure
      navigate("/app/department");

    } catch (err) {
      console.error("Error adding department:", err);
      setError(err.message || "Failed to add department. Please try again.");
    }
  };

  const handleCancel = () => {
     // Changed from /app/department to ensure it works within the nested route structure
    navigate("/app/department");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Add New Department</h1>
      <hr className={styles.divider} />

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.formGroup}>
          <label htmlFor="departmentName" className={styles.label}>
            Department Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="departmentName"
            name="departmentName"
            value={departmentName}
            onChange={handleNameChange}
            required
            className={`${styles.input} ${error && !departmentName.trim() ? styles.inputError : ''}`}
            maxLength={100}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="departmentCode" className={styles.label}>
            Department Code <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="departmentCode"
            name="departmentCode"
            value={departmentCode}
            onChange={handleCodeChange}
            required
            className={`${styles.input} ${error && !departmentCode.trim() ? styles.inputError : ''}`}
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />
          <small className={styles.hint}>A short unique code (e.g., HR, ENG).</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleDescriptionChange}
            className={styles.textarea}
            rows={4}
            maxLength={500}
          />
        </div>

        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={handleCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
          >
            Save Department
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepartment;