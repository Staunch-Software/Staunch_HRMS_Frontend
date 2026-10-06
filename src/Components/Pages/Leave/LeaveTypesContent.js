// LeaveTypesContent.js
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LeaveTypesContent.module.css";
import { useLeaveTypes } from "../../../Contexts/LeaveTypesContext"; // Adjust path as needed

const employeeLeaveData = [];

const LeaveTypesContent = () => {
  const navigate = useNavigate();
  const { leaveTypes } = useLeaveTypes();
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState(
    leaveTypes && leaveTypes.length > 0 ? leaveTypes[0].id : null
  );

  React.useEffect(() => {
    if (
      leaveTypes &&
      leaveTypes.length > 0 &&
      !leaveTypes.find((lt) => lt.id === selectedLeaveTypeId)
    ) {
      setSelectedLeaveTypeId(leaveTypes[0].id);
    } else if (!leaveTypes || leaveTypes.length === 0) {
      setSelectedLeaveTypeId(null);
    }
  }, [leaveTypes, selectedLeaveTypeId]);

  const handleSelectLeaveType = (id) => {
    setSelectedLeaveTypeId(id);
  };

  const handleNavigateToAdd = () => {
    navigate("/app/leave/leave-types/add");
  };

  const leaveTypeCounts = useMemo(() => {
    if (!leaveTypes) return {};
    const counts = {};
    leaveTypes.forEach((type) => {
      counts[type.id] = employeeLeaveData.filter(
        (emp) =>
          emp.currentLeave?.isActive && emp.currentLeave?.typeId === type.id
      ).length;
    });
    return counts;
  }, [leaveTypes, employeeLeaveData]);

  const selectedLeaveType = leaveTypes?.find(
    (type) => type.id === selectedLeaveTypeId
  );

  const renderBool = (value) => (value ? "Yes" : "No");
  const renderList = (list, defaultText = "N/A") =>
    list && list.length > 0 ? list.join(", ") : defaultText;

  return (
    <div className={styles.container}>
      <div className={styles.leaveTypesContainer}>
        <div className={styles.typesListColumn}>
          <h2>Types of Leave</h2>
          <ul className={styles.typesList}>
            {leaveTypes && leaveTypes.length > 0 ? (
              leaveTypes.map((type) => (
                <li
                  key={type.id}
                  className={`${styles.typeItemContainer} ${
                    selectedLeaveTypeId === type.id ? styles.activeType : ""
                  }`}
                  onClick={() => handleSelectLeaveType(type.id)}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSelectLeaveType(type.id)
                  }
                >
                  <span className={styles.typeName}>{type.name}</span>
                  <span className={styles.leaveCountBadge}>
                    {leaveTypeCounts?.[type.id] ?? 0}
                  </span>
                </li>
              ))
            ) : (
              <li className={styles.noTypes}>No leave types found.</li>
            )}
          </ul>
          <button
            className={styles.addTypeButton}
            onClick={handleNavigateToAdd}
          >
            + Add Type
          </button>
        </div>

        <div className={styles.configurationColumn}>
          {selectedLeaveType ? (
            <div className={styles.configDetailsWrapper}>
              <section className={styles.configSection}>
                <h4>General Info</h4>
                <dl className={styles.configList}>
                  <dt>Leave Type Name:</dt>
                  <dd>{selectedLeaveType.name}</dd>
                  <dt>Short Code:</dt>
                  <dd>{selectedLeaveType.shortCode}</dd>
                  <dt>Description:</dt>
                  <dd className={styles.descriptionValue}>
                    {selectedLeaveType.description}
                  </dd>
                </dl>
              </section>

              <section className={styles.configSection}>
                <h4>Leave Counts</h4>
                <dl className={styles.configList}>
                  <dt>Annual Entitlement:</dt>
                  <dd>{selectedLeaveType.annualEntitlement} days</dd>
                  <dt>Carry Forward:</dt>
                  <dd>{renderBool(selectedLeaveType.carryForward)}</dd>
                  {selectedLeaveType.carryForward && (
                    <>
                      <dt>Carry Forward Limit:</dt>
                      <dd>{selectedLeaveType.carryForwardLimit} days</dd>
                      <dt>Carry Forward Expiry:</dt>
                      <dd>
                        {selectedLeaveType.carryForwardExpiryDays > 0
                          ? `${selectedLeaveType.carryForwardExpiryDays} days after cycle end`
                          : "No Expiry"}
                      </dd>
                    </>
                  )}
                  <dt>Pro-rata Calculation:</dt>
                  <dd>{renderBool(selectedLeaveType.proRata)}</dd>
                  <dt>Reset Cycle:</dt>
                  <dd>{selectedLeaveType.resetCycle}</dd>
                  <dt>Min Application Days:</dt>
                  <dd>{selectedLeaveType.minApplicationDays}</dd>
                  <dt>Max Application Days:</dt>
                  <dd>{selectedLeaveType.maxApplicationDays}</dd>
                  <dt>Count Weekends Between:</dt>
                  <dd>{renderBool(selectedLeaveType.weekendsBetween)}</dd>
                  <dt>Count Holidays Between:</dt>
                  <dd>{renderBool(selectedLeaveType.holidaysBetween)}</dd>
                </dl>
              </section>

              <section className={styles.configSection}>
                <h4>Applicability</h4>
                <dl className={styles.configList}>
                  <dt>Applicable Roles/Depts:</dt>
                  <dd>
                    {renderList(selectedLeaveType.applicableRoles, "All")}
                  </dd>
                  <dt>Employee Type:</dt>
                  <dd>{renderList(selectedLeaveType.employeeType, "All")}</dd>
                  <dt>Locations:</dt>
                  <dd>{renderList(selectedLeaveType.locations, "All")}</dd>
                  <dt>Gender Specific:</dt>
                  <dd>{selectedLeaveType.gender}</dd>
                  <dt>Marital Status Specific:</dt>
                  <dd>{selectedLeaveType.maritalStatus}</dd>
                  <dt>Allowed Under Notice:</dt>
                  <dd>{renderBool(selectedLeaveType.allowedUnderNotice)}</dd>
                  <dt>Min Service Period:</dt>
                  <dd>{selectedLeaveType.minServicePeriod} months</dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Leave Benefits</h4>
                <dl className={styles.configList}>
                  <dt>Paid/Unpaid:</dt>
                  <dd>{selectedLeaveType.isPaid ? "Paid" : "Unpaid"}</dd>
                  <dt>Medical Cert. Required:</dt>
                  <dd>{renderBool(selectedLeaveType.medicalCertRequired)}</dd>
                  <dt>Additional Perks:</dt>
                  <dd>{selectedLeaveType.additionalPerks}</dd>
                  <dt>Sandwich Rule:</dt>
                  <dd>{renderBool(selectedLeaveType.sandwichRule)}</dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Accrual Settings</h4>
                <dl className={styles.configList}>
                  <dt>Enable Accrual:</dt>
                  <dd>{renderBool(selectedLeaveType.enableAccrual)}</dd>
                  {selectedLeaveType.enableAccrual && (
                    <>
                      <dt>Accrual Frequency:</dt>
                      <dd>{selectedLeaveType.accrualFrequency}</dd>
                      <dt>Accrual Start:</dt>
                      <dd>{selectedLeaveType.accrualStart}</dd>
                      <dt>Accrual Rate:</dt>
                      <dd>
                        {selectedLeaveType.accrualRate} days /{" "}
                        {selectedLeaveType.accrualFrequency?.toLowerCase()}
                      </dd>
                      <dt>Max Accrual Limit:</dt>
                      <dd>{selectedLeaveType.maxAccrualLimit} days</dd>
                    </>
                  )}
                  <dt>Negative Balance Allowed:</dt>
                  <dd>
                    {renderBool(selectedLeaveType.negativeBalanceAllowed)}
                  </dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Approval Workflow</h4>
                <dl className={styles.configList}>
                  <dt>Approval Type:</dt>
                  <dd>{selectedLeaveType.approvalType}</dd>
                  <dt>Hierarchy:</dt>
                  <dd>
                    {renderList(selectedLeaveType.approvalHierarchy, "N/A")}
                  </dd>
                  <dt>Auto-approval Time:</dt>
                  <dd>
                    {selectedLeaveType.autoApprovalTime > 0
                      ? `${selectedLeaveType.autoApprovalTime} hours`
                      : "None"}
                  </dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Encashment Rules</h4>
                <dl className={styles.configList}>
                  <dt>Allow Encashment:</dt>
                  <dd>{renderBool(selectedLeaveType.allowEncashment)}</dd>
                  {selectedLeaveType.allowEncashment && (
                    <>
                      <dt>Encashment Frequency:</dt>
                      <dd>{selectedLeaveType.encashmentFrequency}</dd>
                      <dt>Min Balance Required:</dt>
                      <dd>{selectedLeaveType.minBalanceRequiredEncash} days</dd>
                      <dt>Encashment Limit:</dt>
                      <dd>{selectedLeaveType.encashmentLimit} days</dd>
                      <dt>Encashment Formula:</dt>
                      <dd>{selectedLeaveType.encashmentFormula}</dd>
                    </>
                  )}
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Leave Cycle</h4>
                <dl className={styles.configList}>
                  <dt>Leave Year Start:</dt>
                  <dd>{selectedLeaveType.leaveYearStart}</dd>
                  <dt>Mid-Year Joiners:</dt>
                  <dd>{selectedLeaveType.midYearJoinersRule}</dd>
                  <dt>Leave Cut-off Date:</dt>
                  <dd>{selectedLeaveType.leaveCutoffDate}</dd>
                  <dt>Carry Fwd Reset Date:</dt>
                  <dd>{selectedLeaveType.carryForwardResetDate}</dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Documentation</h4>
                <dl className={styles.configList}>
                  <dt>Require Documents:</dt>
                  <dd>{renderBool(selectedLeaveType.requireDocs)}</dd>
                  {selectedLeaveType.requireDocs && (
                    <>
                      <dt>Allowed Formats:</dt>
                      <dd>
                        {renderList(selectedLeaveType.allowedFormats, "Any")}
                      </dd>
                      <dt>Max File Size:</dt>
                      <dd>{selectedLeaveType.maxFileSize} MB</dd>
                    </>
                  )}
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Restrictions</h4>
                <dl className={styles.configList}>
                  <dt>Block During Notice:</dt>
                  <dd>{renderBool(selectedLeaveType.blockDuringNotice)}</dd>
                  <dt>Block During Appraisal:</dt>
                  <dd>{renderBool(selectedLeaveType.blockDuringAppraisal)}</dd>
                  <dt>Block Critical Dates:</dt>
                  <dd>
                    {renderList(selectedLeaveType.blockCriticalDates, "None")}
                  </dd>
                  <dt>Restrict Consecutive:</dt>
                  <dd>
                    {selectedLeaveType.restrictConsecutive > 0
                      ? `${selectedLeaveType.restrictConsecutive} days`
                      : "No Limit"}
                  </dd>
                </dl>
              </section>
              <section className={styles.configSection}>
                <h4>Notifications & Alerts</h4>
                <dl className={styles.configList}>
                  <dt>Notify on Apply/Action:</dt>
                  <dd>{renderBool(selectedLeaveType.notifyOnApply)}</dd>
                  <dt>Expiring Leave Reminders:</dt>
                  <dd>{renderBool(selectedLeaveType.notifyExpireReminders)}</dd>
                  <dt>Negative Balance Alerts:</dt>
                  <dd>{renderBool(selectedLeaveType.alertNegativeBalance)}</dd>
                </dl>
              </section>

              <div className={styles.configActions}>
                <button className={styles.editButton} >
                  Edit Configuration
                </button>
                <button className={styles.deleteButton} >
                  Delete Leave Type
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.selectPrompt}>
              Select a leave type from the list.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveTypesContent;
