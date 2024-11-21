<template>
  <div class="home-page">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <img :src="LogoPng" alt="Logo" />
        <span>浙江大学</span>
      </div>
      <div class="auth-buttons" v-if="!userStore.isAuthenticated">
        <n-button class="login-btn" @click="showLoginDialog = true">登录/注册</n-button>
      </div>
      <div class="user-info" v-else>
        <n-dropdown :options="userMenuOptions" @select="handleUserMenuSelect">
          <n-button>{{ userEmail }}</n-button>
        </n-dropdown>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <h1>基于海量文献，提供准确可追溯的学术答案</h1>
      <p class="subtitle">全面覆盖各学科文献，多维度对话理解，为您提供精准的学术解答，满足您的科研需求。</p>
      <div class="hero-actions">
        <n-button v-if="userStore.isAuthenticated" type="primary" size="large" @click="startChat">
          开始对话
        </n-button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2>全方位对比，学问AI的独特优势</h2>
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Academic Tools Section -->
    <section class="academic-tools">
      <h2>适意多样学术场景，精准匹配定制化解答</h2>
      <div class="tools-grid">
        <div class="tool-card" v-for="tool in academicTools" :key="tool.title">
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.description }}</p>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits">
      <h2>高效阅读利器：多形式双屏阅读</h2>
      <div class="benefits-content">
        <div class="benefits-text">
          <ul>
            <li>智能文献摘要生成和归纳</li>
            <li>双目阅读提高文献效率，支持翻译、标注、查看原文</li>
            <li>深度理解文章重要观点和关键内容说明，实现无障碍阅读</li>
          </ul>
        </div>
        <div class="benefits-image">
          <img src="../../assets/reading-demo.png" alt="Reading Demo" />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>© 2023 浙江大学. All rights reserved.</p>
    </footer>

    <!-- Auth Dialogs -->
    <login-dialog 
      :show="showLoginDialog"
      @update:show="showLoginDialog = $event"
      @showForgotPassword="handleShowForgotPassword"
    />
    
    <forgot-password-dialog
      :show="showForgotPasswordDialog"
      @update:show="showForgotPasswordDialog = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/userStore';
import LoginDialog from '../../components/auth/LoginDialog.vue';
import ForgotPasswordDialog from '../../components/auth/ForgotPasswordDialog.vue';
import LogoPng from '@/assets/logo.png'

const router = useRouter();
const userStore = useUserStore();

const showLoginDialog = ref(false);
const showForgotPasswordDialog = ref(false);

const userEmail = computed(() => userStore.email || '用户');

const userMenuOptions = [
  {
    label: '退出登录',
    key: 'logout'
  }
];

const features = [
  {
    title: '多源文献',
    description: '覆盖各大数据库文献资源'
  },
  {
    title: '准确溯源',
    description: '所有回答均可追溯至原文献'
  },
  {
    title: '智能对话',
    description: '自然对话交互获取知识'
  }
];

const academicTools = [
  {
    title: '文献阅读',
    description: '智能摘要生成，快速把握文献重点'
  },
  {
    title: '学术写作',
    description: '规范引用格式，提供写作建议'
  },
  {
    title: '文献管理',
    description: '智能分类整理，高效文献管理'
  }
];

const handleUserMenuSelect = (key: string) => {
  if (key === 'logout') {
    userStore.logout();
    router.push('/');
  }
};

const handleShowForgotPassword = () => {
  showLoginDialog.value = false;
  showForgotPasswordDialog.value = true;
};

const startChat = () => {
  router.push('/chat/new');
};
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7ff 0%, #f0f2ff 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo img {
  height: 32px;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.features, .academic-tools, .benefits {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.features-grid, .tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card, .tool-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.benefits-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
  margin-top: 2rem;
}

.benefits-text ul {
  list-style: none;
  padding: 0;
}

.benefits-text li {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  position: relative;
}

.benefits-text li::before {
  content: "•";
  color: #4f46e5;
  position: absolute;
  left: 0;
}

.benefits-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.footer {
  text-align: center;
  padding: 2rem;
  background: white;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .benefits-content {
    grid-template-columns: 1fr;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
}
</style>