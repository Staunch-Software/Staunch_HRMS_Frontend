import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { employeeApiService } from '../services/employeeApiService';

const EmployeeContext = createContext(null);

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
      throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    let cancelled = false;
    employeeApiService
      .getEmployees()
      .then((data) => {
        if (!cancelled) setEmployees(data);
      })
      .catch((err) => {
        console.error('CONTEXT (Employee): Failed to load employees from backend', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addEmployee = useCallback((newEmployeeData) => {
    if (!newEmployeeData.departmentCode) {
        console.error("Employee data submitted without departmentCode");
        alert("Failed to add employee: Missing required Department Code.");
        return;
    }
    if (!newEmployeeData.designation) {
         console.error("Employee data submitted without designation name");
         alert("Failed to add employee: Missing required Designation Name.");
         return;
    }

    if (employees.some(emp => emp.employeeId === newEmployeeData.employeeId && newEmployeeData.employeeId)) {
        console.warn(`Employee ID "${newEmployeeData.employeeId}" already exists.`);
        alert(`Employee ID "${newEmployeeData.employeeId}" already exists.`);
        return;
    }

    const submissionData = {
      ...newEmployeeData,
      employeeId: newEmployeeData.employeeId || `EMP${Date.now()}`,
      status: newEmployeeData.status || 'Active',
    };

    // Returns the created employee so callers that need the new id (e.g. to
    // immediately assign salary components) can await it; existing
    // fire-and-forget callers are unaffected since they don't use the
    // return value. Errors are surfaced via alert (existing style) and
    // re-thrown so an awaiting caller can also react (e.g. skip a
    // follow-up step) instead of only getting undefined.
    return employeeApiService
      .addEmployee(submissionData)
      .then((createdEmployee) => {
        setEmployees((prevEmployees) => [...prevEmployees, createdEmployee]);
        console.log("CONTEXT (Employee): Added employee", createdEmployee);
        return createdEmployee;
      })
      .catch((err) => {
        console.error("CONTEXT (Employee): Failed to add employee", err);
        alert(`Failed to add employee: ${err.message}`);
        throw err;
      });
  }, [employees]);

  const updateEmployee = useCallback((employeeIdentifier, employeeData) => {
    const target = employees.find(
      (emp) => emp.id === employeeIdentifier || emp.employeeId === employeeIdentifier
    );
    if (!target) {
      console.warn(`CONTEXT (Employee): Employee ${employeeIdentifier} not found for update.`);
      return Promise.resolve(undefined);
    }
    return employeeApiService
      .updateEmployee(target.id, employeeData)
      .then((updatedEmployee) => {
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) => (emp.id === target.id ? updatedEmployee : emp))
        );
        return updatedEmployee;
      })
      .catch((err) => {
        console.error("CONTEXT (Employee): Failed to update employee", err);
        alert(`Failed to update employee: ${err.message}`);
        throw err;
      });
  }, [employees]);

  const updateEmployeeStatus = useCallback((employeeIdentifier, newStatus) => {
    console.log(`CONTEXT (Employee): Updating ID ${employeeIdentifier} to Status ${newStatus}`);
    const target = employees.find(
      (emp) => emp.id === employeeIdentifier || emp.employeeId === employeeIdentifier
    );
    if (!target) {
        console.warn(`CONTEXT (Employee): Employee ${employeeIdentifier} not found for status update.`);
        return;
    }
    employeeApiService
      .updateEmployeeStatus(target.id, newStatus)
      .then(() => {
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) => (emp.id === target.id ? { ...emp, status: newStatus } : emp))
        );
      })
      .catch((err) => {
        console.error(`CONTEXT (Employee): Failed to update status for ${employeeIdentifier}`, err);
        alert(`Failed to update employee status: ${err.message}`);
      });
  }, [employees]);

  const deleteEmployee = useCallback((employeeIdentifierToDelete) => {
    console.log(`CONTEXT (Employee): Attempting to delete Employee ID/Ref ${employeeIdentifierToDelete}`);
    const target = employees.find(
      (emp) => emp.id === employeeIdentifierToDelete || emp.employeeId === employeeIdentifierToDelete
    );
    if (!target) {
        console.warn(`CONTEXT (Employee): Employee ${employeeIdentifierToDelete} not found for deletion.`);
        return Promise.resolve();
    }
    return employeeApiService
      .deleteEmployee(target.id)
      .then(() => {
        setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== target.id));
        console.log(`CONTEXT (Employee): Employee ${employeeIdentifierToDelete} deleted.`);
      })
      .catch((err) => {
        console.error(`CONTEXT (Employee): Failed to delete ${employeeIdentifierToDelete}`, err);
        throw err;
      });
  }, [employees]);

   const getEmployeeById = useCallback((id) => {
       return employees.find(emp => emp.id === id || emp.employeeId === id);
   }, [employees]);

   const getEmployeesByDepartmentCode = useCallback((deptCode) => {
       if (!deptCode) return [];
       return employees.filter(emp => emp.departmentCode?.toUpperCase() === deptCode.toUpperCase());
   }, [employees]);

   const getEmployeesByDesignationName = useCallback((desName, deptCode) => {
       if (!desName || !deptCode) return [];
       return employees.filter(emp =>
           emp.designation?.toLowerCase() === desName.toLowerCase() &&
           emp.departmentCode?.toUpperCase() === deptCode.toUpperCase()
       );
   }, [employees]);


  const value = useMemo(() => ({
    employees,
    addEmployee,
    updateEmployee,
    updateEmployeeStatus,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDepartmentCode,
    getEmployeesByDesignationName,
  }), [
    employees,
    addEmployee,
    updateEmployee,
    updateEmployeeStatus,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByDepartmentCode,
    getEmployeesByDesignationName,
  ]);

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};
