"use client";

import * as React from "react";
import {
  FileText,
  BrainCircuit,
  Layers,
  Filter,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "input",
    name: "Input Context",
    description: "Raw prompt ingestion & boundary tokenization",
    icon: FileText,
  },
  {
    id: "analysis",
    name: "Semantic Analysis",
    description: "Detecting content type & parsing AST structures",
    icon: BrainCircuit,
  },
  {
    id: "deduplication",
    name: "Duplicate Detection",
    description: "Vector embedding & cosine similarity clustering",
    icon: Layers,
  },
  {
    id: "scoring",
    name: "Importance Scoring",
    description: "TF-IDF line scoring & signature floor protection",
    icon: Filter,
  },
  {
    id: "compression",
    name: "Compression",
    description: "Adaptive filler stripping & token reduction",
    icon: Minimize2,
  },
  {
    id: "validation",
    name: "Validation",
    description: "LLM reasoning retention & semantic QA verification",
    icon: CheckCircle2,
  },
  {
    id: "results",
    name: "Results",
    description: "Optimized prompt ready for downstream inference",
    icon: Sparkles,
  },
];

interface PipelineLoadingProps {
  currentStageIndex: number; // 0 to 6
  isCompressing: boolean;
  className?: string;
}

export function PipelineLoading({
  currentStageIndex,
  isCompressing,
  className,
}: PipelineLoadingProps) {
  const progressPercent = Math.min(
    100,
    Math.round(((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100)
  );

  return (
    <Card className={cn("w-full border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Nucleus AI Pipeline Visualization
              {isCompressing && (
                <Badge variant="emerald" className="gap-1 animate-pulse py-0.5 text-[10px]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Processing</span>
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-slate-400">
              Live multi-stage context compression engine execution pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
          <span>{progressPercent}%</span>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-500 ease-out shadow-[0_0_12px_#26d07c]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Horizontal Pipeline Process Stepper for Desktop / Tablet */}
        <div className="hidden md:grid grid-cols-7 gap-2 items-center">
          {PIPELINE_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isDone = index < currentStageIndex;
            const isActive = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center space-y-2 group">
                <div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
                    isDone &&
                      "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(38,208,124,0.3)]",
                    isActive &&
                      "bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 border-transparent shadow-[0_0_20px_rgba(38,208,124,0.6)] scale-110",
                    isPending &&
                      "bg-slate-950 border-slate-800 text-slate-600 opacity-60"
                  )}
                >
                  {isDone ? (
                    <Check className="h-5 w-5 stroke-[3]" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin stroke-[2.5]" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <span
                  className={cn(
                    "text-xs font-semibold leading-tight max-w-[90px]",
                    isActive ? "text-emerald-400" : isDone ? "text-slate-200" : "text-slate-500"
                  )}
                >
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Vertical Pipeline List for Mobile */}
        <div className="md:hidden space-y-2.5">
          {PIPELINE_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isDone = index < currentStageIndex;
            const isActive = index === currentStageIndex;

            return (
              <div
                key={stage.id}
                className={cn(
                  "flex items-center justify-between rounded-xl p-3 border text-xs transition-all",
                  isDone && "border-emerald-500/30 bg-emerald-500/5 text-slate-200",
                  isActive && "border-emerald-500/80 bg-slate-900 text-white font-semibold shadow-md",
                  !isDone && !isActive && "border-slate-800 bg-slate-950/40 text-slate-500 opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border",
                      isDone && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                      isActive && "bg-emerald-500 text-slate-950 border-transparent",
                      !isDone && !isActive && "bg-slate-900 text-slate-600 border-slate-800"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span>{stage.name}</span>
                </div>

                {isDone && <Badge variant="emerald" className="text-[10px]">Passed</Badge>}
                {isActive && <Badge variant="cyan" className="text-[10px] animate-pulse">Active</Badge>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
