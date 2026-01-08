"""Sync job for contract activity."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional

from backend.decoder import decode_event, decode_function_call
from backend.rpc.tempo_client import ContractMetadata, TempoClient
from backend.storage import Storage


@dataclass
class SyncResult:
    contract: ContractMetadata
    blocks_synced: List[int]
    logs_processed: int
    transactions_processed: int


def _normalize_address(address: str) -> str:
    return address.lower()


def sync_recent_blocks(
    client: TempoClient,
    storage: Storage,
    address: str,
    blocks: int,
) -> SyncResult:
    normalized_address = _normalize_address(address)
    latest = client.get_block_number()
    from_block = max(latest - blocks + 1, 0)

    storage.migrate()
    contract = client.fetch_contract_metadata(normalized_address)
    storage.upsert_contract(
        address=contract.address,
        abi=contract.abi,
        metadata=contract.metadata,
        source_info=contract.source,
        code=contract.code,
    )

    logs = client.get_logs(normalized_address, from_block, latest)
    logs_processed = 0
    for log in logs:
        decoded_event = decode_event(contract.abi, log)
        storage.insert_event(
            tx_hash=log.get("transactionHash"),
            event_name=decoded_event.name or log.get("topics", [None])[0] or "unknown",
            decoded_fields=decoded_event.fields,
        )
        logs_processed += 1

    transactions_processed = 0
    blocks_synced: List[int] = []
    for block_number in range(from_block, latest + 1):
        block = client.get_block_by_number(block_number, full_transactions=True)
        blocks_synced.append(block_number)
        for tx in block.get("transactions", []):
            to_address = tx.get("to")
            decoded_function = None
            decoded_args: Optional[Dict[str, Any]] = None
            if to_address and _normalize_address(to_address) == normalized_address:
                decoded = decode_function_call(contract.abi, tx.get("input", ""))
                decoded_function = decoded.function
                decoded_args = decoded.args
            storage.upsert_transaction(
                tx_hash=tx.get("hash"),
                block_number=block_number,
                from_address=tx.get("from"),
                to_address=to_address,
                input_data=tx.get("input", ""),
                decoded_function=decoded_function,
                decoded_args=decoded_args,
            )
            transactions_processed += 1

    return SyncResult(
        contract=contract,
        blocks_synced=blocks_synced,
        logs_processed=logs_processed,
        transactions_processed=transactions_processed,
    )


