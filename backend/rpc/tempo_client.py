"""Tempo JSON-RPC client utilities."""

from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, List, Optional

import urllib.request


JsonRpcResponse = Dict[str, Any]


@dataclass
class ContractMetadata:
    address: str
    code: str
    abi: Optional[List[Dict[str, Any]]]
    metadata: Dict[str, Any]
    source: Dict[str, Any]


class TempoClient:
    """Lightweight JSON-RPC client for Tempo/Ethereum-compatible nodes."""

    def __init__(
        self,
        rpc_url: str,
        timeout_s: int = 30,
        abi_resolver: Optional[Callable[[str], Optional[List[Dict[str, Any]]]]] = None,
    ) -> None:
        self.rpc_url = rpc_url
        self.timeout_s = timeout_s
        self.abi_resolver = abi_resolver

    def _request(self, method: str, params: Iterable[Any]) -> Any:
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": method,
            "params": list(params),
        }
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(self.rpc_url, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=self.timeout_s) as response:
            raw = response.read()
        decoded: JsonRpcResponse = json.loads(raw)
        if "error" in decoded:
            raise RuntimeError(f"RPC error for {method}: {decoded['error']}")
        return decoded["result"]

    def get_block_number(self) -> int:
        result = self._request("eth_blockNumber", [])
        return int(result, 16)

    def get_code(self, address: str, block: str = "latest") -> str:
        return self._request("eth_getCode", [address, block])

    def get_logs(self, address: str, from_block: int, to_block: int) -> List[Dict[str, Any]]:
        params = {
            "address": address,
            "fromBlock": hex(from_block),
            "toBlock": hex(to_block),
        }
        return self._request("eth_getLogs", [params])

    def get_block_by_number(self, block_number: int, full_transactions: bool = True) -> Dict[str, Any]:
        return self._request("eth_getBlockByNumber", [hex(block_number), full_transactions])

    def get_transaction_receipt(self, tx_hash: str) -> Dict[str, Any]:
        return self._request("eth_getTransactionReceipt", [tx_hash])

    def fetch_contract_metadata(self, address: str) -> ContractMetadata:
        code = self.get_code(address)
        abi = self.abi_resolver(address) if self.abi_resolver else None
        metadata = {"verified": bool(abi)}
        source = {"provider": "abi_resolver" if abi else "rpc"}
        return ContractMetadata(address=address, code=code, abi=abi, metadata=metadata, source=source)


