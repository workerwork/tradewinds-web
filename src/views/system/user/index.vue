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
              搜索找到 {{ filteredUserList.length }} 条结果
            </el-tag>
          </div>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="filteredUserList.length"
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <UserForm 
        ref="userFormRef"
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
import { formatDateTime } from '@/utils/format';
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
import { emitter } from '@/utils/emitter';
import { useTablePersist } from '@/composables/useTablePersist'
import { useSearchHistory } from '@/composables/useSearchHistory'

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

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const userList = ref<User[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
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

// 搜索历史管理
const { addSearchRecord } = useSearchHistory('user-search-history', 10)

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

// 实时过滤用户列表
const filteredUserList = computed(() => {
  let filtered = userList.value;
  
  // 用户名过滤
  if (searchForm.username) {
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(searchForm.username.toLowerCase())
    );
  }
  
  // 姓名过滤
  if (searchForm.realName) {
    filtered = filtered.filter(user => 
      user.realName.toLowerCase().includes(searchForm.realName.toLowerCase())
    );
  }
  
  // 手机号过滤
  if (searchForm.phone) {
    filtered = filtered.filter(user => 
      user.phone.includes(searchForm.phone)
    );
  }
  
  // 邮箱过滤
  if (searchForm.email) {
    filtered = filtered.filter(user => 
      user.email.toLowerCase().includes(searchForm.email.toLowerCase())
    );
  }
  
  // 状态过滤 - 由于状态过滤已经在后端处理，这里不需要再过滤
  // 但为了保持一致性，仍然保留前端的过滤逻辑作为兜底
  if (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined) {
    filtered = filtered.filter(user => user.status === searchForm.status);
  }
  
  return filtered;
});

// 联想建议函数
const queryUsernameSuggestions = (queryString: string, cb: (suggestions: any[]) => void) => {
  const suggestions = userList.value
    .filter(user => user.username.toLowerCase().includes(queryString.toLowerCase()))
    .map(user => ({ value: user.username }))
    .slice(0, 10); // 限制建议数量
  cb(suggestions);
};

const queryRealNameSuggestions = (queryString: string, cb: (suggestions: any[]) => void) => {
  const suggestions = userList.value
    .filter(user => user.realName.toLowerCase().includes(queryString.toLowerCase()))
    .map(user => ({ value: user.realName }))
    .slice(0, 10);
  cb(suggestions);
};

const queryPhoneSuggestions = (queryString: string, cb: (suggestions: any[]) => void) => {
  const suggestions = userList.value
    .filter(user => user.phone.includes(queryString))
    .map(user => ({ value: user.phone }))
    .slice(0, 10);
  cb(suggestions);
};

const queryEmailSuggestions = (queryString: string, cb: (suggestions: any[]) => void) => {
  const suggestions = userList.value
    .filter(user => user.email.toLowerCase().includes(queryString.toLowerCase()))
    .map(user => ({ value: user.email }))
    .slice(0, 10);
  cb(suggestions);
};

// 获取用户列表
const fetchUserList = debounce(async () => {
  try {
    loading.value = true;
    const params: any = {
      page: 1, // 获取所有数据用于本地过滤
      pageSize: 1000, // 获取大量数据
      showDeleted: !!searchForm.showDeleted
    };
    
    // 只有当状态有有效值时才传递状态参数
    if (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined) {
      params.status = searchForm.status;
    }
    

    
    const { users, total: totalCount } = await getUserList(params);
    userList.value = users.map(item => {
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
          safeItem.roles = Array.isArray(item.roles) ? item.roles : [];
        } else if (key === 'status') {
          safeItem.status = Number(item.status ?? 0);
        } else if (key === 'createTime') {
          safeItem.createTime = item.createTime || item.created_at || item.createdAt || item.create_time || '';
        } else if (key === 'updateTime') {
          safeItem.updateTime = item.updateTime || item.updated_at || item.updatedAt || item.update_time || '';
        } else {
          // @ts-ignore
          safeItem[key] = item[key] == null ? '' : item[key];
        }
      });
      return safeItem;
    });
    total.value = totalCount;
    
    // 记录搜索历史（使用当前搜索的字段作为关键词）
    const searchKeywords = [
      searchForm.username,
      searchForm.realName,
      searchForm.phone,
      searchForm.email
    ].filter(Boolean)
    
    if (searchKeywords.length > 0) {
      const keyword = searchKeywords.join(' ')
      addSearchRecord(keyword, filteredUserList.value.length)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
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
  fetchUserList();
};

