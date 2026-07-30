import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/>
          <rect x="15" y="15" width="2.5" height="2.5" rx="0.5" fill="hsl(217 91% 50%)"/>
          <rect x="18.5" y="15" width="2.5" height="2.5" rx="0.5" fill="hsl(198 93% 48%)"/>
          <rect x="15" y="18.5" width="2.5" height="2.5" rx="0.5" fill="hsl(198 93% 48%)"/>
          <rect x="18.5" y="18.5" width="2.5" height="2.5" rx="0.5" fill="hsl(174 72% 38%)"/>
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          QR<span className="text-brand">Verse</span>
        </span>
      )}
    </div>
  );
}
