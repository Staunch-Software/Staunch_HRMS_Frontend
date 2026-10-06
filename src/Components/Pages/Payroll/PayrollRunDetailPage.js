// src/Components/Pages/Payroll/PayrollRunDetailPage.js
//
// Routed at payroll/run-payroll/:runId. Shows a run's status, lets the user
// enter variable inputs, calculate, review line items (with an expandable
// computation breakdown), and approve.
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PayrollRunDetailPage.module.css";
import { payrollRunApiService } from "../../../services/payrollRunApiService";
import { useEmployees } from "../../../Contexts/EmployeeContext";
import VariableInputsForm from "./VariableInputsForm";
import ExcelUploadModal from "./ExcelUploadModal";
import RunStatusBadge from "./RunStatusBadge";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const buildBlockingIssues = (lineItems) => {
  const issues = [];
  lineItems.forEach((li) => {
    const snapshot = li.employeeSnapshot || {};
    const name = snapshot.name || `Employee #${li.employeeId}`;

    if (snapshot.status && snapshot.status !== "Active") {
      issues.push(`${name}: employee status is '${snapshot.status}', not Active.`);
    }
    if (Number(li.netPay) <= 0) {
      issues.push(`${name}: net pay is ${Number(li.netPay).toFixed(2)} (must be greater than 0).`);
    }
    if (!snapshot.account_number || !snapshot.ifsc_code) {
      issues.push(`${name}: missing bank account number or IFSC code.`);
    } else if (!IFSC_REGEX.test(snapshot.ifsc_code)) {
      issues.push(`${name}: IFSC code '${snapshot.ifsc_code}' is not a valid format.`);
    }
  });
  return issues;
};

const buildDuplicateAccountWarnings = (lineItems) => {
  const byAccount = {};
  lineItems.forEach((li) => {
    const acct = li.employeeSnapshot && li.employeeSnapshot.account_number;
    if (!acct) return;
    const name = li.employeeSnapshot.name || `Employee #${li.employeeId}`;
    byAccount[acct] = byAccount[acct] || [];
    byAccount[acct].push(name);
  });
  return Object.entries(byAccount)
    .filter(([, names]) => names.length > 1)
    .map(([acct, names]) => `Account number ${acct} is shared by: ${names.join(", ")}.`);
};

