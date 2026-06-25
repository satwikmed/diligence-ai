export const DEMO_COMPANIES = [
  {
    id: 'aapl-demo-0001-0000-0000-000000000001',
    filename: 'AAPL_10K_FY2024.pdf',
    company_name: 'Apple Inc.',
    document_type: '10-K',
    filing_year: 2024,
    data_quality_score: 92,
    processing_status: 'complete',
    upload_timestamp: '2024-10-15T12:00:00.000Z',
    revenue: '$391.0B',
    revenue_growth: '+2.0%',
    gross_margin: '46.2%',
    industry: 'Technology Hardware',
    hq: 'Cupertino, California',
  },
  {
    id: 'msft-demo-0002-0000-0000-000000000002',
    filename: 'MSFT_10K_FY2024.pdf',
    company_name: 'Microsoft Corporation',
    document_type: '10-K',
    filing_year: 2024,
    data_quality_score: 94,
    processing_status: 'complete',
    upload_timestamp: '2024-10-14T12:00:00.000Z',
    revenue: '$245.1B',
    revenue_growth: '+15.7%',
    gross_margin: '69.8%',
    industry: 'Software',
    hq: 'Redmond, Washington',
  },
  {
    id: 'crm-demo-0003-0000-0000-000000000003',
    filename: 'CRM_10K_FY2024.pdf',
    company_name: 'Salesforce, Inc.',
    document_type: '10-K',
    filing_year: 2024,
    data_quality_score: 88,
    processing_status: 'complete',
    upload_timestamp: '2024-10-13T12:00:00.000Z',
    revenue: '$34.9B',
    revenue_growth: '+11.2%',
    gross_margin: '75.4%',
    industry: 'Enterprise Software',
    hq: 'San Francisco, California',
  },
] as const;

export type DemoCompany = (typeof DEMO_COMPANIES)[number];

export const PRIOR_YEAR_SUFFIX = '::prior-year';

type Risk = {
  risk_name: string;
  description: string;
  severity: string;
  likelihood: string;
  category: string;
  source_section: string;
};

type Insight = {
  insight: string;
  category: string;
  severity: string;
  supporting_evidence: string;
};

const COMPANY_PROFILES: Record<
  string,
  {
    executive_summary: string;
    risk_assessment: Risk[];
    strategic_insights: Insight[];
    recommendations: Array<{ priority: string; action: string; rationale: string }>;
    red_flags: Array<{ flag: string; severity: string; source_page: number }>;
    fcf: { current: string; prior: string; change: string };
    operating_margin: { current: string; prior: string; change: string };
  }
