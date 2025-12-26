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
            trigger-on-focus
            popper-class="autocomplete-role-name-popper"
            :fetch-suggestions="queryNameSuggestions"
            @select="handleFieldSearch"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-autocomplete
            v-model="searchForm.code"
            placeholder="请输入角色编码"
            clearable
            trigger-on-focus
            popper-class="autocomplete-role-code-popper"
            :fetch-suggestions="queryCodeSuggestions"
            @select="handleFieldSearch"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
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
              搜索找到 {{ total }} 条结果
            </el-tag>
          </div>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            size="small"
            background
            layout="total, sizes, prev, pager, next, jumper"
            popper-class="pagination-sizes-popper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <RoleForm
        ref="roleFormRef"
        :model-value="form"
        :is-edit="dialogType === 'edit'"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="close">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
      destroy-on-close
      append-to-body
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
import { 
  getRoleList, 
  createRole, 
  updateRole, 
  updateRoleStatus,
  assignRolePermissions,
  deleteRole
} from './services/role-service';
import { useMenuStore } from '@/stores/menu';
import { useTablePersist, useTableSearch, useSearchHistory, useDialog, useErrorHandler, useAutocomplete } from '@/composables'

const menuStore = useMenuStore();
const { handleApiError, handleSilentError } = useErrorHandler();

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

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const roleList = ref<Role[]>([])
// 完整的角色列表（用于 autocomplete 建议，不受搜索条件影响）
const allRolesForSuggestions = ref<Role[]>([])
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

// 搜索历史管理（用于记录搜索历史）
const { addSearchRecord } = useSearchHistory('role-search-history', 10);

