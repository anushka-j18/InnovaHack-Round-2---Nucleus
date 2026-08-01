"use client";

import * as React from "react";
import { History, Clock, ArrowRight, Minimize2, Check, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  title: string;
  category: "code" | "log" | "prose";
  rawTokens: number;
  compTokens: number;
  ratio: number;
  accuracy: number;
  timestamp: string;
  text: string;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectRun: (item: HistoryItem) => void;
  onClearHistory?: () => void;
  className?: string;
}

export function HistoryPanel({
  history,
  onSelectRun,
  onClearHistory,
  className,
}: HistoryPanelProps) {
  return (
    <Card variant="glass" className={cn("w-full border-slate-800/80 bg-slate-900/60 p-0 overflow-hidden shadow-xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 p-5 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <History className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Compression History
              <Badge variant="secondary" className="text-[10px]">
                {history.length} Runs
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Recent compression benchmark runs and token savings logs.
            </p>
          </div>
        </div>

        {history.length > 0 && onClearHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="h-8 gap-1 px-2.5 text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No recent compression runs</p>
            <p className="text-xs text-slate-600 mt-1">
              Compressed context runs will be logged here automatically.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRun(item)}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 group-hover:border-emerald-500/50">
                  <Minimize2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 uppercase">
                      {item.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span>
                      {item.rawTokens.toLocaleString()} $\rightarrow$ {item.compTokens.toLocaleString()} tokens
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Badges & Load Arrow */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Badge variant="emerald" className="text-xs font-mono font-bold">
                  -{item.ratio}%
                </Badge>
                <Badge variant="cyan" className="text-xs font-mono">
                  {item.accuracy}% Acc
                </Badge>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
