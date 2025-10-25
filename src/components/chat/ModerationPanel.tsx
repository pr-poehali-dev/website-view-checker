import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Room, BannedUser, MutedUser, UserRole } from './types';

export type Complaint = {
  id: string;
  reporterUsername: string;
  targetUsername: string;
  description: string;
  images: string[];
  timestamp: number;
  status: 'accepted' | 'in_review';
  roomId?: string;
};

interface ModerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  rooms: Room[];
  complaints: Complaint[];
  onUnban: (roomId: string, bannedUser: BannedUser) => void;
  onUnmute: (roomId: string, mutedUser: MutedUser) => void;
  onUpdateComplaintStatus: (complaintId: string, status: 'accepted' | 'in_review') => void;
}

export const ModerationPanel = ({
  isOpen,
  onClose,
  currentUserRole,
  rooms,
  complaints,
  onUnban,
  onUnmute,
  onUpdateComplaintStatus,
}: ModerationPanelProps) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const canModerate = currentUserRole === 'moderator' || currentUserRole === 'admin' || currentUserRole === 'owner';

  if (!canModerate) return null;

  const allBannedUsers: Array<{ room: Room; bannedUser: BannedUser }> = [];
  const allMutedUsers: Array<{ room: Room; mutedUser: MutedUser }> = [];

  rooms.forEach((room) => {
    room.bannedUsers.forEach((bannedUser) => {
      allBannedUsers.push({ room, bannedUser });
    });
    room.mutedUsers.forEach((mutedUser) => {
      allMutedUsers.push({ room, mutedUser });
    });
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month} ${hours}:${minutes}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black border-4 border-foreground max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">
              Панель модерации
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="complaints" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-2 border-foreground bg-card">
              <TabsTrigger value="complaints" className="text-xs font-bold uppercase">
                Жалобы
              </TabsTrigger>
              <TabsTrigger value="banlist" className="text-xs font-bold uppercase">
                Бан-лист
              </TabsTrigger>
              <TabsTrigger value="mutelist" className="text-xs font-bold uppercase">
                Замут-лист
              </TabsTrigger>
            </TabsList>

            <TabsContent value="complaints" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {complaints.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Нет жалоб
                    </div>
                  ) : (
                    complaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border-2 border-foreground bg-card p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`px-2 py-1 text-xs border border-foreground ${
                              complaint.status === 'accepted'
                                ? 'bg-green-900'
                                : 'bg-yellow-900'
                            }`}
                          >
                            {complaint.status === 'accepted' ? 'ПРИНЯТА' : 'В РАССМОТРЕНИИ'}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(complaint.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">От:</span>{' '}
                          <span className="text-primary">{complaint.reporterUsername}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">На:</span>{' '}
                          <span className="text-red-400">{complaint.targetUsername}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {complaint.description.length > 80
                            ? `${complaint.description.slice(0, 80)}...`
                            : complaint.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-2 border-foreground text-xs"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          Открыть полностью
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="banlist" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {allBannedUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Нет забаненных пользователей
                    </div>
                  ) : (
                    allBannedUsers.map(({ room, bannedUser }, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-foreground bg-card p-3 space-y-2"
                      >
                        <div className="text-sm font-bold text-red-400">
                          {bannedUser.username || bannedUser.ip || bannedUser.mac || bannedUser.accountId}
                        </div>
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">Комната:</span>{' '}
                            <span className="text-primary">{room.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Кто применил:</span>{' '}
                            {bannedUser.bannedBy}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Когда:</span>{' '}
                            {formatDate(bannedUser.timestamp)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full border-2 border-foreground bg-green-700 hover:bg-green-800 text-xs"
                          onClick={() => onUnban(room.id, bannedUser)}
                        >
                          Разбанить
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="mutelist" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {allMutedUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Нет замученных пользователей
                    </div>
                  ) : (
                    allMutedUsers.map(({ room, mutedUser }, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-foreground bg-card p-3 space-y-2"
                      >
                        <div className="text-sm font-bold text-orange-400">
                          {mutedUser.username}
                        </div>
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="text-muted-foreground">Комната:</span>{' '}
                            <span className="text-primary">{room.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Кто применил:</span>{' '}
                            {mutedUser.mutedBy}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Когда:</span>{' '}
                            {formatDate(mutedUser.timestamp)}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="w-full border-2 border-foreground bg-green-700 hover:bg-green-800 text-xs"
                          onClick={() => onUnmute(room.id, mutedUser)}
                        >
                          Размутить
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedComplaint && (
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="bg-black border-4 border-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                Жалоба от {selectedComplaint.reporterUsername}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                {formatDate(selectedComplaint.timestamp)}
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">На пользователя:</span>{' '}
                <span className="text-red-400 font-bold">{selectedComplaint.targetUsername}</span>
              </div>

              <div className="border-2 border-foreground bg-card p-3">
                <p className="text-sm whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold">Изображения:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedComplaint.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-foreground cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setExpandedImage(img)}
                      >
                        <img
                          src={img}
                          alt={`evidence-${idx}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.status === 'accepted' && (
                <Button
                  className="w-full border-2 border-foreground bg-yellow-700 hover:bg-yellow-800 text-xs"
                  onClick={() => {
                    onUpdateComplaintStatus(selectedComplaint.id, 'in_review');
                    setSelectedComplaint(null);
                  }}
                >
                  Пометить как "В рассмотрении"
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full border-2 border-foreground text-xs"
                onClick={() => setSelectedComplaint(null)}
              >
                Закрыть
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {expandedImage && (
        <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
          <DialogContent className="bg-black border-4 border-foreground max-w-4xl">
            <img src={expandedImage} alt="evidence" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
