// 1. Multichain RPC Registry
// We use public nodes. If one fails, your logic should rotate to the next.
export const RPC_CONFIG: Record<string, string[]> = {
  ETHEREUM: ["https://eth.drpc.org", "https://ethereum-rpc.publicnode.com"],
  MONAD: ["https://testnet-rpc.monad.xyz"],
  LINEA: ["https://rpc.linea.build", "https://linea.drpc.org"],
  BASE: ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
  STARKNET: ["https://starknet-mainnet.public.blastapi.io"]
};

/**
 * RESEARCHER LOGIC: getHottestContract
 * This function pulls the latest block and calculates which contract 
 * is "burning" the most gas. This serves as our proxy for "Real-Time Visits."
 */
export async function getHottestContract(rpcUrl: string) {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: 'eth_getBlockByNumber',
        params: ['latest', true], // 'true' pulls full transaction objects
        id: 1
      })
    });

    const data = await response.json();

    if (!data.result || !data.result.transactions) {
      throw new Error("Invalid block data or no transactions found.");
    }

    const transactions = data.result.transactions;
    const gasMap: Record<string, bigint> = {};

    transactions.forEach((tx: any) => {
      if (tx.to) {
        // Calculate Gas Burn: (Gas Used) * (Gas Price)
        // We use BigInt because blockchain numbers are too large for standard JS numbers
        const gasLimit = BigInt(tx.gas);
        const gasPrice = BigInt(tx.gasPrice || 0);
        const totalBurn = gasLimit * gasPrice;

        gasMap[tx.to] = (gasMap[tx.to] || 0n) + totalBurn;
      }
    });

    // Sort by highest burn and return the top contract address and its total burn
    const sorted = Object.entries(gasMap).sort(([, a], [, b]) => (b > a ? 1 : -1));
    
    return sorted.length > 0 ? sorted[0] : null;

  } catch (error) {
    console.error(`Scanner Error on ${rpcUrl}:`, error);
    return null;
  }
}

/**
 * HELPER: Formats BigInt gas values into a readable 'Gwei' or 'ETH' string
 */
export function formatGas(burn: bigint): string {
  return (Number(burn) / 1e18).toFixed(4) + " ETH Units";
}