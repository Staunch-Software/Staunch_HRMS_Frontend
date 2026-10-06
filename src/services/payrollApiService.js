// src/services/payrollApiService.js
//
// Internals rewritten to call the real FastAPI backend via apiClient.js.
// Every exported function name and its parameter/return shape is kept
// identical to the old in-memory-mock version so PaySchedulePage.js,
// SalaryComponentsPage.js and SalaryComponentForm.js need zero changes.
// formatPaymentDay/formatAppliesTo/formatCalculationMethod are pure
// functions with no backend dependency and are left completely untouched.

import {
  apiGet,
  apiPostJson,
  apiPutJson,
  apiDelete,
} from "./apiClient";

// --- id helper --------------------------------------------------------------
// The backend uses integer primary keys; the old mock used string ids like
// "dept_1". Several existing components (e.g. PaySchedulePage.js's checkbox
// list) compare an option's `id` against a raw DOM `value` attribute, which
// is always a string — so ids are stringified here to keep that comparison
// working unchanged.
const idToString = (value) =>
  value === null || value === undefined ? value : String(value);

// --- Pay Schedules: camelCase <-> backend snake_case ------------------------

const scheduleToCamel = (s) => ({
  id: idToString(s.id),
  scheduleName: s.schedule_name,
  payFrequency: s.pay_frequency,
  paymentDayRule: s.payment_day_rule,
  holidayAdjustment: s.holiday_adjustment,
  isActive: s.is_active,
  appliesTo: s.applies_to,
  processingDayOffset: s.processing_day_offset,
  firstEffectivePayDate: s.first_effective_pay_date,
  description: s.description,
});

const scheduleToApi = (s) => ({
  schedule_name: s.scheduleName,
  pay_frequency: s.payFrequency,
  payment_day_rule: s.paymentDayRule,
  holiday_adjustment: s.holidayAdjustment,
  processing_day_offset: s.processingDayOffset,
  is_active: s.isActive,
  first_effective_pay_date: s.firstEffectivePayDate || null,
  description: s.description,
  applies_to:
    s.appliesToMode === "All" ||
    (!s.appliesTo?.departments?.length && !s.appliesTo?.locations?.length)
      ? null
      : s.appliesTo,
});

// --- Salary Components: camelCase <-> backend snake_case --------------------

const componentToCamel = (c) => ({
  id: idToString(c.id),
  name: c.name,
  code: c.code,
  componentType: c.component_type,
  status: c.status,
  description: c.description,
  payslipOrder: c.payslip_order,
  earningSubType: c.earning_sub_type,
  deductionSubType: c.deduction_sub_type,
  statutoryType: c.statutory_type,
  isTaxable: c.is_taxable,
  taxSection: c.tax_section,
  calculationMethod: c.calculation_method,
  value: c.value,
  affectsPF: c.affects_pf,
  affectsESI: c.affects_esi,
  isProrated: c.is_prorated,
  isRecurring: c.is_recurring,
  roundingRule: c.rounding_rule,
  proofRequired: c.proof_required,
  claimLimitType: c.claim_limit_type,
  claimLimitAmount: c.claim_limit_amount,
});

const componentToApi = (c) => ({
  name: c.name,
  code: c.code,
  component_type: c.componentType,
  status: c.status !== undefined ? c.status : true,
  description: c.description ?? null,
  payslip_order:
    c.payslipOrder !== undefined && c.payslipOrder !== null && c.payslipOrder !== ""
      ? parseInt(c.payslipOrder, 10)
      : null,
  earning_sub_type: c.earningSubType || null,
  deduction_sub_type: c.deductionSubType || null,
  statutory_type: c.statutoryType || null,
  is_taxable: c.isTaxable || null,
  tax_section: c.taxSection || null,
  calculation_method: c.calculationMethod || null,
  value: c.value === null || c.value === undefined ? null : String(c.value),
  affects_pf: c.affectsPF ?? null,
  affects_esi: c.affectsESI ?? null,
  is_prorated: c.isProrated ?? null,
  is_recurring: c.isRecurring ?? null,
  rounding_rule: c.roundingRule || null,
  proof_required: c.proofRequired ?? null,
  claim_limit_type: c.claimLimitType || null,
  claim_limit_amount:
    c.claimLimitAmount !== undefined && c.claimLimitAmount !== null && c.claimLimitAmount !== ""
      ? parseFloat(c.claimLimitAmount)
      : null,
});

// --- Departments / Designations / Locations ---------------------------------

const departmentToCamel = (d) => ({
  id: idToString(d.id),
  name: d.name,
  code: d.code,
  description: d.description,
  status: d.status,
});

const designationToCamel = (d) => ({
  id: idToString(d.id),
  name: d.name,
  departmentId: idToString(d.department_id),
  status: d.status,
});

