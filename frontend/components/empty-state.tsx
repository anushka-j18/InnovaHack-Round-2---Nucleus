"use client";

import * as React from "react";
import {
  Sparkles,
  Zap,
  AlertCircle,
  FileText,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "no-data" | "loading" | "error" | "first-run";
  errorMessage?: string | null;
  onRetry?: () => void;
  onLoadSample?: (type: "code" | "log" | "prose") => void;
  className?: string;
}

export function EmptyState({
  type,
  errorMessage,
  onRetry,
  onLoadSample,
  className,
}: EmptyStateProps) {
  if (type === "loading") {
    return (
      <Card variant="glass" className={cn("w-full border-slate-800/80 bg-slate-900/60 p-12 text-center shadow-xl", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="h-8 w-8 animate-pulse" />
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Executing Compression Pipeline</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Processing semantic chunking, vector deduplication, and TF-IDF line scoring...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (type === "error") {
    return (
      <Card variant="glass" className={cn("w-full border-red-500/30 bg-slate-900/80 p-8 text-center shadow-xl", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-bold text-red-400">Compression Failed</h3>
            <p className="text-xs text-slate-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20 font-mono">
              {errorMessage || "An unexpected error occurred while communicating with the backend engine."}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2 border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Compression</span>
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // First Run / No Data State
  return (
    <Card variant="glass" className={cn("w-full border-slate-800/80 bg-slate-900/40 p-10 text-center shadow-xl", className)}>
      <div className="flex flex-col items-center justify-center space-y-5 max-w-md mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_-3px_rgba(38,208,124,0.2)]">
          <Sparkles className="h-7 w-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-100">Ready to Compress Context</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste your raw context prompt above or select a sample dataset below to analyze token reduction & LLM reasoning accuracy.
          </p>
        </div>

        {onLoadSample && (
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadSample("code")}
              className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Load Python Code</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadSample("log")}
              className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
            >
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Load Server Logs</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLoadSample("prose")}
              className="gap-1.5 text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Load Document</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
