import React from 'react';

interface SvgProps {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

function Svg({
  size = 22,
  children,
  viewBox = '0 0 24 24',
  stroke,
  fill = 'currentColor',
  sw = 0,
  style,
  className,
}: SvgProps & {
  children: React.ReactNode;
  viewBox?: string;
  stroke?: string;
  fill?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size} height={size} viewBox={viewBox}
      fill={stroke ? 'none' : fill}
      stroke={stroke ?? 'none'} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable={false}
      style={style} className={className}
    >
      {children}
    </svg>
  );
}

export const IconSun = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
  </Svg>
);

export const IconMoon = (p: SvgProps) => (
  <Svg {...p}><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" /></Svg>
);

export const IconLink = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2}>
    <path d="M9.5 14.5l5-5" />
    <path d="M13 7l1.2-1.2a3.5 3.5 0 0 1 5 5L18 12" />
    <path d="M11 17l-1.2 1.2a3.5 3.5 0 0 1-5-5L6 12" />
  </Svg>
);

export const IconShare = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2}>
    <path d="M12 14V4M8.5 7.5L12 4l3.5 3.5" />
    <path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13" />
  </Svg>
);

export const IconUpload = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2}>
    <path d="M12 15V4M8.5 7.5L12 4l3.5 3.5" />
    <path d="M5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V15" />
  </Svg>
);

export const IconAdd = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2.2}><path d="M12 5v14M5 12h14" /></Svg>
);

export const IconClose = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2.2}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);

export const IconRefresh = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2}>
    <path d="M3.5 12a8.5 8.5 0 0 1 14.5-6M20.5 12A8.5 8.5 0 0 1 6 18" />
    <path d="M18 2.5V6h-3.5M6 21.5V18h3.5" />
  </Svg>
);

export const IconStar = (p: SvgProps) => (
  <Svg {...p}><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.9 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" /></Svg>
);

export const IconStarBorder = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={1.7} fill="none">
    <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4 1 5.8L12 16.9l-5.2 2.6 1-5.8-4.2-4 5.8-.8z" />
  </Svg>
);

export const IconInfo = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2} fill="none">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <circle cx="12" cy="7.8" r="0.4" fill="currentColor" />
  </Svg>
);

export const IconCheck = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2.4} fill="none"><path d="M4.5 12.5l5 5 10-11" /></Svg>
);

export const IconContrast = (p: SvgProps) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18V3z" />
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </Svg>
);

export const IconType = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2} fill="none">
    <path d="M5 7V5h14v2M12 5v14M9 19h6" />
  </Svg>
);

export const IconSwap = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2} fill="none">
    <path d="M4 8h13M14 5l3 3-3 3" />
    <path d="M20 16H7M10 13l-3 3 3 3" />
  </Svg>
);

export const IconChevron = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2} fill="none"><path d="M6 9l6 6 6-6" /></Svg>
);

export const IconQuestion = (p: SvgProps) => (
  <Svg {...p} stroke="currentColor" sw={2} fill="none">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 0 1 5 .8c0 1.5-2.5 2.2-2.5 3.7" />
    <circle cx="12" cy="17" r="0.4" fill="currentColor" />
  </Svg>
);