// 使用统一的搜索过滤 composable
const { handleFieldSearch, resetSearch, handleStatusChange, handleShowDeletedChange, fetchList } = useTableSearch({
  searchForm,
  page,
  pageSize,
  searchFields: {
    name: 'name',
    code: 'code'
  },
  handleError: (error, message) => handleApiError(error, message, 'RoleManagement'),
  searchHistoryKey: 'role-search-history',
  extractSearchKeywords: (form) => [
    form.name,
    form.code
  ].filter(Boolean) as string[],
  debounceTime: 200,
  showDeleted: computed(() => searchForm.showDeleted),
  onFetch: async (params) => {
    loading.value = true;
    try {
      const { roles, total: totalCount } = await getRoleList(params);
      roleList.value = roles;
      total.value = totalCount;
      // 空值保护（但保留 id 字段，因为可能是数字 0）
      roleList.value = roleList.value.map(item => {
        const itemAny = item as Record<string, unknown>;
        Object.keys(itemAny).forEach(key => {
          // id 字段特殊处理：如果是 0 或有效的数字，保留原值，不处理 null/undefined（让类型系统处理）
          if (key === 'id') {
            // id 是 number 类型，0 是有效值，不应该被替换
            // 如果 id 是 null 或 undefined，保持原值，让类型系统处理
            // 不在这里转换为空字符串，因为 id 应该是 number 类型
          } else if (itemAny[key] == null) {
            itemAny[key] = '';
          }
        });
        // 兜底权限列表为数组，防止tooltipFormatter报错
        if (!Array.isArray(item.permissions)) item.permissions = [];
        return item;
      });
      
      // 记录搜索历史
      const searchKeywords = [
        searchForm.name,
        searchForm.code
      ].filter(Boolean);
      
      if (searchKeywords.length > 0) {
        const keyword = searchKeywords.join(' ');
        addSearchRecord(keyword, total.value);
      }
    } finally {
      loading.value = false;
    }
  }
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

// 使用服务端分页和搜索，不再需要本地过滤
// 直接使用 roleList，因为搜索和过滤已经在服务端完成
const filteredRoleList = computed(() => roleList.value);

// 使用统一的 autocomplete composable
const { createSuggestionQuery, fetchAllForSuggestions } = useAutocomplete<Role>({
  allItemsForSuggestions: allRolesForSuggestions,
  currentList: roleList,
  fetchAllItems: async () => {
    const params: Record<string, unknown> = {
      page: 1,
      pageSize: 500,
      showDeleted: false
    };
    const result = await getRoleList(params);
    const roles = result?.roles || [];
    return roles.map((item: unknown) => {
      const roleItem = item as Record<string, unknown>;
      return {
        id: roleItem.id,
        name: String(roleItem.name || ''),
        code: String(roleItem.code || ''),
      } as Role;
    });
  },
  maxSuggestions: 10
});

// 创建各个字段的建议查询函数
const queryNameSuggestions = createSuggestionQuery('name');
const queryCodeSuggestions = createSuggestionQuery('code');

// 获取完整角色列表用于 autocomplete 建议（使用 composable 提供的方法）
const fetchAllRolesForSuggestions = () => fetchAllForSuggestions();

// 获取角色列表（使用服务端分页和搜索）
// 注意：数据获取逻辑已移至 useTableSearch 的 onFetch 回调中
const fetchRoleList = () => {
  // 使用 useTableSearch 提供的 fetchList
  fetchList();
};

// 注意：handleFieldSearch、resetSearch、handleStatusChange、handleShowDeletedChange
// 已由 useTableSearch composable 提供，无需重复定义

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
  [key: string]: unknown;
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
  // 参考用户管理的实现：直接设置 form，不做复杂的 ID 验证
  // 如果 ID 真的无效，会在提交时验证
  Object.assign(form, {
    ...row,
    id: row.id, // 保持原始类型（string | number）
    permissionIds: [] // 先清空，后面会设置
  });
  
  // 先打开弹窗，提升用户体验
  openEdit(row);
  
  // 权限处理：先获取完整权限列表，然后过滤出叶子权限
  const allPermissionIds = Array.isArray(row.permissions) ? row.permissions.map(p => p.id as string | number) : [];
  
  // 异步获取权限树数据并过滤叶子权限（在弹窗打开后执行，不阻塞弹窗显示）
  try {
    const { getPermissionTree } = await import('./services/role-service');
    const treeData = await getPermissionTree() as PermissionTreeNode[];
    const leafPermissions = getLeafPermissions(allPermissionIds, treeData);
    
    // 过滤叶子权限，只显示用户选择的权限
    form.permissionIds = leafPermissions;
  } catch (error: unknown) {
    handleSilentError(error, 'RoleManagement');
    form.permissionIds = allPermissionIds;
  }
};

// 验证角色ID是否有效
const isValidRoleId = (id: string | number | null | undefined): boolean => {
  if (id == null) return false;
  if (typeof id === 'number' && isNaN(id)) return false;
  if (typeof id === 'string' && id.trim() === '') return false;
  return true;
};

// 规范化权限ID数组：过滤无效值，支持UUID字符串或数字
const normalizePermissionIds = (ids: (string | number)[] | null | undefined): (string | number)[] => {
  if (!ids || !Array.isArray(ids)) return [];
  
  return ids
    .filter(id => {
      // 过滤掉 null、空字符串和 NaN
      if (id == null || id === '') return false;
      if (typeof id === 'number' && isNaN(id)) return false;
      return true;
    })
    .map(id => {
      // 如果是字符串且可以转换为有效数字，则转换；否则保持字符串（可能是UUID）
      if (typeof id === 'string') {
        const numId = Number(id);
        return isNaN(numId) ? id : numId;
      }
      return id; // 数字直接返回
    });
};

// 构建角色提交数据
const buildRoleData = (roleForm: typeof form, permissionIds: (string | number)[]) => {
  return {
    name: (roleForm.name || '').trim(),
    code: (roleForm.code || '').trim(),
    description: (roleForm.description || '').trim(),
    status: Number(roleForm.status) || 0,
    permissionIds: normalizePermissionIds(permissionIds)
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return;
  
  // 获取用户实际选择的权限ID（不包含自动添加的父权限）
  const selectedPermissionIds = Array.from(
    roleFormRef.value.getPermissionIds?.() || []
  ) as (string | number)[];
  
  // 获取包含父权限的完整权限ID列表（用于提交）
  const permissionIdsWithParents = roleFormRef.value.getPermissionIdsWithParents?.() || selectedPermissionIds;
  
  // 表单显示用户选择的权限
  if (roleFormRef.value.form) {
    roleFormRef.value.form.permissionIds = selectedPermissionIds;
  }
  
  const valid = await roleFormRef.value.validate();
  if (!valid) return;

  setSubmitting(true);
  try {
    const roleForm = roleFormRef.value.form;
    
    if (dialogType.value === 'add') {
      // 新增角色
      const roleData = buildRoleData(roleForm, permissionIdsWithParents);
      await createRole(roleData);
      ElMessage.success('添加成功');
    } else {
      // 编辑角色：校验ID
      const roleId = roleForm.id;
      if (!roleId || (typeof roleId === 'string' && roleId.trim() === '')) {
        ElMessage.error('角色ID无效，无法编辑');
        setSubmitting(false);
        return;
      }
      
      // 编辑时，id 已经在 URL 中，不需要在 body 中传递
      const roleData = buildRoleData(roleForm, permissionIdsWithParents);
      await updateRole(String(roleId), roleData);
      ElMessage.success('更新成功');
    }
    close();
    fetchRoleList();
    // 角色创建或更新后，延迟更新建议列表（不阻塞主流程）
    setTimeout(() => {
      fetchAllRolesForSuggestions();
    }, 100);
    
    // 角色信息变更后刷新菜单栏
    try {
      await menuStore.getUserMenus();
    } catch (error) {
      // 菜单刷新失败不影响主流程，静默处理
      handleSilentError(error, 'RoleManagement');
    }
  } catch (error: unknown) {
    handleApiError(error, '操作失败，请稍后重试', 'RoleManagement');
  } finally {
    setSubmitting(false);
  }
};

// 切换角色状态
const handleToggleStatus = async (row: Role) => {
  if (!isValidRoleId(row.id)) {
    ElMessage.error('角色ID无效，无法切换状态');
    return;
  }
  
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
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败，请稍后重试', 'RoleManagement');
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
    const treeData = await getPermissionTree() as PermissionTreeNode[];
    const leafPermissions = getLeafPermissions(allPermissionIds, treeData);
    
    // 过滤叶子权限，只显示用户选择的权限
    
    checkedPermissions.value = leafPermissions;
  } catch (error: unknown) {
    handleSilentError(error, 'RoleManagement');
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
      handleSilentError(error, 'RoleManagement');
    }
  } catch (error: unknown) {
    handleApiError(error, '权限分配失败，请稍后重试', 'RoleManagement');
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
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败', 'RoleManagement');
    }
  }
};

