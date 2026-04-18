'use client';

import { motion } from 'framer-motion';

const PARTICLES = Array.from({ length: 18 }, (_, i) => i);

/**
 * Explosão celebrativa na conclusão.
 *
 * Neurociência: pico visual breve (< 800ms) sincronizado com arpejo sonoro
 * e háptico → cria associação positiva com o ato de concluir.
 * Usar com moderação — saciar demais dessensibiliza.
 */
export function CompletionBurst() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="absolute size-64 rounded-full"
        style={{ background: 'var(--gradient-glow)' }}
        initial={{ scale: 0, opacity: 0.9 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
      />
      {PARTICLES.map((i) => {
        const angle = (i / PARTICLES.length) * Math.PI * 2;
        const dist = 130 + Math.random() * 40;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        return (
          <motion.span
            key={i}
            className="absolute size-2 rounded-full"
            style={{
              background:
                i % 3 === 0
                  ? 'var(--jade-300)'
                  : i % 3 === 1
                    ? 'var(--jade-500)'
                    : '#ffffff',
            }}
            initial={{ x: 0, y: 0, scale: 0.6, opacity: 1 }}
            animate={{
              x: dx,
              y: dy,
              scale: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.65 + Math.random() * 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        );
      })}
      <motion.div
        className="text-6xl"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
        exit={{ scale: 0 }}
        transition={{ duration: 0.6, times: [0, 0.55, 1] }}
      >
        ✓
      </motion.div>
    </motion.div>
  );
}
