import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatRupees } from '../lib/pricing';

export interface DayPoint {
  day: string; // YYYY-MM-DD (India date)
  orders: number;
  revenue: number;
}

const H = 200;
const PAD = { top: 12, right: 8, bottom: 26, left: 30 };

const label = (day: string, style: 'short' | 'long') =>
  new Date(`${day}T00:00:00+05:30`).toLocaleDateString('en-IN', style === 'short'
    ? { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }
    : { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

/** A clean top for the y-axis: 1, 2, 5 or 10 times a power of ten. */
function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  return [1, 2, 5, 10].map((m) => m * pow).find((v) => v >= max) ?? max;
}

/**
 * Orders per day as columns (one series, so no legend: the heading names it). Each column is its
 * own hover/focus target with a tooltip; "Show as table" gives the same numbers without hovering.
 */
export function OrdersChart({ data }: { data: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  // Drawn at the real on-screen width, so text stays 11px on phones and desktops alike.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(340);
  // Measure before the first paint, then follow size changes (rotation, window resizes).
  useLayoutEffect(() => {
    if (box.current) setW(Math.max(260, box.current.clientWidth));
  }, [asTable]);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(el);
    return () => observer.disconnect();
  }, [asTable]);

  const top = niceMax(Math.max(0, ...data.map((d) => d.orders)));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / data.length;
  const barW = Math.min(24, band - 2); // never fill the slot; 2px surface gap at minimum
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const ticks = [0, top / 2, top];
  const total = data.reduce((s, d) => s + d.orders, 0);

  /** Column with a 4px rounded top and a square base. */
  const column = (x: number, value: number) => {
    const h = Math.max((value / top) * plotH, value > 0 ? 2 : 0);
    if (h === 0) return '';
    const r = Math.min(4, h, barW / 2);
    const yTop = PAD.top + plotH - h;
    const base = PAD.top + plotH;
    return `M${x},${base} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + barW - r} Q${x + barW},${yTop} ${x + barW},${yTop + r} V${base} Z`;
  };

  const point = active !== null ? data[active] : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-stone">{total} orders in 30 days</p>
        <button type="button" onClick={() => setAsTable((v) => !v)} className="text-sm font-semibold text-sage underline">
          {asTable ? 'Show as chart' : 'Show as table'}
        </button>
      </div>

      {asTable ? (
        <div className="mt-2 max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-stone">
              <tr><th className="py-1">Day</th><th className="text-right">Orders</th><th className="text-right">Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {[...data].reverse().map((d) => (
                <tr key={d.day}><td className="py-1">{label(d.day, 'long')}</td><td className="text-right">{d.orders}</td><td className="text-right">{formatRupees(d.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={box} className="relative mt-2">
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-label={`Orders per day for the last 30 days, ${total} in total`}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#E4DDD1" strokeWidth={1} />
                <text x={PAD.left - 6} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#6B675E">{Math.round(t)}</text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = PAD.left + i * band + (band - barW) / 2;
              return (
                <g key={d.day}>
                  <path d={column(x, d.orders)} fill="#2F7A50" opacity={active === null || active === i ? 1 : 0.55} />
                  {/* The whole column slot is the hover/focus target, bigger than the bar. */}
                  <rect
                    x={PAD.left + i * band}
                    y={PAD.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    tabIndex={0}
                    role="button"
                    aria-label={`${label(d.day, 'long')}: ${d.orders} orders, ${formatRupees(d.revenue)}`}
                    onPointerEnter={() => setActive(i)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="cursor-default outline-none focus-visible:fill-[rgba(47,122,80,0.08)]"
                  />
                  {(i === data.length - 1 || (i % 10 === 0 && data.length - 1 - i >= 5)) && (
                    <text x={PAD.left + i * band + band / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#6B675E">{label(d.day, 'short')}</text>
                  )}
                </g>
              );
            })}
          </svg>
          {point && active !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-float"
              // Kept away from the edges so it never spills off a narrow phone screen.
              style={{ left: `${Math.min(80, Math.max(20, ((PAD.left + active * band + band / 2) / W) * 100))}%` }}
              role="status"
            >
              <p className="font-semibold">{point.orders} order{point.orders === 1 ? '' : 's'} · {formatRupees(point.revenue)}</p>
              <p className="text-stone">{label(point.day, 'long')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
