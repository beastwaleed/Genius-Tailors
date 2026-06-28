import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import './AIMeasurementCamera.css';

const AIMeasurementCamera = ({ onMeasurementsReady, onClose }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [heightInches, setHeightInches] = useState('');
  const [scanning, setScanning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let camera = null;
    let pose = null;

    const loadScript = (src) => new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      document.body.appendChild(script);
    });

    const initAI = async () => {
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');

      if (!window.Pose || !window.Camera) {
        setErrorMsg('Failed to load AI models. Check your internet connection.');
        return;
      }

      pose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      if (webcamRef.current && webcamRef.current.video) {
        camera = new window.Camera(webcamRef.current.video, {
          onFrame: async () => {
            if (webcamRef.current && webcamRef.current.video && pose) {
              await pose.send({ image: webcamRef.current.video });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start().then(() => setIsLoaded(true));
      }
    };

    initAI();

    return () => {
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []);

  const onResults = (results) => {
    if (!canvasRef.current || !webcamRef.current || !window.drawConnectors) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.poseLandmarks) {
      window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#C9A96E', lineWidth: 4 });
      window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ffffff', lineWidth: 2, radius: 4 });

      window.currentPoseLandmarks = results.poseLandmarks;
    }
    canvasCtx.restore();
  };

  const startScanProcess = () => {
    if (!heightInches || isNaN(heightInches) || heightInches < 30) {
      setErrorMsg('Please enter a valid height in inches (e.g., 70 for 5\\"10").');
      return;
    }
    setErrorMsg('');
    setCountdown(5);

    let counter = 5;
    const timer = setInterval(() => {
      counter -= 1;
      setCountdown(counter);
      if (counter <= 0) {
        clearInterval(timer);
        setCountdown(null);
        captureAndCalculate();
      }
    }, 1000);
  };

  const captureAndCalculate = () => {
    const landmarks = window.currentPoseLandmarks;
    if (!landmarks) {
      setErrorMsg('No body detected. Please stand back so your full body is visible in the frame.');
      return;
    }

    setScanning(true);

    setTimeout(() => {
      // 0: nose, 11/12: shoulders, 13/14: elbows, 15/16: wrists, 23/24: hips, 27/28: ankles, 31/32: feet
      const nose = landmarks[0];
      const leftFoot = landmarks[31];
      const rightFoot = landmarks[32];

      const footY = (leftFoot.y + rightFoot.y) / 2;
      const pixelHeightNormalized = footY - nose.y;

      if (pixelHeightNormalized < 0.3) {
        setScanning(false);
        setErrorMsg('Please step back. You are too close to the camera.');
        return;
      }

      // Pixels (normalized) to Inches ratio
      const inchesPerUnit = parseFloat(heightInches) / pixelHeightNormalized;

      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftWrist = landmarks[15];
      const leftHip = landmarks[23];
      const leftAnkle = landmarks[27];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];

      // Pythagorean distance
      const dist = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      // Calculate Tailoring Measurements (in inches)
      // 2D distance needs a multiplier (~1.25) to account for the physical wrap/curve around the back
      const shoulderWidth = dist(leftShoulder, rightShoulder) * inchesPerUnit * 1.25;

      // Sleeve length (shoulder to wrist + 1.0 inch allowance for bending)
      const armLength = (dist(leftShoulder, leftWrist) * inchesPerUnit) + 1.0;

      // Kameez length (shoulder straight down to average knee position + 1.5 inches for fold)
      const kneeY = (leftKnee.y + rightKnee.y) / 2;
      const kameezLength = dist(leftShoulder, { x: leftShoulder.x, y: kneeY }) * inchesPerUnit + 1.5;

      // Shalwar length (hip to ankle + 2.5 inches allowance for waist fold and pauncha)
      const shalwarLength = (dist(leftHip, leftAnkle) * inchesPerUnit) + 2.5;

      const measurements = {
        shoulder: shoulderWidth.toFixed(1),
        sleeves: armLength.toFixed(1),
        kameezLength: kameezLength.toFixed(1),
        shalwarLength: shalwarLength.toFixed(1),
        // Chest: Shoulder width * 2 + 4 inches breathing room for comfortable traditional fit
        chest: (shoulderWidth * 2 + 4).toFixed(1),
        abdomen: (shoulderWidth * 2 + 2).toFixed(1), // Roughly Chest - 2
        hips: (shoulderWidth * 2 + 5).toFixed(1),    // Roughly Chest + 1 for loose fit
        // Neck: Standard ratio based on shoulder
        neck: (shoulderWidth * 0.85).toFixed(1),
        // Crotch Depth (Asan): Approx 22% of total height for average adult
        crotchDepth: (parseFloat(heightInches) * 0.22).toFixed(1),
        // Bottom / Pancha: Standard 7.5 inches for most Shalwars
        bottom: "7.5",
      };

      setScanning(false);
      onMeasurementsReady(measurements);
    }, 2000); // 2 second scan animation
  };

  return (
    <div className="ai-camera-overlay animate-fade-in">
      <div className="ai-camera-modal">
        <div className="ai-camera-header">
          <h3 className="text-heading-3">AI Body Scanner</h3>
          <button className="ai-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="ai-camera-body">
          <div className="camera-container">
            {!isLoaded && <div className="camera-loading">Initializing Neural Network...</div>}

            <Webcam
              ref={webcamRef}
              audio={false}
              videoConstraints={{ facingMode: "user" }}
              className="webcam-view"
            />
            <canvas ref={canvasRef} className="canvas-view" />

            {countdown !== null && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
                <span style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Step back! Scanning in...</span>
                <span style={{ fontSize: '5rem', color: '#C9A96E', fontWeight: 'bold' }}>{countdown}</span>
              </div>
            )}
            
            {scanning && (
              <div className="scanning-overlay">
                <div className="scanner-line"></div>
                <span className="scanner-text">Processing Pose Landmarks...</span>
              </div>
            )}
          </div>

          <div className="ai-controls">
            <p className="text-small ai-instructions">
              <strong>Step 1:</strong> Enter your exact height below.<br />
              <strong>Step 2:</strong> Stand back so your entire body is visible.<br />
              <strong>Step 3:</strong> Stand straight and click 'Scan'.
            </p>

            {errorMsg && <div className="alert-error">{errorMsg}</div>}

            <div className="ai-input-group">
              <div style={{ flex: 1 }}>
                <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Height (Inches)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 70 (for 5'10&quot;)"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                />
              </div>
              <button
                className="btn btn-gold"
                style={{ height: '48px', alignSelf: 'flex-end', minWidth: '140px' }}
                onClick={startScanProcess}
                disabled={!isLoaded || scanning || countdown !== null}
              >
                {scanning || countdown !== null ? 'Scanning...' : 'Start Scan 📸'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMeasurementCamera;
