import { AgentResult, QuickPrompt } from './types';

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'news-summary',
    title: 'Executive Tech News Brief',
    iconName: 'bolt',
    prompt:
      'Scrape the latest top 5 tech news headlines, synthesize executive takeaways, and write a summary email with prioritized action items.',
    suggestedTools: ['WebSearch', 'CodeInterpreter', 'APIDispatch'],
  },
  {
    id: 'comp-analysis',
    title: 'Competitive Analysis',
    iconName: 'analytics',
    prompt:
      'Perform automated competitive analysis across leading multi-agent frameworks with benchmark latency, token consumption, and enterprise adoption metrics.',
    suggestedTools: ['WebSearch', 'VectorDB', 'CodeInterpreter'],
  },
  {
    id: 'pipeline-diag',
    title: 'Data Pipeline Diagnostic',
    iconName: 'dataset',
    prompt:
      'Run telemetry diagnostics on ETL pipeline cluster, isolate memory leaks, identify slow query bottlenecks, and generate automated fix script.',
    suggestedTools: ['TelemetryLogs', 'CodeInterpreter', 'SystemDiagnostics'],
  },
  {
    id: 'release-notes',
    title: 'Draft Release Notes',
    iconName: 'description',
    prompt:
      'Draft production v2.4.0 release notes from git commit history and changelog diffs with security patch alerts and breaking change warnings.',
    suggestedTools: ['GitDiffParser', 'CodeInterpreter', 'DocGenerator'],
  },
];

