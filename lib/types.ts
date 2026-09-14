export type PipelineStepStatus = 'idle' | 'running' | 'completed' | 'error';

export interface StepInfo {
  id: number;
  label: string;
  sublabel: string;
  status: PipelineStepStatus;
  tools?: string[];
  progressPercent?: number;
}

export interface MetricItem {
  topic: string;
  impact: string;
  category: string;
  confidence: string;
}

export interface AgentResult {
  title: string;
  sources: string;
  summary: string;
  takeaways: { title: string; desc: string }[];
  metrics?: MetricItem[] | null;
  dispatchPayload?: Record<string, any> | null;
  rawMarkdown: string;
  executionTime: string;
  tokensUsed: number;
  confidenceScore?: string;
  logs: string[];
  activeTools?: string[];
  error?: string;
}

export interface QuickPrompt {
  id: string;
  title: string;
  iconName: string;
  prompt: string;
  suggestedTools: string[];
}
