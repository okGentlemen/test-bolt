<template>
  <n-config-provider>
    <n-message-provider>
      <n-loading-bar-provider>
        <router-view></router-view>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
// App component setup
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>