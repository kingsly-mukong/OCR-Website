"use client";
import React from "react";
import "./button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`button ${variant} ${size}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="spinner"></span>}
      {children}
    </button>
  );
};
