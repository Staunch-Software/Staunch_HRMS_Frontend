// src/Components/Pages/Payroll/RunStatusBadge.js
//
// Shared "status + source" badge pair for a payroll run — shown everywhere
// a run appears (RunPayrollPage's list, PayrollRunDetailPage's header) so
// nobody mistakes an externally-computed (Excel-imported) figure for
// something the in-app engine verified. Minimal inline styling per spec —
// no dedicated .module.css.
import React from "react";

const STATUS_COLORS = {
  Draft: { background: "#e9ecef", color: "#495057" },
  Processing: { background: "#cfe2ff", color: "#084298" },
  Calculated: { background: "#cfe2ff", color: "#084298" },
  PendingApproval: { background: "#fff3cd", color: "#7a5b00" },
  Approved: { background: "#d1f7dd", color: "#157347" },
  Paid: { background: "#198754", color: "#fff" },
  Cancelled: { background: "#f8d7da", color: "#842029" },
  Failed: { background: "#f8d7da", color: "#842029" },
};

const SOURCE_INFO = {
  InAppCalculation: {
    label: "Calculated In-App",
    background: "#e7e0fb",
    color: "#4c2a85",
    title: "This run's figures were computed by the in-app payroll calculation engine.",
  },
  ExcelFinalUpload: {
    label: "Imported — Final Figures",
    background: "#ffe8cc",
    color: "#8a4b00",
    title:
      "This run's figures were imported directly from an uploaded final payroll sheet — the calculation engine was not used to produce them.",
  },
};

const badgeBaseStyle = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "0.8rem",
  fontWeight: 600,
};

const RunStatusBadge = ({ status, source }) => {
  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  const sourceInfo = SOURCE_INFO[source];

  return (
    <span style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
      <span style={{ ...badgeBaseStyle, ...statusStyle }}>{status}</span>
      {sourceInfo && (
        <span
          title={sourceInfo.title}
          style={{ ...badgeBaseStyle, background: sourceInfo.background, color: sourceInfo.color }}
        >
          {sourceInfo.label}
        </span>
      )}
    </span>
  );
};

export default RunStatusBadge;
