<template>
  <div class="role-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;" popper-class="custom-select-popper">
            <el-option label="启用" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <span style="margin-right: 8px;">显示已删除角色</span>
          <el-switch
            v-model="searchForm.showDeleted"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
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
              <el-button type="primary" plain size="small" class="column-setting-btn" style="margin-right: 10px;">
                <el-icon style="margin-right: 4px;"><Setting /></el-icon>列设置
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="col in allColumns" :key="col.prop" style="min-width: 160px;">
                    <el-checkbox v-model="col.visible" style="margin-right: 8px; vertical-align: middle;">{{ col.label }}</el-checkbox>
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

      <el-table :data="roleList || []" v-loading="loading" border stripe>
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

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          size="small"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <RoleForm
        ref="roleFormRef"
        :model-value="form"
        :is-edit="dialogType === 'edit'"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
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
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Refresh, Setting } from '@element-plus/icons-vue';
import type { Role } from '@/types';
import { formatDateTime } from '@/utils/format';
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
import { useTablePersist } from '@/composables/useTablePersist'

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

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const roleList = ref<Role[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
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

watch([page, pageSize, allColumns], () => {
  tableOptions.value.page = page.value
  tableOptions.value.pageSize = pageSize.value
  tableOptions.value.allColumns = allColumns.value
}, { deep: true })

const getColVisible = (prop: string) => allColumns.value.find(col => col.prop === prop)?.visible

// 获取角色列表
const fetchRoleList = debounce(async () => {
  try {
    loading.value = true;
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.code && { code: searchForm.code }),
      ...(searchForm.status !== '' && { status: Number(searchForm.status) }),
      showDeleted: !!searchForm.showDeleted
    };
    
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
  } catch (error) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  } finally {
    loading.value = false;
  }
}, 300);

// 搜索
const handleSearch = () => {
  page.value = 1;
  fetchRoleList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'showDeleted') return; // 不重置显示已删除角色开关
    searchForm[key] = '';
  });
  page.value = 1;
  pageSize.value = 10;
  fetchRoleList();
};

// 新增角色
const handleAdd = () => {
  dialogType.value = 'add';
  form.id = '';
  form.name = '';
  form.code = '';
  form.description = '';
  form.status = 0;
  form.permissionIds = []; // 新增时清空权限id
  dialogVisible.value = true;
};

const isUUID = (id: any) => typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

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

// 编辑角色
const handleEdit = async (row: Role) => {
  dialogType.value = 'edit';
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
    
    console.log('handleEdit - 后端返回的完整权限:', allPermissionIds);
    console.log('handleEdit - 过滤后的叶子权限:', leafPermissions);
    
    form.permissionIds = leafPermissions;
  } catch (error) {
    console.error('获取权限树失败，使用完整权限列表:', error);
    form.permissionIds = allPermissionIds;
  }
  
  dialogVisible.value = true;
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
    console.log('角色表单提交 - 用户选择的权限:', selectedPermissionIds);
    console.log('角色表单提交 - 包含父权限的完整列表:', permissionIdsWithParents);
  }
  
  if (roleFormRef.value.form) {
    roleFormRef.value.form.permissionIds = selectedPermissionIds; // 表单仍然显示用户选择的权限
  }
  const valid = await roleFormRef.value.validate();
  if (valid) {
    submitting.value = true;
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
          submitting.value = false;
          return;
        }
        // status 转 number，防止后端类型不符
        roleData.status = Number(roleData.status);
        await updateRole(roleData.id, roleData);
        ElMessage.success('编辑成功');
      }
      dialogVisible.value = false;
      fetchRoleList();
      
      // 角色信息变更后刷新菜单栏
      try {
        await menuStore.getUserMenus();
        console.log('角色变更后菜单刷新成功');
      } catch (error) {
        console.error('角色变更后菜单刷新失败:', error);
      }
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      submitting.value = false;
    }
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
  } catch (error) {
    console.error('更新角色状态失败:', error);
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
    
    console.log('handlePermission - 后端返回的完整权限:', allPermissionIds);
    console.log('handlePermission - 过滤后的叶子权限:', leafPermissions);
    
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
      console.log('角色权限变更后菜单刷新成功');
    } catch (error) {
      console.error('角色权限变更后菜单刷新失败:', error);
    }
  } catch (error) {
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

// 分页大小改变
const handleSizeChange = (newSize: number) => {
  page.value = 1;
  fetchRoleList();
};

// 当前页改变
const handleCurrentChange = (newPage: number) => {
  fetchRoleList();
};

onMounted(() => {
  fetchRoleList();
});
</script>

<style scoped>
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
  justify-content: flex-end;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}
.custom-select-popper.el-popper.is-light {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
  text-align: center;
}
.el-select .el-input__inner {
  text-align: center;
}
.column-setting-popper.el-popper {
  min-width: 180px !important;
  width: 180px !important;
  padding: 8px 0;
}
.column-setting-popper .el-dropdown-menu__item {
  padding: 4px 16px;
  display: flex;
  align-items: center;
}
.column-setting-btn {
  border-radius: 4px;
  font-size: 14px;
  padding: 0 15px;
  height: 32px;
  display: inline-flex;
  align-items: center;
}
</style> 