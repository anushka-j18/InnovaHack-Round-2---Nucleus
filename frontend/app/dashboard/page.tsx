"use client";

import * as React from "react";
import { InputPanel } from "@/components/input-panel";
import { PipelineLoading } from "@/components/pipeline-loading";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { DiffViewer } from "@/components/diff-viewer";
import { AccuracyComparison } from "@/components/accuracy-comparison";
import { HistoryPanel, HistoryItem } from "@/components/history-panel";
import { EmptyState } from "@/components/empty-state";
import { compress, CompressResponse, ApiError } from "@/lib/api";

export default function DashboardPage() {
  const [text, setText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<CompressResponse | null>(null);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);

  // Execute Compression Pipeline
  const handleCompress = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStepIndex(0);

    // Simulated progress steps during backend call
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < 4 ? prev + 1 : prev));
    }, 400);

    try {
      const response = await compress({ text });
      clearInterval(stepInterval);
      setCurrentStepIndex(5);
      setResult(response);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: `run-${Date.now()}`,
        title: response.compressed_text.slice(0, 30).split("\n")[0] || "Context Compression",
        category: text.includes("def ") || text.includes("function") ? "code" : text.includes("INFO") ? "log" : "prose",
        rawTokens: response.raw_tokens,
        compTokens: response.compressed_tokens,
        ratio: response.compression_ratio,
        accuracy: response.accuracy_retained || 100.0,
        timestamp: "Just now",
        text,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]);
    } catch (err) {
      clearInterval(stepInterval);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during compression.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setText(item.text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Dashboard Page Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          Engine Dashboard & Playground
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Test live context compression, inspect multi-stage pipeline execution, and analyze token savings & LLM accuracy retention.
        </p>
      </div>

      {/* Main Input Panel */}
      <InputPanel
        text={text}
        setText={setText}
        onCompress={handleCompress}
        isLoading={isLoading}
        error={error}
        setError={setError}
      />

      {/* Loading Pipeline State */}
      {isLoading && (
        <PipelineLoading
          currentStepIndex={currentStepIndex}
          isCompressing={isLoading}
        />
      )}

      {/* Error State */}
      {error && !isLoading && (
        <EmptyState
          type="error"
          errorMessage={error}
          onRetry={handleCompress}
        />
      )}

      {/* First Run / No Results Empty State */}
      {!result && !isLoading && !error && (
        <EmptyState
          type="first-run"
          onLoadSample={(sampleType) => {
            if (sampleType === "code") {
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
                `    return True\n`
              );
            } else if (sampleType === "log") {
              setText(
                `2026-08-01 14:00:01.010 [INFO] nucleus.gateway: Starting HTTP Listener on port 8000\n` +
                `2026-08-01 14:02:22.420 [ERROR] nucleus.db: CRITICAL DATABASE FAILURE: ConnectionRefusedError: [Errno 111] Could not connect to PostgreSQL master at 10.0.4.12:5432\n`
              );
            } else {
              setText(
                `Nucleus Context Compression Engine Technical Overview\n\n` +
                `The primary objective of the engine is to compress verbose prompts by removing semantic redundancy.\n`
              );
            }
          }}
        />
      )}

      {/* Results View & Analytics Dashboard */}
      {result && !isLoading && (
        <div className="space-y-12 animate-fade-in">
          {/* 1. Metrics Cards Dashboard */}
          <MetricsDashboard data={result} />

          {/* 2. Visual Comparative Charts */}
          <AnalyticsCharts data={result} />

          {/* 3. Interactive Before-After Diff Viewer */}
          <DiffViewer
            originalText={text}
            compressedText={result.compressed_text}
          />

          {/* 4. Semantic Accuracy Reasoning Comparison Panel */}
          <AccuracyComparison data={result} />
        </div>
      )}

      {/* 5. History Panel */}
      <HistoryPanel
        history={history}
        onSelectRun={handleSelectHistory}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
