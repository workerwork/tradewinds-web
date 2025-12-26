<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    append-to-body
    @close="handleClose"
  >
    <slot ></slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  width?: string;
  closeOnClickModal?: boolean;
  destroyOnClose?: boolean;
  loading?: boolean;
  cancelText?: string;
  confirmText?: string;
  dialogType?: 'add' | 'edit';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  closeOnClickModal: false,
  destroyOnClose: true,
  loading: false,
  cancelText: '取消',
  confirmText: '确定',
});

const emit = defineEmits<Emits>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
});

const title = computed(() => {
  if (props.title) {
    return props.title;
  }
  return props.dialogType === 'add' ? '新增' : '编辑';
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  dialogVisible.value = false;
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

<style>
/* 确保对话框不会裁剪下拉菜单（tree-select、select 等） */
.el-dialog__body {
  overflow: visible !important;
}

.el-dialog {
  overflow: visible !important;
}
</style>
