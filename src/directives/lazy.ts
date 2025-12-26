import type { DirectiveBinding } from 'vue';

// 共享的 IntersectionObserver 实例，提升性能
let sharedObserver: IntersectionObserver | null = null;

const getObserver = (): IntersectionObserver => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              sharedObserver?.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '100px', // 提前加载，提高用户体验
        threshold: 0.01,
      }
    );
  }
  return sharedObserver;
};

const lazyLoad = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding) {
    // 使用 data-src 存储原始 src，避免立即加载
    if (el.src !== binding.value) {
      el.dataset.src = binding.value;
      el.src = ''; // 清空 src，避免立即加载
    }

    const observer = getObserver();
    observer.observe(el);
  },
  updated(el: HTMLImageElement, binding: DirectiveBinding) {
    // 如果 src 改变，更新 data-src
    if (binding.value && el.dataset.src !== binding.value) {
      el.dataset.src = binding.value;
    }
  },
  unmounted(el: HTMLImageElement) {
    // 组件卸载时取消观察
    const observer = getObserver();
    observer.unobserve(el);
  },
};

export default lazyLoad;
