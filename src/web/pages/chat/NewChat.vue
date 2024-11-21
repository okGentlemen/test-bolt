<template>
  <div class="chat-layout">
    <Sidebar ref="sidebarRef" />
    <div class="chat-content">
      <div class="chat-container" ref="chatContainer">
        <!-- System Message -->
        <div class="message system-message">
          <div class="avatar">
            <img src="../../assets/logo.png" alt="AI Assistant" />
          </div>
          <div class="message-content">
            <div class="message-text">
              基于海量文献，提供准确可追溯的学术答案。全面覆盖各学科文献，多维度对话理解，为您提供精准的学术解答，满足您的科研需求。
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <template v-for="message in messages" :key="message.id">
          <!-- User Message -->
          <div v-if="message.role === 'user'" class="message user-message">
            <div class="avatar">
              <n-avatar round>U</n-avatar>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
            </div>
          </div>

          <!-- AI Response -->
          <div v-else class="message ai-message">
            <div class="avatar">
              <img src="../../assets/logo.png" alt="AI Assistant" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
            </div>
          </div>
        </template>

        <!-- Loading Message -->
        <div v-if="isLoading" class="message ai-message">
          <div class="avatar">
            <img src="../../assets/logo.png" alt="AI Assistant" />
          </div>
          <div class="message-content">
            <div class="message-text">
              <n-spin size="small" />
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <div class="input-container">
          <n-input
            v-model:value="messageInput"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入您的问题..."
            :disabled="isLoading || !conversationId"
            @keydown.enter.prevent="handleSend"
          />
          <div class="input-actions">
            <n-button-group>
              <n-button quaternary>
                <template #icon>
                  <n-icon><Image /></n-icon>
                </template>
              </n-button>
              <n-button quaternary>
                <template #icon>
                  <n-icon><Document /></n-icon>
                </template>
              </n-button>
              <n-button quaternary>
                <template #icon>
                  <n-icon><Link /></n-icon>
                </template>
              </n-button>
            </n-button-group>
            <n-button 
              type="primary" 
              @click="handleSend"
              :loading="isLoading"
              :disabled="!messageInput.trim() || !conversationId"
            >
              发送
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Image, Document, Link } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import Sidebar from '../../components/layout/Sidebar.vue';
import { chatApi } from '../../utils/api';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  conversation_id: number;
  created_at: string;
}

const route = useRoute();
const message = useMessage();
const sidebarRef = ref();
const chatContainer = ref<HTMLElement | null>(null);
const messageInput = ref('');
const messages = ref<ChatMessage[]>([]);
const isLoading = ref(false);
const conversationId = ref<number | null>(null);
let currentController: AbortController | null = null;

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const formatMessage = (content: string) => {
  return content.replace(/\n/g, '<br>');
};

const loadMessages = async (id: number) => {
  try {
    const response = await chatApi.getMessages(id);
    messages.value = response.data;
    await scrollToBottom();
  } catch (error) {
    console.error('Load messages error:', error);
    message.error('加载消息记录失败');
  }
};

const createNewConversation = async () => {
  try {
    const response = await chatApi.createConversation();
    conversationId.value = response.data.id;
    await sidebarRef.value?.loadConversations();
  } catch (error) {
    console.error('Create conversation error:', error);
    message.error('创建对话失败');
  }
};

const handleSend = async () => {
  const input = messageInput.value.trim();
  if (!input || isLoading.value || !conversationId.value) return;

  // Add user message
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: input,
    conversation_id: conversationId.value,
    created_at: new Date().toISOString()
  });

  messageInput.value = '';
  isLoading.value = true;
  await scrollToBottom();

  try {
    const { stream, controller } = chatApi.streamChat(input, conversationId.value);
    currentController = controller;

    const response = await stream;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    let assistantMessage = '';
    const messageId = Date.now();
    messages.value.push({
      id: messageId,
      role: 'assistant',
      content: '',
      conversation_id: conversationId.value,
      created_at: new Date().toISOString()
    });

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(5);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            assistantMessage += parsed.content;
            
            // Update the last message
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage && lastMessage.id === messageId) {
              lastMessage.content = assistantMessage;
            }

            await scrollToBottom();
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }

    // Refresh conversation list
    await sidebarRef.value?.loadConversations();
  } catch (error: any) {
    if (error.name === 'AbortError') return;
    message.error('发送消息失败，请重试');
    console.error('Chat error:', error);
  } finally {
    isLoading.value = false;
    currentController = null;
  }
};

// Watch for route changes
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      const id = parseInt(newId as string);
      conversationId.value = id;
      messages.value = []; // Clear current messages
      await loadMessages(id);
    }
  }
);

onMounted(async () => {
  const id = parseInt(route.params.id as string);
  if (id) {
    conversationId.value = id;
    await loadMessages(id);
  } else {
    await createNewConversation();
  }
});
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  background: #f5f7ff;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  display: flex;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.avatar {
  flex-shrink: 0;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message-content {
  flex: 1;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background: #4f46e5;
  color: white;
}

.system-message .message-content {
  background: #f4f4f8;
  color: #666;
}

.input-area {
  padding: 24px;
  background: white;
  border-top: 1px solid #eee;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

:deep(.n-input) {
  background: #f5f7ff;
}

:deep(.n-input__textarea-el) {
  padding: 12px !important;
}

:deep(.n-button-group .n-button) {
  padding: 8px;
}
</style>