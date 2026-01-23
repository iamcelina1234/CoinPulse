'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL) throw new Error('Could not get base url');
if (!API_KEY) throw new Error('Could not get api key');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60,
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': API_KEY,
      'accept': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}));
    const errorMessage = `API Error: ${response.status}: ${errorBody.error || response.statusText}`;
    console.warn(errorMessage, { endpoint, status: response.status });
    throw new Error(errorMessage);
  }

  return response.json();
}


// 🔍 SEARCH COINS (FOR SEARCH MODAL)
export async function searchCoins(query: string): Promise<SearchCoin[]> {
  if (!query) return [];

  const data = await fetcher<{
    coins: {
      id: string;
      name: string;
      symbol: string;
      thumb: string;
      data?: {
        price?: number;
        price_change_percentage_24h?: number;
      };
    }[];
  }>('search', { query }, 30);

  return data.coins.map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    thumb: c.thumb,
    market_cap_rank: null,
    large: c.thumb,
    data: {
      price: c.data?.price,
      price_change_percentage_24h: c.data?.price_change_percentage_24h ?? 0,
    },
  }));
} 


export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null,
): Promise<PoolData> {
  const fallback: PoolData = {
    id: '',
    address: '',
    name: '',
    network: '',
  };

  if (network && contractAddress) {
    try {
      const poolData = await fetcher<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`,
      );

      return poolData.data?.[0] ?? fallback;
    } catch (error) {
      console.warn(`Failed to fetch pools for network ${network}:`, error);
      // Continue to fallback method
    }
  }

  try {
    const poolData = await fetcher<{ data: PoolData[] }>('/onchain/search/pools', { query: id });
    return poolData.data?.[0] ?? fallback;
  } catch (error) {
    console.warn(`Failed to fetch pools for coin ${id}:`, error);
    return fallback;
  }
}