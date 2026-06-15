'use client';

const AGENTS = [
  { name: 'Document Processor', framework: 'LangChain', key: 'document_processor' },
  { name: 'Financial Analyst', framework: 'CrewAI', key: 'financial_analyst' },
  { name: 'Risk Detective', framework: 'LangGraph', key: 'risk_detective' },
  { name: 'Strategic Insights', framework: 'OpenAI SDK', key: 'strategic_insights' },
  { name: 'Report Generator', framework: 'Pydantic AI', key: 'report_generator' },
  { name: 'Q&A Agent', framework: 'RAG+RAGAS', key: 'qa_agent' },
];

interface AgentPipelineProps {
  currentAgent?: string | null;
  compact?: boolean;
}

export default function AgentPipeline({ currentAgent, compact }: AgentPipelineProps) {
  return (
    <div className={compact ? 'py-4' : 'py-6'}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {AGENTS.map((agent, i) => {
          const active = currentAgent === agent.key;
          return (
            <div key={agent.key} className="flex items-center gap-2">
              <div
                className={`rounded-xl border px-3 py-2 text-center backdrop-blur-md transition-all md:px-4 ${
                  active
                    ? 'animate-pulse border-cyan-400/50 bg-cyan-400/10 shadow-lg shadow-cyan-500/20'
                    : 'border-white/10 bg-white/[0.05]'
                } ${compact ? 'min-w-[100px]' : 'min-w-[130px]'}`}
              >
                <p className={`font-medium text-white ${compact ? 'text-xs' : 'text-sm'}`}>{agent.name}</p>
                <p className="text-xs text-cyan-300/80">{agent.framework}</p>
              </div>
              {i < AGENTS.length - 1 && (
                <span className="hidden text-cyan-400/60 md:inline">{i === 1 ? '+' : '-'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
