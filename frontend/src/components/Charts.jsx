// Modern animated SVG-based chart components - no external dependencies
import { useState, useEffect, useRef } from 'react'

// ─── Animations CSS injectées ───
const chartStyles = `
@keyframes chartFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes chartSlideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes donutDraw { from { stroke-dashoffset: var(--circumference); } to { stroke-dashoffset: var(--final-offset); } }
@keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(30,58,95,0); } 50% { box-shadow: 0 0 12px 2px rgba(30,58,95,0.15); } }

.chart-anim-in { animation: chartFadeIn 0.5s ease-out both; }
.chart-slide-in { animation: chartSlideIn 0.4s ease-out both; }
.chart-count { animation: countUp 0.6s ease-out 0.3s both; }

.donut-segment {
  transition: stroke-width 0.25s ease, opacity 0.25s ease;
  cursor: pointer;
  animation: donutDraw 0.8s cubic-bezier(0.4,0,0.2,1) both;
}
.donut-segment:hover { stroke-width: calc(var(--thickness) + 6px); }
.donut-dimmed { opacity: 0.35; }

.hbar-fill {
  transform-origin: left center;
  animation: barGrow 0.7s cubic-bezier(0.4,0,0.2,1) both;
  transition: filter 0.2s ease, transform 0.2s ease;
}
.hbar-fill:hover { filter: brightness(1.12); transform: scaleY(1.15); }
.hbar-row { transition: background-color 0.2s ease; }
.hbar-row:hover { background-color: rgba(241,245,249,0.6); }

.vbar-rect {
  transform-origin: bottom center;
  animation: barGrow 0.6s cubic-bezier(0.4,0,0.2,1) both;
  transition: opacity 0.2s ease, filter 0.2s ease;
}
.vbar-rect:hover { filter: brightness(1.15); }

.stat-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card-hover:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.12);
}
.stat-icon-bg {
  transition: transform 0.3s ease;
}
.stat-card-hover:hover .stat-icon-bg {
  transform: scale(1.1) rotate(-5deg);
}
`

let stylesInjected = false
function injectStyles() {
  if (!stylesInjected) {
    const el = document.createElement('style')
    el.textContent = chartStyles
    document.head.appendChild(el)
    stylesInjected = true
  }
}

