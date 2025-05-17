import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OpenSwapRequest.css';


function OpenSwapRequests() {
  const [swaps, setSwaps] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchOpenSwaps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/swaps/open', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSwaps(res.data);
      } catch (error) {
        console.error('Failed to fetch open swaps', error);
      }
    };

    fetchOpenSwaps();
  }, []);

  const handleVolunteer = async (swapId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/swaps/volunteer/${swapId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('You volunteered successfully!');
      // Remove volunteered swap from list
      setSwaps(prev => prev.filter(swap => swap._id !== swapId));
    } catch (error) {
      console.error('Failed to volunteer', error);
      setMessage('Failed to volunteer for this shift.');
    }
  };

  return (
    <div>
      <h2>Open Swap Requests</h2>
      {message && <p>{message}</p>}
      {swaps.length === 0 ? (
        <p>No open swap requests available.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Requester</th>
              <th>Shift Date</th>
              <th>Shift Time</th>
              <th>Role</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {swaps.map(swap => (
              <tr key={swap._id}>
                <td>{swap.requester.name} ({swap.requester.email})</td>
                <td>{new Date(swap.shift.date).toLocaleDateString()}</td>
                <td>{swap.shift.time}</td>
                <td>{swap.shift.role}</td>
                <td>{swap.note || '—'}</td>
                <td>
                  <button onClick={() => handleVolunteer(swap._id)}>Volunteer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OpenSwapRequests;
