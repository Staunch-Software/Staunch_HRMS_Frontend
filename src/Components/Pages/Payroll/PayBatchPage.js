// src/Components/Pages/Payroll/PayBatchPage.js
//
// Replaces the "Pay Batch" placeholder in App.js. Lists Approved payroll
// runs; each row can be expanded into an inline panel to generate a bank
// disbursement file (format_key dropdown + Generate button) and review
// that run's generation history (BankFileHistoryPanel). If generation is
// refused by the backend's blocking validation, the exact affected
// employees and reasons are shown here — the same style as the
// Approve-gate's blocking-issues list on PayrollRunDetailPage.js.
//
// IMPORTANT (see the plan's Phase 4 write-up): "generic_neft_xlsx_v1" is a
// PLACEHOLDER bank file layout, not verified against ICICI's actual
// bulk-upload template — it exists so the rest of the pipeline can be used
// today. Do not use a generated file for a real disbursement until it has
// been replaced with (or confirmed against) ICICI's real spec, and until
// the company_bank_config debit account is the company's real ICICI
// current account (seeded today with fake placeholder values).
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./PayBatchPage.module.css";
import { payrollRunApiService } from "../../../services/payrollRunApiService";
import { payrollApiService } from "../../../services/payrollApiService";
import RunStatusBadge from "./RunStatusBadge";
import BankFileHistoryPanel from "./BankFileHistoryPanel";

const FORMAT_OPTIONS = [
  {
    value: "generic_neft_xlsx_v1",
    label: "Generic NEFT/RTGS (placeholder — not ICICI-verified)",
  },
  {
    value: "icici_bulk_salary_txt_v1",
    label: "ICICI Bulk Salary (.txt) — real ICICI format",
  },
];

