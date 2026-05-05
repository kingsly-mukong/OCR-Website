"use client";
import React from "react";
import "./loader.scss";

interface LoaderProps {
  size?: "small" | "medium" | "large";
}

export const Loader: React.FC<LoaderProps> = ({ size = "medium" }) => {
  return <div className={`loader ${size}`}></div>;
};
