import { useState } from 'react';
import Icon from '@/components/ui/icon';
import type { RoomTheme, RoomBadge } from './types';
import { ROOM_THEME_NAMES } from './types';

interface CreateRoomModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    theme: RoomTheme;
    description: string;
    capacity: number;
    is_adult: boolean;
    is_locked: boolean;
    is_private: boolean;
    password: string;
  }) => void;
}

export const CreateRoomModal = ({ show, onClose, onCreate }: CreateRoomModalProps) => {
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<RoomTheme>('general');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(5);
  const [is_adult, setIsAdult] = useState(false);
  const [is_locked, setIsLocked] = useState(false);
  const [is_private, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  if (!show) return null;

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.length > 20) {
      setNameError('Максимум 20 символов');
    } else if (value.length === 0) {
      setNameError('Название обязательно');
    } else {
      setNameError('');
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (value.length > 60) {
      setDescriptionError('Максимум 60 символов');
    } else {
      setDescriptionError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (is_locked && (value.length < 2 || value.length > 8)) {
      setPasswordError('Пароль: 2-8 символов');
    } else {
      setPasswordError('');
    }
  };

  const handleCreate = () => {
    if (!name.trim() || name.length > 20) {
      setNameError(name.length > 20 ? 'Максимум 20 символов' : 'Название обязательно');
      return;
    }
    if (description.length > 60) {
      setDescriptionError('Максимум 60 символов');
      return;
    }
    if (is_locked && (!password || password.length < 2 || password.length > 8)) {
      setPasswordError('Пароль: 2-8 символов');
      return;
    }

    onCreate({
      name,
      theme,
      description,
      capacity,
      is_adult,
      is_locked,
      is_private,
      password,
    });

    setName('');
    setTheme('general');
    setDescription('');
    setCapacity(5);
    setIsAdult(false);
    setIsLocked(false);
    setIsPrivate(false);
    setPassword('');
    setNameError('');
    setPasswordError('');
    setDescriptionError('');
  };

  const themes: RoomTheme[] = ['general', 'topic', 'roleplay', 'gaming', 'cinema'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Создать комнату</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <Icon name="X" size={24} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название комнаты *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={21}
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#555]"
              placeholder="1-20 символов"
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            <p className="text-gray-500 text-xs mt-1">{name.length}/20</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Тема комнаты</label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded border transition-colors ${
                    theme === t
                      ? 'bg-[#333] border-white text-white'
                      : 'bg-[#252525] border-[#333] text-gray-400 hover:border-[#555]'
                  }`}
                >
                  {ROOM_THEME_NAMES[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              maxLength={61}
              rows={3}
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#555] resize-none"
              placeholder="0-60 символов"
            />
            {descriptionError && <p className="text-red-500 text-xs mt-1">{descriptionError}</p>}
            <p className="text-gray-500 text-xs mt-1">{description.length}/60</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Количество участников
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => {
                const val = Math.max(2, Math.min(20, parseInt(e.target.value) || 2));
                setCapacity(val);
              }}
              min={2}
              max={20}
              className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#555]"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={is_adult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">18+ (Только для взрослых)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={is_locked}
                onChange={(e) => {
                  setIsLocked(e.target.checked);
                  if (!e.target.checked) {
                    setPassword('');
                    setPasswordError('');
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">🔒 Пароль</span>
            </label>

            {is_locked && (
              <div className="ml-6">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  maxLength={8}
                  className="w-full bg-[#252525] border border-[#333] rounded px-3 py-2 text-white focus:outline-none focus:border-[#555]"
                  placeholder="2-8 символов"
                />
                {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={is_private}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-300">Приватно (Скрыть от посторонних)</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#252525] border border-[#333] rounded text-white hover:bg-[#2a2a2a] transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleCreate}
              disabled={!!nameError || !!passwordError || !!descriptionError || !name.trim()}
              className="flex-1 px-4 py-2 bg-white text-black rounded font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
