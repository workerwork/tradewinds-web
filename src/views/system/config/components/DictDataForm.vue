<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="字典标签" prop="dictLabel">
      <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
    </el-form-item>
    <el-form-item label="字典键值" prop="dictValue">
      <el-input v-model="form.dictValue" placeholder="请输入字典键值" />
    </el-form-item>
    <el-form-item label="排序" prop="dictSort">
      <el-input-number v-model="form.dictSort" :min="0" :max="999" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="form.status">
        <el-radio label="0">正常</el-radio>
        <el-radio label="1">停用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="form.remark"
        type="textarea"
        placeholder="请输入备注"
        :rows="3"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface DictData {
  id?: number | string;
  dictTypeId: number | string;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  status: '0' | '1';
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  dictTypeId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'validate']);

const formRef = ref<FormInstance>();
const form = reactive<DictData>({
  id: '',
  dictTypeId: props.dictTypeId,
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: '0',
  remark: ''
});

// 表单校验规则
const rules = reactive<FormRules>({
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '请输入字典键值', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  dictSort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
});

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  if (val) {
    Object.assign(form, val);
  }
}, { deep: true, immediate: true });

// 监听 dictTypeId 变化
watch(() => props.dictTypeId, (val) => {
  if (val) {
    form.dictTypeId = val;
  }
}, { immediate: true });

// 监听表单变化
watch(form, (val) => {
  emit('update:modelValue', { ...val });
}, { deep: true });

// 表单验证
const validate = async () => {
  if (!formRef.value) return false;
  return formRef.value.validate()
    .then(() => {
      emit('validate', true);
      return true;
    })
    .catch(() => {
      emit('validate', false);
      return false;
    });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 暴露方法给父组件
defineExpose({
  validate,
  resetForm,
  formRef
});
</script>

<style scoped>
.el-form {
  max-width: 600px;
}
</style> 