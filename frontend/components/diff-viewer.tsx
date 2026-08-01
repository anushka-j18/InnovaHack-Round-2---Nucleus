"use client";

import * as React from "react";
import {
  Split,
  Copy,
  Check,
  Eye,
  FileText,
  Minimize2,
  Filter,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  originalText: string;
  compressedText: string;
  className?: string;
}

export function DiffViewer({
  originalText,
  compressedText,
  className,
}: DiffViewerProps) {
  const [copiedOriginal, setCopiedOriginal] = React.useState(false);
  const [copiedCompressed, setCopiedCompressed] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"split" | "unified">("split");
  const [filterMode, setFilterMode] = React.useState<"all" | "kept" | "removed">("all");

  const rawLines = React.useMemo(() => originalText.split("\n"), [originalText]);
  const compLines = React.useMemo(() => compressedText.split("\n"), [compressedText]);
  const compSet = React.useMemo(() => new Set(compLines.map((l) => l.trim())), [compLines]);

  const copyToClipboard = (text: string, isOriginal: boolean) => {
    navigator.clipboard.writeText(text);
    if (isOriginal) {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedCompressed(true);
      setTimeout(() => setCopiedCompressed(false), 2000);
    }
  };

  // Compute diff line statuses for unified view
  const diffLines = React.useMemo(() => {
    return rawLines.map((line, index) => {
      const trimmed = line.trim();
      const isKept = compSet.has(trimmed) || trimmed === "";
      return {
        lineNum: index + 1,
        content: line,
        status: isKept ? ("kept" as const) : ("removed" as const),
      };
    });
  }, [rawLines, compSet]);

  const filteredDiffLines = React.useMemo(() => {
    if (filterMode === "kept") return diffLines.filter((l) => l.status === "kept");
    if (filterMode === "removed") return diffLines.filter((l) => l.status === "removed");
    return diffLines;
  }, [diffLines, filterMode]);

  return (
    <Card variant="glass" className={cn("w-full border-slate-800/80 bg-slate-900/60 p-0 overflow-hidden shadow-2xl", className)}>
      {/* Header Controls */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 p-5 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Split className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Before & After Context Diff Viewer
              <Badge variant="emerald" className="text-[10px]">
                Interactive Diff
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Visual line comparison: <span className="text-emerald-400 font-medium">Green</span> = Retained signature lines | <span className="text-red-400 font-medium">Red</span> = Stripped filler lines.
            </p>
          </div>
        </div>

        {/* Controls: View Mode & Line Filter Toggle */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-950/80 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode("split")}
              className={cn(
                "rounded px-2.5 py-1 transition-all duration-200",
                viewMode === "split"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={cn(
                "rounded px-2.5 py-1 transition-all duration-200",
                viewMode === "unified"
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              Unified Diff
            </button>
          </div>

          {/* Filter Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-950/80 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={cn(
                "rounded px-2 py-1 transition-colors",
                filterMode === "all" ? "bg-slate-800 text-slate-100 font-medium" : "text-slate-400"
              )}
            >
              All Lines
            </button>
            <button
              onClick={() => setFilterMode("kept")}
              className={cn(
                "rounded px-2 py-1 transition-colors",
                filterMode === "kept" ? "bg-emerald-500/20 text-emerald-300 font-medium" : "text-slate-400"
              )}
            >
              Kept ({diffLines.filter((l) => l.status === "kept").length})
            </button>
            <button
              onClick={() => setFilterMode("removed")}
              className={cn(
                "rounded px-2 py-1 transition-colors",
                filterMode === "removed" ? "bg-red-500/20 text-red-300 font-medium" : "text-slate-400"
              )}
            >
              Removed ({diffLines.filter((l) => l.status === "removed").length})
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Main Diff Display Body */}
      <CardContent className="p-0">
        {viewMode === "split" ? (
          /* Side-by-Side View */
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* Left Panel: Original Context */}
            <div className="flex flex-col h-[400px]">
              <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Original Context ({rawLines.length} lines)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(originalText, true)}
                  className="h-7 px-2 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedOriginal ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Original
                    </>
                  )}
                </Button>
              </div>

              {/* Scrollable Text Area */}
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950/60 select-text">
                {rawLines.map((line, idx) => {
                  const isKept = compSet.has(line.trim()) || line.trim() === "";
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-start px-2 py-0.5 rounded transition-colors",
                        isKept
                          ? "bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500/60"
                          : "bg-red-500/10 text-red-300/80 border-l-2 border-red-500/40 line-through opacity-75"
                      )}
                    >
                      <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-3 font-sans">
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Compressed Context */}
            <div className="flex flex-col h-[400px]">
              <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Minimize2 className="h-3.5 w-3.5 text-emerald-400" />
                  Compressed Output ({compLines.length} lines)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(compressedText, false)}
                  className="h-7 px-2 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedCompressed ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Compressed
                    </>
                  )}
                </Button>
              </div>

              {/* Scrollable Text Area */}
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950/80 select-text">
                {compLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-start px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500/60 mb-0.5"
                  >
                    <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-3 font-sans">
                      {idx + 1}
                    </span>
                    <span className="whitespace-pre-wrap break-all">{line || " "}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Diff View */
          <div className="h-[450px] overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950/80 select-text">
            {filteredDiffLines.map((line, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start px-3 py-1 rounded mb-0.5 transition-colors",
                  line.status === "kept"
                    ? "bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500/80"
                    : "bg-red-500/15 text-red-300 border-l-2 border-red-500/80 opacity-80"
                )}
              >
                <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-3 font-sans">
                  {line.lineNum}
                </span>
                <span className="w-6 shrink-0 font-bold select-none">
                  {line.status === "kept" ? "+" : "-"}
                </span>
                <span className={cn("whitespace-pre-wrap break-all", line.status === "removed" && "line-through")}>
                  {line.content || " "}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
