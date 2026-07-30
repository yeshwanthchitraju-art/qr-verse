'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search, QrCode, LayoutDashboard, BarChart3, FileText, Palette,
  Settings, Plus, CornerDownLeft,
} from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList,
} from '@/components/ui/command';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { label: 'Go to Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigation' },
  { label: 'View My QR Codes', href: '/dashboard/qr', icon: QrCode, group: 'Navigation' },
  { label: 'View Landing Pages', href: '/dashboard/pages', icon: FileText, group: 'Navigation' },
  { label: 'Open Analytics', href: '/dashboard/analytics', icon: BarChart3, group: 'Navigation' },
  { label: 'Brand Kit', href: '/dashboard/brand', icon: Palette, group: 'Navigation' },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, group: 'Navigation' },
  { label: 'Create new QR', href: '/dashboard/qr/new', icon: Plus, group: 'Actions' },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  function run(href: string) {
    router.push(href);
    onOpenChange(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {['Navigation', 'Actions'].map((group) => (
          <CommandGroup key={group} heading={group}>
            {items.filter((i) => i.group === group).map((item) => (
              <CommandItem
                key={item.label}
                value={item.label}
                onSelect={() => run(item.href)}
                className="gap-3"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                <CornerDownLeft className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100" />
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
