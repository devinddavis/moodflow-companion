import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getPreferences, savePreferences, clearAllData, setUser } from '@/lib/mood-store';
import { UserPreferences } from '@/lib/mood-data';
import { toast } from '@/hooks/use-toast';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <button
        type="button"
        onClick={() => { onChange(!checked); toast({ title: 'Preferences saved ✓' }); }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const user = getUser();
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) { navigate('/'); return null; }

  const update = (partial: Partial<UserPreferences>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    savePreferences(next);
  };

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Settings ⚙️</h1>

      {/* Notifications */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border mb-6">
        <h2 className="font-display font-bold text-foreground mb-4">🔔 Notifications</h2>
        <Toggle label="Daily Reminder" checked={prefs.notificationsEnabled} onChange={(v) => update({ notificationsEnabled: v })} />
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-foreground">Reminder Time</span>
          <input
            type="time"
            value={prefs.reminderTime}
            onChange={(e) => { update({ reminderTime: e.target.value }); toast({ title: 'Preferences saved ✓' }); }}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground"
          />
        </div>
        <Toggle label="Evening Affirmation Alert" checked={prefs.eveningAffirmations} onChange={(v) => update({ eveningAffirmations: v })} />
      </div>

      {/* Content Tone */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border mb-6">
        <h2 className="font-display font-bold text-foreground mb-4">🎨 Content Tone</h2>
        {(['warm', 'playful', 'calm'] as const).map((tone) => {
          const labels = { warm: '🌸 Warm & Encouraging', playful: '🎉 Playful & Fun', calm: '🧘 Calm & Mindful' };
          return (
            <label key={tone} className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="radio"
                name="tone"
                checked={prefs.contentTone === tone}
                onChange={() => { update({ contentTone: tone }); toast({ title: 'Preferences saved ✓' }); }}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm font-medium text-foreground">{labels[tone]}</span>
            </label>
          );
        })}
      </div>

      {/* Suggestion Types */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border mb-6">
        <h2 className="font-display font-bold text-foreground mb-4">📋 Suggestion Types</h2>
        <Toggle label="✅ Productivity Tasks" checked={prefs.showProductivity} onChange={(v) => update({ showProductivity: v })} />
        <Toggle label="🌿 Self-Care Activities" checked={prefs.showSelfCare} onChange={(v) => update({ showSelfCare: v })} />
        <Toggle label="🧠 Wellness Insights" checked={prefs.showInsights} onChange={(v) => update({ showInsights: v })} />
      </div>

      {/* Privacy */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border mb-6">
        <h2 className="font-display font-bold text-foreground mb-4">🔒 Privacy</h2>
        <Toggle label="Save mood history" checked={prefs.saveHistory} onChange={(v) => update({ saveHistory: v })} />
        <div className="pt-2">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-sm text-destructive font-semibold hover:underline">
              Delete all my data
            </button>
          ) : (
            <div className="bg-destructive/10 rounded-xl p-4">
              <p className="text-sm text-foreground mb-3">Are you sure? This will permanently delete all your mood entries and preferences.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { clearAllData(); setShowDeleteConfirm(false); toast({ title: 'All data deleted' }); }}
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold"
                >
                  Yes, delete everything
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border">
        <h2 className="font-display font-bold text-foreground mb-4">👤 Account</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> <span className="font-semibold text-foreground">{user.name}</span></p>
          <p><span className="text-muted-foreground">Email:</span> <span className="font-semibold text-foreground">{user.email}</span></p>
        </div>
        <button
          onClick={() => { setUser(null); navigate('/'); }}
          className="mt-6 px-6 py-3 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-border transition-colors"
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}
