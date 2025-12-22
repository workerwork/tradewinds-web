<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="角色名称">
          <el-autocomplete
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
            popper-class="autocomplete-role-name-popper"
            :fetch-suggestions="queryNameSuggestions"
            @select="handleFieldSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-autocomplete
            v-model="searchForm.code"
            placeholder="请输入角色编码"
            clearable
            popper-class="autocomplete-role-code-popper"
            :fetch-suggestions="queryCodeSuggestions"
            @select="handleFieldSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;" popper-class="custom-select-popper" @change="handleStatusChange">
            <el-option label="启用" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <span style="margin-right: 8px;">显示已删除角色</span>
          <el-switch
            v-model="searchForm.showDeleted"
            @change="handleShowDeletedChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <div>
            <el-dropdown trigger="click" popper-class="column-setting-popper">
              <el-button type="primary" plain size="small" class="column-setting-btn">
                <el-icon><Setting /></el-icon>列设置
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="column-setting-menu">
                  <el-dropdown-item v-for="col in allColumns" :key="col.prop">
                    <el-checkbox v-model="col.visible">{{ col.label }}</el-checkbox>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增角色
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredRoleList" v-loading="loading" border stripe>
        <el-table-column v-if="getColVisible('selection')" type="selection" width="55" align="center" />
        <el-table-column v-if="getColVisible('name')" prop="name" label="角色名称" min-width="100" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('code')" prop="code" label="角色编码" min-width="100" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('description')" prop="description" label="描述" min-width="180" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column
          v-if="getColVisible('permissions')"
          prop="permissions"
          label="权限列表"
          min-width="200"
          show-overflow-tooltip
          :formatter="emptyFormatter"
        >
          <template #default="{ row }">
            <span v-if="Array.isArray(row.permissions) && row.permissions.length">
              {{ row.permissions.map(p => p.name || p).join(', ') }}
            </span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('status')" prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : row.status === 1 ? 'danger' : 'info'" size="small">
              {{ row.status === 0 ? '启用' : row.status === 1 ? '禁用' : '已删除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('createTime')" prop="createTime" label="创建时间" min-width="140" show-overflow-tooltip :formatter="emptyFormatter">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('updateTime')" prop="updateTime" label="更新时间" min-width="140" show-overflow-tooltip :formatter="emptyFormatter">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('operations')" label="操作" width="250" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                v-if="isUUID(row.id)"
                type="primary" 
                link 
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button 
                :type="row.status === 0 ? 'danger' : 'success'" 
                link 
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 0 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                v-if="row.status !== 2"
                type="danger"
                link
                @click="handleSoftDelete(row)"
              >
                删除
              </el-button>
              <el-button
                v-else
                type="danger"
                link
                @click="handlePhysicalDelete(row)"
              >
                彻底删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页和搜索统计 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <div class="search-stats" v-if="hasSearchCriteria">
            <el-tag type="info" size="small">
              搜索找到 {{ filteredRoleList.length }} 条结果
            </el-tag>
          </div>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="filteredRoleList.length"
            :page-sizes="[10, 20, 50, 100]"
            size="small"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 角色表单对话框 -->
    <FormDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
      :loading="submitting"
      @confirm="handleSubmit"
      @cancel="close"
    >
      <RoleForm
        ref="roleFormRef"
        :model-value="form"
        :is-edit="dialogType === 'edit'"
      />
    </FormDialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
      destroy-on-close
    >
      <PermissionAssignment
        ref="permissionAssignmentRef"
        :role-id="currentRoleId"
        :checked-keys="checkedPermissions"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export const emptyFormatter = (row, column, cellValue) => cellValue == null ? '' : cellValue;
</script>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Setting } from '@element-plus/icons-vue';
import type { Role } from '@/types';
import { formatDateTime } from '@/utils';
import { debounce } from 'lodash-es';
import RoleForm from './components/RoleForm.vue';
import PermissionAssignment from './components/PermissionAssignment.vue';
import FormDialog from '@/components/common/FormDialog.vue';
import { 
  getRoleList, 
  createRole, 
  updateRole, 
  updateRoleStatus,
  assignRolePermissions,
  deleteRole
} from './services/role-service';
import { useMenuStore } from '@/stores/menu';
import { useTablePersist, useSearchHistory, useDialog } from '@/composables'

// 自动完成建议项类型
interface AutocompleteSuggestion {
  value: string;
}

const menuStore = useMenuStore();

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: '',
  showDeleted: false
});

