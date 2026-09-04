import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Award, Calendar, Loader2, Star } from 'lucide-react';
import type { SnackWithProfile, Profile } from '@/lib/types';
import { getMySnacks, getProfile, getFollowersCount, getFollowingCount } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface StatsPageProps {
  onSnap: () => void;
}

export function StatsPage({ onSnap }: StatsPageProps) {
  const { user, profile } = useAuth();
  const [snacks, setSnacks] = useState<SnackWithProfile[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getMySnacks(user.id),
      getFollowersCount(user.id),
      getFollowingCount(user.id),
    ]).then(([snackData, followersCount, followingCount]) => {
      setSnacks(snackData);
      setFollowers(followersCount);
      setFollowing(followingCount);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff2d92]" />
      </div>
    );
  }

  // Calculate weekly data
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7;
  const weekData = weekDays.map((day, i) => {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - dayOfWeek + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const count = snacks.filter((s) => {
      const d = new Date(s.created_at);
      return d >= dayStart && d <= dayEnd;
    }).length;
    return { day, count, isToday: i === dayOfWeek };
  });

  const maxCount = Math.max(...weekData.map((d) => d.count), 1);
  const totalThisWeek = weekData.reduce((sum, d) => sum + d.count, 0);
  const avgRating = snacks.length > 0
    ? (snacks.reduce((sum, s) => sum + (s.rating ?? 0), 0) / snacks.length).toFixed(1)
    : '0.0';

  const topBrands: Record<string, number> = {};
  snacks.forEach((s) => {
    if (s.brand) topBrands[s.brand] = (topBrands[s.brand] ?? 0) + 1;
  });
  const sortedBrands = Object.entries(topBrands).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/5 px-5 py-3">
        <h1 className="font-extrabold text-xl">Your Stats</h1>
      </div>

      {/* Streak card */}
      <div className="px-4 py-4">
        <div className="rounded-2xl glass-card p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#ff7a00] opacity-15 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-animated flex items-center justify-center animate-pulse-glow">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-3xl font-extrabold">{profile?.snack_streak ?? 0}</p>
              <p className="text-xs text-white/50">day snack streak</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-extrabold neon-text-warm">{profile?.total_snaps ?? snacks.length}</p>
              <p className="text-xs text-white/50">total snaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-4">
        <StatCard icon={<TrendingUp className="w-4 h-4 text-[#00f0ff]" />} value={totalThisWeek} label="This Week" />
        <StatCard icon={<Star className="w-4 h-4 text-[#ffe600]" />} value={avgRating} label="Avg Rating" />
        <StatCard icon={<Award className="w-4 h-4 text-[#ff2d92]" />} value={followers} label="Followers" />
      </div>

      {/* Weekly chart */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[#c6ff00]" />
            <h3 className="font-bold text-sm">This Week</h3>
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${d.isToday ? 'gradient-animated' : 'bg-white/15'}`}
                    style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '8px' : '2px' }}
                  >
                    {d.count > 0 && (
                      <span className="text-[10px] font-bold text-white text-center block pt-1">{d.count}</span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] ${d.isToday ? 'text-[#ff2d92] font-bold' : 'text-white/40'}`}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top brands */}
      {sortedBrands.length > 0 && (
        <div className="px-4 mb-4">
          <div className="rounded-2xl glass-card p-5">
            <h3 className="font-bold text-sm mb-4">Top Brands</h3>
            <div className="space-y-3">
              {sortedBrands.map(([brand, count], i) => (
                <div key={brand} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/30 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{brand}</span>
                      <span className="text-xs text-white/40">{count}x</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-animated transition-all duration-500"
                        style={{ width: `${(count / sortedBrands[0][1]) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Following count */}
      <div className="px-4">
        <div className="rounded-2xl glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#b026ff]" />
            <span className="text-sm font-medium">Following</span>
          </div>
          <span className="text-lg font-bold">{following}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div className="rounded-2xl glass-card p-3.5 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-xl font-extrabold">{value}</p>
      <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
    </div>
  );
}
