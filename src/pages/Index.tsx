import { useState, useEffect } from 'react';
import { LoginView } from '@/components/chat/LoginView';
import { LobbyView } from '@/components/chat/LobbyView';
import { RoomView } from '@/components/chat/RoomView';
import { Modals } from '@/components/chat/Modals';
import { CreateRoomModal } from '@/components/chat/CreateRoomModal';
import type { Room, Message, Account, UserRole, RoomTheme, RoomBadge, TypingUser } from '@/components/chat/types';
import { STANDARD_AVATARS, BACKGROUND_COLORS } from '@/components/chat/types';

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
      name: 'тест',
      theme: 'general',
      creatorId: 'system',
      creatorUsername: 'system',
      currentParticipants: 0,
      maxParticipants: 10,
      participants: [],
      bannedUsers: [],
      is_adult: false,
      is_locked: false,
      is_private: false,
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomTheme, setNewRoomTheme] = useState<RoomTheme>('general');
  const [newRoomBadge, setNewRoomBadge] = useState<RoomBadge>('none');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomMaxParticipants, setNewRoomMaxParticipants] = useState(5);
  const [newRoomIsAdult, setNewRoomIsAdult] = useState(false);
  const [newRoomIsLocked, setNewRoomIsLocked] = useState(false);
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [knockCooldowns, setKnockCooldowns] = useState<Record<string, number>>({});
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordRoom, setPasswordRoom] = useState<Room | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [editingRoomDescription, setEditingRoomDescription] = useState(false);
  const [tempRoomName, setTempRoomName] = useState('');
  const [tempRoomDescription, setTempRoomDescription] = useState('');
  
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [hasBeenWarned, setHasBeenWarned] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [showKickNotification, setShowKickNotification] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  const startInactivityTimer = () => {
    setHasBeenWarned(false);
    setLastActivity(Date.now());
    
    const timer = setTimeout(() => {
      setShowInactivityWarning(true);
      
      const warnTimer = setTimeout(() => {
        handleInactivityKick();
      }, 30000);
      
      setWarningTimer(warnTimer);
    }, 600000);
    
    setInactivityTimer(timer);
  };
  
  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    setShowInactivityWarning(false);
    
    if (currentRoom && currentView === 'room') {
      if (hasBeenWarned) {
        const timer = setTimeout(() => {
          handleInactivityKick();
        }, 600000);
        setInactivityTimer(timer);
      } else {
        startInactivityTimer();
      }
    }
  };
  
  const handleInactivityKick = () => {
    if (!currentRoom) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `• ${username} заснул.`,
      timestamp,
      isSystemMessage: true,
    };
    
    const updatedMessages = [systemMessage, ...messages];
    if (updatedMessages.length > 30) {
      updatedMessages.pop();
    }
    setMessages(updatedMessages);
    
    const updatedRoom = {
      ...currentRoom,
      participants: currentRoom.participants.filter(p => p.username !== username),
      currentParticipants: Math.max(0, currentRoom.currentParticipants - 1)
    };
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
    
    setCurrentView('lobby');
    setCurrentRoom(null);
    setShowInactivityWarning(false);
    setShowKickNotification(true);
    
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    
    setTimeout(() => {
      setShowKickNotification(false);
    }, 5000);
  };
  
  const handleStayActive = () => {
    setShowInactivityWarning(false);
    setHasBeenWarned(true);
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
    resetInactivityTimer();
  };
  
  const joinRoom = (room: Room) => {
    if (room.bannedUsers.includes(username)) {
      alert('Вы забанены в этой комнате');
      return;
    }
    
    if (room.currentParticipants >= room.maxParticipants && !isAdmin) {
      return;
    }
    
    if (room.password && !isAdmin) {
      setPasswordRoom(room);
      setShowPasswordPrompt(true);
      return;
    }
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `${username} в чате.`,
      timestamp,
      isSystemMessage: true,
    };
    
    const updatedMessages = [systemMessage, ...messages];
    if (updatedMessages.length > 30) {
      updatedMessages.pop();
    }
    setMessages(updatedMessages);
    
    const isAlreadyParticipant = room.participants.some(p => p.username === username);
    const updatedRoom = isAlreadyParticipant ? room : {
      ...room,
      participants: [...room.participants, { username, avatar: selectedAvatar }],
      currentParticipants: room.currentParticipants + 1
    };
    
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === room.id ? updatedRoom : r));
    setCurrentView('room');
    startInactivityTimer();
  };
  
  const handlePasswordSubmit = () => {
    if (passwordRoom && btoa(passwordInput.toLowerCase()) === passwordRoom.password) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timestamp = `${hours}.${minutes}.${seconds}`;
      
      const systemMessage: Message = {
        id: Date.now().toString(),
        user: '',
        avatar: '',
        bgColor: '',
        text: `${username} в чате.`,
        timestamp,
        isSystemMessage: true,
      };
      
      const updatedMessages = [systemMessage, ...messages];
      if (updatedMessages.length > 30) {
        updatedMessages.pop();
      }
      setMessages(updatedMessages);
      
      const isAlreadyParticipant = passwordRoom.participants.some(p => p.username === username);
      const updatedRoom = isAlreadyParticipant ? passwordRoom : {
        ...passwordRoom,
        participants: [...passwordRoom.participants, { username, avatar: selectedAvatar }],
        currentParticipants: passwordRoom.currentParticipants + 1
      };
      
      setCurrentRoom(updatedRoom);
      setRooms(rooms.map(r => r.id === passwordRoom.id ? updatedRoom : r));
      setCurrentView('room');
      setShowPasswordPrompt(false);
      setPasswordRoom(null);
      setPasswordInput('');
      startInactivityTimer();
    }
  };

  const leaveRoom = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `${username} покинул чат.`,
      timestamp,
      isSystemMessage: true,
    };
    
    const updatedMessages = [systemMessage, ...messages];
    if (updatedMessages.length > 30) {
      updatedMessages.pop();
    }
    setMessages(updatedMessages);
    
    if (currentRoom) {
      const updatedRoom = {
        ...currentRoom,
        participants: currentRoom.participants.filter(p => p.username !== username),
        currentParticipants: Math.max(0, currentRoom.currentParticipants - 1)
      };
      setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
    }
    
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);
    setShowInactivityWarning(false);
    setHasBeenWarned(false);
    
    setCurrentView('lobby');
    setCurrentRoom(null);
  };

  const handleCreateRoom = (data: {
    name: string;
    theme: RoomTheme;
    description: string;
    capacity: number;
    is_adult: boolean;
    is_locked: boolean;
    is_private: boolean;
    password: string;
  }) => {
    const hashedPassword = data.is_locked && data.password 
      ? btoa(data.password.toLowerCase()) 
      : undefined;
    
    const newRoom: Room = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description || undefined,
      theme: data.theme,
      badge: data.is_adult ? 'adult' : undefined,
      password: hashedPassword,
      creatorId: username,
      creatorUsername: username,
      currentParticipants: 1,
      maxParticipants: data.capacity,
      participants: [
        { username, avatar: selectedAvatar }
      ],
      bannedUsers: [],
      is_adult: data.is_adult,
      is_locked: data.is_locked,
      is_private: data.is_private,
    };
    
    setRooms([...rooms, newRoom]);
    setShowCreateRoom(false);
    setCurrentRoom(newRoom);
    setCurrentView('room');
    startInactivityTimer();
  };
  
  const deleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `• админ ${username} удалил комнату.`,
      timestamp,
      isSystemMessage: true,
    };
    
    if (currentRoom?.id === roomId) {
      const updatedMessages = [systemMessage, ...messages];
      if (updatedMessages.length > 30) {
        updatedMessages.pop();
      }
      setMessages(updatedMessages);
    }
    
    setRooms(rooms.filter(r => r.id !== roomId));
    if (currentRoom?.id === roomId) {
      setCurrentView('lobby');
      setCurrentRoom(null);
    }
  };

  const knockOnRoom = (room: Room) => {
    const now = Date.now();
    const lastKnock = knockCooldowns[room.id];
    
    if (lastKnock && now - lastKnock < 60000) {
      return;
    }
    
    setKnockCooldowns({ ...knockCooldowns, [room.id]: now });
    
    const nowDate = new Date();
    const hours = nowDate.getHours().toString().padStart(2, '0');
    const minutes = nowDate.getMinutes().toString().padStart(2, '0');
    const seconds = nowDate.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;
    
    const knockMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `• ${username} стучит.`,
      timestamp,
      isSystemMessage: true,
    };
    
    if (currentRoom?.id === room.id) {
      setMessages([knockMessage, ...messages]);
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
      currentParticipants: Math.max(0, currentRoom.currentParticipants - 1)
    };
    setCurrentRoom(updatedRoom);
    setRooms(rooms.map(r => r.id === currentRoom.id ? updatedRoom : r));
  };
  
  const banParticipant = (participantUsername: string) => {
    if (!currentRoom) return;
    const updatedRoom = {
      ...currentRoom,
      participants: currentRoom.participants.filter(p => p.username !== participantUsername),
      currentParticipants: Math.max(0, currentRoom.currentParticipants - 1),
      bannedUsers: [...currentRoom.bannedUsers, participantUsername]
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

  const handleTyping = () => {
    setTypingUsers(prev => {
      const existing = prev.find(tu => tu.username === username);
      if (existing) {
        return prev.map(tu => 
          tu.username === username ? { ...tu, lastTyping: Date.now() } : tu
        );
      } else {
        return [...prev, { username, lastTyping: Date.now() }];
      }
    });
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(tu => Date.now() - tu.lastTyping < 3000)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const sendMessage = () => {
    if (newMessage.trim()) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const timestamp = `${hours}.${minutes}.${seconds}`;
      
      const message: Message = {
        id: Date.now().toString(),
        user: username,
        avatar: selectedAvatar,
        bgColor: selectedBgColor,
        text: newMessage.slice(0, 150),
        timestamp,
        isReply: !!replyingTo,
        replyTo: replyingTo ? `@${replyingTo.user}` : undefined,
      };
      const updatedMessages = [message, ...messages];
      if (updatedMessages.length > 30) {
        updatedMessages.pop();
      }
      setMessages(updatedMessages);
      setNewMessage('');
      setReplyingTo(null);
      setTypingUsers(prev => prev.filter(tu => tu.username !== username));
      resetInactivityTimer();
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
        <LoginView
          username={username}
          setUsername={setUsername}
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
          customAvatar={customAvatar}
          selectedBgColor={selectedBgColor}
          setSelectedBgColor={setSelectedBgColor}
          useCustomAvatar={useCustomAvatar}
          setUseCustomAvatar={setUseCustomAvatar}
          handleFileUpload={handleFileUpload}
          handleLogin={handleLogin}
          setShowAuthModal={setShowAuthModal}
        />
      ) : currentView === 'lobby' ? (
        <LobbyView
          username={username}
          selectedAvatar={selectedAvatar}
          selectedBgColor={selectedBgColor}
          isAuthenticated={isAuthenticated}
          currentAccount={currentAccount}
          isAdmin={isAdmin}
          rooms={rooms}
          accounts={accounts}
          setShowCreateAccountModal={setShowCreateAccountModal}
          handleLogout={handleLogout}
          setCurrentView={setCurrentView}
          setShowCreateRoom={setShowCreateRoom}
          joinRoom={joinRoom}
          deleteRoom={deleteRoom}
          knockOnRoom={knockOnRoom}
        />
      ) : currentView === 'room' && currentRoom ? (
        <RoomView
          currentRoom={currentRoom}
          username={username}
          selectedAvatar={selectedAvatar}
          isAdmin={isAdmin}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          tempRoomName={tempRoomName}
          setTempRoomName={setTempRoomName}
          editingRoomDescription={editingRoomDescription}
          setEditingRoomDescription={setEditingRoomDescription}
          tempRoomDescription={tempRoomDescription}
          setTempRoomDescription={setTempRoomDescription}
          leaveRoom={leaveRoom}
          deleteRoom={deleteRoom}
          sendMessage={sendMessage}
          deleteMessage={deleteMessage}
          kickParticipant={kickParticipant}
          banParticipant={banParticipant}
          expandRoom={expandRoom}
          updateRoomName={updateRoomName}
          updateRoomDescription={updateRoomDescription}
          onActivity={resetInactivityTimer}
          typingUsers={typingUsers}
          onTyping={handleTyping}
        />
      ) : null}

      <Modals
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authId={authId}
        setAuthId={setAuthId}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleAuth={handleAuth}
        showCreateAccountModal={showCreateAccountModal}
        setShowCreateAccountModal={setShowCreateAccountModal}
        newAccountUsername={newAccountUsername}
        setNewAccountUsername={setNewAccountUsername}
        newAccountPassword={newAccountPassword}
        setNewAccountPassword={setNewAccountPassword}
        newAccountRole={newAccountRole}
        setNewAccountRole={setNewAccountRole}
        handleCreateAccount={handleCreateAccount}
        showPasswordPrompt={showPasswordPrompt}
        setShowPasswordPrompt={setShowPasswordPrompt}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        handlePasswordSubmit={handlePasswordSubmit}
      />
      
      <CreateRoomModal
        show={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreate={handleCreateRoom}
      />
      
      {showInactivityWarning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border-4 border-foreground p-6 max-w-md w-full mx-4">
            <h2 className="text-xl mb-4 text-center">Вы ещё тут?</h2>
            <div className="flex justify-center">
              <Button
                onClick={handleStayActive}
                className="border-2 border-foreground bg-primary hover:bg-primary/80"
              >
                Да
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {showKickNotification && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-card border-4 border-foreground p-6 max-w-md w-full mx-4">
            <h2 className="text-lg mb-4 text-center">Вас выгнала система за неактивность.</h2>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowKickNotification(false)}
                className="border-2 border-foreground bg-primary hover:bg-primary/80"
              >
                Ок
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;