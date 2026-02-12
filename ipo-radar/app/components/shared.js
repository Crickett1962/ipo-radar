'use client';
import { T, scoreColor } from './theme';

export function StatGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32, animation: 'fadeSlideUp .5s ease .1s both' }}>
      {items.map((s, i) => (
        <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: s.col, fontFamily: "'Space Mono', monospace" }}>{s.val}</div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Skeletons({ n = 5, msg = 'Loading...' }) {
  return (
    <>
      <div style={{ textAlign: 'center', padding: '20px 0 30px', animation: 'fadeSlideUp .5s ease both' }}>
        <p style={{ color: T.accent, fontSize: 15, fontWeight: 500 }}>{msg}</p>
        <p style={{ color: T.textDim, fontSize: 13, marginTop: 6 }}>This may take a moment</p>
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        {Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton" style={{ animationDelay: `${i * .1}s` }} />)}
      </div>
    </>
  );
}

export function ScoreBar({ label, score, color, icon }) {
  return (
    <div style={{ flex: 1, minWidth: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {icon}
          <span style={{ fontSize: 11, color: T.textDim, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'Space Mono', monospace" }}>{score}</span>
      </div>
      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  );
}

export function MomentumRing({ score, size = 64 }) {
  const color = scoreColor(score);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Space Mono', monospace" }}>{score}</span>
      </div>
    </div>
  );
}
