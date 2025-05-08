import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function FaceVerify() {
  const [status, setStatus] = useState("Loading models…");
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const MODEL_URL = `${window.location.origin}/models`;

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading face-api models…");
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setStatus("Models loaded. Starting camera…");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamRef.current.video.srcObject = stream;
        setStatus("Ready – align your face and click Verify.");
      } catch (err) {
        console.error("Model load error:", err);
        setStatus("Error loading models.");
      }
    };
    loadModels();
  }, []);

  const handleVerify = async () => {
    setStatus("Capturing…");
    const detection = await faceapi
      .detectSingleFace(webcamRef.current.video, new faceapi.TinyFaceDetectorOptions())
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
        setStatus("Verified! Redirecting…");
        navigate("/dashboard");
      } else {
        const msg = await res.text();
        setStatus("Verification failed: " + msg);
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
      <Webcam
        ref={webcamRef}
        audio={false}
        videoConstraints={{ facingMode: "user" }}
        style={{ borderRadius: 8 }}
      />
      <br />
      <button onClick={handleVerify} disabled={status.startsWith("Loading")}>
        Verify My Face
      </button>
    </div>
  );
}
