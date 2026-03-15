"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: "sm" | "md";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, inputSize = "md", className = "", ...props }, ref) => {
    const heightClass = inputSize === "sm" ? "h-8" : "h-9";

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`block w-full rounded-md border bg-gray-800 px-3 text-sm text-gray-100 placeholder-gray-500 transition-colors duration-150 focus:outline-none focus:ring-1 ${heightClass} ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-700 focus:border-brand-500 focus:ring-brand-500/20"
          } disabled:bg-gray-850 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-300">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
