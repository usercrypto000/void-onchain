export const dynamic = 'force-dynamic';




import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// This connects to the credentials you put in .env.local
const redis = Redis.fromEnv();

// Map of known contract addresses to names
const PROTOCOL_MAP: Record<string, { name: string; icon: string }> = {
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad": { name: "Uniswap Universal", icon: "🦄" },
  "0xef1c6e67703c7bd7107eed8303fbe6ec2554ee6b": { name: "Uniswap V3", icon: "🦄" },
  "0x1111111254fb6c44bac0bed2854e76f90643097d": { name: "1inch Aggregator", icon: "🔀" },
  "0x4752ba5dbc23f44d82123f0f6739aee0c9f45a60": { name: "Base Swap", icon: "🔵" },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // These are the chains we are monitoring in Redis
    const chains = ['ethereum', 'base', 'arbitrum', 'linea'];
    
    const allData = await Promise.all(
      chains.map(async (c) => {
        // Fetches the top 10 items from the Sorted Set in Redis
        const data = await redis.zrange(`${c}:hot`, 0, 9, {
          rev: true,
          withScores: true
        });
        return { chain: c, data };
      })
    );

    const merged: any[] = [];

    // Format the raw Redis data into something the UI can use
    for (const { chain, data } of allData) {
      for (let i = 0; i < data.length; i += 2) {
        const address = data[i] as string;
        const gasScore = data[i + 1] as number;
        const protocol = PROTOCOL_MAP[address.toLowerCase()];

        merged.push({
          address,
          displayGas: formatGas(BigInt(gasScore)),
          gasValue: gasScore,
          chain: chain.toUpperCase(),
          name: protocol?.name || `Contract ${address.slice(0, 6)}...`,
          icon: protocol?.icon || (chain === 'base' ? '🔵' : '💠')
        });
      }
    }

    // Sort the entire list so the absolute highest gas burner is #1
    merged.sort((a, b) => Number(b.gasValue) - Number(a.gasValue));

    return NextResponse.json({ dapps: merged.slice(0, limit) });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatGas(gas: bigint): string {
  const eth = Number(gas) / 1e18;
  if (eth >= 1) return `${eth.toFixed(4)} ETH`;
  if (eth >= 0.001) return `${(eth * 1000).toFixed(2)} mETH`;
  return `${(eth * 1e6).toFixed(0)} gwei`;
}