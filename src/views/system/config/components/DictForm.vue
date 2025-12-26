<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="字典名称" prop="dictName">
      <el-input v-model="form.dictName" placeholder="请输入字典名称" />
    </el-form-item>
    <el-form-item label="字典类型" prop="dictType">
      <el-input v-model="form.dictType" placeholder="请输入字典类型" :disabled="!!form.id" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-radio-group v-model="form.status">
        <el-radio label="0">正常</el-radio>
        <el-radio label="1">停用</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="备注" prop="remark">
      <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" :rows="3" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

interface DictType {
  id?: number | string;
  dictName: string;
  dictType: string;
  status: '0' | '1';
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'validate']);

const formRef = ref<FormInstance>();
const form = reactive<DictType>({
  id: '',
  dictName: '',
  dictType: '',
  status: '0',
  remark: '',
});

// 表单校验规则
const rules = reactive<FormRules>({
  dictName: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字和下划线', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  val => {
    if (val) {
      Object.assign(form, val);
    }
  },
  { deep: true, immediate: true }
);

// 监听表单变化
watch(
  form,
  val => {
    emit('update:modelValue', { ...val });
  },
  { deep: true }
);

// 表单验证
const validate = async () => {
  if (!formRef.value) return false;
  return formRef.value
    .validate()
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
  formRef,
});
</script>

<style scoped>
.el-form {
  max-width: 600px;
}
</style>
