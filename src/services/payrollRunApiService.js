// src/services/payrollRunApiService.js
//
// Payroll runs + variable inputs against the real FastAPI backend, following
// the same conventions as payrollApiService.js / employeeApiService.js:
// async functions, camelCase objects at the JS boundary, snake_case sent to
// the API.

import { apiGet, apiGetBlob, apiPostForm, apiPostJson, triggerBlobDownload } from "./apiClient";

const idToString = (value) =>
  value === null || value === undefined ? value : String(value);

const runToCamel = (r) => ({
  id: idToString(r.id),
  payScheduleId: idToString(r.pay_schedule_id),
  periodStart: r.period_start,
  periodEnd: r.period_end,
  payDate: r.pay_date,
  runType: r.run_type,
  status: r.status,
  source: r.source,
  totalGross: r.total_gross,
  totalDeductions: r.total_deductions,
  totalNet: r.total_net,
  employeeCount: r.employee_count,
  calculatedAt: r.calculated_at,
  approvedAt: r.approved_at,
  approvedBy: r.approved_by,
  paidAt: r.paid_at,
  createdBy: r.created_by,
  errorMessage: r.error_message,
});

const lineItemToCamel = (li) => ({
  id: idToString(li.id),
  payrollRunId: idToString(li.payroll_run_id),
  employeeId: idToString(li.employee_id),
  employeeSnapshot: li.employee_snapshot,
  grossEarnings: li.gross_earnings,
  totalDeductions: li.total_deductions,
  totalReimbursements: li.total_reimbursements,
  netPay: li.net_pay,
  pfWages: li.pf_wages,
  esiWages: li.esi_wages,
  paidDays: li.paid_days,
  lopDays: li.lop_days,
  status: li.status,
  computationBreakdown: li.computation_breakdown || [],
  errorMessage: li.error_message,
});

const disbursementBatchToCamel = (b) => ({
  id: idToString(b.id),
  payrollRunId: idToString(b.payroll_run_id),
  formatKey: b.format_key,
  fileName: b.file_name,
  status: b.status,
  totalAmount: b.total_amount,
  totalEmployeeCount: b.total_employee_count,
  generatedAt: b.generated_at,
  generatedBy: b.generated_by,
  version: b.version,
  checksum: b.checksum,
  downloadUrl: b.download_url,
  iciciFileSequenceNum: b.icici_file_sequence_num,
  iciciSubmittedAt: b.icici_submitted_at,
  iciciMessage: b.icici_message,
  iciciOtpPending: b.icici_otp_pending,
});

const iciciConfigStatusToCamel = (s) => ({
  configured: s.configured,
  missingFields: s.missing_fields,
  encryptionEnabled: s.encryption_enabled,
  baseUrl: s.base_url,
});

const iciciSubmitResponseToCamel = (r) => ({
  otpRequested: r.otp_requested,
  uniqueId: r.unique_id,
  fileSequenceNum: r.file_sequence_num,
  message: r.message,
  requiresManualApproval: r.requires_manual_approval,
});

const iciciTransactionToCamel = (t) => ({
  transactionType: t.transaction_type,
  networkId: t.network_id,
  creditAccountNumber: t.credit_account_number,
  debitAccountNumber: t.debit_account_number,
  ifscCode: t.ifsc_code,
  currency: t.currency,
  totalAmount: t.total_amount,
  hostReferenceNumber: t.host_reference_number,
  hostResponseCode: t.host_response_code,
  hostResponseMessage: t.host_response_message,
  transactionRemarks: t.transaction_remarks,
  transactionStatus: t.transaction_status,
  raw: t.raw,
  parseError: t.parse_error,
});

const iciciStatusResponseToCamel = (s) => ({
  fileSequenceNum: s.file_sequence_num,
  fileStatusCode: s.file_status_code,
  fileStatusDescription: s.file_status_description,
  fileStatusOutcome: s.file_status_outcome,
  transactions: (s.transactions || []).map(iciciTransactionToCamel),
});

