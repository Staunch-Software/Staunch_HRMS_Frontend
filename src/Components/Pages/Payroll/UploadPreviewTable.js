// src/Components/Pages/Payroll/UploadPreviewTable.js
//
// Renders the parsed-row preview returned by an Excel upload endpoint
// ({ batch_id, rows: [{ row_number, data, errors, warnings }], summary }).
// Error rows are highlighted red with their specific message(s), warning
// rows amber — used inside ExcelUploadModal's Step 2.
import React from "react";
import styles from "./UploadPreviewTable.module.css";

const UploadPreviewTable = ({ preview }) => {
  if (!preview) return null;
  const { rows, summary } = preview;

  const columns = rows.length > 0 ? Object.keys(rows[0].data) : [];

  return (
    <div className={styles.container}>
      <p className={styles.summaryLine}>
        {summary.total_rows} row{summary.total_rows === 1 ? "" : "s"}, {summary.error_count} error
        {summary.error_count === 1 ? "" : "s"}, {summary.warning_count} warning
        {summary.warning_count === 1 ? "" : "s"}
      </p>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Row</th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const hasErrors = row.errors && row.errors.length > 0;
              const hasWarnings = row.warnings && row.warnings.length > 0;
              const rowClass = hasErrors
                ? styles.errorRow
                : hasWarnings
                ? styles.warningRow
                : "";
              return (
                <tr key={row.row_number} className={rowClass}>
                  <td>{row.row_number}</td>
                  {columns.map((col) => (
                    <td key={col}>
                      {row.data[col] === null || row.data[col] === undefined
                        ? ""
                        : typeof row.data[col] === "object"
                        ? JSON.stringify(row.data[col])
                        : String(row.data[col])}
                    </td>
                  ))}
                  <td className={styles.issuesCell}>
                    {(row.errors || []).map((msg, i) => (
                      <div key={`err-${i}`} className={styles.errorText}>
                        {msg}
                      </div>
                    ))}
                    {(row.warnings || []).map((msg, i) => (
                      <div key={`warn-${i}`} className={styles.warningText}>
                        {msg}
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadPreviewTable;
