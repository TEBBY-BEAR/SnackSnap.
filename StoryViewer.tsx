import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { StoryWithProfile } from '@/lib/types';
import { recordStoryView } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface StoryViewerProps {
  stories: StoryWithProfile[];
  initialIndex: number;
  onClose: () => void;
}

export function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const { user } = useAuth();
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const story = stories[index];

  useEffect(() => {
    setProgress(0);
    if (user && story && !story.viewed_by_me) {
      recordStoryView(user.id, story.id);
    }
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (index < stories.length - 1) {
            setIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [index, stories.length]);

  if (!story) return null;

  const profile = story.profiles;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-scale-in">
      {/* Progress bars */}
      <div className="flex gap-1 p-3 absolute top-0 left-0 right-0 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 p-3 pt-6 absolute top-0 left-0 right-0 z-10">
        <img
          src={profile?.avatar_url ?? 'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=100&w=100'}
          alt={profile?.display_name ?? 'User'}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-white text-sm font-semibold">{profile?.display_name ?? 'User'}</p>
          <p className="text-white/50 text-xs">@{profile?.username ?? 'user'}</p>
        </div>
        <div className="flex items-center gap-1 text-white/50 text-xs mr-2">
          <Eye className="w-3.5 h-3.5" />
          <span>{story.view_count}</span>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center relative">
        <img src={story.image_url} alt={story.caption ?? 'Story'} className="w-full h-full object-cover" />

        {/* Nav arrows */}
        {index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center tap-scale"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}
        {index < stories.length - 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center tap-scale"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-white text-lg font-medium">{story.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}