const locationToCamel = (l) => ({
  id: idToString(l.id),
  name: l.name,
  stateCode: l.state_code,
  status: l.status,
});

export const formatPaymentDay = (schedule) => {
  if (!schedule || !schedule.paymentDayRule) return "N/A";
  const { type, dayOfMonth, dayOfMonth2, dayOfWeek, firstPayDate } =
    schedule.paymentDayRule;
  switch (schedule.payFrequency) {
    case "Monthly":
      return type === "LastDayOfMonth" ? "Last Day" : `Day ${dayOfMonth}`;
    case "Semi-Monthly":
      const d1 = dayOfMonth ? `Day ${dayOfMonth}` : "";
      const d2 = dayOfMonth2 ? `Day ${dayOfMonth2}` : "";
      return d1 && d2 ? `${d1} & ${d2}` : d1 || d2 || "N/A";
    case "Weekly":
      return `Every ${dayOfWeek}`;
    case "Bi-Weekly":
      return `Every other ${dayOfWeek} (Start: ${firstPayDate || "N/A"})`;
    default:
      return "N/A";
  }
};

export const formatAppliesTo = (schedule) => {
  if (!schedule || schedule.appliesTo === null) return "All Employees";
  const { departments = [], locations = [] } = schedule.appliesTo;
  const parts = [];
  if (departments.length > 0) parts.push(`Depts (${departments.length})`);
  if (locations.length > 0) parts.push(`Locs (${locations.length})`);
  if (parts.length === 0 && schedule.appliesTo !== null)
    return "Specific (None Selected)";
  return parts.length > 0 ? parts.join(" & ") : "All Employees";
};

export const formatCalculationMethod = (component) => {
  if (!component) return "N/A";
  // Reimbursements might not have a standard calculation method in the same way
  if (component.componentType === "Reimbursement") {
    return "Claim Based"; // Or specific limit info if available
  }
  const { calculationMethod, value, statutoryType } = component;
  switch (calculationMethod) {
    case "Fixed Amount":
      return `Fixed (${
        value !== null && value !== undefined ? `₹${value}` : "Per Employee"
      })`;
    case "Percentage/Formula":
      return `Formula (${value || "Not Set"})`;
    case "Based on Attendance/Input":
      return "Input Based";
    case "Slab Based":
      return `Slab Based (${statutoryType === "PT" ? "PT" : "Custom"})`;
    default:
      return calculationMethod || "N/A";
  }
};

export const payrollApiService = {
  getPaySchedules: async () => {
    const data = await apiGet("/pay-schedules");
    return data.map(scheduleToCamel);
  },
  addPaySchedule: async (scheduleData) => {
    const created = await apiPostJson("/pay-schedules", scheduleToApi(scheduleData));
    return scheduleToCamel(created);
  },
  updatePaySchedule: async (scheduleData) => {
    const updated = await apiPutJson(
      `/pay-schedules/${scheduleData.id}`,
      scheduleToApi(scheduleData)
    );
    return scheduleToCamel(updated);
  },
  deletePaySchedule: async (id) => {
    return apiDelete(`/pay-schedules/${id}`);
  },
  getDepartments: async () => {
    const data = await apiGet("/departments");
    return data.map(departmentToCamel);
  },
  getDesignations: async () => {
    const data = await apiGet("/designations");
    return data.map(designationToCamel);
  },
  getLocations: async () => {
    const data = await apiGet("/work-locations");
    return data.map(locationToCamel);
  },
  addDepartment: async (departmentData) => {
    const created = await apiPostJson("/departments", {
      name: departmentData.name,
      code: departmentData.code,
      description: departmentData.description || null,
      status: departmentData.status || "Active",
    });
    return departmentToCamel(created);
  },
  addDesignation: async (designationData) => {
    const created = await apiPostJson("/designations", {
      name: designationData.name,
      department_id: designationData.departmentId
        ? parseInt(designationData.departmentId, 10)
        : null,
      status: designationData.status || "Active",
    });
    return designationToCamel(created);
  },

  getSalaryComponents: async () => {
    const data = await apiGet("/salary-components");
    return data.map(componentToCamel);
  },
  addSalaryComponent: async (componentData) => {
    const created = await apiPostJson(
      "/salary-components",
      componentToApi(componentData)
    );
    return componentToCamel(created);
  },
  updateSalaryComponent: async (componentData) => {
    const updated = await apiPutJson(
      `/salary-components/${componentData.id}`,
      componentToApi(componentData)
    );
    return componentToCamel(updated);
  },
  deleteSalaryComponent: async (id) => {
    return apiDelete(`/salary-components/${id}`);
  },
};
