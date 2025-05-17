import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AuditLog.css'; // Make sure this file includes modal styles too

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (action) params.action = action;

      const res = await axios.get('http://localhost:5000/api/swaps/audit', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLogs(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportCSV = () => {
    const csvHeader = 'Swap ID,Action,Performed By,Timestamp,Details\n';
    const csvRows = logs.map(log => {
      return `"${log.swapRequestId._id}","${log.action}","${log.performedBy.name}","${new Date(log.timestamp).toLocaleString()}","${log.details || ''}"`;
    });
    const csvContent = csvHeader + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'swap_audit_log.csv';
    link.click();
  };

  const handleViewDetails = (log) => {
    setSelectedSwap(log.swapRequestId);
    setShowModal(true);
  };

  return (
    <div className="audit-log-container">
      <h2>Swap Audit Log</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="filters">
        <label>
          From:
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label>
          To:
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </label>
        <label>
          Action:
          <select value={action} onChange={e => setAction(e.target.value)}>
            <option value="">All</option>
            <option value="created">Created</option>
            <option value="volunteered">Volunteered</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <div style={{ flexBasis: '100%', height: '8px' }}></div> {/* pushes buttons down */}
        <button onClick={fetchLogs}>Filter</button>
        <button onClick={exportCSV}>Export CSV</button>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Swap Request ID</th>
            <th>Action</th>
            <th>Performed By</th>
            <th>Timestamp</th>
            <th>Details</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.swapRequestId._id}</td>
              <td>{log.action}</td>
              <td>{log.performedBy.name} ({log.performedBy.email})</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.details}</td>
              <td>
                <button onClick={() => handleViewDetails(log)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for swap request details */}
      {showModal && selectedSwap && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Swap Request Details</h3>
            <p><strong>ID:</strong> {selectedSwap._id}</p>
            <p><strong>Requester:</strong> {selectedSwap.requester?.name || 'N/A'} ({selectedSwap.requester?.email || 'N/A'})</p>
            {/* <p><strong>Volunteer:</strong> {selectedSwap.volunteer ? `${selectedSwap.volunteer.name} (${selectedSwap.volunteer.email})` : 'None'}</p> */}
            <p><strong>Shift Date:</strong> {selectedSwap.shift?.date ? new Date(selectedSwap.shift.date).toLocaleDateString() : 'N/A'}</p>
            {/* <p><strong>Shift Type:</strong> {selectedSwap.shift?.type || 'N/A'}</p> */}
            <p><strong>Shift Time:</strong> {selectedSwap.shift?.time || 'N/A'}</p>

            <p><strong>Status:</strong> {selectedSwap.status}</p>
            <p><strong>Note:</strong> {selectedSwap.note || 'None'}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLog;
