import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  UploadCloud,
  FileImage,
  Layers,
  Tag,
  AlertCircle,
  Download,
  Zap,
  Info,
  X,
  RefreshCw,
  Trash2,
  Mail,
  Camera,
  Video,
} from "lucide-react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Inline Brand Icons since they are not in the core lucide-react package anymore
const LinkedinIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 16}
    height={props.size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Convert base64 dataURL back to a File object for analysis form submission
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Compress image to fit within sessionStorage quota limits
const compressImageForCache = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_SIZE = 800; // Limit image dimensions to stay inside 5MB quota
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const fileInputRef = useRef(null);
  const [userApiKey, setUserApiKey] = useState(
    localStorage.getItem("gemini_api_key") || "",
  );

  // Live Camera states and refs
  const [activeUploadTab, setActiveUploadTab] = useState("upload"); // 'upload' or 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Restore state from sessionStorage on page load
  useEffect(() => {
    const cachedImageBase64 = sessionStorage.getItem("cached_image_base64");
    const cachedImageName = sessionStorage.getItem("cached_image_name");
    const cachedAnalysisResult = sessionStorage.getItem(
      "cached_analysis_result",
    );

    if (cachedImageBase64 && cachedImageName) {
      try {
        const file = dataURLtoFile(cachedImageBase64, cachedImageName);
        setSelectedFile(file);
        setPreviewUrl(cachedImageBase64);
      } catch (err) {
        console.error("Error restoring cached image file:", err);
      }
    }

    if (cachedAnalysisResult) {
      try {
        setAnalysisResult(JSON.parse(cachedAnalysisResult));
      } catch (err) {
        console.error("Error restoring cached analysis result:", err);
      }
    }
  }, []);

  // Sync analysisResult changes to sessionStorage
  useEffect(() => {
    if (analysisResult) {
      try {
        sessionStorage.setItem(
          "cached_analysis_result",
          JSON.stringify(analysisResult),
        );
      } catch (err) {
        console.warn(
          "Storage quota exceeded, unable to cache analysis result:",
          err,
        );
      }
    } else {
      sessionStorage.removeItem("cached_analysis_result");
    }
  }, [analysisResult]);

  // Check API Health on load
  useEffect(() => {
    fetchHealth();
  }, [userApiKey]);

  const handleApiKeyChange = (val) => {
    setUserApiKey(val);
    localStorage.setItem("gemini_api_key", val);
  };

  const fetchHealth = async () => {
    try {
      const headers = {};
      if (userApiKey) headers["x-gemini-api-key"] = userApiKey;
      const res = await fetch(`${API_BASE}/api/health`, { headers });
      if (res.ok) {
        const data = await res.json();
        setApiHealth(data);
      }
    } catch (err) {
      console.warn("Backend API health check unreachable:", err);
    }
  };

  // Camera Management Logic
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg(
        "Failed to access camera. Please check permissions and connection.",
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Create an offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");

    // Capture mirrored to match webcam preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreviewUrl(dataUrl);

    const file = dataURLtoFile(dataUrl, `captured-photo-${Date.now()}.jpg`);
    setSelectedFile(file);

    // Cache in sessionStorage
    try {
      sessionStorage.setItem("cached_image_base64", dataUrl);
      sessionStorage.setItem("cached_image_name", file.name);
    } catch (err) {
      console.warn(
        "Storage quota exceeded, unable to cache captured photo:",
        err,
      );
    }

    stopCamera();
  };

  // Bind video stream once the video element is mounted in the DOM
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Image Selection
  const handleFileChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg(
        "Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).",
      );
      return;
    }
    setErrorMsg(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);

    // Compress and cache in sessionStorage
    compressImageForCache(file, (compressedBase64) => {
      try {
        sessionStorage.setItem("cached_image_base64", compressedBase64);
        sessionStorage.setItem("cached_image_name", file.name);
      } catch (err) {
        console.warn(
          "Storage quota exceeded, unable to cache image in sessionStorage:",
          err,
        );
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Trigger Analysis
  const handleAnalyze = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg("Please upload an image first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (previewUrl) {
        const resp = await fetch(previewUrl);
        const blob = await resp.blob();
        formData.append(
          "image",
          new File([blob], "image.png", { type: blob.type }),
        );
      }

      const reqHeaders = {};
      if (userApiKey) reqHeaders["x-gemini-api-key"] = userApiKey;

      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: reqHeaders,
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "Failed to complete image analysis";
        try {
          const errData = await response.json();
          errMsg = errData.message || errData.error || errMsg;

          if (typeof errMsg === "string" && errMsg.includes("{")) {
            const jsonStart = errMsg.indexOf("{");
            const jsonString = errMsg.slice(jsonStart);
            try {
              const parsedSub = JSON.parse(jsonString);
              if (parsedSub.error && parsedSub.error.message) {
                errMsg = `Gemini API Error: ${parsedSub.error.message}`;
              } else if (parsedSub.message) {
                errMsg = `Gemini API Error: ${parsedSub.message}`;
              }
            } catch (e) {
              // Fallback to original error string if sub-parsing fails
            }
          }
        } catch (jsonParseErr) {
          // Response is not JSON
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setAnalysisResult(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMsg(
        err.message || "An error occurred while analyzing the image.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download Report
  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const jsonStr = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image-recognition-report-${Date.now()}.json`;
    a.click();
  };

  const analysis = analysisResult?.analysis;

  // Render Upload Component Block
  const renderUploadSection = () => (
    <div className="upload-section-wrapper">
      {/* Upload/Capture Mode Switcher */}
      {!previewUrl && (
        <div
          className="view-switcher"
          style={{
            display: "flex",
            width: "100%",
            marginBottom: "16px",
            padding: "4px",
            borderRadius: "30px",
          }}
        >
          <button
            type="button"
            className={`switch-btn ${activeUploadTab === "upload" ? "active" : ""}`}
            onClick={() => {
              stopCamera();
              setActiveUploadTab("upload");
            }}
            style={{
              flex: 1,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "26px",
            }}
          >
            <UploadCloud size={16} />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            className={`switch-btn ${activeUploadTab === "camera" ? "active" : ""}`}
            onClick={() => {
              setActiveUploadTab("camera");
            }}
            style={{
              flex: 1,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "26px",
            }}
          >
            <Camera size={16} />
            <span>Live Camera</span>
          </button>
        </div>
      )}

      {/* Dropzone Card / Camera Player */}
      <div
        className="glass-panel dropzone-card-wrapper"
        style={{ overflow: "hidden" }}
      >
        {!previewUrl ? (
          activeUploadTab === "upload" ? (
            <div
              className="dropzone-card"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <div className="upload-icon-wrapper">
                <UploadCloud size={30} />
              </div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Upload Image for AI Recognition
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "14px",
                }}
              >
                Drag & drop PNG, JPG, WEBP, GIF or click to browse
              </p>
              <div
                style={{
                  display: "inline-flex",
                  gap: "8px",
                  fontSize: "0.78rem",
                  color: "var(--text-dim)",
                }}
              >
                <span>Max file size: 10MB</span>
              </div>
            </div>
          ) : !isCameraActive ? (
            <div
              className="dropzone-card"
              onClick={startCamera}
              style={{ cursor: "pointer" }}
            >
              <div className="upload-icon-wrapper">
                <Camera size={30} />
              </div>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Capture with Web Camera
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "14px",
                }}
              >
                Take a live photo directly using your webcam
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  startCamera();
                }}
                style={{ margin: "0 auto" }}
              >
                <Video size={14} />
                <span>Enable Camera Access</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "240px",
                background: "#000",
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scaleX(-1)",
                }}
              />
              {/* Scanner guide and controls overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "16px",
                  zIndex: 10,
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    className="status-badge"
                    style={{
                      background: "rgba(229, 62, 62, 0.25)",
                      border: "1px solid var(--primary)",
                      color: "#fff",
                      fontSize: "0.75rem",
                      padding: "4px 10px",
                    }}
                  >
                    <span
                      className="status-dot"
                      style={{
                        backgroundColor: "#ff3b30",
                        animation: "pulse 1.5s infinite",
                      }}
                    ></span>{" "}
                    Live Camera
                  </span>
                </div>

                {/* Camera overlay crosshair marker */}
                <div
                  style={{
                    alignSelf: "center",
                    width: "120px",
                    height: "120px",
                    border: "2px dashed rgba(255,255,255,0.4)",
                    borderRadius: "8px",
                    opacity: 0.6,
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleCapture}
                    style={{
                      width: "auto",
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <Camera size={14} />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={stopCamera}
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                      color: "#fff",
                    }}
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="preview-image" />
            {isAnalyzing && <div className="scan-line"></div>}
            <button
              className="remove-btn"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setAnalysisResult(null);
                sessionStorage.removeItem("cached_image_base64");
                sessionStorage.removeItem("cached_image_name");
                sessionStorage.removeItem("cached_analysis_result");
                stopCamera();
                navigate("/home");
              }}
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Action Trigger Card */}
      <div className="glass-panel info-card" style={{ marginTop: "16px" }}>
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={isAnalyzing || (!selectedFile && !previewUrl)}
          style={{ width: "100%" }}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw
                size={18}
                className="spin"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>Analyzing Image...</span>
            </>
          ) : (
            <>
              <Zap size={18} />
              <span>Run Image Recognition</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div
          className="glass-panel info-card"
          style={{
            borderColor: "var(--accent-rose)",
            background: "rgba(244, 63, 94, 0.1)",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              color: "var(--accent-rose)",
              fontWeight: 600,
            }}
          >
            <AlertCircle
              size={18}
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <div className="compact-error-box">{errorMsg}</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div
          className="header-brand"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        >
          <div>
            <div className="brand-title">
              Pixel<span style={{ color: "var(--primary)" }}>Agent</span>
            </div>
            <div className="brand-subtitle"></div>
          </div>
        </div>

        <div className="view-switcher">
          <button
            className={`switch-btn ${location.pathname === "/" || location.pathname === "/home" ? "active" : ""}`}
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className={`switch-btn ${location.pathname === "/dashboard" ? "active" : ""}`}
            onClick={() => {
              if (analysisResult) {
                navigate("/dashboard");
              } else {
                setErrorMsg(
                  "Please upload and analyze an image to view the dashboard.",
                );
              }
            }}
            style={{
              opacity: !analysisResult ? 0.6 : 1,
              cursor: !analysisResult ? "not-allowed" : "pointer",
            }}
            title={
              !analysisResult
                ? "Please run image recognition first"
                : "View recognition results"
            }
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Routes configuration */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <div className="centered-layout animate-fade-in">
              {renderUploadSection()}
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            analysisResult ? (
              <div className="main-grid animate-fade-in">
                {/* Left Sidebar (Upload & Image Preview) */}
                <aside className="sidebar-panel">{renderUploadSection()}</aside>

                {/* Right Section (Core Image Recognition Results) */}
                <main className="results-panel">
                  {/* API Key Warning Banner */}
                  {analysis?.apiError && (
                    <div
                      className="glass-panel info-card"
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        borderColor: "#ef4444",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          color: "#fca5a5",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          marginBottom: "6px",
                        }}
                      >
                        <AlertCircle size={18} color="#ef4444" />
                        <span>Gemini API Key Notice</span>
                      </div>
                      <p
                        style={{
                          color: "#f3f4f6",
                          fontSize: "0.88rem",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {analysis.apiError}
                      </p>
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "0.8rem",
                          color: "#9ca3af",
                        }}
                      >
                        👉 Get a free Gemini API key at:{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--accent-teal)",
                            textDecoration: "underline",
                          }}
                        >
                          https://aistudio.google.com/app/apikey
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Primary Subject & Context Hero Banner */}
                  {analysis?.primaryIdentification && (
                    <div
                      className="glass-panel info-card"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.15))",
                        borderColor: "rgba(99, 102, 241, 0.4)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.78rem",
                          textTransform: "uppercase",
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          color: "var(--accent-teal)",
                          marginBottom: "4px",
                        }}
                      >
                        🎯 Primary Subject Identified
                      </div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 800,
                          color: "#ffffff",
                          lineHeight: 1.4,
                        }}
                      >
                        "{analysis.primaryIdentification}"
                      </div>
                    </div>
                  )}

                  {/* Title & Summary Description */}
                  <div className="glass-panel info-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "14px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: "1.35rem",
                            fontWeight: 800,
                            color: "#fff",
                            marginBottom: "4px",
                          }}
                        >
                          {analysis?.title || "Visual Recognition Result"}
                        </h2>
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span>Model: Gemini 2.0 Flash</span>
                          <span>•</span>
                          <span>
                            Execution: {analysisResult.executionTimeMs || 0} ms
                          </span>
                        </div>
                      </div>

                      {analysis?.isMock && (
                        <div
                          className="status-badge fallback"
                          title={analysis.message}
                        >
                          <Info size={14} />
                          <span>Demo Mode (API Offline)</span>
                        </div>
                      )}
                    </div>

                    {analysis?.isMock && analysis.message && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(229, 62, 62, 0.08)",
                          border: "1px solid rgba(229, 62, 62, 0.2)",
                          fontSize: "0.82rem",
                          color: "var(--accent-rose)",
                          lineHeight: "1.45",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <strong>API System Message:</strong> {analysis.message}
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--text-main)",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {analysis?.summary}
                    </p>
                  </div>

                  {/* Detected Objects List */}
                  <div className="glass-panel info-card">
                    <div
                      className="card-heading"
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        paddingBottom: "10px",
                      }}
                    >
                      <Layers size={18} color="var(--accent-cyan)" />
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#fff",
                          marginLeft: "8px",
                        }}
                      >
                        Detected Objects & Confidence Scores
                      </span>
                    </div>
                    <div className="objects-grid">
                      {analysis?.detectedObjects?.map((obj, idx) => (
                        <div key={idx} className="object-item">
                          <div className="object-header">
                            <span className="object-title">{obj.label}</span>
                            <span className="confidence-pill">
                              {obj.confidence}
                            </span>
                          </div>
                          <p className="object-desc">{obj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classification Tags */}
                  {analysis?.tags && analysis.tags.length > 0 && (
                    <div className="glass-panel info-card">
                      <div className="card-heading">
                        <Tag size={18} color="var(--primary)" />
                        <span
                          style={{
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: "#fff",
                            marginLeft: "8px",
                          }}
                        >
                          Classification Tags
                        </span>
                      </div>
                      <div className="tags-wrapper">
                        {analysis.tags.map((tag, idx) => (
                          <div key={idx} className="tag-badge">
                            <span>#</span>
                            <span>{tag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export JSON Report */}
                  <div className="glass-panel export-bar">
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Analysis complete • JSON report ready for download
                    </span>
                    <button
                      className="btn-secondary"
                      onClick={handleDownloadReport}
                    >
                      <Download size={14} />
                      <span>Export JSON Report</span>
                    </button>
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
      </Routes>

      {/* Footer */}
      <footer className="app-footer glass-panel">
        <div className="footer-left">
          <span>
            Built by <strong> Sridhar Konda</strong>
          </span>
          <span className="footer-divider">|</span>
          <span className="footer-role"></span>
        </div>
        <div className="footer-right">
          <a
            href="https://www.linkedin.com/in/sridhar-konda/"
            target="_blank"
            rel="noreferrer"
            className="footer-social-btn"
            title="LinkedIn"
          >
            <LinkedinIcon size={16} />
          </a>
          <a
            href="https://github.com/Sridharsri67"
            target="_blank"
            rel="noreferrer"
            className="footer-social-btn"
            title="GitHub"
          >
            <GithubIcon size={16} />
          </a>
          <a
            href="mailto:sridharsri5959@gmail.com"
            className="footer-social-btn"
            title="Email"
          >
            <Mail size={16} />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