const PayBatchPage = () => {
  const [searchParams] = useSearchParams();
  const preselectRunId = searchParams.get("runId");

  const [runs, setRuns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openRunId, setOpenRunId] = useState(preselectRunId || null);
  const [formatKey, setFormatKey] = useState(FORMAT_OPTIONS[0].value);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null); // { message, issues, warnings }
  const [batchesByRun, setBatchesByRun] = useState({});
  const [loadingBatchesFor, setLoadingBatchesFor] = useState(null);
  const [iciciConfigStatus, setIciciConfigStatus] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [runList, scheduleList] = await Promise.all([
        payrollRunApiService.listPayrollRuns(),
        payrollApiService.getPaySchedules(),
      ]);
      setRuns(runList.filter((r) => r.status === "Approved"));
      setSchedules(scheduleList);
    } catch (err) {
      setError(err.message || "Failed to load approved payroll runs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Fetched once: tells the history panel whether to show "Submit to
  // ICICI" as enabled or greyed-out-with-a-tooltip. A failure here (e.g.
  // older backend without this endpoint) just leaves the button disabled
  // rather than breaking the page.
  useEffect(() => {
    payrollRunApiService
      .getICICIConfigStatus()
      .then(setIciciConfigStatus)
      .catch(() => setIciciConfigStatus({ configured: false, missingFields: [] }));
  }, []);

  const scheduleName = (id) => schedules.find((s) => s.id === id)?.scheduleName || "Unknown";

  const loadBatches = useCallback(async (runId) => {
    setLoadingBatchesFor(runId);
    try {
      const batches = await payrollRunApiService.listDisbursementBatches(runId);
      setBatchesByRun((prev) => ({ ...prev, [runId]: batches }));
    } catch (err) {
      setError(err.message || "Failed to load bank file history.");
    } finally {
      setLoadingBatchesFor(null);
    }
  }, []);

  useEffect(() => {
    if (preselectRunId) {
      loadBatches(preselectRunId);
    }
    // Only run once on mount for the pre-selected run from the query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRun = (runId) => {
    setGenerationError(null);
    if (openRunId === runId) {
      setOpenRunId(null);
      return;
    }
    setOpenRunId(runId);
    if (!batchesByRun[runId]) {
      loadBatches(runId);
    }
  };

  const handleGenerate = async (runId) => {
    setGenerating(true);
    setGenerationError(null);
    try {
      await payrollRunApiService.generateDisbursementBatch(runId, formatKey);
      await loadBatches(runId);
    } catch (err) {
      setGenerationError({
        message: err.message || "Bank file generation failed.",
        issues: (err.detail && err.detail.issues) || [],
        warnings: (err.detail && err.detail.warnings) || [],
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Pay Batch — Bank Disbursement Files</h1>
        <p className={styles.subtitle}>
          Generate a bank disbursement file for an Approved payroll run and re-download previously generated
          files below.
        </p>
      </div>

      <p className={styles.placeholderNotice}>
        <strong>generic_neft_xlsx_v1</strong> is a placeholder NEFT/RTGS layout, not verified against any bank's
        real template — kept only as a fallback/comparison. <strong>icici_bulk_salary_txt_v1</strong> is the real
        ICICI bulk salary format, transcribed from ICICI's own API documentation — but submitting it through the
        API below still needs real CORP_ID/USER_ID/AGGR_ID/AGGR_NAME/URN credentials from your ICICI relationship
        manager (see the "Submit to ICICI" button's tooltip). Either way, confirm the company's debit account
        details (Company Bank Config) are the real account, not the seeded placeholder, before a real disbursement.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : runs.length === 0 ? (
        <p>No Approved payroll runs yet. Approve a run first to generate its bank file.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Pay Schedule</th>
              <th>Pay Date</th>
              <th>Status</th>
              <th>Net Pay</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <React.Fragment key={run.id}>
                <tr>
                  <td>
                    {run.periodStart} to {run.periodEnd}
                  </td>
                  <td>{scheduleName(run.payScheduleId)}</td>
                  <td>{run.payDate}</td>
                  <td>
                    <RunStatusBadge status={run.status} source={run.source} />
                  </td>
                  <td>{run.totalNet != null ? `₹${Number(run.totalNet).toFixed(2)}` : "—"}</td>
                  <td>
                    <button type="button" className={styles.generateButton} onClick={() => toggleRun(run.id)}>
                      {openRunId === run.id ? "Hide" : "Generate Bank File"}
                    </button>
                  </td>
                </tr>
                {openRunId === run.id && (
                  <tr className={styles.runPanelRow}>
                    <td colSpan={6}>
                      <div className={styles.panelSection}>
                        <h3 className={styles.panelSectionTitle}>Generate a New Bank File</h3>
                        <div className={styles.generateForm}>
                          <div className={styles.formGroup}>
                            <label htmlFor={`format-${run.id}`}>Format</label>
                            <select
                              id={`format-${run.id}`}
                              value={formatKey}
                              onChange={(e) => setFormatKey(e.target.value)}
                            >
                              {FORMAT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            className={styles.generateButton}
                            onClick={() => handleGenerate(run.id)}
                            disabled={generating}
                          >
                            {generating ? "Generating..." : "Generate"}
                          </button>
                        </div>

                        {generationError && (
                          <>
                            <div className={styles.blockingIssues}>
                              <strong>{generationError.message}</strong>
                              {generationError.issues.length > 0 && (
                                <ul>
                                  {generationError.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            {generationError.warnings.length > 0 && (
                              <div className={styles.warningBlock}>
                                <strong>Warning — not blocking:</strong>
                                <ul>
                                  {generationError.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className={styles.panelSection}>
                        <h3 className={styles.panelSectionTitle}>Generation History</h3>
                        {loadingBatchesFor === run.id ? (
                          <p>Loading history...</p>
                        ) : (
                          <BankFileHistoryPanel
                            batches={batchesByRun[run.id] || []}
                            runId={run.id}
                            iciciConfigStatus={iciciConfigStatus}
                            onBatchUpdated={() => loadBatches(run.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PayBatchPage;
