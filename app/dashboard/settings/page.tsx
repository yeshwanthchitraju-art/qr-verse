'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, Bell, Shield, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notif, setNotif] = useState(true);

  async function saveTheme(value: 'light' | 'dark' | 'system') {
    setTheme(value);
    const { error } = await supabase.from('profiles').update({ theme: value }).eq('id', profile?.id ?? '');
    if (error) { toast.error(error.message); return; }
    await refreshProfile();
    toast.success('Theme updated');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage preferences and appearance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="mb-3 block">Theme preference</Label>
          <div className="grid max-w-sm grid-cols-3 gap-2">
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => saveTheme(t.value as 'light' | 'dark' | 'system')}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
                  theme === t.value ? 'border-foreground bg-foreground text-background' : 'hover:bg-accent'
                }`}
              >
                <t.icon className="h-5 w-5" />
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email notifications</p>
              <p className="text-xs text-muted-foreground">Get notified about scan milestones.</p>
            </div>
            <button
              onClick={() => { setNotif(!notif); toast.success(notif ? 'Notifications off' : 'Notifications on'); }}
              className={`relative h-6 w-11 rounded-full transition-colors ${notif ? 'bg-brand' : 'bg-muted'}`}
              aria-pressed={notif}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${notif ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => toast.message('Password reset email would be sent here.')}>
            Reset password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
