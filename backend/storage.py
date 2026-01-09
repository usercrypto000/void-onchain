"""Persistence layer for onchain artifacts."""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, Optional


@dataclass
class StorageConfig:
    url: str


class Storage:
    def __init__(self, config: StorageConfig) -> None:
        self.config = config
        self._conn: Optional[sqlite3.Connection] = None

    def connect(self) -> sqlite3.Connection:
        if self._conn is None:
            path = Path(self.config.url)
            path.parent.mkdir(parents=True, exist_ok=True)
            self._conn = sqlite3.connect(path)
            self._conn.row_factory = sqlite3.Row
        return self._conn

    def close(self) -> None:
        if self._conn is not None:
            self._conn.close()
            self._conn = None

    def migrate(self) -> None:
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS contracts (
                address TEXT PRIMARY KEY,
                abi TEXT,
                metadata TEXT,
                source_info TEXT,
                code TEXT
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                hash TEXT PRIMARY KEY,
                block_number INTEGER,
                from_address TEXT,
                to_address TEXT,
                input TEXT,
                decoded_function TEXT,
                decoded_args TEXT
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_hash TEXT,
                event_name TEXT,
                decoded_fields TEXT
            )
            """
        )
        conn.commit()

    def upsert_contract(
        self,
        address: str,
        abi: Optional[Iterable[Dict[str, Any]]],
        metadata: Dict[str, Any],
        source_info: Dict[str, Any],
        code: str,
    ) -> None:
        conn = self.connect()
        conn.execute(
            """
            INSERT INTO contracts (address, abi, metadata, source_info, code)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(address) DO UPDATE SET
                abi=excluded.abi,
                metadata=excluded.metadata,
                source_info=excluded.source_info,
                code=excluded.code
            """,
            (
                address,
                json.dumps(list(abi) if abi else None),
                json.dumps(metadata),
                json.dumps(source_info),
                code,
            ),
        )
        conn.commit()

    def upsert_transaction(
        self,
        tx_hash: str,
        block_number: int,
        from_address: str,
        to_address: Optional[str],
        input_data: str,
        decoded_function: Optional[str],
        decoded_args: Optional[Dict[str, Any]],
    ) -> None:
        conn = self.connect()
        conn.execute(
            """
            INSERT INTO transactions (
                hash, block_number, from_address, to_address, input, decoded_function, decoded_args
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(hash) DO UPDATE SET
                block_number=excluded.block_number,
                from_address=excluded.from_address,
                to_address=excluded.to_address,
                input=excluded.input,
                decoded_function=excluded.decoded_function,
                decoded_args=excluded.decoded_args
            """,
            (
                tx_hash,
                block_number,
                from_address,
                to_address,
                input_data,
                decoded_function,
                json.dumps(decoded_args) if decoded_args is not None else None,
            ),
        )
        conn.commit()

    def insert_event(
        self,
        tx_hash: str,
        event_name: str,
        decoded_fields: Optional[Dict[str, Any]],
    ) -> None:
        conn = self.connect()
        conn.execute(
            """
            INSERT INTO events (tx_hash, event_name, decoded_fields)
            VALUES (?, ?, ?)
            """,
            (tx_hash, event_name, json.dumps(decoded_fields) if decoded_fields is not None else None),
        )
        conn.commit()


