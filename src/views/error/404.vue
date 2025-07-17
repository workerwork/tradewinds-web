<template>
  <div class="error-page">
    <div class="error-content">
      <el-result
        icon="warning"
        title="404"
        sub-title="抱歉，您访问的页面不存在"
      >
        <template #extra>
          <el-button type="primary" @click="router.push('/')">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.error-page {
  height: 100%;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.error-content {
  text-align: center;
}

:deep(.el-result__icon) {
  width: 120px;
  height: 120px;
}

:deep(.el-result__title) {
  font-size: 48px;
  margin-top: 20px;
}

:deep(.el-result__sub-title) {
  font-size: 20px;
  color: #666;
  margin-top: 10px;
}
</style> 