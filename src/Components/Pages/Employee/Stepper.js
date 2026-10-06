// src/Components/Pages/Employee/Stepper.js
import React from 'react';
import styles from './Stepper.module.css';
// FaCheck is no longer needed if you only want numbers
// import { FaCheck } from 'react-icons/fa';

const Stepper = ({ steps, currentStepIndex }) => {
  return (
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
             
              {index + 1}
             
              {/* {isCompleted ? <FaCheck className={styles.stepIcon} /> : (index + 1)} */}
              
            </div>
            <div className={styles.stepLabel}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;