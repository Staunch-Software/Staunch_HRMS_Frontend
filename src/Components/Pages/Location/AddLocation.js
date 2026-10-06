import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReferenceData } from '../../../Contexts/ReferenceDataContext';
import styles from './AddLocation.module.css'; 

const AddLocation = () => {
    const [locationName, setLocationName] = useState('');
    const { addLocation } = useReferenceData();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!locationName.trim()) {
            setError('Location name cannot be empty.');
            return;
        }
        setError('');
        addLocation(locationName.trim());
        // Navigate back to the previous page (employee form)
        navigate(-1); // Go back one step in history
        // Or navigate specifically: navigate('/app/employee/add');
    };

    return (
        <div className={styles.formContainer}> {/* Reuse styles if desired */}
            <h2>Add New Work Location</h2>
             <form onSubmit={handleSubmit}>
                 <div className={styles.formGroup}>
                    <label htmlFor="locationName" className={styles.label}>Location Name:</label>
                    <input
                        type="text"
                        id="locationName"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className={styles.input}
                        autoFocus // Focus on input load
                    />
                     {error && <span className={styles.errorMessage}>{error}</span>}
                 </div>
                 <div className={styles.buttonGroup}>
                     <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>Cancel</button>
                     <button type="submit" className={styles.submitButton}>Add Location</button>
                 </div>
            </form>
        </div>
    );
};

export default AddLocation;