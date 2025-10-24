import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type RoomTheme = 'general' | 'tech' | 'gaming' | 'music' | 'art' | 'sports';
type RoomBadge = 'adult' | 'music' | 'video' | 'none';

type RoomParticipant = {
  username: string;
  avatar: string;
};

type Room = {
  id: string;
  name: string;
  theme: RoomTheme;
  badge?: RoomBadge;
  currentParticipants: number;
  maxParticipants: number;
  participants: RoomParticipant[];
};

type Message = {
  id: string;
  user: string;
  avatar: string;
  bgColor: string;
  text: string;
  timestamp: string;
  isReply?: boolean;
  replyTo?: string;
};

const STANDARD_AVATARS = [
  'https://cdn.poehali.dev/files/90c55e86-49a4-46f2-b041-0d2934b03dbc.png',
  'https://cdn.poehali.dev/files/a73c7cc5-ab03-4413-8658-82ddea3f4f62.png',
  'https://cdn.poehali.dev/files/e63965a5-418e-4797-9ffe-5aa15bf0a608.png',
  'https://cdn.poehali.dev/files/03b0d38a-b9c0-47ad-9108-e008295023c4.png',
  'https://cdn.poehali.dev/files/1531e4f6-da32-40f7-84f0-b191e723fbb8.png',
];
const BACKGROUND_COLORS = [
  { name: 'GRAY', value: '#2D2D2D' },
  { name: 'RED', value: '#633946' },
  { name: 'BLUE', value: '#1e3a8a' },
  { name: 'GREEN', value: '#166534' },
  { name: 'PURPLE', value: '#581c87' },
  { name: 'ORANGE', value: '#9a3412' },
];

const ROOM_THEME_COLORS: Record<RoomTheme, string> = {
  general: '#6B7280',
  tech: '#3B82F6',
  gaming: '#8B5CF6',
  music: '#EC4899',
  art: '#F59E0B',
  sports: '#10B981',
};

const ROOM_THEME_NAMES: Record<RoomTheme, string> = {
  general: 'ОБЩЕЕ',
  tech: 'ТЕХНО',
  gaming: 'ИГРЫ',
  music: 'МУЗЫКА',
  art: 'ИСКУССТВО',
  sports: 'СПОРТ',
};

