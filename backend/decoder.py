"""ABI decoding helpers with graceful fallback."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple


try:
    from eth_abi import decode as eth_decode
    from eth_utils import keccak
except ImportError:  # pragma: no cover - optional dependency
    eth_decode = None
    keccak = None


@dataclass
class DecodedCall:
    function: Optional[str]
    args: Optional[Dict[str, Any]]


@dataclass
class DecodedEvent:
    name: Optional[str]
    fields: Optional[Dict[str, Any]]


def _normalize_types(inputs: Iterable[Dict[str, Any]]) -> List[str]:
    return [item["type"] for item in inputs]


def _selector(signature: str) -> Optional[bytes]:
    if keccak is None:
        return None
    return keccak(text=signature)[:4]


def _signature(name: str, inputs: Iterable[Dict[str, Any]]) -> str:
    return f"{name}({','.join(_normalize_types(inputs))})"


def decode_function_call(abi: Optional[List[Dict[str, Any]]], input_data: str) -> DecodedCall:
    if not abi or not input_data or input_data == "0x":
        return DecodedCall(function=None, args=None)
    if eth_decode is None or keccak is None:
        return DecodedCall(function=None, args=None)

    selector = bytes.fromhex(input_data[2:10]) if input_data.startswith("0x") else bytes.fromhex(input_data[:8])
    payload = bytes.fromhex(input_data[10:]) if input_data.startswith("0x") else bytes.fromhex(input_data[8:])

    for item in abi:
        if item.get("type") != "function":
            continue
        inputs = item.get("inputs", [])
        signature = _signature(item["name"], inputs)
        sig_selector = _selector(signature)
        if sig_selector is None or sig_selector != selector:
            continue
        types = _normalize_types(inputs)
        decoded_values = eth_decode(types, payload) if types else []
        decoded_args = {inp.get("name") or f"arg{idx}": value for idx, (inp, value) in enumerate(zip(inputs, decoded_values))}
        return DecodedCall(function=item["name"], args=decoded_args)
    return DecodedCall(function=None, args=None)


def decode_event(abi: Optional[List[Dict[str, Any]]], log: Dict[str, Any]) -> DecodedEvent:
    if not abi:
        return DecodedEvent(name=None, fields=None)
    if eth_decode is None or keccak is None:
        return DecodedEvent(name=None, fields=None)
    topics = log.get("topics", [])
    if not topics:
        return DecodedEvent(name=None, fields=None)
    topic0 = bytes.fromhex(topics[0][2:])

    for item in abi:
        if item.get("type") != "event":
            continue
        inputs = item.get("inputs", [])
        signature = _signature(item["name"], inputs)
        sig_hash = keccak(text=signature)
        if sig_hash != topic0:
            continue
        non_indexed_inputs = [inp for inp in inputs if not inp.get("indexed")]
        types = _normalize_types(non_indexed_inputs)
        data_bytes = bytes.fromhex(log.get("data", "0x")[2:]) if log.get("data") else b""
        decoded_values = eth_decode(types, data_bytes) if types else []
        decoded_fields = {
            inp.get("name") or f"field{idx}": value
            for idx, (inp, value) in enumerate(zip(non_indexed_inputs, decoded_values))
        }
        return DecodedEvent(name=item["name"], fields=decoded_fields)
    return DecodedEvent(name=None, fields=None)


