import axios from 'axios';

const API_URL = `http://localhost:${import.meta.env.VITE_PORT}/api`;

interface LoginCredentials {
  username: string;
  password: string;
}

interface PhoneLoginData {
  phone: string;
  code: string;
  password?: string;
}

interface ResetPasswordData {
  phone: string;
  code: string;
  newPassword: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) => 
    axios.post(`${API_URL}/users/login`, credentials),
  
  phoneLogin: (data: PhoneLoginData) =>
    axios.post(`${API_URL}/users/phone-login`, data),
  
  sendVerificationCode: (phone: string) =>
    axios.post(`${API_URL}/users/send-code`, { phone }),
  
  resetPassword: (data: ResetPasswordData) =>
    axios.post(`${API_URL}/users/reset-password`, data),

  checkUserExists: (phone: string) =>
    axios.get(`${API_URL}/users/check-exists`, { params: { phone } })
};

export const chatApi = {
  createConversation: () =>
    axios.post(`${API_URL}/chat/conversations`),

  getConversations: () =>
    axios.get(`${API_URL}/chat/conversations`),

  getMessages: (conversationId: number) =>
    axios.get(`${API_URL}/chat/conversations/${conversationId}/messages`),

  streamChat: (message: string, conversationId: number) => {
    const controller = new AbortController();
    
    const stream = fetch(`${API_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message, conversationId }),
      signal: controller.signal
    });

    return { stream, controller };
  }
};