"""Build research artifacts (text filing deltas, contradictions) for frontend + API."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from agents.contradiction.research import detect_contradictions_from_filing_text
from agents.filing_delta.text_differ import _is_noise_paragraph, _materiality_score, compute_text_filing_delta
from data.filing_sections import TICKER_FILINGS, extract_sections_from_pdf, filing_paths_for_ticker

OUT_DIR = ROOT / "frontend" / "public" / "research"
SAMPLE_DIR = ROOT / "data" / "sample_docs"


def _qa_chunks(sections: dict) -> list[dict[str, str | int | None]]:
    """Filing paragraphs for Q&A retrieval (material, non-noise)."""
    chunks: list[dict[str, str | int | None]] = []
    for para in sections.get("risk_paragraphs") or []:
        if _is_noise_paragraph(para):
            continue
        chunks.append(
            {
                "section_name": "Risk Factors",
                "text": para,
                "page_number": sections.get("risk_page"),
                "materiality": round(_materiality_score(para), 1),
            }
        )
    for para in sections.get("mda_paragraphs") or []:
        if _is_noise_paragraph(para):
            continue
        chunks.append(
            {
                "section_name": "MD&A",
                "text": para,
                "page_number": sections.get("mda_page"),
                "materiality": round(_materiality_score(para), 1),
            }
        )
    chunks.sort(key=lambda c: float(c.get("materiality") or 0), reverse=True)
    return chunks[:40]


def build_ticker_research(ticker: str) -> dict | None:
    current_path, prior_path = filing_paths_for_ticker(ticker)
    if not current_path:
        print(f"  Skip {ticker}: no current filing PDF")
        return None

    current = extract_sections_from_pdf(current_path)
    result: dict = {"ticker": ticker, "current_source": current_path.name}

    if prior_path and prior_path.exists():
        prior = extract_sections_from_pdf(prior_path)
        delta = compute_text_filing_delta(
            prior,
            current,
            prior_label=f"FY prior 10-K ({prior_path.name})",
            current_label=f"FY current 10-K ({current_path.name})",
        )
        result["filing_delta"] = delta
        result["prior_source"] = prior_path.name
        print(
            f"  {ticker} delta: {delta['overall_change_score']}% "
            f"({len(delta['sections'][0]['added'])} risk adds, {len(delta['sections'][0]['removed'])} risk removes)"
        )
    else:
        print(f"  {ticker}: prior-year PDF missing — run download_samples.py --prior")

    contradictions = detect_contradictions_from_filing_text(current, ticker)
    result["contradictions"] = contradictions
    result["qa_chunks"] = _qa_chunks(current)
    print(f"  {ticker} contradictions: {len(contradictions.get('contradictions', []))} flagged")
    print(f"  {ticker} Q&A chunks: {len(result['qa_chunks'])} paragraphs")

    return result


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index: dict[str, str] = {}

    for ticker in TICKER_FILINGS:
        data = build_ticker_research(ticker)
        if not data:
            continue
        out = OUT_DIR / f"{ticker.lower()}-research.json"
        out.write_text(json.dumps(data, indent=2))
        index[ticker] = f"/research/{ticker.lower()}-research.json"
        print(f"  Wrote {out.relative_to(ROOT)}")

    (OUT_DIR / "index.json").write_text(json.dumps(index, indent=2))
    print(f"\nResearch artifacts in {OUT_DIR}")


if __name__ == "__main__":
    main()
