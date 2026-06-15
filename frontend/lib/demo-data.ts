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

function buildReport(company: DemoCompany) {
  return {
    executive_summary: `${company.company_name} presents a mixed but generally favorable investment profile based on this 10-K analysis. Revenue of ${company.revenue} with ${company.revenue_growth} YoY growth reflects solid market positioning. Key risks include competitive pressure and regulatory exposure, balanced by strong margins and cash generation.`,
    company_overview: {
      name: company.company_name,
      industry: company.industry,
      headquarters: company.hq,
      ticker: company.filename.split('_')[0],
      employees: '150,000+',
      description: `${company.company_name} is a leading company in ${company.industry}.`,
    },
    financial_analysis: [
      { metric_name: 'revenue', current_value: company.revenue, prior_year_value: '—', yoy_change: company.revenue_growth, assessment: 'strong', industry_average: '—' },
      { metric_name: 'gross_margin', current_value: company.gross_margin, prior_year_value: '—', yoy_change: '—', assessment: 'strong', industry_average: '45%' },
      { metric_name: 'operating_margin', current_value: '30.1%', prior_year_value: '28.5%', yoy_change: '+1.6%', assessment: 'adequate', industry_average: '22%' },
      { metric_name: 'free_cash_flow', current_value: '$108.8B', prior_year_value: '$99.6B', yoy_change: '+9.2%', assessment: 'strong', industry_average: '—' },
    ],
    risk_assessment: [
      { risk_name: 'Competitive Pressure', description: 'Intensifying competition in core markets.', severity: 'medium', likelihood: 'likely', category: 'market', source_section: 'Risk Factors' },
      { risk_name: 'Regulatory Scrutiny', description: 'Increasing antitrust and privacy regulation globally.', severity: 'high', likelihood: 'possible', category: 'regulatory', source_section: 'Risk Factors' },
      { risk_name: 'Supply Chain', description: 'Concentration risk in key suppliers and geographies.', severity: 'medium', likelihood: 'possible', category: 'operational', source_section: 'Risk Factors' },
    ],
    strategic_insights: [
      { insight: `${company.company_name} maintains strong competitive moats through ecosystem lock-in and brand loyalty.`, category: 'competitive', severity: 'positive', supporting_evidence: 'Business Overview' },
      { insight: 'Services revenue growth outpaces hardware, improving margin mix.', category: 'operational', severity: 'positive', supporting_evidence: 'MD&A' },
    ],
    recommendations: [
      { priority: 'high', action: 'Monitor regulatory developments in EU and US markets.', rationale: 'Material impact on business model possible.' },
      { priority: 'medium', action: 'Track services attach rate as key growth indicator.', rationale: 'Higher-margin recurring revenue driver.' },
    ],
    red_flags: [{ flag: 'Revenue growth decelerating vs prior year', severity: 'medium', source_page: 32 }],
    industry_benchmarks: [],
    data_quality_score: company.data_quality_score,
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

/** Use built-in demo data when no real backend URL is configured (Vercel default). */
export function shouldUseDemoData(): boolean {
  const url = process.env.NEXT_PUBLIC_API_URL?.trim();
  return !url || url.includes('localhost') || url.includes('127.0.0.1');
}

/** @deprecated use shouldUseDemoData */
export function useDemoApi(): boolean {
  return shouldUseDemoData();
}