// 显示已删除用户开关变化处理
const handleShowDeletedChange = () => {
  // 显示已删除用户开关变化时立即重新获取数据
  fetchUserList();
};



// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'showDeleted') return; // 不重置显示已删除用户开关
    searchForm[key] = '';
  });
  fetchUserList();
};



// 刷新角色数据
const refreshRoles = async () => {
  await roleStore.fetchRoles(true);
};

// 新增用户
const handleAdd = async () => {
  dialogType.value = 'add';
  form.id = '';
  form.username = '';
  form.realName = '';
  form.phone = '';
  form.email = '';
  form.password = '';
  form.roleIds = [];
  form.status = 0;
  
  // 强制刷新角色数据，确保获取最新状态
  await roleStore.fetchRoles(true);
  
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = async (row: User) => {
  dialogType.value = 'edit';
  Object.assign(form, {
    ...row,
    id: String(row.id),
    roleIds: row.roles.map(role => String(role.id))
  });
  dialogVisible.value = true;
  // 每次编辑都强制刷新角色数据，保证角色API一定发出
  await roleStore.fetchRoles(true);
};

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return;
  const valid = await userFormRef.value.validate();
  if (valid) {
    submitting.value = true;
    try {
      const userData = userFormRef.value.form;
      // 只提交可编辑字段
      const submitData = {
        id: userData.id,
        username: userData.username,
        realName: userData.realName,
        phone: userData.phone,
        email: userData.email,
        password: userData.password,
        roleIds: userData.roleIds,
        status: userData.status
      };
      if (dialogType.value === 'add') {
        await createUser(submitData);
        ElMessage.success('添加成功');
      } else {
        await updateUserInfo(submitData.id, submitData);
        ElMessage.success('更新成功');
      }
      dialogVisible.value = false;
      fetchUserList();
      
      // 用户信息变更后刷新菜单栏
      try {
        await menuStore.getUserMenus();
        console.log('用户信息变更后菜单刷新成功');
      } catch (error) {
        console.error('用户信息变更后菜单刷新失败:', error);
      }
    } catch (error) {
      console.error('提交表单失败:', error);
    } finally {
      submitting.value = false;
    }
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
  } catch (error) {
    console.error('重置密码失败:', error);
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
    ElMessage.success('' + (row.status === 0 ? '禁用' : '启用') + '成功');
    fetchUserList();
  } catch (error) {
    console.error('更新用户状态失败:', error);
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
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
      console.error('删除用户失败:', error);
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
  page.value = 1;
  fetchUserList();
};

const handleCurrentChange = (newPage: number) => {
  fetchUserList();
};

onMounted(async () => {
  // 并行加载用户列表和角色数据
  await Promise.all([
    fetchUserList(),
    roleStore.fetchRoles() // 预加载角色数据，提升用户体验
  ]);
  // 监听用户资料更新事件，自动刷新用户列表
  emitter.on('user-profile-updated', fetchUserList);
});

onUnmounted(() => {
  emitter.off('user-profile-updated', fetchUserList);
});
</script>

<style scoped>
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

.role-tag {
  margin-right: 4px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}

.custom-select-popper.el-popper.is-light {
  min-width: 120px !important;
  width: 120px !important;
  max-width: 120px !important;
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