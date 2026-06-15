"use client"

import Link from "next/link"
import SectionHeading from "@/components/ui/section-heading"

const AGENTS = [
  {
    name: "Document Processor",
    framework: "LangChain",
    role: "Parses the uploaded 10-K PDF, splits it into logical sections (Business, Risk Factors, MD&A, Financial Statements), chunks the text, and embeds it into a vector store for retrieval by other agents.",
  },
  {
    name: "Financial Analyst",
    framework: "CrewAI",
    role: "Extracts key financial metrics — revenue, margins, debt, cash flow, YoY changes — and benchmarks them against industry averages. Flags metrics that are strong, adequate, or concerning.",
  },
  {
    name: "Risk Detective",
    framework: "LangGraph",
    role: "Runs a multi-step risk analysis workflow. Identifies operational, financial, regulatory, and market risks from the filing. Ranks each risk by severity and likelihood, and notes whether it is currently in the news.",
  },
  {
    name: "Strategic Insights",
    framework: "OpenAI Agents SDK",
    role: "Synthesizes financial and risk findings into consultant-grade strategic insights — competitive positioning, growth drivers, management quality signals, and macro exposure.",
  },
  {
    name: "Report Generator",
    framework: "Pydantic AI",
    role: "Compiles all agent outputs into a structured, typed consulting report with an executive summary, company overview, and a data quality score reflecting how complete the source filing was.",
  },
  {
    name: "Q&A Agent",
    framework: "LangChain + RAGAS",
    role: "Available after the report is complete. Answers follow-up questions using retrieval-augmented generation, cites source sections and page numbers, and scores every response on faithfulness, relevancy, and precision.",
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
    detail: "Ask anything about the analysis. Responses include RAGAS scores and citations to specific filing sections.",
  },
]

const PLATFORM_FEATURES = [
  {
    title: "Live Agent Pipeline",
    detail: "Watch all six agents run in real time via WebSocket. See progress percentage, current agent, and a live event log as each stage completes.",
  },
  {
    title: "Analysis History",
    detail: "Every completed analysis is saved to SQLite. Re-open any report instantly without re-processing. Pre-seeded with Apple, Microsoft, and Salesforce demos.",
  },
  {
    title: "Company Compare",
    detail: "Select any two completed analyses and compare financial metrics, risk counts, insight counts, and red flags side by side.",
  },
  {
    title: "Sample 10-K Filings",
    detail: "Real SEC EDGAR PDFs for Apple (AAPL), Microsoft (MSFT), and Salesforce (CRM) are bundled with the project — no need to bring your own files for demos.",
  },
  {
    title: "Demo Mode",
    detail: "Works without API keys. Uses heuristic extraction, pre-built risk registers, pseudo-embeddings, and demo insights. Add OPENAI_API_KEY for full GPT-powered analysis.",
  },
  {
    title: "Agent Logs",
    detail: "Full audit trail of every agent action stored in the database — useful for debugging and demonstrating the multi-agent orchestration.",
  },
]

const TECH_STACK = [
  { layer: "Document Processor", tech: "LangChain + Unstructured / pypdf" },
  { layer: "Financial Analyst", tech: "CrewAI" },
  { layer: "Risk Detective", tech: "LangGraph" },
  { layer: "Strategic Insights", tech: "OpenAI Agents SDK" },
  { layer: "Report Generator", tech: "Pydantic AI" },
  { layer: "Q&A Agent", tech: "LangChain + RAGAS" },
  { layer: "Inter-agent comms", tech: "A2A Protocol (HTTP messages)" },
  { layer: "Tool access", tech: "MCP Servers (document, analysis, benchmark)" },
  { layer: "Backend API", tech: "FastAPI + WebSocket" },
  { layer: "Frontend", tech: "Next.js 14 + TypeScript + Tailwind CSS" },
  { layer: "Vector store", tech: "Pinecone (or in-memory fallback)" },
  { layer: "Database", tech: "SQLite" },
  { layer: "Orchestration", tech: "Python asyncio parallel pipeline" },
]

const PIPELINE_STEPS = [
  "You upload a 10-K PDF (or use a bundled sample filing).",
  "The Document Processor parses and embeds the filing into a searchable vector store.",
  "Financial Analyst and Risk Detective run in parallel — extracting metrics and identifying risks simultaneously.",
  "Strategic Insights synthesizes both outputs into consultant-grade observations.",
  "Report Generator compiles everything into a structured due diligence report.",
  "Q&A Agent becomes available — ask follow-up questions grounded in the filing with RAGAS scoring.",
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
    <section className="scroll-mt-6 px-6 py-20 md:px-10">
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
            Due diligence on a public company&apos;s annual 10-K filing is one of the most time-consuming tasks in
            finance and consulting. A junior analyst might spend two weeks reading hundreds of pages, extracting
            financial metrics, mapping risks, and writing a summary for a partner or investment committee.
          </p>
          <p className="max-w-3xl text-sm leading-relaxed text-white/70 md:text-base">
            <strong className="font-medium text-white">Diligence AI</strong> automates that entire workflow. Upload a
            single PDF and six specialized AI agents — each built on a different framework — collaborate to produce a
            consulting-grade due diligence report in minutes. The platform is designed as a portfolio-grade demo of
            modern multi-agent AI architecture, not a simple chatbot wrapper.
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
            <pre className="whitespace-pre">{`Document Processor (LangChain)
       |
       +-- A2A --> Financial Analyst (CrewAI) ----+
       |                                          |
       +-- A2A --> Risk Detective (LangGraph) ----+-- A2A --> Strategic Insights (OpenAI SDK)
                                                   |
                                                   v
                                        Report Generator (Pydantic AI)
                                                   |
                                                   v
                                        Q&A Agent (RAG + RAGAS)
                                                   |
                                          MCP Tools <--> SQLite / Vector Store`}</pre>
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
        <OverviewBlock step="QUALITY" title="RAGAS Answer Quality Scoring">
          <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/70">
            Every Q&A response is automatically evaluated using RAGAS (Retrieval-Augmented Generation Assessment).
            Scores are displayed in the chat UI and stored in the database.
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
        <OverviewBlock step="DEMO" title="Suggested Demo Flow">
          <ol className="space-y-3 text-sm leading-relaxed text-white/70">
            <li>
              <strong className="text-white">1. History</strong> — Open the pre-analyzed Apple Inc. report instantly to
              show a complete due diligence output without waiting.
            </li>
            <li>
              <strong className="text-white">2. Live Upload</strong> — Upload the Microsoft or Salesforce sample 10-K
              and watch the six-agent pipeline run in real time.
            </li>
            <li>
              <strong className="text-white">3. Compare</strong> — Put Apple vs Salesforce side-by-side on financials
              and risk counts.
            </li>
            <li>
              <strong className="text-white">4. Q&A</strong> — Ask: &ldquo;What are the top 3 things I should worry
              about if I am investing?&rdquo; and show grounded answers with citations.
            </li>
          </ol>
        </OverviewBlock>

        {/* CTA */}
        <section className="glass-card flex flex-col items-center gap-6 p-8 text-center md:p-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to try it?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
              Upload a 10-K PDF or use one of the bundled sample filings. Pre-analyzed reports for Apple, Microsoft,
              and Salesforce are already waiting in History.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/upload"
              className="rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-amber-400"
            >
              Upload a 10-K
            </Link>
            <Link
              href="/history"
              className="rounded-full border border-white/25 px-8 py-3 text-sm font-medium text-white transition hover:border-sky-400/40 hover:bg-white/5"
            >
              View History
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}
