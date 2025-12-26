import { ref, onMounted, onUnmounted, computed } from 'vue';

/**
 * 响应式布局管理 Composable
 * 检测屏幕尺寸并管理移动端/桌面端布局
 * 使用 matchMedia API 优化性能，比 resize 事件更高效
 */
export function useResponsive() {
  // 安全获取窗口尺寸（支持 SSR）
  const getWindowWidth = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // 默认桌面端宽度
  };

  const getWindowHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight;
    }
    return 768;
  };

  const windowWidth = ref(getWindowWidth());
  const windowHeight = ref(getWindowHeight());

  // 断点定义（使用常量，避免重复创建对象）
  const breakpoints = {
    xs: 480, // 超小屏（手机）
    sm: 768, // 小屏（平板）
    md: 1024, // 中屏（小笔记本）
    lg: 1280, // 大屏（桌面）
    xl: 1920, // 超大屏
  } as const;

  // 判断是否为移动端（小于 768px）
  const isMobile = computed(() => windowWidth.value < breakpoints.sm);

  // 判断是否为平板（768px - 1024px）
  const isTablet = computed(
    () => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md
  );

  // 判断是否为桌面端（大于等于 1024px）
  const isDesktop = computed(() => windowWidth.value >= breakpoints.md);

  // 更新窗口尺寸
  const updateSize = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
    }
  };

  // 使用 matchMedia 监听断点变化（比 resize 事件更高效）
  let mediaQueries: MediaQueryList[] = [];
  let mediaQueryHandlers: ((e: MediaQueryListEvent | MediaQueryList) => void)[] = [];

  const setupMediaQueries = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // 为每个断点创建媒体查询
    const queries = [
      { name: 'mobile', query: `(max-width: ${breakpoints.sm - 1}px)` },
      { name: 'tablet', query: `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)` },
      { name: 'desktop', query: `(min-width: ${breakpoints.md}px)` },
    ];

    queries.forEach(({ query }) => {
      const mq = window.matchMedia(query);
      const handler = () => {
        // 当媒体查询变化时，更新窗口尺寸
        updateSize();
      };

      if (mq.addEventListener) {
        mq.addEventListener('change', handler);
      } else {
        // 兼容旧浏览器
        mq.addListener(handler);
      }

      mediaQueries.push(mq);
      mediaQueryHandlers.push(handler);
    });
  };

  // 节流函数 - 优化版本，使用时间戳（作为 fallback）
  const throttle = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastCallTime = 0;
    return function (this: any, ...args: any[]) {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall >= wait) {
        lastCallTime = now;
        func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastCallTime = Date.now();
          timeout = null;
          func.apply(this, args);
        }, wait - timeSinceLastCall);
      }
    };
  };

  // 节流处理窗口大小变化（作为 fallback，当 matchMedia 不可用时使用）
  const handleResize = throttle(updateSize, 150);

  onMounted(() => {
    if (typeof window !== 'undefined') {
      // 优先使用 matchMedia API
      if (window.matchMedia) {
        setupMediaQueries();
        updateSize(); // 初始化尺寸
      } else {
        // 降级到 resize 事件
        window.addEventListener('resize', handleResize);
        updateSize();
      }
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      // 清理 matchMedia 监听器
      mediaQueries.forEach((mq, index) => {
        const handler = mediaQueryHandlers[index];
        if (mq.removeEventListener && handler) {
          mq.removeEventListener('change', handler);
        } else if (mq.removeListener && handler) {
          mq.removeListener(handler);
        }
      });
      mediaQueries = [];
      mediaQueryHandlers = [];

      // 清理 resize 监听器（如果使用了）
      window.removeEventListener('resize', handleResize);
    }
  });

  return {
    windowWidth,
    windowHeight,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
}
