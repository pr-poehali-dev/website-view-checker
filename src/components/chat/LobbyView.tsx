import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Room, Account, RoomTheme } from './types';
import { ROOM_THEME_COLORS, ROOM_THEME_NAMES, ROOM_BADGES, STANDARD_AVATARS } from './types';

const BLUR_AVATAR = 'https://cdn.poehali.dev/projects/4d80e05f-ab34-489c-905f-5316a80107b2/files/9117574c-4ba9-4d6c-a779-5ab98c24ae42.jpg';

type LobbyViewProps = {
  username: string;
  selectedAvatar: string;
  selectedBgColor: string;
  isAuthenticated: boolean;
  currentAccount: Account | null;
  isAdmin: boolean;
  rooms: Room[];
  accounts: Account[];
  setShowCreateAccountModal: (value: boolean) => void;
  handleLogout: () => void;
  setCurrentView: (view: 'login' | 'lobby' | 'room') => void;
  setShowCreateRoom: (value: boolean) => void;
  joinRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  knockOnRoom: (room: Room) => void;
};

export const LobbyView = ({
  username,
  selectedAvatar,
  selectedBgColor,
  isAuthenticated,
  currentAccount,
  isAdmin,
  rooms,
  accounts,
  setShowCreateAccountModal,
  handleLogout,
  setCurrentView,
  setShowCreateRoom,
  joinRoom,
  deleteRoom,
  knockOnRoom,
}: LobbyViewProps) => {
  return (
    <div className="min-h-screen flex">
      <div className="w-64 border-r-4 border-foreground p-6 bg-black">
        <div className="space-y-4">
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

      <div className="flex-1 p-6 bg-black">
        <h2 className="text-2xl font-bold mb-6">КОМНАТЫ ({rooms.length})</h2>
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => {
              const isParticipant = room.participants.some(p => p.username === username);
              const isCreator = room.creatorUsername === username;
              const isPrivateAndNotParticipant = room.is_private && !isParticipant && !isAdmin;
              const canSeeFullInfo = isParticipant || isAdmin || isCreator || !room.is_private;
              const isBanned = room.bannedUsers.some(bu => bu.username?.toLowerCase() === username.toLowerCase());
              const isFull = room.currentParticipants >= room.maxParticipants;
              const canKnock = (room.is_locked || room.is_private) && !isParticipant && !isBanned;
              
              return (
                <Card key={room.id} className="border-4 border-foreground bg-black">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {canSeeFullInfo && (
                          <div 
                            className="px-3 py-1 text-xs border-2 border-foreground"
                            style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                          >
                            {ROOM_THEME_NAMES[room.theme]}
                          </div>
                        )}
                        {room.is_adult && (
                          <div className="px-2 py-1 text-xs border-2 border-foreground bg-red-900">
                            18+
                          </div>
                        )}
                        {room.is_locked && (
                          <div className="px-2 py-1 text-xs border-2 border-foreground bg-yellow-900">
                            🔒
                          </div>
                        )}
                        {room.is_private && (isAdmin || isCreator || isParticipant) && (
                          <div className="px-2 py-1 text-xs border-2 border-foreground bg-purple-900">
                            Приватно
                          </div>
                        )}
                        <h3 className="text-lg font-bold">{room.name}</h3>
                      </div>
                      {canSeeFullInfo && room.description && (
                        <p className="text-xs text-cyan-400 mb-1">{room.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {room.currentParticipants}/{room.maxParticipants} УЧАСТНИКОВ
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {canSeeFullInfo ? (
                          room.participants.map((participant, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className="w-12 h-12 border-2 border-foreground">
                                <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs">{participant.username}</span>
                            </div>
                          ))
                        ) : (
                          Array.from({ length: room.currentParticipants }).map((_, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className="w-12 h-12 border-2 border-foreground">
                                <img src={BLUR_AVATAR} alt="user" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs">user</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isBanned && !isFull && (
                        <Button 
                          onClick={() => joinRoom(room)}
                          className="flex-1 border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                        >
                          ВОЙТИ
                        </Button>
                      )}
                      {isFull && !isAdmin && (
                        <Button 
                          disabled
                          className="flex-1 border-2 border-foreground text-xs"
                        >
                          ЗАПОЛНЕНО
                        </Button>
                      )}
                      {(isAdmin || isCreator) && (
                        <Button 
                          onClick={() => deleteRoom(room.id)}
                          variant="outline"
                          className="border-2 border-foreground text-xs bg-red-900"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      )}
                      {canKnock && (
                        <Button 
                          onClick={() => knockOnRoom(room)}
                          variant="outline"
                          className="flex-1 border-2 border-foreground text-xs"
                        >
                          ПОСТУЧАТЬ
                        </Button>
                      )}
                      {isBanned && (
                        <Button 
                          variant="outline"
                          className="flex-1 border-2 border-foreground text-xs"
                        >
                          ПИСЬМО
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        className="border-2 border-foreground text-xs"
                      >
                        <Icon name="Flag" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};