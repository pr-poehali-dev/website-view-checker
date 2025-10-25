import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  onSubmit: (target: string, description: string, images: string[]) => void;
}

export const ComplaintModal = ({
  isOpen,
  onClose,
  roomName,
  onSubmit,
}: ComplaintModalProps) => {
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    if (images.length + fileArray.length > 3) {
      alert('Максимум 3 изображения');
      return;
    }

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && images.length < 3) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!target.trim() || !description.trim()) {
      return;
    }

    onSubmit(target.trim(), description.trim(), images);
    
    setTarget('');
    setDescription('');
    setImages([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-4 border-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase">
            Жалоба на комнату
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-xs text-muted-foreground">
            Комната: <span className="text-primary">{roomName}</span>
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block">ЖАЛОБА НА (до 20 символов):</label>
            <Input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              maxLength={20}
              placeholder="Никнейм нарушителя"
              className="border-2 border-foreground text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block">ОПИСАНИЕ (до 150 символов):</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={150}
              placeholder="Опишите нарушение"
              className="border-2 border-foreground text-sm min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {description.length}/150
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-2 block">
              ИЗОБРАЖЕНИЯ (0-3):
            </label>
            {images.length < 3 && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="complaint-images"
                />
                <label htmlFor="complaint-images">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-2 border-foreground text-xs"
                    onClick={() => document.getElementById('complaint-images')?.click()}
                  >
                    <Icon name="Image" size={16} className="mr-2" />
                    Прикрепить изображения
                  </Button>
                </label>
              </>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative border-2 border-foreground">
                    <img
                      src={img}
                      alt={`preview-${idx}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-0 right-0 bg-red-600 border-2 border-foreground w-6 h-6 flex items-center justify-center hover:bg-red-700"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 border-2 border-foreground bg-primary hover:bg-primary/80 text-xs"
              onClick={handleSubmit}
              disabled={!target.trim() || !description.trim()}
            >
              Отправить
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-2 border-foreground text-xs"
              onClick={onClose}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
