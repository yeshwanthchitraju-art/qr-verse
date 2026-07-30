'use client';

import { Image as ImageIcon, UploadCloud, Film, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MediaPage() {
  function stub() {
    toast.message('Media uploads require Cloudinary configuration', {
      description: 'Add your Cloudinary credentials to enable image hosting.',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Media</h2>
        <p className="text-sm text-muted-foreground">Logos, gallery images, and assets for your landing pages.</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted">
            <UploadCloud className="h-7 w-7 text-brand" />
          </div>
          <p className="mt-5 text-base font-semibold">Drop files to upload</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Images up to 5MB. Connect Cloudinary to enable persistent media hosting.
          </p>
          <button onClick={stub} className="mt-6 inline-flex items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload
          </button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: ImageIcon, label: 'Images', count: '0 files' },
          { icon: Film, label: 'Videos', count: '0 files' },
          { icon: FileText, label: 'Documents', count: '0 files' },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-xs text-muted-foreground">{c.count}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
