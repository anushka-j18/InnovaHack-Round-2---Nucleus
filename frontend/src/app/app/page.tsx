"use client";

import React, { useState } from 'react';
import TopNav from '@/components/TopNav';
import HeroInput from '@/components/HeroInput';
import ResultView from '@/components/ResultView';
import { compressContext, CompressionResult } from '@/lib/api';
import styles from './app.module.css';

export interface ChatTurn {
  originalText: string;
  result: CompressionResult;
}

export default function AppPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async (text: string, qaPairs: { question: string }[]) => {
    setIsLoading(true);
    setPendingUserText(text);
    setError(null);
    try {
      const [res] = await Promise.all([
        compressContext(text, qaPairs),
        new Promise(resolve => setTimeout(resolve, 11500))
      ]);
      setChatHistory(prev => [...prev, { originalText: text, result: res }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during compression.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setPendingUserText(null);
    }
  };

  const handleReset = () => {
    setChatHistory([]);
    setPendingUserText(null);
    setError(null);
  };

  const handleSelectHistory = (index: number) => {
    if (index >= 0 && index < chatHistory.length) {
      setChatHistory([chatHistory[index]]);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Global Backgrounds */}
      <div className="fixed inset-0 z-[-2] bg-[#030303]" />
      
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100px', maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)' }} />

      {/* Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none z-[-1]" />

      <TopNav onReset={handleReset} chatHistory={chatHistory} onSelectHistory={handleSelectHistory} />
      <main className={styles.mainContent}>
        {error && (
          <div className={styles.errorToast}>
            {error}
          </div>
        )}

        {chatHistory.length === 0 && !isLoading ? (
          <HeroInput onSubmit={handleCompress} isLoading={isLoading} />
        ) : (
          <ResultView 
            chatHistory={chatHistory} 
            onReset={handleReset} 
            onSubmit={handleCompress}
            isLoading={isLoading}
            pendingUserText={pendingUserText}
          />
        )}
      </main>
    </div>
  );
}
