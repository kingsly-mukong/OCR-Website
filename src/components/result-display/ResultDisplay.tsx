"use client";
import React, { useState } from "react";
import { Button } from "../button/Button";
import "./resultDisplay.scss";

interface ResultDisplayProps {
  text: string;
  onClear: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  text,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-result.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!text) return null;

  return (
    <div className="resultDisplay">
      <div className="header">
        <h3>Extracted Text</h3>
        <div className="actions">
          <Button size="sm" onClick={copyToClipboard}>
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadAsTxt}>
            Download
          </Button>
          <Button size="sm" variant="danger" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
      <pre className="text">{text}</pre>
    </div>
  );
};
