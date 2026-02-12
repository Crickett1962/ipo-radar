'use client';

import { useState, useEffect, useCallback } from 'react';
import { T, daysUntil, uColor, signalColor, scoreColor } from './components/theme';
import { Bell, SearchIcon, RefreshIcon, ChartUp, Cal, Zap } from './components/icons';
import { StatGrid, Skeletons } from './components/shared';
import IPOCard from './components/IPOCard';
import StockCard from './components/StockCard';

const SECTORS = ['All', 'Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrial'];

export default function Home() {
  const [tab, setTab] = useState('ipos');

  // ── IPO State ────────────────────────────────────────────────────
  const [ipos, setIpos] = useState([]);
  const [ipoLoading, setIpoLoading] = useState(false);
  const [ipoError, setIpoError] = useState(null);
  const [ipoFilter, setIpoFilter] = useState('all');
  const [ipoSearch, setIpoSearch] = useState('');
  const [notified, setNotified] = useState(new Set());
  const [ipoFetched, setIpoFetched] = useState(null);
  const [notifPerm, setNotifPerm] = useState('default');

  // ── Stock State ──────────────────────────────────────────────────
  const [stocks, setStocks] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [stockSearch, setStockSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [signalFilter, setSignalFilter] = useState('all');
  const [stockFetched, setStockFetched] = useState(null);

  // ── Fetchers ─────────────────────────────────────────────────────
  const fetchIPOs = useCallback(async () => {
    setIpoLoading(true); setIpoError(null);
    try {
      const res = await fetch('/api/ipos');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIpos(data.ipos || []);
      setIpoFetched(new Date().toLocaleString());
    } catch (err) { setIpoError(err.message); }
    finally { setIpoLoading(false); }
  }, []);

  const fetchStocks = useCallback(async () => {
    setStockLoading(true); setStockError(null);
    try {
      const url = `/api/stocks?sector=${sectorFilter === 'All' ? 'all' : sectorFilter.toLowerCase()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStocks(data.stocks || []);
      setStockFetched(new Date().toLocaleString());
    } catch (err) { setStockError(err.message); }
    finally { setStockLoading(false); }
  }, [sectorFilter]);

  useEffect(() => { fetchIPOs(); }, [fetchIPOs]);
  useEffect(() => { if (tab === 'stocks' && stocks.length === 0 && !stockLoading) fetchStocks(); }, [tab]);
  useEffect(() => { if ('Notification' in window) setNotifPerm(Notification.permission); }, []);

  // ── Notification Handler ─────────────────────────────────────────
  const reqPerm = async () => {
    if ('Notification' in window) {
      const p = await Notification.requestPermission();
      setNotifPerm(p);
      return p === 'granted';
    }
    return false;
  };

  const handleNotify = async (ipo) => {
    const key = ipo.company;
    if (notified.has(key)) {
      setNotified(prev => { const n = new Set(prev); n.delete(key); return n; });
      return;
    }
    let granted = notifPerm === 'granted';
    if (!granted) granted = await reqPerm();
    setNotified(prev => new Set(prev).add(key));
    if (granted && ipo.expected_date) {
      const days = daysUntil(ipo.expected_date);
      if (days !== null && days >= 7) {
        const ms = Math.max((days - 7) * 86400000, 1000);
        setTimeout(() => {
          new Notification(`IPO Alert: ${ipo.company}`, { body: `${ipo.company} goes public in 7 days!` });
        }, ms);
      }
      new Notification(`Tracking: ${ipo.company}`, { body: `You'll be notified 7 days before the IPO.` });
    }
  };

  // ── Filtered Data ────────────────────────────────────────────────
  const filteredIPOs = ipos.filter(ipo => {
    const d = daysUntil(ipo.expected_date);
    if (ipoFilter === 'week' && (d === null || d < 0 || d > 7)) return false;
    if (ipoFilter === 'month' && (d === null || d < 0 || d > 30)) return false;
    if (ipoFilter === 'later' && (d !== null && d <= 30)) return false;
    if (ipoSearch) {
      const q = ipoSearch.toLowerCase();
      return ipo.company?.toLowerCase().includes(q) || ipo.ticker?.toLowerCase().includes(q) || ipo.sector?.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredStocks = stocks.filter(s => {
    if (signalFilter !== 'all' && s.signal !== signalFilter) return false;
    if (stockSearch) {
      const q = stockSearch.toLowerCase();
      return s.company?.toLowerCase().includes(q) || s.ticker?.toLowerCase().includes(q) || s.sector?.toLowerCase().includes(q);
    }
    return true;
  });

  // ── Stats ────────────────────────────────────────────────────────
  const ipoStats = [
    { label: 'This Week', val: ipos.filter(i => { const d = daysUntil(i.expected_date); return d !== null && d >= 0 && d <= 7; }).length, col: T.danger },
    { label: 'This Month', val: ipos.filter(i => { const d = daysUntil(i.expected_date); return d !== null && d >= 0 && d <= 30; }).length, col: T.warn },
    { label: 'Later', val: ipos.filter(i => { const d = daysUntil(i.expected_date); return d !== null && d > 30; }).length, col: T.accent },
    { label: 'Total', val: ipos.length, col: T.text },
  ];

  const avgScore = stocks.length ? Math.round(stocks.reduce((a, s) => a + s.momentum_score, 0) / stocks.length) : 0;
  const stockStats = [
    { label: 'Strong Buy', val: stocks.filter(s => s.signal === 'Strong Buy').length, col: T.accent },
    { label: 'Buy', val: stocks.filter(s => s.signal === 'Buy').length, col: T.blue },
    { label: 'Watch', val: stocks.filter(s => s.signal === 'Watch').length, col: T.warn },
    { label: 'Avg Score', val: avgScore, col: scoreColor(avgScore) },
  ];

  const ipoFilterBtns = [{ key: 'all', label: 'All' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'later', label: 'Later' }];
  const signalBtns = [{ key: 'all', label: 'All' }, { key: 'Strong Buy', label: 'Strong Buy' }, { key: 'Buy', label: 'Buy' }, { key: 'Watch', label: 'Watch' }];

  // ── Button helper ────────────────────────────────────────────────
  const filterBtn = (active, activeColor, onClick, label) => (
    <button onClick={onClick} style={{
      padding: '10px 14px', borderRadius: 10,
      border: active ? `1px solid ${activeColor}55` : `1px solid ${T.border}`,
      background: active ? activeColor + '22' : T.card,
      color: active ? activeColor : T.textDim,
      cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
      transition: 'all .2s', whiteSpace: 'nowrap',
    }}>{label}</button>
  );

  const errorBox = (msg, retry) => (
    <div style={{ background: `${T.danger}15`, border: `1px solid ${T.danger}33`, borderRadius: 14, padding: '16px 20px', marginBottom: 24, color: T.danger, fontSize: 14 }}>
      {msg}
      <button onClick={retry} style={{ marginLeft: 12, background: T.danger, color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Retry</button>
    </div>
  );

  return (
    <>
      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.border}44 1px,transparent 1px),linear-gradient(90deg,${T.border}44 1px,transparent 1px)`, backgroundSize: '60px 60px', opacity: .4 }} />
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle,${tab === 'stocks' ? T.blue : T.accent}08 0%,transparent 70%)`, filter: 'blur(80px)', transition: 'background .5s' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle,${T.warn}06 0%,transparent 70%)`, filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '0 20px 60px', maxWidth: 940, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ padding: '48px 0 24px', animation: 'fadeSlideUp .5s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},${T.accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.accentGlow }}>
              <ChartUp s={24} c={T.bg} />
            </div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -.5, lineHeight: 1.1, color: T.text }}>IPO Radar</h1>
              <p style={{ fontSize: 13, color: T.textDim, marginTop: 2 }}>U.S. market intelligence & IPO tracking</p>
            </div>
          </div>
        </header>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 4, background: T.card, borderRadius: 14, padding: 4, marginBottom: 28, border: `1px solid ${T.border}`, animation: 'fadeSlideUp .5s ease .05s both' }}>
          {[
            { key: 'ipos', label: 'IPO Tracker', icon: <Cal s={14} c={tab === 'ipos' ? T.bg : T.textDim} /> },
            { key: 'stocks', label: 'Stock Picks', icon: <Zap s={14} c={tab === 'stocks' ? T.bg : T.textDim} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 20px', borderRadius: 10, border: 'none',
              background: tab === t.key ? T.accent : 'transparent',
              color: tab === t.key ? T.bg : T.textDim,
              cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: 'all .25s ease',
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ IPO TAB ═══════════════ */}
        {tab === 'ipos' && (
          <div>
            {ipoFetched && <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>Last updated: {ipoFetched}</p>}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 14px', gap: 8 }}>
                <SearchIcon s={16} c={T.textDim} />
                <input value={ipoSearch} onChange={e => setIpoSearch(e.target.value)} placeholder="Search IPOs..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, padding: '12px 0', fontFamily: "'DM Sans',sans-serif" }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {ipoFilterBtns.map(f => filterBtn(ipoFilter === f.key, T.accent, () => setIpoFilter(f.key), f.label))}
              </div>
              <button onClick={fetchIPOs} disabled={ipoLoading} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
                border: `1px solid ${T.accent}44`, background: T.accentDim, color: T.accent,
                cursor: ipoLoading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
              }}>
                <RefreshIcon s={14} c={T.accent} spin={ipoLoading} />
                {ipoLoading ? 'Scanning...' : 'Refresh'}
              </button>
            </div>

            {ipoError && errorBox(ipoError, fetchIPOs)}

            {ipoLoading && ipos.length === 0 ? (
              <Skeletons msg="Scanning SEC filings, exchanges & financial sources..." />
            ) : ipos.length > 0 ? (
              <>
                <StatGrid items={ipoStats} />

                {notifPerm !== 'granted' && (
                  <div style={{ background: `${T.warn}12`, border: `1px solid ${T.warn}33`, borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Bell s={18} c={T.warn} />
                      <span style={{ fontSize: 14, color: T.warn }}>Enable notifications for 7-day advance alerts</span>
                    </div>
                    <button onClick={reqPerm} style={{ background: T.warn, color: T.bg, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Enable</button>
                  </div>
                )}

                <div style={{ display: 'grid', gap: 14 }}>
                  {filteredIPOs.length > 0 ? filteredIPOs.map((ipo, i) => (
                    <IPOCard key={ipo.company + i} ipo={ipo} idx={i} onNotify={handleNotify} isNotified={notified.has(ipo.company)} />
                  )) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim }}>No IPOs match your filters.</div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ═══════════════ STOCK PICKS TAB ═══════════════ */}
        {tab === 'stocks' && (
          <div>
            {stockFetched && <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>Last updated: {stockFetched}</p>}

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 14px', gap: 8 }}>
                <SearchIcon s={16} c={T.textDim} />
                <input value={stockSearch} onChange={e => setStockSearch(e.target.value)} placeholder="Search stocks..."
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14, padding: '12px 0', fontFamily: "'DM Sans',sans-serif" }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {signalBtns.map(f => {
                  const col = f.key === 'all' ? T.accent : signalColor(f.key);
                  return filterBtn(signalFilter === f.key, col, () => setSignalFilter(f.key), f.label);
                })}
              </div>
              <button onClick={fetchStocks} disabled={stockLoading} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10,
                border: `1px solid ${T.blue}44`, background: T.blueDim, color: T.blue,
                cursor: stockLoading ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
              }}>
                <RefreshIcon s={14} c={T.blue} spin={stockLoading} />
                {stockLoading ? 'Analyzing...' : 'Refresh'}
              </button>
            </div>

            {/* Sector chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {SECTORS.map(s => (
                <button key={s} onClick={() => setSectorFilter(s)} style={{
                  padding: '6px 14px', borderRadius: 20,
                  border: `1px solid ${sectorFilter === s ? T.purple + '55' : T.border}`,
                  background: sectorFilter === s ? T.purpleDim : 'transparent',
                  color: sectorFilter === s ? T.purple : T.textDim,
                  cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans',sans-serif", transition: 'all .2s',
                }}>{s}</button>
              ))}
            </div>

            {stockError && errorBox(stockError, fetchStocks)}

            {stockLoading && stocks.length === 0 ? (
              <Skeletons msg="Analyzing fundamentals, technicals, sentiment & sector momentum..." />
            ) : stocks.length > 0 ? (
              <>
                <StatGrid items={stockStats} />
                <div style={{ display: 'grid', gap: 14 }}>
                  {filteredStocks.length > 0 ? filteredStocks.map((s, i) => (
                    <StockCard key={s.ticker + i} stock={s} idx={i} />
                  )) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: T.textDim }}>No stocks match your filters.</div>
                  )}
                </div>
              </>
            ) : null}

            {/* Disclaimer */}
            <div style={{ marginTop: 32, padding: 20, borderRadius: 14, background: `${T.warn}08`, border: `1px solid ${T.warn}22`, textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: T.warn, lineHeight: 1.6, fontWeight: 500 }}>
                ⚠️ Educational purposes only. Not financial advice. Scores are AI-generated estimates based on publicly available data. Always do your own research before investing. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, padding: 20, borderRadius: 14, background: T.card, border: `1px solid ${T.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: T.textDim, lineHeight: 1.6 }}>
            Data sourced via AI-powered web search from SEC filings, financial news & market data providers. Subject to change.
          </p>
        </div>
      </div>
    </>
  );
}
