// src/components/Register.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate }                from 'react-router-dom'
import axios                                 from 'axios'
import Webcam                                from 'react-webcam'
import * as faceapi                          from 'face-api.js'
import './styles/Register.css'

export default function Register() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
  const navigate    = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [descriptor, setDescriptor] = useState(null)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  const webcamRef = useRef(null)

  // Load face-api models once
  useEffect(() => {
    const MODEL_URL = `${window.location.origin}/models/`
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/'),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/'),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/')
    ])
    .then(() => console.log('[Register] face-api models loaded'))
    .catch(err => console.error('[Register] model load error:', err))
  }, [])

  // Capture face descriptor
  const captureFace = async () => {
    setError('')
    const video = webcamRef.current?.video
    if (!video) return setError('Webcam not ready')

    try {
      console.log('[Register] ➥ Capturing face')
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) {
        setDescriptor(detection.descriptor)
        console.log('[Register] descriptor captured', detection.descriptor)
      } else {
        console.warn('[Register] ✖ No face detected')
        setError('Face not detected')
      }
    } catch (err) {
      console.error('[Register] face detection error:', err)
      setError('Face detection failed')
    }
  }

  // Submit registration
  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!descriptor) {
      return setError('Please capture your face before registering.')
    }

    setLoading(true)
    const payload = {
      email,
      password,
      phone_number: phone,
      face_descriptor: Array.from(descriptor)
    }
    console.log('[Register] POST', `${BACKEND_URL}/users/register`, payload)

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/users/register`,
        payload,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )
      console.log('[Register] success response:', data)
      // go to verify-success page
      navigate('/verify-success')
    } catch (err) {
      console.error('[Register] error response:', err.response || err)
      const msg = err.response?.data?.message || 'Registration failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="hero-section">
        <div className="hero-overlay"/>
        <div className="hero-text">
          <h2>Secure your spot—register with a glance.</h2>
        </div>
      </div>

      <div className="form-section">
        {error && <div className="error-message">{error}</div>}

        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{ facingMode: 'user' }}
          className="webcam-feed"
        />
        <button
          onClick={captureFace}
          className="btn capture-btn"
          disabled={loading}
        >
          Capture Face
        </button>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="email">Email Address</label>
          </div>
          <div className="form-field">
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="phone">Phone Number</label>
          </div>
          <div className="form-field">
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <button
            type="submit"
            className="btn submit-btn"
            disabled={loading}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <div className="links-row">
          <Link to="/">Back to Home</Link>
          <Link to="/users/login">Already Registered?</Link>
        </div>
      </div>
    </div>
  )
}
