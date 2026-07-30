'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Smartphone, MousePointerClick } from 'lucide-react';
import { DEFAULT_QR_STYLING } from '@/utils/qr';

const QrPreview = dynamic(() => import('@/components/qr/qr-preview'), { ssr: false });

const floating = {
  animate: { y: [0, -10, 0] },
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

export function HeroDemo() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl">
      <div className="absolute inset-0 -z-10 brand-gradient opacity-20 blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
        className="grid grid-cols-1 gap-4 rounded-3xl border bg-card p-4 shadow-2xl shadow-foreground/5 md:grid-cols-[260px_1fr]"
      >
        {/* QR card */}
        <motion.div
          {...floating}
          className="flex flex-col items-center justify-center rounded-2xl border bg-background p-6"
        >
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <QrPreview value="https://qrverse.app/r/demo123" styling={DEFAULT_QR_STYLING} size={180} />
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">qrverse.app/r/demo123</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">Scan to preview</p>
        </motion.div>

        {/* Phone mockup */}
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-muted/40 to-background p-6">
          <div className="mx-auto max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5" /> Live landing page
              </div>
              <div className="flex items-center gap-1 text-xs text-brand">
                <MousePointerClick className="h-3.5 w-3.5" /> 1,284 scans
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-5 rounded-2xl border bg-background p-5 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl brand-gradient" />
              <h3 className="mt-4 text-lg font-semibold tracking-tight">Bloom & Co.</h3>
              <p className="text-sm text-muted-foreground">Artisan coffee · Brooklyn</p>

              <div className="mt-4 space-y-2">
                {['Visit website', 'Order online', 'Get directions', 'Follow on Instagram'].map((label, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-accent/40 px-4 py-3 text-sm font-medium"
                  >
                    {label}
                    <span className="text-xs text-muted-foreground">{12 + i * 7}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
