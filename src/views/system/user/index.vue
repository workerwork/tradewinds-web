<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-autocomplete
            v-model="searchForm.username"
            :fetch-suggestions="queryUsernameSuggestions"
            placeholder="请输入用户名"
            clearable
            trigger-on-focus
            popper-class="autocomplete-username-popper"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
            @select="handleFieldSearch"
            style="width: 140px;"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-autocomplete
            v-model="searchForm.realName"
            :fetch-suggestions="queryRealNameSuggestions"
            placeholder="请输入姓名"
            clearable
            trigger-on-focus
            popper-class="autocomplete-name-popper"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
            @select="handleFieldSearch"
            style="width: 120px;"
          />
        </el-form-item>
        <el-form-item label="手机号">
          <el-autocomplete
            v-model="searchForm.phone"
            :fetch-suggestions="queryPhoneSuggestions"
            placeholder="请输入手机号"
            clearable
            trigger-on-focus
            popper-class="autocomplete-phone-popper"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
            @select="handleFieldSearch"
            style="width: 140px;"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-autocomplete
            v-model="searchForm.email"
            :fetch-suggestions="queryEmailSuggestions"
            placeholder="请输入邮箱"
            clearable
            trigger-on-focus
            popper-class="autocomplete-email-popper"
            @input="handleFieldSearch"
            @clear="handleFieldSearch"
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
          <span style="margin-right: 8px;">显示已删除用户</span>
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
          <span>用户列表</span>
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
              <el-icon><Plus /></el-icon>新增用户
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredUserList" v-loading="loading" border stripe>
        <el-table-column v-if="getColVisible('selection')" type="selection" width="55" align="center" />
        <el-table-column v-if="getColVisible('username')" prop="username" label="用户名" min-width="100" show-overflow-tooltip />
        <el-table-column v-if="getColVisible('realName')" prop="realName" label="姓名" min-width="80" show-overflow-tooltip />
        <el-table-column v-if="getColVisible('phone')" prop="phone" label="手机号" min-width="110" show-overflow-tooltip />
        <el-table-column v-if="getColVisible('email')" prop="email" label="邮箱" min-width="140" show-overflow-tooltip />
        <el-table-column v-if="getColVisible('roles')" prop="roles" label="角色" min-width="120" show-overflow-tooltip :formatter="(row, column, cellValue) => emptyFormatter(row, column, cellValue)">
          <template #default="{ row }">
            <template v-if="row.roles && row.roles.length > 0">
              <el-tag v-for="role in row.roles" :key="role.id" size="small" class="role-tag">
                {{ role.name }}
              </el-tag>
            </template>
            <span v-else class="text-gray-400">无角色</span>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('status')" prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="success" size="small">启用</el-tag>
            <el-tag v-else-if="row.status === 1" type="danger" size="small">禁用</el-tag>
            <el-tag v-else-if="row.status === 2" type="info" size="small">已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('createTime')" prop="createTime" label="创建时间" min-width="140" show-overflow-tooltip :formatter="(row, column, cellValue) => emptyFormatter(row, column, cellValue)">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('updateTime')" prop="updateTime" label="更新时间" min-width="140" show-overflow-tooltip :formatter="(row, column, cellValue) => emptyFormatter(row, column, cellValue)">
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
                type="primary" 
                link 
                @click="handleReset(row)"
              >
                重置密码
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <UserForm 
        ref="userFormRef"
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
  </div>
</template>

<script lang="ts">
export const emptyFormatter = (row, column, cellValue) => cellValue == null ? '' : cellValue;
</script>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Setting } from '@element-plus/icons-vue';
import type { User } from '@/types';
import { useRoleStore } from '@/stores';
import { useMenuStore } from '@/stores/menu';
import { formatDateTime, emitter } from '@/utils';
import { debounce } from 'lodash-es';
import UserForm from './components/UserForm.vue';
import { 
  getUserList, 
  createUser, 
  updateUserInfo, 
  resetUserPassword,
  deleteUser,
  patchUserStatus
} from './services/user-service';
import { useTablePersist, useTableSearch, useSearchHistory, useDialog, useErrorHandler, useAutocomplete } from '@/composables'

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  phone: '',
  email: '',
  status: '',
  showDeleted: false
});

