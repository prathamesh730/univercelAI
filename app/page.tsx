'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { TaskInput } from '@/components/TaskInput';
import { PipelineStatus } from '@/components/PipelineStatus';
import { ResultSection } from '@/components/ResultSection';
import { AgentResult, StepInfo } from '@/lib/types';

const INITIAL_TASK =
  'Scrape the latest top 5 tech news headlines, synthesize executive takeaways, and write a summary email with prioritized action items.';

const DEFAULT_STEPS: StepInfo[] = [
  { id: 1, label: 'Step 01', sublabel: 'Understanding task', status: 'idle' },
  { id: 2, label: 'Step 02', sublabel: 'Using tools', status: 'idle', tools: ['WebSearch', 'Calculator', 'FileAnalysis'] },
  { id: 3, label: 'Step 03', sublabel: 'Processing', status: 'idle' },
];

export default function Home() {
  const [task, setTask] = useState<string>(INITIAL_TASK);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 = standby, 1 = step 1, 2 = step 2, 3 = step 3, 4 = completed
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Clear running timers and connections
  const clearRunningState = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleRunAgent = async (files?: string[]) => {
    if (!task.trim()) return;

    clearRunningState();
    setIsRunning(true);
    setCurrentStep(1);
    setElapsedSeconds(0);
    setActiveTools([]);
    setResult(null);

    // Live high-resolution elapsed timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);
    }, 100);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Connect to SSE stream endpoint
      const filesParam = files && files.length > 0 ? `&files=${encodeURIComponent(JSON.stringify(files))}` : '';
      const streamUrl = `/api/agent/stream?task=${encodeURIComponent(task)}${filesParam}`;
      const response = await fetch(streamUrl, {
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        // Fallback to direct backend if proxy is not reachable
        const fallbackUrl = `http://127.0.0.1:8000/api/agent/stream?task=${encodeURIComponent(task)}${filesParam}`;
        const fallbackResp = await fetch(fallbackUrl, {
          signal: abortController.signal,
        });

        if (!fallbackResp.ok || !fallbackResp.body) {
          throw new Error(`Failed to connect to agent backend (HTTP ${fallbackResp.status})`);
        }
        await processStream(fallbackResp.body, startTime);
        return;
      }

      await processStream(response.body, startTime);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      setCurrentStep(0);
      setResult({
        title: 'Execution Error',
        sources: 'System Diagnostics',
        summary: 'Agent encountered an error during task processing.',
        takeaways: [
          {
            title: 'Connection Notice',
            desc: err?.message || 'Unable to establish connection with Gemini Agent API.',
          },
        ],
        metrics: [],
        dispatchPayload: null,
        rawMarkdown: `### Error Encountered\n\n${err?.message || 'An unexpected error occurred during execution.'}`,
        executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
        tokensUsed: 0,
        logs: [`Error: ${err?.message || 'Connection failure'}`],
        error: err?.message || 'Agent error',
      });
    }
  };

  const processStream = async (body: ReadableStream<Uint8Array>, startTime: number) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.event === 'step') {
              setCurrentStep(data.step);
              if (data.activeTools && data.activeTools.length > 0) {
                setActiveTools(data.activeTools);
              }
            } else if (data.event === 'completed') {
              if (timerRef.current) clearInterval(timerRef.current);
              setCurrentStep(4);
              setIsRunning(false);
              setElapsedSeconds(data.elapsed || (Date.now() - startTime) / 1000);
              setResult(data.result);
              if (data.activeTools) {
                setActiveTools(data.activeTools);
              }
            } else if (data.event === 'error') {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsRunning(false);
              setCurrentStep(0);
              setResult({
                title: 'Execution Error',
                sources: 'System',
                summary: data.error || 'Agent encountered an issue.',
                takeaways: [{ title: 'Error Notice', desc: data.error || 'Execution halted.' }],
                metrics: [],
                dispatchPayload: null,
                rawMarkdown: `### Error Notice\n\n${data.error}`,
                executionTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
                tokensUsed: 0,
                logs: data.logs || [data.error],
                error: data.error,
              });
            }
          } catch (parseErr) {
            console.warn('SSE Parse warning:', parseErr);
          }
        }
      }
    }
  };

  const handleCancel = () => {
    clearRunningState();
    setIsRunning(false);
    setCurrentStep(0);
  };

  const handleReset = () => {
    clearRunningState();
    setIsRunning(false);
    setTask('');
    setCurrentStep(0);
    setElapsedSeconds(0);
    setActiveTools([]);
    setResult(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRunningState();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0B0F17]">
      {/* Navigation Header */}
      <Header onReset={handleReset} isRunning={isRunning} />

      {/* Main Viewport Canvas (Split Layout) */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 overflow-hidden min-h-0">
        {/* Left Column: Task Input & Pipeline Controls (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
<TaskInput
              task={task}
              setTask={setTask}
              isRunning={isRunning}
              onRun={(files) => handleRunAgent(files || undefined)}
              onCancel={handleCancel}
/>
          <PipelineStatus
            currentStep={currentStep}
            elapsedSeconds={elapsedSeconds}
            activeTools={activeTools}
            steps={DEFAULT_STEPS}
          />
        </section>

        {/* Right Column: Result Section (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
          <ResultSection
            result={result}
            isRunning={isRunning}
            currentStep={currentStep}
          />
        </section>
      </main>
    </div>
  );
}
