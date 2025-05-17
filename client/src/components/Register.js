import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import CSS

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error registering');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Register</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="register-input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="register-input"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="register-input"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <button type="submit" className="register-button">Register</button>
        </form>
        <p className="register-message">{message}</p>
      </div>
    </div>
  );
}

export default Register;
