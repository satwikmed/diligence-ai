"""Document processor agent - main entry point."""

from __future__ import annotations

import time
from pathlib import Path
from typing import Any, Callable, Optional

from agents.document_processor.embedder import embed_and_index
from agents.document_processor.processor import (
    chunk_section,
    detect_document_type,
    extract_company_overview,
    identify_sections,
    parse_pdf,
)
from agents.document_processor.schemas import ProcessingResult
from data.db import log_agent_action, update_document
from orchestrator.events import emit_ws


async def process(
    file_path: str,
    document_id: str,
    emit: Optional[Callable] = None,
) -> ProcessingResult:
    """Full document processing pipeline."""
    start = time.time()
    _emit = emit or (lambda msg, **kw: emit_ws(document_id, msg, **kw))

    async def log(action: str, msg: str, **kwargs):
        await _emit(msg, agent="document_processor", **kwargs)
        log_agent_action(document_id, "document_processor", action, output_summary=msg)

    update_document(document_id, processing_status="processing")
    await log("parse", "Parsing document...")

    full_text, tables, total_pages = parse_pdf(file_path)
    await log("tables", f"Extracting tables... Found {len(tables)} tables")

    update_document(document_id, processing_status="chunking")
    await log("chunk", "Chunking by section...")

    sections = identify_sections(full_text)
    all_chunks = []
    idx = 0
    for section_name, section_text, section_type in sections:
        section_chunks = chunk_section(document_id, section_name, section_text, section_type, idx)
        all_chunks.extend(section_chunks)
        idx += len(section_chunks)

    await log("embed", f"Embedding {len(all_chunks)} chunks...")
    update_document(document_id, processing_status="embedding")
    embed_and_index(document_id, all_chunks)

    overview = extract_company_overview(full_text[:8000], document_id)
    doc_type, filing_year = detect_document_type(Path(file_path).name, full_text)

    elapsed = time.time() - start
    update_document(
        document_id,
        processing_status="analyzing",
        company_name=overview.name,
        document_type=doc_type,
        filing_year=filing_year,
        total_pages=total_pages,
        total_chunks=len(all_chunks),
        processing_time_seconds=elapsed,
    )

    await log("complete", f"Document processing complete. {len(all_chunks)} chunks indexed.")

    return ProcessingResult(
        document_id=document_id,
        total_pages=total_pages,
        total_chunks=len(all_chunks),
        company_overview=overview,
        sections=[s[0] for s in sections],
        tables=tables,
    )