// 分页和列显示持久化
const defaultTableOptions = {
  page: 1,
  pageSize: 10,
  allColumns: [
    { prop: 'selection', label: '选择', visible: true },
    { prop: 'name', label: '角色名称', visible: true },
    { prop: 'code', label: '角色编码', visible: true },
    { prop: 'description', label: '描述', visible: true },
    { prop: 'permissions', label: '权限列表', visible: true },
    { prop: 'status', label: '状态', visible: true },
    { prop: 'createTime', label: '创建时间', visible: true },
    { prop: 'updateTime', label: '更新时间', visible: true },
    { prop: 'operations', label: '操作', visible: true }
  ]
}
const tableOptions = useTablePersist('system-role', defaultTableOptions)

// 搜索历史管理
const { addSearchRecord } = useSearchHistory('role-search-history', 10)

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const roleList = ref<Role[]>([])
const roleFormRef = ref()
const form = reactive({
  id: '' as string | number,
  name: '',
  code: '',
  description: '',
  status: 0,
  permissionIds: [] as (string | number)[]
})
const permissionDialogVisible = ref(false)
const permissionAssignmentRef = ref()
const currentRoleId = ref<string | number>('')
const checkedPermissions = ref<(string | number)[]>([])

// 使用 useDialog 管理弹窗状态
const resetForm = () => {
  form.id = '';
  form.name = '';
  form.code = '';
  form.description = '';
  form.status = 0;
  form.permissionIds = [];
};

const {
  dialogVisible,
  dialogType,
  submitting,
  openAdd,
  openEdit,
  close,
  setSubmitting
} = useDialog({
  resetForm
});

watch([page, pageSize, allColumns], () => {
  tableOptions.value.page = page.value
  tableOptions.value.pageSize = pageSize.value
  tableOptions.value.allColumns = allColumns.value
}, { deep: true })

const getColVisible = (prop: string) => allColumns.value.find(col => col.prop === prop)?.visible

// 判断是否有搜索条件
const hasSearchCriteria = computed(() => {
  return searchForm.name || searchForm.code || (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined)
})

// 实时过滤角色列表
const filteredRoleList = computed(() => {
  let filtered = roleList.value;
  
  // 角色名称过滤
  if (searchForm.name) {
    filtered = filtered.filter(role => 
      role.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  
  // 角色编码过滤
  if (searchForm.code) {
    filtered = filtered.filter(role => 
      role.code.toLowerCase().includes(searchForm.code.toLowerCase())
    );
  }
  
  // 状态过滤 - 由于状态过滤已经在后端处理，这里不需要再过滤
  // 但为了保持一致性，仍然保留前端的过滤逻辑作为兜底
  if (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined) {
    const statusNum = typeof searchForm.status === 'string' ? parseInt(searchForm.status) : searchForm.status;
    filtered = filtered.filter(role => role.status === statusNum);
  }
  
  return filtered;
});

// 联想建议函数
const queryNameSuggestions = (queryString: string, cb: (suggestions: AutocompleteSuggestion[]) => void) => {
  const suggestions = roleList.value
    .filter(role => role.name.toLowerCase().includes(queryString.toLowerCase()))
    .map(role => ({ value: role.name }))
    .slice(0, 10); // 限制建议数量
  cb(suggestions);
};

const queryCodeSuggestions = (queryString: string, cb: (suggestions: AutocompleteSuggestion[]) => void) => {
  const suggestions = roleList.value
    .filter(role => role.code.toLowerCase().includes(queryString.toLowerCase()))
    .map(role => ({ value: role.code }))
    .slice(0, 10);
  cb(suggestions);
};

// 获取角色列表
const fetchRoleList = debounce(async () => {
  try {
    loading.value = true;
    const params: Record<string, any> = {
      page: 1, // 获取所有数据用于本地过滤
      pageSize: 1000, // 获取大量数据
      showDeleted: !!searchForm.showDeleted
    };
    
    // 只有当状态有有效值时才传递状态参数
    if (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined) {
      params.status = searchForm.status;
    }
    
    const { roles, total: totalCount } = await getRoleList(params);
    roleList.value = roles;
    total.value = totalCount;
    // 空值保护
    roleList.value = roleList.value.map(item => {
      Object.keys(item).forEach(key => {
        if (item[key] == null) item[key] = '';
      });
      // 兜底权限列表为数组，防止tooltipFormatter报错
      if (!Array.isArray(item.permissions)) item.permissions = [];
      // id 不做 Number 转换，直接用原始值
      // item.id = item.id ?? '';
      return item;
    });
    
    // 记录搜索历史（使用当前搜索的字段作为关键词）
    const searchKeywords = [
      searchForm.name,
      searchForm.code
    ].filter(Boolean)
    
    if (searchKeywords.length > 0) {
      const keyword = searchKeywords.join(' ')
      addSearchRecord(keyword, filteredRoleList.value.length)
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '获取角色列表失败，请稍后重试');
    console.error('获取角色列表失败:', error);
  } finally {
    loading.value = false;
  }
}, 300);

// 字段搜索（带防抖）
const handleFieldSearch = debounce(() => {
  // 状态变化时需要重新请求数据，其他字段变化时只需要前端过滤
  // 这里暂时不重新请求，让用户手动刷新或通过其他方式触发
}, 300);

// 状态变化处理
const handleStatusChange = () => {
  // 状态变化时立即重新获取数据
  fetchRoleList();
};

// 显示已删除角色开关变化处理
const handleShowDeletedChange = () => {
  // 显示已删除角色开关变化时立即重新获取数据
  fetchRoleList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'showDeleted') return; // 不重置显示已删除角色开关
    searchForm[key] = '';
  });
  fetchRoleList();
};

