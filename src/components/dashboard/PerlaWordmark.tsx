import React from 'react';

const DM_SERIF = "'DM Serif Display', ui-serif, Georgia, serif";

type PerlaWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  dotColor?: string;
  pulse?: boolean;
  onDotClick?: () => void;
  onWordmarkClick?: () => void;
  dotTitle?: string;
  dotTooltip?: React.ReactNode;
  className?: string;
};

/**
 * Perla brand mark: "perla•" — lowercase editorial serif with accent dot.
 * The dot doubles as the bot agent status indicator when used in chrome:
 * - Pass `dotColor` for status (green=active / amber=pending / red=paused)
 * - Pass `pulse={true}` to animate the dot (use when bot is active)
 * - Pass `onDotClick` to make the dot clickable (e.g. open BotSettings)
 * - Pass `dotTooltip` (ReactNode) to show a custom tooltip on hover.
 *   `dotTitle` (string) is used as HTML `title` fallback for accessibility.
 */
export function PerlaWordmark({
  size = 'md',
  color = '#1B2D3B',
  dotColor = '#4472C4',
  pulse = false,
  onDotClick,
  onWordmarkClick,
  dotTitle,
  dotTooltip,
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
      onClick={onWordmarkClick}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '2px',
        userSelect: 'none' as const,
        lineHeight: 1,
        cursor: onWordmarkClick ? 'pointer' : 'default',
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
      {onDotClick || dotTooltip ? (
        <span className="group relative" style={{ display: 'inline-flex', alignItems: 'baseline' }}>
          <button
            type="button"
            onClick={onDotClick}
            title={!dotTooltip ? dotTitle : undefined}
            aria-label={dotTitle ?? 'Estado del agente'}
            style={{ background: 'transparent', border: 'none', padding: '4px', margin: '-4px', cursor: onDotClick ? 'pointer' : 'inherit', display: 'inline-flex', alignItems: 'baseline' }}
          >
            <span style={dotStyle} />
          </button>
          {dotTooltip && (
            <span
              className="pointer-events-none opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-[180ms] ease-out"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                // Anchor to the left of the dot so tooltip always extends right (never off-screen)
                left: '-6px',
                whiteSpace: 'nowrap',
                background: '#1B2D3B',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 400,
                padding: '8px 12px',
                borderRadius: '10px',
                boxShadow: '0 6px 20px rgba(27,45,59,0.22)',
                zIndex: 30,
                letterSpacing: '0.01em',
                lineHeight: 1.4,
                fontFamily: 'inherit',
              }}
            >
              {dotTooltip}
            </span>
          )}
        </span>
      ) : (
        <span style={dotStyle} />
      )}
    </div>
  );
}
