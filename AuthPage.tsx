import { useState } from 'react';
import { Camera, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface AuthPageProps {
  mode: 'signin' | 'signup';
  onBack: () => void;
  onSwitchMode: (mode: 'signin' | 'signup') => void;
}

export function AuthPage({ mode, onBack, onSwitchMode }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignUp = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignUp) {
      if (!username.trim() || !displayName.trim()) {
        setError('Username and display name are required');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim(), displayName.trim());
      if (error) setError(error);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-[#ff2d92] opacity-15 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#00f0ff] opacity-10 blur-3xl animate-float" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-6 pt-6">
        <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center tap-scale">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-animated flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">SnackSnap</span>
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-extrabold mb-1">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-white/50 text-sm mb-8">
            {isSignUp ? 'Join the snack community' : 'Sign in to keep snacking'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up delay-100">
          {isSignUp && (
            <>
              <InputField
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="snackvibes"
                type="text"
              />
              <InputField
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Your name"
                type="text"
              />
            </>
          )}
          <InputField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
          />
          <div>
            <label className="text-sm font-medium text-white/70 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-2xl glass border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#ff2d92]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl gradient-animated text-white font-bold tap-scale hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6 animate-slide-up delay-200">
          {isSignUp ? 'Already have an account? ' : 'New to SnackSnap? '}
          <button
            onClick={() => onSwitchMode(isSignUp ? 'signin' : 'signup')}
            className="text-[#ff2d92] font-semibold hover:text-[#ff2d92]/80 transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/70 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3.5 rounded-2xl glass border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[#ff2d92]/50 transition-colors"
      />
    </div>
  );
}
