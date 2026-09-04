import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ToastProvider } from '@/components/Toast';
import { LandingPage } from '@/components/LandingPage';
import { AuthPage } from '@/components/AuthPage';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { FeedPage } from '@/components/FeedPage';
import { ExplorePage } from '@/components/ExplorePage';
import { SnapPage } from '@/components/SnapPage';
import { StatsPage } from '@/components/StatsPage';
import { ProfilePage } from '@/components/ProfilePage';
import { NotificationsPage } from '@/components/NotificationsPage';
import { MessagesPage } from '@/components/MessagesPage';
import { UserProfilePage } from '@/components/UserProfilePage';
import { CommentSheet } from '@/components/CommentSheet';
import { SettingsSheet } from '@/components/SettingsSheet';
import { FriendsModal } from '@/components/FriendsModal';
import { ShareSheet } from '@/components/ShareSheet';
import { Bell, Loader2 } from 'lucide-react';
import type { SnackWithProfile } from '@/lib/types';
import { getUnreadMessageCount } from '@/lib/api';

type Screen = 'landing' | 'signin' | 'signup' | 'app';

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [snapOpen, setSnapOpen] = useState(false);
  const [commentSnackId, setCommentSnackId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [friendsModal, setFriendsModal] = useState<{ userId: string; type: 'followers' | 'following' | 'friends' } | null>(null);
  const [shareSnack, setShareSnack] = useState<SnackWithProfile | null>(null);
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  const [sharedSnackForMessage, setSharedSnackForMessage] = useState<SnackWithProfile | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user) {
      getUnreadMessageCount(user.id).then(setUnreadMessages);
    }
  }, [user, showMessages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff2d92]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen max-w-md mx-auto relative">
        {/* Top bar with notifications */}
        {!showNotifications && !showMessages && !viewingUserId && (
          <button
            onClick={() => setShowNotifications(true)}
            className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full glass flex items-center justify-center tap-scale"
          >
            <Bell className="w-5 h-5 text-white/70" />
          </button>
        )}

        {/* Notifications view */}
        {showNotifications && (
          <>
            <NotificationsPage />
            <button
              onClick={() => setShowNotifications(false)}
              className="fixed top-4 left-4 z-30 px-3 py-1.5 rounded-full glass text-xs font-semibold tap-scale"
            >
              Back
            </button>
          </>
        )}

        {/* Messages view */}
        {showMessages && !showNotifications && (
          <>
            <MessagesPage
              preselectedUserId={messageTargetUserId}
              onClearPreselected={() => setMessageTargetUserId(null)}
              sharedSnack={sharedSnackForMessage}
              onClearSharedSnack={() => setSharedSnackForMessage(null)}
              onOpenUserProfile={(uid) => { setShowMessages(false); setViewingUserId(uid); }}
            />
            {!viewingUserId && (
              <button
                onClick={() => { setShowMessages(false); setMessageTargetUserId(null); }}
                className="fixed top-4 left-4 z-30 px-3 py-1.5 rounded-full glass text-xs font-semibold tap-scale"
              >
                Back
              </button>
            )}
          </>
        )}

        {/* User profile view */}
        {viewingUserId && (
          <UserProfilePage
            userId={viewingUserId}
            onBack={() => setViewingUserId(null)}
            onOpenComments={setCommentSnackId}
            onOpenMessages={(uid) => { setViewingUserId(null); setMessageTargetUserId(uid); setShowMessages(true); }}
            onOpenFriendsModal={(uid, type) => setFriendsModal({ userId: uid, type })}
          />
        )}

        {/* Main tabs */}
        {!showNotifications && !showMessages && !viewingUserId && (
          <>
            {activeTab === 'feed' && (
              <FeedPage
                onSnap={() => setSnapOpen(true)}
                onOpenComments={setCommentSnackId}
                onOpenProfile={(uid) => setViewingUserId(uid)}
                onShare={(snack) => setShareSnack(snack)}
              />
            )}
            {activeTab === 'explore' && (
              <ExplorePage
                onOpenComments={setCommentSnackId}
                onOpenProfile={(uid) => setViewingUserId(uid)}
                onShare={(snack) => setShareSnack(snack)}
              />
            )}
            {activeTab === 'stories' && (
              <FeedPage
                onSnap={() => setSnapOpen(true)}
                onOpenComments={setCommentSnackId}
                onOpenProfile={(uid) => setViewingUserId(uid)}
                onShare={(snack) => setShareSnack(snack)}
              />
            )}
            {activeTab === 'profile' && (
              <ProfilePage
                onOpenComments={setCommentSnackId}
                onOpenSettings={() => setSettingsOpen(true)}
                onOpenFriendsModal={(type) => setFriendsModal({ userId: user.id, type })}
              />
            )}
          </>
        )}

        {/* Bottom nav - hide when in messages or user profile */}
        {!showMessages && !viewingUserId && (
          <BottomNav
            active={activeTab}
            onChange={setActiveTab}
            onSnap={() => setSnapOpen(true)}
            unreadMessages={unreadMessages}
            onOpenMessages={() => setShowMessages(true)}
          />
        )}

        {/* Overlays */}
        {snapOpen && (
          <SnapPage
            onClose={() => setSnapOpen(false)}
            onPosted={() => { setSnapOpen(false); setActiveTab('feed'); }}
          />
        )}
        {commentSnackId && (
          <CommentSheet snackId={commentSnackId} onClose={() => setCommentSnackId(null)} />
        )}
        {settingsOpen && (
          <SettingsSheet onClose={() => setSettingsOpen(false)} />
        )}
        {friendsModal && (
          <FriendsModal
            userId={friendsModal.userId}
            type={friendsModal.type}
            onClose={() => setFriendsModal(null)}
            onOpenUserProfile={(uid) => { setFriendsModal(null); setViewingUserId(uid); }}
            onOpenMessages={(uid) => { setFriendsModal(null); setMessageTargetUserId(uid); setShowMessages(true); }}
          />
        )}
        {shareSnack && (
          <ShareSheet
            snack={shareSnack}
            onClose={() => setShareSnack(null)}
            onShareToUser={(uid) => { setMessageTargetUserId(uid); setShowMessages(true); setSharedSnackForMessage(shareSnack); }}
          />
        )}
      </div>
    );
  }

  // Not signed in
  if (screen === 'landing') {
    return <LandingPage onGetStarted={() => setScreen('signup')} onSignIn={() => setScreen('signin')} />;
  }

  if (screen === 'signin' || screen === 'signup') {
    return (
      <AuthPage
        mode={screen}
        onBack={() => setScreen('landing')}
        onSwitchMode={(m) => setScreen(m)}
      />
    );
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
