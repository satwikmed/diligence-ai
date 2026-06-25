"use client"

import Link from "next/link"
import SectionHeading from "@/components/ui/section-heading"

const AGENTS = [
  {
    name: "Document Processor",
    framework: "pypdf + chunking",
    role: "Parses the uploaded 10-K PDF, splits it into logical sections (Business, Risk Factors, MD&A, Financial Statements), chunks the text, and embeds it into a vector store for retrieval by other agents.",
  },
  {
    name: "Financial Analyst",
    framework: "Python + GPT/heuristics",
    role: "Extracts key financial metrics — revenue, margins, debt, cash flow, YoY changes — and benchmarks them against industry averages. Flags metrics that are strong, adequate, or concerning.",
  },
  {
    name: "Risk Detective",
    framework: "Multi-step Python",
    role: "Runs a multi-step risk analysis workflow. Identifies operational, financial, regulatory, and market risks from the filing. Ranks each risk by severity and likelihood, and notes whether it is currently in the news.",
  },
  {
    name: "Strategic Insights",
    framework: "GPT / heuristics",
    role: "Synthesizes financial and risk findings into equity-research-grade insights — competitive positioning, growth drivers, and macro exposure with cited filing sections.",
  },
  {
    name: "Report Generator",
    framework: "Pydantic models",
    role: "Compiles all agent outputs into a structured ER due diligence report with executive summary, company overview, and a data quality score reflecting filing completeness.",
  },
  {
    name: "Q&A Agent",
    framework: "RAG + heuristic scores",
    role: "Available after the report is complete. Retrieves relevant filing paragraphs, answers follow-up questions, cites source sections, and scores responses on faithfulness, relevancy, and precision.",
  },
]

const REPORT_SECTIONS = [
  {
    title: "Executive Summary",
    detail: "A narrative overview of the company and investment thesis, plus a data quality score (0–100) reflecting filing completeness.",
  },
  {
    title: "Company Overview",
    detail: "Industry, headquarters, employees, ticker, and a business description extracted from the filing.",
  },
  {
    title: "Financial Analysis",
    detail: "Revenue, margins, debt, cash, and free cash flow with YoY changes, industry benchmarks, and visual bar comparisons.",
  },
  {
    title: "Risk Assessment",
    detail: "A ranked risk matrix with severity, likelihood, category, and expandable descriptions sourced from the 10-K.",
  },
  {
    title: "Strategic Insights",
    detail: "Categorized insights (competitive, operational, market) with supporting evidence from the filing.",
  },
  {
    title: "Red Flags",
    detail: "High-priority concerns flagged for immediate attention, with source page references.",
  },
  {
    title: "Recommendations",
    detail: "Prioritized action items (critical / high / medium / low) with rationale for investors or analysts.",
  },
  {
    title: "Interactive Q&A",
    detail: "Ask anything about the analysis. Retrieves filing paragraphs, cites Risk Factors / MD&A excerpts, and scores answers on faithfulness, relevancy, and precision.",
  },
]

const PLATFORM_FEATURES = [
  {
    title: "QoQ Filing Delta",
    detail: "Diff Risk Factors and MD&A from real SEC 10-K PDF text (FY2023 vs FY2024) with materiality-ranked adds and removes.",
  },
  {
    title: "Earnings vs 10-K Contradictions",
    detail: "Side-by-side quotes when management tone on the call diverges from extracted Risk Factors / MD&A language in the 10-K.",
  },
  {
    title: "ER Memo Export (PDF)",
    detail: "One-page investment memo: thesis, key metrics, risks, and analyst actions — formatted for equity research, not consulting slides.",
  },
  {
    title: "Analysis History",
    detail: "Every completed analysis is saved. Re-open any report instantly. Pre-seeded with Apple, Microsoft, and Salesforce demos.",
  },
  {
    title: "Company Compare",
    detail: "Select any two completed analyses and compare financial metrics, risk counts, insight counts, and red flags side by side.",
  },
  {
    title: "Demo & deployment",
    detail: "Live on Vercel with SEC filing-text delta, contradictions, memo export, and OpenAI Q&A (OPENAI_API_KEY). FastAPI backend on Render enables PDF upload and the WebSocket agent pipeline.",
  },
]

