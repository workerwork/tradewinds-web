<!-- 虚拟滚动列表组件 -->
<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    @scroll="onScroll"
  >
    <div
      class="virtual-list-phantom"
      :style="{ height: totalHeight + 'px' }"
    />
    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${startOffset}px)` }"
    >
      <div
        v-for="item in visibleData"
        :key="item.id"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useThrottleFn } from '@vueuse/core';

const props = defineProps<{
  data: any[];
  itemHeight: number;
  bufferSize?: number;
}>();

// 容器引用
const containerRef = ref<HTMLElement | null>(null);
// 可视区域起始索引
const start = ref(0);
// 可视区域结束索引
const end = ref(0);
// 容器高度
const containerHeight = ref(0);
// 滚动位置
const scrollTop = ref(0);

// 计算总高度
const totalHeight = computed(() => props.data.length * props.itemHeight);

// 计算可视区域数据
const visibleCount = computed(() => Math.ceil(containerHeight.value / props.itemHeight));

// 计算可视区域数据（包含缓冲区）
const visibleData = computed(() => {
  const buffer = props.bufferSize || 5;
  const startIndex = Math.max(0, start.value - buffer);
  const endIndex = Math.min(props.data.length, end.value + buffer);
  return props.data.slice(startIndex, endIndex);
});

// 计算偏移量
const startOffset = computed(() => {
  const buffer = props.bufferSize || 5;
  return Math.max(0, (start.value - buffer) * props.itemHeight);
});

// 更新可视区域范围
const updateRange = () => {
  if (!containerRef.value) return;

  const scrollTop = containerRef.value.scrollTop;
  start.value = Math.floor(scrollTop / props.itemHeight);
  end.value = Math.min(props.data.length, start.value + visibleCount.value);
};

// 节流处理的滚动事件
const onScroll = useThrottleFn(() => {
  if (!containerRef.value) return;
  scrollTop.value = containerRef.value.scrollTop;
  updateRange();
}, 16);

// 监听数据变化
watch(() => props.data, () => {
  updateRange();
}, { deep: true });

// 初始化
onMounted(() => {
  if (!containerRef.value) return;
  containerHeight.value = containerRef.value.clientHeight;
  updateRange();

  // 监听容器大小变化
  const observer = new ResizeObserver(() => {
    if (!containerRef.value) return;
    containerHeight.value = containerRef.value.clientHeight;
    updateRange();
  });

  observer.observe(containerRef.value);

  onUnmounted(() => {
    observer.disconnect();
  });
});
</script>

<style scoped>
.virtual-list-container {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
}

.virtual-list-item {
  width: 100%;
  box-sizing: border-box;
}
</style> 