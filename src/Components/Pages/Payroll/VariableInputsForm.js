// src/Components/Pages/Payroll/VariableInputsForm.js
//
// Manual per-employee variable-input entry (present days / LOP / overtime /
// one ad-hoc earning + one ad-hoc deduction) for a run's period, before
// calculating. This is a stopgap for Phase 2 — Phase 3's Excel bulk upload
// replaces manual entry as the primary path, so this stays intentionally
// simple (no bulk paste, no validation beyond basic number parsing).
import React, { useEffect, useState, useCallback } from "react";
import styles from "./VariableInputsForm.module.css";
import { payrollRunApiService } from "../../../services/payrollRunApiService";

const blankRow = () => ({
  presentDays: "",
  lopDays: "0",
  overtimeHours: "0",
  adHocEarningCode: "",
  adHocEarningAmount: "",
  adHocDeductionCode: "",
  adHocDeductionAmount: "",
  saved: false,
});

const VariableInputsForm = ({ employees, periodStart, periodEnd, disabled }) => {
  const [rows, setRows] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!periodStart || !periodEnd) return;
    try {
      const existing = await payrollRunApiService.listVariableInputs(periodStart, periodEnd);
      const byEmployee = {};
      existing.forEach((vi) => {
        byEmployee[vi.employeeId] = {
          presentDays: vi.presentDays ?? "",
          lopDays: String(vi.lopDays ?? 0),
          overtimeHours: String(vi.overtimeHours ?? 0),
          adHocEarningCode: vi.adHocEarnings?.[0]?.componentCode || "",
          adHocEarningAmount: vi.adHocEarnings?.[0]?.amount ?? "",
          adHocDeductionCode: vi.adHocDeductions?.[0]?.componentCode || "",
          adHocDeductionAmount: vi.adHocDeductions?.[0]?.amount ?? "",
          saved: true,
          status: vi.status,
        };
      });
      setRows(byEmployee);
    } catch (err) {
      setError(err.message || "Failed to load existing variable inputs.");
    }
  }, [periodStart, periodEnd]);

  useEffect(() => {
    load();
  }, [load]);

  const getRow = (employeeId) => rows[employeeId] || blankRow();

  const updateRow = (employeeId, field, value) => {
    setRows((prev) => ({
      ...prev,
      [employeeId]: { ...getRow(employeeId), [field]: value, saved: false },
    }));
  };

  const handleSave = async (employeeId) => {
    const row = getRow(employeeId);
    setSavingId(employeeId);
    setError("");
    try {
      const adHocEarnings = row.adHocEarningCode
        ? [{ componentCode: row.adHocEarningCode, amount: row.adHocEarningAmount || 0 }]
        : [];
      const adHocDeductions = row.adHocDeductionCode
        ? [{ componentCode: row.adHocDeductionCode, amount: row.adHocDeductionAmount || 0 }]
        : [];
      await payrollRunApiService.upsertVariableInput({
        employeeId,
        periodStart,
        periodEnd,
        presentDays: row.presentDays,
        lopDays: row.lopDays,
        overtimeHours: row.overtimeHours,
        adHocEarnings,
        adHocDeductions,
      });
      setRows((prev) => ({ ...prev, [employeeId]: { ...row, saved: true } }));
    } catch (err) {
      setError(err.message || "Failed to save variable input.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Present Days</th>
            <th>LOP Days</th>
            <th>OT Hours</th>
            <th>Ad-hoc Earning (code / amount)</th>
            <th>Ad-hoc Deduction (code / amount)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(employees || []).map((emp) => {
            const empId = emp.id;
            const row = getRow(empId);
            return (
              <tr key={empId}>
                <td>
                  {emp.firstName} {emp.lastName || ""} ({emp.employeeId})
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    value={row.presentDays}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "presentDays", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    value={row.lopDays}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "lopDays", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className={styles.input}
                    value={row.overtimeHours}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "overtimeHours", e.target.value)}
                  />
                </td>
                <td className={styles.pairCell}>
                  <input
                    type="text"
                    placeholder="e.g. TRAVEL_REIM"
                    className={styles.inputSmall}
                    value={row.adHocEarningCode}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "adHocEarningCode", e.target.value.toUpperCase())}
                  />
                  <input
                    type="number"
                    placeholder="amount"
                    className={styles.inputSmall}
                    value={row.adHocEarningAmount}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "adHocEarningAmount", e.target.value)}
                  />
                </td>
                <td className={styles.pairCell}>
                  <input
                    type="text"
                    placeholder="e.g. CANTEEN"
                    className={styles.inputSmall}
                    value={row.adHocDeductionCode}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "adHocDeductionCode", e.target.value.toUpperCase())}
                  />
                  <input
                    type="number"
                    placeholder="amount"
                    className={styles.inputSmall}
                    value={row.adHocDeductionAmount}
                    disabled={disabled}
                    onChange={(e) => updateRow(empId, "adHocDeductionAmount", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className={styles.saveButton}
                    disabled={disabled || savingId === empId}
                    onClick={() => handleSave(empId)}
                  >
                    {row.saved ? "Saved" : savingId === empId ? "Saving..." : "Save"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VariableInputsForm;
