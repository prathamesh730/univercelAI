'use client';

import React from 'react';
import { Sparkles, Cpu, Activity, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  isRunning?: boolean;
}

export function Header({ onReset, isRunning }: HeaderProps) {
  return (
    <header className="w-full h-16 border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-3.5">
        {/* Neural Sparkle Icon & Brand Anchor */}
        <div className="w-9 h-9 rounded-lg bg-surface-container border border-outline-variant/50 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.25)] relative group">
          <Cpu className="w-5 h-5 text-secondary transition-transform group-hover:scale-110 duration-200" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#7bd0ff]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg tracking-tight text-on-surface font-bold">
              AI Agent
            </h1>
            <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <Sparkles className="w-2.5 h-2.5" />
              Autonomous Core
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-none mt-0.5">
            Give the agent a task, observe autonomous tool execution, and receive synthesized results
          </p>
        </div>
      </div>

      {/* Status Chips & Actions */}
      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            disabled={isRunning}
            title="Reset to default task"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-on-surface-variant hover:text-on-surface bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${
                isRunning ? 'bg-amber-400 animate-ping' : 'bg-secondary agent-pulse'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isRunning ? 'bg-amber-400' : 'bg-secondary'
              }`}
            />
          </span>
          <span className="text-xs font-mono text-on-surface font-medium tracking-wide">
            {isRunning ? 'Executing Task...' : 'Agent v2.4 • Online'}
          </span>
        </div>
      </div>
    </header>
  );
}
