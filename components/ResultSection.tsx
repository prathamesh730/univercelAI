'use client';

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  FileText,
  Table as TableIcon,
  Send,
  ArrowRight,
  Sparkles,
  Layers,
  Terminal,
  Clock,
  Zap,
} from 'lucide-react';
import { AgentResult } from '@/lib/types';

interface ResultSectionProps {
  result: AgentResult | null;
  isRunning: boolean;
  currentStep: number;
}

export function ResultSection({ result, isRunning, currentStep }: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<'structured' | 'markdown' | 'logs'>('structured');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    let textToCopy = '';
    if (viewMode === 'markdown') {
      textToCopy = result.rawMarkdown;
    } else if (viewMode === 'logs') {
      textToCopy = result.logs.join('\n');
    } else {
      textToCopy = `${result.title}\n\n${result.summary}\n\nKey Takeaways:\n${result.takeaways
        .map((t) => `- ${t.title}: ${t.desc}`)
        .join('\n')}`;
      if (result.dispatchPayload && Object.keys(result.dispatchPayload).length > 0) {
        textToCopy += `\n\nDispatch Payload:\n${JSON.stringify(result.dispatchPayload, null, 2)}`;
      }
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/40 rounded-xl flex flex-col flex-1 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden min-h-0">
      {/* Result Card Header */}
      <div className="px-4 py-3 border-b border-outline-variant/30 bg-surface-container-lowest/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Agent Result</span>
          </h2>

          {result && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-mono text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                Completed in {result.executionTime} • {result.tokensUsed} tokens
                {result.confidenceScore ? ` • Conf ${result.confidenceScore}` : ''}
              </span>
            </div>
          )}

          {isRunning && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-xs font-mono text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
              <span>Synthesizing live response...</span>
            </div>
          )}
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-1.5">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant/40">
            <button
              onClick={() => setViewMode('structured')}
              className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                viewMode === 'structured'
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Structured
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`px-2 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                viewMode === 'markdown'
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <FileText className="w-3 h-3" />
              Markdown
            </button>
            <button
              onClick={() => setViewMode('logs')}
              className={`px-2 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 ${
                viewMode === 'logs'
                  ? 'bg-primary/20 text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Terminal className="w-3 h-3" />
              Trace
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!result}
            className="px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface-variant hover:text-on-surface text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Content Canvas */}
      <div className="flex-1 p-4 overflow-y-auto text-xs text-on-surface space-y-4" id="result-canvas">
        {!result && !isRunning && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-outline-variant/30 rounded-lg bg-surface-container-lowest/40">
            <div className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-center mb-3 shadow-inner">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-on-surface mb-1">
              Agent Standby
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed mb-4">
              Enter a task description on the left or select a Quick Prompt, then click &quot;Run Agent&quot; to execute autonomous tools and receive structured results.
            </p>
          </div>
        )}

        {isRunning && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-surface-container border border-secondary/40 flex items-center justify-center animate-spin">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-semibold text-secondary">
                {currentStep === 1
                  ? 'Analyzing & Parsing Intent...'
                  : currentStep === 2
                  ? 'Invoking Tools & Sandboxed APIs...'
                  : 'Synthesizing Intelligence Brief...'}
              </div>
              <p className="text-xs text-on-surface-variant font-mono">
                Executing multi-agent verification graph...
              </p>
            </div>
          </div>
        )}

        {result && viewMode === 'structured' && (
          <div className="space-y-4">
            {/* Executive Synthesized Block */}
            <div className="bg-surface-container-lowest/70 border border-outline-variant/30 rounded-lg p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-secondary flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span>{result.title}</span>
                </h3>
                <span className="text-[11px] font-mono text-outline">
                  Sources: {result.sources}
                </span>
              </div>
              <p className="text-on-surface leading-relaxed mb-3 text-xs">
                {result.summary}
              </p>

              {/* Structured Takeaway Bullet Points */}
              <ul className="space-y-2 border-t border-outline-variant/20 pt-2.5 text-on-surface">
                {result.takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-primary font-semibold">{item.title}:</strong>{' '}
                      <span className="text-on-surface-variant">{item.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Structured Data Table (Only if metrics are available) */}
            {result.metrics && result.metrics.length > 0 && (
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden bg-surface-container-lowest/90">
                <div className="px-3 py-2 bg-surface-container border-b border-outline-variant/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface font-semibold flex items-center gap-1.5">
                    <TableIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Synthesized Metric Matrix</span>
                  </span>
                  <span className="text-outline text-[11px]">Live Extraction</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30 text-outline uppercase tracking-wider bg-surface-container-low/50">
                        <th className="py-2 px-3 font-semibold">Headline / Topic</th>
                        <th className="py-2 px-3 font-semibold">Impact</th>
                        <th className="py-2 px-3 font-semibold">Category</th>
                        <th className="py-2 px-3 text-right font-semibold">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-on-surface-variant">
                      {result.metrics.map((m, idx) => (
                        <tr key={idx} className="hover:bg-surface-container/50 transition-colors">
                          <td className="py-2 px-3 font-medium text-on-surface">{m.topic}</td>
                          <td className="py-2 px-3 text-secondary">{m.impact}</td>
                          <td className="py-2 px-3">{m.category}</td>
                          <td className="py-2 px-3 text-right font-semibold text-secondary">
                            {m.confidence}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Code Snippet / Generated Dispatch Payload (Only if payload exists) */}
            {result.dispatchPayload && Object.keys(result.dispatchPayload).length > 0 && (
              <div className="border border-outline-variant/30 rounded-lg overflow-hidden bg-[#070A0F]">
                <div className="px-3 py-1.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between text-outline text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <Send className="w-3.5 h-3.5 text-secondary" />
                    <span>Generated Dispatch Payload</span>
                  </span>
                  <span className="text-[11px] text-outline">dispatch_payload.json</span>
                </div>

                <pre className="p-3 font-mono text-[11px] text-primary leading-relaxed overflow-x-auto selection:bg-primary-container/40">
                  <code>{JSON.stringify(result.dispatchPayload, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}

        {result && result.error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs font-mono">
            <p className="font-semibold mb-1">Execution Notice</p>
            <p>{result.error}</p>
          </div>
        )}

        {result && viewMode === 'markdown' && (
          <div className="bg-[#070A0F] border border-outline-variant/30 rounded-lg p-4 font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
            {result.rawMarkdown}
          </div>
        )}

        {result && viewMode === 'logs' && (
          <div className="bg-[#070A0F] border border-outline-variant/30 rounded-lg p-3 space-y-1.5 font-mono text-xs">
            <div className="text-[11px] text-outline mb-2 border-b border-outline-variant/20 pb-1 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-secondary" />
              <span>Autonomous Execution Trace Log</span>
            </div>
            {result.logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 text-on-surface-variant">
                <span className="text-secondary font-mono">[{idx + 1}]</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
