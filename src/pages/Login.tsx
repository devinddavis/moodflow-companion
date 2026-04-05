import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setUser } from '@/lib/mood-store';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo login - in production this would use Supabase auth
    setTimeout(() => {
      const name = email.split('@')[0].replace(/[^a-zA-Z]/g, '');
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      setUser({
        id: crypto.randomUUID(),
        name: capitalizedName || 'User',
        email,
        role: email.includes('admin') ? 'admin' : 'user',
      });
      toast({ title: 'Welcome back! 👋', description: 'Great to see you again.' });
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
          <h1 className="font-display text-3xl font-bold text-primary-foreground">Welcome Back</h1>
          <p className="text-primary-foreground/50 mt-2">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-5">
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
              className="w-full px-4 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl gradient-coral text-primary-foreground font-bold text-lg card-shadow hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In 🚀'}
          </button>
          <p className="text-center text-sm text-primary-foreground/50">
            Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
