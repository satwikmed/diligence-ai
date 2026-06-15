"""Download real SEC EDGAR 10-K filings and convert to PDF for demo use."""

from __future__ import annotations

import re
import sys
import textwrap
import time
from html.parser import HTMLParser
from io import StringIO
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_DIR = ROOT / "data" / "sample_docs"

SEC_USER_AGENT = "DiligenceAI/1.0 (demo; contact@diligence-ai.local)"

# Well-known large cap + mid-cap variety for consulting demos
COMPANIES = [
    {
        "cik": 320193,
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "output": "AAPL_10K_FY2024.pdf",
    },
    {
        "cik": 789019,
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "output": "MSFT_10K_FY2024.pdf",
    },
    {
        "cik": 1108524,
        "ticker": "CRM",
        "name": "Salesforce, Inc.",
        "output": "CRM_10K_FY2024.pdf",
    },
]


class _HTMLTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._chunks: list[str] = []
        self._skip = False

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"script", "style", "head"}:
            self._skip = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "head", "p", "div", "br", "tr", "h1", "h2", "h3", "li"}:
            self._chunks.append("\n")
        if tag in {"script", "style", "head"}:
            self._skip = False

    def handle_data(self, data: str) -> None:
        if not self._skip and data.strip():
            self._chunks.append(data.strip() + " ")

    def text(self) -> str:
        raw = "".join(self._chunks)
        raw = re.sub(r"\s+", " ", raw)
        raw = re.sub(r"\n\s+", "\n", raw)
        return raw.strip()


def _sec_get(url: str) -> str:
    req = Request(url, headers={"User-Agent": SEC_USER_AGENT})
    with urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", errors="replace")


def _latest_10k(cik: int) -> tuple[str, str, str]:
    """Return accession, primary document filename, filing date."""
    cik_padded = f"{cik:010d}"
    url = f"https://data.sec.gov/submissions/CIK{cik_padded}.json"
    import json

    data = json.loads(_sec_get(url))
    forms = data["filings"]["recent"]["form"]
    accessions = data["filings"]["recent"]["accessionNumber"]
    primaries = data["filings"]["recent"]["primaryDocument"]
    dates = data["filings"]["recent"]["filingDate"]
    for i, form in enumerate(forms):
        if form == "10-K":
            return accessions[i], primaries[i], dates[i]
    raise ValueError(f"No 10-K found for CIK {cik}")


def _download_10k_text(cik: int) -> tuple[str, str, str]:
    accession, primary, filing_date = _latest_10k(cik)
    accession_path = accession.replace("-", "")
    url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_path}/{primary}"
    html = _sec_get(url)
    parser = _HTMLTextExtractor()
    parser.feed(html)
    return parser.text(), filing_date, url


def _html_to_pdf(text: str, output: Path, title: str, source_url: str) -> None:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=letter)
    width, height = letter
    left, top, bottom = 50, height - 50, 50
    line_height = 11
    max_chars = 95

    header = [
        title,
        f"Source: {source_url}",
        "Public filing from SEC EDGAR (for due diligence demo purposes)",
        "",
    ]
    lines: list[str] = []
    for h in header:
        lines.extend(textwrap.wrap(h, width=max_chars) or [""])
    lines.append("")

    # Cap text to keep PDFs manageable on 8GB machines (~80 pages)
    words = text.split()
    text = " ".join(words[:12000])
    for paragraph in text.split("\n"):
        paragraph = paragraph.strip()
        if not paragraph:
            lines.append("")
            continue
        lines.extend(textwrap.wrap(paragraph, width=max_chars) or [""])

    y = top
    for line in lines:
        if y < bottom:
            c.showPage()
            y = top
        c.setFont("Helvetica", 9)
        c.drawString(left, y, line[:max_chars])
        y -= line_height

    c.save()


def download_all(force: bool = False) -> list[Path]:
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []

    for company in COMPANIES:
        out = SAMPLE_DIR / company["output"]
        if out.exists() and not force and out.stat().st_size > 10_000:
            print(f"  Skip (exists): {out.name}")
            saved.append(out)
            continue

        print(f"  Downloading {company['name']} ({company['ticker']}) from SEC EDGAR...")
        try:
            text, filing_date, source_url = _download_10k_text(company["cik"])
            title = f"{company['name']} ({company['ticker']}) — Form 10-K — Filed {filing_date}"
            _html_to_pdf(text, out, title, source_url)
            print(f"  Saved: {out.name} ({out.stat().st_size // 1024} KB)")
            saved.append(out)
        except Exception as e:
            print(f"  Failed {company['ticker']}: {e}")
        time.sleep(0.2)  # SEC fair access

    return saved


def main() -> None:
    force = "--force" in sys.argv
    print("Downloading sample 10-K filings from SEC EDGAR...")
    files = download_all(force=force)
    print(f"\nDone. {len(files)} files in {SAMPLE_DIR}")
    for f in files:
        print(f"  - {f.name}")


if __name__ == "__main__":
    main()
