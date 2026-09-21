import React from 'react';

interface WapLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  className?: string;
  showTagline?: boolean;
}

export const WapLogo: React.FC<WapLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', badge: 'text-[9px]', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-base', badge: 'text-[10px]', sub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-xs', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', badge: 'text-sm', sub: 'text-xs' },
  };

  const s = sizeMap[size];

  // SVG Emblem: Stylized aerodynamic "W" integrating a forward-moving motorcycle wheel & shield in gold, purple-navy, and electric cyan
  const LogoIcon = (
    <div className={`relative ${s.icon} shrink-0 flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Deep Navy/Sky Blue Gradient for Shield */}
          <linearGradient id="wapShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>

          {/* Radiant Amber-Gold Gradient for Wings & Lightning */}
          <linearGradient id="wapGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Electric Cyan Accent */}
          <linearGradient id="wapCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Shield Backing */}
        <polygon
          points="50,4 92,18 84,68 50,96 16,68 8,18"
          fill="url(#wapShieldGrad)"
          stroke="#4338ca"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Tech Ring / Motorcycle Wheel Rim */}
        <circle
          cx="50"
          cy="52"
          r="30"
          stroke="url(#wapCyanGrad)"
          strokeWidth="2"
          strokeDasharray="4 2.5"
          opacity="0.8"
        />

        {/* High-Velocity Aerodynamic "W" (Stylized Speed Vector) */}
        {/* Left Wing */}
        <path
          d="M 24 34 L 34 68 L 44 46"
          stroke="url(#wapGoldGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right Wing */}
        <path
          d="M 56 46 L 66 68 L 76 34"
          stroke="url(#wapGoldGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Speed Crest / Forward Arrow Peak */}
        <polygon
          points="50,30 55,48 50,44 45,48"
          fill="#38bdf8"
        />

        {/* Center Golden Axle Core */}
        <circle cx="50" cy="52" r="5" fill="url(#wapGoldGrad)" />
        <circle cx="50" cy="52" r="2" fill="#1e1b4b" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {LogoIcon}

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${s.text} text-white font-sans drop-shadow-sm`}>
            WAP
          </span>
          <span className="font-bold text-amber-400 text-xs tracking-wider uppercase">
            Rides
          </span>
          <span className={`px-1.5 py-0.5 rounded font-black tracking-widest uppercase bg-amber-400 text-neutral-950 ${s.badge}`}>
            24/7
          </span>
        </div>

        {showTagline ? (
          <span className={`text-neutral-300 font-medium tracking-wide mt-0.5 ${s.sub}`}>
            Global Mobility &amp; Financial Freedom
          </span>
        ) : (
          <span className="text-[10px] text-purple-200/80 font-medium tracking-wider">
            Ride • Courier • Liberté Cash
          </span>
        )}
      </div>
    </div>
  );
};
