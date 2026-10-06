// src/Contexts/ReferenceDataContext.js
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const ReferenceDataContext = createContext();

export const useReferenceData = () => {
    const context = useContext(ReferenceDataContext);
    if (!context) {
        throw new Error('useReferenceData must be used within a ReferenceDataProvider');
    }
    return context;
};

// --- Initial Dummy Data ---
const initialLocations = [
    { id: 'loc_ny', name: 'Chennai' },
    { id: 'loc_sf', name: 'Mumbai' },
];
const initialDesignations = [
    // Now include departmentId and status
]
// --- End Initial Dummy Data ---

export const ReferenceDataProvider = ({ children }) => {
    const [locations, setLocations] = useState(initialLocations);
    const [designations, setDesignations] = useState(initialDesignations);
    // --- Loading/Error states (optional but good practice) ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Add Location Function ---
    const addLocation = useCallback((locationName) => {
        const trimmedName = locationName.trim();
        if (!trimmedName) return;
        setLocations(prev => {
            if (prev.some(loc => loc.name.toLowerCase() === trimmedName.toLowerCase())) {
                console.warn(`Location "${trimmedName}" already exists.`);
                return prev;
            }
            const newLoc = { id: `loc_${Date.now()}`, name: trimmedName };
            return [...prev, newLoc].sort((a, b) => a.name.localeCompare(b.name));
        });
    }, []);

    // --- Add Designation Function (Now requires departmentId) ---
    const addDesignation = useCallback((designationData) => {
        // Expect designationData = { name: '...', departmentId: '...' }
        const { name, departmentId } = designationData;
        const trimmedName = name.trim();

        if (!trimmedName || !departmentId) {
            console.error("Designation name and department ID are required.");
            // throw new Error("Designation name and department ID are required.");
            return; // Or handle error appropriately
        }

        console.log("CONTEXT (ReferenceData): Adding Designation", designationData);

        setDesignations(prev => {
            // Check for duplicate *within the same department*
            const exists = prev.some(d =>
                d.name.toLowerCase() === trimmedName.toLowerCase() &&
                d.departmentId === departmentId
            );

            if (exists) {
                console.warn(`Designation "${trimmedName}" already exists in department ID ${departmentId}.`);
                return prev;
            }

            const newDesignation = {
                id: `des_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                name: trimmedName,
                departmentId: departmentId,
                status: 'Active', // Default status
                employeeCount: 0, // Initialize count if storing here (alternative: calculate dynamically)
            };
            const newState = [...prev, newDesignation].sort((a, b) => a.name.localeCompare(b.name));
            console.log("CONTEXT (ReferenceData): New designations state:", newState);
            return newState;
        });
         // Add API call logic here if needed
    }, []);

    // --- Function to get designations for a specific department ---
    const getDesignationsByDepartment = useCallback((departmentId) => {
        if (!departmentId) return []; // Return empty if no department is selected
        return designations.filter(des => des.departmentId === departmentId);
    }, [designations]); // Re-run only if the main designations list changes

     // --- Function to update designation status ---
     const updateDesignationStatus = useCallback((designationId, newStatus) => {
        setDesignations(prev => prev.map(des =>
            des.id === designationId ? { ...des, status: newStatus } : des
        ));
     }, []);

    // --- Memoize Context Value ---
    const value = useMemo(() => ({
        locations,
        designations, // Full list of designations
        addLocation,
        addDesignation,
        getDesignationsByDepartment, // Function to get filtered list
        updateDesignationStatus,   // Function to toggle status
        loading,
        error,
    }), [
        locations,
        designations,
        addLocation,
        addDesignation,
        getDesignationsByDepartment,
        updateDesignationStatus,
        loading,
        error
    ]);

    return (
        <ReferenceDataContext.Provider value={value}>
            {children}
        </ReferenceDataContext.Provider>
    );
};