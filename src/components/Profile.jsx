import React, { useState, useEffect } from 'react';
import { useNavigate }          from 'react-router-dom';
import axios                    from 'axios';

export default function Profile() {
  const navigate       = useNavigate();
  const BACKEND_URL    = import.meta.env.VITE_BACKEND_URL;
  const [profile, setProfile]       = useState(null);
  const [history, setHistory]       = useState([]);
  const [photoFile, setPhotoFile]   = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');

  // 1. Ensure user is logged in & fetch data
  useEffect(() => {
    // Check auth + fetch profile
    axios.get(`${BACKEND_URL}/users/profile`, { withCredentials: true })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/users/login'));

    // Fetch attendance history
    axios.get(`${BACKEND_URL}/users/attendance-history`, { withCredentials: true })
      .then(res => setHistory(res.data))
      .catch(err => console.error('History fetch error:', err));
  }, [BACKEND_URL, navigate]);

  // 2. Logout (reuse your existing handler)
  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/users/logout`, {}, { withCredentials: true });
      navigate('/users/login');
    } catch {
      alert('Logout failed, please try again');
    }
  };

  // 3. Photo upload handler
  const handlePhotoChange = e => {
    setPhotoFile(e.target.files[0]);
  };
  const handlePhotoUpload = async e => {
    e.preventDefault();
    if (!photoFile) return setError('Please select a photo first.');
    setUploading(true);
    setError('');
    const form = new FormData();
    form.append('photo', photoFile);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/users/profile/photo`,
        form,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      // returned new photo URL
      setProfile(p => ({ ...p, photoUrl: res.data.photoUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      setPhotoFile(null);
    }
  };

  if (!profile) {
    return <div className="profile">Loading...</div>;
  }

  return (
    <div className="profile">
      <header className="profile-header">
        <h1>Your Profile</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="profile-info">
        <img
          className="avatar"
          src={profile.photoUrl || defaultAvatar}
          alt="Profile"
        />
        <div className="details">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>
          <p><strong>Theme:</strong> {profile.theme}</p>
        </div>
      </section>

      <section className="profile-photo-upload">
        <h2>Change Profile Photo</h2>
        <form onSubmit={handlePhotoUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="attendance-history">
        <h2>Your Attendance History</h2>
        {history.length === 0 ? (
          <p>You haven't marked any attendance yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name Used</th>
                <th>Roll Number</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleString()}</td>
                  <td>{entry.name}</td>
                  <td>{entry.rollnumber}</td>
                  <td>
                    {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
