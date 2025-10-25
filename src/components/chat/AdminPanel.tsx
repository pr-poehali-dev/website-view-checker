import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Room, UserRole, RoomTheme } from './types';
import { ROOM_THEME_COLORS, ROOM_THEME_NAMES } from './types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  rooms: Room[];
  onDeleteRoom: (roomId: string) => void;
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void;
}

export const AdminPanel = ({
  isOpen,
  onClose,
  currentUserRole,
  rooms,
  onDeleteRoom,
  onUpdateRoom,
}: AdminPanelProps) => {
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editFormData, setEditFormData] = useState({
    name: '',
    theme: 'general' as RoomTheme,
    description: '',
    maxParticipants: 5,
    is_adult: false,
    is_private: false,
    is_locked: false,
    password: '',
  });

  const canAdmin = currentUserRole === 'admin' || currentUserRole === 'owner';

  if (!canAdmin) return null;

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setEditFormData({
      name: room.name,
      theme: room.theme,
      description: room.description || '',
      maxParticipants: room.maxParticipants,
      is_adult: room.is_adult,
      is_private: room.is_private,
      is_locked: room.is_locked,
      password: room.password ? atob(room.password) : '',
    });
  };

  const handleSaveRoom = () => {
    if (!editingRoom) return;

    const hashedPassword = editFormData.is_locked && editFormData.password
      ? btoa(editFormData.password.toLowerCase())
      : undefined;

    onUpdateRoom(editingRoom.id, {
      name: editFormData.name,
      theme: editFormData.theme,
      description: editFormData.description || undefined,
      maxParticipants: editFormData.maxParticipants,
      is_adult: editFormData.is_adult,
      is_private: editFormData.is_private,
      is_locked: editFormData.is_locked,
      password: hashedPassword,
    });

    setEditingRoom(null);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmRoom) {
      onDeleteRoom(deleteConfirmRoom.id);
      setDeleteConfirmRoom(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-black border-4 border-foreground max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">
              Админ-панель
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-2 border-foreground bg-card">
              <TabsTrigger value="rooms" className="text-xs font-bold uppercase">
                Комнаты
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs font-bold uppercase">
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="dev" className="text-xs font-bold uppercase">
                В разработке
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="mt-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border-2 border-foreground bg-card p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-sm">{room.name}</span>
                            <div
                              className="px-2 py-0.5 text-[10px] border border-foreground"
                              style={{ backgroundColor: ROOM_THEME_COLORS[room.theme] }}
                            >
                              {ROOM_THEME_NAMES[room.theme]}
                            </div>
                            {room.is_adult && (
                              <div className="px-2 py-0.5 text-[10px] border border-foreground bg-red-900">
                                18+
                              </div>
                            )}
                            {room.is_locked && (
                              <div className="px-2 py-0.5 text-[10px] border border-foreground bg-yellow-900">
                                🔒
                              </div>
                            )}
                            {room.is_private && (
                              <div className="px-2 py-0.5 text-[10px] border border-foreground bg-purple-900">
                                Приватно
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {room.currentParticipants}/{room.maxParticipants} участников
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-2 border-foreground text-xs"
                          onClick={() => handleEditRoom(room)}
                        >
                          <Icon name="Pencil" size={14} className="mr-1" />
                          Редактировать
                        </Button>
                        <Button
                          size="sm"
                          className="border-2 border-foreground bg-red-900 hover:bg-red-800 text-xs"
                          onClick={() => setDeleteConfirmRoom(room)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по нику или ID"
                    className="border-2 border-foreground text-sm"
                  />
                  <Button
                    variant="outline"
                    className="border-2 border-foreground text-xs"
                  >
                    Открыть профиль
                  </Button>
                </div>
                <div className="text-center text-muted-foreground text-sm py-8">
                  Функционал в разработке
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dev" className="mt-4">
              <div className="text-center text-muted-foreground text-sm py-8">
                Раздел в разработке
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingRoom && (
        <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
          <DialogContent className="bg-black border-4 border-foreground max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                Редактировать комнату
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold mb-2 block">НАЗВАНИЕ (1-20):</label>
                <Input
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  maxLength={20}
                  className="border-2 border-foreground text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-2 block">ТЕМА:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['general', 'topic', 'roleplay', 'gaming', 'cinema'] as RoomTheme[]).map(
                    (theme) => (
                      <button
                        key={theme}
                        onClick={() => setEditFormData({ ...editFormData, theme })}
                        className={`p-2 text-xs border-2 transition-all ${
                          editFormData.theme === theme
                            ? 'border-primary bg-primary/20'
                            : 'border-foreground bg-card hover:bg-muted'
                        }`}
                      >
                        {ROOM_THEME_NAMES[theme]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-2 block">ОПИСАНИЕ (0-60):</label>
                <Input
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  maxLength={60}
                  className="border-2 border-foreground text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-2 block">ЛИМИТ (2-20):</label>
                <Input
                  type="number"
                  value={editFormData.maxParticipants}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      maxParticipants: Math.max(2, Math.min(20, parseInt(e.target.value) || 2)),
                    })
                  }
                  min={2}
                  max={20}
                  className="border-2 border-foreground text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_adult}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_adult: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-xs">18+</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_private}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_private: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Приватно</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_locked}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_locked: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Замок</span>
                </label>
              </div>

              {editFormData.is_locked && (
                <div>
                  <label className="text-xs font-bold mb-2 block">ПАРОЛЬ (2-8):</label>
                  <Input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, password: e.target.value })
                    }
                    maxLength={8}
                    className="border-2 border-foreground text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
                  onClick={handleSaveRoom}
                  disabled={!editFormData.name.trim() || editFormData.name.length > 20}
                >
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-foreground text-xs"
                  onClick={() => setEditingRoom(null)}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {deleteConfirmRoom && (
        <Dialog open={!!deleteConfirmRoom} onOpenChange={() => setDeleteConfirmRoom(null)}>
          <DialogContent className="bg-black border-4 border-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                Удалить комнату?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm">
                Удалить комнату "{deleteConfirmRoom.name}"?
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-2 border-foreground text-xs"
                  onClick={() => setDeleteConfirmRoom(null)}
                >
                  Отмена
                </Button>
                <Button
                  className="flex-1 border-2 border-foreground bg-red-900 hover:bg-red-800 text-xs"
                  onClick={handleConfirmDelete}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};