export function generateAgentResult(taskText: string, executionDurationSec: number): AgentResult {
  const lower = taskText.toLowerCase();

  const formattedTime = `${executionDurationSec.toFixed(1)}s`;
  const tokens = Math.floor(380 + Math.random() * 120);

  if (lower.includes('competitive analysis') || lower.includes('multi-agent') || lower.includes('benchmark')) {
    return {
      title: 'Multi-Agent Frameworks Competitive Benchmark',
      sources: 'GitHub Trends, Benchmarks DB, arXiv AI Index, TechCrunch',
      summary:
        'Comprehensive comparative evaluation executed across 5 leading agentic orchestration architectures. Evaluated on tool-calling latency, error recovery resilience, and token efficiency under load.',
      takeaways: [
        {
          title: 'Tool-Calling Efficiency',
          desc: 'Recursive function-calling graph architectures achieved 3.2x faster task resolution compared to linear chain designs.',
        },
        {
          title: 'Context Window Optimization',
          desc: 'Quantized memory state retrieval decreased active prompt token overhead by 41% across long-horizon executions.',
        },
        {
          title: 'Enterprise Readiness',
          desc: 'Over 64% of production pilots require local sandboxed runtime environments for automated bash tool execution.',
        },
      ],
      metrics: [
        { topic: 'LangGraph / AutoGen / CrewAI', impact: 'High (Market Share)', category: 'Frameworks', confidence: '99.2%' },
        { topic: 'Sub-second Tool Router Latency', impact: 'Moderate (Speedup)', category: 'Runtime', confidence: '98.5%' },
        { topic: 'Autonomous Error Self-Correction', impact: 'High (Reliability)', category: 'Evaluation', confidence: '96.8%' },
        { topic: 'Token Cost per Completed Workflow', impact: 'High (-35% Cost)', category: 'Cost Model', confidence: '97.4%' },
      ],
      dispatchPayload: {
        target: 'product-strategy-guild@enterprise.ai',
        benchmark_run_id: `bench_${Date.now()}`,
        top_recommended_stack: 'LangGraph + DeepSeek/Claude Hybrid Router',
        status: 'READY_FOR_DISTRIBUTION',
        action_items: [
          'Migrate single-prompt endpoints to recursive graph executors',
          'Deploy localized VectorDB cache for tool calling schema',
        ],
        generated_at: new Date().toISOString(),
      },
      rawMarkdown: `# Multi-Agent Frameworks Competitive Benchmark\n\nComprehensive comparative evaluation executed across leading agentic architectures.\n\n### Key Takeaways\n- **Tool-Calling Efficiency**: Recursive function-calling graph architectures achieved 3.2x faster task resolution.\n- **Context Window Optimization**: Quantized memory state retrieval decreased active prompt token overhead by 41%.\n- **Enterprise Readiness**: Over 64% of production pilots require sandboxed runtime environments.\n\n### Metric Matrix\n| Topic | Impact | Category | Confidence |\n|---|---|---|---|\n| Frameworks Matrix | High | Frameworks | 99.2% |\n| Tool Router Latency | Moderate | Runtime | 98.5% |\n| Error Self-Correction | High | Evaluation | 96.8% |`,
      executionTime: formattedTime,
      tokensUsed: tokens,
      confidenceScore: '98.5%',
      logs: [
        'Initialized query parsing & multi-dimensional intent routing',
        'Scraped repository stars, release metrics, and benchmark leaderboards',
        'Computed token consumption distributions across 1,000 synthetic test runs',
        'Synthesized competitive matrix and drafted enterprise recommendations',
      ],
    };
  }

  if (lower.includes('telemetry') || lower.includes('etl') || lower.includes('diagnostic') || lower.includes('memory leak')) {
    return {
      title: 'ETL Cluster Telemetry & Diagnostic Report',
      sources: 'Grafana Telemetry, Datadog APM, Prometheus Node Exporter',
      summary:
        'Telemetry diagnostics isolated a critical heap allocation spike within the stream transformer worker node, accompanied by a connection pool lock during high-throughput batch ingress.',
      takeaways: [
        {
          title: 'Root Cause Identified',
          desc: 'Uncollected promise references in the JSON deserializer caused a 480MB/hour heap growth in worker pod #3.',
        },
        {
          title: 'Database Connection Starvation',
          desc: 'Connection pool exhausted due to unclosed prepared statements during transient network retries.',
        },
        {
          title: 'Automated Patch Validation',
          desc: 'Generated hotfix script with aggressive garbage collection hooks and pool connection timeouts.',
        },
      ],
      metrics: [
        { topic: 'Worker Pod #3 Heap Growth', impact: 'Critical (480MB/h)', category: 'Memory', confidence: '99.8%' },
        { topic: 'PostgreSQL Pool Lock Wait', impact: 'High (840ms Latency)', category: 'Database', confidence: '97.6%' },
        { topic: 'Throughput Drop (Ingest)', impact: 'Moderate (-22%)', category: 'Ingress', confidence: '98.1%' },
        { topic: 'Post-Patch Memory Recovery', impact: 'Resolved (Stable 180MB)', category: 'Verification', confidence: '99.4%' },
      ],
      dispatchPayload: {
        service_alert_id: `diag_${Date.now()}`,
        severity: 'SEV-2 MITIGATED',
        affected_pods: ['etl-worker-node-03', 'etl-ingest-stream-01'],
        fix_applied: 'patch_heap_collector_v2.sh',
        action_items: [
          'Apply patched node container definition to staging cluster',
          'Increase Postgres connection pool max_lifetime to 300s',
        ],
        generated_at: new Date().toISOString(),
      },
      rawMarkdown: `# ETL Cluster Telemetry & Diagnostic Report\n\nTelemetry diagnostics isolated a critical heap allocation spike within worker node pod #3.\n\n### Key Takeaways\n- **Root Cause**: Uncollected promise references caused 480MB/h heap leak.\n- **Database Impact**: Pool lock wait increased query p99 latency to 840ms.\n- **Remediation**: Hotfix script generated and validated.`,
      executionTime: formattedTime,
      tokensUsed: tokens,
      confidenceScore: '99.1%',
      logs: [
        'Fetched live metrics from Prometheus cluster endpoint',
        'Analyzed memory profile and generated heap allocation flamegraph',
        'Identified memory leak location at worker/deserializer.ts:142',
        'Constructed patch script and verified garbage collection stability',
      ],
    };
  }

  if (lower.includes('release notes') || lower.includes('changelog') || lower.includes('git')) {
    return {
      title: 'Production v2.4.0 Release Notes & Changelog',
      sources: 'GitHub Repository History, Jira Sprint 44, Snyk Security Scanner',
      summary:
        'Synthesized 48 commits, 6 pull requests, and 3 dependency vulnerability alerts across the production release milestone. Formatted for executive review and developer deployment documentation.',
      takeaways: [
        {
          title: 'Core Engine Upgrades',
          desc: 'Upgraded to streaming response protocol, decreasing first-chunk latency by 55% across all API clients.',
        },
        {
          title: 'Security Vulnerability Patches',
          desc: 'Patched CVE-2025-1823 in upstream HTTP client dependency; upgraded Axios to secure version.',
        },
        {
          title: 'Breaking Changes Flagged',
          desc: 'Deprecated legacy v1 auth tokens; all active integrations require bearer header migration.',
        },
      ],
      metrics: [
        { topic: 'Merged PRs & Commits', impact: '48 Commits / 6 PRs', category: 'Changelog', confidence: '100%' },
        { topic: 'First-Chunk TTFB Latency', impact: 'High (-55% Latency)', category: 'Performance', confidence: '99.0%' },
        { topic: 'Vulnerabilities Patched', impact: '1 Critical / 2 Low', category: 'Security', confidence: '100%' },
        { topic: 'Test Suite Coverage', impact: '94.2% Passing', category: 'Quality', confidence: '98.7%' },
      ],
      dispatchPayload: {
        version: 'v2.4.0-prod',
        release_tag: `rel_${Date.now()}`,
        status: 'READY_FOR_DEPLOYMENT',
        approvers: ['engineering-lead', 'security-ops'],
        action_items: [
          'Publish GitHub release tag and signed binaries',
          'Broadcast deprecation notice for v1 authentication endpoints',
        ],
        generated_at: new Date().toISOString(),
      },
      rawMarkdown: `# Production v2.4.0 Release Notes\n\nRelease notes compiled from 48 commits and security audit reports.\n\n### Highlights\n- **Engine**: Streaming response protocol reduces TTFB by 55%.\n- **Security**: Upstream CVE-2025-1823 resolved.\n- **Breaking**: Legacy auth tokens deprecated.`,
      executionTime: formattedTime,
      tokensUsed: tokens,
      confidenceScore: '99.4%',
      logs: [
        'Inspected commit tree and resolved semantic changelog tags',
        'Correlated PR diffs with issue tracker milestones',
        'Scanned dependency manifest for known security vulnerabilities',
        'Generated markdown release bundle and deployment payload',
      ],
    };
  }

  // Default / Universal prompt synthesis:
  const taskWords = taskText.slice(0, 50).trim();
  return {
    title: `Executive Intelligence Brief: ${taskWords}...`,
    sources: 'TechCrunch, Reuters Tech, arXiv AI, Internal Knowledge Index',
    summary:
      `Synthesized real-time telemetry and domain data for: "${taskText}". Multi-agent orchestration frameworks and specialized automated tooling processed the request with high fidelity and zero validation errors.`,
    takeaways: [
      {
        title: 'Agentic Pipeline Execution',
        desc: 'Autonomous multi-step execution successfully completed intent parsing, tool routing, and synthesized data formatting.',
      },
      {
        title: 'High-Precision Tool Orchestration',
        desc: 'Interleaved execution of WebSearch, CodeInterpreter, and structured JSON generation yielded verified domain outputs.',
      },
      {
        title: 'Actionable Dispatch Payload',
        desc: 'Generated structured payload ready for API integration, database storage, or automated downstream triggering.',
      },
    ],
    metrics: [
      { topic: 'Intent & Entity Extraction', impact: 'High (Exact Match)', category: 'NLP', confidence: '99.4%' },
      { topic: 'Zero-shot Tool Use Benchmark', impact: 'Moderate (Optimal Path)', category: 'Execution', confidence: '98.2%' },
      { topic: 'Synthesized Data Accuracy', impact: 'High (Verified)', category: 'Synthesis', confidence: '98.9%' },
      { topic: 'Downstream Payload Formatting', impact: 'High (Valid JSON)', category: 'Integration', confidence: '99.7%' },
    ],
    dispatchPayload: {
      recipient: 'executive-team@company.ai',
      subject: `⚡ Agent Execution Summary: ${taskWords.slice(0, 30)}`,
      task_query: taskText,
      action_items: [
        'Distribute synthesized intelligence brief to stakeholders',
        'Trigger downstream automated tool pipeline execution',
      ],
      generated_at: new Date().toISOString(),
      agent_status: 'READY_FOR_DEPLOYMENT',
    },
    rawMarkdown: `# Executive Intelligence Brief: ${taskWords}...\n\nSynthesized live telemetry and verified data sources.\n\n### Key Takeaways\n- **Agentic Pipeline Execution**: Autonomous multi-step execution completed successfully.\n- **Precision Tool Orchestration**: Multi-tool calling graph resolved with 99% accuracy.\n- **Actionable Payload**: Formatted JSON dispatch package generated.\n\n### Metric Matrix\n| Topic | Impact | Category | Confidence |\n|---|---|---|---|\n| Intent Extraction | High | NLP | 99.4% |\n| Tool Use Routing | Moderate | Execution | 98.2% |\n| Data Accuracy | High | Synthesis | 98.9% |`,
    executionTime: formattedTime,
    tokensUsed: tokens,
    confidenceScore: '98.7%',
    logs: [
      `Parsed user task: "${taskText.slice(0, 60)}..."`,
      'Mapped intent to optimal tool sequence (Search -> Code -> Schema)',
      'Executed tool queries with sandbox safety validation',
      'Synthesized final response and generated structured dispatch package',
    ],
  };
}
