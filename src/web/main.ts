import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = `http://localhost:${import.meta.env.VITE_PORT}/api`;

// Add axios interceptor for auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(naive);

app.mount('#app');