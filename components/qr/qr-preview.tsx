'use client';

import { useEffect, useRef } from 'react';
import type { QrStyling } from '@/types';

interface QrPreviewProps {
  value: string;
  styling: QrStyling;
  size?: number;
  className?: string;
}

export default function QrPreview({ value, styling, size = 220, className }: QrPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<{ update: (opts: unknown) => void; append: (el: HTMLElement) => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const { default: QRCodeStyling } = await import('qr-code-styling');
      if (cancelled || !containerRef.current) return;
      const qr = new QRCodeStyling(buildOptions(value, styling, size));
      qrRef.current = qr as unknown as { update: (o: unknown) => void; append: (e: HTMLElement) => void };
      containerRef.current.innerHTML = '';
      qr.append(containerRef.current);
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.update(buildOptions(value, styling, size));
    }
  }, [value, styling, size]);

  return <div ref={containerRef} className={className} aria-label="QR code preview" />;
}

function buildOptions(value: string, s: QrStyling, size: number) {
  const dotsOptions = s.gradientEnabled
    ? {
        type: s.dotsType,
        gradient: {
          type: 'linear' as const,
          rotation: s.gradientRotation,
          colorStops: [
            { offset: 0, color: s.gradientFrom || '#6366f1' },
            { offset: 1, color: s.gradientTo || '#8b5cf6' },
          ],
        },
      }
    : { type: s.dotsType, color: s.foregroundColor };

  return {
    width: size,
    height: size,
    type: 'svg' as const,
    data: value,
    margin: s.padding,
    image: s.logoUrl || undefined,
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: s.imageMargin,
      imageSize: s.logoSize,
      hideBackgroundDots: true,
    },
    dotsOptions,
    cornersSquareOptions: { type: s.cornersSquareType, color: s.cornersSquareColor },
    cornersDotOptions: { type: s.cornersDotType, color: s.cornersDotColor },
    backgroundOptions: { color: s.backgroundColor },
    qrOptions: { errorCorrectionLevel: 'Q' as const },
  };
}
