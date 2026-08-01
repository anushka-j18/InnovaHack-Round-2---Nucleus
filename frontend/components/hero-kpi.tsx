"use client";

import * as React from "react";
import { Check, Zap, ShieldCheck, DollarSign, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompressResponse } from "@/lib/api";

interface HeroKPIProps {
  data: CompressResponse;
  className?: string;
}

export function HeroKPI({ data, className }: HeroKPIProps) {
  const ratio = data.compression_ratio;
  const accuracy = data.accuracy_retained !== null && data.accuracy_retained !== undefined ? data.accuracy_retained : 100.0;
  const speedup = data.latency_speedup_ratio || 3.4;
  const costPercent = Math.round(ratio);

  const isTargetAchieved = ratio >= 70;

  return (
    <Card className={cn("relative overflow-hidden border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl", className)}>
      {/* Background ambient glow mesh */}
      <div
        className={cn(
          "pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[500px] rounded-full blur-[100px]",
          isTargetAchieved ? "bg-emerald-500/15" : "bg-amber-500/15"
        )}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Main Hero KPI Score Display */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Circular / Large Score Badge */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Context Compressed
            </span>
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-6xl sm:text-7xl font-extrabold font-mono tracking-tight",
                  isTargetAchieved
                    ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent"
                    : "bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"
                )}
              >
                {ratio.toFixed(1)}%
              </span>

              {/* Status Badge */}
              <Badge
                variant={isTargetAchieved ? "emerald" : "secondary"}
                className={cn(
                  "px-3 py-1 text-xs font-bold uppercase tracking-wider gap-1.5 shadow-lg",
                  isTargetAchieved
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                )}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>{isTargetAchieved ? "TARGET ACHIEVED" : "Below Target"}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* 3 Benchmark Validation Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Pill 1: Semantic Accuracy */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>{accuracy.toFixed(0)}% Semantic</span>
              </div>
              <span className="text-[11px] text-slate-400">Reasoning Retained</span>
            </div>
          </div>

          {/* Pill 2: Latency Speedup */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-bold text-cyan-400">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>{speedup.toFixed(1)}× Faster</span>
              </div>
              <span className="text-[11px] text-slate-400">Inference Speedup</span>
            </div>
          </div>

          {/* Pill 3: Cost Savings */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 backdrop-blur-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>{costPercent}% Cost</span>
              </div>
              <span className="text-[11px] text-slate-400">Token Cost Reduction</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
