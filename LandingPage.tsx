import { Camera, Sparkles, TrendingUp, Heart, Zap } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#ff2d92] opacity-20 blur-3xl animate-float-slow" />
        <div className="absolute top-40 right-10 w-40 h-40 rounded-full bg-[#00f0ff] opacity-15 blur-3xl animate-float" />
        <div className="absolute bottom-40 left-1/4 w-48 h-48 rounded-full bg-[#b026ff] opacity-15 blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-1/4 w-36 h-36 rounded-full bg-[#c6ff00] opacity-10 blur-3xl animate-float" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-animated flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SnackSnap</span>
        </div>
        <button
          onClick={onSignIn}
          className="text-sm font-medium text-white/80 hover:text-white transition-colors tap-scale px-4 py-2 rounded-full glass"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-[#ffe600]" />
          <span className="text-xs font-medium text-white/70">AI-powered snack scanning</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-2xl animate-slide-up delay-100">
          Snap your snacks.
          <br />
          <span className="neon-text">Share the vibe.</span>
        </h1>

        <p className="text-white/60 text-lg mt-6 max-w-md animate-slide-up delay-200">
          The social app for snack obsessed people. Scan packaging, rate flavors, and flex your snack streak.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-slide-up delay-300">
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-full gradient-animated text-white font-bold text-base tap-scale hover:scale-105 transition-transform animate-pulse-glow"
          >
            Get Started Free
          </button>
          <button
            onClick={onSignIn}
            className="px-8 py-3.5 rounded-full glass text-white font-semibold text-base tap-scale hover:bg-white/10 transition-colors"
          >
            I have an account
          </button>
        </div>

        {/* Floating snack cards preview */}
        <div className="relative w-full max-w-md mt-16 h-64 animate-slide-up delay-500">
          <div className="absolute top-0 left-4 w-40 rounded-2xl glass-card overflow-hidden animate-float-slow">
            <img src="https://images.pexels.com/photos/7196436/pexels-photo-7196436.jpeg?auto=compress&cs=tinysrgb&h=300&w=300" alt="" className="w-full h-32 object-cover" />
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-[#ff2d92] text-[#ff2d92]" />
                <span className="text-xs font-medium">234</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">@snackqueen</p>
            </div>
          </div>
          <div className="absolute top-8 right-4 w-40 rounded-2xl glass-card overflow-hidden animate-float">
            <img src="https://images.pexels.com/photos/11251712/pexels-photo-11251712.jpeg?auto=compress&cs=tinysrgb&h=300&w=300" alt="" className="w-full h-32 object-cover" />
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-[#ff2d92] text-[#ff2d92]" />
                <span className="text-xs font-medium">891</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">@sweettooth</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/3 w-40 rounded-2xl glass-card overflow-hidden animate-float-slow delay-300">
            <img src="https://images.pexels.com/photos/4062267/pexels-photo-4062267.jpeg?auto=compress&cs=tinysrgb&h=300&w=300" alt="" className="w-full h-32 object-cover" />
            <div className="p-2.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3 h-3 fill-[#ff2d92] text-[#ff2d92]" />
                <span className="text-xs font-medium">456</span>
              </div>
              <p className="text-[10px] text-white/50 mt-1">@crunchlord</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-4">
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-[#00f0ff]" />}
            title="AI Snack Scan"
            description="Snap a photo and our AI detects the brand, flavor, and name automatically."
            gradient="from-[#00f0ff]/20 to-transparent"
          />
          <FeatureCard
            icon={<TrendingUp className="w-5 h-5 text-[#c6ff00]" />}
            title="Snack Streaks"
            description="Track your daily snacks, build streaks, and climb the snack leaderboard."
            gradient="from-[#c6ff00]/20 to-transparent"
          />
          <FeatureCard
            icon={<Heart className="w-5 h-5 text-[#ff2d92]" />}
            title="Snack Stories"
            description="Share ephemeral snack moments that disappear in 24 hours."
            gradient="from-[#ff2d92]/20 to-transparent"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-16 text-center">
        <h2 className="text-3xl font-extrabold mb-4">
          Your snack era <span className="neon-text-warm">starts now</span>
        </h2>
        <p className="text-white/50 mb-8 max-w-sm mx-auto">Join thousands of snack obsessives sharing their daily crunch.</p>
        <button
          onClick={onGetStarted}
          className="px-10 py-4 rounded-full gradient-animated text-white font-bold text-lg tap-scale hover:scale-105 transition-transform animate-pulse-glow"
        >
          Join SnackSnap
        </button>
      </section>

      <footer className="relative z-10 text-center pb-8 text-white/30 text-xs">
        SnackSnap 2026 — made for snack lovers
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) {
  return (
    <div className={`rounded-2xl glass-card p-5 flex gap-4 items-start hover-lift bg-gradient-to-r ${gradient}`}>
      <div className="w-11 h-11 rounded-xl glass flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-base mb-1">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
