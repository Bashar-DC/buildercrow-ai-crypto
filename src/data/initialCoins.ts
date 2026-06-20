export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  category: 'Layer 1' | 'DeFi' | 'Meme' | 'Layer 2';
  rank: number;
  iconColor: string;
}

export const INITIAL_COINS: Coin[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 94250.00,
    change24h: 3.42,
    high24h: 95100.00,
    low24h: 91120.00,
    marketCap: 1850000000000,
    volume24h: 42100000000,
    sparkline: [91120, 91500, 92100, 91800, 92900, 93400, 94250],
    category: 'Layer 1',
    rank: 1,
    iconColor: 'bg-amber-500 text-amber-950'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3420.50,
    change24h: -1.24,
    high24h: 3510.00,
    low24h: 3380.00,
    marketCap: 410000000000,
    volume24h: 18500000000,
    sparkline: [3510, 3490, 3470, 3440, 3450, 3400, 3420.5],
    category: 'Layer 1',
    rank: 2,
    iconColor: 'bg-indigo-500 text-indigo-950'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    price: 184.25,
    change24h: 8.71,
    high24h: 186.50,
    low24h: 169.10,
    marketCap: 85000000000,
    volume24h: 4900000000,
    sparkline: [169.1, 172.4, 171.0, 176.8, 179.9, 182.1, 184.25],
    category: 'Layer 1',
    rank: 3,
    iconColor: 'bg-purple-500 text-purple-950'
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
    price: 588.40,
    change24h: 0.15,
    high24h: 592.00,
    low24h: 581.50,
    marketCap: 87000000000,
    volume24h: 1100000000,
    sparkline: [581.5, 584.0, 587.2, 582.1, 589.0, 586.4, 588.4],
    category: 'Layer 1',
    rank: 4,
    iconColor: 'bg-yellow-500 text-yellow-950'
  },
  {
    id: 'ripple',
    name: 'Ripple',
    symbol: 'XRP',
    price: 1.14,
    change24h: -2.31,
    high24h: 1.21,
    low24h: 1.11,
    marketCap: 65000000000,
    volume24h: 3200000000,
    sparkline: [1.21, 1.18, 1.17, 1.15, 1.16, 1.13, 1.14],
    category: 'Layer 1',
    rank: 5,
    iconColor: 'bg-sky-500 text-sky-950'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    price: 0.765,
    change24h: 5.64,
    high24h: 0.780,
    low24h: 0.712,
    marketCap: 27000000000,
    volume24h: 840000000,
    sparkline: [0.712, 0.725, 0.731, 0.742, 0.755, 0.750, 0.765],
    category: 'Layer 1',
    rank: 6,
    iconColor: 'bg-blue-600 text-blue-95'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.384,
    change24h: 14.21,
    high24h: 0.395,
    low24h: 0.331,
    marketCap: 56000000000,
    volume24h: 7100000000,
    sparkline: [0.331, 0.342, 0.355, 0.340, 0.362, 0.375, 0.384],
    category: 'Meme',
    rank: 7,
    iconColor: 'bg-orange-400 text-orange-950'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    price: 18.15,
    change24h: -1.45,
    high24h: 18.80,
    low24h: 17.90,
    marketCap: 11000000000,
    volume24h: 420000000,
    sparkline: [18.8, 18.6, 18.4, 18.1, 18.3, 18.0, 18.15],
    category: 'DeFi',
    rank: 8,
    iconColor: 'bg-blue-700 text-blue-50'
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    symbol: 'UNI',
    price: 9.85,
    change24h: 2.15,
    high24h: 10.10,
    low24h: 9.50,
    marketCap: 5900000000,
    volume24h: 230000000,
    sparkline: [9.5, 9.6, 9.8, 9.7, 9.9, 9.8, 9.85],
    category: 'DeFi',
    rank: 9,
    iconColor: 'bg-pink-500 text-pink-950'
  },
  {
    id: 'pepe',
    name: 'Pepe',
    symbol: 'PEPE',
    price: 0.00001850,
    change24h: 22.84,
    high24h: 0.00001950,
    low24h: 0.00001480,
    marketCap: 7800000000,
    volume24h: 1950000000,
    sparkline: [0.00001480, 0.00001550, 0.00001620, 0.00001590, 0.00001710, 0.00001780, 0.00001850],
    category: 'Meme',
    rank: 10,
    iconColor: 'bg-green-500 text-green-950'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    price: 1.12,
    change24h: -0.42,
    high24h: 1.16,
    low24h: 1.09,
    marketCap: 3200000000,
    volume24h: 190000000,
    sparkline: [1.14, 1.16, 1.13, 1.11, 1.12, 1.10, 1.12],
    category: 'Layer 2',
    rank: 11,
    iconColor: 'bg-cyan-500 text-cyan-955'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    price: 2.18,
    change24h: -3.12,
    high24h: 2.31,
    low24h: 2.12,
    marketCap: 2800000000,
    volume24h: 140000000,
    sparkline: [2.31, 2.27, 2.24, 2.18, 2.20, 2.15, 2.18],
    category: 'Layer 2',
    rank: 12,
    iconColor: 'bg-red-500 text-red-950'
  }
];