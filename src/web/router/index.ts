import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';
import Home from '../pages/home/Home.vue';
import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';
import Settings from '../pages/settings/Settings.vue';
import AccountSettings from '../pages/settings/AccountSettings.vue';
import NewChat from '../pages/chat/NewChat.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: { requiresGuest: true }
    },
    {
      path: '/settings',
      component: Settings,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/settings/account'
        },
        {
          path: 'account',
          name: 'AccountSettings',
          component: AccountSettings
        }
      ]
    },
    {
      path: '/chat/new',
      name: 'NewChat',
      component: NewChat,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:id',
      name: 'Chat',
      component: NewChat,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;