// src/Components/Pages/Payroll/CompanyBankSettingsPage.js
//
// Settings for the company's own disbursement (debit) account used when
// generating the salary bank file (Payroll > Pay Batch). This is company-wide
// config, not an employee's bank account.
import React, { useEffect, useState } from "react";
import styles from "./CompanyBankSettingsPage.module.css";
import { companyBankConfigApiService } from "../../../services/companyBankConfigApiService";

const PLACEHOLDER_ACCOUNT_NUMBER = "0000000000";

const CompanyBankSettingsPage = () => {
  const [form, setForm] = useState({
    companyCode: "",
    debitAccountNumber: "",
    debitAccountBankName: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    companyBankConfigApiService
      .getConfig()
      .then((config) => {
        if (!cancelled) setForm(config);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load company bank settings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.companyCode.trim() || !form.debitAccountNumber.trim() || !form.debitAccountBankName.trim()) {
      setError("Company Code, Debit Account Number, and Bank Name are all required.");
      return;
    }
    if (!/^[0-9]+$/.test(form.debitAccountNumber.trim())) {
      setError("Debit Account Number should contain digits only.");
      return;
    }

    setSaving(true);
    try {
      const updated = await companyBankConfigApiService.updateConfig({
        ...form,
        companyCode: form.companyCode.trim(),
        debitAccountNumber: form.debitAccountNumber.trim(),
        debitAccountBankName: form.debitAccountBankName.trim(),
      });
      setForm(updated);
      setSuccessMessage("Saved. This account will be used as the debit account in generated bank files.");
    } catch (err) {
      setError(err.message || "Failed to save company bank settings.");
    } finally {
      setSaving(false);
    }
  };

  const isPlaceholder = form.debitAccountNumber === PLACEHOLDER_ACCOUNT_NUMBER;

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Company Bank Settings</h1>
      <p className={styles.subtitle}>
        The account salaries are paid from. Used as the debit account in every bank file generated
        under Payroll &gt; Pay Batch.
      </p>
      <hr className={styles.divider} />

      {isPlaceholder && (
        <p className={styles.warning}>
          This is still the seeded placeholder account (0000000000) — replace it with your real ICICI
          current account before generating a bank file you intend to actually submit for disbursement.
        </p>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="companyCode" className={styles.label}>
            Company Code <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="companyCode"
            value={form.companyCode}
            onChange={handleChange("companyCode")}
            className={styles.input}
            maxLength={20}
          />
          <small className={styles.hint}>Short code used in generated bank file names (e.g. STAUNCH).</small>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="debitAccountBankName" className={styles.label}>
            Bank Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="debitAccountBankName"
            value={form.debitAccountBankName}
            onChange={handleChange("debitAccountBankName")}
            className={styles.input}
            maxLength={150}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="debitAccountNumber" className={styles.label}>
            Debit Account Number <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="debitAccountNumber"
            value={form.debitAccountNumber}
            onChange={handleChange("debitAccountNumber")}
            className={styles.input}
            maxLength={40}
          />
          <small className={styles.hint}>Digits only — your company's real ICICI current account number.</small>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyBankSettingsPage;
