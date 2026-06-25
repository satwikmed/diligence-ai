"""Extract Risk Factors and MD&A text from 10-K PDFs for research-grade diffs."""

from __future__ import annotations

import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_DIR = ROOT / "data" / "sample_docs"

# SEC Item headers (10-K) — tolerant of EDGAR HTML-to-PDF wrapping
RISK_START = re.compile(
    r"(?i)(item\s*1a\.?\s*risk\s*factors|risk\s*factors\s*our\s+business|part\s+i\s*item\s*1a)"
)
RISK_END = re.compile(r"(?i)(item\s*1b\.?\s*unresolved|item\s*2\.?\s*properties)")
MDA_START = re.compile(
    r"(?i)(item\s*7\.?\s*management.?s\s*discussion|management.?s\s*discussion\s*and\s*analysis)"
)
MDA_END = re.compile(r"(?i)(item\s*7a\.?\s*quantitative|item\s*8\.?\s*financial\s*statements)")

TICKER_FILINGS: dict[str, dict[str, str]] = {
    "AAPL": {"current": "AAPL_10K_FY2024.pdf", "prior": "AAPL_10K_FY2023.pdf"},
    "MSFT": {"current": "MSFT_10K_FY2024.pdf", "prior": "MSFT_10K_FY2023.pdf"},
    "CRM": {"current": "CRM_10K_FY2024.pdf", "prior": "CRM_10K_FY2023.pdf"},
}


def pdf_to_text(path: Path) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    parts: list[str] = []
    for i, page in enumerate(reader.pages, 1):
        content = page.extract_text() or ""
        parts.append(f"[Page {i}]\n{content}")
    return "\n\n".join(parts)


def _is_toc_header(text: str, start: int) -> bool:
    """SEC PDFs list Item headers in the TOC with page numbers before the body section."""
    snippet = text[start : start + 160]
    if re.search(r"(?i)risk factors\s+\d+\s+item", snippet):
        return True
    if re.search(r"(?i)management.?s discussion.{0,40}\d+\s+item", snippet):
        return True
    if re.search(r"(?i)item\s+7\.?\s+management.{0,60}\d+\s+item", snippet):
        return True
    return False


def _slice_section(text: str, start_pat: re.Pattern[str], end_pat: re.Pattern[str]) -> tuple[str, int | None]:
    matches = list(start_pat.finditer(text))
    if not matches:
        return "", None

    for start in reversed(matches):
        if _is_toc_header(text, start.start()):
            continue
        begin = start.start()
        rest = text[begin:]
        end = end_pat.search(rest[500:])
        if end:
            section = rest[: 500 + end.start()].strip()
        else:
            section = rest[:12000].strip()
        page_m = re.search(r"\[Page (\d+)\]", section)
        page = int(page_m.group(1)) if page_m else None
        cleaned = _clean_section(section)
        if len(cleaned) >= 400:
            return cleaned, page

    # Last resort: first match even if short
    begin = matches[0].start()
    rest = text[begin:]
    end = end_pat.search(rest[500:])
    section = rest[: 500 + end.start()].strip() if end else rest[:12000].strip()
    page_m = re.search(r"\[Page (\d+)\]", section)
    page = int(page_m.group(1)) if page_m else None
    return _clean_section(section), page


def _clean_section(text: str) -> str:
    text = re.sub(r"\[Page \d+\]\s*", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _paragraphs(text: str, min_len: int = 80) -> list[str]:
    if not text:
        return []
    # Split on sentence boundaries for SEC wall-of-text PDFs
    chunks = re.split(r"(?<=[.!?])\s+(?=[A-Z(])", text)
    out: list[str] = []
    buf = ""
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk:
            continue
        if len(buf) + len(chunk) < 400:
            buf = f"{buf} {chunk}".strip()
        else:
            if len(buf) >= min_len:
                out.append(buf)
            buf = chunk
    if len(buf) >= min_len:
        out.append(buf)
    return out[:80]  # cap for diff performance


def extract_sections_from_pdf(path: Path | str) -> dict[str, Any]:
    """Return risk_factors and mda text plus paragraph lists."""
    path = Path(path)
    if not path.exists():
        return {"risk_factors": "", "mda": "", "risk_paragraphs": [], "mda_paragraphs": [], "source": str(path)}

    text = pdf_to_text(path)
    risk_text, risk_page = _slice_section(text, RISK_START, RISK_END)
    mda_text, mda_page = _slice_section(text, MDA_START, MDA_END)

    # Fallback: keyword blocks if Item headers missing (simplified demo PDFs)
    if not risk_text and "RISK FACTORS" in text.upper():
        upper = text.upper()
        i = upper.find("RISK FACTORS")
        j = upper.find("MANAGEMENT", i + 20)
        risk_text = _clean_section(text[i : j if j > i else i + 8000])
    if not mda_text and "MANAGEMENT" in text.upper() and "DISCUSSION" in text.upper():
        upper = text.upper()
        i = upper.find("MANAGEMENT")
        j = upper.find("FINANCIAL STATEMENTS", i + 20)
        mda_text = _clean_section(text[i : j if j > i else i + 8000])

    return {
        "risk_factors": risk_text,
        "mda": mda_text,
        "risk_paragraphs": _paragraphs(risk_text),
        "mda_paragraphs": _paragraphs(mda_text),
        "risk_page": risk_page,
        "mda_page": mda_page,
        "source": path.name,
    }


def filing_paths_for_ticker(ticker: str) -> tuple[Path | None, Path | None]:
    meta = TICKER_FILINGS.get(ticker.upper())
    if not meta:
        return None, None
    current = SAMPLE_DIR / meta["current"]
    prior = SAMPLE_DIR / meta["prior"]
    return (
        current if current.exists() else None,
        prior if prior.exists() else None,
    )


def extract_ticker_pair(ticker: str) -> dict[str, Any] | None:
    current_path, prior_path = filing_paths_for_ticker(ticker)
    if not current_path:
        return None
    current = extract_sections_from_pdf(current_path)
    prior = extract_sections_from_pdf(prior_path) if prior_path else None
    return {
        "ticker": ticker.upper(),
        "current": current,
        "prior": prior,
        "current_path": str(current_path),
        "prior_path": str(prior_path) if prior_path else None,
    }