// 新增角色
const handleAdd = () => {
  openAdd();
};

const isUUID = (id: string | number | undefined): id is string => {
  return typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
};

// 权限树节点类型
interface PermissionTreeNode {
  id: string | number;
  children?: PermissionTreeNode[];
  [key: string]: any;
}

// 过滤出叶子权限（用户实际选择的权限，不包括因为层级关系自动添加的父权限）
const getLeafPermissions = (allPermissionIds: (string | number)[], treeData: PermissionTreeNode[]): (string | number)[] => {
  if (!allPermissionIds || allPermissionIds.length === 0 || !treeData || treeData.length === 0) {
    return allPermissionIds || [];
  }

  // 创建id到节点的映射
  const nodeMap = new Map<string | number, PermissionTreeNode>();
  
  const buildNodeMap = (nodes: PermissionTreeNode[]) => {
    nodes.forEach((node) => {
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
    const hasSelectedChildren = node.children.some((child) => 
      allPermissionIds.includes(child.id)
    );
    
    // 如果有子权限被选中，则当前权限不是叶子权限（是因为子权限而自动添加的）
    return !hasSelectedChildren;
  });
  
  return leafPermissions;
};

// 编辑角色
const handleEdit = async (row: Role) => {
  if (!isUUID(row.id)) {
    ElMessage.error('角色ID无效，无法编辑');
    return;
  }
  
  // 基本信息
  form.id = row.id;
  form.name = row.name;
  form.code = row.code;
  form.description = row.description;
  form.status = row.status;
  
  // 权限处理：先获取完整权限列表，然后过滤出叶子权限
  const allPermissionIds = Array.isArray(row.permissions) ? row.permissions.map(p => p.id as string | number) : [];
  
  // 异步获取权限树数据并过滤叶子权限
  try {
    const { getPermissionTree } = await import('./services/role-service');
    const treeData = await getPermissionTree();
    const leafPermissions = getLeafPermissions(allPermissionIds, treeData);
    
    // 过滤叶子权限，只显示用户选择的权限
    form.permissionIds = leafPermissions;
  } catch (error) {
    console.error('获取权限树失败，使用完整权限列表:', error);
    form.permissionIds = allPermissionIds;
  }
  
  openEdit(row);
};

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return;
  
  // 获取用户实际选择的权限ID（不包含自动添加的父权限）
  let selectedPermissionIds = Array.from(roleFormRef.value.getPermissionIds ? roleFormRef.value.getPermissionIds() : []) as (string | number)[];
  
  // 获取包含父权限的完整权限ID列表（用于提交）
  let permissionIdsWithParents = selectedPermissionIds;
  if (roleFormRef.value.getPermissionIdsWithParents) {
    permissionIdsWithParents = roleFormRef.value.getPermissionIdsWithParents();
    // 提交时使用包含父权限的完整列表
  }
  
  if (roleFormRef.value.form) {
    roleFormRef.value.form.permissionIds = selectedPermissionIds; // 表单仍然显示用户选择的权限
  }
  const valid = await roleFormRef.value.validate();
  if (!valid) return;

  setSubmitting(true);
  try {
    let roleData = { ...roleFormRef.value.form };
    roleData.permissionIds = permissionIdsWithParents; // 提交时使用包含父权限的完整列表
    if (dialogType.value === 'add') {
      // 新增时不携带id
      delete roleData.id;
      // status 转 number，防止后端类型不符
      roleData.status = Number(roleData.status);
      const res = await createRole(roleData) as unknown as { id: string | number };
      ElMessage.success('添加成功');
    } else {
      // 编辑时校验 id
      if (!isUUID(roleData.id)) {
        ElMessage.error('角色ID无效，无法编辑');
        setSubmitting(false);
        return;
      }
      // status 转 number，防止后端类型不符
      roleData.status = Number(roleData.status);
      await updateRole(roleData.id, roleData);
      ElMessage.success('更新成功');
    }
    close();
    fetchRoleList();
    
    // 角色信息变更后刷新菜单栏
    try {
      await menuStore.getUserMenus();
    } catch (error) {
      // 菜单刷新失败不影响主流程，静默处理
      console.error('角色变更后菜单刷新失败:', error);
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败，请稍后重试');
    console.error('提交失败:', error);
  } finally {
    setSubmitting(false);
  }
};

// 切换角色状态
const handleToggleStatus = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      '确定要' + (row.status === 0 ? '禁用' : '启用') + '该角色吗？',
      '提示',
      {
        type: 'warning'
      }
    );
    await updateRoleStatus(String(row.id), row.status === 0 ? 1 : 0);
    ElMessage.success((row.status === 0 ? '禁用' : '启用') + '成功');
    fetchRoleList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '操作失败，请稍后重试');
      console.error('更新角色状态失败:', error);
    }
  }
};

