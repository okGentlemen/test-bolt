<template>
  <div class="auth-container">
    <n-card title="Register" class="auth-card">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
      >
        <n-form-item label="Email" path="email">
          <n-input v-model:value="formData.email" placeholder="Enter your email" />
        </n-form-item>
        <n-form-item label="Password" path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            placeholder="Enter your password"
          />
        </n-form-item>
        <n-form-item label="Confirm Password" path="confirmPassword">
          <n-input
            v-model:value="formData.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            @keyup.enter="handleRegister"
          />
        </n-form-item>
        <div class="form-actions">
          <n-button type="primary" block @click="handleRegister" :loading="loading">
            Register
          </n-button>
        </div>
      </n-form>
      <div class="auth-links">
        <router-link to="/login">Already have an account? Login</router-link>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useUserStore } from '../../store/userStore';
import { authApi } from '../../utils/api';
import type { FormInst } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);

const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
});

const rules = {
  email: [
    { required: true, message: 'Please input your email', trigger: 'blur' },
    { type: 'email', message: 'Please input valid email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input your password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        return value === formData.value.password;
      },
      message: 'Passwords do not match',
      trigger: 'blur'
    }
  ]
};

const handleRegister = async () => {
  try {
    loading.value = true;
    await formRef.value?.validate();
    const response = await authApi.register(formData.value);
    userStore.setToken(response.data.token);
    message.success('Registration successful');
    router.push('/chat/new');
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Registration failed');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Previous styles remain the same */
</style>