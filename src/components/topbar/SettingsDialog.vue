<template>
  <el-dialog
    v-model="dialogVisible"
    title="系统设置"
    width="600px"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="界面设置" name="interface">
        <el-form label-width="120px">
          <el-form-item label="顶栏颜色">
            <el-color-picker 
              v-model="topbarColor" 
              @change="changeTopbarColor" 
              :predefine="predefineTopbarColors" 
            />
            <el-button size="small" style="margin-left: 12px;" @click="resetTopbarColor">
              还原
            </el-button>
          </el-form-item>
          <el-form-item label="侧边栏颜色">
            <el-color-picker 
              v-model="sidebarColor" 
              @change="changeSidebarColor" 
              :predefine="predefineSidebarColors" 
            />
            <el-button size="small" style="margin-left: 12px;" @click="resetSidebarColor">
              还原
            </el-button>
          </el-form-item>
          <el-form-item label="语言">
            <el-select v-model="settings.language" @change="onLanguageChange">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </el-form-item>
          <el-form-item label="侧边栏">
            <el-switch 
              v-model="settings.sidebarCollapsed"
              active-text="折叠"
              inactive-text="展开"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="通知设置" name="notification">
        <el-form label-width="120px">
          <el-form-item label="系统消息">
            <el-switch v-model="settings.systemNotification" />
          </el-form-item>
          <el-form-item label="邮件通知">
            <el-switch v-model="settings.emailNotification" />
          </el-form-item>
          <el-form-item label="声音提示">
            <el-switch v-model="settings.soundNotification" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings" :loading="savingSettings">
          保存设置
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useTopbarSettings } from '@/composables'

const props = defineProps<{
  modelValue: boolean
  isCollapse: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:isCollapse': [value: boolean]
}>()

const {
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
  onLanguageChange,
  saveSettings,
  showSettings
} = useTopbarSettings(props, emit)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 当对话框打开时，重新加载设置
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    showSettings()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button + .el-button {
  margin-left: $spacing-md;
}
</style>

