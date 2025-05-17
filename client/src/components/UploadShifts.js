import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

function UploadShifts() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = () => {
    if (!file) {
      setMessage('Please select a CSV file.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const token = localStorage.getItem('token');
        try {
          const res = await axios.post(
            'http://localhost:5000/api/shifts/bulk',
            { shifts: results.data },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setMessage('Shifts uploaded successfully.');
        } catch (err) {
          setMessage('Failed to upload shifts.');
        }
      },
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Upload Shifts (CSV)</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}

export default UploadShifts;