// 分页和列显示持久化
const defaultTableOptions = {
  page: 1,
  pageSize: 10,
  allColumns: [
    { prop: 'selection', label: '选择', visible: true },
    { prop: 'username', label: '用户名', visible: true },
    { prop: 'realName', label: '姓名', visible: true },
    { prop: 'phone', label: '手机号', visible: true },
    { prop: 'email', label: '邮箱', visible: true },
    { prop: 'roles', label: '角色', visible: true },
    { prop: 'status', label: '状态', visible: true },
    { prop: 'createTime', label: '创建时间', visible: true },
    { prop: 'updateTime', label: '更新时间', visible: true },
    { prop: 'operations', label: '操作', visible: true }
  ]
}
const tableOptions = useTablePersist('system-user', defaultTableOptions)
const { handleApiError, handleSilentError } = useErrorHandler()

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const userList = ref<User[]>([])
// 完整的用户列表（用于 autocomplete 建议，不受搜索条件影响）
const allUsersForSuggestions = ref<User[]>([])
const userFormRef = ref()
const form = reactive({
  id: '',
  username: '',
  realName: '',
  phone: '',
  email: '',
  password: '',
  roleIds: [] as string[],
  status: 0
})
const roleStore = useRoleStore()
const menuStore = useMenuStore()

  // 使用 useDialog 管理弹窗状态
  const resetForm = () => {
    form.id = '';
    form.username = '';
    form.realName = '';
    form.phone = '';
    form.email = '';
    form.password = '';
    form.roleIds = [];
    form.status = 0;
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
    resetForm,
    onBeforeOpen: async (type) => {
      // 打开弹窗前强制刷新角色数据
      await roleStore.fetchRoles(true);
    }
  });

  // 搜索历史管理（用于记录搜索历史）
  const { addSearchRecord } = useSearchHistory('user-search-history', 10);

  // 使用统一的搜索过滤 composable
  const { handleFieldSearch, resetSearch, handleStatusChange, handleShowDeletedChange, fetchList } = useTableSearch({
    searchForm,
    page,
    pageSize,
    searchFields: {
      username: 'username',
      realName: 'name', // 后端可能使用 name 字段（根据 user-service.ts 的类型定义）
      phone: 'phone',
      email: 'email'
    },
    handleError: (error, message) => handleApiError(error, message, 'UserManagement'),
    searchHistoryKey: 'user-search-history',
    extractSearchKeywords: (form) => [
      form.username,
      form.realName,
      form.phone,
      form.email
    ].filter(Boolean) as string[],
    debounceTime: 200,
    showDeleted: computed(() => searchForm.showDeleted),
    onFetch: async (params) => {
      loading.value = true;
      try {
        const { users, total: totalCount } = await getUserList(params);
        userList.value = users.map((item: unknown) => {
          const itemObj = item as Record<string, unknown>;
          // 空值保护，所有字段都转为字符串
          const safeItem: User = {
            id: '',
            username: '',
            realName: '',
            avatar: '',
            email: '',
            phone: '',
            roles: [],
            permissions: [],
            status: 0,
            createTime: '',
            updateTime: ''
          };
          Object.keys(safeItem).forEach(key => {
            // roles字段兜底为数组
            if (key === 'roles') {
              safeItem.roles = Array.isArray(itemObj.roles) ? itemObj.roles : [];
            } else if (key === 'status') {
              safeItem.status = Number(itemObj.status ?? 0);
            } else if (key === 'createTime') {
              safeItem.createTime = (itemObj.createTime || itemObj.created_at || itemObj.createdAt || itemObj.create_time || '') as string;
            } else if (key === 'updateTime') {
              safeItem.updateTime = (itemObj.updateTime || itemObj.updated_at || itemObj.updatedAt || itemObj.update_time || '') as string;
            } else {
              // 动态设置其他字段，使用类型断言确保类型安全
              const safeItemAny = safeItem as unknown as Record<string, unknown>;
              safeItemAny[key] = itemObj[key] == null ? '' : itemObj[key];
            }
          });
          return safeItem;
        }) as User[];
        total.value = totalCount;
      } finally {
        loading.value = false;
      }
    }
  })

watch([page, pageSize, allColumns], () => {
  tableOptions.value.page = page.value
  tableOptions.value.pageSize = pageSize.value
  tableOptions.value.allColumns = allColumns.value
}, { deep: true })

const getColVisible = (prop: string) => allColumns.value.find(col => col.prop === prop)?.visible;

// 判断是否有搜索条件
const hasSearchCriteria = computed(() => {
  return searchForm.username || searchForm.realName || searchForm.phone || searchForm.email || (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined)
})

