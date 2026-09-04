import { useState, useRef } from 'react';
import { X, Camera, Scan, Check, Edit3, Star, Loader2, Sparkles, Zap, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { insertSnack, insertStory } from '@/lib/api';
import { snackImagesList } from '@/lib/demoData';

interface SnapPageProps {
  onClose: () => void;
  onPosted: () => void;
}

type Step = 'capture' | 'scanning' | 'confirm' | 'success';

const aiSnackData = [
  { brand: 'ChocoCrunch', flavor: 'Cookies & Cream', name: 'ChocoCrunch Bar' },
  { brand: 'SpicyHeat', flavor: 'Jalapeno Lime', name: 'SpicyHeat Chips' },
  { brand: 'GummyGalaxy', flavor: 'Sour Watermelon', name: 'Galaxy Gummies' },
  { brand: 'PuffNation', flavor: 'Cheddar Blast', name: 'Puff Nation' },
  { brand: 'CookieDream', flavor: 'Double Chocolate', name: 'Dream Cookies' },
  { brand: 'WaveSnacks', flavor: 'Sea Salt Vinegar', name: 'Wave Chips' },
];

const moods = ['craving', 'obsessed', 'midnight', 'cozy', 'wild', 'chill'];

export function SnapPage({ onClose, onPosted }: SnapPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('capture');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<typeof aiSnackData[0] | null>(null);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(4);
  const [mood, setMood] = useState('obsessed');
  const [timeOfDay, setTimeOfDay] = useState('afternoon');
  const [postAsStory, setPostAsStory] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(url: string) {
    setImageUrl(url);
    setStep('scanning');
    const result = aiSnackData[Math.floor(Math.random() * aiSnackData.length)];
    setAiResult(result);
    setCaption(`this ${result.name.toLowerCase()} goes HARD`);
    setTimeout(() => setStep('confirm'), 2800);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    handleImageSelect(url);
  }

  async function handlePost() {
    if (!user || !imageUrl) return;
    setPosting(true);
    await insertSnack(
      user.id,
      imageUrl,
      editing ? aiResult?.brand ?? null : aiResult?.brand ?? null,
      aiResult?.flavor ?? null,
      aiResult?.name ?? null,
      caption,
      rating,
      mood,
      timeOfDay,
    );
    if (postAsStory) {
      await insertStory(user.id, imageUrl, caption);
    }
    setPosting(false);
    setStep('success');
    setTimeout(() => {
      onPosted();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 glass border-b border-white/5">
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-bold text-base">
          {step === 'capture' && 'Snap a Snack'}
          {step === 'scanning' && 'AI Scanning...'}
          {step === 'confirm' && 'Confirm Details'}
          {step === 'success' && 'Posted!'}
        </h2>
        <div className="w-6" />
      </div>

      {/* Step: Capture */}
      {step === 'capture' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 animate-slide-up">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

          {/* Camera mock */}
          <div className="w-full max-w-xs aspect-[3/4] rounded-3xl glass-card border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full gradient-animated flex items-center justify-center animate-pulse-glow">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <p className="text-white/50 text-sm text-center px-8">
              Take a photo of your snack packaging, or pick from samples below
            </p>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full max-w-xs py-3.5 rounded-2xl gradient-animated text-white font-bold tap-scale hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>

          {/* Sample snacks */}
          <div className="w-full max-w-xs mt-8">
            <p className="text-xs text-white/40 mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Or try a sample
            </p>
            <div className="grid grid-cols-4 gap-2">
              {snackImagesList.slice(0, 8).map((url, i) => (
                <button
                  key={i}
                  onClick={() => handleImageSelect(url)}
                  className="aspect-square rounded-xl overflow-hidden tap-scale hover:scale-105 transition-transform"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Scanning */}
      {step === 'scanning' && imageUrl && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-full max-w-xs aspect-square rounded-3xl overflow-hidden">
            <img src={imageUrl} alt="Snack" className="w-full h-full object-cover" />
            {/* Scan overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 to-[#ff2d92]/10" />
            <div className="absolute left-0 right-0 h-0.5 bg-[#00f0ff] shadow-[0_0_20px_#00f0ff] animate-scan-line" />
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#00f0ff] rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#00f0ff] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#00f0ff] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#00f0ff] rounded-br-lg" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[#00f0ff]">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-semibold text-sm">AI analyzing packaging...</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff2d92] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#b026ff] animate-pulse delay-200" />
              <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse delay-400" />
            </div>
            <p className="text-white/40 text-xs">Detecting brand, flavor, and snack name</p>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && imageUrl && aiResult && (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="px-5 py-4">
            {/* Image preview */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-4">
              <img src={imageUrl} alt="Snack" className="w-full h-full object-cover" />
            </div>

            {/* AI detected info */}
            <div className="rounded-2xl glass-card p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-animated flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold">AI Detection</span>
                {editing && (
                  <button
                    onClick={() => setEditing(false)}
                    className="ml-auto text-xs text-[#00f0ff] font-semibold"
                  >
                    Done
                  </button>
                )}
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="ml-auto flex items-center gap-1 text-xs text-[#00f0ff] font-semibold"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <DetectedField label="Snack Name" value={aiResult.name} editing={editing}
                  onChange={(v) => setAiResult({ ...aiResult, name: v })} />
                <DetectedField label="Brand" value={aiResult.brand} editing={editing}
                  onChange={(v) => setAiResult({ ...aiResult, brand: v })} />
                <DetectedField label="Flavor" value={aiResult.flavor} editing={editing}
                  onChange={(v) => setAiResult({ ...aiResult, flavor: v })} />
              </div>
            </div>

            {/* Caption */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white/70 mb-1.5 block">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Say something about this snack..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl glass border border-white/10 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#ff2d92]/50 transition-colors resize-none"
              />
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white/70 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="tap-scale"
                  >
                    <Star
                      className={`w-7 h-7 transition-all ${star <= rating ? 'fill-[#ffe600] text-[#ffe600] scale-110' : 'text-white/30'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white/70 mb-2 block">Mood</label>
              <div className="flex gap-2 flex-wrap">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tap-scale transition-colors ${mood === m ? 'gradient-animated text-white' : 'glass text-white/50'}`}
                  >
                    #{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Time of day */}
            <div className="mb-4">
              <label className="text-sm font-medium text-white/70 mb-2 block">Time of Day</label>
              <div className="flex gap-2">
                {['morning', 'afternoon', 'evening', 'night'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeOfDay(t)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize tap-scale transition-colors ${timeOfDay === t ? 'gradient-animated text-white' : 'glass text-white/50'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Story toggle */}
            <button
              onClick={() => setPostAsStory(!postAsStory)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl glass-card tap-scale"
            >
              <div className="flex items-center gap-2">
                <div className={`w-10 h-6 rounded-full transition-colors ${postAsStory ? 'gradient-animated' : 'bg-white/15'} relative`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${postAsStory ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium">Also post to Story</span>
              </div>
            </button>
          </div>

          {/* Post button */}
          <div className="fixed bottom-0 left-0 right-0 px-5 py-4 glass border-t border-white/5 safe-bottom">
            <button
              onClick={handlePost}
              disabled={posting}
              className="w-full max-w-md mx-auto block py-3.5 rounded-2xl gradient-animated text-white font-bold tap-scale hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {posting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Post Snack
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-bounce-in">
          <div className="w-24 h-24 rounded-full gradient-animated flex items-center justify-center mb-6 animate-pulse-glow">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2">Snack Posted!</h2>
          <p className="text-white/50 text-sm">Your snack is now live in the feed</p>
        </div>
      )}
    </div>
  );
}

function DetectedField({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg glass border border-white/10 text-sm text-white outline-none focus:border-[#00f0ff]/50 transition-colors"
        />
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{value}</span>
          <div className="px-1.5 py-0.5 rounded bg-[#00f0ff]/15 text-[#00f0ff] text-[10px] font-bold flex items-center gap-1">
            <Scan className="w-2.5 h-2.5" />
            AI
          </div>
        </div>
      )}
    </div>
  );
}
