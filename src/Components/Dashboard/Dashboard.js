import React, { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "./Sidebar";
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBell,
  faCog,
  faUsers,
  faMoneyBillAlt,
  faCalendarAlt,
  faFileAlt,
  faBriefcase,
  faUser,  
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
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

const Line = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Line }))
);
const Bar = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Bar }))
);

const Dashboard = () => {
  const [payrollTrendsData, setPayrollTrendsData] = useState(null);
  const [departmentPayrollData, setDepartmentPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  const employeeCount = 0;
  const totalPayroll = 1000000;
  const lastPayrollDate = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  // Simulated Comparison Data (replace with real data)
  const payrollComparison = {
    vsLastMonth: 0.05, // +5%
    vsLastQuarter: -0.02, // -2%
  };

  useEffect(() => {
    const fetchPayrollSummary = async () => {
      try {
        const response = await fetch("/api/payrollSummary"); // Adjust the endpoint as per your backend
        const data = await response.json();
        setPayrollSummary(data);
      } catch (error) {
        console.error("Error fetching payroll summary from the database:", error);
      }
    };

    fetchPayrollSummary();
  }, []);

  const [payrollSummary, setPayrollSummary] = useState({
    totalPayroll: 0,
    averageSalary: 0,
    employeesPaid: 0,
    taxesWithheld: 0,
    deductions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call delay

        const trendsData = {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Payroll Amount",
              data: [700000, 720000, 730000, 740000, 750000, 760000],
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        };

        const deptData = {
          labels: ["Sales", "Marketing", "Engineering", "HR"],
          datasets: [
            {
              label: "Payroll Expense",
              data: [150000, 120000, 250000, 80000],
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
            },
          ],
        };

        setPayrollTrendsData(trendsData);
        setDepartmentPayrollData(deptData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPercentage = (value) => {
    const formatted = (value * 100).toFixed(1);
    return formatted + "%";
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <div className={styles.mainContent}>
        {/* Top Section */}
        <div className={styles.topSection}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search Employee" />
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          </div>

          <div className={styles.topSectionIcons}>
            <FontAwesomeIcon icon={faBell} className={styles.icon} />
            <FontAwesomeIcon icon={faCog} className={styles.icon} />
            <div className={styles.profileIcon}>
          {console.log("Rendering user icon")}
          <>
          <FontAwesomeIcon
            icon={faUser}
            style={{ color: "#098aec" }}
            className={styles.icon}
          />
          </>
        </div>
          </div>
        </div>

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
                        <FontAwesomeIcon icon={faUsers} 
                        style={{ color: "#098aec" }}
                        className={styles.kpiIcon} />
                        <h3>{employeeCount}</h3>
                        
                        <p>Total Employees</p>
                      </div>

                      <div className={styles.kpiCard}>
                        <FontAwesomeIcon
                        icon={faMoneyBillAlt}
                        
                        className={styles.kpiIcon}
                        />
                        <h3>Rs. {totalPayroll.toLocaleString()}</h3>
                        <p>
                        Total Payroll
                        {/* <span className={styles.comparison} style={{ marginLeft: "10px" }}>
                          {payrollComparison.vsLastMonth >= 0 ? (
                          <FontAwesomeIcon
                            icon={faArrowUp} style={{color:"black"}}
                            className={styles.positiveTrend}
                          />
                          ) : (
                          <FontAwesomeIcon
                            icon={faArrowDown}
                            className={styles.negativeTrend}
                          />
                          )}
                          {formatPercentage(payrollComparison.vsLastMonth)} vs Last
                          Month
                        </span> */}
                        </p>
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
                  <h2>Payroll by Department</h2>
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

              {/* Report Section */}
              <div className={styles.reportSection}>
                <h2>Payroll Reports</h2>
                <ul className={styles.reportList}>
                  <li>
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className={styles.reportIcon}
                    />
                    <a href="#">Monthly Payroll Report</a>
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className={styles.reportIcon}
                    />
                    <a href="#">Yearly Payroll Summary</a>
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className={styles.reportIcon}
                    />
                    <a href="#">Tax Compliance Report</a>
                  </li>
                </ul>
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
                  <button>
                    <FontAwesomeIcon
                      icon={faUsers}
                      className={styles.actionIcon}
                    />
                    Add New Employee
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