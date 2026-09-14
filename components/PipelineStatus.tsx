'use client';

import React from 'react';
import { CheckCircle2, RotateCw, Sparkles, Clock, Layers, Search, Code2, Database, Send } from 'lucide-react';
import { StepInfo } from '@/lib/types';

interface PipelineStatusProps {
  currentStep: number; // 0 = idle, 1 = understanding, 2 = tools, 3 = processing, 4 = completed
  elapsedSeconds: number;
  activeTools: string[];
  steps: StepInfo[];
}

export function PipelineStatus({
  currentStep,
  elapsedSeconds,
  activeTools,
  steps,
}: PipelineStatusProps) {
  const getToolIcon = (toolName: string) => {
    switch (toolName.toLowerCase()) {
      case 'websearch':
      case 'search':
        return <Search className="w-2.5 h-2.5" />;
      case 'calculator':
      case 'math':
        return <Sparkles className="w-2.5 h-2.5" />;
      case 'fileanalysis':
      case 'docgenerator':
      case 'gitdiffparser':
        return <Send className="w-2.5 h-2.5" />;
      case 'codeinterpreter':
      case 'code2':
        return <Code2 className="w-2.5 h-2.5" />;
      case 'vectordb':
      case 'telemetrylogs':
      case 'systemdiagnostics':
        return <Database className="w-2.5 h-2.5" />;
      default:
        return <Layers className="w-2.5 h-2.5" />;
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 shrink-0 shadow-md">
      {/* Header with Live Timer */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-on-surface">
            Pipeline Sequence
          </span>
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              currentStep > 0 && currentStep < 4
                ? 'bg-secondary animate-ping'
                : currentStep === 4
                ? 'bg-emerald-400'
                : 'bg-outline'
            }`}
          />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-secondary bg-surface-container px-2.5 py-0.5 rounded border border-outline-variant/40">
          <Clock className="w-3 h-3 text-secondary/70" />
          <span>
            {currentStep === 0
              ? 'Standby'
              : `Elapsed ${elapsedSeconds.toFixed(1)}s`}
          </span>
        </div>
      </div>

      {/* 3 Step Sequence Flow Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Step 1: Understanding task */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden transition-all duration-300 ${
            currentStep === 1
              ? 'bg-surface-container-low border-secondary/50 shadow-[0_0_12px_rgba(123,208,255,0.15)]'
              : currentStep > 1
              ? 'bg-surface-container-low/70 border-outline-variant/60'
              : 'bg-surface-container-low/40 border-outline-variant/30 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                currentStep >= 1 ? 'text-secondary' : 'text-outline'
              }`}
            >
              Step 01
            </span>
            {currentStep > 1 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : currentStep === 1 ? (
              <RotateCw className="w-4 h-4 text-secondary animate-spin" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-outline-variant/40" />
            )}
          </div>
          <div className="text-xs font-medium text-on-surface leading-tight">
            Understanding task
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                currentStep > 1
                  ? 'bg-secondary w-full'
                  : currentStep === 1
                  ? 'bg-secondary w-2/3 animate-pulse'
                  : 'w-0'
              }`}
            />
          </div>
        </div>

        {/* Step 2: Using tools */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden transition-all duration-300 ${
            currentStep === 2
              ? 'bg-surface-container-low border-secondary/50 shadow-[0_0_12px_rgba(123,208,255,0.2)]'
              : currentStep > 2
              ? 'bg-surface-container-low/70 border-outline-variant/60'
              : 'bg-surface-container-low/40 border-outline-variant/30 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                currentStep >= 2 ? 'text-secondary' : 'text-outline'
              }`}
            >
              Step 02
            </span>
            {currentStep > 2 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : currentStep === 2 ? (
              <RotateCw className="w-4 h-4 text-secondary animate-spin" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-outline-variant/40" />
            )}
          </div>
          <div className="text-xs font-medium text-on-surface leading-tight">
            Using tools
          </div>
          <div className="flex items-center gap-1 flex-wrap mt-0.5 min-h-[20px]">
            {activeTools.slice(0, 2).map((tool, idx) => (
              <span
                key={idx}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all ${
                  currentStep === 2
                    ? 'bg-surface-container-high text-secondary border-secondary/40 animate-pulse'
                    : currentStep > 2
                    ? 'bg-surface-container text-primary border-primary/20'
                    : 'bg-surface-container-lowest text-outline border-outline-variant/30'
                }`}
              >
                {getToolIcon(tool)}
                <span>{tool}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Step 3: Processing */}
        <div
          className={`p-2.5 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden transition-all duration-300 ${
            currentStep === 3
              ? 'bg-surface-container-low border-primary/50 shadow-[0_0_12px_rgba(192,193,255,0.2)]'
              : currentStep >= 4
              ? 'bg-surface-container-low/70 border-outline-variant/60'
              : 'bg-surface-container-low/40 border-outline-variant/30 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                currentStep >= 3 ? 'text-primary' : 'text-outline'
              }`}
            >
              Step 03
            </span>
            {currentStep >= 4 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : currentStep === 3 ? (
              <Sparkles className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-outline-variant/40" />
            )}
          </div>
          <div className="text-xs font-medium text-on-surface leading-tight">
            Processing
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-0.5">
            <div
              className={`h-full transition-all duration-300 ${
                currentStep >= 4
                  ? 'bg-primary w-full'
                  : currentStep === 3
                  ? 'bg-primary w-3/4 animate-pulse'
                  : 'w-0'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
