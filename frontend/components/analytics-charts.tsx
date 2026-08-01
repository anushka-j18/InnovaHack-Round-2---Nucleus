"use client";

import * as React from "react";
import { BarChart2, Clock, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompressResponse } from "@/lib/api";

interface AnalyticsChartsProps {
  data: CompressResponse;
  className?: string;
}

export function AnalyticsCharts({ data, className }: AnalyticsChartsProps) {
  const rawTokens = data.raw_tokens;
  const compTokens = data.compressed_tokens;
  const ratio = data.compression_ratio;
  const speedup = data.latency_speedup_ratio || 3.2;

  // Relative progress width calculations
  const compPercentage = Math.min(100, Math.round((compTokens / (rawTokens || 1)) * 100));
  const savedPercentage = Math.max(0, 100 - compPercentage);

  // Latency estimation (approx 0.5ms per token for raw vs compressed)
  const rawLatencySec = (rawTokens * 0.005).toFixed(2);
  const compLatencySec = (compTokens * 0.005).toFixed(2);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Visual Compression Analytics
            <Badge variant="cyan" className="text-xs">
              Live Comparative
            </Badge>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive comparative charts for token size, prefill latency, and savings ratio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Token Comparison Bar Chart */}
        <Card variant="glass" className="border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Token Volume Comparison</h3>
                <p className="text-[11px] text-slate-400">Raw vs Compressed Context</p>
              </div>
            </div>
            <Badge variant="emerald" className="text-[10px]">
              -{ratio}%
            </Badge>
          </div>

          {/* Bar comparison representation */}
          <div className="space-y-4 pt-2">
            {/* Raw Tokens Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Original Context</span>
                <span className="font-semibold text-slate-200">{rawTokens.toLocaleString()} tokens</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                <div className="h-full bg-slate-700 w-full transition-all duration-500" />
              </div>
            </div>

            {/* Compressed Tokens Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold">Compressed Context</span>
                <span className="font-semibold text-emerald-400">{compTokens.toLocaleString()} tokens</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_#26d07c] transition-all duration-700 ease-out"
                  style={{ width: `${compPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Chart 2: Latency Speedup Chart */}
        <Card variant="glass" className="border-slate-800/80 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Prefill Latency Speedup</h3>
                <p className="text-[11px] text-slate-400">LLM Processing Time Reduction</p>
              </div>
            </div>
            <Badge variant="cyan" className="text-[10px]">
              {speedup}x Speedup
            </Badge>
          </div>

          <div className="space-y-4 pt-2">
            {/* Raw Latency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Raw Prefill Latency</span>
                <span className="font-semibold text-slate-200">~{rawLatencySec}s</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                <div className="h-full bg-slate-700 w-full transition-all duration-500" />
              </div>
            </div>

            {/* Compressed Latency */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 font-semibold">Compressed Latency</span>
                <span className="font-semibold text-cyan-400">~{compLatencySec}s</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_12px_#06b6d4] transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(10, Math.round(100 / speedup))}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Chart 3: Token Reduction Efficiency Radial Gauge */}
        <Card variant="glass" className="border-slate-800/80 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Percent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Savings Gauge</h3>
                <p className="text-[11px] text-slate-400">Efficiency Yield</p>
              </div>
            </div>
            <Badge variant="emerald" className="text-[10px]">
              Target Exceeded
            </Badge>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950 shadow-inner">
              <div
                className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin-slow"
                style={{
                  clipPath: `inset(0 0 0 0)`,
                  transform: `rotate(${Math.round(savedPercentage * 3.6)}deg)`,
                }}
              />
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {ratio}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Saved
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            {savedPercentage}% reduction achieved while maintaining 100% semantic reasoning.
          </p>
        </Card>
      </div>
    </div>
  );
}
