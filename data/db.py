"""SQLite database setup and models for Diligence AI."""

from __future__ import annotations

import json
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Generator, Optional

DB_PATH = Path(__file__).resolve().parent.parent / "diligence.db"


def _utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_session() -> Generator[sqlite3.Connection, None, None]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with db_session() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                company_name TEXT,
                document_type TEXT DEFAULT 'other',
                filing_year INTEGER,
                total_pages INTEGER DEFAULT 0,
                total_chunks INTEGER DEFAULT 0,
                upload_timestamp TEXT NOT NULL,
                processing_status TEXT DEFAULT 'uploaded',
                processing_time_seconds REAL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS analysis_results (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL UNIQUE,
                executive_summary TEXT,
                company_overview TEXT,
                financial_metrics TEXT,
                risk_assessment TEXT,
                strategic_insights TEXT,
                recommendations TEXT,
                red_flags TEXT,
                industry_benchmarks TEXT,
                data_quality_score REAL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS qa_interactions (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                sources TEXT,
                ragas_scores TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS agent_logs (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                action TEXT NOT NULL,
                input_summary TEXT,
                output_summary TEXT,
                duration_seconds REAL DEFAULT 0,
                tokens_used INTEGER DEFAULT 0,
                status TEXT DEFAULT 'started',
                error_message TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
            );
            """
        )


def _json_dumps(obj: Any) -> str:
    return json.dumps(obj, default=str)


def _json_loads(raw: Optional[str], default: Any = None) -> Any:
    if raw is None:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return default


# --- Document CRUD ---


def create_document(
    filename: str,
    document_id: Optional[str] = None,
    document_type: str = "other",
) -> str:
    doc_id = document_id or str(uuid.uuid4())
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO documents (id, filename, upload_timestamp, processing_status, document_type)
            VALUES (?, ?, ?, 'uploaded', ?)
            """,
            (doc_id, filename, _utcnow(), document_type),
        )
    return doc_id


def update_document(document_id: str, **fields: Any) -> None:
    allowed = {
        "company_name", "document_type", "filing_year", "total_pages",
        "total_chunks", "processing_status", "processing_time_seconds", "filename",
    }
    updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
    if not updates:
        return
    cols = ", ".join(f"{k} = ?" for k in updates)
    vals = list(updates.values()) + [document_id]
    with db_session() as conn:
        conn.execute(f"UPDATE documents SET {cols} WHERE id = ?", vals)


def get_document(document_id: str) -> Optional[dict[str, Any]]:
    with db_session() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
    return dict(row) if row else None


def list_documents(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT d.*, a.data_quality_score, a.executive_summary
            FROM documents d
            LEFT JOIN analysis_results a ON d.id = a.document_id
            ORDER BY d.upload_timestamp DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()
    return [dict(r) for r in rows]


def delete_document(document_id: str) -> bool:
    with db_session() as conn:
        cur = conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    return cur.rowcount > 0


# --- Analysis CRUD ---


def save_analysis(document_id: str, report: dict[str, Any]) -> str:
    analysis_id = str(uuid.uuid4())
    with db_session() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO analysis_results
            (id, document_id, executive_summary, company_overview, financial_metrics,
             risk_assessment, strategic_insights, recommendations, red_flags,
             industry_benchmarks, data_quality_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                analysis_id,
                document_id,
                report.get("executive_summary", ""),
                _json_dumps(report.get("company_overview", {})),
                _json_dumps(report.get("financial_analysis", report.get("financial_metrics", []))),
                _json_dumps(report.get("risk_assessment", [])),
                _json_dumps(report.get("strategic_insights", [])),
                _json_dumps(report.get("recommendations", [])),
                _json_dumps(report.get("red_flags", [])),
                _json_dumps(report.get("industry_benchmarks", [])),
                report.get("data_quality_score", 0),
                _utcnow(),
            ),
        )
        conn.execute(
            "UPDATE documents SET processing_status = 'complete' WHERE id = ?",
            (document_id,),
        )
    return analysis_id


def get_analysis(document_id: str) -> Optional[dict[str, Any]]:
    with db_session() as conn:
        row = conn.execute(
            "SELECT * FROM analysis_results WHERE document_id = ?", (document_id,)
        ).fetchone()
    if not row:
        return None
    result = dict(row)
    for field in (
        "company_overview", "financial_metrics", "risk_assessment",
        "strategic_insights", "recommendations", "red_flags", "industry_benchmarks",
    ):
        result[field] = _json_loads(result.get(field), default=[] if field != "company_overview" else {})
    return result


# --- QA CRUD ---


def save_qa_interaction(
    document_id: str,
    question: str,
    answer: str,
    sources: list[dict],
    ragas_scores: dict,
) -> str:
    qa_id = str(uuid.uuid4())
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO qa_interactions (id, document_id, question, answer, sources, ragas_scores, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (qa_id, document_id, question, answer, _json_dumps(sources), _json_dumps(ragas_scores), _utcnow()),
        )
    return qa_id


def list_qa_interactions(document_id: str) -> list[dict[str, Any]]:
    with db_session() as conn:
        rows = conn.execute(
            "SELECT * FROM qa_interactions WHERE document_id = ? ORDER BY created_at DESC",
            (document_id,),
        ).fetchall()
    results = []
    for row in rows:
        r = dict(row)
        r["sources"] = _json_loads(r.get("sources"), [])
        r["ragas_scores"] = _json_loads(r.get("ragas_scores"), {})
        results.append(r)
    return results


# --- Agent Logs ---


def log_agent_action(
    document_id: str,
    agent_name: str,
    action: str,
    input_summary: str = "",
    output_summary: str = "",
    duration_seconds: float = 0,
    tokens_used: int = 0,
    status: str = "completed",
    error_message: Optional[str] = None,
) -> str:
    log_id = str(uuid.uuid4())
    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO agent_logs
            (id, document_id, agent_name, action, input_summary, output_summary,
             duration_seconds, tokens_used, status, error_message, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_id, document_id, agent_name, action, input_summary, output_summary,
                duration_seconds, tokens_used, status, error_message, _utcnow(),
            ),
        )
    return log_id


def get_agent_logs(document_id: str, agent_name: Optional[str] = None) -> list[dict[str, Any]]:
    with db_session() as conn:
        if agent_name:
            rows = conn.execute(
                "SELECT * FROM agent_logs WHERE document_id = ? AND agent_name = ? ORDER BY timestamp",
                (document_id, agent_name),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM agent_logs WHERE document_id = ? ORDER BY timestamp",
                (document_id,),
            ).fetchall()
    return [dict(r) for r in rows]
