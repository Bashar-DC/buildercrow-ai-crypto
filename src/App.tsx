import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  Bell,
  Calculator,
  Database,
  RefreshCw,
  ArrowUpRight,
  Coins,
  SlidersHorizontal,
  Zap,
  BookOpen,
  X,
  XCircle,
  DollarSign,
  Moon,
  Sparkles,
  Plus,
  Trash2,
  Percent
} from 'lucide-react';
import { INITIAL_COINS, Coin } from './data/initialCoins';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export default function App() {
  // State management
  const [coins, setCoins] = useState<Coin[]>(INITIAL_COINS);
  const [selectedCoin, setSelectedCoin] = useState<Coin>(INITIAL_COINS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change24h' | 'volume24h'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // User customizations
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('crypto_watchlist');
    return saved ? JSON.parse(saved) : ['bitcoin', 'ethereum', 'solana'];
  });
  const [onlyWatchlist, setOnlyWatchlist] = useState(false);
  
  // Price alert state
  const [alerts, setAlerts] = useState<{
    id: string;
    coinId: string;
    targetPrice: number;
    condition: 'above' | 'below';
    isTriggered: boolean;
  }[]>(() => {
    const saved = localStorage.getItem('crypto_alerts');
    return saved ? JSON.parse(saved) : [
      { id: '1', coinId: 'bitcoin', targetPrice: 95000, condition: 'above', isTriggered: false },
      { id: '2', coinId: 'ethereum', targetPrice: 3400, condition: 'below', isTriggered: false }
    ];
  });
  
  // Alert Inputs
  const [alertCoinId, setAlertCoinId] = useState('bitcoin');
  const [alertTargetPrice, setAlertTargetPrice] = useState('95000');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [triggeredNotifications, setTriggeredNotifications] = useState<string[]>([]);

  // Calculator states
  const [calcCryptoAmount, setCalcCryptoAmount] = useState('1');
  const [calcCryptoCoin, setCalcCryptoCoin] = useState<Coin>(INITIAL_COINS[0]);
  const [calcUsdAmount, setCalcUsdAmount] = useState('');

  // Market updates stats simulation
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(new Date().toLocaleTimeString());
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

  // Gas, Cap and BTC Dominance mocks
  const [marketStats, setMarketStats] = useState({
    totalCap: '$2.98T',
    totalCapChange: '+4.25%',
    volume24h: '$112.4B',
    btcDominance: '58.2%',
    gasPrice: '32 Gwei'
  });

  // Supabase Sync status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    status: 'idle' | 'syncing' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: isSupabaseConfigured() ? 'Supabase ready to sync' : 'Using LocalStorage (No Supabase setup yet)'
  });

  // Watchlist save effect
  useEffect(() => {
    localStorage.setItem('crypto_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Alerts save effect
  useEffect(() => {
    localStorage.setItem('crypto_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Sync watchlists with Supabase if set up
  const syncWatchlistWithSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseStatus({
        status: 'error',
        message: 'Supabase keys not configured in Vite env variables.'
      });
      return;
    }

    setSupabaseStatus({ status: 'syncing', message: 'Syncing watchlist with Supabase...' });
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .upsert({
          id: 'user-default-watchlist', 
          coins_list: watchlist,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSupabaseStatus({ status: 'success', message: 'Watchlist backup synced to Supabase!' });
    } catch (err: any) {
      setSupabaseStatus({ status: 'error', message: err.message || 'Error syncing data' });
    }
  };

  // Simulate real-time price fluctuations
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const newFlashes: Record<string, 'up' | 'down' | null> = {};
      
      setCoins(prevCoins => {
        const updated = prevCoins.map(coin => {
          // Random fluctuation from -0.6% to +0.8%
          const changePercent = (Math.random() * 1.4 - 0.6) / 100;
          const rawNewPrice = coin.price * (1 + changePercent);
          // Round price dynamically based on size
          const newPrice = coin.price > 1 ? parseFloat(rawNewPrice.toFixed(2)) : parseFloat(rawNewPrice.toFixed(6));
          
          const priceDiff = newPrice - coin.price;
          if (priceDiff > 0) {
            newFlashes[coin.id] = 'up';
          } else if (priceDiff < 0) {
            newFlashes[coin.id] = 'down';
          }

          // Update sparkline data (drop oldest, push newest price)
          const nextSparkline = [...coin.sparkline.slice(1), newPrice];

          // Calculate dynamic 24h change mock drift
          const newChange = parseFloat((coin.change24h + (changePercent * 100)).toFixed(2));

          return {
            ...coin,
            price: newPrice,
            change24h: newChange,
            high24h: newPrice > coin.high24h ? newPrice : coin.high24h,
            low24h: newPrice < coin.low24h ? newPrice : coin.low24h,
            sparkline: nextSparkline
          };
        });

        // Update currently selected coin view
        const matchedSelected = updated.find(c => c.id === selectedCoin.id);
        if (matchedSelected) {
          setSelectedCoin(matchedSelected);
        }

        return updated;
      });

      setFlashStates(newFlashes);
      setLastUpdateTime(new Date().toLocaleTimeString());

      // Clean up flashes soon after
      setTimeout(() => {
        setFlashStates({});
      }, 800);

    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, selectedCoin.id]);

  // Check Alert Conditions whenever coins update
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.isTriggered) return;
      const currentCoin = coins.find(c => c.id === alert.coinId);
      if (!currentCoin) return;

      let isHit = false;
      if (alert.condition === 'above' && currentCoin.price >= alert.targetPrice) {
        isHit = true;
      } else if (alert.condition === 'below' && currentCoin.price <= alert.targetPrice) {
        isHit = true;
      }

      if (isHit) {
        // Trigger!
        setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isTriggered: true } : a));
        const message = `🚨 ALERT: ${currentCoin.name} (${currentCoin.symbol}) reached $${currentCoin.price.toLocaleString()} (Target was ${alert.condition} $${alert.targetPrice.toLocaleString()})!`;
        setTriggeredNotifications(prev => [message, ...prev]);
      }
    });
  }, [coins, alerts]);

  // Calculator auto converter
  useEffect(() => {
    const matchingCoin = coins.find(c => c.id === calcCryptoCoin.id);
    if (matchingCoin) {
      const cryptoVal = parseFloat(calcCryptoAmount) || 0;
      const calculatedUsd = cryptoVal * matchingCoin.price;
      setCalcUsdAmount(calculatedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
    }
  }, [calcCryptoAmount, calcCryptoCoin, coins]);

  // Handle sorting & filtering
  const processedCoins = useMemo(() => {
    return coins
      .filter(coin => {
        const matchesSearch = coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              coin.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || coin.category === selectedCategory;
        const matchesWatchlist = !onlyWatchlist || watchlist.includes(coin.id);
        return matchesSearch && matchesCategory && matchesWatchlist;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        
        if (typeof valA === 'string') return 0;
        
        if (sortOrder === 'asc') {
          return (valA as number) > (valB as number) ? 1 : -1;
        } else {
          return (valA as number) < (valB as number) ? 1 : -1;
        }
      });
  }, [coins, searchTerm, selectedCategory, watchlist, onlyWatchlist, sortBy, sortOrder]);

  // Watchlist Toggle Handlers
  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Custom Alerts creation
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(alertTargetPrice);
    if (isNaN(price) || price <= 0) return;

    const newAlert = {
      id: Date.now().toString(),
      coinId: alertCoinId,
      targetPrice: price,
      condition: alertCondition,
      isTriggered: false
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    setAlertTargetPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const resetTriggeredAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isTriggered: false })));
    setTriggeredNotifications([]);
  };

  // Draw custom high quality Sparkline inside SVG 
  const renderMiniChart = (points: number[], isPositive: boolean) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 120;
    const height = 40;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    const lineColor = isPositive ? '#10b981' : '#f43f5e';
    const gradientId = `grad-${Math.random()}`;

    return (
      <svg className="w-24 h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Gradient fill area */}
        <path
          d={`M 0,${height} L ${coords} L ${width},${height} Z`}
          fill={`url(#${gradientId})`}
        />
        {/* Main line */}
        <polyline
          fill="none"
          stroke={lineColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  // Draw interactive central detail SVG Chart
  const renderDetailedChart = (coin: Coin) => {
    const points = coin.sparkline;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 500;
    const height = 180;
    
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 20) - 10;
      return { x, y, value: p };
    });
    
    const pathStr = coords.map((c, i) => (i === 0 ? `M ${c.x},${c.y}` : `L ${c.x},${c.y}`)).join(' ');
    const isPositive = coin.change24h >= 0;
    const color = isPositive ? '#10b981' : '#f43f5e';

    return (
      <div className="relative w-full h-48 bg-[#0b0f19] rounded-xl p-3 border border-zinc-800/80 overflow-hidden">
        <div className="absolute top-2 left-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: color }} />
          <span className="text-xs text-zinc-400 font-mono">Realtime dynamic spark curve</span>
        </div>

        {/* SVG Curve */}
        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="detail-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${height} ${pathStr} L ${width},${height} Z`}
            fill="url(#detail-gradient)"
          />
          <path
            d={pathStr}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Dots on points */}
          {coords.map((c, idx) => (
            <g key={idx}>
              <circle
                cx={c.x}
                cy={c.y}
                r="4"
                className="fill-zinc-950 stroke-2 cursor-pointer transition-all hover:r-6"
                style={{ stroke: color }}
              />
              <text
                x={c.x}
                y={c.y - 8}
                textAnchor="middle"
                fontSize="8"
                fill="#94a3b8"
                fontFamily="monospace"
                className="opacity-0 hover:opacity-100 transition-opacity bg-black pointer-events-none"
              >
                ${c.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </text>
            </g>
          ))}
        </svg>

        {/* Horizontal axis grid indicators */}
        <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-900 pt-1">
          <span>24h Ago</span>
          <span>18h Ago</span>
          <span>12h Ago</span>
          <span>6h Ago</span>
          <span>Now Live</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans">
      
      {/* Top Banner Warning & Notifications */}
      {triggeredNotifications.length > 0 && (
        <div className="bg-amber-950/90 border-b border-amber-500 text-amber-200 px-4 py-2.5 text-sm flex items-center justify-between shadow-lg sticky top-0 z-50 animate-pulse-slow">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-semibold">Price Target Alert Logged:</span>
            <div className="flex flex-wrap gap-2">
              {triggeredNotifications.slice(0, 1).map((n, i) => (
                <span key={i} className="font-mono text-xs bg-black/40 px-2 py-0.5 rounded border border-amber-600">{n}</span>
              ))}
              {triggeredNotifications.length > 1 && (
                <span className="text-xs text-amber-300 font-bold underline cursor-pointer" onClick={resetTriggeredAlerts}>
                  +{triggeredNotifications.length - 1} more alert(s) [Clear All]
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={resetTriggeredAlerts}
            className="text-amber-400 hover:text-white p-1 rounded hover:bg-amber-900 transition-colors"
            title="Dismiss alerts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Terminal Header */}
      <header className="border-b border-zinc-800 bg-[#090d16] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Branding with glow indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/15 p-2 rounded-lg border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white uppercase font-mono">
                    CRYPTO<span className="text-emerald-400">GLOW</span>
                  </h1>
                  <span className="bg-zinc-800 text-[9px] text-zinc-400 font-mono px-1.5 py-0.5 rounded tracking-widest uppercase">
                    V2.1
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Premium Dark Mode Live Checker</p>
              </div>
            </div>
            
            {/* Mobile-only status widget */}
            <div className="md:hidden flex items-center gap-2 text-[11px] font-mono bg-zinc-900 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-zinc-300">Live updates</span>
            </div>
          </div>

          {/* Live market quick tickers bar */}
          <div className="hidden lg:flex items-center gap-6 font-mono text-xs text-zinc-400 bg-zinc-900/60 px-4 py-2 rounded-lg border border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">MARKET CAP:</span>
              <span className="text-emerald-400 font-bold">{marketStats.totalCap}</span>
              <span className="text-emerald-400 text-[10px]">{marketStats.totalCapChange}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">24H VOL:</span>
              <span className="text-zinc-200 font-bold">{marketStats.volume24h}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">BTC DOM:</span>
              <span className="text-blue-400 font-bold">{marketStats.btcDominance}</span>
            </div>
            <div className="w-px h-3 bg-zinc-800" />
            <div className="flex items-center gap-1.5" title="Ethereum standard priority gas estimation">
              <span className="text-zinc-500">GAS:</span>
              <span className="text-amber-400 font-bold">{marketStats.gasPrice}</span>
            </div>
          </div>

          {/* Simulated engine status controller and Sync button */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Supabase status badge & sync trigger button */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={syncWatchlistWithSupabase}
                className="flex items-center gap-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md border border-zinc-800 transition-colors"
                title="Save your Watchlist state safely to Supabase cloud Database"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Cloud Sync</span>
              </button>
              <span 
                className={`w-2 h-2 rounded-full ${
                  supabaseStatus.status === 'success' 
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                    : supabaseStatus.status === 'error'
                    ? 'bg-rose-500'
                    : 'bg-zinc-600'
                }`}
                title={supabaseStatus.message}
              />
            </div>

            {/* Ticker Engine Toggle */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-all ${
                isSimulating 
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
              title={isSimulating ? "Simulation active. Clicking pauses changes." : "Simulation paused. Click to resume real-time updates."}
            >
              <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Live Feed Active' : 'Feed Paused'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Supabase message banner alert if interactive status is error or success */}
      {supabaseStatus.status !== 'idle' && (
        <div className={`text-xs px-4 py-2 border-b text-center font-mono flex items-center justify-center gap-2 ${
          supabaseStatus.status === 'success' 
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
            : supabaseStatus.status === 'error'
            ? 'bg-rose-950/60 text-rose-300 border-rose-800/50'
            : 'bg-zinc-900/80 text-zinc-300 border-zinc-800'
        }`}>
          <span>{supabaseStatus.message}</span>
          <button 
            className="underline hover:text-white ml-2 text-[10px] bg-black/30 px-1.5 py-0.5 rounded"
            onClick={() => setSupabaseStatus({ status: 'idle', message: '' })}
          >
            Dismiss notification
          </button>
        </div>
      )}

      {/* Main Terminal Grid Container */}
      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (8 cols): Coin List, Category Selection, Active Search */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Top filter and query toolbar */}
          <div className="bg-[#090d16] border border-zinc-800/80 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search name, ticker symbol... (e.g. BTC, Pepe)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#030712] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Watchlist Filter toggle */}
              <button
                onClick={() => setOnlyWatchlist(!onlyWatchlist)}
                className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg border transition-all font-medium ${
                  onlyWatchlist 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                    : 'bg-[#030712] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyWatchlist ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                <span>Watchlist Only ({watchlist.length})</span>
              </button>
            </div>

            {/* Category tabs list */}
            <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-900 pt-3">
              <span className="text-xs text-zinc-500 font-mono mr-2">SECTORS:</span>
              {['All', 'Layer 1', 'DeFi', 'Layer 2', 'Meme'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all font-mono ${
                    selectedCategory === cat
                      ? 'bg-emerald-500 text-emerald-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-[#030712] border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Coins Table Card */}
          <div className="bg-[#090d16] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-900 bg-[#0c1220] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-200 font-mono flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-400" />
                  Cryptocurrency Asset Index
                </h2>
                <p className="text-xs text-zinc-500 font-mono">Updated just now at: <span className="text-emerald-400">{lastUpdateTime}</span></p>
              </div>
              <div className="text-xs text-zinc-400 font-mono hidden sm:block">
                Sorted by <span className="text-emerald-400 font-bold underline capitalize">{sortBy === 'change24h' ? '24h %' : sortBy}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-900/30">
                    <th className="py-3.5 px-4 w-10 text-center">Watch</th>
                    <th className="py-3.5 px-3 w-12 cursor-pointer hover:text-zinc-300" onClick={() => { setSortBy('rank'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3.5 px-4">Asset Name</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-zinc-300" onClick={() => { setSortBy('price'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-zinc-300" onClick={() => { setSortBy('change24h'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      24h Change {sortBy === 'change24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3.5 px-4 text-center hidden md:table-cell">24h Trend</th>
                    <th className="py-3.5 px-4 text-right cursor-pointer hover:text-zinc-300 hidden sm:table-cell" onClick={() => { setSortBy('volume24h'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      24h Vol {sortBy === 'volume24h' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-3.5 px-4 text-right text-zinc-500">Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {processedCoins.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                        <p className="text-sm">No assets match your search or filter configuration.</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setOnlyWatchlist(false); }}
                          className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded hover:bg-emerald-500/20 transition-all"
                        >
                          Reset Search Filter
                        </button>
                      </td>
                    </tr>
                  ) : (
                    processedCoins.map((coin) => {
                      const isWatchlisted = watchlist.includes(coin.id);
                      const flash = flashStates[coin.id];
                      const changeIsPositive = coin.change24h >= 0;
                      const isSelected = selectedCoin.id === coin.id;

                      return (
                        <tr 
                          key={coin.id}
                          onClick={() => setSelectedCoin(coin)}
                          className={`group cursor-pointer transition-all border-l-2 ${
                            isSelected 
                              ? 'bg-zinc-900/85 border-l-emerald-500' 
                              : 'hover:bg-zinc-900/40 border-l-transparent'
                          } ${
                            flash === 'up' 
                              ? 'bg-emerald-950/20' 
                              : flash === 'down' 
                              ? 'bg-rose-950/20' 
                              : ''
                          }`}
                        >
                          {/* Favorite Column */}
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => toggleWatchlist(coin.id)}
                              className="text-zinc-600 hover:text-yellow-400 transition-colors p-1"
                              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                            >
                              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </button>
                          </td>

                          {/* Rank */}
                          <td className="py-3 px-3 text-zinc-500 font-mono text-xs">
                            #{coin.rank}
                          </td>

                          {/* Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center tracking-tighter ${coin.iconColor}`}>
                                {coin.symbol}
                              </div>
                              <div>
                                <div className="font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                                  {coin.name}
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 uppercase">{coin.symbol}/USD</span>
                              </div>
                            </div>
                          </td>

                          {/* Price with flash indicator */}
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <div className={`transition-all duration-300 ${
                              flash === 'up' 
                                ? 'text-emerald-400 scale-105 shadow-inner' 
                                : flash === 'down' 
                                ? 'text-rose-400 scale-105' 
                                : 'text-zinc-100'
                            }`}>
                              ${coin.price >= 1 
                                ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                                : coin.price.toFixed(6)
                              }
                            </div>
                          </td>

                          {/* Change percent */}
                          <td className={`py-3 px-4 text-right font-mono text-xs font-semibold ${
                            changeIsPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            <div className="flex items-center justify-end gap-1">
                              {changeIsPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>{changeIsPositive ? '+' : ''}{coin.change24h}%</span>
                            </div>
                          </td>

                          {/* Custom Mini sparkline SVG curve */}
                          <td className="py-3 px-4 text-center hidden md:table-cell align-middle w-28">
                            <div className="flex justify-center">
                              {renderMiniChart(coin.sparkline, changeIsPositive)}
                            </div>
                          </td>

                          {/* Volume 24h */}
                          <td className="py-3 px-4 text-right font-mono text-xs text-zinc-300 hidden sm:table-cell">
                            ${(coin.volume24h / 1e9).toFixed(2)}B
                          </td>

                          {/* Sector badge */}
                          <td className="py-3 px-4 text-right">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                              {coin.category}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mini Footer indicator */}
            <div className="p-3 bg-zinc-900/40 text-[11px] font-mono text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-simulator: Prices fluctuate dynamically every 3.5s</span>
              </div>
              <div>
                Showing {processedCoins.length} of {coins.length} coins in the matrix
              </div>
            </div>
          </div>

          {/* Educational Quick Reference Box */}
          <div className="bg-gradient-to-r from-zinc-950 to-[#0c1220] border border-zinc-800/60 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/15 rounded-lg text-emerald-400 shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-300">How prices are managed</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  This terminal is connected to an active simulation layer mimicry of crypto orderbooks. Changes represent simulated trade events. You can sync watchlists to high performance PostgreSQL cloud instances via the Supabase client connector, or configure threshold price alert targets down below.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Detailed View Panel, Alert Builder, Calculator Swapper */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* 1. Selected Coin Detail Dashboard */}
          <div className="bg-[#090d16] border border-zinc-800/80 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center ${selectedCoin.iconColor}`}>
                  {selectedCoin.symbol}
                </div>
                <div>
                  <h2 className="text-sm font-black font-mono text-white tracking-wide">{selectedCoin.name} Info Terminal</h2>
                  <span className="text-[10px] text-zinc-500 font-mono">Active Spot Market Node</span>
                </div>
              </div>
              
              <button 
                onClick={() => toggleWatchlist(selectedCoin.id)}
                className={`p-1.5 rounded-lg border transition-all ${
                  watchlist.includes(selectedCoin.id)
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Pin to Watchlist"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* Price section */}
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-2xl font-black font-mono tracking-tight text-white">
                ${selectedCoin.price >= 1 
                  ? selectedCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                  : selectedCoin.price.toFixed(6)
                }
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                selectedCoin.change24h >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
              }`}>
                {selectedCoin.change24h >= 0 ? '+' : ''}{selectedCoin.change24h}%
              </span>
            </div>

            {/* Sparkline curve */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-zinc-500">
                <span>24h Price Trajectory</span>
                <span className={selectedCoin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {selectedCoin.change24h >= 0 ? 'Bullish' : 'Bearish'} Channel
                </span>
              </div>
              {renderDetailedChart(selectedCoin)}
            </div>

            {/* High/Low stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-900">
                <div className="text-zinc-500 text-[10px] uppercase mb-0.5">24H HIGH</div>
                <div className="text-emerald-400 font-bold">
                  ${selectedCoin.high24h.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
              </div>
              <div className="bg-zinc-900/60 p-2 rounded border border-zinc-900">
                <div className="text-zinc-500 text-[10px] uppercase mb-0.5">24H LOW</div>
                <div className="text-rose-400 font-bold">
                  ${selectedCoin.low24h.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </div>
              </div>
            </div>

            {/* Market Cap & Supply Stats */}
            <div className="space-y-2 text-xs font-mono border-t border-zinc-900 pt-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">MARKET CAPITALIZATION</span>
                <span className="text-zinc-200 font-semibold">${(selectedCoin.marketCap / 1e9).toFixed(2)} Billion USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">24H LIQUIDITY VOLUME</span>
                <span className="text-zinc-200 font-semibold">${(selectedCoin.volume24h / 1e6).toFixed(1)} Million USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SECTOR MATURATION</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedCoin.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">MATRIX RADAR SCORE</span>
                <span className="text-blue-400 font-bold">9.8 / 10 APY</span>
              </div>
            </div>
          </div>

          {/* 2. Custom Price Trigger Alert Center */}
          <div className="bg-[#090d16] border border-zinc-800/80 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-900">
              <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-zinc-200">Price Target Alerts</h3>
                <p className="text-[11px] text-zinc-500">Simulate local push indicators</p>
              </div>
            </div>

            {/* Alert List */}
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3 pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-zinc-500 bg-[#030712] rounded border border-zinc-900">
                  No target alerts set.
                </div>
              ) : (
                alerts.map((alert) => {
                  const alertCoin = coins.find(c => c.id === alert.coinId) || selectedCoin;
                  return (
                    <div 
                      key={alert.id}
                      className={`flex items-center justify-between p-2 rounded text-xs font-mono border ${
                        alert.isTriggered 
                          ? 'bg-amber-950/40 border-amber-800 text-amber-300' 
                          : 'bg-zinc-950/60 border-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold uppercase text-white">{alertCoin.symbol}</span>
                          <span>{alert.condition === 'above' ? '≥' : '≤'}</span>
                          <span className="text-emerald-400 font-bold">${alert.targetPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {alert.isTriggered ? '🔥 Already Triggered' : '⏳ Waiting for feed event...'}
                        </span>
                      </div>
                      <button 
                        onClick={() => removeAlert(alert.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-zinc-900 transition-colors"
                        title="Remove alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Form to add alert */}
            <form onSubmit={handleAddAlert} className="space-y-2 border-t border-zinc-900 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Coin Node</label>
                  <select
                    value={alertCoinId}
                    onChange={(e) => setAlertCoinId(e.target.value)}
                    className="w-full text-xs bg-[#030712] border border-zinc-800 rounded p-1.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {coins.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Condition</label>
                  <select
                    value={alertCondition}
                    onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                    className="w-full text-xs bg-[#030712] border border-zinc-800 rounded p-1.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="above">Price Above (≥)</option>
                    <option value="below">Price Below (≤)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Trigger Price Target (USD)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="95000"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    className="w-full bg-[#030712] border border-zinc-800 rounded pl-6 pr-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Initialize Active Price Rule</span>
              </button>
            </form>
          </div>

          {/* 3. Currency Converter Swapper */}
          <div className="bg-[#090d16] border border-zinc-800/80 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-900">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-zinc-200">Converter & Swap Calculator</h3>
                <p className="text-[11px] text-zinc-500">Dynamically convert live token value</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Crypto Token Select</label>
                <select
                  value={calcCryptoCoin.id}
                  onChange={(e) => {
                    const matched = coins.find(c => c.id === e.target.value);
                    if (matched) setCalcCryptoCoin(matched);
                  }}
                  className="w-full text-xs bg-[#030712] border border-zinc-800 rounded p-2 text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {coins.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol}) @ ${c.price >= 1 ? c.price.toLocaleString() : c.price.toFixed(5)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Crypto Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={calcCryptoAmount}
                    onChange={(e) => setCalcCryptoAmount(e.target.value)}
                    className="w-full bg-[#030712] border border-zinc-800 rounded p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="1.0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono">
                    {calcCryptoCoin.symbol}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">ESTIMATED VALUE:</span>
                <div className="text-right">
                  <span className="text-indigo-400 font-bold text-sm block">
                    ${calcUsdAmount} USD
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    At current simulated rate
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Dashboard Footer block */}
      <footer className="bg-[#060a12] border-t border-zinc-800 py-6 mt-12 text-zinc-500 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-zinc-400">CryptoGlow Dashboard Terminal</p>
            <p className="mt-1 text-[11px]">A fully reactive crypto checker configured in dark theme premium neon accents.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase integration client: online</span>
            </div>
            <span>•</span>
            <span className="text-zinc-400">No investment advice intended.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}