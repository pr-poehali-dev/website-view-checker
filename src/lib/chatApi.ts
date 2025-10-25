const API_URL = 'https://functions.poehali.dev/4ad190ee-17bf-4a46-9890-19699a441cc9';

export const chatApi = {
  async getAccounts() {
    const response = await fetch(`${API_URL}?path=accounts`);
    const data = await response.json();
    return { accounts: data };
  },

  async getRooms() {
    const response = await fetch(`${API_URL}?path=rooms`);
    const data = await response.json();
    return { rooms: data };
  },

  async getMessages(roomId: string) {
    const response = await fetch(`${API_URL}?path=messages&roomId=${roomId}`);
    const data = await response.json();
    return { messages: data };
  },

  async getComplaints() {
    const response = await fetch(`${API_URL}?path=complaints`);
    const data = await response.json();
    return { complaints: data };
  },

  async auth(id: string, password: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'auth', id, password })
    });
    return response.json();
  },

  async createAccount(data: any) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_account', ...data })
    });
    return response.json();
  },

  async createRoom(data: any) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_room', ...data })
    });
    return response.json();
  },

  async joinRoom(roomId: string, accountId: string, username: string, avatar: string, bgColor: string, role?: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join_room', roomId, accountId, username, avatar, bgColor, role })
    });
    return response.json();
  },

  async leaveRoom(roomId: string, accountId: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave_room', roomId, accountId })
    });
    return response.json();
  },

  async sendMessage(data: any) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', ...data })
    });
    return response.json();
  },

  async banUser(roomId: string, userId: string, username: string, bannedBy: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ban_user', roomId, userId, username, bannedBy })
    });
    return response.json();
  },

  async unbanUser(roomId: string, userId: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unban_user', roomId, userId })
    });
    return response.json();
  },

  async muteUser(roomId: string, userId: string, username: string, mutedBy: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mute_user', roomId, userId, username, mutedBy })
    });
    return response.json();
  },

  async unmuteUser(roomId: string, userId: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unmute_user', roomId, userId })
    });
    return response.json();
  },

  async createComplaint(data: any) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_complaint', ...data })
    });
    return response.json();
  },

  async updateComplaint(id: string, status: string) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_complaint', id, status })
    });
    return response.json();
  },

  async updateRoom(data: any) {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_room', ...data })
    });
    return response.json();
  },

  async deleteRoom(id: string) {
    const response = await fetch(`${API_URL}?type=room&id=${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};