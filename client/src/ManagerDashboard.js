import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ManagerDashboard.css';

function ManagerDashboard() {
  const [swapRequests, setSwapRequests] = useState([]);
  const [error, setError] = useState('');
  const [loadingStatusIds, setLoadingStatusIds] = useState(new Set());
  const [message, setMessage] = useState('');

  // Fetch swap requests from backend
  const fetchSwapRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://localhost:5000/api/swaps/for-approval', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSwapRequests(res.data);
    } catch (err) {
      setError('You are not a manager, so you cannot access the manager dashboard :(');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSwapRequests();
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this swap request?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingStatusIds((prev) => new Set(prev).add(requestId));

      await axios.patch(
        `http://localhost:5000/api/swaps/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // REFRESH swap requests from backend after status update
      await fetchSwapRequests();

      setMessage(`Swap request has been ${status}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setMessage('Failed to update status. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoadingStatusIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const actionableStatuses = ['pending', 'open', '', 'volunteered'];
  const isActionableStatus = (status) =>
    !status || actionableStatuses.includes(status.toLowerCase());

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Manager Dashboard - Swap Requests</h2>
      {message && <p className="success">{message}</p>}

      {swapRequests.length === 0 ? (
        <p>No swap requests found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="swap-table">
            <thead>
              <tr>
                <th>Requester</th>
                <th>Shift Date</th>
                <th>Shift Time</th>
                <th>Role</th>
                <th>Note</th>
                <th>Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {swapRequests.map((swap) => (
                <tr key={swap._id}>
                  <td>{swap.requester.name} ({swap.requester.email})</td>
                  <td>{new Date(swap.shift.date).toLocaleDateString()}</td>
                  <td>{swap.shift.time}</td>
                  <td>{swap.shift.role}</td>
                  <td>{swap.note || '—'}</td>
                  <td>
                    <span className={`status ${swap.status || 'pending'}`}>
                      {swap.status || 'pending'}
                    </span>
                    {isActionableStatus(swap.status) && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => handleUpdateStatus(swap._id, 'approved')}
                          disabled={loadingStatusIds.has(swap._id)}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleUpdateStatus(swap._id, 'rejected')}
                          disabled={loadingStatusIds.has(swap._id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;
