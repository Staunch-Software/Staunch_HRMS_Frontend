// src/Contexts/DepartmentContext.js - CLEANED VERSION

import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { payrollApiService } from '../services/payrollApiService';

// --- Context Definition ---
const DepartmentContext = createContext(null); // Initialize with null

// --- Custom Hook to Use Context ---
export const useDepartments = () => {
    const context = useContext(DepartmentContext);
    if (!context) {
        throw new Error('useDepartments must be used within a DepartmentProvider');
    }
    return context;
};

// --- Provider Component ---
export const DepartmentProvider = ({ children }) => {
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Seed from the backend on mount instead of hardcoded mock arrays.
    useEffect(() => {
        let cancelled = false;
        Promise.all([payrollApiService.getDepartments(), payrollApiService.getDesignations()])
            .then(([depts, dess]) => {
                if (cancelled) return;
                setDepartments([...depts].sort((a, b) => a.name.localeCompare(b.name)));
                setDesignations([...dess].sort((a, b) => a.name.localeCompare(b.name)));
            })
            .catch((err) => {
                console.error('CONTEXT (Department): Failed to load departments/designations from backend', err);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // --- Department Functions ---
    const addDepartment = useCallback((newDepartmentData) => {
        const codeUpper = newDepartmentData.code?.toUpperCase();
        if (!codeUpper) {
            console.error("Department code is required.");
            return; // Or throw error / set error state
        }
        if (departments.some(d => d.code.toUpperCase() === codeUpper)) {
            console.warn(`Department code "${codeUpper}" already exists.`);
            return;
        }
        payrollApiService
            .addDepartment({ ...newDepartmentData, code: codeUpper, status: newDepartmentData.status || 'Active' })
            .then((newDept) => {
                setDepartments(prev => [...prev, newDept].sort((a, b) => a.name.localeCompare(b.name)));
                console.log("CONTEXT (Department): Added department.", newDept);
            })
            .catch((err) => {
                console.error('CONTEXT (Department): Failed to add department', err);
                alert(`Failed to add department: ${err.message}`);
            });
    }, [departments]);

    const updateDepartmentStatus = useCallback((deptId, newStatus) => {
        console.log(`CONTEXT (Department): Updating Dept ID ${deptId} Status to ${newStatus}`);
        // NOTE: the Phase 1 backend (app/api/v1/org.py) exposes GET/POST/PUT
        // for departments but no dedicated status-patch endpoint yet, so this
        // remains a local-only state update for now — flagged as a known
        // Phase 1 gap rather than silently faked as persisted.
        let found = false;
        setDepartments(prev => prev.map(dept => {
             if (dept.id === deptId) {
                 found = true;
                 return { ...dept, status: newStatus };
             }
             return dept;
            }
        ));
        if (!found) {
            console.warn(`CONTEXT (Department): Department ${deptId} not found for status update.`);
        }
    }, []);

    // --- deleteDepartment: ONLY removes the department and its designations ---
    // --- Employee check MUST happen in the component calling this ---
    // NOTE: same Phase 1 gap as updateDepartmentStatus above — the backend
    // doesn't expose a delete endpoint for departments/designations yet, so
    // this stays a local-only removal.
    const deleteDepartment = useCallback((deptIdToDelete) => {
        console.log(`CONTEXT (Department): Deleting Dept ID ${deptIdToDelete}`);

        // Remove Department
        let deptFound = false;
        setDepartments(prevDepartments => {
            const initialLength = prevDepartments.length;
            const newState = prevDepartments.filter(dept => dept.id !== deptIdToDelete);
            if (newState.length < initialLength) {
                 deptFound = true;
                 console.log("CONTEXT (Department): Department removed. New state:", newState);
            }
            return newState;
        });

        if (!deptFound) {
             console.warn(`CONTEXT (Department): Department with ID ${deptIdToDelete} not found for deletion.`);
             return Promise.reject(new Error(`Department ${deptIdToDelete} not found.`)); // Indicate failure
        }

        // Remove Associated Designations
        setDesignations(prevDesignations => {
            const initialLength = prevDesignations.length;
            const newState = prevDesignations.filter(des => des.departmentId !== deptIdToDelete);
             if (newState.length < initialLength) {
                console.log(`CONTEXT (Department): Removed ${initialLength - newState.length} designations associated with Dept ID ${deptIdToDelete}. New state:`, newState);
             }
            return newState;
        });

        // Return resolved promise ONLY if department was found and removed
        return Promise.resolve();

    }, []);

    // --- Designation Functions ---
     const addDesignation = useCallback(({ name, departmentId, status = 'Active' }) => {
        const trimmedName = name?.trim();
        if (!trimmedName || !departmentId) {
            console.error("Cannot add designation without name and departmentId"); return;
        }
        // Ensure department exists
        if (!departments.some(d => d.id === departmentId)) {
             console.error(`Cannot add designation: Department ID "${departmentId}" does not exist.`);
             alert(`Cannot add designation: Department ID "${departmentId}" not found.`);
             return;
        }

        if (designations.some(d => d.name.toLowerCase() === trimmedName.toLowerCase() && d.departmentId === departmentId)) {
             console.warn(`Designation "${trimmedName}" already exists in department ID "${departmentId}".`);
             alert(`Designation "${trimmedName}" already exists in this department.`);
             return;
        }

        payrollApiService
            .addDesignation({ name: trimmedName, departmentId, status })
            .then((newDes) => {
                setDesignations(prev => [...prev, newDes].sort((a, b) => a.name.localeCompare(b.name)));
                console.log("CONTEXT (Department): Added designation.", newDes);
            })
            .catch((err) => {
                console.error('CONTEXT (Department): Failed to add designation', err);
                alert(`Failed to add designation: ${err.message}`);
            });
    }, [departments, designations]);

     const updateDesignationStatus = useCallback((desId, newStatus) => {
        console.log(`CONTEXT (Department): Updating Des ID ${desId} Status to ${newStatus}`);
         let found = false;
        setDesignations(prev => prev.map(des => {
            if (des.id === desId) {
                found = true;
                return { ...des, status: newStatus };
            }
            return des;
            }
        ));
         if (!found) {
             console.warn(`CONTEXT (Department): Designation ${desId} not found for status update.`);
         }
    }, []); // Dependency array is empty

    // --- deleteDesignation: ONLY removes the designation ---
    // --- Employee check MUST happen in the component calling this ---
    const deleteDesignation = useCallback((desIdToDelete) => {
        console.log(`CONTEXT (Department): Deleting Designation ID ${desIdToDelete}`);
        let found = false;
        setDesignations(prevDesignations => {
            const initialLength = prevDesignations.length;
            const newState = prevDesignations.filter(des => des.id !== desIdToDelete);
            if (newState.length < initialLength) {
                 found = true;
                 console.log("CONTEXT (Department): Designation removed. New state:", newState);
            }
            return newState;
        });

        if (!found) {
             console.warn(`CONTEXT (Department): Designation with ID ${desIdToDelete} not found.`);
            return Promise.reject(new Error(`Designation ${desIdToDelete} not found.`)); // Indicate failure
        }

         return Promise.resolve(); // Indicate success

    }, []); // Dependency array is empty


     // --- Helper Functions (Getters) ---
     // These are fine as they only read internal state
     const getDepartmentById = useCallback((id) => {
        return departments.find(dept => dept.id === id);
     }, [departments]);

     const getDesignationById = useCallback((id) => {
        return designations.find(des => des.id === id);
     }, [designations]);

     const getDesignationsByDepartment = useCallback((departmentId) => {
         if (!departmentId) return [];
         return designations.filter(des => des.departmentId === departmentId);
     }, [designations]);

    // --- Memoize Context Value ---
    const value = useMemo(() => {
         const contextValue = {
             departments,
             designations,
             addDepartment,
             updateDepartmentStatus,
             deleteDepartment,         // Provides the cleaned-up delete function
             addDesignation,
             updateDesignationStatus,
             deleteDesignation,        // Provides the cleaned-up delete function
             getDepartmentById,
             getDesignationById,
             getDesignationsByDepartment
         };
         return contextValue;
    }, [
        departments,
        designations,
        addDepartment,
        updateDepartmentStatus,
        deleteDepartment,
        addDesignation,
        updateDesignationStatus,
        deleteDesignation,
        getDepartmentById,
        getDesignationById,
        getDesignationsByDepartment
    ]); // Ensure all returned values are dependencies

    return (
        <DepartmentContext.Provider value={value}>
            {children}
        </DepartmentContext.Provider>
    );
};
