CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    avatar TEXT NOT NULL,
    bg_color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    theme VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    creator_id VARCHAR(50) NOT NULL,
    creator_username VARCHAR(100) NOT NULL,
    current_participants INTEGER DEFAULT 0,
    max_participants INTEGER DEFAULT 5,
    is_adult BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    password TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS badge VARCHAR(50) DEFAULT 'none';

CREATE TABLE IF NOT EXISTS room_participants (
    room_id VARCHAR(50) NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar TEXT NOT NULL,
    bg_color VARCHAR(7) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, account_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    username VARCHAR(100),
    avatar TEXT,
    bg_color VARCHAR(7),
    text TEXT NOT NULL,
    image TEXT,
    reply_to JSONB,
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banned_users (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    banned_by VARCHAR(100) NOT NULL,
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS muted_users (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    muted_by VARCHAR(100) NOT NULL,
    muted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    reporter_username VARCHAR(100) NOT NULL,
    target_username VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    images TEXT[],
    room_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'in_review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_banned_users_room_id ON banned_users(room_id);
CREATE INDEX IF NOT EXISTS idx_muted_users_room_id ON muted_users(room_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_expires_at ON complaints(expires_at);

INSERT INTO accounts (id, password, username, role, avatar, bg_color) VALUES
('usermelikhov', '2qu307syuo', 'ВЛАДЕЛЕЦ', 'owner', '👨‍🚀', '#FFD700'),
('ADM001', 'admin123', 'HeadAdmin', 'admin', '👨‍🚀', '#633946')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, name, theme, badge, creator_id, creator_username, current_participants, max_participants, is_adult, is_locked, is_private) VALUES
('1', 'тест', 'general', 'none', 'system', 'system', 0, 10, FALSE, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;