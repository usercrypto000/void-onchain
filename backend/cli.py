"""CLI entrypoint for Tempo sync."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.rpc.tempo_client import TempoClient
from backend.storage import Storage, StorageConfig
from backend.sync import sync_recent_blocks


def _load_abi(path: Optional[str]) -> Optional[List[Dict[str, Any]]]:
    if not path:
        return None
    data = json.loads(Path(path).read_text())
    if isinstance(data, dict) and "abi" in data:
        return data["abi"]
    if isinstance(data, list):
        return data
    raise ValueError("ABI file must contain a list or an object with an 'abi' field")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Sync recent blocks for a contract")
    parser.add_argument("--rpc-url", required=True, help="Tempo JSON-RPC endpoint")
    parser.add_argument("--address", required=True, help="Contract address")
    parser.add_argument("--blocks", type=int, default=100, help="Number of recent blocks to sync")
    parser.add_argument("--db", default="data/onchain.db", help="SQLite database path")
    parser.add_argument("--abi", help="Path to contract ABI JSON (optional)")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    abi = _load_abi(args.abi)
    resolver = (lambda _address: abi) if abi else None

    client = TempoClient(args.rpc_url, abi_resolver=resolver)
    storage = Storage(StorageConfig(url=args.db))

    result = sync_recent_blocks(client, storage, args.address, args.blocks)
    print(
        json.dumps(
            {
                "contract": result.contract.address,
                "blocks_synced": result.blocks_synced,
                "logs_processed": result.logs_processed,
                "transactions_processed": result.transactions_processed,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

