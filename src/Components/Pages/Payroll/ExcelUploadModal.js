// src/Components/Pages/Payroll/ExcelUploadModal.js
//
// Shared two-step Excel upload modal for a payroll run — used for both the
// "variable-inputs" and "final-sheet" modes (Phase 3). Step 1: download a
// pre-filled template, pick/drop a file, upload for a server-side preview.
// Step 2: review parsed rows (UploadPreviewTable), then commit.
import React, { useRef, useState } from "react";
import modalStyles from "./ModalStyles.module.css";
import styles from "./ExcelUploadModal.module.css";
import UploadPreviewTable from "./UploadPreviewTable";
import { payrollRunApiService } from "../../../services/payrollRunApiService";

const MODE_LABELS = {
  "variable-inputs": "Variable Inputs",
  "final-sheet": "Final Payroll Sheet",
};

const ExcelUploadModal = ({ runId, mode, onClose, onCommitted }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const label = MODE_LABELS[mode] || "Excel";

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError("");
    try {
      if (mode === "final-sheet") {
        await payrollRunApiService.downloadFinalSheetTemplate(runId);
      } else {
        await payrollRunApiService.downloadVariableInputsTemplate(runId);
      }
    } catch (err) {
      setError(err.message || "Failed to download template.");
    } finally {
      setDownloading(false);
    }
  };

  const handleFileSelected = (selected) => {
    setFile(selected || null);
    setPreview(null);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files && e.dataTransfer.files[0];
    if (dropped) handleFileSelected(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result =
        mode === "final-sheet"
          ? await payrollRunApiService.uploadFinalSheet(runId, file)
          : await payrollRunApiService.uploadVariableInputs(runId, file);
      setPreview(result);
    } catch (err) {
      setError(err.message || "Failed to parse the uploaded file.");
    } finally {
      setUploading(false);
    }
  };

  const handleCommit = async () => {
    if (!preview) return;
    setCommitting(true);
    setError("");
    try {
      if (mode === "final-sheet") {
        await payrollRunApiService.commitFinalSheet(runId, preview.batch_id);
      } else {
        await payrollRunApiService.commitVariableInputs(runId, preview.batch_id);
      }
      onCommitted();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to commit the upload.");
    } finally {
      setCommitting(false);
    }
  };

  const handleBackToStep1 = () => {
    setPreview(null);
    setError("");
  };

  const canCommit = preview && preview.summary.error_count === 0 && !committing;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>Upload {label} (Excel)</h3>
          <button className={modalStyles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={modalStyles.modalBody}>
          {error && <p className={modalStyles.errorTextModal}>{error}</p>}

          {!preview ? (
            <>
              <div className={styles.step}>
                <span className={styles.stepLabel}>Step 1</span>
                <button
                  type="button"
                  className={styles.templateLink}
                  onClick={handleDownloadTemplate}
                  disabled={downloading}
                >
                  {downloading ? "Preparing template..." : `Download ${label} Template`}
                </button>
              </div>

              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  className={styles.hiddenInput}
                  onChange={(e) => handleFileSelected(e.target.files && e.target.files[0])}
                />
                {file ? (
                  <p>{file.name}</p>
                ) : (
                  <p>Drag &amp; drop the filled-in .xlsx here, or click to choose a file.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={styles.step}>
                <span className={styles.stepLabel}>Step 2</span> Review parsed rows
              </div>
              <UploadPreviewTable preview={preview} />
            </>
          )}
        </div>

        <div className={modalStyles.modalActions}>
          {preview && (
            <button type="button" className={modalStyles.cancelButton} onClick={handleBackToStep1}>
              Back
            </button>
          )}
          <button type="button" className={modalStyles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {!preview ? (
            <button
              type="button"
              className={modalStyles.saveButton}
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload & Preview"}
            </button>
          ) : (
            <button
              type="button"
              className={modalStyles.saveButton}
              onClick={handleCommit}
              disabled={!canCommit}
            >
              {committing ? "Applying..." : "Confirm & Apply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;