> = {
  AAPL: {
    executive_summary:
      'Apple Inc. remains a high-quality compounder with $391B revenue (+2% YoY) and best-in-class consumer ecosystem economics. Services mix shift supports margins, but EU DMA / App Store regulation and China demand volatility are the key swing factors for the multiple.',
    risk_assessment: [
      { risk_name: 'App Store & DMA Regulation', description: 'EU Digital Markets Act and global antitrust actions may force alternative distribution and reduce take rates.', severity: 'high', likelihood: 'likely', category: 'regulatory', source_section: 'Risk Factors' },
      { risk_name: 'Greater China Demand', description: 'Revenue concentration in China exposes results to geopolitical tension and local competition.', severity: 'high', likelihood: 'possible', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'iPhone Upgrade Cycle', description: 'Hardware revenue tied to replacement cycles; elongation would pressure top line.', severity: 'medium', likelihood: 'possible', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Supply Chain Concentration', description: 'Manufacturing concentration in Asia creates disruption and tariff exposure.', severity: 'medium', likelihood: 'possible', category: 'operational', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Services and installed base monetization now drive the majority of gross profit growth.', category: 'operational', severity: 'positive', supporting_evidence: 'MD&A' },
      { insight: 'Vision Pro and on-device AI are early optionality, not yet material to estimates.', category: 'competitive', severity: 'neutral', supporting_evidence: 'Business Overview' },
    ],
    recommendations: [
      { priority: 'high', action: 'Track EU alternative app store economics and fee impact.', rationale: 'Regulatory outcomes could re-rate Services multiple.' },
      { priority: 'medium', action: 'Monitor China sell-through weekly during launch windows.', rationale: 'Leading indicator for hardware guide risk.' },
    ],
    red_flags: [{ flag: 'Revenue growth decelerated to low single digits YoY', severity: 'medium', source_page: 32 }],
    fcf: { current: '$108.8B', prior: '$99.6B', change: '+9.2%' },
    operating_margin: { current: '30.1%', prior: '28.5%', change: '+1.6%' },
  },
  MSFT: {
    executive_summary:
      'Microsoft is the clearest enterprise AI beneficiary with Azure + Copilot monetization and 15.7% revenue growth. Capex step-up for AI infrastructure is the main near-term margin debate; competitive dynamics in cloud and OpenAI partnership structure remain key diligence items.',
    risk_assessment: [
      { risk_name: 'AI Infrastructure Capex', description: 'Accelerated datacenter build-out may pressure near-term free cash flow and returns if utilization lags.', severity: 'medium', likelihood: 'likely', category: 'financial', source_section: 'Risk Factors' },
      { risk_name: 'Cloud Competition', description: 'AWS and Google Cloud competing aggressively on AI workloads and enterprise contracts.', severity: 'high', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Cybersecurity Incidents', description: 'High-profile breaches could damage enterprise trust and invite regulatory scrutiny.', severity: 'high', likelihood: 'possible', category: 'operational', source_section: 'Risk Factors' },
      { risk_name: 'OpenAI Partnership Dependency', description: 'Strategic reliance on OpenAI models creates concentration and governance risk.', severity: 'medium', likelihood: 'possible', category: 'strategic', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Azure AI attach is pulling through broader Microsoft 365 and security bundles.', category: 'competitive', severity: 'positive', supporting_evidence: 'MD&A' },
      { insight: 'Gaming segment stabilizing post-Activision integration.', category: 'operational', severity: 'positive', supporting_evidence: 'MD&A' },
    ],
    recommendations: [
      { priority: 'high', action: 'Model AI capex as % of revenue vs Azure growth payoff.', rationale: 'Street debate centers on ROI timeline for GPU spend.' },
      { priority: 'medium', action: 'Compare Copilot seat penetration vs guidance language each quarter.', rationale: 'Leading indicator for Office ARPU expansion.' },
    ],
    red_flags: [{ flag: 'Capex growing faster than revenue — monitor FCF conversion', severity: 'medium', source_page: 41 }],
    fcf: { current: '$74.1B', prior: '$65.1B', change: '+13.8%' },
    operating_margin: { current: '44.6%', prior: '42.0%', change: '+2.6%' },
  },
  CRM: {
    executive_summary:
      'Salesforce leads enterprise CRM with 11.2% growth and improving profitability post restructuring. Investor focus is on Agentforce AI monetization vs seat compression, and whether macro-sensitive deal cycles elongate in mid-market.',
    risk_assessment: [
      { risk_name: 'Enterprise Deal Elongation', description: 'Macro uncertainty may extend sales cycles and increase discounting on large deals.', severity: 'high', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'AI Seat Displacement', description: 'Agentforce automation could reduce seat growth if priced per action vs per user.', severity: 'medium', likelihood: 'possible', category: 'strategic', source_section: 'Risk Factors' },
      { risk_name: 'Integration & M&A Risk', description: 'Historical acquisitions require ongoing integration; execution slips hurt margins.', severity: 'medium', likelihood: 'possible', category: 'operational', source_section: 'Risk Factors' },
      { risk_name: 'Competition from Microsoft', description: 'Dynamics 365 bundling with Azure and Office creates pricing pressure.', severity: 'high', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Data Cloud cross-sell is the primary growth lever beyond core CRM.', category: 'operational', severity: 'positive', supporting_evidence: 'MD&A' },
      { insight: 'Margin expansion from headcount discipline may be nearing a ceiling.', category: 'financial', severity: 'neutral', supporting_evidence: 'MD&A' },
    ],
    recommendations: [
      { priority: 'high', action: 'Track cRPO and billings vs revenue for demand inflection.', rationale: 'Best forward indicator in subscription model.' },
      { priority: 'medium', action: 'Size Agentforce ARPU uplift in bull/base/bear cases.', rationale: 'AI narrative depends on monetization proof.' },
    ],
    red_flags: [{ flag: 'Large deal scrutiny cited in MD&A — watch pipeline commentary', severity: 'medium', source_page: 28 }],
    fcf: { current: '$9.8B', prior: '$7.9B', change: '+24.1%' },
    operating_margin: { current: '22.4%', prior: '18.1%', change: '+4.3%' },
  },
};

const PRIOR_YEAR_PROFILES: Record<string, Partial<(typeof COMPANY_PROFILES)[string]>> = {
  AAPL: {
    risk_assessment: [
      { risk_name: 'Competitive Pressure', description: 'Intensifying competition in smartphones and wearables.', severity: 'medium', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Regulatory Scrutiny', description: 'Increasing antitrust and privacy regulation globally.', severity: 'high', likelihood: 'possible', category: 'regulatory', source_section: 'Risk Factors' },
      { risk_name: 'Supply Chain', description: 'Concentration risk in key suppliers and geographies.', severity: 'medium', likelihood: 'possible', category: 'operational', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Hardware innovation cycle remains the primary revenue driver.', category: 'competitive', severity: 'positive', supporting_evidence: 'MD&A' },
    ],
  },
  MSFT: {
    risk_assessment: [
      { risk_name: 'PC Market Cyclicality', description: 'Windows OEM revenue tied to PC shipment cycles.', severity: 'medium', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Regulatory Scrutiny', description: 'Antitrust focus on Teams bundling and cloud practices.', severity: 'high', likelihood: 'possible', category: 'regulatory', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Cloud migration tailwinds still driving Azure consumption.', category: 'operational', severity: 'positive', supporting_evidence: 'MD&A' },
    ],
  },
  CRM: {
    risk_assessment: [
      { risk_name: 'Macro Sensitivity', description: 'Enterprise software spending may slow in downturns.', severity: 'high', likelihood: 'possible', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Competitive Pressure', description: 'Pricing pressure from bundled CRM competitors.', severity: 'medium', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: 'Profitability improvement program on track.', category: 'financial', severity: 'positive', supporting_evidence: 'MD&A' },
    ],
  },
};

function tickerFromCompany(company: DemoCompany): string {
  return company.filename.split('_')[0];
}

function buildReport(company: DemoCompany) {
  const ticker = tickerFromCompany(company);
  const profile = COMPANY_PROFILES[ticker];
  return {
    executive_summary: profile.executive_summary,
    company_overview: {
      name: company.company_name,
      industry: company.industry,
      headquarters: company.hq,
      ticker,
      employees: ticker === 'CRM' ? '72,000+' : '200,000+',
      description: `${company.company_name} is a leading company in ${company.industry}.`,
    },
    financial_analysis: [
      { metric_name: 'revenue', current_value: company.revenue, prior_year_value: '—', yoy_change: company.revenue_growth, assessment: 'strong', industry_average: '—' },
      { metric_name: 'gross_margin', current_value: company.gross_margin, prior_year_value: '—', yoy_change: '—', assessment: 'strong', industry_average: '45%' },
      { metric_name: 'operating_margin', current_value: profile.operating_margin.current, prior_year_value: profile.operating_margin.prior, yoy_change: profile.operating_margin.change, assessment: 'adequate', industry_average: '22%' },
      { metric_name: 'free_cash_flow', current_value: profile.fcf.current, prior_year_value: profile.fcf.prior, yoy_change: profile.fcf.change, assessment: 'strong', industry_average: '—' },
    ],
    risk_assessment: profile.risk_assessment,
    strategic_insights: profile.strategic_insights,
    recommendations: profile.recommendations,
    red_flags: profile.red_flags,
    industry_benchmarks: [],
    data_quality_score: company.data_quality_score,
  };
}

function buildPriorReport(company: DemoCompany) {
  const ticker = tickerFromCompany(company);
  const current = buildReport(company);
  const prior = PRIOR_YEAR_PROFILES[ticker];
  if (!prior) return current;
  return {
    ...current,
    risk_assessment: prior.risk_assessment || current.risk_assessment,
    strategic_insights: prior.strategic_insights || current.strategic_insights,
  };
}

export function getDemoHistory() {
  return {
    items: DEMO_COMPANIES.map((c) => ({
      document_id: c.id,
      filename: c.filename,
      company_name: c.company_name,
      document_type: c.document_type,
      filing_year: c.filing_year,
      processing_status: c.processing_status,
      data_quality_score: c.data_quality_score,
      upload_timestamp: c.upload_timestamp,
      summary_preview: buildReport(c).executive_summary.slice(0, 200),
    })),
    total: DEMO_COMPANIES.length,
  };
}

export function getDemoAnalysis(documentId: string) {
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  if (!company) return null;
  const report = buildReport(company);
  return {
    document_id: documentId,
    status: 'complete',
    report,
    metadata: { processing_time_seconds: 42, total_chunks: 52, total_pages: 47 },
  };
}

export function getDemoPriorAnalysis(documentId: string) {
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  if (!company) return null;
  return {
    document_id: `${documentId}${PRIOR_YEAR_SUFFIX}`,
    status: 'complete',
    report: buildPriorReport(company),
    metadata: { processing_time_seconds: 42, total_chunks: 48, total_pages: 44 },
  };
}

export function isPriorYearCompareId(compareId: string): boolean {
  return compareId.endsWith(PRIOR_YEAR_SUFFIX);
}

export function getDemoCompare(doc1: string, doc2: string) {
  const c1 = DEMO_COMPANIES.find((c) => c.id === doc1);
  const c2 = DEMO_COMPANIES.find((c) => c.id === doc2);
  if (!c1 || !c2) return null;

  const r1 = buildReport(c1);
  const r2 = buildReport(c2);
  const metrics1 = Object.fromEntries(r1.financial_analysis.map((m) => [m.metric_name, m]));
  const metrics2 = Object.fromEntries(r2.financial_analysis.map((m) => [m.metric_name, m]));
  const allMetrics = new Set([...Object.keys(metrics1), ...Object.keys(metrics2)]);
  const scores: Record<string, number> = { strong: 4, adequate: 3, concerning: 2, critical: 1 };

  const financial_comparison = [...allMetrics].sort().map((name) => {
    const m1 = metrics1[name] || {};
    const m2 = metrics2[name] || {};
    const s1 = scores[m1.assessment as string] || 0;
    const s2 = scores[m2.assessment as string] || 0;
    return {
      metric: name,
      company_1: { name: c1.company_name, value: m1.current_value, assessment: m1.assessment },
      company_2: { name: c2.company_name, value: m2.current_value, assessment: m2.assessment },
      stronger: s1 > s2 ? 'company_1' : s2 > s1 ? 'company_2' : 'tie',
    };
  });

  return {
    company_1: { id: doc1, name: c1.company_name, data_quality_score: c1.data_quality_score },
    company_2: { id: doc2, name: c2.company_name, data_quality_score: c2.data_quality_score },
    financial_comparison,
    risk_count: { company_1: r1.risk_assessment.length, company_2: r2.risk_assessment.length },
    insights_count: { company_1: r1.strategic_insights.length, company_2: r2.strategic_insights.length },
    red_flags_count: { company_1: r1.red_flags.length, company_2: r2.red_flags.length },
  };
}

export function shouldUseDemoData(): boolean {
  return !process.env.NEXT_PUBLIC_API_URL?.trim();
}

/** @deprecated use shouldUseDemoData */
export function useDemoApi(): boolean {
  return shouldUseDemoData();
}

export function getDemoFilingDelta(documentId: string, compareId: string) {
  const current = getDemoAnalysis(documentId);
  if (!current?.report) return null;

  const prior = isPriorYearCompareId(compareId)
    ? getDemoPriorAnalysis(documentId)
    : getDemoAnalysis(compareId);
  if (!prior?.report) return null;

  const priorRisks = (prior.report.risk_assessment as Risk[]) || [];
  const currentRisks = (current.report.risk_assessment as Risk[]) || [];
  const priorInsights = (prior.report.strategic_insights as Insight[]) || [];
  const currentInsights = (current.report.strategic_insights as Insight[]) || [];

  const addedRisks = currentRisks.filter((r) => !priorRisks.some((p) => p.risk_name === r.risk_name));
  const removedRisks = priorRisks.filter((r) => !currentRisks.some((c) => c.risk_name === r.risk_name));
  const addedInsights = currentInsights.filter((i) => !priorInsights.some((p) => p.insight === i.insight));

  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  const priorLabel = isPriorYearCompareId(compareId)
    ? `FY${(company?.filing_year || 2024) - 1} 10-K (demo)`
    : 'Prior filing (demo)';
  const currentLabel = `FY${company?.filing_year || 2024} 10-K (demo)`;

  return {
    document_id: documentId,
    compare_id: compareId,
    prior_label: priorLabel,
    current_label: currentLabel,
    overall_change_score: Math.min(18 + addedRisks.length * 6 + removedRisks.length * 4 + addedInsights.length * 5, 72),
    headline_changes: [
      ...addedRisks.slice(0, 3).map((r) => ({
        type: 'added',
        section: 'Risk Factors',
        text: `${r.risk_name}: ${r.description}`,
        citation: r.source_section,
      })),
      ...removedRisks.slice(0, 2).map((r) => ({
        type: 'removed',
        section: 'Risk Factors',
        text: `${r.risk_name}: ${r.description}`,
        citation: r.source_section,
      })),
    ],
    sections: [
      {
        section: 'Risk Factors',
        change_percentage: Math.round((addedRisks.length + removedRisks.length) * 8 + 12),
        summary: `Risk Factors: ${addedRisks.length} new and ${removedRisks.length} removed items vs prior filing.`,
        added: addedRisks.map((r) => ({ text: `${r.risk_name}: ${r.description}`, source: currentLabel, section: 'Risk Factors' })),
        removed: removedRisks.map((r) => ({ text: `${r.risk_name}: ${r.description}`, source: priorLabel, section: 'Risk Factors' })),
      },
      {
        section: 'MD&A / Strategic Insights',
        change_percentage: Math.round(addedInsights.length * 15 + 10),
        summary: `MD&A / Strategic Insights: ${addedInsights.length} net new themes vs prior filing.`,
        added: addedInsights.map((i) => ({ text: i.insight, source: currentLabel, section: i.supporting_evidence })),
        removed: priorInsights
          .filter((i) => !currentInsights.some((c) => c.insight === i.insight))
          .map((i) => ({ text: i.insight, source: priorLabel, section: i.supporting_evidence })),
      },
    ],
  };
}

export function getDemoContradictions(documentId: string) {
  const analysis = getDemoAnalysis(documentId);
  if (!analysis?.report) return null;
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  const ticker = tickerFromCompany(company!);

  const contradictionsByTicker: Record<string, Array<Record<string, unknown>>> = {
    AAPL: [
      {
        theme: 'Regulatory risk',
        severity: 'high',
        earnings_call: {
          speaker: 'CEO',
          quote: 'We see minimal regulatory headwinds and expect our App Store model to remain largely unchanged globally.',
          source: 'Q4 FY2024 Earnings Call',
        },
        filing: {
          quote: 'App Store & DMA Regulation: EU Digital Markets Act and global antitrust actions may force alternative distribution and reduce take rates.',
          source: 'Risk Factors',
        },
        analysis:
          'Management downplayed regulatory pressure on the earnings call while the 10-K flags DMA/antitrust as a high-severity risk to Services economics.',
      },
    ],
    MSFT: [
      {
        theme: 'AI capex / FCF',
        severity: 'medium',
        earnings_call: {
          speaker: 'CEO',
          quote: 'Azure AI demand continues to exceed our capacity; we are aggressively expanding data center footprint with confidence in returns.',
          source: 'Q4 FY2024 Earnings Call',
        },
        filing: {
          quote: 'AI Infrastructure Capex: Accelerated datacenter build-out may pressure near-term free cash flow and returns if utilization lags.',
          source: 'Risk Factors',
        },
        analysis:
          'Call emphasizes aggressive AI build-out and demand; 10-K explicitly warns capex may pressure near-term FCF — tone is more cautious on ROI timing.',
      },
    ],
    CRM: [
      {
        theme: 'Demand / sales cycle',
        severity: 'high',
        earnings_call: {
          speaker: 'CEO',
          quote: 'We are not seeing enterprise deal elongation; pipeline conversion remains healthy across all segments.',
          source: 'Q4 FY2024 Earnings Call',
        },
        filing: {
          quote: 'Enterprise Deal Elongation: Macro uncertainty may extend sales cycles and increase discounting on large deals.',
          source: 'Risk Factors',
        },
        analysis:
          'Management characterized pipeline conversion as healthy on the call, while the 10-K lists deal elongation as a high-likelihood risk factor.',
      },
    ],
  };

  return {
    document_id: documentId,
    ticker,
    contradictions: contradictionsByTicker[ticker] || [],
    call_excerpt_count: 2,
  };
}

export function getDemoSuggestedQuestions(documentId: string): string[] {
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  const name = company?.company_name.split(' ')[0] || 'the company';
  return [
    `What are the top 3 risks to ${name}'s thesis from this 10-K?`,
    'How is revenue growth trending year over year?',
    'What did management emphasize on the last earnings call vs Risk Factors?',
  ];
}

export function getDemoAnswer(documentId: string, question: string): {
  answer: string;
  sources: Array<{ section_name: string; page_number: number; excerpt: string }>;
  ragas_scores: { faithfulness: number; answer_relevancy: number; context_precision: number };
} {
  const analysis = getDemoAnalysis(documentId);
  const company = DEMO_COMPANIES.find((c) => c.id === documentId);
  const ticker = company ? tickerFromCompany(company) : 'AAPL';
  const q = question.toLowerCase();
  const risks = (analysis?.report?.risk_assessment as Risk[]) || [];
  const topRisks = risks.slice(0, 3).map((r) => r.risk_name).join(', ');

  let answer: string;
  if (q.includes('risk') || q.includes('worry')) {
    answer = `Based on the ${company?.company_name || 'company'} 10-K, the primary risks are: ${topRisks}. The Risk Factors section (pp. 12–18) provides cited detail on severity and likelihood. For ${ticker}, regulatory and competitive dynamics are the highest-conviction diligence items.`;
  } else if (q.includes('revenue') || q.includes('growth')) {
    answer = `${company?.company_name} reported ${company?.revenue} revenue (${company?.revenue_growth} YoY) per the MD&A. Gross margin is ${company?.gross_margin}. See Financial Analysis for metric-level benchmarking.`;
  } else if (q.includes('earnings') || q.includes('call') || q.includes('contradict')) {
    answer = `Cross-check the Earnings vs 10-K panel: management tone on the last call should be compared to Risk Factors and MD&A. Demo data flags any high-confidence mismatches for ${ticker}.`;
  } else {
    answer = `From the ${company?.company_name || 'company'} filing: ${question.replace('?', '')}. Key sections include Risk Factors, MD&A, and the executive summary. Top risks: ${topRisks}.`;
  }

  return {
    answer,
    sources: [
      { section_name: 'Risk Factors', page_number: 14, excerpt: risks[0]?.description || 'See filing.' },
      { section_name: 'MD&A', page_number: 28, excerpt: 'Management discussion of results and outlook.' },
    ],
    ragas_scores: { faithfulness: 0.91, answer_relevancy: 0.93, context_precision: 0.88 },
  };
}
