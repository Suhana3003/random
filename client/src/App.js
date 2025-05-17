import React from 'react';
import OpenSwapRequests from './components/OpenSwapRequests';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ShiftList from './components/ShiftList';
import SwapRequestForm from './components/SwapRequestForm';
import ManagerDashboard from './ManagerDashboard';
import AuditLog from './components/AuditLog';


import './App.css';  // Import the CSS file

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Register</Link>
        <Link to="/shifts" className="nav-link">My Shifts</Link>
        <Link to="/swap-request" className="nav-link">Post Swap Request</Link>
        <Link to="/open-swaps" className="nav-link">Open Swap Requests</Link>
        <Link to="/manager" className="nav-link">Manager Dashboard</Link>
        <Link to="/audit-log" className="nav-link">Audit Logs</Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/audit-log"></Link>
        <Link to="/login" className="nav-link">Logout</Link>

      </nav>

      <main className="app-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/open-swaps" element={<OpenSwapRequests />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shifts" element={<ShiftList />} />
          <Route path="/swap-request" element={<SwapRequestForm />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/audit-log" element={<AuditLog />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
