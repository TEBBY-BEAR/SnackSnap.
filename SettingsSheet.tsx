import { X, LogOut, Bell, User, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SettingsSheetProps {
  onClose: () => void;
}

export function SettingsSheet({ onClose }: SettingsSheetProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-t-3xl border-t border-white/10 animate-slide-up safe-bottom">
        {/* Handle */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="font-bold text-base">Settings</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile summary */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <img
            src={profile?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
            alt="You"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-bold text-sm">{profile?.display_name ?? 'User'}</p>
            <p className="text-xs text-white/40">@{profile?.username ?? 'user'}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-3 space-y-1">
          <SettingItem icon={<User className="w-4 h-4 text-[#ff2d92]" />} label="Edit Profile" />
          <SettingItem icon={<Bell className="w-4 h-4 text-[#00f0ff]" />} label="Notifications" />
          <SettingItem icon={<Shield className="w-4 h-4 text-[#c6ff00]" />} label="Privacy" />
          <SettingItem icon={<HelpCircle className="w-4 h-4 text-[#b026ff]" />} label="Help & Support" />
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors tap-scale"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors tap-scale">
      <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
