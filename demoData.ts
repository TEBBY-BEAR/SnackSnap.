import type {
  Profile,
  Snack,
  Story,
  Notification,
  Message,
} from './types';

export interface DemoProfile extends Profile {
  is_demo: true;
  is_online?: boolean;
}

export interface DemoSnack extends Snack {
  is_demo: true;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  liked_by_me: boolean;
  saved_by_me: boolean;
}

export interface DemoStory extends Story {
  is_demo: true;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  viewed_by_me: boolean;
}

export interface DemoNotification extends Notification {
  is_demo: true;
  actor: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export interface DemoConversation {
  id: string;
  other_user_id: string;
  other_user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    is_online: boolean;
  };
  last_message: {
    text: string | null;
    shared_snack_id: string | null;
    sender_id: string;
    created_at: string;
  } | null;
  unread_count: number;
}

export interface DemoMessage extends Message {
  sender: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  reactions: { emoji: string; user_id: string }[];
  shared_snack?: DemoSnack | null;
}

const snackImages = [
  'https://images.pexels.com/photos/7196436/pexels-photo-7196436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/15225307/pexels-photo-15225307.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4062267/pexels-photo-4062267.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/33395007/pexels-photo-33395007.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/5495383/pexels-photo-5495383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/11251712/pexels-photo-11251712.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7196444/pexels-photo-7196444.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13060681/pexels-photo-13060681.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7394823/pexels-photo-7394823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/5137520/pexels-photo-5137520.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28942361/pexels-photo-28942361.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4115018/pexels-photo-4115018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4115024/pexels-photo-4115024.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/2372524/pexels-photo-2372524.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/9592498/pexels-photo-9592498.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/1616036/pexels-photo-1616036.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13060680/pexels-photo-13060680.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7501063/pexels-photo-7501063.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const avatarImages = [
  'https://images.pexels.com/photos/8941776/pexels-photo-8941776.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/13870754/pexels-photo-13870754.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/3781544/pexels-photo-3781544.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/11034423/pexels-photo-11034423.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/8957650/pexels-photo-8957650.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/36764828/pexels-photo-36764828.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/3756812/pexels-photo-3756812.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/7708632/pexels-photo-7708632.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/7035535/pexels-photo-7035535.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/6697317/pexels-photo-6697317.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/8173480/pexels-photo-8173480.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/36730368/pexels-photo-36730368.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/36729558/pexels-photo-36729558.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/27086993/pexels-photo-27086993.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
  'https://images.pexels.com/photos/36763520/pexels-photo-36763520.jpeg?auto=compress&cs=tinysrgb&h=200&w=200',
];

