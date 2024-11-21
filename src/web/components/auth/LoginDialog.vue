<template>
  <n-modal 
    :show="show" 
    preset="card"
    :style="{ width: '400px', maxWidth: '90vw' }"
    :mask-closable="true"
    @close="handleClose"
    @mask-click="handleClose"
  >
    <div class="auth-dialog">
      <div class="tabs">
        <div 
          :class="['tab', { active: activeTab === 'phone' }]"
          @click="activeTab = 'phone'"
        >
          验证码登录
        </div>
        <div 
          :class="['tab', { active: activeTab === 'account' }]"
          @click="activeTab = 'account'"
        >
          账号登录
        </div>
      </div>

      <!-- Phone Login -->
      <div v-if="activeTab === 'phone'" class="form">
        <n-input
          v-model:value="phoneForm.phone"
          placeholder="输入手机号"
          :maxlength="11"
          @input="validatePhone"
        />
        <div class="error-text" v-if="phoneError">手机号格式不正确</div>
        
        <div class="verification-code">
          <n-input
            v-model:value="phoneForm.code"
            placeholder="请输入6位数字"
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

        <div v-if="isNewUser" class="password-setup">
          <n-input
            v-model:value="phoneForm.password"
            type="password"
            placeholder="设置登录密码：8位以上数字和字母"
            show-password-on="click"
          />
        </div>

        <n-button type="primary" block @click="handlePhoneLogin">
          {{ isNewUser ? '注册并登录' : '登录' }}
        </n-button>

        <div class="agreement">
          <n-checkbox v-model:checked="agreement">
            我已阅读并同意 <n-button text type="primary">《用户协议》</n-button> 和 
            <n-button text type="primary">《隐私政策》</n-button>
          </n-checkbox>
        </div>
      </div>

      <!-- Account Login -->
      <div v-if="activeTab === 'account'" class="form">
        <n-input
          v-model:value="accountForm.username"
          placeholder="输入账号"
        />
        
        <n-input
          v-model:value="accountForm.password"
          type="password"
          placeholder="输入密码：8位以上数字和字母"
          show-password-on="click"
        />

        <n-button type="primary" block @click="handleAccountLogin">
          登录
        </n-button>

        <div class="agreement">
          <n-checkbox v-model:checked="agreement">
            我已阅读并同意 <n-button text type="primary">《用户协议》</n-button> 和 
            <n-button text type="primary">《隐私政策》</n-button>
          </n-checkbox>
        </div>
      </div>

      <div class="footer">
        <n-button text type="primary" @click="$emit('showForgotPassword')">
          忘记密码？
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '../../store/userStore';
import { authApi } from '../../utils/api';

const props = defineProps<{
  show: boolean
}>();

const emit = defineEmits(['update:show', 'showForgotPassword']);

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const activeTab = ref('phone');
const agreement = ref(false);
const phoneError = ref(false);
const countdown = ref(0);
const isNewUser = ref(false);

const initialPhoneForm = {
  phone: '',
  code: '',
  password: ''
};

const initialAccountForm = {
  username: '',
  password: ''
};

const phoneForm = ref({ ...initialPhoneForm });
const accountForm = ref({ ...initialAccountForm });

const resetForms = () => {
  if (activeTab.value === 'phone') {
    phoneForm.value = { ...initialPhoneForm };
    phoneError.value = false;
    isNewUser.value = false;
  } else {
    accountForm.value = { ...initialAccountForm };
  }
  agreement.value = false;
};

const handleClose = () => {
  resetForms();
  emit('update:show', false);
};

const validatePhone = async (value: string) => {
  phoneError.value = !/^1[3-9]\d{9}$/.test(value);
  if (!phoneError.value && value.length === 11) {
    try {
      const response = await authApi.checkUserExists(value);
      isNewUser.value = !response.data.exists;
    } catch (error) {
      console.error('Check user exists error:', error);
    }
  }
};

const canSendCode = computed(() => {
  return !phoneError.value && phoneForm.value.phone && countdown.value === 0;
});

const codeButtonText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s后重新发送` : '发送验证码';
});

const sendCode = async () => {
  if (phoneError.value) {
    message.error('请输入正确的手机号');
    return;
  }

  try {
    await authApi.sendVerificationCode(phoneForm.value.phone);
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
      }
    }, 1000);
    message.success('验证码已发送');
  } catch (error: any) {
    message.error(error.response?.data?.message || '发送失败，请重试');
  }
};

const handlePhoneLogin = async () => {
  if (!agreement.value) {
    message.error('请同意用户协议和隐私政策');
    return;
  }

  if (phoneError.value) {
    message.error('请输入正确的手机号');
    return;
  }

  if (isNewUser.value && (!phoneForm.value.password || phoneForm.value.password.length < 8)) {
    message.error('请设置至少8位的登录密码');
    return;
  }

  try {
    const response = await authApi.phoneLogin(phoneForm.value);
    userStore.setToken(response.data.token, phoneForm.value.phone);
    message.success('登录成功');
    handleClose();
    router.push('/chat/new');
  } catch (error: any) {
    message.error(error.response?.data?.message || '登录失败');
  }
};

const handleAccountLogin = async () => {
  if (!agreement.value) {
    message.error('请同意用户协议和隐私政策');
    return;
  }

  try {
    const response = await authApi.login(accountForm.value);
    userStore.setToken(response.data.token, accountForm.value.username);
    message.success('登录成功');
    handleClose();
    router.push('/chat/new');
  } catch (error: any) {
    message.error(error.response?.data?.message || '登录失败');
  }
};
</script>

<style scoped>
.auth-dialog {
  width: 100%;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  color: #666;
  position: relative;
}

.tab.active {
  color: #4f46e5;
  font-weight: 500;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #4f46e5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.verification-code {
  display: flex;
  gap: 8px;
}

.error-text {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.agreement {
  margin-top: 8px;
  text-align: center;
}

.footer {
  margin-top: 16px;
  text-align: center;
}

:deep(.n-input) {
  width: 100%;
}

:deep(.n-button) {
  transition: all 0.3s ease;
}
</style>