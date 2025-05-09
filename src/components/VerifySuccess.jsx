import React from 'react';
import { Link } from 'react-router-dom';

export default function VerifySuccess() {
  return (
    <div className="verify-page">
      <div className="message-card animate__animated animate__fadeIn">
        <h2>Email Verified!</h2>
        <p>Your address has been confirmed. You may now <Link to="/users/login">log in</Link>.</p>
      </div>
    </div>
  );
}
