<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="角色名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入角色名称" />
    </el-form-item>
    <el-form-item label="角色编码" prop="code">
      <el-input v-model="form.code" placeholder="请输入角色编码" :disabled="props.isEdit" />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input v-model="form.description" type="textarea" placeholder="请输入角色描述" />
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
    <el-form-item label="权限分配" prop="permissionIds">
      <PermissionAssignment
        ref="permissionAssignmentRef"
        v-model:checkedKeys="form.permissionIds"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import PermissionAssignment from './PermissionAssignment.vue';

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

// 表单数据
const form = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  status: 0,
  permissionIds: []
});

// 监听 props.modelValue 变化，更新表单数据
const updateForm = () => {
  if (props.modelValue) {
    const newData = { ...props.modelValue };
    
    // 如果有权限数据且有权限树数据，过滤出叶子权限
    if (newData.permissionIds && newData.permissionIds.length > 0) {
      // 延迟处理，确保权限树数据已加载
      setTimeout(() => {
        if (permissionAssignmentRef.value && permissionAssignmentRef.value.treeData) {
          const treeData = permissionAssignmentRef.value.treeData;
          const leafPermissions = getLeafPermissions(newData.permissionIds, treeData);
          // 过滤叶子权限，只显示用户选择的权限
          newData.permissionIds = leafPermissions;
        }
        Object.assign(form, newData);
      }, 100);
    } else {
      Object.assign(form, newData);
    }
  }
};

// 实时同步所有字段到父组件
watch(form, (val) => {
  emit('update:modelValue', { ...val });
}, { deep: true });

// 权限分配组件引用
const permissionAssignmentRef = ref();

// 自动包含父权限的函数
const getPermissionsWithParents = (selectedIds: (string | number)[], treeData: any[]) => {
  if (!selectedIds || selectedIds.length === 0 || !treeData || treeData.length === 0) {
    return selectedIds || [];
  }

  // 创建id到节点的映射和id到父节点的映射
  const nodeMap = new Map();
  const parentMap = new Map();
  
  const buildMaps = (nodes: any[], parent: any = null) => {
    nodes.forEach((node: any) => {
      nodeMap.set(node.id, node);
      if (parent) {
        parentMap.set(node.id, parent.id);
      }
      if (node.children && node.children.length) {
        buildMaps(node.children, node);
      }
    });
  };
  
  buildMaps(treeData);
  
  // 获取所有需要包含的权限ID（包括父权限）
  const requiredIds = new Set(selectedIds);
  
  // 对于每个选中的权限，添加其所有父权限
  selectedIds.forEach((id: string | number) => {
    let currentId = id;
    while (parentMap.has(currentId)) {
      const parentId = parentMap.get(currentId);
      requiredIds.add(parentId);
      currentId = parentId;
    }
  });
  
  return Array.from(requiredIds);
};

// 过滤出叶子权限（用户实际选择的权限，不包括因为层级关系自动添加的父权限）
const getLeafPermissions = (allPermissionIds: (string | number)[], treeData: any[]) => {
  if (!allPermissionIds || allPermissionIds.length === 0 || !treeData || treeData.length === 0) {
    return allPermissionIds || [];
  }

  // 创建id到节点的映射
  const nodeMap = new Map();
  
  const buildNodeMap = (nodes: any[]) => {
    nodes.forEach((node: any) => {
      nodeMap.set(node.id, node);
      if (node.children && node.children.length) {
        buildNodeMap(node.children);
      }
    });
  };
  
  buildNodeMap(treeData);
  
  // 找出叶子权限（没有子权限被选中的权限）
  const leafPermissions = allPermissionIds.filter(permissionId => {
    const node = nodeMap.get(permissionId);
    if (!node || !node.children || node.children.length === 0) {
      // 本身就是叶子节点
      return true;
    }
    
    // 检查是否有子权限被选中
    const hasSelectedChildren = node.children.some((child: any) => 
      allPermissionIds.includes(child.id)
    );
    
    // 如果有子权限被选中，则当前权限不是叶子权限（是因为子权限而自动添加的）
    return !hasSelectedChildren;
  });
  
  return leafPermissions;
};

// 保留原有权限id监听，只同步用户选择的权限到父组件
watch(() => form.permissionIds, (val) => {
  emit('update:modelValue', { ...form });
}, { deep: true });

// 获取包含父权限的完整权限列表的方法
const getPermissionIdsWithParents = () => {
  const selectedIds = form.permissionIds;
  if (!selectedIds || selectedIds.length === 0) {
    return selectedIds;
  }
  
  // 获取权限树数据
  if (permissionAssignmentRef.value && permissionAssignmentRef.value.treeData) {
    const treeData = permissionAssignmentRef.value.treeData;
    return getPermissionsWithParents(selectedIds, treeData);
  }
  
  return selectedIds;
};

// 初始化表单
updateForm();

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
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
  updateForm,
  getPermissionIds: () => form.permissionIds,
  getPermissionIdsWithParents // 新增：获取包含父权限的完整权限列表
});
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 