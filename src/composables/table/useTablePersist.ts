import { ref, watch } from 'vue'

export function useTablePersist<T extends object>(key: string, defaultValue: T) {
    const storageKey = `table-persist:${key}`
    const state = ref<T>(defaultValue)

    // 初始化时从 localStorage 读取
    const saved = localStorage.getItem(storageKey)
    if (saved) {
        try {
            state.value = { ...defaultValue, ...JSON.parse(saved) }
        } catch (e) {
            // ignore parse error
        }
    }

    // 监听变化自动保存
    watch(state, (val) => {
        localStorage.setItem(storageKey, JSON.stringify(val))
    }, { deep: true })

    return state
} 