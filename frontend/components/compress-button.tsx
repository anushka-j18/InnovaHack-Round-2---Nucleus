"use client";

import * as React from "react";
import { Zap, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CompressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
}

export const CompressButton = React.forwardRef<
  HTMLButtonElement,
  CompressButtonProps
>(
  (
    {
      className,
      isLoading = false,
      isSuccess = false,
      disabled = false,
      size = "lg",
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    // Current button state determination
    const currentState = isSuccess
      ? "success"
      : isLoading
      ? "loading"
      : disabled
      ? "disabled"
      : "idle";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(
          "group relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 select-none overflow-hidden",
          size === "sm" && "h-9 px-4 text-xs gap-1.5",
          size === "default" && "h-11 px-5 text-sm gap-2",
          size === "lg" && "h-12 px-6 text-base gap-2.5",

          // State-specific styling
          currentState === "idle" &&
            "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 hover:opacity-95 shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)] hover:shadow-[0_0_30px_-2px_rgba(38,208,124,0.6)] active:scale-[0.98]",

          currentState === "loading" &&
            "bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)] cursor-wait opacity-90",

          currentState === "success" &&
            "bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(38,208,124,0.6)] scale-[1.02]",

          currentState === "disabled" &&
            "bg-slate-800/80 border border-slate-700/60 text-slate-500 opacity-50 cursor-not-allowed shadow-none",

          className
        )}
        {...props}
      >
        {/* Animated Background Pulse Shimmer */}
        {currentState === "idle" && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        )}

        {/* State Content Rendering */}
        {currentState === "loading" && (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-slate-950 shrink-0" />
            <span>Compressing Context...</span>
          </>
        )}

        {currentState === "success" && (
          <>
            <CheckCircle2 className="h-5 w-5 text-slate-950 shrink-0 animate-bounce" />
            <span>Compressed Successfully!</span>
          </>
        )}

        {currentState === "disabled" && (
          <>
            <Zap className="h-4 w-4 text-slate-500 shrink-0" />
            <span>{children || "Compress Context"}</span>
          </>
        )}

        {currentState === "idle" && (
          <>
            <Zap className="h-5 w-5 fill-slate-950 text-slate-950 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span>{children || "Compress Context"}</span>
            <ArrowRight className="h-4 w-4 text-slate-950 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </button>
    );
  }
);

CompressButton.displayName = "CompressButton";
