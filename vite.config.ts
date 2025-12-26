import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from 'path';
import { fileURLToPath, URL } from 'url';
import viteCompression from 'vite-plugin-compression';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { visualizer } from 'rollup-plugin-visualizer';

// 获取 __dirname 的 ES 模块兼容方式
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts',
      }),
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'element-plus',
        'pinia-plugin-persistedstate',
        'vue-i18n',
        'axios'
      ],
      // 排除不需要预构建的依赖
      exclude: [],
      // 强制预构建，提升开发体验
      force: false,
      // 优化 esbuild 选项
      esbuildOptions: {
        target: 'es2021',
      },
    },
    build: {
      // Tauri supports es2021
      target: ['es2021', 'chrome100', 'safari13'],
      // don't minify for debug builds
      minify: !env.TAURI_DEBUG ? 'esbuild' : false,
      // produce sourcemaps for debug builds
      sourcemap: !!env.TAURI_DEBUG,
      // Optimize chunk size
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          // 优化代码分割策略
          manualChunks: (id) => {
            // node_modules 中的依赖
            if (id.includes('node_modules')) {
              // Vue 核心库
              if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
                return 'vue-vendor';
              }
              // Element Plus
              if (id.includes('element-plus')) {
                return 'element-plus-vendor';
              }
              // 工具库
              if (id.includes('@vueuse/core')) {
                return 'utils-vendor';
              }
              // HTTP 客户端
              if (id.includes('axios')) {
                return 'axios';
              }
              // 国际化
              if (id.includes('vue-i18n')) {
                return 'i18n';
              }
              // 其他第三方库
              return 'vendor';
            }
          }
        }
      },
      // 设置块大小警告的限制
      chunkSizeWarningLimit: 1000,
      // CSS 代码分割
      cssCodeSplit: true,
      // 优化构建性能
      reportCompressedSize: true,
      // esbuild 压缩选项（仅在非调试模式下生效）
      esbuild: {
        // 生产环境移除 debugger，保留 console 便于调试
        // 如需移除 console，将下面的 [] 改为 ['console', 'debugger']
        drop: env.TAURI_DEBUG ? [] : ['debugger'],
      },
    },
    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
      cors: true,
      host: '0.0.0.0', // 允许外部访问
      hmr: {
        protocol: "ws",
        // 使用 localhost 而不是 0.0.0.0，避免浏览器 WebSocket 连接问题
        host: 'localhost',
        port: 1421,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          // 去掉 /api 前缀，因为后端没有这个路径
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    envPrefix: ['VITE_', 'TAURI_']
  };
});
