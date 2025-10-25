import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { RoomParticipant, UserRole } from './types';

interface SanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: RoomParticipant | null;
  currentUsername: string;
  currentRole: UserRole;
  isHost: boolean;
  onKick: (username: string) => void;
  onMute: (username: string) => void;
  onBan: (username: string) => void;
  onTransferHost?: (username: string) => void;
}

export const SanctionModal = ({
  isOpen,
  onClose,
  target,
  currentUsername,
  currentRole,
  isHost,
  onKick,
  onMute,
  onBan,
  onTransferHost
}: SanctionModalProps) => {
  if (!target) return null;

  const canManage = isHost || currentRole === 'moderator' || currentRole === 'admin' || currentRole === 'owner';
  
  if (!canManage) return null;

  const handleAction = (action: 'kick' | 'mute' | 'ban' | 'transfer') => {
    if (!target.username) return;
    
    switch (action) {
      case 'kick':
        onKick(target.username);
        break;
      case 'mute':
        onMute(target.username);
        break;
      case 'ban':
        onBan(target.username);
        break;
      case 'transfer':
        if (onTransferHost) {
          onTransferHost(target.username);
        }
        break;
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-4 border-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase">
            Управление
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="p-3 border-2 border-foreground bg-card">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 border-2 border-foreground flex-shrink-0"
                style={{ backgroundColor: target.bgColor || '#2D2D2D' }}
              >
                {target.avatar && (
                  <img 
                    src={target.avatar} 
                    alt={target.username}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="font-bold">{target.username}</div>
                {target.role === 'moderator' && (
                  <div className="text-xs text-blue-400">Mod</div>
                )}
                {target.role === 'admin' && (
                  <div className="text-xs text-red-400">Adm</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => handleAction('kick')}
              className="w-full border-2 border-foreground bg-yellow-600 hover:bg-yellow-700 text-white font-black uppercase"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Кикнуть
            </Button>

            <Button
              onClick={() => handleAction('mute')}
              className="w-full border-2 border-foreground bg-orange-600 hover:bg-orange-700 text-white font-black uppercase"
            >
              <Icon name="Volume2" size={16} className="mr-2" />
              Замутить
            </Button>

            <Button
              onClick={() => handleAction('ban')}
              className="w-full border-2 border-foreground bg-red-600 hover:bg-red-700 text-white font-black uppercase"
            >
              <Icon name="Ban" size={16} className="mr-2" />
              Забанить
            </Button>

            {isHost && onTransferHost && (
              <Button
                onClick={() => handleAction('transfer')}
                className="w-full border-2 border-foreground bg-purple-600 hover:bg-purple-700 text-white font-black uppercase"
              >
                <Icon name="Crown" size={16} className="mr-2" />
                Передать хоста
              </Button>
            )}
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-2 border-foreground bg-card hover:bg-muted font-black uppercase"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
