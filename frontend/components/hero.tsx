"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Terminal, ShieldCheck, Cpu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Ambient background glow mesh */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Version Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/15">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>NUCLEUS AI CONTEXT COMPRESSION ENGINE v1.0</span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-slate-100 sm:text-6xl md:text-7xl leading-[1.15]">
            <span className="block bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Compress Context.
            </span>
            <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Preserve Intelligence.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg md:text-xl leading-relaxed">
            Ultra-low resource context compression engine. Reduce LLM API token costs and prompt latency by over <span className="font-semibold text-emerald-400">70%</span> while preserving <span className="font-semibold text-cyan-400">100% reasoning accuracy</span>.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {/* Primary CTA */}
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="glow"
                size="lg"
                className="w-full sm:w-auto gap-2.5 text-base font-semibold shadow-[0_0_25px_-5px_rgba(38,208,124,0.4)] group"
              >
                <Zap className="h-5 w-5 fill-slate-950 text-slate-950 transition-transform duration-200 group-hover:scale-110" />
                <span>Try Engine Live</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/docs" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto gap-2.5 border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Explore API Docs</span>
              </Button>
            </Link>
          </div>

          {/* Key Metrics / Value Propositions Cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 text-left backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">70%+</div>
                  <div className="text-xs text-slate-400">Token Reduction</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Stage-A/B/C semantic deduplication & adaptive filler stripping.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 text-left backdrop-blur-md transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">3.4x</div>
                  <div className="text-xs text-slate-400">Latency Speedup</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Faster downstream LLM response times and lower prefill overhead.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5 text-left backdrop-blur-md transition-all duration-300 hover:border-emerald-500/30 hover:bg-slate-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">100%</div>
                  <div className="text-xs text-slate-400">Reasoning Retained</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Signature floor protection prevents loss of crucial code or error details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
