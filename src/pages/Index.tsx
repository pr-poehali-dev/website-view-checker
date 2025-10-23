import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type Room = {
  id: string;
  name: string;
  participants: number;
};

type Message = {
  id: string;
  user: string;
  text: string;
  timestamp: string;
};

const STANDARD_AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐸'];
const BACKGROUND_COLORS = [
  { name: 'GRAY', value: '#2D2D2D' },
  { name: 'RED', value: '#633946' },
  { name: 'BLUE', value: '#1e3a8a' },
  { name: 'GREEN', value: '#166534' },
  { name: 'PURPLE', value: '#581c87' },
  { name: 'ORANGE', value: '#9a3412' },
];

const Index = () => {
  const [currentView, setCurrentView] = useState<'login' | 'lobby' | 'room'>('login');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState('');
  const [useCustomAvatar, setUseCustomAvatar] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Lounge', participants: 5 },
    { id: '2', name: 'Tech Talk', participants: 12 },
    { id: '3', name: 'Gaming', participants: 8 },
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
          <Card className="border-4 border-foreground">
            <CardContent className="p-8 space-y-6">
              <div className="text-center border-4 border-foreground p-8 bg-card">
                <h1 className="text-4xl tracking-wider">ТЕСТ</h1>
              </div>

              <div>
                <p className="text-xs mb-3">ВЫБЕРИТЕ АВАТАР:</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {STANDARD_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setSelectedAvatar(emoji);
                        setUseCustomAvatar(false);
                      }}
                      className={`border-2 p-4 text-3xl transition-colors ${
                        selectedAvatar === emoji && !useCustomAvatar
                          ? 'border-primary bg-primary/20'
                          : 'border-foreground bg-card hover:bg-muted'
                      }`}
                    >
                      {emoji}
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-4 border-foreground p-4 bg-card">
            <h1 className="text-2xl mb-4">CHAT ROOMS</h1>
            <p className="text-xs text-muted-foreground mb-4">USER: {username}</p>
          </div>

          <Card className="border-4 border-foreground">
            <CardHeader>
              <CardTitle className="text-sm">CREATE ROOM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="ROOM NAME"
                className="border-2 border-foreground text-xs"
                onKeyDown={(e) => e.key === 'Enter' && createRoom()}
              />
              <Button
                onClick={createRoom}
                className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
              >
                CREATE
              </Button>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground">
            <CardHeader>
              <CardTitle className="text-sm">AVAILABLE ROOMS</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border-2 border-foreground p-4 bg-card hover:bg-muted transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm mb-2">{room.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            USERS: {room.participants}
                          </p>
                        </div>
                        <Button
                          onClick={() => joinRoom(room)}
                          size="sm"
                          className="border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                        >
                          JOIN
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
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