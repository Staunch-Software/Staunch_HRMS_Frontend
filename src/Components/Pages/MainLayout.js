import React from 'react';
import Sidebar from './Sidebar';
import TopSection from './TopSection';
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <TopSection />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;