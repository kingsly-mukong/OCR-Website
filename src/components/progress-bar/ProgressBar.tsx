"use client";
import React from "react";
import "./progressBar.scss";

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  return (
    <div className="progressBar">
      <div className="bar" style={{ width: `${clampedProgress}%` }}></div>
      <span className="label">{Math.round(clampedProgress)}%</span>
    </div>
  );
};
