'use client';

import React, { useEffect, useState } from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CoinOverviewFallback } from './fallback';
import CandlestickChart from '@/components/CandlestickChart';

const CoinOverview = () => {
  const [coin, setCoin] = useState<CoinDetailsData | null>(null);
  const [coinOHLCData, setCoinOHLCData] = useState<OHLCData[]>([]);
  const [liveInterval, setLiveInterval] = useState<'1s' | '1m'>('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinData, ohlcData] = await Promise.all([
          fetcher<CoinDetailsData>('/coins/bitcoin', {
            dex_pair_format: 'symbol',
          }),
          fetcher<OHLCData[]>('/coins/bitcoin/ohlc', {
            vs_currency: 'usd',
            days: 1,
            precision: 'full',
          }),
        ]);
        setCoin(coinData);
        setCoinOHLCData(ohlcData);
      } catch (error) {
        console.error('Error fetching coin overview:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <CoinOverviewFallback />;
  }

  if (error || !coin) {
    return <CoinOverviewFallback />;
  }

  return (
    <div id="coin-overview">
      <CandlestickChart
        data={coinOHLCData}
        coinId="bitcoin"
        liveInterval={liveInterval}
        setLiveInterval={setLiveInterval}
      >
        <div className="header pt-2">
          <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
          <div className="info">
            <p>
              {coin.name} / {coin.symbol.toUpperCase()}
            </p>
            <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
          </div>
        </div>
      </CandlestickChart>
    </div>
  );
};

export default CoinOverview;