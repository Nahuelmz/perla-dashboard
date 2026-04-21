import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { T } from '../generated/mockData';

type Props = {
  label: string;
  value: React.ReactNode;
  color: string;
  bg: string;
  dotColor: string;
  children?: React.ReactNode;
};

const BRICOLAGE = "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif";

export function KpiCard({ label, value, color, bg, dotColor, children }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left transition-colors"
        style={{ background: expanded ? bg : 'transparent' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: bg }}
        >
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
        </div>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
          <span
            className="text-xs font-normal uppercase tracking-wider"
            style={{ color: T.text3 }}
          >
            {label}
          </span>
          <span
            style={{
              color,
              fontFamily: BRICOLAGE,
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {value}
          </span>
        </div>

        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: T.text3 }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-4 pt-1 space-y-2"
              style={{ borderTop: `1px solid ${T.border}` }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
