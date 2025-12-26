<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="上级菜单">
      <el-tree-select
        v-model="form.parentId"
        :data="menuOptions"
        :props="{ label: 'name', value: 'id', children: 'children' }"
        placeholder="请选择上级菜单"
        check-strictly
        clearable
      />
    </el-form-item>
    <el-form-item label="菜单类型" prop="type">
      <el-radio-group v-model="form.type">
        <el-radio label="menu">菜单</el-radio>
        <el-radio label="button">按钮</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="菜单名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入菜单名称" />
    </el-form-item>
    <template v-if="form.type === 'menu'">
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.icon" placeholder="请输入图标名称">
          <template #prefix>
            <el-icon v-if="form.icon">
              <component :is="form.icon" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="路由路径" prop="path">
        <el-input v-model="form.path" placeholder="请输入路由路径" />
      </el-form-item>
      <el-form-item label="组件路径" prop="component">
        <el-input v-model="form.component" placeholder="请输入组件路径" />
      </el-form-item>
    </template>
    <el-form-item v-if="form.type === 'button'" label="权限标识" prop="permission">
      <el-input v-model="form.permission" placeholder="请输入权限标识" />
    </el-form-item>
    <el-form-item label="排序" prop="sort">
      <el-input-number v-model="form.sort" :min="0" :max="999" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="form.status"
        :active-value="1"
        :inactive-value="0"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { Menu } from '@/types';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  menuOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'validate']);

const formRef = ref<FormInstance>();
const form = reactive<Partial<Menu>>({
  id: '',
  parentId: '',
  name: '',
  type: 'menu',
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  status: 1,
});

// 表单校验规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  path: [
    {
      required: true,
      message: '请输入路由路径',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.type === 'menu' && !value) {
          callback(new Error('请输入路由路径'));
        } else {
          callback();
        }
      },
    },
  ],
  component: [
    {
      required: true,
      message: '请输入组件路径',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.type === 'menu' && !value) {
          callback(new Error('请输入组件路径'));
        } else {
          callback();
        }
      },
    },
  ],
  permission: [
    {
      required: true,
      message: '请输入权限标识',
      trigger: 'blur',
      validator: (rule, value, callback) => {
        if (form.type === 'button' && !value) {
          callback(new Error('请输入权限标识'));
        } else {
          callback();
        }
      },
    },
  ],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
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
