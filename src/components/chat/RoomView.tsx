import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Room, Message, TypingUser, RoomParticipant, UserRole } from './types';

type RoomViewProps = {
  currentRoom: Room;
  username: string;
  selectedAvatar: string;
  isAdmin: boolean;
  messages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  editingRoomName: boolean;
  setEditingRoomName: (value: boolean) => void;
  tempRoomName: string;
  setTempRoomName: (value: string) => void;
  editingRoomDescription: boolean;
  setEditingRoomDescription: (value: boolean) => void;
  tempRoomDescription: string;
  setTempRoomDescription: (value: string) => void;
  leaveRoom: () => void;
  deleteRoom: (id: string) => void;
  sendMessage: () => void;
  deleteMessage: (id: string) => void;
  kickParticipant: (username: string) => void;
  banParticipant: (username: string) => void;
  expandRoom: () => void;
  updateRoomName: () => void;
  updateRoomDescription: () => void;
  onActivity?: () => void;
  typingUsers: TypingUser[];
  onTyping: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onImageAttach: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pasteBlockActive: boolean;
  pasteCountdown: number;
  attachedImage: string | null;
  onRemoveImage: () => void;
  pastedText: string;
  onShowPasteModal: (text: string) => void;
  commandError: string;
  onUserClick: (username: string) => void;
  currentUserRole: UserRole;
  onManageUser: (participant: RoomParticipant) => void;
  isMuted?: boolean;
};

