import React, { useState, useEffect, lazy, Suspense } from "react";
import Sidebar from "./Sidebar"; // Adjust path carefully
import styles from "./Dashboard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBell,
  faCog,
  faUser,
  faUsers,
  faMoneyBillAlt,
  faCalendarAlt,
  faFileAlt,
  faBriefcase,
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

// ENSURE ChartJS.register IS AT TOP
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

//Dynamically load charts
const Line = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Line }))
);
const Bar = lazy(() =>
  import("react-chartjs-2").then((mod) => ({ default: mod.Bar }))
);

const Dashboard = () => {
  const [payrollTrendsData, setPayrollTrendsData] = useState(null);
  const [departmentPayrollData, setDepartmentPayrollData] = useState(null);

  const employeeCount = 150;
  const totalPayroll = 750000;
  const lastPayrollDate = new Date()
    .toLocaleDateString("en-GB")
    .replace(/\//g, "-");

  useEffect(() => {
    console.log("Dashboard useEffect called"); // Debugging log

    const fetchData = async () => {
      try {
        console.log("Fetching data..."); // Debugging log

        // Simulate an API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

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

        console.log("trendsData:", trendsData); // Debugging log
        console.log("deptData:", deptData); // Debugging log

        setPayrollTrendsData(trendsData);
        setDepartmentPayrollData(deptData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log("Dashboard component rendering"); // Debugging log

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
              <FontAwesomeIcon icon="fa-solid fa-user" className={styles.icon} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.contentArea}>
          <h1 className={styles.dashboardTitle}>Staunch Payroll</h1>

          <div className={styles.kpiSection}>
            <div className={styles.kpiCard}>
              <FontAwesomeIcon icon={faUsers} className={styles.kpiIcon} />
              <h3>{employeeCount}</h3>
              <p>Total Employees</p>
            </div>

            <div className={styles.kpiCard}>
              <FontAwesomeIcon
                icon={faMoneyBillAlt}
                className={styles.kpiIcon}
              />
              <h3>Rs.{totalPayroll.toLocaleString()}</h3>
              <p>Total Payroll</p>
            </div>

            <div className={styles.kpiCard}>
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className={styles.kpiIcon}
              />
              <h3>{lastPayrollDate}</h3>
              <p>Last Payroll Date</p>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.chartContainer}>
              <h2>Payroll Trends</h2>
              {payrollTrendsData ? (
                <Suspense fallback={<div>Loading Payroll Trends...</div>}>
                  {console.log("Rendering Line chart")}
                  <Line data={payrollTrendsData} />
                </Suspense>
              ) : (
                <p>Loading Payroll Trends...</p>
              )}
            </div>

            <div className={styles.chartContainer}>
              <h2>Payroll by Department</h2>
              {departmentPayrollData ? (
                <Suspense
                  fallback={<div>Loading Payroll by Department...</div>}
                >
                  {console.log("Rendering Bar chart")}
                  <Bar data={departmentPayrollData} />
                </Suspense>
              ) : (
                <p>Loading Payroll by Department...</p>
              )}
            </div>
          </div>

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
                <FontAwesomeIcon icon={faUsers} className={styles.actionIcon} />
                Add New Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
