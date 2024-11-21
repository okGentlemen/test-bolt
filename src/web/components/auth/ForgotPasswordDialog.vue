<template>
  <n-modal 
    :show="show" 
    preset="card"
    :style="{ width: '400px', maxWidth: '90vw' }"
    :mask-closable="true"
    @close="handleClose"
    @mask-click="handleClose"
  >
    <div class="forgot-password-dialog">
      <div class="header">
        <div class="title">找回密码</div>
      </div>

      <div class="form">
        <n-input
          v-model:value="form.phone"
          placeholder="输入手机号"
          :maxlength="11"
          @input="validatePhone"
        />
        <div class="error-text" v-if="phoneError">手机号格式不正确</div>

        <div class="verification-code">
          <n-input
            v-model:value="form.code"
            placeholder="6位短信验证码"
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

        <n-input
          v-model:value="form.newPassword"
          type="password"
          placeholder="新密码，请输入8位以上数字和字母"
          show-password-on="click"
        />

        <n-button type="primary" block @click="handleSubmit">
          确定并登录
        </n-button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';

const props = defineProps<{
  show: boolean
}>();

const emit = defineEmits(['update:show']);

const message = useMessage();
const phoneError = ref(false);
const countdown = ref(0);

const initialForm = {
  phone: '',
  code: '',
  newPassword: ''
};

const form = ref({ ...initialForm });

const resetForm = () => {
  form.value = { ...initialForm };
  phoneError.value = false;
};

const handleClose = () => {
  resetForm();
  emit('update:show', false);
};

const validatePhone = (value: string) => {
  phoneError.value = !/^1[3-9]\d{9}$/.test(value);
};

const canSendCode = computed(() => {
  return !phoneError.value && form.value.phone && countdown.value === 0;
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
    // API call here
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
      }
    }, 1000);
    message.success('验证码已发送');
  } catch (error) {
    message.error('发送失败，请重试');
  }
};

const handleSubmit = async () => {
  try {
    // API call here
    message.success('密码重置成功');
    handleClose();
  } catch (error) {
    message.error('重置失败，请重试');
  }
};
</script>

<style scoped>
.forgot-password-dialog {
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.title {
  font-size: 18px;
  font-weight: 500;
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

:deep(.n-input) {
  width: 100%;
}

:deep(.n-button) {
  transition: all 0.3s ease;
}
</style>