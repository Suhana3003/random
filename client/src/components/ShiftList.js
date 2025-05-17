import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UploadShifts from './UploadShifts'; // ✅ import this

function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null); // ✅ store user

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchShifts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view shifts');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/shifts/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(res.data);
      } catch (err) {
        setError('Error fetching shifts');
      }
      setLoading(false);
    };

    fetchShifts();
  }, []);

  if (loading) return <p>Loading shifts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>My Shifts</h2>
      {/* ✅ Show upload UI only if user is manager */}
      {user?.role === 'manager' && <UploadShifts />}

      {shifts.length === 0 ? (
        <p>No shifts assigned.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(shift => (
              <tr key={shift._id}>
                <td>{new Date(shift.date).toLocaleDateString()}</td>
                <td>{shift.time}</td>
                <td>{shift.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ShiftList;