// 打开权限分配对话框
const handlePermission = async (row: Role) => {
  currentRoleId.value = row.id;
  
  // 权限处理：只显示叶子权限
  const allPermissionIds = (row.permissions.map(p => p.id) as (string | number)[]);
  
  try {
    const { getPermissionTree } = await import('./services/role-service');
    const treeData = await getPermissionTree();
    const leafPermissions = getLeafPermissions(allPermissionIds, treeData);
    
    // 过滤叶子权限，只显示用户选择的权限
    
    checkedPermissions.value = leafPermissions;
  } catch (error) {
    console.error('获取权限树失败，使用完整权限列表:', error);
    checkedPermissions.value = allPermissionIds;
  }
  
  permissionDialogVisible.value = true;
};

// 提交权限分配
const handlePermissionSubmit = async () => {
  if (!permissionAssignmentRef.value || !currentRoleId.value) return;
  // 获取所有被选中的权限（父+子）
  const checkedKeys = permissionAssignmentRef.value.treeRef?.getCheckedKeys(false) || [];
  submitting.value = true;
  try {
    await assignRolePermissions(String(currentRoleId.value), checkedKeys as (string | number)[]);
    ElMessage.success('权限分配成功');
    permissionDialogVisible.value = false;
    fetchRoleList();
    // 角色权限变更后刷新菜单栏
    try {
      await menuStore.getUserMenus();
    } catch (error) {
      // 菜单刷新失败不影响主流程，静默处理
      console.error('角色权限变更后菜单刷新失败:', error);
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '权限分配失败，请稍后重试');
    console.error('权限分配失败:', error);
  } finally {
    submitting.value = false;
  }
};

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该角色吗？',
      '提示',
      {
        type: 'warning'
      }
    );
    await deleteRole(String(row.id)); // 物理删除
    ElMessage.success('删除成功');
    fetchRoleList();
  } catch (error) {
    ElMessage.error('删除失败');
    console.error('删除角色失败:', error);
  }
};

