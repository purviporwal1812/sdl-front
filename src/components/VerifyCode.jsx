/* Updated VerifyCode.jsx */
import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function VerifyCode() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()
  const location = useLocation()
  // get email from navigation state or fallback
  const initialEmail = location.state?.email || ''

  const [email] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!email) {
      // if no email, redirect back to register
      navigate('/users/register')
    }
  }, [email, navigate])

  const handleVerify = async e => {
    e.preventDefault()
    setError(''); setInfo('')

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/users/verify-code`,
        { email, code },
        { withCredentials: true }
      )
      setInfo(data.message)
      setTimeout(() => navigate('/mark-attendance'), 1000)
    } catch (err) {
      console.error('[VerifyCode] error:', err.response || err)
      setError(err.response?.data?.message || 'Verification failed.')
    }
  }

  const handleResend = async () => {
    setError(''); setInfo('')
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/users/resend-verification`,
        { email },
        { withCredentials: true }
      )
      setInfo(data.message)
    } catch (err) {
      console.error('[VerifyCode] resend error:', err.response || err)
      setError('Failed to resend code.')
    }
  }

  return (
    <div className="verify-page">
      <div className="verify-card">
        <h2>Enter Verification Code for {email}</h2>
        {error && <div className="error-message">{error}</div>}
        {info && <div className="info-message">{info}</div>}

        <form onSubmit={handleVerify} noValidate>
          <div className="form-field">
            <input
              type="text"
              placeholder=" "
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            <label>6-Digit Code</label>
          </div>
          <button type="submit" className="btn verify-btn">
            Verify Email
          </button>
        </form>

        <button onClick={handleResend} className="link-btn">
          Didn’t get a code? Resend
        </button>

        <div className="links-row">
          <Link to="/users/register">Register</Link>
          <Link to="/users/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
