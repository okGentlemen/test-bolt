<template>
  <div class="settings-layout">
    <Sidebar :selected-key="currentSection" />
    <div class="settings-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '../../components/layout/Sidebar.vue';

const route = useRoute();
const currentSection = computed(() => route.params.section as string);
</script>

<style scoped>
.settings-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background: white;
}

.settings-content {
  flex: 1;
  padding: 24px;
}
</style>