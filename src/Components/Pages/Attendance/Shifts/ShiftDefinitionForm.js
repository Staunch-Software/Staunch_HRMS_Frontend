// ShiftDefinitionForm.js (Conceptual Example - often a Modal)
import React, { useState, useEffect } from 'react';
import styles from './ShiftManagement.module.css';

const ShiftDefinitionForm = ({ initialData, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        color: '#ffffff', // Default color
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                startTime: initialData.startTime || '',
                endTime: initialData.endTime || '',
                color: initialData.color || '#ffffff',
            });
        } else {
             setFormData({ name: '', startTime: '', endTime: '', color: '#ffffff' }); // Reset for new
        }
    }, [initialData]); // Update form when initialData changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.startTime || !formData.endTime) {
            alert("Shift Name, Start Time, and End Time are required.");
            return;
        }
        onSubmit(formData);
    };

    return (
        // This would typically be wrapped in a Modal component
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{initialData ? 'Edit Shift Definition' : 'Add New Shift Definition'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="shiftName">Shift Name *</label>
                        <input type="text" id="shiftName" name="name" value={formData.name} onChange={handleChange} required className={styles.inputField}/>
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="startTime">Start Time *</label>
                        <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required className={styles.inputField}/>
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="endTime">End Time *</label>
                        <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required className={styles.inputField}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="color">Color</label>
                        <input type="color" id="color" name="color" value={formData.color} onChange={handleChange} className={styles.colorInput}/>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.saveButton}>Save Shift</button>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftDefinitionForm;