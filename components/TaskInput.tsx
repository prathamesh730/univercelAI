'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Zap, Bot, StopCircle, ArrowRight, Sparkles, Layers, FileText, BarChart3, Upload } from 'lucide-react';
import { QUICK_PROMPTS } from '@/lib/agent-engine';

interface TaskInputProps {
  task: string;
  setTask: (task: string) => void;
  isRunning: boolean;
  onRun: (files?: string[]) => void;
  onCancel: () => void;
}

export function TaskInput({ task, setTask, isRunning, onRun, onCancel }: TaskInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Keyboard shortcut listener: Ctrl+Enter / Cmd+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning && task.trim()) {
          onRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, task, onRun]);

  const getQuickIcon = (iconName: string) => {
    switch (iconName) {
      case 'bolt':
        return <Zap className="w-3.5 h-3.5 text-secondary" />;
      case 'analytics':
        return <BarChart3 className="w-3.5 h-3.5 text-secondary" />;
      case 'dataset':
        return <Layers className="w-3.5 h-3.5 text-secondary" />;
      case 'description':
        return <FileText className="w-3.5 h-3.5 text-secondary" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-secondary" />;
    }
  };

  return (
    <div className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/40 rounded-xl p-4 flex flex-col flex-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative min-h-0">
      {/* Header of Task Input */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <label htmlFor="task-input" className="text-xs font-mono text-primary font-semibold flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-secondary" />
          <span>Task Description</span>
        </label>
        <span className="text-[11px] font-mono text-outline">
          Markdown &amp; natural language
        </span>
      </div>

      {/* Textarea Input */}
      <div className="relative flex-1 min-h-[140px] flex flex-col">
        <textarea
          id="task-input"
          ref={textareaRef}
          value={task}
          onChange={(e) => setTask(e.target.value)}
          disabled={isRunning}
          placeholder="e.g. Scrape the latest top 5 tech news headlines, synthesize executive takeaways, and write a summary email with prioritized action items..."
          className="w-full flex-1 bg-surface-container-lowest border border-outline-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary/40 rounded-lg p-3 text-on-surface text-sm font-sans resize-none transition-all placeholder:text-outline/60 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed leading-relaxed"
        />
      </div>

      {/* File Upload Section */}
      {uploadedFiles.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {uploadedFiles.map((filePath, index) => (
            <span
              key={index}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container/50 text-[10px] text-on-surface font-mono"
            >
              <FileText className="w-2.5 h-2.5 text-secondary" />
              <span>{filePath}</span>
              <button
                onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                className="text-[10px] text-secondary hover:text-primary transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-2">
        <label htmlFor="file-upload" className="cursor-pointer select-none flex items-center gap-2">
          <input type="file"
            id="file-upload"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = Array.from(e.target.files || []);
              const uploadPromises = files.map((file) => {
                const formData = new FormData();
                formData.append('file', file);
                return fetch('/api/agent/upload', {
                  method: 'POST',
                  body: formData,
                }).then((res) => res.json());
              });
              Promise.all(uploadPromises).then((results) => {
                const newFilePaths = results.map((r: any) => r.server_path || '');
                setUploadedFiles((prev) => [...prev, ...newFilePaths]);
              });
            }}
          />
          <span>
            {uploadedFiles.length > 0 ? (
              `${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''} uploaded`
            ) : (
              <Upload className="w-3.5 h-3.5 text-secondary" />
            )}
          </span>
        </label>
      </div>

      {/* Quick Prompts Presets */}
      <div className="mt-3 shrink-0">
        <div className="text-[11px] font-mono uppercase tracking-wider text-outline mb-1.5 font-medium flex items-center gap-1">
          <span>Quick Prompts</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTask(item.prompt)}
              disabled={isRunning}
              className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 hover:border-secondary/50 text-on-surface-variant hover:text-on-surface text-xs font-mono transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none group"
            >
              {getQuickIcon(item.iconName)}
              <span className="group-hover:text-secondary transition-colors">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-outline text-xs font-mono">
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-[10px] text-on-surface font-mono">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-[10px] text-on-surface font-mono">
            Enter
          </kbd>
        </div>

        {isRunning ? (
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-600 text-white text-xs font-mono font-semibold tracking-wide shadow-[0_0_16px_rgba(239,68,68,0.4)] active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <StopCircle className="w-4 h-4" />
            <span>Stop Agent</span>
          </button>
        ) : (
          <button
            onClick={() => onRun(uploadedFiles)}
            disabled={!task.trim() && uploadedFiles.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-inverse-primary hover:bg-[#3d3fcf] disabled:bg-surface-container-high disabled:text-outline disabled:cursor-not-allowed text-white text-xs font-mono font-semibold tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] transition-all duration-150 cursor-pointer group"
          >
            <Bot className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Run Agent</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
