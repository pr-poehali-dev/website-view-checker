import { useState, useEffect } from 'react';
import { LoginView } from '@/components/chat/LoginView';
import { LobbyView } from '@/components/chat/LobbyView';
import { RoomView } from '@/components/chat/RoomView';
import { Modals } from '@/components/chat/Modals';
import { CreateRoomModal } from '@/components/chat/CreateRoomModal';
import { SanctionModal } from '@/components/chat/SanctionModal';
import { ModerationPanel, type Complaint } from '@/components/chat/ModerationPanel';
import { AdminPanel } from '@/components/chat/AdminPanel';
import { ComplaintModal } from '@/components/chat/ComplaintModal';
import type { Room, Message, Account, UserRole, RoomTheme, RoomBadge, TypingUser, RoomParticipant, BannedUser, MutedUser } from '@/components/chat/types';
import { STANDARD_AVATARS, BACKGROUND_COLORS } from '@/components/chat/types';
import { chatApi } from '@/lib/chatApi';

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
      role: 'owner',
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
      mutedUsers: [],
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
  
  const [pasteBlockActive, setPasteBlockActive] = useState(false);
  const [pasteCountdown, setPasteCountdown] = useState(0);
  const [lastPasteTime, setLastPasteTime] = useState(0);
  const [pastedText, setPastedText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteModalText, setPasteModalText] = useState('');
  const [lastRollTarget, setLastRollTarget] = useState<string>('');
  const [commandError, setCommandError] = useState<string>('');
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [sanctionTarget, setSanctionTarget] = useState<RoomParticipant | null>(null);
  const [showSanctionNotification, setShowSanctionNotification] = useState(false);
  const [sanctionNotificationText, setSanctionNotificationText] = useState('');
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintRoom, setComplaintRoom] = useState<Room | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Load initial data on component mount
  useEffect(() => {
    loadAccounts();
    loadRooms();
  }, []);

  // Auto-refresh rooms list every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadRooms();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh messages every 1 second when in a room
  useEffect(() => {
    if (currentRoom && currentView === 'room') {
      const interval = setInterval(() => {
        loadMessages(currentRoom.id);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentRoom, currentView]);

  const loadAccounts = async () => {
    try {
      const data = await chatApi.getAccounts();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await chatApi.getRooms();
      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const data = await chatApi.getMessages(roomId);
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadComplaints = async () => {
    try {
      const data = await chatApi.getComplaints();
      if (data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Failed to load complaints:', error);
    }
  };

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
  
  const handleInactivityKick = async () => {
    if (!currentRoom || !currentAccount) return;
    
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
    
    // Leave room via API
    try {
      await chatApi.leaveRoom(currentRoom.id, currentAccount.id);
      await loadRooms();
    } catch (error) {
      console.error('Failed to leave room on inactivity:', error);
    }
    
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
  
  const getUserRole = (): UserRole => {
    return currentAccount?.role || 'guest';
  };

  const canAccessRoom = (room: Room): boolean => {
    const role = getUserRole();
    
    if (role === 'owner' || role === 'admin') {
      return true;
    }
    
    if (room.is_adult && role === 'guest') {
      return false;
    }
    
    if (room.is_locked && room.creatorId !== currentAccount?.id) {
      return false;
    }
    
    const isBanned = room.bannedUsers?.some(ban => ban.userId === currentAccount?.id);
    if (isBanned) {
      return false;
    }
    
    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
        setUseCustomAvatar(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async () => {
    if (username.trim()) {
      setCurrentView('lobby');
    }
  };

  const handleAuth = async () => {
    try {
      const result = await chatApi.auth(authId, authPassword);
      
      if (result.success && result.account) {
        setIsAuthenticated(true);
        setCurrentAccount(result.account);
        setShowAuthModal(false);
        setAuthId('');
        setAuthPassword('');
        await loadAccounts();
      } else {
        alert('Неверный ID или пароль');
      }
    } catch (error) {
      console.error('Auth failed:', error);
      alert('Ошибка аутентификации');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAccount(null);
  };

  const handleCreateAccount = async () => {
    if (newAccountUsername.trim() && newAccountPassword.trim()) {
      try {
        const result = await chatApi.createAccount({
          username: newAccountUsername,
          password: newAccountPassword,
          role: newAccountRole,
          avatar: STANDARD_AVATARS[0],
          bgColor: BACKGROUND_COLORS[0]
        });

        if (result.success) {
          await loadAccounts();
          setNewAccountUsername('');
          setNewAccountPassword('');
          setNewAccountRole('user');
          setShowCreateAccountModal(false);
        } else {
          alert('Ошибка создания аккаунта');
        }
      } catch (error) {
        console.error('Failed to create account:', error);
        alert('Ошибка создания аккаунта');
      }
    }
  };

  const handleCreateRoom = async () => {
    if (newRoomName.trim()) {
      try {
        const result = await chatApi.createRoom({
          name: newRoomName,
          description: newRoomDescription,
          theme: newRoomTheme,
          badge: newRoomBadge,
          password: newRoomPassword,
          maxParticipants: newRoomMaxParticipants,
          is_adult: newRoomIsAdult,
          is_locked: newRoomIsLocked,
          is_private: newRoomIsPrivate,
          creatorId: currentAccount?.id || 'guest',
          creatorUsername: username
        });

        if (result.success) {
          await loadRooms();
          setNewRoomName('');
          setNewRoomDescription('');
          setNewRoomTheme('general');
          setNewRoomBadge('none');
          setNewRoomPassword('');
          setNewRoomMaxParticipants(5);
          setNewRoomIsAdult(false);
          setNewRoomIsLocked(false);
          setNewRoomIsPrivate(false);
          setShowCreateRoom(false);
        } else {
          alert('Ошибка создания комнаты');
        }
      } catch (error) {
        console.error('Failed to create room:', error);
        alert('Ошибка создания комнаты');
      }
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (!canAccessRoom(room)) {
      if (room.bannedUsers?.some(ban => ban.userId === currentAccount?.id)) {
        alert('Вы забанены в этой комнате');
        return;
      }
      if (room.is_adult && getUserRole() === 'guest') {
        alert('Эта комната только для зарегистрированных пользователей (18+)');
        return;
      }
      if (room.is_locked) {
        alert('Эта комната закрыта владельцем');
        return;
      }
      return;
    }

    if (room.password) {
      setPasswordRoom(room);
      setShowPasswordPrompt(true);
      return;
    }

    await joinRoomDirect(room);
  };

  const joinRoomDirect = async (room: Room) => {
    if (room.currentParticipants >= room.maxParticipants) {
      alert('Комната заполнена');
      return;
    }

    try {
      const avatar = useCustomAvatar ? customAvatar : selectedAvatar;
      const result = await chatApi.joinRoom(
        room.id,
        currentAccount?.id || 'guest',
        username,
        avatar,
        selectedBgColor,
        currentAccount?.role
      );

      if (result.success) {
        await loadRooms();
        await loadMessages(room.id);
        
        // Find updated room
        const roomsData = await chatApi.getRooms();
        const updatedRoom = roomsData.rooms?.find((r: Room) => r.id === room.id);
        
        setCurrentRoom(updatedRoom || room);
        setCurrentView('room');
        setMessages([]);
        startInactivityTimer();
      } else {
        alert('Ошибка при входе в комнату');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Ошибка при входе в комнату');
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordRoom && passwordInput === passwordRoom.password) {
      setShowPasswordPrompt(false);
      setPasswordInput('');
      await joinRoomDirect(passwordRoom);
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoom || !currentAccount) {
      setCurrentView('lobby');
      setCurrentRoom(null);
      return;
    }

    try {
      await chatApi.leaveRoom(currentRoom.id, currentAccount.id);
      await loadRooms();
      
      setCurrentView('lobby');
      setCurrentRoom(null);
      
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      setShowInactivityWarning(false);
    } catch (error) {
      console.error('Failed to leave room:', error);
      setCurrentView('lobby');
      setCurrentRoom(null);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !attachedImage) return;
    if (!currentRoom || !currentAccount) return;

    const isMuted = currentRoom.mutedUsers?.some(mute => mute.userId === currentAccount.id);
    if (isMuted) {
      alert('Вы в муте и не можете отправлять сообщения');
      return;
    }

    resetInactivityTimer();

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${hours}.${minutes}.${seconds}`;

    const messageText = newMessage.trim();
    
    if (messageText.startsWith('/')) {
      await handleCommand(messageText);
      return;
    }

    try {
      const avatar = useCustomAvatar ? customAvatar : selectedAvatar;
      const result = await chatApi.sendMessage({
        roomId: currentRoom.id,
        userId: currentAccount.id,
        user: username,
        avatar: avatar,
        bgColor: selectedBgColor,
        text: messageText,
        timestamp,
        image: attachedImage,
        replyTo: replyingTo ? {
          user: replyingTo.user,
          text: replyingTo.text
        } : undefined
      });

      if (result.success) {
        await loadMessages(currentRoom.id);
        setNewMessage('');
        setAttachedImage(null);
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCommand = async (command: string) => {
    if (!currentRoom || !currentAccount) return;

    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const userRole = getUserRole();
    const isRoomOwner = currentRoom.creatorId === currentAccount.id;
    const canModerate = userRole === 'owner' || userRole === 'admin' || isRoomOwner;

    switch (cmd) {
      case '/ban':
        if (canModerate && args.length > 0) {
          const targetUsername = args[0];
          const participant = currentRoom.participants.find(p => p.username === targetUsername);
          
          if (participant) {
            try {
              await chatApi.banUser(currentRoom.id, participant.accountId || participant.username, participant.username, username);
              await loadRooms();
              await loadMessages(currentRoom.id);
              setNewMessage('');
            } catch (error) {
              console.error('Failed to ban user:', error);
              setCommandError('Ошибка бана пользователя');
            }
          } else {
            setCommandError('Пользователь не найден');
          }
        } else {
          setCommandError('Недостаточно прав или неверные параметры');
        }
        break;

      case '/unban':
        if (canModerate && args.length > 0) {
          const targetUsername = args[0];
          const bannedUser = currentRoom.bannedUsers?.find(b => b.username === targetUsername);
          
          if (bannedUser) {
            try {
              await chatApi.unbanUser(currentRoom.id, bannedUser.userId);
              await loadRooms();
              await loadMessages(currentRoom.id);
              setNewMessage('');
            } catch (error) {
              console.error('Failed to unban user:', error);
              setCommandError('Ошибка разбана пользователя');
            }
          } else {
            setCommandError('Пользователь не найден в списке забаненных');
          }
        } else {
          setCommandError('Недостаточно прав или неверные параметры');
        }
        break;

      case '/mute':
        if (canModerate && args.length > 0) {
          const targetUsername = args[0];
          const participant = currentRoom.participants.find(p => p.username === targetUsername);
          
          if (participant) {
            try {
              await chatApi.muteUser(currentRoom.id, participant.accountId || participant.username, participant.username, username);
              await loadRooms();
              await loadMessages(currentRoom.id);
              setNewMessage('');
            } catch (error) {
              console.error('Failed to mute user:', error);
              setCommandError('Ошибка мута пользователя');
            }
          } else {
            setCommandError('Пользователь не найден');
          }
        } else {
          setCommandError('Недостаточно прав или неверные параметры');
        }
        break;

      case '/unmute':
        if (canModerate && args.length > 0) {
          const targetUsername = args[0];
          const mutedUser = currentRoom.mutedUsers?.find(m => m.username === targetUsername);
          
          if (mutedUser) {
            try {
              await chatApi.unmuteUser(currentRoom.id, mutedUser.userId);
              await loadRooms();
              await loadMessages(currentRoom.id);
              setNewMessage('');
            } catch (error) {
              console.error('Failed to unmute user:', error);
              setCommandError('Ошибка размута пользователя');
            }
          } else {
            setCommandError('Пользователь не найден в списке замученных');
          }
        } else {
          setCommandError('Недостаточно прав или неверные параметры');
        }
        break;

      case '/roll':
        const target = args.length > 0 ? args.join(' ') : lastRollTarget;
        if (target) {
          setLastRollTarget(target);
          const rollValue = Math.floor(Math.random() * 100) + 1;
          
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const timestamp = `${hours}.${minutes}.${seconds}`;

          try {
            const avatar = useCustomAvatar ? customAvatar : selectedAvatar;
            await chatApi.sendMessage({
              roomId: currentRoom.id,
              userId: currentAccount.id,
              user: username,
              avatar: avatar,
              bgColor: selectedBgColor,
              text: `${username} кинул кубик на тему "${target}" и выбил ${rollValue} из 100`,
              timestamp,
              isSystemMessage: true
            });

            await loadMessages(currentRoom.id);
            setNewMessage('');
          } catch (error) {
            console.error('Failed to send roll message:', error);
          }
        } else {
          setCommandError('Укажите тему для броска (например: /roll удача)');
        }
        break;

      case '/clear':
        if (canModerate) {
          setMessages([]);
          setNewMessage('');
        } else {
          setCommandError('Недостаточно прав для очистки чата');
        }
        break;

      default:
        setCommandError('Неизвестная команда');
    }

    if (commandError) {
      setTimeout(() => setCommandError(''), 3000);
    }
  };

  const handleKnock = (roomId: string) => {
    const now = Date.now();
    const lastKnock = knockCooldowns[roomId] || 0;
    
    if (now - lastKnock < 5000) {
      return;
    }
    
    setKnockCooldowns(prev => ({
      ...prev,
      [roomId]: now
    }));
    
    alert('Стук отправлен владельцу комнаты');
  };

  const handleImageAttach = (imageUrl: string) => {
    setAttachedImage(imageUrl);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    
    if (text.length > 10) {
      e.preventDefault();
      
      const now = Date.now();
      
      if (now - lastPasteTime < 5000) {
        return;
      }
      
      setPastedText(text);
      setPasteModalText(text);
      setShowPasteModal(true);
      setLastPasteTime(now);
      setPasteBlockActive(true);
      setPasteCountdown(5);
      
      const countdownInterval = setInterval(() => {
        setPasteCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setPasteBlockActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleConfirmPaste = () => {
    setNewMessage(pasteModalText);
    setShowPasteModal(false);
  };

  const handleSanction = (participant: RoomParticipant) => {
    const userRole = getUserRole();
    const isRoomOwner = currentRoom?.creatorId === currentAccount?.id;
    
    if (userRole === 'owner' || userRole === 'admin' || isRoomOwner) {
      setSanctionTarget(participant);
      setShowSanctionModal(true);
    }
  };

  const handleBanUser = async (participant: RoomParticipant) => {
    if (!currentRoom || !currentAccount) return;
    
    try {
      await chatApi.banUser(
        currentRoom.id,
        participant.accountId || participant.username,
        participant.username,
        username
      );
      
      await loadRooms();
      await loadMessages(currentRoom.id);
      
      setShowSanctionModal(false);
      setSanctionTarget(null);
      setSanctionNotificationText(`${participant.username} был забанен`);
      setShowSanctionNotification(true);
      
      setTimeout(() => {
        setShowSanctionNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Ошибка бана пользователя');
    }
  };

  const handleMuteUser = async (participant: RoomParticipant) => {
    if (!currentRoom || !currentAccount) return;
    
    try {
      await chatApi.muteUser(
        currentRoom.id,
        participant.accountId || participant.username,
        participant.username,
        username
      );
      
      await loadRooms();
      await loadMessages(currentRoom.id);
      
      setShowSanctionModal(false);
      setSanctionTarget(null);
      setSanctionNotificationText(`${participant.username} был замучен`);
      setShowSanctionNotification(true);
      
      setTimeout(() => {
        setShowSanctionNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to mute user:', error);
      alert('Ошибка мута пользователя');
    }
  };

  const handleUnbanUser = async (bannedUser: BannedUser) => {
    if (!currentRoom) return;
    
    try {
      await chatApi.unbanUser(currentRoom.id, bannedUser.userId);
      await loadRooms();
      await loadMessages(currentRoom.id);
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('Ошибка разбана пользователя');
    }
  };

  const handleUnmuteUser = async (mutedUser: MutedUser) => {
    if (!currentRoom) return;
    
    try {
      await chatApi.unmuteUser(currentRoom.id, mutedUser.userId);
      await loadRooms();
      await loadMessages(currentRoom.id);
    } catch (error) {
      console.error('Failed to unmute user:', error);
      alert('Ошибка размута пользователя');
    }
  };

  const handleOpenModeration = async () => {
    await loadComplaints();
    setShowModerationPanel(true);
  };

  const handleComplaint = (room: Room) => {
    setComplaintRoom(room);
    setShowComplaintModal(true);
  };

  const handleSubmitComplaint = async (reason: string, description: string) => {
    if (!complaintRoom || !currentAccount) return;
    
    try {
      await chatApi.createComplaint({
        roomId: complaintRoom.id,
        roomName: complaintRoom.name,
        reporterId: currentAccount.id,
        reporterUsername: username,
        reason,
        description,
        status: 'pending'
      });
      
      setShowComplaintModal(false);
      setComplaintRoom(null);
      alert('Жалоба отправлена');
    } catch (error) {
      console.error('Failed to create complaint:', error);
      alert('Ошибка отправки жалобы');
    }
  };

  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      await chatApi.updateRoom({
        id: roomId,
        ...updates
      });
      
      await loadRooms();
      
      if (currentRoom && currentRoom.id === roomId) {
        const roomsData = await chatApi.getRooms();
        const updatedRoom = roomsData.rooms?.find((r: Room) => r.id === roomId);
        if (updatedRoom) {
          setCurrentRoom(updatedRoom);
        }
      }
    } catch (error) {
      console.error('Failed to update room:', error);
      alert('Ошибка обновления комнаты');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту комнату?')) {
      return;
    }
    
    try {
      await chatApi.deleteRoom(roomId);
      await loadRooms();
      
      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom(null);
        setCurrentView('lobby');
      }
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert('Ошибка удаления комнаты');
    }
  };

  const handleSaveRoomName = async () => {
    if (!currentRoom) return;
    
    await handleUpdateRoom(currentRoom.id, { name: tempRoomName });
    setEditingRoomName(false);
  };

  const handleSaveRoomDescription = async () => {
    if (!currentRoom) return;
    
    await handleUpdateRoom(currentRoom.id, { description: tempRoomDescription });
    setEditingRoomDescription(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {currentView === 'login' && (
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
          setShowAuthModal={() => setShowAuthModal(true)}
        />
      )}

      {currentView === 'lobby' && (
        <LobbyView
          username={username}
          rooms={rooms}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={() => setShowCreateRoom(true)}
          onKnock={handleKnock}
          knockCooldowns={knockCooldowns}
          onBack={() => setCurrentView('login')}
          isAuthenticated={isAuthenticated}
          currentAccount={currentAccount}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onOpenModeration={handleOpenModeration}
          onOpenAdmin={() => setShowAdminPanel(true)}
          onComplaint={handleComplaint}
          canAccessRoom={canAccessRoom}
        />
      )}

      {currentView === 'room' && currentRoom && (
        <RoomView
          room={currentRoom}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onLeaveRoom={handleLeaveRoom}
          username={username}
          selectedBgColor={selectedBgColor}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          onPaste={handlePaste}
          pasteBlockActive={pasteBlockActive}
          pasteCountdown={pasteCountdown}
          attachedImage={attachedImage}
          onImageAttach={handleImageAttach}
          onImageRemove={() => setAttachedImage(null)}
          commandError={commandError}
          onSanction={handleSanction}
          currentAccount={currentAccount}
          showInactivityWarning={showInactivityWarning}
          onStayActive={handleStayActive}
          typingUsers={typingUsers}
          editingRoomName={editingRoomName}
          setEditingRoomName={setEditingRoomName}
          tempRoomName={tempRoomName}
          setTempRoomName={setTempRoomName}
          onSaveRoomName={handleSaveRoomName}
          editingRoomDescription={editingRoomDescription}
          setEditingRoomDescription={setEditingRoomDescription}
          tempRoomDescription={tempRoomDescription}
          setTempRoomDescription={setTempRoomDescription}
          onSaveRoomDescription={handleSaveRoomDescription}
          onUnbanUser={handleUnbanUser}
          onUnmuteUser={handleUnmuteUser}
        />
      )}

      <Modals
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        authId={authId}
        setAuthId={setAuthId}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        handleAuth={handleAuth}
        showPasswordPrompt={showPasswordPrompt}
        setShowPasswordPrompt={setShowPasswordPrompt}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        handlePasswordSubmit={handlePasswordSubmit}
        showPasteModal={showPasteModal}
        setShowPasteModal={setShowPasteModal}
        pasteModalText={pasteModalText}
        setPasteModalText={setPasteModalText}
        handleConfirmPaste={handleConfirmPaste}
        showKickNotification={showKickNotification}
        showSanctionNotification={showSanctionNotification}
        sanctionNotificationText={sanctionNotificationText}
      />

      {showCreateRoom && (
        <CreateRoomModal
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
          newRoomIsAdult={newRoomIsAdult}
          setNewRoomIsAdult={setNewRoomIsAdult}
          newRoomIsLocked={newRoomIsLocked}
          setNewRoomIsLocked={setNewRoomIsLocked}
          newRoomIsPrivate={newRoomIsPrivate}
          setNewRoomIsPrivate={setNewRoomIsPrivate}
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {showSanctionModal && sanctionTarget && (
        <SanctionModal
          target={sanctionTarget}
          onClose={() => {
            setShowSanctionModal(false);
            setSanctionTarget(null);
          }}
          onBan={handleBanUser}
          onMute={handleMuteUser}
        />
      )}

      {showModerationPanel && (
        <ModerationPanel
          complaints={complaints}
          onClose={() => setShowModerationPanel(false)}
          onUpdateComplaint={async (id, status) => {
            try {
              await chatApi.updateComplaint(id, status);
              await loadComplaints();
            } catch (error) {
              console.error('Failed to update complaint:', error);
            }
          }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          rooms={rooms}
          accounts={accounts}
          onClose={() => setShowAdminPanel(false)}
          onDeleteRoom={handleDeleteRoom}
          onCreateAccount={() => setShowCreateAccountModal(true)}
        />
      )}

      {showCreateAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Создать аккаунт</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Имя пользователя"
                value={newAccountUsername}
                onChange={(e) => setNewAccountUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={newAccountRole}
                onChange={(e) => setNewAccountRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
                <option value="owner">Владелец</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Создать
                </button>
                <button
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setNewAccountUsername('');
                    setNewAccountPassword('');
                    setNewAccountRole('user');
                  }}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComplaintModal && complaintRoom && (
        <ComplaintModal
          room={complaintRoom}
          onClose={() => {
            setShowComplaintModal(false);
            setComplaintRoom(null);
          }}
          onSubmit={handleSubmitComplaint}
        />
      )}
    </div>
  );
};

export default Index;