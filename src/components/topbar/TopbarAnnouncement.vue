<template>
  <div class="announcement-container">
    <el-icon class="announcement-icon"><Bell /></el-icon>
    <el-carousel
      class="announcement-carousel"
      height="32px"
      direction="vertical"
      :autoplay="true"
      :interval="3000"
      indicator-position="none"
    >
      <el-carousel-item v-for="(notice, index) in systemNotices" :key="index">
        <div class="notice-item">
          <el-tag size="small" :type="notice.type" class="notice-tag">
            {{ getNoticeText(notice).tag }}
          </el-tag>
          <span class="notice-text">{{ getNoticeText(notice).content }}</span>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { Bell } from '@element-plus/icons-vue';
import { useTopbarAnnouncement } from '@/composables';

const { systemNotices, getNoticeText } = useTopbarAnnouncement();
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.announcement-container {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  justify-self: center;
}

.announcement-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  transition: $transition-base;
  flex-shrink: 0;
}

.announcement-carousel {
  flex: 1;
  min-width: 0;
}

// Element Plus 轮播图样式穿透
.announcement-carousel :deep(.el-carousel__container) {
  height: 32px;
}

.announcement-carousel :deep(.el-carousel__item) {
  height: 32px;
  line-height: 32px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  height: 32px;
  transition: $transition-base;
}

.notice-tag {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 3px;
  flex-shrink: 0;
  transition: $transition-base;
}

.notice-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  transition: $transition-base;
}
</style>