const TECH_STACK = [
  { layer: "Document Processor", tech: "pypdf + section chunking (LangChain optional)" },
  { layer: "Financial Analyst", tech: "Python heuristics + optional GPT-4o" },
  { layer: "Risk Detective", tech: "Multi-step Python workflow" },
  { layer: "Strategic Insights", tech: "GPT-4o-mini / heuristics" },
  { layer: "Report Generator", tech: "Pydantic typed models" },
  { layer: "Q&A Agent", tech: "Chunk retrieval + GPT-4o-mini + heuristic quality scores" },
  { layer: "Filing Delta", tech: "SEC PDF text diff (Item 1A / Item 7)" },
  { layer: "Contradictions", tech: "Transcript vs filing text rules" },
  { layer: "Inter-agent comms", tech: "A2A Protocol (HTTP messages)" },
  { layer: "Tool access", tech: "MCP Servers (document, analysis, benchmark)" },
  { layer: "Backend API", tech: "FastAPI + WebSocket" },
  { layer: "Frontend", tech: "Next.js 14 + TypeScript + Tailwind CSS" },
  { layer: "Vector store", tech: "Pinecone (or in-memory fallback)" },
  { layer: "Database", tech: "SQLite" },
  { layer: "Orchestration", tech: "Python asyncio parallel pipeline" },
]

const PIPELINE_STEPS = [
  "You upload a 10-K PDF (or open a pre-built AAPL / MSFT / CRM report from History).",
  "The Document Processor parses and embeds the filing into a searchable vector store.",
  "Financial Analyst and Risk Detective run in parallel — extracting metrics and identifying risks simultaneously.",
  "Strategic Insights synthesizes both outputs into equity-research-grade observations.",
  "Report Generator compiles everything into a structured due diligence report.",
  "Q&A Agent becomes available — ask follow-up questions grounded in retrieved filing text with quality scoring.",
]

const RAGAS_METRICS = [
  { name: "Faithfulness", detail: "Is the answer actually supported by the retrieved filing text?" },
  { name: "Answer Relevancy", detail: "Does the response directly address the question asked?" },
  { name: "Context Precision", detail: "Were the most relevant document chunks retrieved?" },
]

function OverviewBlock({ step, title, children }: { step?: string; title: string; children: React.ReactNode }) {
  return (
    <article className="glass-card p-6 md:p-8">
      {step && (
        <span className="mb-4 inline-block text-xs font-medium tracking-[0.25em] text-sky-400/80">{step}</span>
      )}
      <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">{title}</h2>
      {children}
    </article>
  )
}

