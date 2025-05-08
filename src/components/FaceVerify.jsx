import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function FaceVerify() {
  const [status, setStatus] = useState("Loading models…");
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const MODEL_URL = `${window.location.origin}/models/`;

  // 1️⃣ Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + "tiny_face_detector/");
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + "face_landmark_68/");
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + "face_recognition/");
        setStatus("Models loaded. Starting camera…");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamRef.current.srcObject = stream;
        setStatus("Ready – please align your face.");
      } catch (err) {
        console.error("Model load error:", err);
        setStatus("Error loading models.");
      }
    };
    loadModels();
  }, []);

  // 2️⃣ Capture and verify
  const handleVerify = async () => {
    setStatus("Capturing…");
    const detection = await faceapi
      .detectSingleFace(webcamRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("No face detected. Try again.");
      return;
    }

    setStatus("Verifying…");
    const descriptorArray = Array.from(detection.descriptor);

    try {
      const res = await fetch("https://sdl-back.vercel.app/users/face-verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ face_descriptor: descriptorArray }),
      });
      if (res.ok) {
        setStatus("Face verified! Redirecting…");
        navigate("/dashboard");
      } else {
        const text = await res.text();
        setStatus("Verification failed: " + text);
      }
    } catch (err) {
      console.error("Face‑verify error:", err);
      setStatus("Server error. Try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Face Verification</h1>
      <p>{status}</p>
      <video ref={webcamRef} autoPlay muted width={480} height={360} style={{ borderRadius: 8 }} />
      
              <Webcam
                ref={webcamRef}
                className="webcam-feed"
                audio={false}
                videoConstraints={{ facingMode: "user" }}
              />
      <br />
      <button onClick={handleVerify} disabled={status.startsWith("Loading")}>
        Verify My Face
      </button>
    </div>
  );
}
