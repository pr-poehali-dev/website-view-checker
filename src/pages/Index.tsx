import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type RoomTheme = 'general' | 'tech' | 'gaming' | 'music' | 'art' | 'sports';

type RoomParticipant = {
  username: string;
  avatar: string;
};

type Room = {
  id: string;
  name: string;
  theme: RoomTheme;
  currentParticipants: number;
  maxParticipants: number;
  participants: RoomParticipant[];
};

type Message = {
  id: string;
  user: string;
  text: string;
  timestamp: string;
};

const STANDARD_AVATARS = [
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=0,0,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=256,0,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=512,0,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=768,0,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=0,256,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=256,256,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=512,256,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=768,256,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=0,512,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=256,512,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=512,512,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=768,512,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=0,768,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=256,768,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=512,768,256,256',
  'https://cdn.poehali.dev/files/10e7d202-e5ba-46d0-b11f-0178011b9661.png?crop=768,768,256,256',
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

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'lobby' | 'room'>('login');
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
        { username: 'Tech', avatar: STANDARD_AVATARS[5] },
        { username: 'AI', avatar: STANDARD_AVATARS[6] },
        { username: 'Web', avatar: STANDARD_AVATARS[7] },
      ],
    },
    {
      id: '3',
      name: 'Gaming Hub',
      theme: 'gaming',
      currentParticipants: 4,
      maxParticipants: 6,
      participants: [
        { username: 'Gamer1', avatar: STANDARD_AVATARS[8] },
        { username: 'Pro', avatar: STANDARD_AVATARS[9] },
        { username: 'Noob', avatar: STANDARD_AVATARS[10] },
        { username: 'Elite', avatar: STANDARD_AVATARS[11] },
      ],
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'Admin', text: 'Welcome to the room!', timestamp: '12:00' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

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
        participants: 1,
      };
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      joinRoom(newRoom);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: username,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, message]);
      setNewMessage('');
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
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="px-3 py-1 text-xs border-2 border-foreground"
                              style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                            >
                              {ROOM_THEME_NAMES[room.theme]}
                            </div>
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
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="border-4 border-foreground p-4 bg-card flex justify-between items-center">
            <div>
              <h1 className="text-xl mb-2">{currentRoom?.name}</h1>
              <p className="text-xs text-muted-foreground">
                USERS: {currentRoom?.participants}
              </p>
            </div>
            <Button
              onClick={leaveRoom}
              className="border-2 border-foreground bg-card hover:bg-muted text-xs"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              LEAVE
            </Button>
          </div>

          <Card className="border-4 border-foreground">
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex gap-2 text-xs">
                        <span className="text-primary">{msg.user}:</span>
                        <span className="text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs pl-4">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="TYPE MESSAGE..."
              className="border-2 border-foreground text-xs"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              className="border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
            >
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;