const ROOM_BADGES: Record<RoomBadge, { icon: string; label: string }> = {
  none: { icon: '', label: 'БЕЗ ЗНАЧКА' },
  adult: { icon: '18+', label: '18+' },
  music: { icon: '🎵', label: 'МУЗЫКА' },
  video: { icon: '🎬', label: 'ВИДЕО' },
};

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'lobby' | 'room' | 'create-room'>('login');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('');
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Lounge',
      theme: 'general',
      currentParticipants: 3,
      maxParticipants: 10,
      participants: [
        { username: 'Alex', avatar: STANDARD_AVATARS[0] },
        { username: 'Maria', avatar: STANDARD_AVATARS[1] },
        { username: 'John', avatar: STANDARD_AVATARS[2] },
      ],
    },
    {
      id: '2',
      name: 'Tech Talk',
      theme: 'tech',
      currentParticipants: 5,
      maxParticipants: 8,
      participants: [
        { username: 'DevGuy', avatar: STANDARD_AVATARS[3] },
        { username: 'Coder', avatar: STANDARD_AVATARS[4] },
        { username: 'Tech', avatar: STANDARD_AVATARS[0] },
        { username: 'AI', avatar: STANDARD_AVATARS[1] },
        { username: 'Web', avatar: STANDARD_AVATARS[2] },
      ],
    },
    {
      id: '3',
      name: 'Gaming Hub',
      theme: 'gaming',
      currentParticipants: 4,
      maxParticipants: 6,
      participants: [
        { username: 'Gamer1', avatar: STANDARD_AVATARS[3] },
        { username: 'Pro', avatar: STANDARD_AVATARS[4] },
        { username: 'Noob', avatar: STANDARD_AVATARS[0] },
        { username: 'Elite', avatar: STANDARD_AVATARS[1] },
      ],
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      user: 'Admin', 
      avatar: STANDARD_AVATARS[0],
      bgColor: '#2D2D2D',
      text: 'Добро пожаловать в комнату!', 
      timestamp: '12:00' 
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTheme, setNewRoomTheme] = useState<RoomTheme>('general');
  const [newRoomBadge, setNewRoomBadge] = useState<RoomBadge>('none');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(10);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const joinRoom = (room: Room) => {
    setCurrentRoom(room);
    setCurrentView('room');
  };

  const leaveRoom = () => {
    setCurrentView('lobby');
    setCurrentRoom(null);
  };

  const createRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: Room = {
        id: Date.now().toString(),
        name: newRoomName,
        theme: newRoomTheme,
        badge: newRoomBadge !== 'none' ? newRoomBadge : undefined,
        currentParticipants: 1,
        maxParticipants: newRoomMaxParticipants,
        participants: [
          { username, avatar: selectedAvatar }
        ],
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setNewRoomTheme('general');
      setNewRoomBadge('none');
      setNewRoomMaxParticipants(10);
      setShowCreateRoom(false);
      joinRoom(newRoom);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: username,
        avatar: selectedAvatar,
        bgColor: selectedBgColor,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isReply: !!replyingTo,
        replyTo: replyingTo ? `@${replyingTo.user}` : undefined,
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleLogin = () => {
    if (username.trim()) {
      const finalAvatar = useCustomAvatar && customAvatar ? customAvatar : (selectedAvatar || STANDARD_AVATARS[0]);
      const finalBgColor = selectedBgColor || BACKGROUND_COLORS[0].value;
      setSelectedAvatar(finalAvatar);
      setSelectedBgColor(finalBgColor);
      setCurrentView('lobby');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomAvatar(event.target?.result as string);
        setUseCustomAvatar(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-['Press_Start_2P']">
      {currentView === 'login' ? (
        <div className="max-w-xl mx-auto mt-12">
          <Card className="border-0 bg-black">
            <CardContent className="p-8 space-y-6">
              <div className="text-center p-8 flex items-center justify-center">
                <img 
                  src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
                  alt="URBAN GROVE" 
                  className="max-w-full h-auto"
                  style={{ maxHeight: '120px' }}
                />
              </div>

              <div>
                <p className="text-xs mb-3">ВЫБЕРИТЕ АВАТАР:</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {STANDARD_AVATARS.map((avatarUrl, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAvatar(avatarUrl);
                        setUseCustomAvatar(false);
                      }}
                      className={`border-2 p-2 transition-colors ${
                        selectedAvatar === avatarUrl && !useCustomAvatar
                          ? 'border-primary bg-primary/20'
                          : 'border-foreground bg-card hover:bg-muted'
                      }`}
                    >
                      <img src={avatarUrl} alt={`avatar-${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-3">ИЛИ ЗАГРУЗИТЕ СВОЮ:</p>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="flex-1 border-2 border-foreground bg-card hover:bg-muted p-3 text-xs cursor-pointer text-center transition-colors"
                  >
                    {useCustomAvatar && customAvatar ? 'ЗАГРУЖЕНО ✓' : 'ВЫБРАТЬ ФАЙЛ'}
                  </label>
                  {useCustomAvatar && customAvatar && (
                    <div className="border-2 border-foreground w-16 h-16 flex items-center justify-center bg-card">
                      <img src={customAvatar} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs mb-3">НИКНЕЙМ:</p>
                <div className="flex gap-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ВВЕДИТЕ ИМЯ"
                    className="border-2 border-foreground text-xs flex-1"
                    maxLength={20}
                  />
                  <div className="relative">
                    <select
                      value={selectedBgColor}
                      onChange={(e) => setSelectedBgColor(e.target.value)}
                      className="border-2 border-foreground bg-card text-foreground p-2 text-xs appearance-none cursor-pointer h-full"
                      style={{ width: '120px' }}
                    >
                      <option value="">ЦВЕТ</option>
                      {BACKGROUND_COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                disabled={!username.trim()}
                className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                ВОЙТИ
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : currentView === 'lobby' ? (
        <div className="min-h-screen flex">
          {/* LEFT SIDEBAR - PROFILE */}
          <div className="w-64 border-r-4 border-foreground p-6 bg-black">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 border-2 border-foreground">
                  <img src={selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="text-xs font-bold p-2 border-2 border-foreground inline-block"
                  style={{ backgroundColor: selectedBgColor || '#2D2D2D' }}
                >
                  {username}
                </div>
              </div>

              <Button
                onClick={() => setShowCreateRoom(true)}
                className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
              >
                + СОЗДАТЬ КОМНАТУ
              </Button>
            </div>
          </div>

          {/* MAIN CONTENT - ROOMS */}
          <div className="flex-1 p-8 bg-background">
            <ScrollArea className="h-screen">
              <div className="space-y-6 max-w-4xl">
                {rooms.map((room) => (
                  <Card key={room.id} className="border-2 border-foreground bg-card">
                    <CardContent className="p-6">
                      {/* ROOM HEADER */}
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="w-3 h-20 flex-shrink-0"
                          style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div 
                              className="px-3 py-1 text-xs border-2 border-foreground"
                              style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                            >
                              {ROOM_THEME_NAMES[room.theme]}
                            </div>
                            {room.badge && (
                              <div className="px-2 py-1 text-sm border-2 border-foreground bg-card">
                                {ROOM_BADGES[room.badge].icon}
                              </div>
                            )}
                            <h3 className="text-lg font-bold">{room.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {room.currentParticipants}/{room.maxParticipants} УЧАСТНИКОВ
                          </p>
                        </div>
                      </div>

                      {/* PARTICIPANTS */}
                      <div className="mb-4">
                        <div className="flex gap-2 flex-wrap">
                          {room.participants.map((participant, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className="w-12 h-12 border-2 border-foreground">
                                <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs">{participant.username}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => joinRoom(room)}
                          className="flex-1 border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                          disabled={room.currentParticipants >= room.maxParticipants}
                        >
                          ВОЙТИ
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1 border-2 border-foreground text-xs"
                        >
                          ПОСТУЧАТЬ
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-2 border-foreground text-xs"
                        >
                          <Icon name="Flag" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* CREATE ROOM MODAL */}
          {showCreateRoom && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md border-4 border-foreground bg-black">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    СОЗДАТЬ КОМНАТУ
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateRoom(false)}
                      className="text-xs"
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs mb-2">НАЗВАНИЕ:</p>
                    <Input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="ВВЕДИТЕ НАЗВАНИЕ"
                      className="border-2 border-foreground text-xs"
                      maxLength={30}
                    />
                  </div>

                  <div>
                    <p className="text-xs mb-2">ТЕМА:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(ROOM_THEME_COLORS) as RoomTheme[]).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setNewRoomTheme(theme)}
                          className={`p-3 text-xs border-2 transition-all ${
                            newRoomTheme === theme
                              ? 'border-foreground scale-105'
                              : 'border-muted opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: ROOM_THEME_COLORS[theme] }}
                        >
                          {ROOM_THEME_NAMES[theme]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs mb-2">ЗНАЧОК:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.keys(ROOM_BADGES) as RoomBadge[]).map((badge) => (
                        <button
                          key={badge}
                          onClick={() => setNewRoomBadge(badge)}
                          className={`p-3 text-sm border-2 transition-all ${
                            newRoomBadge === badge
                              ? 'border-primary bg-primary/20'
                              : 'border-foreground bg-card hover:bg-muted'
                          }`}
                        >
                          <div className="text-center">
                            {ROOM_BADGES[badge].icon && (
                              <div className="text-lg mb-1">{ROOM_BADGES[badge].icon}</div>
                            )}
                            <div className="text-xs">{ROOM_BADGES[badge].label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs mb-2">МАКС. УЧАСТНИКОВ:</p>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setNewRoomMaxParticipants(Math.max(2, newRoomMaxParticipants - 1))}
                        className="border-2 border-foreground text-xs px-3"
                        size="sm"
                      >
                        -
                      </Button>
                      <div className="flex-1 text-center border-2 border-foreground p-2 text-sm">
                        {newRoomMaxParticipants}
                      </div>
                      <Button
                        onClick={() => setNewRoomMaxParticipants(Math.min(20, newRoomMaxParticipants + 1))}
                        className="border-2 border-foreground text-xs px-3"
                        size="sm"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={createRoom}
                    disabled={!newRoomName.trim()}
                    className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs disabled:opacity-50"
                  >
                    СОЗДАТЬ
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-screen flex bg-black">
          {/* LEFT SIDEBAR */}
          <div className="w-64 border-r-4 border-foreground flex flex-col bg-black">
            {/* PROFILE */}
            <div className="p-6 border-b-4 border-foreground">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto border-2 border-foreground">
                  <img src={selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="text-xs font-bold p-2 border-2 border-foreground inline-block"
                  style={{ backgroundColor: selectedBgColor || '#2D2D2D' }}
                >
                  {username}
                </div>
              </div>
            </div>

            {/* OTHER ROOMS LIST */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-muted-foreground mb-3">ДРУГИЕ КОМНАТЫ:</p>
              <div className="space-y-3">
                {rooms.filter(room => room.id !== currentRoom?.id).map((room) => (
                  <div 
                    key={room.id} 
                    className="border-2 border-foreground p-3 bg-card opacity-60 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-1 h-8"
                        style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold">{room.name}</h4>
                          {room.badge && (
                            <span className="text-xs">{ROOM_BADGES[room.badge].icon}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {room.currentParticipants}/{room.maxParticipants}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {room.participants.slice(0, 4).map((p, idx) => (
                        <span key={idx} className="text-xs text-cyan-400">
                          {p.username}{idx < Math.min(room.participants.length, 4) - 1 ? ',' : ''}
                        </span>
                      ))}
                      {room.participants.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{room.participants.length - 4}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col">
            {/* ROOM HEADER */}
            <div className="border-b-4 border-foreground p-4 bg-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-12"
                  style={{ backgroundColor: ROOM_THEME_COLORS[currentRoom?.theme || 'general'] }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold">{currentRoom?.name}</h1>
                    {currentRoom?.badge && (
                      <span className="text-lg">{ROOM_BADGES[currentRoom.badge].icon}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentRoom?.currentParticipants}/{currentRoom?.maxParticipants} участников
                  </p>
                </div>
              </div>
              <Button
                onClick={leaveRoom}
                variant="outline"
                className="border-2 border-foreground text-xs"
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                ВЫЙТИ
              </Button>
            </div>

            {/* CHAT MESSAGES */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group">
                  {/* AVATAR */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-16 border-2 border-foreground">
                      <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs">{msg.user}</span>
                  </div>

                  {/* MESSAGE CONTENT */}
                  <div className="flex-1 flex flex-col gap-2">
                    {msg.isReply && msg.replyTo && (
                      <div className="text-xs text-cyan-400 italic">
                        {msg.replyTo} ОПЯТЬ!))))
                      </div>
                    )}
                    <div 
                      className="p-4 text-sm border-2 border-foreground relative"
                      style={{ backgroundColor: msg.bgColor || '#2D2D2D' }}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* REPLY BUTTON */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReplyingTo(msg)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-foreground self-start"
                  >
                    <Icon name="Hash" size={16} />
                  </Button>
                </div>
              ))}
            </div>
            </ScrollArea>

            {/* MESSAGE INPUT */}
            <div className="border-t-4 border-foreground p-4 bg-black">
              <div className="max-w-4xl mx-auto space-y-2">
                {replyingTo && (
                  <div className="flex items-center justify-between p-2 border-2 border-foreground bg-card text-xs">
                    <span>Ответ для: <span className="text-primary">{replyingTo.user}</span></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 items-center">
                  <div className="w-12 h-12 border-2 border-foreground flex-shrink-0">
                    <img src={selectedAvatar} alt="you" className="w-full h-full object-cover" />
                  </div>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="тебе делать нечего?"
                    className="border-2 border-foreground text-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <Button
                    onClick={sendMessage}
                    className="border-2 border-foreground bg-primary hover:bg-primary/80"
                    size="sm"
                  >
                    <Icon name="Hash" size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;