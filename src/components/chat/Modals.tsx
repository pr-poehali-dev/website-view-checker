import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { RoomTheme, RoomBadge, UserRole } from './types';
import { ROOM_BADGES } from './types';

type ModalsProps = {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  authId: string;
  setAuthId: (value: string) => void;
  authPassword: string;
  setAuthPassword: (value: string) => void;
  handleAuth: () => void;
  
  showCreateAccountModal: boolean;
  setShowCreateAccountModal: (value: boolean) => void;
  newAccountUsername: string;
  setNewAccountUsername: (value: string) => void;
  newAccountPassword: string;
  setNewAccountPassword: (value: string) => void;
  newAccountRole: UserRole;
  setNewAccountRole: (value: UserRole) => void;
  handleCreateAccount: () => void;
  
  showCreateRoom: boolean;
  setShowCreateRoom: (value: boolean) => void;
  newRoomName: string;
  setNewRoomName: (value: string) => void;
  newRoomDescription: string;
  setNewRoomDescription: (value: string) => void;
  newRoomTheme: RoomTheme;
  setNewRoomTheme: (value: RoomTheme) => void;
  newRoomBadge: RoomBadge;
  setNewRoomBadge: (value: RoomBadge) => void;
  newRoomPassword: string;
  setNewRoomPassword: (value: string) => void;
  newRoomMaxParticipants: number;
  setNewRoomMaxParticipants: (value: number) => void;
  createRoom: () => void;
  
  showPasswordPrompt: boolean;
  setShowPasswordPrompt: (value: boolean) => void;
  passwordInput: string;
  setPasswordInput: (value: string) => void;
  handlePasswordSubmit: () => void;
};

export const Modals = ({
  showAuthModal,
  setShowAuthModal,
  authId,
  setAuthId,
  authPassword,
  setAuthPassword,
  handleAuth,
  showCreateAccountModal,
  setShowCreateAccountModal,
  newAccountUsername,
  setNewAccountUsername,
  newAccountPassword,
  setNewAccountPassword,
  newAccountRole,
  setNewAccountRole,
  handleCreateAccount,
  showCreateRoom,
  setShowCreateRoom,
  newRoomName,
  setNewRoomName,
  newRoomDescription,
  setNewRoomDescription,
  newRoomTheme,
  setNewRoomTheme,
  newRoomBadge,
  setNewRoomBadge,
  newRoomPassword,
  setNewRoomPassword,
  newRoomMaxParticipants,
  setNewRoomMaxParticipants,
  createRoom,
  showPasswordPrompt,
  setShowPasswordPrompt,
  passwordInput,
  setPasswordInput,
  handlePasswordSubmit,
}: ModalsProps) => {
  return (
    <>
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
                  placeholder="МОЯ КОМНАТА"
                  className="border-2 border-foreground text-xs"
                  maxLength={30}
                />
              </div>
              <div>
                <p className="text-xs mb-2">ОПИСАНИЕ (ОПЦИОНАЛЬНО):</p>
                <Input
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Описание комнаты"
                  className="border-2 border-foreground text-xs"
                  maxLength={100}
                />
              </div>
              <div>
                <p className="text-xs mb-2">ТЕМА:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['general', 'tech', 'gaming', 'music', 'art', 'sports'] as RoomTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setNewRoomTheme(theme)}
                      className={`p-3 text-xs border-2 transition-all ${
                        newRoomTheme === theme
                          ? 'border-primary bg-primary/20'
                          : 'border-foreground bg-card hover:bg-muted'
                      }`}
                    >
                      {theme.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs mb-2">ЗНАЧОК:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROOM_BADGES) as RoomBadge[]).map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setNewRoomBadge(badge)}
                      className={`p-3 text-xs border-2 transition-all ${
                        newRoomBadge === badge
                          ? 'border-primary bg-primary/20'
                          : 'border-foreground bg-card hover:bg-muted'
                      }`}
                    >
                      {ROOM_BADGES[badge].icon} {ROOM_BADGES[badge].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs mb-2">ПАРОЛЬ (ОПЦИОНАЛЬНО):</p>
                <Input
                  type="password"
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  placeholder="Оставьте пустым для открытой комнаты"
                  className="border-2 border-foreground text-xs"
                />
              </div>
              <div>
                <p className="text-xs mb-2">МАКС. УЧАСТНИКОВ: {newRoomMaxParticipants}</p>
                <input
                  type="range"
                  min="2"
                  max="50"
                  value={newRoomMaxParticipants}
                  onChange={(e) => setNewRoomMaxParticipants(Number(e.target.value))}
                  className="w-full"
                />
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

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm border-4 border-foreground bg-black">
            <CardHeader>
              <CardTitle className="text-lg">🔒 ВВЕДИТЕ ПАРОЛЬ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="ПАРОЛЬ"
                className="border-2 border-foreground text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordSubmit}
                  className="flex-1 border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                >
                  ВОЙТИ
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPasswordInput('');
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-foreground text-xs"
                >
                  ОТМЕНА
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
