// Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate }               from 'react-router-dom';
import axios                         from 'axios';
import { animate, stagger }          from 'animejs';
import './styles/Profile.css';

export default function Profile() {
  const navigate       = useNavigate();
  const BACKEND_URL    = import.meta.env.VITE_BACKEND_URL;
  const [profile, setProfile]     = useState(null);
  const [history, setHistory]     = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const defaultAvatar = '/profile.jpg';

  const headerRef = useRef(null);
  const avatarRef = useRef(null);

  // Fetch profile & history
  useEffect(() => {
    axios.get(`${BACKEND_URL}/users/profile`, { withCredentials: true })
      .then(res => setProfile(res.data))
      .catch(() => navigate('/users/login'));

    axios.get(`${BACKEND_URL}/users/attendance-history`, { withCredentials: true })
      .then(res => setHistory(res.data))
      .catch(err => console.error('History fetch error:', err));
  }, [BACKEND_URL, navigate]);

  // Run entrance animations once profile is loaded
  useEffect(() => {
    if (!profile) return;

    // header slide-in
    animate(headerRef.current, {
      opacity: [0, 1],
      translateY: [-20, 0],
      easing: 'easeOutQuad',
      duration: 600,
    });

    // avatar pop
    animate(avatarRef.current, {
      scale: [0, 1],
      easing: 'spring(1, 80, 10, 0)',
      duration: 800,
      delay: 300,
    });

    // details stagger
    animate('.profile-info .detail', {
      opacity: [0, 1],
      translateX: [-30, 0],
      easing: 'easeOutExpo',
      duration: 500,
      delay: stagger(100, { start: 500 }),
    });

    // table rows stagger
    animate('.attendance-history tbody tr', {
      opacity: [0, 1],
      translateY: [10, 0],
      easing: 'easeOutSine',
      duration: 400,
      delay: stagger(80, { start: 800 }),
    });
  }, [profile]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(`${BACKEND_URL}/users/logout`, {}, { withCredentials: true });
      navigate('/users/login');
    } catch {
      alert('Logout failed, please try again');
    }
  };

  // Photo upload handlers
  const handlePhotoChange = e => setPhotoFile(e.target.files[0]);
  const handlePhotoUpload = async e => {
    e.preventDefault();
    if (!photoFile) {
      setError('Please select a photo first.');
      return;
    }

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
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      const returnedUrl = res.data.photoUrl;
      const fullUrl = returnedUrl.startsWith('http')
        ? returnedUrl
        : `${BACKEND_URL.replace(/\/$/, '')}${returnedUrl}`;
      setProfile(p => ({ ...p, photoUrl: fullUrl }));
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

  const avatarSrc = profile.photoUrl
    ? (profile.photoUrl.startsWith('http')
        ? profile.photoUrl
        : `${BACKEND_URL.replace(/\/$/, '')}${profile.photoUrl}`)
    : defaultAvatar;

  return (
    <div className="profile">
      <header className="profile-header" ref={headerRef}>
        <h1>Your Profile</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section className="profile-info">
        <img
          className="avatar"
          src={avatarSrc}
          alt="Profile"
          ref={avatarRef}
        />
        <div className="details">
          <p className="detail">
            <strong>Email:</strong> {profile.email}
          </p>
          <p className="detail">
            <strong>Phone:</strong> {profile.phone_number}
          </p>

        </div>
      </section>

      <section className="profile-photo-upload">
        <h2>Change Profile Photo</h2>
        <form onSubmit={handlePhotoUpload}>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          <button className="upload-btn" type="submit" disabled={uploading}>
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
              {history.map(entry => (
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
