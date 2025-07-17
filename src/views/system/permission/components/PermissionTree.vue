<template>
  <div class="permission-tree">
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="defaultProps"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedKeys"
      :default-expanded-keys="expandedKeys"
      @check="handleCheck"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>{{ node.label }}</span>
          <span class="permission-code">{{ data.code }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';
import { ElTree } from 'element-plus';
import { getPermissionTree } from '../services/permission-service';

const props = defineProps({
  checkedKeys: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:checkedKeys', 'change']);

// 树引用
const treeRef = ref<InstanceType<typeof ElTree>>();

// 树数据
const treeData = ref<any[]>([]);
const expandedKeys = ref<string[]>([]);

// 树配置
const defaultProps = {
  children: 'children',
  label: 'name'
};

// 获取权限树数据
const fetchPermissionTree = async () => {
  try {
    const res = await getPermissionTree();
    if (res && res.data) {
      treeData.value = res.data;
      // 默认展开第一级
      expandedKeys.value = treeData.value.map(item => item.id);
    }
  } catch (error) {
    console.error('获取权限树失败:', error);
  }
};

// 处理选中事件
const handleCheck = (data, { checkedKeys, checkedNodes, halfCheckedKeys, halfCheckedNodes }) => {
  emit('update:checkedKeys', checkedKeys);
  emit('change', {
    checkedKeys,
    checkedNodes,
    halfCheckedKeys,
    halfCheckedNodes
  });
};

// 获取当前选中的节点
const getCheckedKeys = () => {
  if (!treeRef.value) return [];
  return treeRef.value.getCheckedKeys();
};

// 获取半选中的节点
const getHalfCheckedKeys = () => {
  if (!treeRef.value) return [];
  return treeRef.value.getHalfCheckedKeys();
};

// 设置选中的节点
const setCheckedKeys = (keys: string[]) => {
  if (!treeRef.value) return;
  treeRef.value.setCheckedKeys(keys);
};

// 监听 checkedKeys 变化
watch(() => props.checkedKeys, (newVal) => {
  if (treeRef.value && newVal) {
    treeRef.value.setCheckedKeys(newVal);
  }
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  treeRef,
  getCheckedKeys,
  getHalfCheckedKeys,
  setCheckedKeys
});

onMounted(() => {
  fetchPermissionTree();
});
</script>

<style scoped>
.permission-tree {
  max-height: 400px;
  overflow-y: auto;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.permission-code {
  color: #909399;
  font-size: 12px;
}
</style> 