// 使用服务端分页和搜索，不再需要本地过滤
// 直接使用 userList，因为搜索和过滤已经在服务端完成
const filteredUserList = computed(() => userList.value);

// 使用统一的 autocomplete composable
const { createSuggestionQuery, fetchAllForSuggestions } = useAutocomplete<User>({
  allItemsForSuggestions: allUsersForSuggestions,
  currentList: userList,
  fetchAllItems: async () => {
    const params: Record<string, unknown> = {
      page: 1,
      pageSize: 500,
      showDeleted: false
    };
    const result = await getUserList(params);
    const users = result?.users || [];
    return users.map((item: unknown) => {
      const itemObj = item as Record<string, unknown>;
      return {
        id: String(itemObj.id || ''),
        username: String(itemObj.username || ''),
        realName: String(itemObj.realName || itemObj.real_name || itemObj.name || ''),
        email: String(itemObj.email || ''),
        phone: String(itemObj.phone || ''),
      } as User;
    });
  },
  maxSuggestions: 10
});

// 创建各个字段的建议查询函数
const queryUsernameSuggestions = createSuggestionQuery('username');
const queryRealNameSuggestions = createSuggestionQuery('realName');
const queryPhoneSuggestions = createSuggestionQuery('phone', { useContains: true }); // 手机号使用包含匹配
const queryEmailSuggestions = createSuggestionQuery('email');

// 获取用户列表（使用服务端分页和搜索）
// 注意：数据获取逻辑已移至 useTableSearch 的 onFetch 回调中
const fetchUserList = () => {
  // 使用 useTableSearch 提供的 fetchList
  fetchList();
};

// 获取完整用户列表用于 autocomplete 建议（使用 composable 提供的方法）
const fetchAllUsersForSuggestions = () => fetchAllForSuggestions();

// 注意：handleFieldSearch、resetSearch、handleStatusChange、handleShowDeletedChange
// 已由 useTableSearch composable 提供，无需重复定义



// 刷新角色数据
const refreshRoles = async () => {
  await roleStore.fetchRoles(true);
};

// 新增用户
// 新增用户
const handleAdd = () => {
  openAdd();
};

// 编辑用户
const handleEdit = (row: User) => {
  Object.assign(form, {
    ...row,
    id: String(row.id),
    roleIds: row.roles.map(role => String(role.id))
  });
  openEdit(row);
};

// 构建用户提交数据
const buildUserData = (userForm: typeof form) => {
  return {
    id: userForm.id || '',
    username: (userForm.username || '').trim(),
    realName: (userForm.realName || '').trim(),
    phone: (userForm.phone || '').trim(),
    email: (userForm.email || '').trim(),
    password: userForm.password || undefined, // 编辑时可能为空
    roleIds: (userForm.roleIds || []).filter(id => id != null && id !== ''),
    status: Number(userForm.status) || 0
  };
};

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return;
  const valid = await userFormRef.value.validate();
  if (!valid) return;

  setSubmitting(true);
  try {
    const userForm = userFormRef.value.form;
    const submitData = buildUserData(userForm);
    
    if (dialogType.value === 'add') {
      // 新增时必须有密码
      if (!submitData.password) {
        ElMessage.error('请输入密码');
        setSubmitting(false);
        return;
      }
      await createUser(submitData);
      ElMessage.success('添加成功');
    } else {
      // 编辑时校验ID
      if (!submitData.id || submitData.id.trim() === '') {
        ElMessage.error('用户ID无效，无法编辑');
        setSubmitting(false);
        return;
      }
      // 编辑时不提交密码（如果为空）
      const updateData = { ...submitData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateUserInfo(submitData.id, updateData);
      ElMessage.success('更新成功');
    }
    
    close();
    fetchUserList();
    // 用户创建或更新后，延迟更新建议列表（不阻塞主流程）
    setTimeout(() => {
      fetchAllUsersForSuggestions();
    }, 100);
    
    // 用户信息变更后刷新菜单栏
    try {
      await menuStore.getUserMenus();
    } catch (error) {
      // 菜单刷新失败不影响主流程，静默处理
      handleSilentError(error, 'UserManagement');
    }
  } catch (error: unknown) {
    handleApiError(error, '操作失败，请稍后重试', 'UserManagement');
  } finally {
    setSubmitting(false);
  }
};

