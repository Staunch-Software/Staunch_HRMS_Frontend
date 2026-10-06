// src/services/companyBankConfigApiService.js
import { apiGet, apiPutJson } from "./apiClient";

const toCamel = (c) => ({
  id: c.id,
  companyCode: c.company_code,
  debitAccountNumber: c.debit_account_number,
  debitAccountBankName: c.debit_account_bank_name,
  isActive: c.is_active,
});

const toApi = (c) => ({
  company_code: c.companyCode,
  debit_account_number: c.debitAccountNumber,
  debit_account_bank_name: c.debitAccountBankName,
  is_active: c.isActive,
});

export const companyBankConfigApiService = {
  getConfig: async () => {
    const data = await apiGet("/company-bank-config");
    return toCamel(data);
  },
  updateConfig: async (config) => {
    const data = await apiPutJson("/company-bank-config", toApi(config));
    return toCamel(data);
  },
};
