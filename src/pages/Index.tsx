import { useState, useEffect } from 'react';
import { LoginView } from '@/components/chat/LoginView';
import { LobbyView } from '@/components/chat/LobbyView';
import { RoomView } from '@/components/chat/RoomView';
import { Modals } from '@/components/chat/Modals';
import type { Room, Message, Account, UserRole, RoomTheme, RoomBadge } from '@/components/chat/types';
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
    },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
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
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `${username} в чате.`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isSystemMessage: true,
    };
    
    const updatedMessages = [...messages, systemMessage];
    if (updatedMessages.length > 30) {
      updatedMessages.shift();
    }
    setMessages(updatedMessages);
    
    setCurrentRoom(room);
    setCurrentView('room');
  };
  
  const handlePasswordSubmit = () => {
    if (passwordRoom && passwordInput === passwordRoom.password) {
      const systemMessage: Message = {
        id: Date.now().toString(),
        user: '',
        avatar: '',
        bgColor: '',
        text: `${username} в чате.`,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isSystemMessage: true,
      };
      
      const updatedMessages = [...messages, systemMessage];
      if (updatedMessages.length > 30) {
        updatedMessages.shift();
      }
      setMessages(updatedMessages);
      
      setCurrentRoom(passwordRoom);
      setCurrentView('room');
      setShowPasswordPrompt(false);
      setPasswordRoom(null);
      setPasswordInput('');
    }
  };

  const leaveRoom = () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      user: '',
      avatar: '',
      bgColor: '',
      text: `${username} покинул чат.`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      isSystemMessage: true,
    };
    
    const updatedMessages = [...messages, systemMessage];
    if (updatedMessages.length > 30) {
      updatedMessages.shift();
    }
    setMessages(updatedMessages);
    
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
        creatorUsername: username,
        currentParticipants: 1,
        maxParticipants: newRoomMaxParticipants,
        participants: [
          { username, avatar: selectedAvatar }
        ],
        bannedUsers: [],
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
  
  const banParticipant = (participantUsername: string) => {
    if (!currentRoom) return;
    const updatedRoom = {
      ...currentRoom,
      participants: currentRoom.participants.filter(p => p.username !== participantUsername),
      currentParticipants: currentRoom.currentParticipants - 1,
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

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        user: username,
        avatar: selectedAvatar,
        bgColor: selectedBgColor,
        text: newMessage.slice(0, 150),
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        isReply: !!replyingTo,
        replyTo: replyingTo ? `@${replyingTo.user}` : undefined,
      };
      const updatedMessages = [...messages, message];
      if (updatedMessages.length > 30) {
        updatedMessages.shift();
      }
      setMessages(updatedMessages);
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
        showCreateRoom={showCreateRoom}
        setShowCreateRoom={setShowCreateRoom}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        newRoomDescription={newRoomDescription}
        setNewRoomDescription={setNewRoomDescription}
        newRoomTheme={newRoomTheme}
        setNewRoomTheme={setNewRoomTheme}
        newRoomBadge={newRoomBadge}
        setNewRoomBadge={setNewRoomBadge}
        newRoomPassword={newRoomPassword}
        setNewRoomPassword={setNewRoomPassword}
        newRoomMaxParticipants={newRoomMaxParticipants}
        setNewRoomMaxParticipants={setNewRoomMaxParticipants}
        createRoom={createRoom}
        showPasswordPrompt={showPasswordPrompt}
        setShowPasswordPrompt={setShowPasswordPrompt}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        handlePasswordSubmit={handlePasswordSubmit}
      />
    </div>
  );
};

export default Index;