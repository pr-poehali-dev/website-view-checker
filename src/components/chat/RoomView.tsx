import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Room, Message } from './types';

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
  expandRoom: () => void;
  updateRoomName: () => void;
  updateRoomDescription: () => void;
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
  expandRoom,
  updateRoomName,
  updateRoomDescription,
}: RoomViewProps) => {
  return (
    <div className="min-h-screen flex bg-black">
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
                {currentRoom.participants.map((participant, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 border-2 border-foreground bg-card">
                    <div className="w-8 h-8 border border-foreground">
                      <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs flex-1">{participant.username}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b-4 border-foreground p-4 bg-black">
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
                    if (isAdmin || currentRoom.creatorId === username) {
                      setTempRoomName(currentRoom.name);
                      setEditingRoomName(true);
                    }
                  }}
                >
                  {currentRoom.name}
                  {(isAdmin || currentRoom.creatorId === username) && (
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
                    if (isAdmin || currentRoom.creatorId === username) {
                      setTempRoomDescription(currentRoom.description || '');
                      setEditingRoomDescription(true);
                    }
                  }}
                >
                  {currentRoom.description || 'Нет описания'}
                  {(isAdmin || currentRoom.creatorId === username) && (
                    <Icon name="Pencil" size={12} />
                  )}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {currentRoom.currentParticipants}/{currentRoom.maxParticipants} УЧАСТНИКОВ
                {isAdmin && (
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
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group">
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
            <div className="space-y-1">
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 border-2 border-foreground flex-shrink-0">
                  <img src={selectedAvatar} alt="you" className="w-full h-full object-cover" />
                </div>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder=""
                  className="border-2 border-foreground text-sm flex-1"
                  maxLength={150}
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
              <div className="text-xs text-muted-foreground text-right">
                {newMessage.length}/150
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};