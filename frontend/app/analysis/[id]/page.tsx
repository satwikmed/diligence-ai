'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AgentPipeline from '@/components/AgentPipeline';
import CompanyOverviewCard from '@/components/CompanyOverview';
import ExecutiveSummary from '@/components/ExecutiveSummary';
import FinancialCharts from '@/components/FinancialCharts';
import InsightsPanel from '@/components/InsightsPanel';
import ProgressTracker from '@/components/ProgressTracker';
import QAChat from '@/components/QAChat';
import RecommendationsList from '@/components/RecommendationsList';
import RedFlags from '@/components/RedFlags';
import RiskMatrix from '@/components/RiskMatrix';
import PageShell from '@/components/ui/page-shell';
import SectionHeading from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { getAnalysis, getAnalysisStatus, getSuggestedQuestions } from '@/lib/api';
import { getDemoAnalysis } from '@/lib/demo-data';
import { WebSocketManager } from '@/lib/websocket';

type LoadState = 'loading' | 'processing' | 'complete' | 'error';

export default function AnalysisPage() {
  const params = useParams();
  const documentId = params.id as string;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<{ message?: string; agent?: string }>>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [metadata, setMetadata] = useState<Record<string, unknown>>({});
  const [suggested, setSuggested] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [companyName, setCompanyName] = useState('Due Diligence Report');

  useEffect(() => {
    let cancelled = false;
    let poll: ReturnType<typeof setInterval> | null = null;
    let ws: WebSocketManager | null = null;

    const applyAnalysis = async (analysis: Awaited<ReturnType<typeof getAnalysis>>) => {
      if (!analysis.report) return false;
      setReport(analysis.report);
      setMetadata(analysis.metadata || {});
      setProgress(100);
      const overview = analysis.report.company_overview as Record<string, string> | undefined;
      if (overview?.name) setCompanyName(overview.name);
      const sq = await getSuggestedQuestions(documentId);
      if (!cancelled) setSuggested(sq.questions || []);
      setLoadState('complete');
      return true;
    };

    const startLiveTracking = () => {
      ws = new WebSocketManager(documentId);
      ws.connect();
      ws.onMessage((data) => {
        if (data.message) setEvents((prev) => [...prev, { message: String(data.message), agent: data.agent as string }]);
        if (data.agent) setCurrentAgent(String(data.agent));
        if (data.progress) setProgress(Number(data.progress));
        if (data.type === 'complete') setProgress(100);
      });

      poll = setInterval(async () => {
        try {
          const s = await getAnalysisStatus(documentId);
          if (cancelled) return;
          setProgress(s.progress_percentage);
          setCurrentAgent(s.current_agent);
          setEstimatedTime(s.estimated_time_remaining);

          if (s.status === 'complete') {
            const analysis = await getAnalysis(documentId);
            if (cancelled) return;
            await applyAnalysis(analysis);
            if (poll) clearInterval(poll);
          }
        } catch {
          /* keep polling */
        }
      }, 2000);
    };

    async function init() {
      try {
        const demo = getDemoAnalysis(documentId);
        if (demo?.report) {
          if (!cancelled) await applyAnalysis(demo);
          return;
        }

        const analysis = await getAnalysis(documentId);
        if (cancelled) return;

        if (analysis.status === 'complete' && analysis.report) {
          await applyAnalysis(analysis);
          return;
        }

        setLoadState('processing');
        startLiveTracking();
      } catch {
        if (!cancelled) {
          setLoadState('error');
          setErrorMsg('Could not load this analysis. Please try again.');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      ws?.disconnect();
    };
  }, [documentId]);

  if (loadState === 'loading') {
    return (
      <PageShell title="Loading Report" subtitle="Fetching analysis...">
        <div className="glass-card p-10 text-center text-white/60">Loading...</div>
      </PageShell>
    );
  }

  if (loadState === 'error') {
    return (
      <PageShell title="Analysis Unavailable" subtitle={errorMsg}>
        <div className="glass-card space-y-4 p-8 text-center">
          <p className="text-white/70">{errorMsg}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </PageShell>
    );
  }

  if (loadState === 'processing' || !report) {
    return (
      <PageShell
        eyebrow="Live Analysis"
        line1="Running"
        line2="Agent"
        line3="Pipeline"
        title="Analysis in progress"
        subtitle="Six AI agents are processing this 10-K."
      >
        <div className="space-y-8">
          <AgentPipeline currentAgent={currentAgent} compact />
          <ProgressTracker events={events} progress={progress} estimatedTime={estimatedTime} />
        </div>
      </PageShell>
    );
  }

  const nameParts = companyName.split(' ');
  const line1 = nameParts[0] || companyName;
  const line2 = nameParts.slice(1, -1).join(' ') || nameParts[1] || '';
  const line3 = nameParts.length > 2 ? nameParts[nameParts.length - 1] : undefined;

  return (
    <PageShell
      eyebrow="Due Diligence Report"
      line1={line1}
      line2={line2 || undefined}
      line3={line3}
      title={companyName}
      subtitle="Consulting-grade analysis powered by six parallel AI agents."
    >
      <div className="space-y-8">
        <ExecutiveSummary summary={String(report.executive_summary || '')} score={Number(report.data_quality_score || 0)} metadata={metadata} />
        <CompanyOverviewCard overview={(report.company_overview as Record<string, string>) || {}} />
        <section>
          <SectionHeading label="Financials" title="Financial Analysis" />
          <FinancialCharts metrics={(report.financial_analysis as []) || []} />
        </section>
        <section>
          <SectionHeading label="Risk" title="Risk Assessment" />
          <RiskMatrix risks={(report.risk_assessment as []) || []} />
        </section>
        <section>
          <SectionHeading label="Strategy" title="Strategic Insights" />
          <InsightsPanel insights={(report.strategic_insights as []) || []} />
        </section>
        <RedFlags flags={(report.red_flags as []) || []} />
        <section>
          <SectionHeading label="Actions" title="Recommendations" />
          <RecommendationsList recommendations={(report.recommendations as []) || []} />
        </section>
        <section>
          <SectionHeading label="Q&A" title="Ask About This Analysis" />
          <QAChat documentId={documentId} suggestedQuestions={suggested} />
        </section>
      </div>
    </PageShell>
  );
}
