import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { STANDARD_AVATARS, BACKGROUND_COLORS } from './types';

type LoginViewProps = {
  username: string;
  setUsername: (value: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (value: string) => void;
  customAvatar: string;
  selectedBgColor: string;
  setSelectedBgColor: (value: string) => void;
  useCustomAvatar: boolean;
  setUseCustomAvatar: (value: boolean) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogin: () => void;
  setShowAuthModal: (value: boolean) => void;
};

export const LoginView = ({
  username,
  setUsername,
  selectedAvatar,
  setSelectedAvatar,
  customAvatar,
  selectedBgColor,
  setSelectedBgColor,
  useCustomAvatar,
  setUseCustomAvatar,
  handleFileUpload,
  handleLogin,
  setShowAuthModal,
}: LoginViewProps) => {
  return (
    <div className="max-w-xl mx-auto mt-2">
      <Card className="border-0 bg-black">
        <CardContent className="p-6 space-y-4">
          <div className="text-center p-4 flex items-center justify-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <img 
                src="https://cdn.poehali.dev/files/166d02d4-e599-4ec9-97b0-e59fda3ae85c.png" 
                alt="URBAN GROVE" 
                className="max-w-full h-auto"
                style={{ maxHeight: '120px' }}
              />
            </button>
          </div>

          <div>
            <p className="text-xs mb-3">ВЫБЕРИТЕ АВАТАР:</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {STANDARD_AVATARS.map((avatarUrl, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedAvatar(avatarUrl);
                    setUseCustomAvatar(false);
                  }}
                  className={`border-2 p-2 transition-colors ${
                    selectedAvatar === avatarUrl && !useCustomAvatar
                      ? 'border-primary bg-primary/20'
                      : 'border-foreground bg-card hover:bg-muted'
                  }`}
                >
                  <img src={avatarUrl} alt={`avatar-${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs mb-3">ИЛИ ЗАГРУЗИТЕ СВОЮ:</p>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="flex-1 border-2 border-foreground bg-card hover:bg-muted p-3 text-xs cursor-pointer text-center transition-colors"
              >
                {useCustomAvatar && customAvatar ? 'ЗАГРУЖЕНО ✓' : 'ВЫБРАТЬ ФАЙЛ'}
              </label>
              {useCustomAvatar && customAvatar && (
                <div className="border-2 border-foreground w-16 h-16 flex items-center justify-center bg-card">
                  <img src={customAvatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs mb-3">НИКНЕЙМ:</p>
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ВВЕДИТЕ ИМЯ"
                className="border-2 border-foreground text-xs flex-1"
                maxLength={20}
              />
              <div className="relative">
                <select
                  value={selectedBgColor}
                  onChange={(e) => setSelectedBgColor(e.target.value)}
                  className="border-2 border-foreground bg-card text-foreground p-2 text-xs appearance-none cursor-pointer h-full"
                  style={{ width: '120px' }}
                >
                  <option value="">ЦВЕТ</option>
                  {BACKGROUND_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!username.trim()}
            className="w-full border-2 border-foreground bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            ВОЙТИ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
