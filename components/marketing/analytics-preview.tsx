'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { QrCode as QrIcon, MousePointerClick, MapPin } from 'lucide-react';

const data = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  scans: Math.round(80 + Math.sin(i / 2) * 35 + i * 6 + Math.random() * 20),
}));

const stats = [
  { icon: QrIcon, label: 'Total scans', value: '12,480', change: '+18%' },
  { icon: MousePointerClick, label: 'Button clicks', value: '5,210', change: '+12%' },
  { icon: MapPin, label: 'Top country', value: 'United States', change: '' },
];

export function AnalyticsPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Scans over time</h3>
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Live
          </div>
        </div>
        <div className="mt-6 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217 91% 50%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(217 91% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="scans"
                stroke="hsl(217 91% 50%)"
                strokeWidth={2}
                fill="url(#scanGrad)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              {s.change && (
                <span className="text-xs font-medium text-emerald-600">{s.change}</span>
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