// ─── DonutChart moderne avec animations et interactivité ───
export function DonutChart({ data, size = 200, thickness = 30 }) {
  const [hovered, setHovered] = useState(null)
  const [mounted, setMounted] = useState(false)
  const uid = useRef(Math.random().toString(36).slice(2, 8)).current

  useEffect(() => { injectStyles(); const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{ width: size, height: size }}>
        <div className="w-16 h-16 rounded-full border-4 border-dashed border-accent-light" />
        <span className="text-sm text-accent-slate">Aucune donnée</span>
      </div>
    )
  }

  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const gap = 2 // petit espace entre segments

  const activeItem = hovered !== null ? data[hovered] : null
  const displayValue = activeItem ? activeItem.value : total
  const displayLabel = activeItem ? activeItem.label : 'Total'

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 chart-anim-in">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            {data.map((d, i) => (
              <linearGradient key={i} id={`grad-${uid}-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={d.color} stopOpacity="1" />
                <stop offset="100%" stopColor={d.color} stopOpacity="0.7" />
              </linearGradient>
            ))}
            <filter id={`shadow-${uid}`}>
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Cercle de fond */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
            opacity="0.5"
          />

          <g transform={`rotate(-90 ${size / 2} ${size / 2})`} filter={`url(#shadow-${uid})`}>
            {data.map((d, i) => {
              const dash = Math.max((d.value / total) * circumference - gap, 0)
              const currentOffset = -offset
              offset += (d.value / total) * circumference
              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={`url(#grad-${uid}-${i})`}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={currentOffset}
                  strokeLinecap="round"
                  className={`donut-segment ${hovered !== null && hovered !== i ? 'donut-dimmed' : ''}`}
                  style={{
                    '--thickness': `${thickness}px`,
                    '--circumference': `${circumference}`,
                    '--final-offset': `${currentOffset}`,
                    animationDelay: `${i * 0.12}s`,
                  }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
          </g>

          {/* Texte central */}
          <text
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            dominantBaseline="central"
            className="chart-count"
            style={{ fontSize: size > 160 ? '28px' : '22px', fontWeight: 700, fill: activeItem ? (activeItem.color) : '#1e293b' }}
          >
            {displayValue}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 16}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fontSize: '11px', fill: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {displayLabel}
          </text>
        </svg>
      </div>

      {/* Légende interactive */}
      <div className="space-y-2 w-full sm:w-auto">
        {data.map((d, i) => {
          const pct = ((d.value / total) * 100).toFixed(0)
          return (
            <div
              key={i}
              className={`chart-slide-in flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                hovered === i ? 'bg-accent-lighter scale-[1.02]' : 'hover:bg-accent-lighter/50'
              }`}
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: d.color, boxShadow: `0 0 6px ${d.color}40` }}
              />
              <span className="text-sm text-accent-slate flex-1">{d.label}</span>
              <span className="text-sm font-bold text-accent-dark">{d.value}</span>
              <span className="text-xs text-accent-light tabular-nums">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── BarChart vertical animé ───
export function BarChart({ data, height = 220, barColor = '#1e3a5f' }) {
  const [hovered, setHovered] = useState(null)
  const uid = useRef(Math.random().toString(36).slice(2, 8)).current

  useEffect(() => { injectStyles() }, [])

  const max = Math.max(...data.map(d => d.value), 1)
  const chartH = height - 30 // espace pour labels
  const barWidth = 100 / data.length

  return (
    <div className="chart-anim-in">
      <svg width="100%" height={height} viewBox={`0 0 100 ${height / 3}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          {data.map((d, i) => (
            <linearGradient key={i} id={`vbar-${uid}-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={d.color || barColor} stopOpacity="1" />
              <stop offset="100%" stopColor={d.color || barColor} stopOpacity="0.5" />
            </linearGradient>
          ))}
        </defs>
        {/* Ligne de fond */}
        <line x1="0" y1={chartH / 3} x2="100" y2={chartH / 3} stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1 1" />
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (chartH / 3 - 6)
          const x = i * barWidth + barWidth * 0.2
          const w = barWidth * 0.6
          const y = chartH / 3 - barHeight
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={w}
                height={barHeight}
                fill={`url(#vbar-${uid}-${i})`}
                rx="1"
                className="vbar-rect"
                style={{ animationDelay: `${i * 0.1}s`, opacity: hovered !== null && hovered !== i ? 0.4 : 1 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {hovered === i && (
                <text
                  x={x + w / 2}
                  y={y - 1.5}
                  textAnchor="middle"
                  style={{ fontSize: '3px', fontWeight: 700, fill: d.color || barColor }}
                >
                  {d.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {data.map((d, i) => (
          <div
            key={i}
            className={`text-center text-xs transition-colors ${hovered === i ? 'font-bold text-accent-dark' : 'text-accent-slate'}`}
            style={{ width: `${barWidth}%` }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HBarChart horizontal animé avec pourcentages ───
export function HBarChart({ data, height = 200 }) {
  const [hovered, setHovered] = useState(null)

  useEffect(() => { injectStyles() }, [])

  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="space-y-3 chart-anim-in" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const pct = ((d.value / max) * 100).toFixed(0)
        return (
          <div
            key={i}
            className={`hbar-row px-3 py-2.5 rounded-lg ${hovered === i ? 'bg-accent-lighter' : ''}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className={`flex items-center gap-2 transition-colors ${hovered === i ? 'text-accent-dark font-medium' : 'text-accent-slate'}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color || '#1e3a5f' }} />
                {d.label}
              </span>
              <span className="font-bold text-accent-dark tabular-nums">{d.value}</span>
            </div>
            <div className="w-full bg-accent-lighter/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="hbar-fill h-full rounded-full"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: `linear-gradient(90deg, ${d.color || '#1e3a5f'}, ${(d.color || '#1e3a5f')}cc)`,
                  animationDelay: `${i * 0.1}s`,
                  boxShadow: hovered === i ? `0 0 10px ${(d.color || '#1e3a5f')}40` : 'none',
                }}
              />
            </div>
            {hovered === i && (
              <div className="text-right text-xs text-accent-light mt-1 tabular-nums chart-anim-in">{pct}% du max</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── StatCard moderne avec effet de survol ───
export function StatCard({ icon: Icon, label, value, sublabel, color = 'text-primary-700' }) {
  useEffect(() => { injectStyles() }, [])

  return (
    <div className="stat-card-hover bg-white shadow-sm rounded-xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="stat-icon-bg inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-3">
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <p className="text-sm text-accent-slate font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-accent-dark mt-0.5">{value}</p>
      {sublabel && <p className="text-sm text-accent-slate mt-1">{sublabel}</p>}
    </div>
  )
}
