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
    <el-alert v-if="loadError" type="error" :closable="false" show-icon style="margin-top: 8px">{{
      loadError
    }}</el-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ElTree } from 'element-plus';
import { getPermissionTree } from '../services/role-service';

const props = defineProps({
  roleId: {
    type: [String, Number],
    default: '',
  },
  checkedKeys: {
    type: Array as () => (string | number)[],
    default: () => [],
  },
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
  disabled: 'disabled',
};

// 获取权限树数据（添加防抖，避免重复请求）
let fetchPromise: Promise<void> | null = null;

const fetchPermissionTree = async () => {
  // 如果已有正在进行的请求，等待它完成
  if (fetchPromise) {
    try {
      await fetchPromise;
      return;
    } catch {
      // 如果之前的请求失败，继续执行新的请求
    }
  }
  
  loadError.value = ''; // 清空之前的错误
  
  fetchPromise = (async () => {
    try {
      const data = await getPermissionTree();
      
      // 确保 data 是数组格式
      // 注意：响应拦截器可能返回数组，也可能返回包含 data 字段的对象
      // 参考 PermissionTree.vue 的处理方式：检查 res && res.data
      let permissionData: unknown[] = [];
      
      if (Array.isArray(data)) {
        // 直接是数组（响应拦截器已提取）
        permissionData = data;
      } else if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        // 优先检查 data 字段（与 PermissionTree.vue 保持一致）
        if ('data' in dataObj && Array.isArray(dataObj.data)) {
          permissionData = dataObj.data;
        } else if (Array.isArray(dataObj.tree)) {
          permissionData = dataObj.tree;
        } else if (Array.isArray(dataObj.permissions)) {
          permissionData = dataObj.permissions;
        } else if (Array.isArray(dataObj.list)) {
          permissionData = dataObj.list;
        } else {
          // 尝试查找任何数组类型的字段
          for (const key in dataObj) {
            if (Array.isArray(dataObj[key])) {
              permissionData = dataObj[key] as unknown[];
              break;
            }
          }
        }
      }
      
      if (!Array.isArray(permissionData) || permissionData.length === 0) {
        loadError.value = '权限树数据为空，请检查接口或网络';
        treeData.value = [];
        return;
      }
      
      // 递归为禁用节点加disabled:true
      function markDisabled(nodes: any[]) {
        if (!nodes) return;
        nodes.forEach(node => {
          node.disabled = node.status == 1 || node.status === '1';
          if (node.children && node.children.length) {
            markDisabled(node.children);
          }
        });
      }
      markDisabled(permissionData);
      
      // 过滤掉已删除（status==2）的节点
      function filterDeleted(nodes: any[]): any[] {
        if (!nodes) return [];
        return nodes
          .filter(node => {
            // 只过滤明确标记为已删除的节点（status === 2）
            const status = node.status;
            return status != 2 && status !== '2' && status !== 2;
          })
          .map(node => ({
            ...node,
            children: filterDeleted(node.children || []),
          }));
      }
      const filtered = filterDeleted(permissionData);
      treeData.value = filtered;
      treeKey.value++;
      expandedKeys.value = treeData.value.map(item => item.id);
    } catch (error: unknown) {
      treeData.value = [];
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      // 如果是取消错误，不显示错误提示（因为可能是重复请求导致的）
      if (errorMessage !== 'canceled' && !errorMessage.toLowerCase().includes('cancel')) {
        loadError.value = `获取权限树失败：${errorMessage}`;
      }
      throw error;
    } finally {
      fetchPromise = null;
    }
  })();
  
  return fetchPromise;
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
watch(
  () => props.checkedKeys,
  newVal => {
    if (treeRef.value && newVal) {
      setCheckedKeys(newVal);
    }
  },
  { deep: true }
);

// 暴露方法给父组件
defineExpose({
  treeRef,
  treeData,
  getCheckedKeys,
  getHalfCheckedKeys,
  setCheckedKeys,
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
