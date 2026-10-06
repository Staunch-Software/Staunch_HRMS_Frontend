// src/Components/Pages/Employee/SalaryStructureAssignment.js
//
// Lets an admin assign real salary components (from the salary-components
// catalog) to an employee, with an optional per-employee value override,
// and end an existing assignment. This replaces the dead allowanceA/
// allowanceB/deductionX fields from the Add-Employee wizard's SalaryDetails
// step (src/Components/Pages/Employee/SalaryDetails.js) with a link into the
// real component catalog — those wizard fields are left in place as legacy,
// display-only inputs (they were never wired to the backend to begin with)
// since reworking the multi-step Add-Employee flow itself is out of scope
// for this phase; this modal is the actual, functional way to assign salary
// structure, opened from the Employee List's row actions.
import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "../Payroll/ModalStyles.module.css";
import styles from "./SalaryStructureAssignment.module.css";
import { payrollApiService } from "../../../services/payrollApiService";
import { employeeApiService } from "../../../services/employeeApiService";

const todayIso = () => new Date().toISOString().slice(0, 10);

const SalaryStructureAssignment = ({ employee, isOpen, onClose }) => {
  const [components, setComponents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingCode, setSavingCode] = useState(null);

  const employeeId = employee?.id;

  const reload = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const [allComponents, structure] = await Promise.all([
        payrollApiService.getSalaryComponents(),
        employeeApiService.getSalaryStructure(employeeId),
      ]);
      setComponents(allComponents.filter((c) => c.status !== false));
      setAssignments(structure);
    } catch (err) {
      setError(err.message || "Failed to load salary structure.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, reload]);

  if (!isOpen || !employee) return null;

  const assignmentByComponentId = assignments.reduce((map, row) => {
    map[row.salaryComponentId] = row;
    return map;
  }, {});

  const handleAssign = async (component) => {
    setSavingCode(component.code);
    setError("");
    try {
      const overrideValue = overrides[component.id];
      await employeeApiService.assignSalaryComponent(employeeId, {
        salaryComponentId: component.id,
        valueOverride: overrideValue !== undefined && overrideValue !== "" ? overrideValue : null,
        effectiveFrom: todayIso(),
      });
      await reload();
    } catch (err) {
      setError(err.message || `Failed to assign ${component.name}.`);
    } finally {
      setSavingCode(null);
    }
  };

  const handleEnd = async (assignment, component) => {
    setSavingCode(component.code);
    setError("");
    try {
      await employeeApiService.endSalaryStructureAssignment(assignment.id);
      await reload();
    } catch (err) {
      setError(err.message || `Failed to end assignment for ${component.name}.`);
    } finally {
      setSavingCode(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>
            Salary Structure — {employee.firstName} {employee.lastName || ""} (
            {employee.employeeId || employeeId})
          </h3>
          <button className={modalStyles.closeButton} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={modalStyles.modalBody}>
          {error && <p className={modalStyles.errorTextModal}>{error}</p>}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Type</th>
                  <th>Default Value</th>
                  <th>Override</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {components.map((component) => {
                  const assignment = assignmentByComponentId[component.id];
                  const isAssigned = !!assignment;
                  return (
                    <tr key={component.id}>
                      <td>{component.name} <span className={styles.code}>({component.code})</span></td>
                      <td>{component.componentType}</td>
                      <td>{component.value ?? "—"}</td>
                      <td>
                        {isAssigned ? (
                          assignment.valueOverride ?? <span className={styles.muted}>none</span>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            className={styles.overrideInput}
                            placeholder="optional"
                            value={overrides[component.id] ?? ""}
                            onChange={(e) =>
                              setOverrides((prev) => ({ ...prev, [component.id]: e.target.value }))
                            }
                          />
                        )}
                      </td>
                      <td>
                        {isAssigned ? (
                          <span className={styles.badgeActive}>Assigned</span>
                        ) : (
                          <span className={styles.badgeInactive}>Not assigned</span>
                        )}
                      </td>
                      <td>
                        {isAssigned ? (
                          <button
                            className={styles.endButton}
                            disabled={savingCode === component.code}
                            onClick={() => handleEnd(assignment, component)}
                          >
                            End
                          </button>
                        ) : (
                          <button
                            className={styles.assignButton}
                            disabled={savingCode === component.code}
                            onClick={() => handleAssign(component)}
                          >
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className={modalStyles.modalActions}>
          <button className={modalStyles.cancelButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryStructureAssignment;
