import { Home, Compass, Camera, User, MessageCircle } from 'lucide-react';

export type TabId = 'feed' | 'explore' | 'snap' | 'stories' | 'profile';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  onSnap: () => void;
  unreadMessages: number;
  onOpenMessages: () => void;
}

export function BottomNav({ active, onChange, onSnap, unreadMessages, onOpenMessages }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md px-4 pb-3 safe-bottom pointer-events-auto">
        <div className="glass rounded-3xl flex items-center justify-around px-2 py-2 relative shadow-2xl">
          <NavButton icon={<Home className="w-5 h-5" />} label="Home" active={active === 'feed'} onClick={() => onChange('feed')} />

          {/* Messages button with badge */}
          <button
            onClick={onOpenMessages}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl tap-scale transition-colors text-white/40 relative"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#ff2d92] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Messages</span>
          </button>

          {/* Central Snap button */}
          <button
            onClick={onSnap}
            className="relative -mt-8 w-16 h-16 rounded-full gradient-animated flex items-center justify-center tap-scale hover:scale-110 transition-transform animate-pulse-glow"
          >
            <Camera className="w-7 h-7 text-white" />
            <span className="absolute -bottom-5 text-[10px] font-bold text-white/60">Snap</span>
          </button>

          <NavButton icon={<Compass className="w-5 h-5" />} label="Explore" active={active === 'explore'} onClick={() => onChange('explore')} />
          <NavButton icon={<User className="w-5 h-5" />} label="Profile" active={active === 'profile'} onClick={() => onChange('profile')} />
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl tap-scale transition-colors ${active ? 'text-white' : 'text-white/40'}`}
    >
      <div className={active ? 'text-[#ff2d92]' : ''}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
