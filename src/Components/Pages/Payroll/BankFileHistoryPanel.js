// src/Components/Pages/Payroll/BankFileHistoryPanel.js
//
// Lists previously generated bank disbursement batches for a payroll run
// (filename, generated-at, version, status) with a "Download" button per
// row. Every generated batch is persisted (never regenerated on demand),
// so re-downloading an older version returns exactly what was originally
// produced for it.
//
// For an icici_bulk_salary_txt_v1 batch, also shows:
// - "Submit to ICICI (API)": disabled with a tooltip if the backend
//   reports ICICI credentials aren't configured (iciciConfigStatus prop,
//   fetched once by PayBatchPage via GET /icici/config-status). Otherwise
//   drives the two-step OTP flow — first click triggers the OTP SMS, an
//   inline input then collects the OTP for the second click which
//   actually submits the file.
// - "Check Status": shown once the batch has an icici_file_sequence_num
//   (i.e. has been submitted), calls the Reverse MIS status endpoint and
//   renders the per-beneficiary results inline.
import React, { useState } from "react";
import styles from "./BankFileHistoryPanel.module.css";
import { payrollRunApiService } from "../../../services/payrollRunApiService";

const ICICI_FORMAT_KEY = "icici_bulk_salary_txt_v1";

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

const BankFileHistoryPanel = ({ batches, runId, iciciConfigStatus, onBatchUpdated }) => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [otpByBatch, setOtpByBatch] = useState({});
  const [submitErrorByBatch, setSubmitErrorByBatch] = useState({});
  const [submitMessageByBatch, setSubmitMessageByBatch] = useState({});
  const [checkingStatusId, setCheckingStatusId] = useState(null);
  const [statusByBatch, setStatusByBatch] = useState({});
  const [statusErrorByBatch, setStatusErrorByBatch] = useState({});

  if (!batches || batches.length === 0) {
    return <p className={styles.empty}>No bank files generated yet for this run.</p>;
  }

  const handleDownload = async (batch) => {
    setDownloadingId(batch.id);
    try {
      await payrollRunApiService.downloadDisbursementBatch(batch.id, batch.fileName);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSubmit = async (batch) => {
    setSubmittingId(batch.id);
    setSubmitErrorByBatch((prev) => ({ ...prev, [batch.id]: null }));
    try {
      const otp = otpByBatch[batch.id];
      const result = await payrollRunApiService.submitDisbursementBatchToICICI(runId, batch.id, otp);
      setSubmitMessageByBatch((prev) => ({ ...prev, [batch.id]: result.message }));
      if (!result.otpRequested) {
        // Bulk payment call completed — clear the OTP field.
        setOtpByBatch((prev) => ({ ...prev, [batch.id]: "" }));
      }
      // Refresh either way: the OTP-request step sets icici_otp_pending on
      // the batch (so the OTP input appears), and the final submit step
      // sets icici_file_sequence_num (so the Check Status button appears).
      if (onBatchUpdated) onBatchUpdated();
    } catch (err) {
      setSubmitErrorByBatch((prev) => ({ ...prev, [batch.id]: err.message || "Submission to ICICI failed." }));
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCheckStatus = async (batch) => {
    setCheckingStatusId(batch.id);
    setStatusErrorByBatch((prev) => ({ ...prev, [batch.id]: null }));
    try {
      const result = await payrollRunApiService.getDisbursementBatchICICIStatus(runId, batch.id);
      setStatusByBatch((prev) => ({ ...prev, [batch.id]: result }));
    } catch (err) {
      setStatusErrorByBatch((prev) => ({ ...prev, [batch.id]: err.message || "Status check failed." }));
    } finally {
      setCheckingStatusId(null);
    }
  };

  const iciciDisabledReason = !iciciConfigStatus
    ? "Checking ICICI configuration..."
    : !iciciConfigStatus.configured
    ? `ICICI API credentials not configured — missing: ${(iciciConfigStatus.missingFields || []).join(", ")}. ` +
      "Obtain these from your ICICI relationship manager and set them in backend/.env."
    : null;

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Version</th>
            <th>File Name</th>
            <th>Format</th>
            <th>Generated At</th>
            <th>Employees</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => {
            const isIciciFormat = batch.formatKey === ICICI_FORMAT_KEY;
            const isSubmitted = Boolean(batch.iciciFileSequenceNum);
            return (
              <React.Fragment key={batch.id}>
                <tr>
                  <td>
                    <span className={styles.versionBadge}>v{batch.version}</span>
                  </td>
                  <td>{batch.fileName}</td>
                  <td>{batch.formatKey}</td>
                  <td>{formatDateTime(batch.generatedAt)}</td>
                  <td>{batch.totalEmployeeCount}</td>
                  <td>₹{Number(batch.totalAmount).toFixed(2)}</td>
                  <td>{batch.status}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.downloadButton}
                      onClick={() => handleDownload(batch)}
                      disabled={downloadingId === batch.id}
                    >
                      {downloadingId === batch.id ? "Downloading..." : "Download"}
                    </button>
                  </td>
                </tr>
                {isIciciFormat && (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.iciciPanel}>
                        {!isSubmitted && (
                          <div className={styles.iciciSubmitRow}>
                            {batch.iciciOtpPending && (
                              <input
                                type="text"
                                className={styles.otpInput}
                                placeholder="Enter OTP"
                                value={otpByBatch[batch.id] || ""}
                                onChange={(e) =>
                                  setOtpByBatch((prev) => ({ ...prev, [batch.id]: e.target.value }))
                                }
                              />
                            )}
                            <button
                              type="button"
                              className={styles.downloadButton}
                              onClick={() => handleSubmit(batch)}
                              disabled={Boolean(iciciDisabledReason) || submittingId === batch.id}
                              title={iciciDisabledReason || undefined}
                            >
                              {submittingId === batch.id
                                ? "Submitting..."
                                : batch.iciciOtpPending
                                ? "Confirm OTP & Submit"
                                : "Submit to ICICI (API)"}
                            </button>
                          </div>
                        )}
                        {submitMessageByBatch[batch.id] && (
                          <p className={styles.iciciMessage}>{submitMessageByBatch[batch.id]}</p>
                        )}
                        {submitErrorByBatch[batch.id] && (
                          <p className={styles.iciciError}>{submitErrorByBatch[batch.id]}</p>
                        )}

                        {isSubmitted && (
                          <div className={styles.iciciSubmitRow}>
                            <span>File Sequence No: {batch.iciciFileSequenceNum}</span>
                            <button
                              type="button"
                              className={styles.downloadButton}
                              onClick={() => handleCheckStatus(batch)}
                              disabled={checkingStatusId === batch.id}
                            >
                              {checkingStatusId === batch.id ? "Checking..." : "Check Status"}
                            </button>
                          </div>
                        )}
                        {statusErrorByBatch[batch.id] && (
                          <p className={styles.iciciError}>{statusErrorByBatch[batch.id]}</p>
                        )}
                        {statusByBatch[batch.id] && (
                          <div className={styles.iciciStatusBlock}>
                            <p>
                              File status: <strong>{statusByBatch[batch.id].fileStatusCode}</strong> —{" "}
                              {statusByBatch[batch.id].fileStatusDescription}
                            </p>
                            {statusByBatch[batch.id].transactions.length > 0 && (
                              <table className={styles.table}>
                                <thead>
                                  <tr>
                                    <th>Credit A/c</th>
                                    <th>IFSC</th>
                                    <th>Amount</th>
                                    <th>Host Status</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {statusByBatch[batch.id].transactions.map((txn, idx) => (
                                    <tr key={idx}>
                                      <td>{txn.creditAccountNumber || txn.raw}</td>
                                      <td>{txn.ifscCode}</td>
                                      <td>{txn.totalAmount}</td>
                                      <td>{txn.hostResponseMessage || txn.transactionStatus}</td>
                                      <td>{txn.transactionRemarks}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BankFileHistoryPanel;
