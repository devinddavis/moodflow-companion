import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setUser } from '@/lib/mood-store';
import { toast } from '@/hooks/use-toast';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: crypto.randomUUID(),
        name: name || 'User',
        email,
        role: 'user',
      });
      toast({ title: 'Welcome to MoodFlow! 🌊', description: 'Your journey to wellness starts now.' });
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-dark relative overflow-hidden px-4">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-coral/15 blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[100px] animate-float-delayed" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-coral flex items-center justify-center text-3xl card-shadow">🌊</div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Create Account</h1>
          <p className="text-primary-foreground/50 mt-2">Start your emotional wellness journey</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-primary-foreground/70 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary-foreground/70 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary-foreground/70 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl gradient-coral text-primary-foreground font-bold text-lg card-shadow hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Get Started 🚀'}
          </button>
          <p className="text-center text-sm text-primary-foreground/50">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
