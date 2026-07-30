'use client';

import { motion } from 'framer-motion';
import { Link2, RefreshCw, BarChart3, Palette, Smartphone, Shield } from 'lucide-react';

const features = [
  { icon: Link2, title: 'Dynamic links', description: 'Change where your QR points anytime — no reprinting, no re-printing needed.' },
  { icon: RefreshCw, title: 'Editable forever', description: 'Update business info, links, and design without touching the printed QR.' },
  { icon: BarChart3, title: 'Real-time analytics', description: 'Track scans, views, devices, locations, and button clicks as they happen.' },
  { icon: Palette, title: 'Beautiful landing pages', description: 'Pick from premium templates and customize colors, fonts, and layout.' },
  { icon: Smartphone, title: 'Mobile-first', description: "Every landing page is optimized for the phone in your customer's hand." },
  { icon: Shield, title: 'Reliable redirect', description: 'QR encodes only a short ID. We handle the redirect server-side, fast.' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function FeatureGrid() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3"
    >
      {features.map((f) => (
        <motion.div
          key={f.title}
          variants={item}
          className="group relative bg-background p-7 transition-colors hover:bg-accent/40"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-muted text-brand">
            <f.icon className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
          <div className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
        </motion.div>
      ))}
    </motion.div>
  );
}