const demoUsers: DemoProfile[] = [
  { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', bio: 'snack influencer energy | NYC', avatar_url: avatarImages[0], snack_streak: 47, total_snaps: 312, created_at: '2024-01-15T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-2', username: 'crunchlord', display_name: 'Dev', bio: 'professional chip ranker', avatar_url: avatarImages[1], snack_streak: 23, total_snaps: 189, created_at: '2024-02-20T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-3', username: 'sweettooth', display_name: 'Aria', bio: 'candy is a personality trait', avatar_url: avatarImages[2], snack_streak: 89, total_snaps: 521, created_at: '2023-11-01T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-4', username: 'munchiesman', display_name: 'Kai', bio: 'midnight snack specialist', avatar_url: avatarImages[3], snack_streak: 12, total_snaps: 78, created_at: '2024-06-10T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-5', username: 'wrappercollector', display_name: 'Luna', bio: 'I eat with my eyes first', avatar_url: avatarImages[4], snack_streak: 34, total_snaps: 256, created_at: '2024-03-05T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-6', username: 'snackvibes', display_name: 'Zoe', bio: 'every snack is a vibe check', avatar_url: avatarImages[5], snack_streak: 67, total_snaps: 401, created_at: '2023-09-12T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-7', username: 'chipcheck', display_name: 'Ryder', bio: 'ranking everything I eat', avatar_url: avatarImages[6], snack_streak: 5, total_snaps: 43, created_at: '2024-08-01T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-8', username: 'sugarrush', display_name: 'Ivy', bio: 'sweet things only', avatar_url: avatarImages[7], snack_streak: 56, total_snaps: 367, created_at: '2024-01-28T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-9', username: 'snackpackninja', display_name: 'Theo', bio: 'stealth snacking since 2019', avatar_url: avatarImages[8], snack_streak: 31, total_snaps: 145, created_at: '2024-04-18T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-10', username: 'candycore', display_name: 'Nova', bio: 'neon candy aesthetic', avatar_url: avatarImages[9], snack_streak: 78, total_snaps: 489, created_at: '2023-07-22T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-11', username: 'saltybestie', display_name: 'Jax', bio: 'salty > sweet, fight me', avatar_url: avatarImages[10], snack_streak: 15, total_snaps: 92, created_at: '2024-05-30T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-12', username: 'snackoracle', display_name: 'Sage', bio: 'I predict your next snack', avatar_url: avatarImages[11], snack_streak: 102, total_snaps: 678, created_at: '2023-04-15T10:00:00Z', is_demo: true, is_online: true },
  { id: 'demo-13', username: 'crispyqueen', display_name: 'Remi', bio: 'crunch is life', avatar_url: avatarImages[12], snack_streak: 44, total_snaps: 234, created_at: '2024-02-14T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-14', username: 'snackdad', display_name: 'Eli', bio: 'dad snacks hit different', avatar_url: avatarImages[13], snack_streak: 8, total_snaps: 56, created_at: '2024-07-01T10:00:00Z', is_demo: true, is_online: false },
  { id: 'demo-15', username: 'vendingvibes', display_name: 'Sky', bio: 'vending machine connoisseur', avatar_url: avatarImages[14], snack_streak: 27, total_snaps: 178, created_at: '2024-03-22T10:00:00Z', is_demo: true, is_online: true },
];

const snackBrands = [
  { brand: 'ChocoCrunch', flavor: 'Cookies & Cream', name: 'ChocoCrunch Bar' },
  { brand: 'SpicyHeat', flavor: 'Jalapeno', name: 'SpicyHeat Chips' },
  { brand: 'GummyGalaxy', flavor: 'Sour Watermelon', name: 'Galaxy Gummies' },
  { brand: 'PuffNation', flavor: 'Cheddar Blast', name: 'Puff Nation' },
  { brand: 'CookieDream', flavor: 'Double Chocolate', name: 'Dream Cookies' },
  { brand: 'WaveSnacks', flavor: 'Sea Salt Vinegar', name: 'Wave Chips' },
  { brand: 'FruitBurst', flavor: 'Tropical Mix', name: 'Fruit Burst' },
  { brand: 'NuttyBuddy', flavor: 'Hazel Cocoa', name: 'Nutty Bar' },
];

const captions = [
  'this packaging goes HARD',
  'the color combo on this is unreal',
  'okay but why is this so good',
  'snack of the day fr fr',
  'the vibes are immaculate',
  'no because look at this wrapper',
  'main character snack energy',
  'this hits different at 2am',
  'obsessed with this packaging',
  'best snack I have had this week',
  'the crunch is next level',
  'rating this a 10/10 no notes',
];

const moods = ['craving', 'obsessed', 'midnight', 'cozy', 'wild', 'chill'];
const timeSlots = ['morning', 'afternoon', 'evening', 'night'];

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

export const demoSnacks: DemoSnack[] = Array.from({ length: 30 }, (_, i) => {
  const user = demoUsers[i % demoUsers.length];
  const brandInfo = randomFrom(snackBrands, i);
  const timeSlot = randomFrom(timeSlots, i);
  const hoursBack = i * 1.5 + 1;
  return {
    id: `demo-snack-${i}`,
    user_id: user.id,
    image_url: snackImages[i % snackImages.length],
    brand: brandInfo.brand,
    flavor: brandInfo.flavor,
    snack_name: brandInfo.name,
    caption: randomFrom(captions, i + 3),
    rating: ((i % 4) + 2),
    mood: randomFrom(moods, i + 1),
    time_of_day: timeSlot,
    like_count: Math.floor(Math.random() * 800) + 20,
    comment_count: Math.floor(Math.random() * 50) + 1,
    created_at: hoursAgo(hoursBack),
    is_demo: true,
    profiles: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    },
    liked_by_me: i % 5 === 0,
    saved_by_me: i % 7 === 0,
  };
});

