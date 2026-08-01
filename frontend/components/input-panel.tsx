"use client";

import * as React from "react";
import {
  Upload,
  FileText,
  Trash2,
  Zap,
  AlertCircle,
  Code,
  Terminal,
  FileCheck,
  Sparkles,
  FileUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_CHAR_LIMIT = 50000;

interface InputPanelProps {
  text: string;
  setText: (value: string) => void;
  onCompress: () => void;
  isLoading: boolean;
  error?: string | null;
  setError?: (err: string | null) => void;
}

export function InputPanel({
  text,
  setText,
  onCompress,
  isLoading,
  error,
  setError,
}: InputPanelProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Live metrics calculations
  const charCount = text.length;
  const estimatedTokens = Math.max(0, Math.ceil(charCount / 4));
  const isOverLimit = charCount > MAX_CHAR_LIMIT;
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.9 && !isOverLimit;
  const charPercentage = Math.min(100, (charCount / MAX_CHAR_LIMIT) * 100);

  // Content type auto-detection heuristic
  const detectedType = React.useMemo(() => {
    if (!text.trim()) return "Empty";
    const lines = text.split("\n");
    
    // Log detection
    const logPattern = /^(\[?\d{4}[-/]\d{2}|\[?\d{2}:\d{2}:\d{2}|\[?(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\]?)/i;
    const logCount = lines.filter((l) => logPattern.test(l.trim())).length;
    if (lines.length >= 2 && logCount / lines.length > 0.2) return "Log Context";

    // Code detection
    const codePattern = /^\s*(def |class |import |from |function |const |let |var |public |private |#include)/;
    const codeCount = lines.filter((l) => codePattern.test(l)).length;
    if (codeCount > 1) return "Source Code";

    return "Prose / Document";
  }, [text]);

  // File drop handler
  const handleFile = (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (setError) setError("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setText(content);
        if (setError) setError(null);
      }
    };
    reader.onerror = () => {
      if (setError) setError("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Sample data presets
  const loadSample = (type: "code" | "log" | "prose") => {
    if (setError) setError(null);
    if (type === "code") {
      setText(
        `# auth_service.py - User Authentication & Session Security\n` +
        `import os\nimport sys\nimport time\nimport logging\nfrom typing import Optional, Dict\nimport jwt\n\n` +
        `logger = logging.getLogger("auth_service")\n` +
        `SECRET_KEY = os.getenv("SECRET_KEY", "nucleus-secret-key-2026")\n` +
        `MAX_CONNECTION_POOL_SIZE = 50\n\n` +
        `def verify_user_credentials(username: str, password_hash: str) -> bool:\n` +
        `    # Verify input credentials against hash\n` +
        `    if not username or not password_hash:\n` +
        `        return False\n` +
        `    logger.info(f"Authenticating user {username} with pool size {MAX_CONNECTION_POOL_SIZE}")\n` +
        `    return True\n\n` +
        `def create_jwt_session(user_id: int) -> str:\n` +
        `    # Generate JWT session token\n` +
        `    payload = {"user_id": user_id, "exp": time.time() + 3600}\n` +
        `    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")\n`
      );
    } else if (type === "log") {
      setText(
        `2026-08-01 14:00:01.010 [INFO] nucleus.gateway: Starting HTTP Listener on port 8000\n` +
        `2026-08-01 14:00:01.012 [DEBUG] nucleus.cache: Redis cache hit for session_991823\n` +
        `2026-08-01 14:00:01.015 [DEBUG] nucleus.cache: Redis cache hit for session_991823\n` +
        `2026-08-01 14:02:22.420 [ERROR] nucleus.db: CRITICAL DATABASE FAILURE: ConnectionRefusedError: [Errno 111] Could not connect to PostgreSQL master at 10.0.4.12:5432\n` +
        `Traceback (most recent call last):\n  File '/app/db.py', line 45, in connect\n    raise ConnectionRefusedError('PostgreSQL master offline')\nConnectionRefusedError: PostgreSQL master offline\n` +
        `2026-08-01 14:02:23.001 [INFO] nucleus.worker: Heartbeat check ok. Active threads: 16.\n`
      );
    } else {
      setText(
        `Nucleus Context Compression Engine Technical Overview\n\n` +
        `The primary objective of the engine is to compress verbose prompts by removing semantic redundancy, ` +
        `unnecessary filler comments, repetitive log entries, and structural boilerplate without losing core reasoning.\n\n` +
        `Target compression ratio threshold is strictly set at >70% reduction across Code, Logs, and Prose content.\n` +
        `Key System Benchmark Parameter: MAX_CONCURRENT_WORKERS = 128, REDIS_CACHE_TTL = 3600 seconds, MASTER_KEY = 'NUCLEUS_PROD_2026'.\n`
      );
    }
  };

  return (
    <Card className="w-full border-slate-800 bg-slate-900/70 backdrop-blur-xl shadow-xl">
      {/* Header bar */}
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Context Input Prompt
              <Badge variant="emerald" className="text-[10px] py-0 px-2">
                {detectedType}
              </Badge>
            </CardTitle>
            <p className="text-xs text-slate-400">
              Paste raw prompt, codebase, or logs (max 50,000 characters).
            </p>
          </div>
        </div>

        {/* Action Controls & Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Sample Preset Selector */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-950/60 p-1 border border-slate-800/80 text-xs">
            <span className="text-[10px] text-slate-400 font-medium px-2">Samples:</span>
            <button
              onClick={() => loadSample("code")}
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            >
              Code
            </button>
            <button
              onClick={() => loadSample("log")}
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            >
              Log
            </button>
            <button
              onClick={() => loadSample("prose")}
              className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
            >
              Prose
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.py,.js,.ts,.tsx,.json,.log,.md,.csv,.sql,.java,.c,.cpp"
            className="hidden"
          />

          {/* Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 gap-1.5 border-slate-800 bg-slate-950/60 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <FileUp className="h-3.5 w-3.5 text-emerald-400" />
            <span>Upload File</span>
          </Button>

          {/* Clear Button */}
          {text.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setText("");
                if (setError) setError(null);
              }}
              className="h-8 gap-1 px-2 text-xs text-slate-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Main Textarea Dropzone */}
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative min-h-[280px] rounded-xl border transition-all duration-200",
            isDragging
              ? "border-emerald-500/80 bg-emerald-500/5 ring-4 ring-emerald-500/20"
              : isOverLimit
              ? "border-red-500/80 bg-red-500/5"
              : "border-slate-800/80 bg-slate-950/80 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30"
          )}
        >
          {/* Drag Overlay Notice */}
          {isDragging && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-slate-950/90 backdrop-blur-sm text-emerald-400">
              <Upload className="h-10 w-10 animate-bounce mb-2" />
              <p className="text-sm font-semibold">Drop context file to import</p>
              <p className="text-xs text-slate-400 mt-1">Supports .txt, .py, .js, .log, .json, .md</p>
            </div>
          )}

          {/* Large Textarea */}
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (setError) setError(null);
            }}
            placeholder="Paste your context text, source code, developer discussions, or server logs here..."
            className="w-full min-h-[280px] resize-y bg-transparent p-4 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none leading-relaxed"
            rows={12}
          />
        </div>

        {/* Validation Errors */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isOverLimit && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Character limit exceeded! Maximum allowed size is {MAX_CHAR_LIMIT.toLocaleString()} characters.</span>
          </div>
        )}

        {/* Footer Metrics & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
          {/* Counters & Progress Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 w-full sm:w-auto">
            {/* Character Count */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Length:</span>
              <span
                className={cn(
                  "font-mono font-semibold",
                  isOverLimit
                    ? "text-red-400"
                    : isNearLimit
                    ? "text-amber-400"
                    : "text-slate-200"
                )}
              >
                {charCount.toLocaleString()}
              </span>
              <span className="text-slate-500">/ {MAX_CHAR_LIMIT.toLocaleString()} chars</span>
            </div>

            {/* Token Estimate */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-4">
              <span className="text-slate-500">Est. Tokens:</span>
              <span className="font-mono font-semibold text-emerald-400">
                ~{estimatedTokens.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Submit Button */}
          <Button
            type="button"
            variant="glow"
            size="lg"
            disabled={isLoading || charCount === 0 || isOverLimit}
            onClick={onCompress}
            className="w-full sm:w-auto gap-2.5 font-semibold text-slate-950 shadow-[0_0_20px_-3px_rgba(38,208,124,0.4)] disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Zap className="h-4 w-4 animate-spin text-slate-950" />
                <span>Compressing Context...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
                <span>Compress Context</span>
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar Indicator */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/80">
          <div
            className={cn(
              "h-full transition-all duration-300",
              isOverLimit
                ? "bg-red-500"
                : isNearLimit
                ? "bg-amber-500"
                : "bg-gradient-to-r from-emerald-500 to-cyan-500"
            )}
            style={{ width: `${charPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
