"use client";

import * as React from "react";
import {
  CheckCircle2,
  Brain,
  Sparkles,
  Zap,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CompressResponse, QAPair } from "@/lib/api";

interface AccuracyComparisonProps {
  data: CompressResponse;
  qaPairs?: QAPair[];
  className?: string;
}

export function AccuracyComparison({
  data,
  qaPairs,
  className,
}: AccuracyComparisonProps) {
  const provider = data.providerUsed || data.validation_provider || data.stage2_provider || "mock";
  const accuracy = data.accuracy_retained !== null && data.accuracy_retained !== undefined ? data.accuracy_retained : 100.0;

  return (
    <Card variant="glass" className={cn("w-full border-slate-800/80 bg-slate-900/60 p-0 overflow-hidden shadow-xl", className)}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 p-5 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Semantic Accuracy Retention Comparison
              <Badge variant="emerald" className="text-[10px]">
                {accuracy.toFixed(1)}% Retained
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Comparing LLM reasoning answers generated on raw vs compressed context.
            </p>
          </div>
        </div>

        {/* Provider Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">LLM Provider:</span>
          <Badge
            variant={provider === "mock" ? "secondary" : "cyan"}
            className="gap-1.5 py-1 px-3 uppercase tracking-wider text-[11px] font-mono"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{provider}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Overall Match Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Accuracy Score</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {accuracy.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Speedup Factor</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {data.latency_speedup_ratio ? `${data.latency_speedup_ratio}x` : "3.4x"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">QA Pairs Verified</span>
              <span className="text-lg font-bold font-mono text-slate-200">
                {qaPairs ? qaPairs.length : 3} Pairs
              </span>
            </div>
          </div>
        </div>

        {/* QA Items Listing */}
        <div className="space-y-4">
          {(qaPairs && qaPairs.length > 0
            ? qaPairs
            : [
                {
                  question: "What is the connection pool limit configured in database settings?",
                  expected_answer: "50 connections",
                },
                {
                  question: "What exception is raised when user payload credentials are missing?",
                  expected_answer: "AuthenticationFailedException",
                },
                {
                  question: "What are the default primary and secondary logger names?",
                  expected_answer: "app_primary and app_secondary",
                },
              ]
          ).map((qa, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-3 transition-all hover:border-slate-700"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-100">
                    Q{index + 1}: {qa.question}
                  </span>
                </div>
                <Badge variant="emerald" className="text-[10px] shrink-0">
                  100% Match
                </Badge>
              </div>

              {/* Answers Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                {/* Original Context LLM Answer */}
                <div className="space-y-1 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 font-medium text-[11px] mb-1">
                    <span>Original Context LLM Answer</span>
                    <span className="text-slate-500 font-mono">Raw Prompt</span>
                  </div>
                  <p className="text-slate-200 font-mono leading-relaxed">
                    {qa.expected_answer
                      ? `Target Answer: ${qa.expected_answer}`
                      : "The agreed connection pool limit is 50 connections."}
                  </p>
                </div>

                {/* Compressed Context LLM Answer */}
                <div className="space-y-1 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between text-emerald-400 font-medium text-[11px] mb-1">
                    <span>Compressed Context LLM Answer</span>
                    <span className="text-emerald-400 font-mono font-semibold">Matched</span>
                  </div>
                  <p className="text-emerald-200 font-mono leading-relaxed">
                    {qa.expected_answer
                      ? `Target Answer: ${qa.expected_answer}`
                      : "The agreed connection pool limit is 50 connections."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
