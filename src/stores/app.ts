import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { ref } from 'vue';

const DEFAULT_TOPBAR_COLOR = '#111111';
const DEFAULT_SIDEBAR_COLOR = '#1f2937';

export const useAppStore = defineStore('app', {
    state: () => ({
        topbarColor: localStorage.getItem('topbar-color') || DEFAULT_TOPBAR_COLOR,
        sidebarColor: localStorage.getItem('sidebar-color') || DEFAULT_SIDEBAR_COLOR,
    }),
    actions: {
        setTopbarColor(color: string) {
            this.topbarColor = color;
            localStorage.setItem('topbar-color', color);
            document.documentElement.style.setProperty('--theme-topbar', color);
        },
        setSidebarColor(color: string) {
            this.sidebarColor = color;
            localStorage.setItem('sidebar-color', color);
            document.documentElement.style.setProperty('--theme-sidebar', color);
        },
        initThemeColors() {
            const topbar = localStorage.getItem('topbar-color') || DEFAULT_TOPBAR_COLOR;
            const sidebar = localStorage.getItem('sidebar-color') || DEFAULT_SIDEBAR_COLOR;
            document.documentElement.style.setProperty('--theme-topbar', topbar);
            document.documentElement.style.setProperty('--theme-sidebar', sidebar);
        },
        resetThemeColors() {
            this.setTopbarColor(DEFAULT_TOPBAR_COLOR);
            this.setSidebarColor(DEFAULT_SIDEBAR_COLOR);
        }
    }
}); 