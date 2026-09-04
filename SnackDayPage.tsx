import { useEffect, useState } from 'react';
import { Sun, Sunset, Moon, Coffee, Loader2, Camera } from 'lucide-react';
import type { SnackWithProfile } from '@/lib/types';
import { getMySnacks } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface SnackDayPageProps {
  onSnap: () => void;
}

const timeConfig = {
  morning: { icon: Coffee, color: '#ffe600', label: 'Morning' },
  afternoon: { icon: Sun, color: '#ff7a00', label: 'Afternoon' },
  evening: { icon: Sunset, color: '#ff2d92', label: 'Evening' },
  night: { icon: Moon, color: '#b026ff', label: 'Night' },
};

export function SnackDayPage({ onSnap }: SnackDayPageProps) {
  const { user } = useAuth();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMySnacks(user.id).then((data) => {
      setSnacks(data);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const grouped = {
    morning: snacks.filter((s) => s.time_of_day === 'morning'),
    afternoon: snacks.filter((s) => s.time_of_day === 'afternoon'),
    evening: snacks.filter((s) => s.time_of_day === 'evening'),
    night: snacks.filter((s) => s.time_of_day === 'night'),
  };

  const totalToday = snacks.length;

  return (
    <div className="pb-32 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3">
        <h1 className="font-extrabold text-xl">My Snack Day</h1>
        <p className="text-xs text-white/40 mt-0.5">{today}</p>
      </div>

      {/* Summary card */}
      <div className="px-4 py-4">
        <div className="rounded-2xl glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-3xl font-extrabold neon-text">{totalToday}</p>
            <p className="text-xs text-white/50 mt-1">snacks today</p>
          </div>
          <div className="flex gap-3">
            {Object.entries(grouped).map(([key, items]) => {
              const config = timeConfig[key as keyof typeof timeConfig];
              const Icon = config.icon;
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${items.length > 0 ? 'glass' : 'opacity-30'}`}>
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <span className="text-[10px] text-white/40">{items.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff2d92]" />
          </div>
        ) : totalToday === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50 text-sm mb-1">No snacks logged today</p>
            <p className="text-white/30 text-xs mb-6">Snap your first snack to start your day</p>
            <button
              onClick={onSnap}
              className="px-6 py-3 rounded-full gradient-animated text-white font-bold text-sm tap-scale hover:scale-105 transition-transform"
            >
              Snap a Snack
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#ffe600] via-[#ff2d92] to-[#b026ff]" />

            {Object.entries(grouped).map(([key, items]) => {
              const config = timeConfig[key as keyof typeof timeConfig];
              const Icon = config.icon;
              if (items.length === 0) return null;
              return (
                <div key={key} className="mb-6">
                  {/* Time header */}
                  <div className="flex items-center gap-3 mb-4 relative">
                    <div className="w-14 h-14 rounded-full glass flex items-center justify-center z-10 relative" style={{ boxShadow: `0 0 20px ${config.color}40` }}>
                      <Icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{config.label}</h3>
                      <p className="text-xs text-white/40">{items.length} snack{items.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Snacks */}
                  <div className="ml-20 space-y-3">
                    {items.map((snack) => (
                      <div key={snack.id} className="rounded-2xl glass-card overflow-hidden hover-lift animate-slide-up">
                        <div className="flex">
                          <img src={snack.image_url} alt={snack.snack_name ?? 'Snack'} className="w-24 h-24 object-cover shrink-0" />
                          <div className="p-3 flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{snack.snack_name ?? 'Unknown Snack'}</p>
                            <p className="text-xs text-white/40 truncate">{snack.brand} - {snack.flavor}</p>
                            {snack.caption && (
                              <p className="text-xs text-white/60 mt-1 line-clamp-2">{snack.caption}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              {snack.rating && (
                                <span className="text-xs text-[#ffe600] font-bold">{snack.rating}/5</span>
                              )}
                              {snack.mood && (
                                <span className="text-xs text-white/40">#{snack.mood}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