export default function ProjectSummary() {
  return (
    <section className="scroll-mt-6 py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="hero-fade-up mb-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-sky-400/80">Project Summary</p>
          <h2 className="text-4xl font-bold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
            <span className="hero-gradient-text mb-1 block text-2xl font-light md:text-3xl lg:text-4xl">
              Everything
            </span>
            <span className="block font-black">About Diligence AI</span>
            <span className="block font-light italic text-white/80">Platform Guide</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-white/70">
            A full summary of what this platform is, how it works, what it produces, and how to use it.
          </p>
        </div>
        {/* Mission */}
        <OverviewBlock step="INTRO" title="The Problem It Solves">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            Equity research coverage means reading hundreds of pages per name — 10-Ks, 10-Qs, earnings calls — while
            headcount is flat. A single analyst may cover 30+ stocks; nobody manually diffs every Risk Factors section
            or cross-checks every CEO quote against the filing.
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            <strong className="font-medium text-white">Diligence AI</strong> automates the first-pass diligence workflow:
            upload a 10-K, get a citation-backed report, QoQ filing delta, earnings-vs-10-K contradiction flags, and a
            one-page ER memo export — in minutes, not days.
          </p>
        </OverviewBlock>

        {/* Live deployment */}
        <OverviewBlock step="LIVE" title="Live & Deployed">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-1 font-medium text-white">Frontend (Vercel)</h3>
              <a
                href="https://diligence-ai-nine.vercel.app"
                className="text-sm text-sky-300 hover:text-sky-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                diligence-ai-nine.vercel.app
              </a>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                History, reports, filing delta, contradictions, memo, and Q&A work instantly — no upload required.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-1 font-medium text-white">Backend (Render)</h3>
              <a
                href="https://diligence-ai-api.onrender.com/health"
                className="text-sm text-sky-300 hover:text-sky-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                diligence-ai-api.onrender.com
              </a>
              <p className="mt-2 text-xs leading-relaxed text-white/55">
                FastAPI + WebSocket pipeline. Enables live PDF upload from the frontend.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            <strong className="text-white">Source:</strong>{" "}
            <a
              href="https://github.com/satwikmed/diligence-ai"
              className="text-sky-300 hover:text-sky-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/satwikmed/diligence-ai
            </a>
            {" · "}
            Real SEC 10-K PDFs in <code className="text-white/80">data/sample_docs/</code> · Research artifacts via{" "}
            <code className="text-white/80">data/seed_research.py</code>
            {" · "}
            <a href="https://github.com/satwikmed/diligence-ai/blob/main/docs/case-studies/AAPL.md" className="text-sky-300 hover:text-sky-200" target="_blank" rel="noopener noreferrer">
              AAPL case study
            </a>
          </p>
        </OverviewBlock>

        {/* End to end */}
        <OverviewBlock step="FLOW" title="End-to-End Workflow">
          <ol className="space-y-3">
            {PIPELINE_STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/70 md:text-base">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-medium text-sky-300">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </OverviewBlock>

        {/* Six agents */}
        <section>
          <SectionHeading label="Agents" title="The Six AI Agents" />
          <div className="grid gap-4 md:grid-cols-2">
            {AGENTS.map((agent) => (
              <div key={agent.name} className="glass-card p-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <span className="badge badge-primary">{agent.framework}</span>
                </div>
                <p className="text-sm leading-relaxed text-white/65">{agent.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <OverviewBlock step="PIPELINE" title="Agent Pipeline">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/70">
            When you upload a filing, six agents run in sequence — Financial Analyst and Risk Detective
            execute in parallel. Watch the live pipeline on the upload and analysis pages via WebSocket.
          </p>
          <Link
            href="/upload"
            className="inline-flex rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-amber-400"
          >
            See pipeline on Upload page
          </Link>
        </OverviewBlock>

        {/* Report output - was pipeline visual section replaced */}
        <section>
          <SectionHeading label="Deliverables" title="What the Report Contains" />
          <div className="grid gap-4 sm:grid-cols-2">
            {REPORT_SECTIONS.map((section) => (
              <div key={section.title} className="glass-card p-5">
                <h3 className="mb-2 font-semibold text-white">{section.title}</h3>
                <p className="text-sm leading-relaxed text-white/65">{section.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform features */}
        <section>
          <SectionHeading label="Platform" title="Platform Features" />
          <div className="grid gap-4 md:grid-cols-2">
            {PLATFORM_FEATURES.map((feature) => (
              <div key={feature.title} className="glass-card p-5">
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-white/65">{feature.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <OverviewBlock step="ARCHITECTURE" title="Multi-Agent Architecture">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            Agents do not share memory directly. They communicate through the{" "}
            <strong className="text-white">A2A (Agent-to-Agent) protocol</strong> — HTTP-based messages that pass
            structured results between pipeline stages. Each agent also has access to shared tools via{" "}
            <strong className="text-white">MCP (Model Context Protocol) servers</strong> for document retrieval,
            financial benchmarks, and analysis storage.
          </p>
          <div className="glass-card overflow-x-auto bg-black/20 p-4 font-mono text-xs leading-relaxed text-white/60">
            <pre className="whitespace-pre">{`Document Processor (pypdf + chunking)
       |
       +-- A2A --> Financial Analyst (Python / GPT) ----+
       |                                                |
       +-- A2A --> Risk Detective (multi-step) ---------+-- A2A --> Strategic Insights
                                                        |
                                                        v
                                             Report Generator (Pydantic)
                                                        |
                        Filing Delta (SEC text)  +  Contradictions (call vs 10-K)
                                                        |
                                                        v
                                             Q&A Agent (chunk RAG + GPT)
                                                        |
                                          MCP Tools <--> SQLite / Vector Store

Frontend: Next.js (Vercel)  ·  Backend: FastAPI + WebSocket (Render)`}</pre>
          </div>
        </OverviewBlock>

        {/* Tech stack */}
        <section className="glass-card p-6 md:p-8">
          <SectionHeading label="Stack" title="Technology Stack" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="pb-3 pr-4">Component</th>
                  <th className="pb-3">Technology</th>
                </tr>
              </thead>
              <tbody>
                {TECH_STACK.map((row) => (
                  <tr key={row.layer} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{row.layer}</td>
                    <td className="py-3 text-white/65">{row.tech}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* RAGAS */}
        <OverviewBlock step="QUALITY" title="Answer Quality Scoring">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/70">
            Q&A retrieves relevant filing paragraphs from extracted 10-K text, then scores answers on
            faithfulness, relevancy, and context precision (heuristic on Vercel; full RAGAS when installed locally).
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {RAGAS_METRICS.map((metric) => (
              <div key={metric.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-1 font-medium text-sky-300">{metric.name}</h3>
                <p className="text-xs leading-relaxed text-white/60">{metric.detail}</p>
              </div>
            ))}
          </div>
        </OverviewBlock>

        {/* Demo tips */}
        <OverviewBlock step="DEMO" title="Suggested ER Demo Flow">
          <ol className="space-y-3 text-sm leading-relaxed text-white/70">
            <li>
              <strong className="text-white">1. History → Apple</strong> — Open the pre-built AAPL report; walk through
              executive summary, risks, and financials.
            </li>
            <li>
              <strong className="text-white">2. Filing Delta</strong> — Compare FY2024 vs prior-year 10-K; show SEC
              extracted Risk Factors adds (badge: Item 1A / Item 7).
            </li>
            <li>
              <strong className="text-white">3. Contradictions</strong> — Show CEO call quote vs 10-K regulatory risk
              language side-by-side.
            </li>
            <li>
              <strong className="text-white">4. Export ER Memo</strong> — Download the one-page PDF investment memo.
            </li>
            <li>
              <strong className="text-white">5. Compare</strong> — Apple vs Microsoft on growth, margins, and risk count.
            </li>
            <li>
              <strong className="text-white">6. Q&A</strong> — Ask: &ldquo;What is gross margin and the top regulatory
              risk?&rdquo; and show cited filing excerpts.
            </li>
          </ol>
        </OverviewBlock>

        {/* CTA */}
        <section className="glass-card flex flex-col items-center gap-6 p-8 text-center md:p-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to try it?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              <strong className="text-white/80">View History</strong> for instant AAPL, Microsoft, and Salesforce
              reports. <strong className="text-white/80">Upload a 10-K</strong> to run the full agent pipeline (requires
              the Render backend).
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/history"
              className="rounded-full border border-white/25 px-8 py-3 text-sm font-medium text-white transition hover:border-sky-400/40 hover:bg-white/5"
            >
              View History (instant)
            </Link>
            <Link
              href="/upload"
              className="rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-amber-400"
            >
              Upload a 10-K
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}
