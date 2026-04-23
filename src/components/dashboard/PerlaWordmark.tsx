import React from 'react';

const DM_SERIF = "'DM Serif Display', ui-serif, Georgia, serif";

type PerlaWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  dotColor?: string;
  pulse?: boolean;
  onDotClick?: () => void;
  dotTitle?: string;
  className?: string;
};

/**
 * Perla brand mark: "perla•" — lowercase editorial serif with accent dot.
 * The dot doubles as the bot agent status indicator when used in chrome:
 * - Pass `dotColor` for status (green=active / amber=pending / red=paused)
 * - Pass `pulse={true}` to animate the dot (use when bot is active)
 * - Pass `onDotClick` to make the dot clickable (e.g. open BotSettings)
 */
export function PerlaWordmark({
  size = 'md',
  color = '#1B2D3B',
  dotColor = '#4472C4',
  pulse = false,
  onDotClick,
  dotTitle,
  className,
}: PerlaWordmarkProps) {
  const sizes = {
    sm: { fontSize: '16px', dotSize: '4px', dotMb: '2px' },
    md: { fontSize: '20px', dotSize: '6px', dotMb: '2px' },
    lg: { fontSize: '32px', dotSize: '7px', dotMb: '3px' },
  };
  const s = sizes[size];

  const dotStyle: React.CSSProperties = {
    width: s.dotSize,
    height: s.dotSize,
    borderRadius: '50%',
    background: dotColor,
    display: 'inline-block',
    marginBottom: s.dotMb,
    boxShadow: pulse ? `0 0 0 3px ${dotColor}22` : 'none',
    animation: pulse ? 'sagePulse 2.4s ease-in-out infinite' : 'none',
    transition: 'background 0.2s, box-shadow 0.2s',
  };

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '2px',
        userSelect: 'none' as const,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          fontFamily: DM_SERIF,
          fontSize: s.fontSize,
          fontWeight: 400,
          color,
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}
      >
        perla
      </span>
      {onDotClick ? (
        <button
          type="button"
          onClick={onDotClick}
          title={dotTitle}
          aria-label={dotTitle ?? 'Estado del agente'}
          style={{ background: 'transparent', border: 'none', padding: '4px', margin: '-4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline' }}
        >
          <span style={dotStyle} />
        </button>
      ) : (
        <span style={dotStyle} />
      )}
    </div>
  );
}
