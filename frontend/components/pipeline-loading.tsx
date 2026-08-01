"use client";

import * as React from "react";
import {
  BrainCircuit,
  Layers,
  Filter,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Loader2,
  ArrowDown,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "analysis",
    name: "Semantic Analysis",
    description: "Detecting content type & parsing structural boundaries",
    icon: BrainCircuit,
  },
  {
    id: "deduplication",
    name: "Deduplication",
    description: "Vector embedding & cosine redundancy removal",
    icon: Layers,
  },
  {
    id: "scoring",
    name: "Scoring",
    description: "TF-IDF line scoring with signature floor protection",
    icon: Filter,
  },
  {
    id: "compression",
    name: "Compression",
    description: "Adaptive filler stripping & token reduction calculation",
    icon: Minimize2,
  },
  {
    id: "validation",
    name: "Validation",
    description: "Multi-provider LLM QA accuracy retention check",
    icon: CheckCircle2,
  },
  {
    id: "complete",
    name: "Complete",
    description: "Pipeline verified! Context ready for downstream LLMs",
    icon: Sparkles,
  },
];

interface PipelineLoadingProps {
  currentStepIndex: number; // 0 to 5
  isCompressing: boolean;
  className?: string;
}

export function PipelineLoading({
  currentStepIndex,
  isCompressing,
  className,
}: PipelineLoadingProps) {
  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100)
  );

  return (
    <Card
      variant="glass"
      className={cn("w-full border-slate-800/80 bg-slate-900/80 backdrop-blur-xl shadow-2xl", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Compression Pipeline Progress
              {isCompressing && (
                <Badge variant="emerald" className="gap-1 animate-pulse py-0.5 text-[10px]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Processing</span>
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-slate-400">
              Live multi-stage engine execution pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
          <span>{progressPercent}%</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Progress Bar */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-500 ease-out shadow-[0_0_12px_#26d07c]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Pipeline Steps */}
        <div className="mt-6 space-y-3">
          {PIPELINE_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isDone = index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl p-3.5 border transition-all duration-300",
                    isDone &&
                      "border-emerald-500/30 bg-emerald-500/5 text-slate-200",
                    isActive &&
                      "border-emerald-500/80 bg-slate-900 shadow-[0_0_20px_-3px_rgba(38,208,124,0.25)] text-white scale-[1.01]",
                    isPending &&
                      "border-slate-800/60 bg-slate-950/40 text-slate-500 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon Badge */}
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
                        isDone &&
                          "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                        isActive &&
                          "bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 border-transparent shadow-[0_0_15px_rgba(38,208,124,0.5)]",
                        isPending &&
                          "bg-slate-900 border-slate-800 text-slate-600"
                      )}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin stroke-[2.5]" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step Title & Description */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold tracking-tight",
                            isActive ? "text-emerald-400" : isDone ? "text-slate-100" : "text-slate-500"
                          )}
                        >
                          {step.name}
                        </span>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {step.description}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isDone && (
                      <Badge variant="emerald" className="text-[10px] gap-1 py-0.5">
                        <Check className="h-3 w-3" />
                        <span>Passed</span>
                      </Badge>
                    )}
                    {isActive && (
                      <Badge variant="cyan" className="text-[10px] animate-pulse py-0.5">
                        Active
                      </Badge>
                    )}
                    {isPending && (
                      <span className="text-[10px] font-mono text-slate-600 uppercase">
                        Queued
                      </span>
                    )}
                  </div>
                </div>

                {/* Down Arrow Divider */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown
                      className={cn(
                        "h-3.5 w-3.5 transition-colors duration-300",
                        index < currentStepIndex
                          ? "text-emerald-500/60"
                          : index === currentStepIndex
                          ? "text-cyan-400 animate-bounce"
                          : "text-slate-800"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
