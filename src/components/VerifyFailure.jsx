import React from 'react';
import { Link } from 'react-router-dom';

export default function VerifyFailure() {
  return (
    <div className="verify-page">
      <div className="message-card animate__animated animate__shakeX">
        <h2>Verification Failed</h2>
        <p>The link is invalid or expired. You can go back to <Link to="/users/register">register</Link>.</p>
      </div>
    </div>
  );
}