// 重置密码
const handleReset = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
      type: 'warning'
    });
    await resetUserPassword(String(row.id));
    ElMessage.success('密码重置成功');
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '重置密码失败，请稍后重试', 'UserManagement');
    }
  }
};

// 切换用户状态
const handleToggleStatus = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      '确定要' + (row.status === 0 ? '禁用' : '启用') + '该用户吗？',
      '提示',
      {
        type: 'warning'
      }
    );
    await patchUserStatus(row.id, row.status === 0 ? 1 : 0);
    ElMessage.success((row.status === 0 ? '禁用' : '启用') + '成功');
    fetchUserList();
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败，请稍后重试', 'UserManagement');
    }
  }
};

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    });
    await deleteUser(row.id);
    ElMessage.success('删除成功');
    fetchUserList();
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败', 'UserManagement');
    }
  }
};

// 新增软删除和物理删除方法
const handleSoftDelete = (row: User) => {
  ElMessageBox.confirm(
    '确定要删除该用户吗？（可在回收站彻底删除）',
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await patchUserStatus(row.id, 2); // 软删除
      ElMessage.success('已移入回收站');
      fetchUserList();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};
const handlePhysicalDelete = (row: User) => {
  ElMessageBox.confirm(
    '此操作将彻底删除该用户，无法恢复，是否继续？',
    '警告',
    {
      confirmButtonText: '彻底删除',
      cancelButtonText: '取消',
      type: 'error',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await deleteUser(row.id); // 物理删除
      ElMessage.success('已彻底删除');
      fetchUserList();
    } catch (error) {
      ElMessage.error('彻底删除失败');
    }
  });
};

// 分页相关方法
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1; // 改变每页数量时重置到第一页
  fetchUserList();
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage;
  fetchUserList();
};

onMounted(async () => {
  // 并行加载用户列表和角色数据（不阻塞页面加载）
  await Promise.all([
    fetchUserList(),
    roleStore.fetchRoles() // 预加载角色数据，提升用户体验
  ]);
  
  // 延迟加载建议列表，使用 requestIdleCallback 在空闲时加载，不阻塞主流程
  // 优化：减少 timeout，让建议列表更快可用
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (callback: IdleRequestCallback, options?: { timeout?: number }) => number }).requestIdleCallback(() => {
      fetchAllUsersForSuggestions();
    }, { timeout: 500 }); // 从 2000ms 减少到 500ms，让建议列表更快可用
  } else {
    // 降级方案：延迟300ms加载
    setTimeout(() => {
      fetchAllUsersForSuggestions();
    }, 300); // 从 500ms 减少到 300ms
  }
  
  // 监听用户资料更新事件，自动刷新用户列表
  emitter.on('user-profile-updated', () => {
    fetchUserList();
    // 延迟更新建议列表，不阻塞主流程
    setTimeout(() => {
      fetchAllUsersForSuggestions();
    }, 100);
  });
});

onUnmounted(() => {
  emitter.off('user-profile-updated', fetchUserList);
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

// ==================== 页面布局 ====================
.user-management {
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

// ==================== 分页容器 ====================
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

// ==================== 角色标签 ====================
.role-tag {
  margin-right: 4px;
}

// ==================== 表单样式穿透 ====================
:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
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

// ==================== 自动完成下拉菜单 ====================
// 用户名输入框下拉菜单（140px）
:deep(.autocomplete-username-popper.el-popper),
:deep(.autocomplete-username-popper.el-autocomplete-suggestion) {
  min-width: 140px !important;
  width: 140px !important;
  max-width: 140px !important;
}

// 姓名输入框下拉菜单（120px）
:deep(.autocomplete-name-popper.el-popper),
:deep(.autocomplete-name-popper.el-autocomplete-suggestion) {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
}

// 手机号输入框下拉菜单（140px）
:deep(.autocomplete-phone-popper.el-popper),
:deep(.autocomplete-phone-popper.el-autocomplete-suggestion) {
  min-width: 140px !important;
  width: 140px !important;
  max-width: 140px !important;
}

// 邮箱输入框下拉菜单（200px）
:deep(.autocomplete-email-popper.el-popper),
:deep(.autocomplete-email-popper.el-autocomplete-suggestion) {
  min-width: 200px !important;
  width: 200px !important;
  max-width: 200px !important;
}

// ==================== 自定义选择器 Popper ====================
:deep(.custom-select-popper.el-popper.is-light) {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
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
</style> 