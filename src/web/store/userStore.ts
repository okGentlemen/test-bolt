import { defineStore } from 'pinia';

interface UserState {
  token: string | null;
  isAuthenticated: boolean;
  phone: string | null;
  email: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    phone: localStorage.getItem('phone'),
    email: localStorage.getItem('email')
  }),
  
  actions: {
    setToken(token: string, identifier: string) {
      this.token = token;
      this.isAuthenticated = true;
      
      // Store identifier as both phone and email for flexibility
      this.phone = identifier;
      this.email = identifier;
      
      localStorage.setItem('token', token);
      localStorage.setItem('phone', identifier);
      localStorage.setItem('email', identifier);
    },
    
    logout() {
      this.token = null;
      this.phone = null;
      this.email = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('token');
      localStorage.removeItem('phone');
      localStorage.removeItem('email');
    }
  }
});