// 新增软删除和物理删除方法
const handleSoftDelete = (row: Role) => {
  ElMessageBox.confirm(
    '确定要删除该角色吗？（可在回收站彻底删除）',
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await updateRoleStatus(String(row.id), 2); // 软删除
      ElMessage.success('已移入回收站');
      fetchRoleList();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};
const handlePhysicalDelete = (row: Role) => {
  ElMessageBox.confirm(
    '此操作将彻底删除该角色，无法恢复，是否继续？',
    '警告',
    {
      confirmButtonText: '彻底删除',
      cancelButtonText: '取消',
      type: 'error',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await deleteRole(String(row.id)); // 物理删除
      ElMessage.success('已彻底删除');
      fetchRoleList();
    } catch (error) {
      ElMessage.error('彻底删除失败');
    }
  });
};

// 分页相关方法
const handleSizeChange = (newSize: number) => {
  page.value = 1;
  fetchRoleList();
};

const handleCurrentChange = (newPage: number) => {
  fetchRoleList();
};

onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
.role-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.pagination-right {
  display: flex;
  align-items: center;
}

.search-stats {
  display: flex;
  align-items: center;
}

// ==================== 表单样式穿透 ====================
:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

// ==================== 自定义选择器 Popper ====================
:deep(.custom-select-popper.el-popper.is-light) {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
  text-align: center;
}

:deep(.el-select .el-input__inner) {
  text-align: center;
}

// ==================== 自动完成下拉菜单 ====================
// 角色名称输入框下拉菜单（200px）
:deep(.autocomplete-role-name-popper.el-popper),
:deep(.autocomplete-role-name-popper.el-autocomplete-suggestion) {
  min-width: 200px !important;
  width: 200px !important;
  max-width: 200px !important;
}

// 角色编码输入框下拉菜单（200px）
:deep(.autocomplete-role-code-popper.el-popper),
:deep(.autocomplete-role-code-popper.el-autocomplete-suggestion) {
  min-width: 200px !important;
  width: 200px !important;
  max-width: 200px !important;
}

// ==================== 列设置下拉菜单 ====================
// Popper 容器样式
:deep(.column-setting-popper.el-popper) {
  min-width: 180px !important;
  width: auto !important;
  max-width: none !important;
  padding: 8px 0 !important;
  border-radius: $border-radius-md !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

// 下拉菜单样式
:deep(.column-setting-popper .el-dropdown-menu),
:deep(.column-setting-menu) {
  padding: 4px 0 !important;
  border-radius: $border-radius-md !important;
  min-width: 180px !important;
  width: auto !important;
}

// 菜单项样式
:deep(.column-setting-popper .el-dropdown-menu__item),
:deep(.column-setting-menu .el-dropdown-menu__item) {
  padding: 8px 16px !important;
  display: flex !important;
  align-items: center !important;
  transition: $transition-fast !important;
  min-height: 36px !important;
  
  &:hover {
    background: rgba(64, 158, 255, 0.08) !important;
  }
  
  // Checkbox 样式穿透
  :deep(.el-checkbox) {
    width: 100% !important;
    margin: 0 !important;
    
    .el-checkbox__label {
      padding-left: 8px !important;
      font-size: 14px !important;
      color: rgba(0, 0, 0, 0.85) !important;
      transition: $transition-fast !important;
    }
    
    &:hover .el-checkbox__label {
      color: #409EFF !important;
    }
  }
  
  :deep(.el-checkbox__input) {
    .el-checkbox__inner {
      transition: $transition-fast !important;
    }
  }
}

// ==================== 列设置按钮 ====================
.column-setting-btn {
  border-radius: $border-radius-sm !important;
  font-size: 14px !important;
  padding: 0 15px !important;
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  transition: $transition-base !important;
  margin-right: 10px !important;
  
  :deep(.el-icon) {
    margin-right: 4px !important;
    transition: $transition-base !important;
  }
  
  &:hover {
    :deep(.el-icon) {
      transform: rotate(90deg) !important;
    }
  }
}
</style> 