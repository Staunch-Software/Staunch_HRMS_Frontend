// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Admin_Login from './Components/AdminLoginPage/Admin_Login';
import Dashboard from './Components/Dashboard/Dashboard';
// import Sidebar from './Components/Dashboard/Sidebar';
function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Admin_Login />} />      {/* Login route */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* Dashboard route */}
      </Routes>
    
  );
}

export default App;