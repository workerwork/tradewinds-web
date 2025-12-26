import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import { logger } from '@/utils'

/**
 * 顶栏设置管理 Composable
 * 管理系统设置（语言、侧边栏、通知等）
 */
export function useTopbarSettings(props: { isCollapse: boolean }, emit: (e: 'update:isCollapse', value: boolean) => void) {
    const { locale } = useI18n()
    const appStore = useAppStore()

    const currentLanguage = computed(() => locale.value)
    const activeTab = ref('interface')
    const savingSettings = ref(false)

    // 主题色相关
    const topbarColor = ref(appStore.topbarColor)
    const sidebarColor = ref(appStore.sidebarColor)
    const predefineTopbarColors = ['#409eff', '#667eea', '#764ba2', '#ff9800', '#13c2c2', '#f5222d']
    const predefineSidebarColors = ['#1f2937', '#2d3a4b', '#22313f', '#34495e', '#3a3f51', '#23272e']

    // 系统设置
    const settings = reactive({
        primaryColor: currentLanguage.value === 'zh-CN' ? '#409EFF' : '#667eea',
        language: currentLanguage.value,
        sidebarCollapsed: props.isCollapse,
        systemNotification: true,
        emailNotification: true,
        soundNotification: false
    })

    // 监听侧边栏状态变化，同步到设置
    watch(() => props.isCollapse, (newValue) => {
        settings.sidebarCollapsed = newValue
    })

    // 主题色变更
    const changeTopbarColor = (val: string) => {
        appStore.setTopbarColor(val)
        topbarColor.value = appStore.topbarColor
    }

    const changeSidebarColor = (val: string) => {
        appStore.setSidebarColor(val)
        sidebarColor.value = appStore.sidebarColor
    }

    const resetTopbarColor = () => {
        appStore.setTopbarColor('#111111')
        topbarColor.value = appStore.topbarColor
    }

    const resetSidebarColor = () => {
        appStore.setSidebarColor('#1f2937')
        sidebarColor.value = appStore.sidebarColor
    }

    const resetThemeColors = () => {
        appStore.resetThemeColors()
        topbarColor.value = appStore.topbarColor
        sidebarColor.value = appStore.sidebarColor
    }

    // 语言切换处理
    const onLanguageChange = (val: string) => {
        locale.value = val
        localStorage.setItem('language', val)
    }

    // 保存设置
    const saveSettings = async () => {
        try {
            savingSettings.value = true
            // 语言切换
            if (settings.language !== currentLanguage.value) {
                locale.value = settings.language
                localStorage.setItem('language', settings.language)
            }
            // 侧边栏折叠
            if (settings.sidebarCollapsed !== props.isCollapse) {
                emit('update:isCollapse', settings.sidebarCollapsed)
                localStorage.setItem('sidebarCollapsed', settings.sidebarCollapsed.toString())
            }
            // 保存通知设置到本地
            localStorage.setItem('systemNotification', String(settings.systemNotification))
            localStorage.setItem('emailNotification', String(settings.emailNotification))
            localStorage.setItem('soundNotification', String(settings.soundNotification))
            // TODO: 可在此调用后端API保存通知设置
            ElMessage.success('设置保存成功')
        } catch (error) {
            ElMessage.error('保存设置失败，请重试')
        } finally {
            savingSettings.value = false
        }
    }

    // 加载保存的设置
    const loadSavedSettings = () => {
        try {
            // 加载语言设置
            const savedLanguage = localStorage.getItem('language')
            if (savedLanguage) {
                settings.language = savedLanguage
            } else {
                settings.language = currentLanguage.value
            }

            // 加载侧边栏状态
            const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed')
            if (savedSidebarCollapsed !== null) {
                const isCollapsed = savedSidebarCollapsed === 'true'
                settings.sidebarCollapsed = isCollapsed
            } else {
                settings.sidebarCollapsed = props.isCollapse
            }

            // 加载通知设置（优先从单独的 localStorage 项读取）
            const systemNotification = localStorage.getItem('systemNotification')
            if (systemNotification !== null) {
                settings.systemNotification = systemNotification === 'true'
            }

            const emailNotification = localStorage.getItem('emailNotification')
            if (emailNotification !== null) {
                settings.emailNotification = emailNotification === 'true'
            }

            const soundNotification = localStorage.getItem('soundNotification')
            if (soundNotification !== null) {
                settings.soundNotification = soundNotification === 'true'
            }

            // 如果单独的项不存在，尝试从 appSettings JSON 中读取
            const savedSettings = localStorage.getItem('appSettings')
            if (savedSettings) {
                try {
                    const parsedSettings = JSON.parse(savedSettings)
                    if (parsedSettings.primaryColor) {
                        settings.primaryColor = parsedSettings.primaryColor
                    }
                    // 只有在单独的项不存在时才使用 JSON 中的值
                    if (systemNotification === null && parsedSettings.systemNotification !== undefined) {
                        settings.systemNotification = parsedSettings.systemNotification
                    }
                    if (emailNotification === null && parsedSettings.emailNotification !== undefined) {
                        settings.emailNotification = parsedSettings.emailNotification
                    }
                    if (soundNotification === null && parsedSettings.soundNotification !== undefined) {
                        settings.soundNotification = parsedSettings.soundNotification
                    }
                } catch (e) {
                    // JSON 解析失败，忽略
                }
            }
        } catch (error: unknown) {
            logger.warn('加载设置失败', error, 'TopbarSettings')
        }
    }

    onMounted(() => {
        loadSavedSettings()
        appStore.initThemeColors()
    })

    const showSettings = () => {
        // 重新加载保存的设置
        loadSavedSettings()
        // 同步主题色（从 store 中获取最新值）
        topbarColor.value = appStore.topbarColor
        sidebarColor.value = appStore.sidebarColor
    }

    return {
        currentLanguage,
        activeTab,
        savingSettings,
        topbarColor,
        sidebarColor,
        predefineTopbarColors,
        predefineSidebarColors,
        settings,
        changeTopbarColor,
        changeSidebarColor,
        resetTopbarColor,
        resetSidebarColor,
        resetThemeColors,
        onLanguageChange,
        saveSettings,
        showSettings
    }
}

