<template>
  <el-dialog v-model="dialogVisible" title="个人资料" width="500px">
    <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="80px">
      <div class="avatar-section">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
          :http-request="handleAvatarUpload"
        >
          <el-avatar :size="100" :src="profileForm.avatar" class="avatar-display">
            <el-icon v-if="!profileForm.avatar"><User /></el-icon>
          </el-avatar>
          <div class="avatar-text">点击上传头像</div>
        </el-upload>
      </div>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="profileForm.username" disabled />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="profileForm.realName" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="profileForm.email" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="profileForm.phone" />
      </el-form-item>
      <el-form-item label="角色">
        <el-tag
          v-for="role in userInfo?.roles"
          :key="String(role.id ?? role.name ?? '')"
          type="primary"
          class="role-tag"
        >
          {{ role.name }}
        </el-tag>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { User } from '@element-plus/icons-vue';
import { useProfileDialog, useTopbarUser } from '@/composables';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const {
  saving,
  profileFormRef,
  profileForm,
  profileRules,
  beforeAvatarUpload,
  handleAvatarUpload,
  saveProfile: saveProfileInternal,
  showProfile,
} = useProfileDialog();

const { userInfo } = useTopbarUser();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

// 当对话框打开时，加载用户信息
watch(
  () => props.modelValue,
  newValue => {
    if (newValue) {
      showProfile();
    }
  }
);

// 包装保存函数，关闭弹窗
const saveProfile = async () => {
  await saveProfileInternal();
  dialogVisible.value = false;
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-xl;
}

.avatar-uploader {
  text-align: center;
}

.avatar-display {
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  border-radius: 50%;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  overflow: hidden;
}

.avatar-display:hover {
  border-color: $color-primary;
  transform: scale(1.05);
}

.avatar-display .el-icon {
  font-size: 40px;
  color: $color-primary;
}

.avatar-display img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-text {
  margin-top: $spacing-sm;
  font-size: 12px;
  color: $text-color-secondary;
}

.role-tag {
  margin-right: $spacing-sm;
  margin-bottom: $spacing-xs;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button + .el-button {
  margin-left: $spacing-md;
}
</style>
