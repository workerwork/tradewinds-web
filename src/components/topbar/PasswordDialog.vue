<template>
  <el-dialog
    v-model="dialogVisible"
    title="修改密码"
    width="400px"
  >
    <el-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      label-width="80px"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input 
          v-model="passwordForm.oldPassword" 
          type="password" 
          show-password
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input 
          v-model="passwordForm.newPassword" 
          type="password" 
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input 
          v-model="passwordForm.confirmPassword" 
          type="password" 
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword" :loading="changingPassword">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { usePasswordDialog } from '@/composables'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const {
  changingPassword,
  passwordFormRef,
  passwordForm,
  passwordRules,
  changePassword: changePasswordInternal,
  showPasswordDialog
} = usePasswordDialog()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 当对话框打开时，重置表单
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    showPasswordDialog()
  }
})

// 包装修改密码函数，关闭弹窗
const changePassword = async () => {
  await changePasswordInternal()
  dialogVisible.value = false
}
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

