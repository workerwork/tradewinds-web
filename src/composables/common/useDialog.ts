import { ref, Ref } from 'vue';

export type DialogType = 'add' | 'edit';

export interface UseDialogOptions {
    /**
     * 表单重置函数
     */
    resetForm?: () => void;
    /**
     * 打开弹窗前的回调
     */
    onBeforeOpen?: (type: DialogType, data?: any) => void;
    /**
     * 打开弹窗后的回调
     */
    onAfterOpen?: (type: DialogType, data?: any) => void;
    /**
     * 关闭弹窗前的回调
     */
    onBeforeClose?: () => void;
    /**
     * 关闭弹窗后的回调
     */
    onAfterClose?: () => void;
}

/**
 * 弹窗管理 Composable
 * 统一管理弹窗的显示状态和类型
 */
export function useDialog(options: UseDialogOptions = {}) {
    const dialogVisible = ref(false);
    const dialogType = ref<DialogType>('add');
    const submitting = ref(false);

    /**
     * 打开新增弹窗
     */
    const openAdd = (data?: any) => {
        dialogType.value = 'add';
        options.onBeforeOpen?.('add', data);
        if (options.resetForm) {
            options.resetForm();
        }
        dialogVisible.value = true;
        options.onAfterOpen?.('add', data);
    };

    /**
     * 打开编辑弹窗
     */
    const openEdit = (data: any) => {
        dialogType.value = 'edit';
        options.onBeforeOpen?.('edit', data);
        dialogVisible.value = true;
        options.onAfterOpen?.('edit', data);
    };

    /**
     * 关闭弹窗
     */
    const close = () => {
        options.onBeforeClose?.();
        dialogVisible.value = false;
        options.onAfterClose?.();
    };

    /**
     * 切换弹窗显示状态
     */
    const toggle = () => {
        if (dialogVisible.value) {
            close();
        } else {
            openAdd();
        }
    };

    /**
     * 设置提交状态
     */
    const setSubmitting = (value: boolean) => {
        submitting.value = value;
    };

    return {
        dialogVisible,
        dialogType,
        submitting,
        openAdd,
        openEdit,
        close,
        toggle,
        setSubmitting,
        // 计算属性
        isAdd: () => dialogType.value === 'add',
        isEdit: () => dialogType.value === 'edit'
    };
}

