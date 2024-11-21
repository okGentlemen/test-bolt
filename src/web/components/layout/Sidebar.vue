<template>
  <div class="sidebar">
    <!-- New Chat Button -->
    <div class="new-chat">
      <n-button block dashed @click="handleNewChat">
        <template #icon>
          <n-icon><Add /></n-icon>
        </template>
        新建对话
      </n-button>
    </div>

    <!-- Menu Sections -->
    <div class="menu-sections">
      <!-- Academic Conversations -->
      <div class="menu-section">
        <div class="section-header">
          <n-icon><ChatbubbleOutline /></n-icon>
          学术对话
          <span class="count">{{ conversations.length }}</span>
        </div>
        <div class="section-items">
          <div 
            v-for="conv in conversations" 
            :key="conv.id"
            :class="['menu-item', { active: currentConversationId === conv.id }]"
            @click="handleSelectConversation(conv.id)"
          >
            <div class="item-icon">
              <n-icon><Document /></n-icon>
            </div>
            <div class="item-text">{{ conv.first_message || '新对话' }}</div>
            <div class="item-actions">
              <n-button quaternary circle size="small">
                <template #icon><Star /></template>
              </n-button>
              <n-button quaternary circle size="small">
                <template #icon><Share /></template>
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Management -->
      <div class="menu-section">
        <div class="section-header">
          <n-icon><DocumentTextOutline /></n-icon>
          文献管理
          <span class="count">16</span>
        </div>
        <div class="section-items">
          <div class="menu-item">
            <div class="item-text">教育的发展</div>
            <div class="item-count">6</div>
          </div>
          <div class="menu-item">
            <div class="item-text">biology</div>
            <div class="item-count">5</div>
          </div>
          <div class="menu-item">
            <div class="item-text">学术论文</div>
            <div class="item-count">5</div>
          </div>
        </div>
      </div>

      <!-- My Library -->
      <div class="menu-section">
        <div class="section-header">
          <n-icon><LibraryOutline /></n-icon>
          我的素材库
          <span class="count">2</span>
        </div>
      </div>
    </div>

    <!-- User Info -->
    <div class="user-info">
      <n-dropdown :options="userMenuOptions" trigger="click" @select="handleSelect">
        <div class="user-profile">
          <span class="user-id">{{ userStore.phone || userStore.email }}</span>
          <n-button quaternary circle size="small">
            <template #icon><Settings /></template>
          </n-button>
        </div>
      </n-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../store/userStore';
import { chatApi } from '../../utils/api';
import { 
  Add,
  ChatbubbleOutline,
  DocumentTextOutline,
  LibraryOutline,
  Settings,
  Star,
  Share,
  Document
} from '@vicons/ionicons5';
import type { DropdownOption } from 'naive-ui';

const router = useRouter();
const userStore = useUserStore();

const conversations = ref<any[]>([]);
const currentConversationId = ref<number | null>(null);

const userMenuOptions: DropdownOption[] = [
  {
    label: '账号设置',
    key: 'settings',
  },
  {
    label: '退出登录',
    key: 'logout'
  }
];

const loadConversations = async () => {
  try {
    const response = await chatApi.getConversations();
    conversations.value = response.data;
  } catch (error) {
    console.error('Load conversations error:', error);
  }
};

const handleNewChat = async () => {
  try {
    const response = await chatApi.createConversation();
    await loadConversations();
    handleSelectConversation(response.data.id);
  } catch (error) {
    console.error('Create conversation error:', error);
  }
};

const handleSelectConversation = (id: number) => {
  currentConversationId.value = id;
  router.push(`/chat/${id}`);
};

const handleSelect = (key: string) => {
  if (key === 'settings') {
    router.push('/settings');
  } else if (key === 'logout') {
    userStore.logout();
    router.push('/');
  }
};

onMounted(() => {
  loadConversations();
});

defineExpose({
  loadConversations
});
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5ff;
  border-right: 1px solid #eee;
  padding: 16px;
}

.new-chat {
  margin-bottom: 20px;
}

.menu-sections {
  flex: 1;
  overflow-y: auto;
}

.menu-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  padding: 0 8px;
}

.count {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}

.section-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.menu-item.active {
  background: #e8e8ff;
}

.item-icon {
  margin-right: 8px;
  color: #666;
}

.item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-item:hover .item-actions {
  opacity: 1;
}

.item-count {
  color: #999;
  font-size: 12px;
}

.user-info {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.user-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  cursor: pointer;
}

.user-id {
  color: #666;
  font-size: 14px;
}

:deep(.n-dropdown-menu) {
  min-width: 100px !important;
}

:deep(.n-button) {
  --n-text-color: #666;
}
</style>