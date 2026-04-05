import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, getEntries } from '@/lib/mood-store';
import { INSIGHT_CARDS } from '@/lib/mood-data';
import { toast } from '@/hooks/use-toast';

interface ContentItem {
  id: string;
  type: 'affirmation' | 'tip' | 'fact';
  category: string;
  icon: string;
  title: string;
  body: string;
  moodTags: string[];
  isActive: boolean;
}

const initialContent: ContentItem[] = [
  ...INSIGHT_CARDS.map((c, i) => ({
    id: `insight-${i}`,
    type: (c.category === 'Psychology' ? 'fact' : c.category === 'Wellness Tip' ? 'tip' : 'fact') as ContentItem['type'],
    category: c.category,
    icon: c.emoji,
    title: c.title,
    body: c.body,
    moodTags: ['all'],
    isActive: true,
  })),
  { id: 'aff-1', type: 'affirmation', category: 'Self-Worth', icon: '🌸', title: 'You are enough', body: 'You are worthy of love and kindness, exactly as you are right now.', moodTags: ['all'], isActive: true },
  { id: 'aff-2', type: 'affirmation', category: 'Strength', icon: '💪', title: 'Inner strength', body: 'You have survived every difficult day so far, and you will survive this one too.', moodTags: ['struggling', 'low'], isActive: true },
  { id: 'aff-3', type: 'affirmation', category: 'Peace', icon: '🌿', title: 'Finding calm', body: 'Peace is not the absence of chaos — it is your ability to find stillness within it.', moodTags: ['all'], isActive: true },
  { id: 'aff-4', type: 'affirmation', category: 'Growth', icon: '✨', title: 'Daily growth', body: 'Every experience is teaching you something valuable, even when it does not feel that way.', moodTags: ['all'], isActive: true },
  { id: 'aff-5', type: 'affirmation', category: 'Joy', icon: '☀️', title: 'Embrace joy', body: 'You deserve to feel joy without guilt. Let happiness flow through you freely today.', moodTags: ['good', 'great'], isActive: true },
  { id: 'aff-6', type: 'affirmation', category: 'Courage', icon: '🦋', title: 'Brave steps', body: 'Courage is not the absence of fear — it is taking the next step even when you are afraid.', moodTags: ['struggling', 'low', 'neutral'], isActive: true },
  { id: 'aff-7', type: 'affirmation', category: 'Self-Care', icon: '💝', title: 'Self-compassion', body: 'Being gentle with yourself is not laziness — it is the foundation of true strength.', moodTags: ['all'], isActive: true },
  { id: 'aff-8', type: 'affirmation', category: 'Progress', icon: '🚀', title: 'Moving forward', body: 'You are making more progress than you realize. Trust the process and keep going.', moodTags: ['neutral', 'good', 'great'], isActive: true },
];

export default function Admin() {
  const navigate = useNavigate();
  const user = getUser();
  const entries = getEntries();
  const [content, setContent] = useState<ContentItem[]>(initialContent);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);

  if (!user || user.role !== 'admin') {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const totalUsers = 1; // Demo
  const totalEntries = entries.length;

  const handleDelete = (id: string) => {
    setContent(content.filter(c => c.id !== id));
    toast({ title: 'Content deleted ✓' });
  };

  const handleToggle = (id: string) => {
    setContent(content.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="text-muted-foreground hover:text-foreground transition-colors font-semibold mb-4">
        ← Back
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-8">Admin Panel 👑</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border text-center">
          <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Users</p>
        </div>
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border text-center">
          <p className="text-3xl font-bold text-foreground">{totalEntries}</p>
          <p className="text-sm text-muted-foreground mt-1">Mood Entries</p>
        </div>
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border text-center">
          <p className="text-3xl font-bold text-foreground">{content.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Content Items</p>
        </div>
      </div>

      {/* Content Library */}
      <div className="bg-card rounded-3xl p-6 card-shadow border border-border overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground">Content Library</h2>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="px-4 py-2 rounded-xl gradient-coral text-primary-foreground font-semibold text-sm"
          >
            + Add New Content
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4">Mood Tags</th>
              <th className="pb-3 pr-4">Active</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item) => (
              <tr key={item.id} className="border-b border-border/50 last:border-0">
                <td className="py-3 pr-4 capitalize text-foreground">{item.icon} {item.type}</td>
                <td className="py-3 pr-4 font-medium text-foreground">{item.title}</td>
                <td className="py-3 pr-4 text-muted-foreground">{item.moodTags.join(', ')}</td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`w-8 h-5 rounded-full ${item.isActive ? 'bg-mint' : 'bg-muted'} relative`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card transition-transform ${item.isActive ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="py-3">
                  <button onClick={() => handleDelete(item.id)} className="text-destructive text-xs font-semibold hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