const disbursementDataRowToCamel = (r) => ({
  employeeId: idToString(r.employee_id),
  employeeCode: r.employee_code,
  name: r.name,
  bankName: r.bank_name,
  accountNumber: r.account_number,
  ifscCode: r.ifsc_code,
  netPay: r.net_pay,
});

const adHocItemToCamel = (item) => ({
  componentCode: item.component_code,
  amount: item.amount,
  remarks: item.remarks,
});

const variableInputToCamel = (v) => ({
  id: idToString(v.id),
  employeeId: idToString(v.employee_id),
  periodStart: v.period_start,
  periodEnd: v.period_end,
  source: v.source,
  presentDays: v.present_days,
  lopDays: v.lop_days,
  paidLeaveDays: v.paid_leave_days,
  overtimeHours: v.overtime_hours,
  overtimeAmount: v.overtime_amount,
  adHocEarnings: (v.ad_hoc_earnings || []).map(adHocItemToCamel),
  adHocDeductions: (v.ad_hoc_deductions || []).map(adHocItemToCamel),
  remarks: v.remarks,
  status: v.status,
});

const variableInputToApi = (v) => ({
  employee_id: parseInt(v.employeeId, 10),
  period_start: v.periodStart,
  period_end: v.periodEnd,
  present_days:
    v.presentDays !== undefined && v.presentDays !== null && v.presentDays !== ""
      ? parseFloat(v.presentDays)
      : null,
  lop_days: v.lopDays !== undefined && v.lopDays !== null && v.lopDays !== "" ? parseFloat(v.lopDays) : 0,
  paid_leave_days:
    v.paidLeaveDays !== undefined && v.paidLeaveDays !== null && v.paidLeaveDays !== ""
      ? parseFloat(v.paidLeaveDays)
      : 0,
  overtime_hours:
    v.overtimeHours !== undefined && v.overtimeHours !== null && v.overtimeHours !== ""
      ? parseFloat(v.overtimeHours)
      : 0,
  overtime_amount:
    v.overtimeAmount !== undefined && v.overtimeAmount !== null && v.overtimeAmount !== ""
      ? parseFloat(v.overtimeAmount)
      : null,
  ad_hoc_earnings: (v.adHocEarnings || []).map((item) => ({
    component_code: item.componentCode,
    amount: parseFloat(item.amount) || 0,
    remarks: item.remarks || null,
  })),
  ad_hoc_deductions: (v.adHocDeductions || []).map((item) => ({
    component_code: item.componentCode,
    amount: parseFloat(item.amount) || 0,
    remarks: item.remarks || null,
  })),
  remarks: v.remarks || null,
});

