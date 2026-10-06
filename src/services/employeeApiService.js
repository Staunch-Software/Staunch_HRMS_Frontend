// src/services/employeeApiService.js
//
// Employee CRUD against the real FastAPI backend. Modeled after
// payrollApiService.js's conventions (async functions, deep-cloned plain
// JSON, camelCase objects on the way out) so EmployeeContext.js can swap in
// these calls with minimal changes.
//
// The backend Employee model is normalized (department_id/designation_id/
// work_location_id as FK ints). The rest of the frontend (EmployeeList.js,
// etc. — out of scope for Phase 1) was built against the old mock's
// denormalized shape (departmentCode, department, designation, workLocation
// as plain strings). To avoid touching those files, every employee record
// returned here is enriched with those denormalized fields by joining
// against Department/Designation/WorkLocation lookups fetched alongside it.

import { apiGet, apiPostJson, apiPatchJson, apiPutJson, apiDelete } from "./apiClient";

const salaryStructureRowToCamel = (row) => ({
  id: idToString(row.id),
  employeeId: idToString(row.employee_id),
  salaryComponentId: idToString(row.salary_component_id),
  valueOverride: row.value_override,
  effectiveFrom: row.effective_from,
  effectiveTo: row.effective_to,
  componentCode: row.component_code,
  componentName: row.component_name,
  componentType: row.component_type,
});

const idToString = (value) =>
  value === null || value === undefined ? value : String(value);

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const fetchOrgLookups = async () => {
  const [departments, designations, locations] = await Promise.all([
    apiGet("/departments"),
    apiGet("/designations"),
    apiGet("/work-locations"),
  ]);
  return { departments, designations, locations };
};

const toDenormalizedEmployee = (apiEmployee, { departments, designations, locations }) => {
  const dept = departments.find((d) => d.id === apiEmployee.department_id);
  const designation = designations.find((d) => d.id === apiEmployee.designation_id);
  const location = locations.find((l) => l.id === apiEmployee.work_location_id);

  return {
    id: idToString(apiEmployee.id),
    employeeId: apiEmployee.employee_code,
    firstName: apiEmployee.first_name,
    lastName: apiEmployee.last_name || "",
    workEmail: apiEmployee.work_email,
    personalEmail: apiEmployee.personal_email,
    departmentId: idToString(apiEmployee.department_id),
    departmentCode: dept ? dept.code : undefined,
    department: dept ? dept.name : undefined,
    designationId: idToString(apiEmployee.designation_id),
    designation: designation ? designation.name : undefined,
    workLocation: location ? location.name : undefined,
    status: apiEmployee.status,
    profilePictureUrl: apiEmployee.profile_picture_url,
    dateOfJoining: apiEmployee.date_of_joining,
    dateOfLeaving: apiEmployee.date_of_leaving,
    basicSalary: apiEmployee.basic_salary,
    mobileNumber: apiEmployee.mobile_number,
    gender: apiEmployee.gender,
  };
};

// Best-effort id resolution: AddEmployeeFlow already resolves departmentId/
// designationId against DepartmentContext (now backend-seeded, so these ids
// are real backend ids). workLocation, however, still comes from the
// untouched ReferenceDataContext mock, which isn't linked to the backend —
// so it's matched here by name as a best effort; if nothing matches,
// work_location_id is left null rather than guessing further.
const resolveWorkLocationId = (workLocationName, locations) => {
  if (!workLocationName) return null;
  const match = locations.find(
    (l) => l.name.toLowerCase() === String(workLocationName).toLowerCase()
  );
  return match ? match.id : null;
};

const toApiEmployeePayload = (employeeData, locations) => ({
  employee_code: employeeData.employeeId,
  first_name: employeeData.firstName,
  last_name: employeeData.lastName || null,
  work_email: employeeData.workEmail || null,
  personal_email: employeeData.personalEmail || null,
  department_id: employeeData.departmentId ? parseInt(employeeData.departmentId, 10) : null,
  designation_id: employeeData.designationId ? parseInt(employeeData.designationId, 10) : null,
  work_location_id: resolveWorkLocationId(employeeData.workLocation, locations),
  status: employeeData.status || "Active",
  profile_picture_url: employeeData.profilePictureUrl || null,
  date_of_joining: employeeData.dateOfJoining || null,
  date_of_leaving: employeeData.dateOfLeaving || null,
  basic_salary:
    employeeData.basicSalary !== undefined && employeeData.basicSalary !== ""
      ? parseFloat(employeeData.basicSalary)
      : null,
  mobile_number: employeeData.mobileNumber || null,
  gender: employeeData.gender || null,
});

export const employeeApiService = {
  getEmployees: async () => {
    const [apiEmployees, lookups] = await Promise.all([
      apiGet("/employees"),
      fetchOrgLookups(),
    ]);
    return clone(apiEmployees.map((e) => toDenormalizedEmployee(e, lookups)));
  },

  addEmployee: async (employeeData) => {
    const lookups = await fetchOrgLookups();
    const created = await apiPostJson("/employees", toApiEmployeePayload(employeeData, lookups.locations));

    // Bank details are collected in the same flow (PaymentMethod step) —
    // persist them right away if present, so nothing is silently dropped.
    if (employeeData.bankName && employeeData.accountHolderName && employeeData.accountNumber && employeeData.ifscCode) {
      try {
        await apiPutJson(`/employees/${created.id}/bank-account`, {
          bank_name: employeeData.bankName,
          account_holder_name: employeeData.accountHolderName,
          account_number: employeeData.accountNumber,
          ifsc_code: employeeData.ifscCode,
          branch_name: employeeData.branchName || null,
          account_type: employeeData.accountType || null,
          is_primary: true,
          is_active: true,
        });
      } catch (e) {
        console.error("Employee created, but saving bank account failed:", e);
      }
    }

    return clone(toDenormalizedEmployee(created, lookups));
  },

  updateEmployeeStatus: async (employeeId, newStatus) => {
    const updated = await apiPatchJson(`/employees/${employeeId}/status`, { status: newStatus });
    return clone(updated);
  },

  deleteEmployee: async (employeeId) => {
    return apiDelete(`/employees/${employeeId}`);
  },

  getBankAccount: async (employeeId) => {
    return apiGet(`/employees/${employeeId}/bank-account`);
  },

  updateBankAccount: async (employeeId, bankAccountData) => {
    return apiPutJson(`/employees/${employeeId}/bank-account`, bankAccountData);
  },

  // --- Salary structure assignment (Phase 2) --------------------------------
  getSalaryStructure: async (employeeId, asOf) => {
    const query = asOf ? `?as_of=${asOf}` : "";
    const data = await apiGet(`/employees/${employeeId}/salary-structure${query}`);
    return data.map(salaryStructureRowToCamel);
  },

  assignSalaryComponent: async (employeeId, { salaryComponentId, valueOverride, effectiveFrom }) => {
    const created = await apiPostJson(`/employees/${employeeId}/salary-structure`, {
      salary_component_id: parseInt(salaryComponentId, 10),
      value_override:
        valueOverride !== undefined && valueOverride !== null && valueOverride !== ""
          ? parseFloat(valueOverride)
          : null,
      effective_from: effectiveFrom,
    });
    return created;
  },

  endSalaryStructureAssignment: async (assignmentId) => {
    return apiPatchJson(`/salary-structure-assignments/${assignmentId}/end`, {});
  },
};
