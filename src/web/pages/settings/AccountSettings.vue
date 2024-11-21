<template>
  <div class="account-settings">
    <h2>账号设置</h2>
    
    <div class="settings-section">
      <div class="section-header">
        <h3>账号绑定</h3>
        <p class="section-desc">绑定手机和微信，账号更安全，操作更便捷</p>
      </div>

      <n-space vertical>
        <div class="binding-item">
          <div class="binding-info">
            <n-icon size="24" class="binding-icon">
              <Phone />
            </n-icon>
            <div class="binding-text">
              <div class="binding-title">手机号码</div>
              <div class="binding-status">{{ userStore.phone || '未绑定' }}</div>
            </div>
          </div>
          <n-button 
            type="primary" 
            ghost
            @click="showBindPhoneModal = true"
          >
            {{ userStore.phone ? '更换' : '绑定' }}
          </n-button>
        </div>

        <div class="binding-item">
          <div class="binding-info">
            <n-icon size="24" class="binding-icon">
              <LogoWechat />
            </n-icon>
            <div class="binding-text">
              <div class="binding-title">微信账号</div>
              <div class="binding-status">未绑定</div>
            </div>
          </div>
          <n-button type="primary" ghost>绑定</n-button>
        </div>
      </n-space>
    </div>

    <div class="settings-section">
      <div class="section-header">
        <h3>账号注销</h3>
        <p class="section-desc">注销后，账号将被永久删除</p>
      </div>

      <n-button type="error" ghost @click="showDeleteConfirm = true">
        注销账号
      </n-button>
    </div>

    <!-- Bind Phone Modal -->
    <n-modal
      v-model:show="showBindPhoneModal"
      preset="card"
      :style="{ width: '400px' }"
      title="绑定手机号"
    >
      <n-form
        ref="bindPhoneFormRef"
        :model="bindPhoneForm"
        :rules="bindPhoneRules"
      >
        <n-form-item label="手机号" path="phone">
          <n-input
            v-model:value="bindPhoneForm.phone"
            placeholder="请输入手机号"
            :maxlength="11"
          />
        </n-form-item>
        <n-form-item label="验证码" path="code">
          <div class="verification-code">
            <n-input
              v-model:value="bindPhoneForm.code"
              placeholder="请输入验证码"
              :maxlength="6"
            />
            <n-button 
              type="primary" 
              ghost 
              :disabled="!canSendCode"
              @click="sendCode"
            >
              {{ codeButtonText }}
            </n-button>
          </div>
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBindPhoneModal = false">取消</n-button>
          <n-button type="primary" @click="handleBindPhone">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Delete Account Confirm -->
    <n-modal
      v-model:show="showDeleteConfirm"
      preset="dialog"
      title="确认注销账号"
      content="账号注销后将无法恢复，请谨慎操作"
      positive-text="确认注销"
      negative-text="取消"
      @positive-click="handleDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { Phone } from '@vicons/carbon';
import { LogoWechat } from '@vicons/ionicons5';
import { useUserStore } from '../../store/userStore';
import { authApi } from '../../utils/api';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const showBindPhoneModal = ref(false);
const showDeleteConfirm = ref(false);
const countdown = ref(0);
const bindPhoneFormRef = ref<FormInst | null>(null);

const bindPhoneForm = ref({
  phone: '',
  code: ''
});

const bindPhoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
};

const canSendCode = computed(() => {
  return /^1[3-9]\d{9}$/.test(bindPhoneForm.value.phone) && countdown.value === 0;
});

const codeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s` : '获取验证码';
});

const sendCode = async () => {
  try {
    await authApi.sendVerificationCode(bindPhoneForm.value.phone);
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
      }
    }, 1000);
    message.success('验证码已发送');
  } catch (error: any) {
    message.error(error.response?.data?.message || '发送失败');
  }
};

const handleBindPhone = async () => {
  try {
    await bindPhoneFormRef.value?.validate();
    // API call to bind phone
    message.success('手机号绑定成功');
    showBindPhoneModal.value = false;
  } catch (error: any) {
    message.error(error.response?.data?.message || '绑定失败');
  }
};

const handleDeleteAccount = async () => {
  try {
    // API call to delete account
    await userStore.logout();
    message.success('账号已注销');
    router.push('/');
  } catch (error: any) {
    message.error(error.response?.data?.message || '注销失败');
  }
};
</script>

<style scoped>
.account-settings {
  max-width: 800px;
}

.settings-section {
  margin-top: 32px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.section-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.binding-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.binding-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.binding-icon {
  color: #666;
}

.binding-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.binding-title {
  font-weight: 500;
}

.binding-status {
  font-size: 14px;
  color: #666;
}

.verification-code {
  display: flex;
  gap: 12px;
}

:deep(.n-input) {
  width: 100%;
}
</style>