export const payrollRunApiService = {
  listPayrollRuns: async () => {
    const data = await apiGet("/payroll-runs");
    return data.map(runToCamel);
  },
  createPayrollRun: async ({ payScheduleId, periodStart, periodEnd, payDate, runType }) => {
    const created = await apiPostJson("/payroll-runs", {
      pay_schedule_id: parseInt(payScheduleId, 10),
      period_start: periodStart,
      period_end: periodEnd,
      pay_date: payDate,
      run_type: runType || "Regular",
    });
    return runToCamel(created);
  },
  getPayrollRun: async (runId) => {
    const data = await apiGet(`/payroll-runs/${runId}`);
    return runToCamel(data);
  },
  getRunLineItems: async (runId) => {
    const data = await apiGet(`/payroll-runs/${runId}/line-items`);
    return data.map(lineItemToCamel);
  },
  calculateRun: async (runId) => {
    const data = await apiPostJson(`/payroll-runs/${runId}/calculate`, {});
    return runToCamel(data);
  },
  approveRun: async (runId, approvedBy) => {
    const data = await apiPostJson(`/payroll-runs/${runId}/approve`, { approved_by: approvedBy || null });
    return runToCamel(data);
  },
  cancelRun: async (runId) => {
    const data = await apiPostJson(`/payroll-runs/${runId}/cancel`, {});
    return runToCamel(data);
  },

  listVariableInputs: async (periodStart, periodEnd) => {
    const params = new URLSearchParams();
    if (periodStart) params.set("period_start", periodStart);
    if (periodEnd) params.set("period_end", periodEnd);
    const query = params.toString();
    const data = await apiGet(`/variable-inputs${query ? `?${query}` : ""}`);
    return data.map(variableInputToCamel);
  },
  upsertVariableInput: async (variableInputData) => {
    const created = await apiPostJson("/variable-inputs", variableInputToApi(variableInputData));
    return variableInputToCamel(created);
  },

  // --- Excel upload (Phase 3) --------------------------------------------

  downloadVariableInputsTemplate: async (runId) => {
    const { blob, filename } = await apiGetBlob(
      `/payroll-runs/${runId}/variable-inputs/template`,
      `variable_inputs_template_run${runId}.xlsx`
    );
    triggerBlobDownload(blob, filename);
  },

  downloadFinalSheetTemplate: async (runId) => {
    const { blob, filename } = await apiGetBlob(
      `/payroll-runs/${runId}/final-sheet/template`,
      `final_sheet_template_run${runId}.xlsx`
    );
    triggerBlobDownload(blob, filename);
  },

  uploadVariableInputs: async (runId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPostForm(`/payroll-runs/${runId}/variable-inputs/upload`, formData);
  },

  commitVariableInputs: async (runId, batchId) => {
    return apiPostJson(`/payroll-runs/${runId}/variable-inputs/commit`, { batch_id: batchId });
  },

  uploadFinalSheet: async (runId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPostForm(`/payroll-runs/${runId}/final-sheet/upload`, formData);
  },

  commitFinalSheet: async (runId, batchId) => {
    const data = await apiPostJson(`/payroll-runs/${runId}/final-sheet/commit`, { batch_id: batchId });
    return { ...data, run: runToCamel(data.run) };
  },

  // --- Bank disbursement file generation (Phase 4) -----------------------
  // Reminder: "generic_neft_xlsx_v1" is a PLACEHOLDER format, not verified
  // against ICICI's actual bulk-upload spec — see PayBatchPage.js.

  generateDisbursementBatch: async (runId, formatKey) => {
    const data = await apiPostJson(`/payroll-runs/${runId}/disbursement-batches`, { format_key: formatKey });
    return disbursementBatchToCamel(data);
  },

  listDisbursementBatches: async (runId) => {
    const data = await apiGet(`/payroll-runs/${runId}/disbursement-batches`);
    return data.map(disbursementBatchToCamel);
  },

  downloadDisbursementBatch: async (batchId, fileName) => {
    const { blob, filename } = await apiGetBlob(
      `/disbursement-batches/${batchId}/download`,
      fileName || `disbursement_batch_${batchId}.xlsx`
    );
    triggerBlobDownload(blob, filename);
  },

  getDisbursementData: async (runId) => {
    const data = await apiGet(`/payroll-runs/${runId}/disbursement-data`);
    return data.map(disbursementDataRowToCamel);
  },

  // --- ICICI Composite Pay API (real bulk disbursement) ------------------
  // NOT usable for a real submission until ICICI_CORP_ID/ICICI_USER_ID/
  // ICICI_AGGR_ID/ICICI_AGGR_NAME/ICICI_URN/ICICI_API_KEY are set in
  // backend/.env — getICICIConfigStatus() is how the UI knows whether to
  // enable the "Submit to ICICI" button.

  getICICIConfigStatus: async () => {
    const data = await apiGet("/icici/config-status");
    return iciciConfigStatusToCamel(data);
  },

  // Two-step OTP flow: call with no `otp` to trigger the OTP SMS (returns
  // otpRequested: true), then call again within 15 minutes with the OTP
  // the user read off their phone to actually submit the bulk payment file.
  submitDisbursementBatchToICICI: async (runId, batchId, otp) => {
    const data = await apiPostJson(
      `/payroll-runs/${runId}/disbursement-batches/${batchId}/icici/submit`,
      otp ? { otp } : {}
    );
    return iciciSubmitResponseToCamel(data);
  },

  getDisbursementBatchICICIStatus: async (runId, batchId) => {
    const data = await apiGet(`/payroll-runs/${runId}/disbursement-batches/${batchId}/icici/status`);
    return iciciStatusResponseToCamel(data);
  },
};
