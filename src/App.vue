<template>
  <el-config-provider :locale="elementLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const { locale } = useI18n()

// Element Plus 语言包
const elementLocale = computed(() => {
  return locale.value === 'zh-CN' ? zhCn : en
})
</script>

<style>
/* 基础样式 */
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

/* 确保登录页面容器样式正确 */
.login-container {
  min-height: 100%;
  width: 100%;
}
</style>