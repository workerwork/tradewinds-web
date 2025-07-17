<template>
  <div class="permission-assignment">
    <el-tree
      v-if="treeData.length"
      ref="treeRef"
      :key="treeKey"
      :data="treeData"
      :props="{ label: 'name', children: 'children', disabled: 'disabled' }"
      show-checkbox
      node-key="id"
      :default-checked-keys="checkedKeys"
      :default-expanded-keys="expandedKeys"
      @check="(data, { checkedKeys }) => $emit('update:checkedKeys', checkedKeys)"
    />
    <div v-else class="empty-permission-tree">暂无权限数据</div>
    <el-alert v-if="loadError" type="error" :closable="false" show-icon style="margin-top: 8px;">{{ loadError }}</el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue';
import { ElTree } from 'element-plus';
import { getPermissionTree } from '../services/role-service';

const props = defineProps({
  roleId: {
    type: [String, Number],
    default: ''
  },
  checkedKeys: {
    type: Array as () => (string | number)[],
    default: () => []
  }
});

const emit = defineEmits(['update:checkedKeys']);

// 树引用
const treeRef = ref<InstanceType<typeof ElTree>>();

// 树数据
const treeData = ref<any[]>([]);
const expandedKeys = ref<(string | number)[]>([]);
const loadError = ref('');
const treeKey = ref(0);

// 树配置
const defaultProps = {
  children: 'children',
  label: 'name',
  disabled: 'disabled'
};

// 获取权限树数据
const fetchPermissionTree = async () => {
  try {
    const data = await getPermissionTree();
    // 递归为禁用节点加disabled:true
    function markDisabled(nodes) {
      if (!nodes) return;
      nodes.forEach(node => {
        node.disabled = node.status == 1 || node.status === '1';
        if (node.children && node.children.length) {
          markDisabled(node.children);
        }
      });
    }
    markDisabled(data);
    // 过滤掉已删除（status==2）的节点
    function filterDeleted(nodes) {
      if (!nodes) return [];
      return nodes
        .filter(node => node.status != 2 && node.status !== '2')
        .map(node => ({
          ...node,
          children: filterDeleted(node.children)
        }));
    }
    const filtered = filterDeleted(data);
    treeData.value = filtered;
    treeKey.value++;
    expandedKeys.value = treeData.value.map(item => item.id);
  } catch (error) {
    treeData.value = [];
    loadError.value = '获取权限树失败，请检查接口或网络';
  }
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
const setCheckedKeys = (keys: (string | number)[]) => {
  if (!treeRef.value) return;
  treeRef.value.setCheckedKeys(keys);
};

// 监听 checkedKeys 变化
watch(() => props.checkedKeys, (newVal) => {
  if (treeRef.value && newVal) {
    setCheckedKeys(newVal);
  }
}, { deep: true });

// 暴露方法给父组件
defineExpose({
  treeRef,
  treeData,
  getCheckedKeys,
  getHalfCheckedKeys,
  setCheckedKeys
});

onMounted(() => {
  fetchPermissionTree();
});
</script>

<style scoped>
.permission-assignment {
  max-height: 400px;
  overflow-y: auto;
}
</style> 