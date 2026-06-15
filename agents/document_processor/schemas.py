"""Document chunk schemas."""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


class SectionType(str, Enum):
    NARRATIVE = "narrative"
    FINANCIAL_TABLE = "financial_table"
    RISK_FACTOR = "risk_factor"
    LEGAL = "legal"
    FOOTNOTE = "footnote"


class DocumentChunk(BaseModel):
    id: str
    text: str
    document_id: str
    section_name: str
    section_type: SectionType = SectionType.NARRATIVE
    page_number: int = 1
    chunk_index: int = 0
    metadata: dict[str, Any] = Field(default_factory=dict)

    def to_vector_metadata(self) -> dict[str, Any]:
        return {
            "document_id": self.document_id,
            "section_name": self.section_name,
            "section_type": self.section_type.value,
            "page_number": self.page_number,
            "chunk_index": self.chunk_index,
        }


class CompanyOverview(BaseModel):
    name: str = "Unknown Company"
    industry: str = "Unknown"
    headquarters: str = "Unknown"
    employees: Optional[str] = None
    founded: Optional[str] = None
    stock_ticker: Optional[str] = None


class ProcessingResult(BaseModel):
    document_id: str
    total_pages: int
    total_chunks: int
    company_overview: CompanyOverview
    sections: list[str] = Field(default_factory=list)
    tables: list[dict[str, Any]] = Field(default_factory=list)
