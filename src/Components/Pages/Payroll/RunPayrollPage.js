// src/Components/Pages/Payroll/RunPayrollPage.js
//
// Replaces the RunPayrollPage placeholder in App.js. A minimal run list +
// "Create Run" flow, just enough to drive the Phase 2 calc engine
// end-to-end. Excel-driven creation/upload is Phase 3.
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RunPayrollPage.module.css";
import modalStyles from "./ModalStyles.module.css";
import { payrollRunApiService } from "../../../services/payrollRunApiService";
import { payrollApiService } from "../../../services/payrollApiService";
import RunStatusBadge from "./RunStatusBadge";

const emptyForm = {
  payScheduleId: "",
  periodStart: "",
  periodEnd: "",
  payDate: "",
  runType: "Regular",
};

const RunPayrollPage = () => {
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [runList, scheduleList] = await Promise.all([
        payrollRunApiService.listPayrollRuns(),
        payrollApiService.getPaySchedules(),
      ]);
      setRuns(runList);
      setSchedules(scheduleList);
    } catch (err) {
      setError(err.message || "Failed to load payroll runs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const scheduleName = (id) => schedules.find((s) => s.id === id)?.scheduleName || "Unknown";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.payScheduleId || !form.periodStart || !form.periodEnd || !form.payDate) {
      setError("Pay schedule, period start/end, and pay date are all required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await payrollRunApiService.createPayrollRun(form);
      setIsModalOpen(false);
      setForm(emptyForm);
      await load();
      navigate(`/app/payroll/run-payroll/${created.id}`);
    } catch (err) {
      setError(err.message || "Failed to create payroll run.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Run Payroll</h1>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + Create Run
        </button>
      </div>

      {error && <p className={modalStyles.errorTextModal}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : runs.length === 0 ? (
        <p>No payroll runs yet. Create one to get started.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Pay Schedule</th>
              <th>Pay Date</th>
              <th>Run Type</th>
              <th>Status</th>
              <th>Net Pay</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>
                  {run.periodStart} to {run.periodEnd}
                </td>
                <td>{scheduleName(run.payScheduleId)}</td>
                <td>{run.payDate}</td>
                <td>{run.runType}</td>
                <td>
                  <RunStatusBadge status={run.status} source={run.source} />
                </td>
                <td>{run.totalNet != null ? `₹${Number(run.totalNet).toFixed(2)}` : "—"}</td>
                <td>
                  <button
                    className={styles.viewButton}
                    onClick={() => navigate(`/app/payroll/run-payroll/${run.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h3 className={modalStyles.modalTitle}>Create Payroll Run</h3>
              <button className={modalStyles.closeButton} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className={modalStyles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="payScheduleId">Pay Schedule *</label>
                  <select
                    id="payScheduleId"
                    name="payScheduleId"
                    value={form.payScheduleId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a pay schedule</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.scheduleName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="periodStart">Period Start *</label>
                  <input type="date" id="periodStart" name="periodStart" value={form.periodStart} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="periodEnd">Period End *</label>
                  <input type="date" id="periodEnd" name="periodEnd" value={form.periodEnd} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="payDate">Pay Date *</label>
                  <input type="date" id="payDate" name="payDate" value={form.payDate} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="runType">Run Type</label>
                  <select id="runType" name="runType" value={form.runType} onChange={handleChange}>
                    <option value="Regular">Regular</option>
                    <option value="OffCycle">Off Cycle</option>
                    <option value="FinalSettlement">Final Settlement</option>
                  </select>
                </div>
              </div>
              <div className={modalStyles.modalActions}>
                <button type="button" className={modalStyles.cancelButton} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={modalStyles.saveButton} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Run"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunPayrollPage;
