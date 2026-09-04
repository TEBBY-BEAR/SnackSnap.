import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Check, X, Heart, UserPlus, MessageCircle, Bell } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  icon?: 'check' | 'heart' | 'follow' | 'comment' | 'bell';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type'], icon?: Toast['icon']) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success', icon: Toast['icon'] = 'check') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-slide-up max-w-sm pointer-events-auto shadow-2xl"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-[#c6ff00]/20' :
              toast.type === 'error' ? 'bg-red-500/20' : 'bg-[#00f0ff]/20'
            }`}>
              {toast.icon === 'check' && <Check className="w-4 h-4 text-[#c6ff00]" />}
              {toast.icon === 'heart' && <Heart className="w-4 h-4 text-[#ff2d92] fill-[#ff2d92]" />}
              {toast.icon === 'follow' && <UserPlus className="w-4 h-4 text-[#00f0ff]" />}
              {toast.icon === 'comment' && <MessageCircle className="w-4 h-4 text-[#b026ff]" />}
              {toast.icon === 'bell' && <Bell className="w-4 h-4 text-[#ffe600]" />}
            </div>
            <p className="text-sm font-medium text-white">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
