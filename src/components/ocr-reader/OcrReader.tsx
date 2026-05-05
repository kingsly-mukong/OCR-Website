/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useCallback, useRef } from "react";
import { createWorker } from "tesseract.js";
import { FileUpload } from "../file-upload/FileUpload";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { ResultDisplay } from "../result-display/ResultDisplay";
import { Button } from "../button/Button";
import { Loader } from "../loader/Loader";
import "./ocrReader.scss";

type OcrStatus = "idle" | "loading" | "processing" | "success" | "error";

export const OcrReader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [status, setStatus] = useState<OcrStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const workerRef = useRef<any>(null); // Use any to avoid type conflicts

  const initWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    setStatus("loading");
    setStatusMessage("Initializing OCR engine...");

    // Create worker with a single logger that handles all stages
    const worker = await createWorker("eng", undefined, {
      logger: (m) => {
        if (m.status === "loading tesseract core") {
          setProgress(10);
          setStatusMessage("Loading OCR core...");
        } else if (m.status === "initializing api") {
          setProgress(30);
          setStatusMessage("Initializing API...");
        } else if (m.status === "loading language") {
          setProgress(35);
          setStatusMessage("Loading language data...");
        } else if (m.status === "recognizing text") {
          // Recognition progress (0 to 1) -> map to 40-100%
          const recogProgress = 40 + (m.progress || 0) * 60;
          setProgress(recogProgress);
          setStatusMessage(`Recognizing: ${Math.round(recogProgress)}%`);
        }
      },
    });

    setProgress(40);
    setStatusMessage("Ready to process");
    workerRef.current = worker;
    return worker;
  }, []);

  const processImage = useCallback(
    async (file: File) => {
      try {
        setStatus("processing");
        setExtractedText("");
        setProgress(40);
        setStatusMessage("Starting OCR...");

        const worker = await initWorker();

        // No need to call setLogger - the existing logger already handles recognition
        const { data } = await worker.recognize(file);
        setExtractedText(data.text);
        setProgress(100);
        setStatus("success");
        setStatusMessage("OCR completed!");
      } catch (error) {
        console.error("OCR failed:", error);
        setStatus("error");
        setStatusMessage("OCR failed. Please try again with a clearer image.");
        setProgress(0);
      }
    },
    [initWorker],
  );

  const terminateWorker = useCallback(async () => {
    if (workerRef.current) {
      await workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setExtractedText("");
    setStatus("idle");
    setProgress(0);
    setStatusMessage("");
  }, []);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;
    await processImage(selectedFile);
  }, [selectedFile, processImage]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setExtractedText("");
    setStatus("idle");
    setProgress(0);
    setStatusMessage("");
    terminateWorker();
  }, [terminateWorker]);

  const handleReset = () => {
    handleClear();
  };

  return (
    <div className="ocr-container">
      <div className="card">
        <h2 className="title">📄 OCR Extract Text from Image</h2>
        <p className="subtitle">
          Upload an image and extract text using Tesseract.js
          <span style={{ fontSize: "0.75rem", marginLeft: "0.5rem" }}>
            (runs locally, no data leaves your device)
          </span>
        </p>

        <div className="uploadSection">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Show selected file info + quick actions */}
        {selectedFile && status !== "success" && (
          <div
            className="fileInfo"
            style={{
              marginBottom: "1rem",
              fontSize: "0.875rem",
              color: "var(--secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>
              📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}{" "}
              KB)
            </span>
            <button
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              ✖ Remove
            </button>
          </div>
        )}

        {selectedFile && status !== "success" && (
          <div className="progressSection">
            {status === "loading" && <Loader size="medium" />}
            <ProgressBar progress={progress} />
            <p className="statusMessage">
              {status === "loading" && "⚙️ "}
              {status === "processing" && "🔍 "}
              {statusMessage}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                onClick={handleProcess}
                disabled={status === "processing" || status === "loading"}
                isLoading={status === "processing"}
              >
                {status === "processing" ? "Processing..." : "✨ Extract Text"}
              </Button>
              {status !== "processing" && status !== "loading" && (
                <Button variant="secondary" onClick={handleClear}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="errorBox">
            <p>⚠️ {statusMessage}</p>
            <Button onClick={handleReset}>Try Another Image</Button>
          </div>
        )}

        {extractedText && (
          <div className="result-wrapper">
            <div className="success-badge">
              <span
                style={{
                  background: "#10b98120",
                  padding: "0.2rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#10b981",
                }}
              >
                ✓ Extraction complete
              </span>
            </div>
            <div className="result-scroll">
              <ResultDisplay text={extractedText} onClear={handleClear} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
