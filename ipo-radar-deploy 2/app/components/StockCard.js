'use client';
import { useState } from 'react';
import { T, signalColor, scoreColor } from './theme';
import { Target, Dollar, TrendUp, Zap, Shield, ChartUp } from './icons';
import { ScoreBar, MomentumRing } from './shared';

export default function StockCard({ stock, idx }) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const color = signalColor(stock.signal);

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => setExpanded(!expanded)}
      style={{
        background: hov ? T.cardHover : T.card,
        border: `1px solid ${hov ? color + '55' : T.border}`,
        borderRadius: 16, padding: 24, overflow: 'hidden',
        transition: 'all .3s cubic-bezier(.4,0,.2,1)',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 32px ${color}15` : 'none',
        animation: `fadeSlideUp .5s ease ${idx * .07}s both`,
        position: 'relative', cursor: 'pointer',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color, borderRadius: '4px 0 0 4px' }} />

      {/* Header */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <MomentumRing score={stock.momentum_score} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text }}>{stock.company}</h3>
            <span style={{ background: color + '22', color, padding: '2px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>
              ${stock.ticker}
            </span>
            <span style={{ background: color + '18', color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>
              {stock.signal}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
            {stock.sector && <span style={{ fontSize: 13, color: T.textDim }}>{stock.sector}</span>}
            {stock.price && <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{stock.price.startsWith('$') ? stock.price : `$${stock.price}`}</span>}
            {stock.price_target && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Target s={12} c={T.accent} />
                <span style={{ fontSize: 13, color: T.accent }}>Target: {stock.price_target}</span>
              </div>
            )}
            {stock.timeframe && <span style={{ fontSize: 12, color: T.textDim }}>⏱ {stock.timeframe}</span>}
          </div>
        </div>
      </div>

      {/* Key reasons */}
      {stock.key_reasons && stock.key_reasons.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          {stock.key_reasons.map((r, i) => (
            <span key={i} style={{ background: T.accentDim, color: T.accent, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, lineHeight: 1.4 }}>
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Expanded breakdown */}
      {expanded && (
        <div style={{ marginTop: 20, animation: 'fadeSlideUp .3s ease both' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '16px 0', borderTop: `1px solid ${T.border}` }}>
            <ScoreBar label="Fundamentals" score={stock.fundamentals_score} color={scoreColor(stock.fundamentals_score)} icon={<Dollar s={12} c={T.textDim} />} />
            <ScoreBar label="Technicals" score={stock.technicals_score} color={scoreColor(stock.technicals_score)} icon={<TrendUp s={12} c={T.textDim} />} />
            <ScoreBar label="Sentiment" score={stock.sentiment_score} color={scoreColor(stock.sentiment_score)} icon={<Zap s={12} c={T.textDim} />} />
            <ScoreBar label="Sector" score={stock.sector_score} color={scoreColor(stock.sector_score)} icon={<ChartUp s={12} c={T.textDim} />} />
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
            {stock.revenue_growth && <div style={{ fontSize: 13 }}><span style={{ color: T.textDim }}>Rev Growth: </span><span style={{ color: T.accent, fontWeight: 600 }}>{stock.revenue_growth}</span></div>}
            {stock.pe_ratio && <div style={{ fontSize: 13 }}><span style={{ color: T.textDim }}>P/E: </span><span style={{ color: T.text, fontWeight: 600 }}>{stock.pe_ratio}</span></div>}
            {stock.rsi && <div style={{ fontSize: 13 }}><span style={{ color: T.textDim }}>RSI: </span><span style={{ color: T.text, fontWeight: 600 }}>{stock.rsi}</span></div>}
            {stock.analyst_consensus && <div style={{ fontSize: 13 }}><span style={{ color: T.textDim }}>Analysts: </span><span style={{ color: T.blue, fontWeight: 600 }}>{stock.analyst_consensus}</span></div>}
          </div>

          {stock.risks && stock.risks.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Shield s={12} c={T.danger} />
                <span style={{ fontSize: 12, color: T.danger, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Risks</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {stock.risks.map((r, i) => (
                  <span key={i} style={{ background: T.dangerDim, color: T.danger, padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 11, color: T.textDim }}>{expanded ? '▲ Less' : '▼ Tap for full breakdown'}</span>
      </div>
    </div>
  );
}
