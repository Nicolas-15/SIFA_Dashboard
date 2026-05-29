import { useEffect, useState } from 'react';

const SessionLoadingScreen = () => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => +(prev + 0.1).toFixed(1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white gap-6">
      <svg
        width="48"
        height="48"
        viewBox="0 0 100 100"
        className="drop-shadow-lg"
      >
        <style>{`
          @keyframes spin-sec {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-min {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .second-hand {
            animation: spin-sec 6s linear infinite;
            transform-origin: 50px 50px;
          }
          .minute-hand {
            animation: spin-min 360s linear infinite;
            transform-origin: 50px 50px;
          }
        `}</style>

        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="4" />

        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line
            key={angle}
            x1="50"
            y1="8"
            x2="50"
            y2="15"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${angle}, 50, 50)`}
          />
        ))}

        <g className="minute-hand">
          <line x1="50" y1="50" x2="50" y2="22" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g className="second-hand">
          <line x1="50" y1="55" x2="50" y2="18" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <circle cx="50" cy="50" r="3" fill="#f87171" />
      </svg>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-light tracking-wider tabular-nums text-slate-100">
          {elapsed.toFixed(1)}
        </span>
        <span className="text-lg font-mono text-slate-400">s</span>
      </div>

      <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">
        Validando sesión
      </p>
    </div>
  );
};

export default SessionLoadingScreen;