const PayrollRunDetailPage = () => {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { employees } = useEmployees();

  const [run, setRun] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadModalMode, setUploadModalMode] = useState(null); // null | "variable-inputs" | "final-sheet"

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const runData = await payrollRunApiService.getPayrollRun(runId);
      setRun(runData);
      if (["Calculated", "PendingApproval", "Approved", "Paid"].includes(runData.status)) {
        const items = await payrollRunApiService.getRunLineItems(runId);
        setLineItems(items);
      }
    } catch (err) {
      setError(err.message || "Failed to load payroll run.");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCalculate = async () => {
    setBusy(true);
    setError("");
    try {
      await payrollRunApiService.calculateRun(runId);
      await load();
    } catch (err) {
      setError(err.message || "Calculation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    setBusy(true);
    setError("");
    try {
      await payrollRunApiService.approveRun(runId);
      await load();
    } catch (err) {
      setError(err.message || "Approval failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (!run) return <div className={styles.container}>Run not found.</div>;

  const activeEmployees = (employees || []).filter((e) => e.status === "Active");
  const canCalculate = ["Draft", "Calculated", "Failed"].includes(run.status);
  const canUpload = ["Draft", "Calculated", "Failed"].includes(run.status);
  const isCalculated = ["Calculated", "PendingApproval", "Approved", "Paid"].includes(run.status);
  const blockingIssues = isCalculated ? buildBlockingIssues(lineItems) : [];
  const duplicateWarnings = isCalculated ? buildDuplicateAccountWarnings(lineItems) : [];
  const canApprove = ["Calculated", "PendingApproval"].includes(run.status) && blockingIssues.length === 0;

  return (
    <div className={styles.container}>
      <button className={styles.backLink} onClick={() => navigate("/app/payroll/run-payroll")}>
        &larr; Back to Runs
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Payroll Run — {run.periodStart} to {run.periodEnd}
          </h1>
          <RunStatusBadge status={run.status} source={run.source} />
        </div>
        <div className={styles.actions}>
          {canUpload && (
            <>
              <button className={styles.calculateButton} onClick={() => setUploadModalMode("variable-inputs")} disabled={busy}>
                Upload Variable Inputs (Excel)
              </button>
              <button className={styles.calculateButton} onClick={() => setUploadModalMode("final-sheet")} disabled={busy}>
                Upload Final Payroll Sheet (Excel)
              </button>
            </>
          )}
          {canCalculate && (
            <button className={styles.calculateButton} onClick={handleCalculate} disabled={busy}>
              {busy ? "Calculating..." : "Calculate"}
            </button>
          )}
          {canApprove && (
            <button className={styles.approveButton} onClick={handleApprove} disabled={busy}>
              {busy ? "Approving..." : "Approve"}
            </button>
          )}
          {run.status === "Approved" && (
            <button
              className={styles.calculateButton}
              onClick={() => navigate(`/app/payroll/pay-batch?runId=${runId}`)}
            >
              Generate Bank File &rarr;
            </button>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {run.status === "Failed" && run.errorMessage && (
        <p className={styles.error}>Calculation failed: {run.errorMessage}</p>
      )}

      {isCalculated && blockingIssues.length > 0 && (
        <div className={styles.error}>
          <strong>Approval is blocked until these are fixed:</strong>
          <ul>
            {blockingIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {isCalculated && duplicateWarnings.length > 0 && (
        <div className={styles.warningBlock}>
          <strong>Warning — not blocking:</strong>
          <ul>
            {duplicateWarnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {uploadModalMode && (
        <ExcelUploadModal
          runId={runId}
          mode={uploadModalMode}
          onClose={() => setUploadModalMode(null)}
          onCommitted={load}
        />
      )}

      {run.totalNet != null && (
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span>Gross</span>
            <strong>₹{Number(run.totalGross).toFixed(2)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Deductions</span>
            <strong>₹{Number(run.totalDeductions).toFixed(2)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Net</span>
            <strong>₹{Number(run.totalNet).toFixed(2)}</strong>
          </div>
          <div className={styles.summaryCard}>
            <span>Employees</span>
            <strong>{run.employeeCount}</strong>
          </div>
        </div>
      )}

      {!isCalculated && (
        <>
          <h2 className={styles.sectionTitle}>Variable Inputs (before calculating)</h2>
          <VariableInputsForm
            employees={activeEmployees}
            periodStart={run.periodStart}
            periodEnd={run.periodEnd}
            disabled={busy}
          />
        </>
      )}

      {isCalculated && (
        <>
          <h2 className={styles.sectionTitle}>Line Items</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Reimbursements</th>
                <th>Net Pay</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li) => (
                <React.Fragment key={li.id}>
                  <tr>
                    <td>{li.employeeSnapshot?.name || li.employeeId}</td>
                    <td>₹{Number(li.grossEarnings).toFixed(2)}</td>
                    <td>₹{Number(li.totalDeductions).toFixed(2)}</td>
                    <td>₹{Number(li.totalReimbursements).toFixed(2)}</td>
                    <td>
                      <strong>₹{Number(li.netPay).toFixed(2)}</strong>
                    </td>
                    <td>{li.status}</td>
                    <td>
                      <button
                        className={styles.expandButton}
                        onClick={() => setExpandedId(expandedId === li.id ? null : li.id)}
                      >
                        {expandedId === li.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === li.id && (
                    <tr>
                      <td colSpan={7}>
                        <table className={styles.breakdownTable}>
                          <thead>
                            <tr>
                              <th>Component</th>
                              <th>Type</th>
                              <th>Method / Formula</th>
                              <th>Resolved Amount</th>
                              <th>Warning</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(li.computationBreakdown || []).map((entry, idx) => (
                              <tr key={idx}>
                                <td>{entry.component_name || entry.component_code}</td>
                                <td>{entry.component_type}</td>
                                <td>{entry.calculation_method || "-"} {entry.formula_or_value ? `(${entry.formula_or_value})` : ""}</td>
                                <td>₹{Number(entry.resolved_amount || 0).toFixed(2)}</td>
                                <td className={styles.warning}>{entry.warning || ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PayrollRunDetailPage;
