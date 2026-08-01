"use client";

import * as React from "react";
import { Zap, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
}

export function CompressButton({
  onClick,
  isLoading = false,
  isSuccess = false,
  disabled = false,
  size = "lg",
  className,
  children,
  ...props
}: CompressButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "relative group inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 select-none focus:outline-none focus:ring-2 focus:ring-emerald-400/50 active:scale-95 disabled:pointer-events-none",
        
        // Size variants
        size === "sm" && "h-9 px-4 text-xs gap-1.5",
        size === "default" && "h-11 px-5 text-sm gap-2",
        size === "lg" && "h-13 px-7 text-base gap-2.5",

        // State Styling Matrix
        // 1. Success State
        isSuccess
          ? "bg-emerald-500 text-slate-950 shadow-[0_0_30px_rgba(38,208,124,0.6)] ring-2 ring-emerald-300"
          : isLoading
          ? "bg-slate-900 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(38,208,124,0.25)] cursor-wait"
          : disabled
          ? "bg-slate-800/60 text-slate-500 border border-slate-700/40 opacity-50 cursor-not-allowed"
          : // Idle & Hover State
            "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)] hover:shadow-[0_0_35px_rgba(38,208,124,0.6)] hover:scale-[1.02]",

        className
      )}
      {...props}
    >
      {/* Ambient Pulsing Aura for Idle State */}
      {!disabled && !isLoading && !isSuccess && (
        <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-75" />
      )}

      {/* Button Content Wrapper */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {/* Loading Spinner */}
        {isLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400 shrink-0" />
        )}

        {/* Success Check Icon */}
        {isSuccess && (
          <CheckCircle2 className="h-5 w-5 text-slate-950 animate-bounce shrink-0" />
        )}

        {/* Idle / Hover Lightning Bolt */}
        {!isLoading && !isSuccess && (
          <Zap
            className={cn(
              "h-5 w-5 fill-slate-950 text-slate-950 transition-transform duration-300 shrink-0",
              !disabled && "group-hover:scale-110 group-hover:rotate-12"
            )}
          />
        )}

        {/* Dynamic Label Text */}
        <span>
          {children ? (
            children
          ) : isSuccess ? (
            "Compression Complete!"
          ) : isLoading ? (
            "Compressing Context..."
          ) : (
            "Compress Context"
          )}
        </span>

        {/* Sparkle micro-indicator on hover */}
        {!disabled && !isLoading && !isSuccess && (
          <Sparkles className="h-4 w-4 text-slate-950 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
        )}
      </span>
    </button>
  );
}
