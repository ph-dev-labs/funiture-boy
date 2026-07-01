const stats = [
  { label: 'Bitcoin (BTC)', value: '$67,432', change: '+3.24%', up: true },
  { label: 'Ethereum (ETH)', value: '$3,841', change: '+1.87%', up: true },
  { label: 'Tether (USDT)', value: '$1.00', change: '+0.02%', up: true },
  { label: 'BNB', value: '$412', change: '-0.91%', up: false },
  { label: 'Solana (SOL)', value: '$182', change: '+5.12%', up: true },
  { label: 'XRP', value: '$0.584', change: '+2.31%', up: true },
];

export default function StatsBar() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02] backdrop-blur-sm py-4 overflow-hidden">
      <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap gap-12 w-max">
        {[...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className="text-white/60 text-sm font-medium">{s.label}</span>
            <span className="text-white font-bold text-sm">{s.value}</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                s.up
                  ? 'text-[#00e676] bg-[#00e676]/10'
                  : 'text-[#ff1744] bg-[#ff1744]/10'
              }`}
            >
              {s.change}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
