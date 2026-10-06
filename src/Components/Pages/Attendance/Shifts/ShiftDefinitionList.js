// ShiftDefinitionList.js (Conceptual Example)
import React, { useState } from 'react';
// import { useShifts } from '../../contexts/ShiftContext'; // Assuming ShiftContext
import styles from './ShiftManagement.module.css'; // Create this CSS
import ShiftDefinitionForm from './ShiftDefinitionForm';

const ShiftDefinitionList = () => {
  // const { shiftDefinitions, addShiftDefinition, updateShiftDefinition, deleteShiftDefinition } = useShifts();
  // --- Dummy Data for Now ---
  const [shiftDefinitions, setShiftDefinitions] = useState([
      { id: 'sh1', name: 'Morning Shift', startTime: '08:00', endTime: '16:00', color: '#aeeeee' },
      { id: 'sh2', name: 'Evening Shift', startTime: '14:00', endTime: '22:00', color: '#f5deb3' },
      { id: 'sh3', name: 'Night Shift', startTime: '22:00', endTime: '06:00', color: '#d3d3d3' },
  ]);
  const addShiftDefinition = (newShift) => setShiftDefinitions(s => [...s, { ...newShift, id: `sh${Date.now()}` }]);
  // --- End Dummy Data ---

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const handleAdd = () => {
    setEditingShift(null); // Clear editing state
    setIsFormOpen(true);
  };

  const handleEdit = (shift) => {
      setEditingShift(shift);
      setIsFormOpen(true);
  };

  const handleDelete = (shiftId) => {
      if (window.confirm("Are you sure you want to delete this shift?")) {
          // deleteShiftDefinition(shiftId); // Call context function
          setShiftDefinitions(s => s.filter(sh => sh.id !== shiftId)); // Update local dummy data
          console.log("Deleting shift:", shiftId);
      }
  };

  const handleFormSubmit = (formData) => {
      if (editingShift) {
          // updateShiftDefinition({ ...editingShift, ...formData }); // Context
          setShiftDefinitions(s => s.map(sh => sh.id === editingShift.id ? { ...sh, ...formData } : sh)); // Dummy update
          console.log("Updating Shift", formData);
      } else {
          addShiftDefinition(formData); // Context
          console.log("Adding Shift", formData);
      }
      setIsFormOpen(false);
      setEditingShift(null);
  };

  return (
    <div className={styles.shiftDefinitionContainer}>
      <h3>Defined Shifts</h3>
      <button onClick={handleAdd} className={styles.addButton}>+ Add New Shift</button>
      <ul className={styles.shiftList}>
        {shiftDefinitions.map(shift => (
          <li key={shift.id} className={styles.shiftItem}>
            <span className={styles.shiftColorIndicator} style={{ backgroundColor: shift.color || '#ccc' }}></span>
            <span className={styles.shiftName}>{shift.name}</span>
            <span className={styles.shiftTimes}>{shift.startTime} - {shift.endTime}</span>
            <div className={styles.shiftActions}>
              <button onClick={() => handleEdit(shift)} className={styles.editBtn}>Edit</button>
              <button onClick={() => handleDelete(shift.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {isFormOpen && (
        <ShiftDefinitionForm
          initialData={editingShift}
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default ShiftDefinitionList;