export const RoomView = ({
  currentRoom,
  username,
  selectedAvatar,
  isAdmin,
  messages,
  newMessage,
  setNewMessage,
  replyingTo,
  setReplyingTo,
  editingRoomName,
  setEditingRoomName,
  tempRoomName,
  setTempRoomName,
  editingRoomDescription,
  setEditingRoomDescription,
  tempRoomDescription,
  setTempRoomDescription,
  leaveRoom,
  deleteRoom,
  sendMessage,
  deleteMessage,
  kickParticipant,
  banParticipant,
  expandRoom,
  updateRoomName,
  updateRoomDescription,
  onActivity,
  typingUsers,
  onTyping,
  onPaste,
  onImageAttach,
  pasteBlockActive,
  pasteCountdown,
  attachedImage,
  onRemoveImage,
  pastedText,
  onShowPasteModal,
  commandError,
  onUserClick,
  currentUserRole,
  onManageUser,
  isMuted,
}: RoomViewProps) => {
  const isHost = (currentRoom.hostUsername && currentRoom.hostUsername === username) || currentRoom.creatorUsername === username;
  const canEditBasicInfo = isHost || currentUserRole === 'moderator' || currentUserRole === 'admin' || currentUserRole === 'owner';
  const canEditAllSettings = currentUserRole === 'admin' || currentUserRole === 'owner';
  const canDeleteRoom = currentUserRole === 'admin' || currentUserRole === 'owner';
  
  const [expandedImages, setExpandedImages] = useState<Set<string>>(new Set());
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null);
  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set());
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null);
  
  const handleActivity = () => {
    if (onActivity) {
      onActivity();
    }
  };
  
  return (
    <div 
      className="min-h-screen flex bg-black"
      onClick={handleActivity}
      onMouseMove={handleActivity}
      onTouchMove={handleActivity}
      onKeyDown={handleActivity}
    >
      <div className="w-64 border-r-4 border-foreground p-6 bg-black">
        <div className="space-y-4">
          <div className="w-full mb-4">
            <img 
              src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
              alt="URBAN GROVE" 
              className="w-full h-auto"
            />
          </div>
          
          <div>
            <h3 className="text-xs font-bold mb-2">УЧАСТНИКИ ({currentRoom.currentParticipants}):</h3>
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {currentRoom.participants.map((participant, idx) => {
                  const isCurrentUserProfile = showUserProfile === participant.username;
                  const canManageUser = isHost || currentUserRole === 'moderator' || currentUserRole === 'admin' || currentUserRole === 'owner';
                  const isHostBadge = currentRoom.hostUsername && currentRoom.hostUsername === participant.username;
                  
                  return (
                    <div key={idx} className="relative">
                      <div 
                        className="flex items-center gap-2 p-2 border-2 border-foreground bg-card cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => {
                          if (participant.username === username) return;
                          setShowUserProfile(isCurrentUserProfile ? null : participant.username);
                        }}
                      >
                        <div 
                          className="w-8 h-8 border border-foreground"
                          style={{ backgroundColor: participant.bgColor || '#2D2D2D' }}
                        >
                          <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{participant.username}</span>
                            {isHostBadge && <Icon name="Crown" size={10} className="text-yellow-500" />}
                          </div>
                          {participant.role === 'moderator' && (
                            <div className="text-[9px] text-blue-400 font-bold">Mod</div>
                          )}
                          {participant.role === 'admin' && (
                            <div className="text-[9px] text-red-400 font-bold">Adm</div>
                          )}
                        </div>
                      </div>
                      
                      {isCurrentUserProfile && participant.username !== username && (
                        <div className="absolute top-full left-0 w-full mt-1 z-50 border-2 border-foreground bg-black p-2 space-y-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border border-foreground"
                            onClick={() => {
                              onUserClick(participant.username);
                              setShowUserProfile(null);
                            }}
                          >
                            Упомянуть
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs border border-foreground"
                            onClick={() => {
                              onUserClick(participant.username);
                              setShowUserProfile(null);
                            }}
                          >
                            Личное сообщение
                          </Button>
                          {canManageUser && (
                            <Button
                              size="sm"
                              className="w-full text-xs border-2 border-foreground bg-orange-600 hover:bg-orange-700 text-white"
                              onClick={() => {
                                onManageUser(participant);
                                setShowUserProfile(null);
                              }}
                            >
                              Управлять
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen">
        <div className="border-b-4 border-foreground p-4 bg-black flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              {editingRoomName ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={tempRoomName}
                    onChange={(e) => setTempRoomName(e.target.value)}
                    className="text-xl font-bold border-2 border-foreground"
                  />
                  <Button size="sm" onClick={updateRoomName}>
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setEditingRoomName(false)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <h2 
                  className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => {
                    if (canEditBasicInfo) {
                      setTempRoomName(currentRoom.name);
                      setEditingRoomName(true);
                    }
                  }}
                >
                  {currentRoom.name}
                  {canEditBasicInfo && (
                    <Icon name="Pencil" size={16} />
                  )}
                </h2>
              )}
              {editingRoomDescription ? (
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    value={tempRoomDescription}
                    onChange={(e) => setTempRoomDescription(e.target.value)}
                    className="text-sm border-2 border-foreground"
                    placeholder="Описание комнаты"
                  />
                  <Button size="sm" onClick={updateRoomDescription}>
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setEditingRoomDescription(false)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <p 
                  className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                  onClick={() => {
                    if (canEditBasicInfo) {
                      setTempRoomDescription(currentRoom.description || '');
                      setEditingRoomDescription(true);
                    }
                  }}
                >
                  {currentRoom.description || 'Нет описания'}
                  {canEditBasicInfo && (
                    <Icon name="Pencil" size={12} />
                  )}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {currentRoom.currentParticipants}/{currentRoom.maxParticipants} УЧАСТНИКОВ
                {canEditBasicInfo && (
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
            <div className="flex gap-2">
              {canDeleteRoom && (
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
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
          {messages.filter(m => !hiddenMessages.has(m.id)).map((msg) => {
            if (msg.isSystemMessage) {
              return (
                <div key={msg.id} className="flex justify-center py-2">
                  <div className="text-sm text-muted-foreground italic">
                    {msg.text}
                  </div>
                </div>
              );
            }
            
            const isOwnMessage = msg.user === username;
            const textLength = msg.text.length;
            let bubbleWidth = 'max-w-[50%]';
            if (textLength > 75) bubbleWidth = 'max-w-[90%]';
            else if (textLength > 37) bubbleWidth = 'max-w-[75%]';
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 group items-start ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0 relative">
                  <div 
                    className="w-12 h-12 border-2 border-foreground relative cursor-pointer"
                    onClick={() => setShowUserProfile(showUserProfile === msg.user ? null : msg.user)}
                  >
                    <img src={msg.avatar} alt={msg.user} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs">{msg.user}</span>
                  
                  {showUserProfile === msg.user && msg.user !== username && (
                    <div className="absolute top-14 left-0 bg-card border-2 border-foreground p-3 z-20 min-w-[150px]">
                      <p className="text-xs mb-2 font-bold">{msg.user}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onUserClick(msg.user);
                          setShowUserProfile(null);
                        }}
                        className="text-xs border-2 border-foreground w-full mb-1"
                      >
                        Личное сообщение
                      </Button>
                      {isHost && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              kickParticipant(msg.user);
                              setShowUserProfile(null);
                            }}
                            className="text-xs border-2 border-foreground bg-orange-900 w-full mb-1"
                          >
                            Кикнуть
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              banParticipant(msg.user);
                              setShowUserProfile(null);
                            }}
                            className="text-xs border-2 border-foreground bg-red-900 w-full"
                          >
                            Забанить
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col gap-1 ${bubbleWidth}`}>
                  {msg.isReply && msg.replyTo && (
                    <div className={`text-xs text-cyan-400 italic ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      отвечает на {msg.replyTo.substring(0, 10)}...
                    </div>
                  )}
                  
                  <div 
                    className="p-3 text-sm border-2 border-foreground relative rounded-lg cursor-pointer"
                    style={{ backgroundColor: msg.bgColor || '#2D2D2D' }}
                    onClick={() => setShowMessageActions(showMessageActions === msg.id ? null : msg.id)}
                  >
                    {msg.imageUrl && (
                      <div className="mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedImages(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(msg.id)) {
                                newSet.delete(msg.id);
                              } else {
                                newSet.add(msg.id);
                              }
                              return newSet;
                            });
                          }}
                          className="text-xs border-2 border-foreground"
                        >
                          <Icon name="Image" size={14} className="mr-1" />
                          Изображение
                        </Button>
                        {expandedImages.has(msg.id) && (
                          <div className="mt-2 border-2 border-foreground">
                            <img src={msg.imageUrl} alt="attachment" className="w-full h-auto" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="break-words">
                      {msg.text}
                      {msg.text.includes('копипаста') && !msg.text.startsWith('копипаста ') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowPasteModal(msg.text);
                          }}
                          className="ml-2 text-xs border-2 border-foreground"
                        >
                          копипаста
                        </Button>
                      )}
                    </div>
                    
                    <div 
                      className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-left' : 'text-right'}`}
                      style={{ fontSize: '0.7em', color: '#888888' }}
                    >
                      {msg.timestamp}
                    </div>
                    
                    {showMessageActions === msg.id && (
                      <div className="absolute bottom-2 right-2 bg-card border-2 border-foreground p-2 z-10 flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReplyingTo(msg);
                            setShowMessageActions(null);
                          }}
                          className="text-xs justify-start"
                        >
                          Ответить
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            const quote = `«${msg.text}» — ${msg.user}`;
                            setNewMessage(quote);
                            setShowMessageActions(null);
                          }}
                          className="text-xs justify-start"
                        >
                          Цитировать
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHiddenMessages(prev => new Set([...prev, msg.id]));
                            setShowMessageActions(null);
                          }}
                          className="text-xs justify-start"
                        >
                          Скрыть
                        </Button>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessage(msg.id);
                              setShowMessageActions(null);
                            }}
                            className="text-xs justify-start text-red-500"
                          >
                            Удалить
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {typingUsers.filter(tu => tu.username !== username).length > 0 && (
            <div className="text-sm text-muted-foreground italic mt-4">
              {(() => {
                const others = typingUsers.filter(tu => tu.username !== username);
                if (others.length === 1) {
                  return `${others[0].username} печатает…`;
                } else if (others.length === 2) {
                  return `${others[0].username} и ${others[1].username} печатают…`;
                } else {
                  return `${others[0].username} и ещё ${others.length - 1} печатают…`;
                }
              })()}
            </div>
          )}
        </div>
        </ScrollArea>

        <div className="border-t-4 border-foreground p-4 bg-black flex-shrink-0">
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
            <div className="space-y-1">
              {attachedImage && (
                <div className="flex items-center gap-2 p-2 border-2 border-foreground bg-card">
                  <Icon name="Image" size={14} />
                  <span className="text-xs flex-1">Изображение прикреплено</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRemoveImage}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              )}
              {pastedText && (
                <div className="flex items-center gap-2 p-2 border-2 border-foreground bg-card">
                  <Icon name="FileText" size={14} />
                  <span className="text-xs flex-1">Копипаста ({pastedText.length} симв.)</span>
                </div>
              )}
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 border-2 border-foreground flex-shrink-0">
                  <img src={selectedAvatar} alt="you" className="w-full h-full object-cover" />
                </div>
                <input
                  type="file"
                  ref={(el) => { if (el) el.onclick = () => { el.value = ''; }; }}
                  accept="image/*"
                  onChange={onImageAttach}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-2 border-foreground"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Icon name="Paperclip" size={16} />
                  </Button>
                </label>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (e.target.value.length >= 9 && !e.target.value.startsWith('/')) {
                      onTyping();
                    }
                  }}
                  onPaste={onPaste}
                  placeholder=""
                  className="border-2 border-foreground text-sm flex-1"
                  maxLength={150}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <Button
                  onClick={sendMessage}
                  className="border-2 border-foreground bg-primary hover:bg-primary/80"
                  size="sm"
                  disabled={(pasteBlockActive && pasteCountdown > 0) || isMuted}
                  title={isMuted ? 'Вы замучены' : undefined}
                >
                  {pasteBlockActive && pasteCountdown > 0 ? (
                    <span>{pasteCountdown}</span>
                  ) : isMuted ? (
                    <Icon name="Volume2" size={20} />
                  ) : (
                    <Icon name="Hash" size={20} />
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {newMessage.length}/150
                {pasteBlockActive && pasteCountdown > 0 && (
                  <span className="ml-2 text-yellow-500">Ожидание {pasteCountdown}с</span>
                )}
              </div>
              {commandError && (
                <div className="text-xs text-center p-2 border-2 border-foreground bg-card">
                  {commandError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};