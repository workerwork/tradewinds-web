<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input 
        v-model="form.username" 
        placeholder="请输入用户名"
        :disabled="props.isEdit"
      />
    </el-form-item>
    <el-form-item label="姓名" prop="realName">
      <el-input v-model="form.realName" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="form.phone" placeholder="请输入手机号" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="角色" prop="roleIds">
      <el-checkbox-group v-model="form.roleIds">
        <el-checkbox
          v-for="role in roleStore.roles"
          :key="role.id"
          :value="String(role.id)"
          :disabled="role.status === 1"
        >
          {{ role.name }}<span v-if="role.status === 1" style="color: #aaa;">（已禁用）</span>
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="密码" prop="password" v-if="!props.isEdit">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        show-password
      />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="form.status"
        :active-value="0"
        :inactive-value="1"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useRoleStore } from '@/stores';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

// 表单引用
const formRef = ref<FormInstance>();
// 角色 store
const roleStore = useRoleStore();

// 表单数据
const form = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  roleIds: [] as string[],
  status: 0
});

// 监听 props.modelValue 变化，更新表单数据
const updateForm = () => {
  if (props.modelValue) {
    Object.assign(form, props.modelValue);
    if (props.isEdit && props.modelValue.roles) {
      form.roleIds = props.modelValue.roles.map(role => String(role.id));
    }
  }
  if (!roleStore.roles.length) {
    roleStore.fetchRoles();
  }
};

// 初始化表单
onMounted(() => {
  if (!roleStore.roles.length) {
    roleStore.fetchRoles();
  }
});
updateForm();

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!value) {
        callback(new Error('请输入邮箱'));
      } else if (!emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱地址'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: !props.isEdit, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
});

// 表单验证
const validate = async () => {
  if (!formRef.value) return false;
  return formRef.value.validate();
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

// 暴露方法给父组件
defineExpose({
  formRef,
  form,
  validate,
  resetForm,
  updateForm
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 