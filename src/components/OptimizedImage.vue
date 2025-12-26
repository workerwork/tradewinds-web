<!-- 优化的图片组件 -->
<template>
  <div class="optimized-image" :style="containerStyle">
    <img
      v-lazy="src"
      :alt="alt"
      class="image"
      :class="{ 'image-loaded': isLoaded }"
      @load="handleImageLoad"
    />
    <div v-if="!isLoaded" class="image-placeholder" :style="placeholderStyle">
      <el-icon class="loading-icon"><Loading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { preloadImage, getImageDominantColor, logger } from '@/utils'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps<{
  src: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const isLoaded = ref(false)
const dominantColor = ref('rgb(200, 200, 200)')

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const placeholderStyle = computed(() => ({
  backgroundColor: dominantColor.value
}))

const handleImageLoad = () => {
  isLoaded.value = true
}

onMounted(async () => {
  try {
    // 预加载图片并获取主要颜色
    await preloadImage(props.src)
    dominantColor.value = await getImageDominantColor(props.src)
  } catch (error: unknown) {
    logger.error('Failed to process image', error, 'OptimizedImage')
  }
})
</script>

<style scoped>
.optimized-image {
  position: relative;
  overflow: hidden;
  background-color: transparent;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  will-change: opacity;
}

.image-loaded {
  opacity: 1;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  font-size: 24px;
  color: #fff;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 