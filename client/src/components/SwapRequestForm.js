import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SwapRequestForm.css'; // Import CSS

function SwapRequestForm() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchShifts = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/shifts/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShifts(res.data);
      } catch (err) {
        console.error('Failed to fetch shifts', err);
      }
    };

    fetchShifts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShift) {
      setMessage('Please select a shift');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/swaps',
        { shiftId: selectedShift, note },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('Swap request posted successfully!');
      setNote('');
      setSelectedShift('');
    } catch (error) {
      console.error('Error posting swap request', error);
      setMessage('Failed to post swap request');
    }
  };

  return (
    <div className="swap-form-container">
      <h2 className="swap-title">Post a Shift Swap Request</h2>
      <form onSubmit={handleSubmit} className="swap-form">
        <label className="swap-label">
          Select Shift:
          <select
            className="swap-select"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
          >
            <option value="">-- Select Shift --</option>
            {shifts.map((shift) => (
              <option key={shift._id} value={shift._id}>
                {new Date(shift.date).toLocaleDateString()} | {shift.time} | {shift.role}
              </option>
            ))}
          </select>
        </label>

        <label className="swap-label">
          Note (optional):
          <textarea
            className="swap-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Why do you want to swap this shift?"
          />
        </label>

        <button type="submit" className="swap-button">Post Swap Request</button>
        {message && <p className="swap-message">{message}</p>}
      </form>
    </div>
  );
}

export default SwapRequestForm;