export const demoStories: DemoStory[] = demoUsers.slice(0, 8).map((user, i) => ({
  id: `demo-story-${i}`,
  user_id: user.id,
  image_url: snackImages[(i + 5) % snackImages.length],
  caption: randomFrom(captions, i),
  view_count: Math.floor(Math.random() * 300) + 10,
  expires_at: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
  created_at: hoursAgo(i + 1),
  is_demo: true,
  profiles: {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
  },
  viewed_by_me: i > 4,
}));

export const demoNotifications: DemoNotification[] = [
  { id: 'dn-1', user_id: 'me', actor_id: 'demo-1', type: 'like', snack_id: 'demo-snack-0', text: 'liked your snack', is_read: false, created_at: hoursAgo(0.5), is_demo: true, actor: { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', avatar_url: avatarImages[0] } },
  { id: 'dn-2', user_id: 'me', actor_id: 'demo-3', type: 'follow', snack_id: null, text: 'started following you', is_read: false, created_at: hoursAgo(1), is_demo: true, actor: { id: 'demo-3', username: 'sweettooth', display_name: 'Aria', avatar_url: avatarImages[2] } },
  { id: 'dn-3', user_id: 'me', actor_id: 'demo-10', type: 'friend_request', snack_id: null, text: 'sent you a friend request', is_read: false, created_at: hoursAgo(2), is_demo: true, actor: { id: 'demo-10', username: 'candycore', display_name: 'Nova', avatar_url: avatarImages[9] } },
  { id: 'dn-4', user_id: 'me', actor_id: 'demo-2', type: 'comment', snack_id: 'demo-snack-0', text: 'commented: this looks fire', is_read: false, created_at: hoursAgo(3), is_demo: true, actor: { id: 'demo-2', username: 'crunchlord', display_name: 'Dev', avatar_url: avatarImages[1] } },
  { id: 'dn-5', user_id: 'me', actor_id: 'demo-5', type: 'like', snack_id: 'demo-snack-1', text: 'liked your snack', is_read: false, created_at: hoursAgo(4), is_demo: true, actor: { id: 'demo-5', username: 'wrappercollector', display_name: 'Luna', avatar_url: avatarImages[4] } },
  { id: 'dn-6', user_id: 'me', actor_id: 'demo-12', type: 'friend_request', snack_id: null, text: 'sent you a friend request', is_read: false, created_at: hoursAgo(5), is_demo: true, actor: { id: 'demo-12', username: 'snackoracle', display_name: 'Sage', avatar_url: avatarImages[11] } },
  { id: 'dn-7', user_id: 'me', actor_id: 'demo-6', type: 'follow', snack_id: null, text: 'started following you', is_read: true, created_at: hoursAgo(8), is_demo: true, actor: { id: 'demo-6', username: 'snackvibes', display_name: 'Zoe', avatar_url: avatarImages[5] } },
  { id: 'dn-8', user_id: 'me', actor_id: 'demo-8', type: 'comment', snack_id: 'demo-snack-1', text: 'commented: where did you find this', is_read: true, created_at: hoursAgo(12), is_demo: true, actor: { id: 'demo-8', username: 'sugarrush', display_name: 'Ivy', avatar_url: avatarImages[7] } },
  { id: 'dn-9', user_id: 'me', actor_id: 'demo-4', type: 'like', snack_id: 'demo-snack-2', text: 'liked your snack', is_read: true, created_at: hoursAgo(20), is_demo: true, actor: { id: 'demo-4', username: 'munchiesman', display_name: 'Kai', avatar_url: avatarImages[3] } },
  { id: 'dn-10', user_id: 'me', actor_id: 'demo-7', type: 'friend_accepted', snack_id: null, text: 'accepted your friend request', is_read: true, created_at: hoursAgo(24), is_demo: true, actor: { id: 'demo-7', username: 'chipcheck', display_name: 'Ryder', avatar_url: avatarImages[6] } },
  { id: 'dn-11', user_id: 'me', actor_id: 'demo-15', type: 'message', snack_id: null, text: 'sent you a message', is_read: true, created_at: hoursAgo(26), is_demo: true, actor: { id: 'demo-15', username: 'vendingvibes', display_name: 'Sky', avatar_url: avatarImages[14] } },
  { id: 'dn-12', user_id: 'me', actor_id: 'demo-9', type: 'story', snack_id: null, text: 'reacted to your story', is_read: true, created_at: hoursAgo(30), is_demo: true, actor: { id: 'demo-9', username: 'snackpackninja', display_name: 'Theo', avatar_url: avatarImages[8] } },
];

export const demoConversations: DemoConversation[] = [
  {
    id: 'dc-1',
    other_user_id: 'demo-1',
    other_user: { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', avatar_url: avatarImages[0], is_online: true },
    last_message: { text: 'that choco bar was INSANE', shared_snack_id: null, sender_id: 'demo-1', created_at: hoursAgo(0.5) },
    unread_count: 2,
  },
  {
    id: 'dc-2',
    other_user_id: 'demo-3',
    other_user: { id: 'demo-3', username: 'sweettooth', display_name: 'Aria', avatar_url: avatarImages[2], is_online: true },
    last_message: { text: 'check this out', shared_snack_id: 'demo-snack-5', sender_id: 'demo-3', created_at: hoursAgo(3) },
    unread_count: 1,
  },
  {
    id: 'dc-3',
    other_user_id: 'demo-10',
    other_user: { id: 'demo-10', username: 'candycore', display_name: 'Nova', avatar_url: avatarImages[9], is_online: true },
    last_message: { text: 'we should do a snack trade fr', shared_snack_id: null, sender_id: 'me', created_at: hoursAgo(8) },
    unread_count: 0,
  },
  {
    id: 'dc-4',
    other_user_id: 'demo-15',
    other_user: { id: 'demo-15', username: 'vendingvibes', display_name: 'Sky', avatar_url: avatarImages[14], is_online: true },
    last_message: { text: 'found the best vending machine snack', shared_snack_id: 'demo-snack-10', sender_id: 'demo-15', created_at: hoursAgo(26) },
    unread_count: 0,
  },
  {
    id: 'dc-5',
    other_user_id: 'demo-12',
    other_user: { id: 'demo-12', username: 'snackoracle', display_name: 'Sage', avatar_url: avatarImages[11], is_online: false },
    last_message: { text: 'your snack streak is legendary', shared_snack_id: null, sender_id: 'demo-12', created_at: hoursAgo(48) },
    unread_count: 0,
  },
];

export const demoMessages: Record<string, DemoMessage[]> = {
  'dc-1': [
    { id: 'dm-1-1', conversation_id: 'dc-1', sender_id: 'demo-1', text: 'yo did you see the new ChocoCrunch drop?', shared_snack_id: null, is_read: true, created_at: hoursAgo(2), sender: { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', avatar_url: avatarImages[0] }, reactions: [] },
    { id: 'dm-1-2', conversation_id: 'dc-1', sender_id: 'me', text: 'yes!! the packaging is unreal', shared_snack_id: null, is_read: true, created_at: hoursAgo(1.8), sender: null, reactions: [{ emoji: '🔥', user_id: 'demo-1' }] },
    { id: 'dm-1-3', conversation_id: 'dc-1', sender_id: 'demo-1', text: 'right?? the neon wrapper goes crazy', shared_snack_id: null, is_read: true, created_at: hoursAgo(1.5), sender: { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', avatar_url: avatarImages[0] }, reactions: [] },
    { id: 'dm-1-4', conversation_id: 'dc-1', sender_id: 'me', text: 'I just posted it actually', shared_snack_id: 'demo-snack-0', is_read: true, created_at: hoursAgo(1), sender: null, reactions: [{ emoji: '😍', user_id: 'demo-1' }] },
    { id: 'dm-1-5', conversation_id: 'dc-1', sender_id: 'demo-1', text: 'that choco bar was INSANE', shared_snack_id: null, is_read: false, created_at: hoursAgo(0.5), sender: { id: 'demo-1', username: 'snackqueen', display_name: 'Maya', avatar_url: avatarImages[0] }, reactions: [] },
  ],
  'dc-2': [
    { id: 'dm-2-1', conversation_id: 'dc-2', sender_id: 'demo-3', text: 'okay you NEED to try these gummies', shared_snack_id: null, is_read: true, created_at: hoursAgo(5), sender: { id: 'demo-3', username: 'sweettooth', display_name: 'Aria', avatar_url: avatarImages[2] }, reactions: [] },
    { id: 'dm-2-2', conversation_id: 'dc-2', sender_id: 'me', text: 'send me the pic', shared_snack_id: null, is_read: true, created_at: hoursAgo(4), sender: null, reactions: [] },
    { id: 'dm-2-3', conversation_id: 'dc-2', sender_id: 'demo-3', text: 'check this out', shared_snack_id: 'demo-snack-5', is_read: false, created_at: hoursAgo(3), sender: { id: 'demo-3', username: 'sweettooth', display_name: 'Aria', avatar_url: avatarImages[2] }, reactions: [] },
  ],
  'dc-3': [
    { id: 'dm-3-1', conversation_id: 'dc-3', sender_id: 'demo-10', text: 'your snack grid is fire', shared_snack_id: null, is_read: true, created_at: hoursAgo(10), sender: { id: 'demo-10', username: 'candycore', display_name: 'Nova', avatar_url: avatarImages[9] }, reactions: [{ emoji: '🔥', user_id: 'me' }] },
    { id: 'dm-3-2', conversation_id: 'dc-3', sender_id: 'me', text: 'we should do a snack trade fr', shared_snack_id: null, is_read: true, created_at: hoursAgo(8), sender: null, reactions: [] },
  ],
  'dc-4': [
    { id: 'dm-4-1', conversation_id: 'dc-4', sender_id: 'demo-15', text: 'found the best vending machine snack', shared_snack_id: 'demo-snack-10', is_read: true, created_at: hoursAgo(26), sender: { id: 'demo-15', username: 'vendingvibes', display_name: 'Sky', avatar_url: avatarImages[14] }, reactions: [{ emoji: '😋', user_id: 'me' }] },
  ],
  'dc-5': [
    { id: 'dm-5-1', conversation_id: 'dc-5', sender_id: 'demo-12', text: 'your snack streak is legendary', shared_snack_id: null, is_read: true, created_at: hoursAgo(48), sender: { id: 'demo-12', username: 'snackoracle', display_name: 'Sage', avatar_url: avatarImages[11] }, reactions: [] },
    { id: 'dm-5-2', conversation_id: 'dc-5', sender_id: 'me', text: 'appreciate it Sage!', shared_snack_id: null, is_read: true, created_at: hoursAgo(47), sender: null, reactions: [] },
  ],
};

export const demoFriendRequests = [
  { id: 'fr-1', sender_id: 'demo-10', receiver_id: 'me', status: 'pending' as const, created_at: hoursAgo(2), sender: { id: 'demo-10', username: 'candycore', display_name: 'Nova', avatar_url: avatarImages[9] } },
  { id: 'fr-2', sender_id: 'demo-12', receiver_id: 'me', status: 'pending' as const, created_at: hoursAgo(5), sender: { id: 'demo-12', username: 'snackoracle', display_name: 'Sage', avatar_url: avatarImages[11] } },
  { id: 'fr-3', sender_id: 'demo-7', receiver_id: 'me', status: 'pending' as const, created_at: hoursAgo(12), sender: { id: 'demo-7', username: 'chipcheck', display_name: 'Ryder', avatar_url: avatarImages[6] } },
];

export const demoFriends: string[] = ['demo-1', 'demo-3', 'demo-5', 'demo-8', 'demo-15'];

export const demoFollowing: string[] = ['demo-1', 'demo-3', 'demo-5', 'demo-6', 'demo-8', 'demo-10', 'demo-15'];

export const demoFollowers: string[] = ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6', 'demo-8', 'demo-10', 'demo-12', 'demo-15'];

export const demoMutuals: Record<string, string[]> = {
  'demo-1': ['demo-3', 'demo-5', 'demo-8', 'demo-10'],
  'demo-3': ['demo-1', 'demo-5', 'demo-8', 'demo-12'],
  'demo-10': ['demo-1', 'demo-3', 'demo-8'],
  'demo-12': ['demo-3', 'demo-8', 'demo-10'],
};

export const demoSavedSnacks: DemoSnack[] = demoSnacks.filter((s) => s.saved_by_me);

export const trendingSnacks = demoSnacks
  .slice()
  .sort((a, b) => b.like_count - a.like_count)
  .slice(0, 8);

export const trendingCreators = demoUsers
  .slice()
  .sort((a, b) => b.total_snaps - a.total_snaps)
  .slice(0, 6);

export const suggestedUsers = demoUsers.filter((u) =>
  !demoFollowing.includes(u.id) && u.id !== 'me'
).slice(0, 5);

export const trendingTags = [
  '#snackcheck', '#wrappergame', '#midnightmunch', '#candycore',
  '#chipcheck', '#sweettooth', '#snackstreak', '#crunchtime',
];

export const snackImagesList = snackImages;

export { demoUsers };
