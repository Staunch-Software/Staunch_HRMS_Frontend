import React, { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "./Sidebar";
import TopSection from "./TopSection";
import styles from "./Dashboard.module.css"; // Import the Dashboard styles
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  BarController,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faMoneyBillAlt, faCalendarAlt, faBriefcase } from "@fortawesome/free-solid-svg-icons";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  BarController
);

// Lazy load charts for performance optimization
const Line = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Line }))
);
const Bar = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Bar }))
);

const Dashboard = () => {
  const [payrollSummary, setPayrollSummary] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    employeesPaid: 0,
    taxesWithheld: 0,
    deductions: 0,
  });
  const [payrollTrendsData, setPayrollTrendsData] = useState(null);
  const [departmentPayrollData, setDepartmentPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastPayrollMonth, setLastPayrollMonth] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [totalPayroll, setTotalPayroll] = useState(1000000);
  const lastPayrollDate = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  useEffect(() => {
    const fetchPayrollSummary = async () => {
      try {
        const response = await fetch("/api/payrollSummary");
        const data = await response.json();
        setPayrollSummary(data);
        setEmployeeCount(data.employeesPaid);
      } catch (error) {
        console.error("Error fetching payroll summary:", error);
      }
    };
    fetchPayrollSummary();
  }, []);

  const getLastSixMonths = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const today = new Date();
    let currentMonth = today.getMonth();
    return Array.from({ length: 6 }, () => {
      const month = months[currentMonth];
      currentMonth = (currentMonth - 1 + 12) % 12;
      return month;
    }).reverse();
  };

  const generateRandomPayrollData = (numMonths) =>
    Array.from({ length: numMonths }, () =>
      Math.floor(Math.random() * (800000 - 700000 + 1)) + 700000
    );

  const generateRandomDepartmentData = () => {
    const departments = ["Sales", "Marketing", "Engineering", "HR"];
    return departments.map(() =>
      Math.floor(Math.random() * (250000 - 80000 + 1)) + 80000
    );
  };

  const getLastPayrollMonth = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[(new Date().getMonth() - 1 + 12) % 12];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating API delay

        const monthLabels = getLastSixMonths();
        const payrollData = generateRandomPayrollData(monthLabels.length);
        const departmentData = generateRandomDepartmentData();

        setPayrollTrendsData({
          labels: monthLabels,
          datasets: [{
            label: "Payroll Amount",
            data: payrollData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          }],
        });

        setDepartmentPayrollData({
          labels: ["Sales", "Marketing", "Engineering", "HR"],
          datasets: [{
            label: "Payroll Expense",
            data: departmentData,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)"
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)"
            ],
            borderWidth: 1,
          }],
        });

        setLastPayrollMonth(getLastPayrollMonth());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <div className={styles.mainContent}>
        {/* Top Section */}
        <TopSection />

        {/* Main Content Area */}
        <div className={styles.contentArea}>
          <h1 className={styles.dashboardTitle}>Payroll</h1>

          {loading ? (
            <p>Loading dashboard data...</p>
          ) : (
            <>
              {/* KPI Section with Data Cards and Comparisons */}
              <div className={styles.kpiSection}>
                <div className={styles.kpiCard}>
                  <FontAwesomeIcon
                    icon={faUsers}
                    style={{ color: "#098aec" }}
                    className={styles.kpiIcon}
                  />
                  <h3>{employeeCount}</h3>

                  <p>Total Employees</p>
                </div>

                <div className={styles.kpiCard}>
                  <FontAwesomeIcon
                    icon={faMoneyBillAlt}
                    className={styles.kpiIcon}
                  />
                  <h3>Rs. {totalPayroll.toLocaleString()}</h3>
                  <p>Total Payroll</p>
                </div>

                <div className={styles.kpiCard}>
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    style={{ color: "red" }}
                    className={styles.kpiIcon}
                  />
                  <h3>{lastPayrollDate}</h3>
                  <p>Last Payroll Date</p>
                </div>
              </div>

              {/* Chart Section */}
              <div className={styles.chartSection}>
                <div className={styles.chartContainer}>
                  <h2>Payroll Trends</h2>
                  {payrollTrendsData ? (
                    <Suspense fallback={<div>Loading Payroll Trends...</div>}>
                      <Line data={payrollTrendsData} />
                    </Suspense>
                  ) : (
                    <p>No Payroll Trends data available.</p>
                  )}
                </div>

                <div className={styles.chartContainer}>
                  <h2>
                    Payroll by Department (Last Payroll Month:{" "}
                    {lastPayrollMonth})
                  </h2>
                  {departmentPayrollData ? (
                    <Suspense
                      fallback={<div>Loading Payroll by Department...</div>}
                    >
                      <Bar data={departmentPayrollData} />
                    </Suspense>
                  ) : (
                    <p>No Payroll by Department data available.</p>
                  )}
                </div>
              </div>

              {/* Summary Table Section */}
              <div className={styles.summaryTable}>
                <h2>Payroll Summary</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Payroll</td>
                      <td>{payrollSummary.totalPayroll.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Average Salary</td>
                      <td>{payrollSummary.averageSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Employees Paid</td>
                      <td>{payrollSummary.employeesPaid}</td>
                    </tr>
                    <tr>
                      <td>Taxes Withheld</td>
                      <td>{payrollSummary.taxesWithheld.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Total Deductions</td>
                      <td>{payrollSummary.deductions.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick Actions Section */}
              <div className={styles.quickActionsSection}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                  <button>
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className={styles.actionIcon}
                    />
                    Run Payroll
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;