// 新增软删除和物理删除方法
const handleSoftDelete = (row: Role) => {
  if (!isValidRoleId(row.id)) {
    ElMessage.error('角色ID无效，无法删除');
    return;
  }
  
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
      handleApiError(error, '删除失败，请稍后重试', 'RoleManagement');
    }
  }).catch(() => {
    // 用户取消操作，静默处理
  });
};
const handlePhysicalDelete = (row: Role) => {
  if (!isValidRoleId(row.id)) {
    ElMessage.error('角色ID无效，无法删除');
    return;
  }
  
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
      handleApiError(error, '彻底删除失败，请稍后重试', 'RoleManagement');
    }
  }).catch(() => {
    // 用户取消操作，静默处理
  });
};

// 分页相关方法
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1; // 改变每页数量时重置到第一页
  fetchRoleList();
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage;
  fetchRoleList();
};

onMounted(async () => {
  // 先加载角色列表（不阻塞页面加载）
  await fetchRoleList();
  
  // 延迟加载建议列表，使用 requestIdleCallback 在空闲时加载
  // 优化：减少 timeout，让建议列表更快可用
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (callback: IdleRequestCallback, options?: { timeout?: number }) => number }).requestIdleCallback(() => {
      fetchAllRolesForSuggestions();
    }, { timeout: 500 }); // 从 2000ms 减少到 500ms
  } else {
    setTimeout(() => {
      fetchAllRolesForSuggestions();
    }, 300); // 从 500ms 减少到 300ms
  }
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

// ==================== 分页组件样式穿透 ====================
// 分页下拉框（参考状态选择器的样式设置方式）
:deep(.pagination-sizes-popper.el-popper.is-light) {
  min-width: 110px !important;
  width: 110px !important;
  max-width: 110px !important;
  text-align: center;
}

:deep(.pagination-sizes-popper .el-select-dropdown__item) {
  min-width: 110px !important;
  width: 110px !important;
  max-width: 110px !important;
  text-align: center !important;
  padding: 0 20px !important;
  justify-content: center !important;
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