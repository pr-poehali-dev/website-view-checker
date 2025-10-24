import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type RoomTheme = 'general' | 'tech' | 'gaming' | 'music' | 'art' | 'sports';
type RoomBadge = 'adult' | 'music' | 'video' | 'none';

type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

type Account = {
  id: string;
  password: string;
  username: string;
  role: UserRole;
  avatar: string;
  bgColor: string;
};

type RoomParticipant = {
  username: string;
  avatar: string;
};

type Room = {
  id: string;
  name: string;
  description?: string;
  theme: RoomTheme;
  badge?: RoomBadge;
  password?: string;
  creatorId: string;
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
  
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 'usermelikhov',
      password: '2qu307syuo',
      username: 'ВЛАДЕЛЕЦ',
      role: 'admin',
      avatar: STANDARD_AVATARS[0],
      bgColor: '#FFD700'
    },
    {
      id: 'ADM001',
      password: 'admin123',
      username: 'HeadAdmin',
      role: 'admin',
      avatar: STANDARD_AVATARS[0],
      bgColor: '#633946'
    }
  ]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authId, setAuthId] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [newAccountRole, setNewAccountRole] = useState<UserRole>('user');
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Lounge',
      description: 'Общая комната для всех',
      theme: 'general',
      creatorId: 'system',
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
      description: 'Обсуждаем технологии',
      theme: 'tech',
      creatorId: 'system',
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
      creatorId: 'system',
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
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomTheme, setNewRoomTheme] = useState<RoomTheme>('general');
  const [newRoomBadge, setNewRoomBadge] = useState<RoomBadge>('none');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(10);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordRoom, setPasswordRoom] = useState<Room | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [editingRoomDescription, setEditingRoomDescription] = useState(false);
  const [tempRoomName, setTempRoomName] = useState('');
  const [tempRoomDescription, setTempRoomDescription] = useState('');

  const joinRoom = (room: Room) => {
    // Check if room is full and user is not admin
    if (room.currentParticipants >= room.maxParticipants && !isAdmin) {
      return;
    }
    
    // Check if room has password
    if (room.password && !isAdmin) {
      setPasswordRoom(room);
      setShowPasswordPrompt(true);
      return;
    }
    
    setCurrentRoom(room);
    setCurrentView('room');
  };
  
  const handlePasswordSubmit = () => {
    if (passwordRoom && passwordInput === passwordRoom.password) {
      setCurrentRoom(passwordRoom);
      setCurrentView('room');
      setShowPasswordPrompt(false);
      setPasswordRoom(null);
      setPasswordInput('');
    }
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
        description: newRoomDescription || undefined,
        theme: newRoomTheme,
        badge: newRoomBadge !== 'none' ? newRoomBadge : undefined,
        password: newRoomPassword || undefined,
        creatorId: username,
        currentParticipants: 1,
        maxParticipants: newRoomMaxParticipants,
        participants: [
          { username, avatar: selectedAvatar }
        ],
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomPassword('');
      setNewRoomTheme('general');
      setNewRoomBadge('none');
      setNewRoomMaxParticipants(10);
      setShowCreateRoom(false);
      setCurrentRoom(newRoom);
      setCurrentView('room');
    }
  };
  
  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    if (currentRoom?.id === roomId) {
      leaveRoom();
    }
  };

  const knockOnRoom = (room: Room) => {
    const knockMessage: Message = {
      id: Date.now().toString(),
      user: 'System',
      avatar: STANDARD_AVATARS[0],
      bgColor: '#6B7280',
      text: `${username} стучится в комнату`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    
    if (currentRoom?.id === room.id) {
      setMessages([...messages, knockMessage]);
    }
  };
  
  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter(m => m.id !== messageId));
  };
  
  const kickParticipant = (participantUsername: string) => {
    if (!currentRoom) return;
    const updatedRoom = {
      ...currentRoom,
      participants: currentRoom.participants.filter(p => p.username !== participantUsername),
      currentParticipants: currentRoom.currentParticipants - 1
    };
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
  };
  
  const expandRoom = () => {
    if (!currentRoom) return;
    const updatedRoom = {
      ...currentRoom,
      maxParticipants: currentRoom.maxParticipants + 5
    };
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
  };
  
  const updateRoomName = () => {
    if (!currentRoom || !tempRoomName.trim()) return;
    const updatedRoom = {
      ...currentRoom,
      name: tempRoomName
    };
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setEditingRoomName(false);
  };
  
  const updateRoomDescription = () => {
    if (!currentRoom) return;
    const updatedRoom = {
      ...currentRoom,
      description: tempRoomDescription || undefined
    };
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setEditingRoomDescription(false);
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
      
      localStorage.setItem('userSession', JSON.stringify({
        username,
        avatar: finalAvatar,
        bgColor: finalBgColor,
        isAuthenticated: false
      }));
    }
  };
  
  const handleAuth = () => {
    const account = accounts.find(acc => acc.id === authId && acc.password === authPassword);
    if (account) {
      setCurrentAccount(account);
      setIsAuthenticated(true);
      setUsername(account.username);
      setSelectedAvatar(account.avatar);
      setSelectedBgColor(account.bgColor);
      if (account.role === 'admin' || account.role === 'moderator') {
        setIsAdmin(true);
      }
      setCurrentView('lobby');
      setShowAuthModal(false);
      setAuthId('');
      setAuthPassword('');
      
      localStorage.setItem('userSession', JSON.stringify({
        username: account.username,
        avatar: account.avatar,
        bgColor: account.bgColor,
        isAuthenticated: true,
        accountId: account.id,
        accountRole: account.role
      }));
    }
  };
  
  const handleCreateAccount = () => {
    if (newAccountUsername.trim() && newAccountPassword.trim()) {
      const newId = `USR${(accounts.length + 1).toString().padStart(3, '0')}`;
      const newAccount: Account = {
        id: newId,
        password: newAccountPassword,
        username: newAccountUsername,
        role: newAccountRole,
        avatar: STANDARD_AVATARS[Math.floor(Math.random() * STANDARD_AVATARS.length)],
        bgColor: BACKGROUND_COLORS[Math.floor(Math.random() * BACKGROUND_COLORS.length)].value
      };
      setAccounts([...accounts, newAccount]);
      setNewAccountUsername('');
      setNewAccountPassword('');
      setNewAccountRole('user');
      setShowCreateAccountModal(false);
      
      const accountInfo = `🎉 АККАУНТ СОЗДАН!\n\n📋 ID: ${newId}\n🔑 Пароль: ${newAccountPassword}\n👤 Роль: ${newAccountRole === 'admin' ? '👑 Админ' : newAccountRole === 'moderator' ? '⚔️ Модератор' : '👤 Юзер'}\n\n⚠️ Сохраните эти данные!`;
      alert(accountInfo);
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAccount(null);
    setIsAdmin(false);
    setCurrentView('login');
    localStorage.removeItem('userSession');
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setUsername(session.username);
        setSelectedAvatar(session.avatar);
        setSelectedBgColor(session.bgColor);
        setCurrentView('lobby');
        
        if (session.isAuthenticated && session.accountId) {
          const account = accounts.find(acc => acc.id === session.accountId);
          if (account) {
            setCurrentAccount(account);
            setIsAuthenticated(true);
            if (account.role === 'admin' || account.role === 'moderator') {
              setIsAdmin(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('userSession');
      }
    }
  }, []);

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
    <div className="min-h-screen bg-black text-foreground p-4 font-['Press_Start_2P']">
      {currentView === 'login' ? (
        <div className="max-w-xl mx-auto mt-2">
          <Card className="border-0 bg-black">
            <CardContent className="p-6 space-y-4">
              <div className="text-center p-4 flex items-center justify-center">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hover:opacity-70 transition-opacity cursor-pointer"
                >
                  <img 
                    src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
                    alt="URBAN GROVE" 
                    className="max-w-full h-auto"
                    style={{ maxHeight: '120px' }}
                  />
                </button>
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
              {/* LOGO */}
              <div className="w-full mb-4">
                <img 
                  src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
                  alt="URBAN GROVE" 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-3 border-2 border-foreground">
                  <img src={selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="text-xs font-bold p-2 border-2 border-foreground inline-block"
                  style={{ backgroundColor: selectedBgColor || '#2D2D2D' }}
                >
                  {username} {isAdmin && '👑'}
                </div>
                {isAuthenticated && currentAccount && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-cyan-400">
                      ID: {currentAccount.id}
                    </div>
                    <div className="text-xs">
                      {currentAccount.role === 'admin' && '👑 АДМИНИСТРАТОР'}
                      {currentAccount.role === 'moderator' && '⚔️ МОДЕРАТОР'}
                      {currentAccount.role === 'user' && '👤 АВТОРИЗОВАН'}
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <>
                  <Button
                    onClick={() => setShowCreateAccountModal(true)}
                    variant="outline"
                    className="w-full border-2 border-foreground text-xs bg-purple-900"
                  >
                    + СОЗДАТЬ АККАУНТ
                  </Button>
                  
                  <div className="border-2 border-foreground p-3 bg-card">
                    <p className="text-xs font-bold mb-2">АККАУНТЫ ({accounts.length}):</p>
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {accounts.map((acc) => (
                          <div key={acc.id} className="text-xs p-2 border border-foreground bg-black">
                            <div className="flex items-center gap-2">
                              {acc.role === 'admin' && '👑'}
                              {acc.role === 'moderator' && '⚔️'}
                              {acc.role === 'user' && '👤'}
                              <span className="text-cyan-400">{acc.id}</span>
                              <span>-</span>
                              <span>{acc.username}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
              
              <Button
                onClick={() => {
                  if (isAuthenticated) {
                    handleLogout();
                  } else {
                    setCurrentView('login');
                  }
                }}
                variant="outline"
                className="w-full border-2 border-foreground text-xs bg-red-900"
              >
                {isAuthenticated ? 'ВЫЙТИ ИЗ АККАУНТА' : 'ВЫЙТИ'}
              </Button>

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
                            {room.password && (
                              <Icon name="Lock" size={16} className="text-yellow-500" />
                            )}
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
                          {room.description && (
                            <p className="text-xs text-cyan-400 mb-1">{room.description}</p>
                          )}
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
                          disabled={room.currentParticipants >= room.maxParticipants && !isAdmin}
                        >
                          {room.password ? '🔒 ' : ''}ВОЙТИ
                        </Button>
                        {isAdmin && (
                          <Button 
                            onClick={() => deleteRoom(room.id)}
                            variant="outline"
                            className="border-2 border-foreground text-xs bg-red-900"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                        <Button 
                          onClick={() => knockOnRoom(room)}
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
                    <p className="text-xs mb-2">ОПИСАНИЕ (необязательно):</p>
                    <Input
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="КРАТКОЕ ОПИСАНИЕ КОМНАТЫ"
                      className="border-2 border-foreground text-xs"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <p className="text-xs mb-2">ПАРОЛЬ (необязательно):</p>
                    <Input
                      type="password"
                      value={newRoomPassword}
                      onChange={(e) => setNewRoomPassword(e.target.value)}
                      placeholder="ПАРОЛЬ ДЛЯ ВХОДА"
                      className="border-2 border-foreground text-xs"
                      maxLength={20}
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

          {/* PASSWORD PROMPT MODAL */}
          {showPasswordPrompt && passwordRoom && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-sm border-4 border-foreground bg-black">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    🔒 ВВЕДИТЕ ПАРОЛЬ
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowPasswordPrompt(false);
                        setPasswordRoom(null);
                        setPasswordInput('');
                      }}
                      className="text-xs"
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Комната "{passwordRoom.name}" защищена паролем
                  </p>
                  <Input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="ВВЕДИТЕ ПАРОЛЬ"
                    className="border-2 border-foreground text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  />
                  <Button
                    onClick={handlePasswordSubmit}
                    className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                  >
                    ВОЙТИ
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : currentView === 'room' ? (
        <div className="min-h-screen flex bg-black">
          {/* LEFT SIDEBAR */}
          <div className="w-64 border-r-4 border-foreground flex flex-col bg-black">
            {/* PROFILE */}
            <div className="p-6 border-b-4 border-foreground">
              {/* LOGO */}
              <div className="w-full mb-4">
                <img 
                  src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
                  alt="URBAN GROVE" 
                  className="w-full h-auto"
                />
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto border-2 border-foreground">
                  <img src={selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="text-xs font-bold p-2 border-2 border-foreground inline-block"
                  style={{ backgroundColor: selectedBgColor || '#2D2D2D' }}
                >
                  {username} {isAdmin && '👑'}
                </div>
                {isAuthenticated && currentAccount && (
                  <div className="space-y-1">
                    <div className="text-xs text-cyan-400">
                      ID: {currentAccount.id}
                    </div>
                    <div className="text-xs">
                      {currentAccount.role === 'admin' && '👑 АДМИНИСТРАТОР'}
                      {currentAccount.role === 'moderator' && '⚔️ МОДЕРАТОР'}
                      {currentAccount.role === 'user' && '👤 АВТОРИЗОВАН'}
                    </div>
                  </div>
                )}
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
                          {room.password && <Icon name="Lock" size={10} className="text-yellow-500" />}
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
                    {editingRoomName && isAdmin && (currentRoom?.creatorId === username || isAdmin) ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={tempRoomName}
                          onChange={(e) => setTempRoomName(e.target.value)}
                          className="border-2 border-foreground text-sm w-48"
                          maxLength={30}
                        />
                        <Button size="sm" onClick={updateRoomName} className="text-xs">
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRoomName(false)} className="text-xs">
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-lg font-bold">{currentRoom?.name}</h1>
                        {isAdmin && (currentRoom?.creatorId === username || isAdmin) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTempRoomName(currentRoom?.name || '');
                              setEditingRoomName(true);
                            }}
                          >
                            <Icon name="Edit" size={14} />
                          </Button>
                        )}
                      </>
                    )}
                    {currentRoom?.badge && (
                      <span className="text-lg">{ROOM_BADGES[currentRoom.badge].icon}</span>
                    )}
                  </div>
                  {editingRoomDescription && isAdmin && (currentRoom?.creatorId === username || isAdmin) ? (
                    <div className="flex gap-2 items-center mt-1">
                      <Input
                        value={tempRoomDescription}
                        onChange={(e) => setTempRoomDescription(e.target.value)}
                        className="border-2 border-foreground text-xs"
                        placeholder="Описание комнаты"
                        maxLength={100}
                      />
                      <Button size="sm" onClick={updateRoomDescription} className="text-xs">
                        <Icon name="Check" size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingRoomDescription(false)} className="text-xs">
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ) : (
                    currentRoom?.description && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-cyan-400">{currentRoom.description}</p>
                        {isAdmin && (currentRoom?.creatorId === username || isAdmin) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setTempRoomDescription(currentRoom?.description || '');
                              setEditingRoomDescription(true);
                            }}
                          >
                            <Icon name="Edit" size={12} />
                          </Button>
                        )}
                      </div>
                    )
                  )}
                  <p className="text-xs text-muted-foreground">
                    {currentRoom?.currentParticipants}/{currentRoom?.maxParticipants} участников
                    {isAdmin && (currentRoom?.creatorId === username || isAdmin) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={expandRoom}
                        className="ml-2 text-xs"
                      >
                        +5 <Icon name="Users" size={12} className="ml-1" />
                      </Button>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (currentRoom?.creatorId === username || isAdmin) && (
                  <Button
                    onClick={() => currentRoom && deleteRoom(currentRoom.id)}
                    variant="outline"
                    className="border-2 border-foreground text-xs bg-red-900"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
                <Button
                  onClick={leaveRoom}
                  variant="outline"
                  className="border-2 border-foreground text-xs"
                >
                  <Icon name="LogOut" size={16} className="mr-2" />
                  ВЫЙТИ
                </Button>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 group">
                  {/* AVATAR */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-16 h-16 border-2 border-foreground relative">
                      <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs">{msg.user}</span>
                    {isAdmin && msg.user !== username && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => kickParticipant(msg.user)}
                        className="text-xs border-2 border-foreground bg-red-900 opacity-0 group-hover:opacity-100"
                      >
                        <Icon name="UserX" size={12} />
                      </Button>
                    )}
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

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(msg)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-foreground"
                    >
                      <Icon name="Hash" size={16} />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-foreground bg-red-900"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
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
      ) : null}

      {/* AUTH DIALOG */}
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setShowAuthModal(false);
              setAuthId('');
              setAuthPassword('');
            }}
          />
          <div className="relative w-80 border-2 border-foreground bg-black p-4 space-y-3">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthId('');
                setAuthPassword('');
              }}
              className="absolute -top-3 -right-3 w-6 h-6 border-2 border-foreground bg-black flex items-center justify-center hover:bg-red-900 transition-colors text-xs"
            >
              ✕
            </button>
            <h3 className="text-xs font-bold mb-2">ВХОД</h3>
            
            <Input
              value={authId}
              onChange={(e) => setAuthId(e.target.value)}
              placeholder="ID"
              className="border-2 border-foreground text-xs h-8"
              maxLength={20}
            />
            
            <Input
              type="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="ПАРОЛЬ"
              className="border-2 border-foreground text-xs h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            
            <Button
              onClick={handleAuth}
              disabled={!authId.trim() || !authPassword.trim()}
              className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs h-8 disabled:opacity-50"
            >
              ВОЙТИ
            </Button>
          </div>
        </div>
      )}
      
      {/* CREATE ACCOUNT MODAL */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-4 border-foreground bg-black">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                👤 СОЗДАТЬ АККАУНТ
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setNewAccountUsername('');
                    setNewAccountPassword('');
                    setNewAccountRole('user');
                  }}
                  className="text-xs"
                >
                  <Icon name="X" size={20} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs mb-2">НИКНЕЙМ:</p>
                <Input
                  value={newAccountUsername}
                  onChange={(e) => setNewAccountUsername(e.target.value)}
                  placeholder="ВВЕДИТЕ НИКНЕЙМ"
                  className="border-2 border-foreground text-xs"
                  maxLength={20}
                />
              </div>
              <div>
                <p className="text-xs mb-2">ПАРОЛЬ:</p>
                <Input
                  type="password"
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                  placeholder="ПРИДУМАЙТЕ ПАРОЛЬ"
                  className="border-2 border-foreground text-xs"
                />
              </div>
              <div>
                <p className="text-xs mb-2">РОЛЬ:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['user', 'moderator', 'admin'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setNewAccountRole(role)}
                      className={`p-3 text-xs border-2 transition-all ${
                        newAccountRole === role
                          ? 'border-primary bg-primary/20'
                          : 'border-foreground bg-card hover:bg-muted'
                      }`}
                    >
                      {role === 'user' && '👤 ЮЗЕР'}
                      {role === 'moderator' && '⚔️ МОДЕРАТОР'}
                      {role === 'admin' && '👑 АДМИН'}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateAccount}
                disabled={!newAccountUsername.trim() || !newAccountPassword.trim()}
                className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs disabled:opacity-50"
              >
                СОЗДАТЬ
              </Button>
              <p className="text-xs text-muted-foreground">
                ID будет сгенерирован автоматически
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Index;