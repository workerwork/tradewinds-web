<template>
  <div class="permission-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item :label="t('permission.name')">
          <el-autocomplete
            v-model="searchForm.name"
            :placeholder="t('permission.name')"
            clearable
            popper-class="autocomplete-permission-name-popper"
            :fetch-suggestions="queryNameSuggestions"
            @select="handleFieldSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item :label="t('permission.code')">
          <el-autocomplete
            v-model="searchForm.code"
            :placeholder="t('permission.code')"
            clearable
            popper-class="autocomplete-permission-code-popper"
            :fetch-suggestions="queryCodeSuggestions"
            @select="handleFieldSearch"
            style="width: 250px;"
          />
        </el-form-item>
        <el-form-item :label="t('permission.type')">
          <el-select v-model="searchForm.type" :placeholder="t('permission.type')" clearable style="width: 120px;" popper-class="custom-select-popper" @change="handleFieldSearch">
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;" popper-class="custom-select-popper" @change="handleStatusChange">
            <el-option label="启用" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <span style="margin-right: 8px;">显示已删除权限</span>
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
          <span>{{ t('menu.user.permissions') }}</span>
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
              <el-icon><Plus /></el-icon>
              新增权限
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="paginatedPermissionList" style="width: 100%" v-loading="loading" border stripe :resizable="true">
        <el-table-column v-if="getColVisible('selection')" type="selection" width="55" align="center" />
        <el-table-column v-if="getColVisible('name')" prop="name" :label="t('permission.name')" min-width="120" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('code')" prop="code" :label="t('permission.code')" min-width="120" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('type')" prop="type" :label="t('permission.type')" min-width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.type === 'menu' ? 'success' : row.type === 'button' ? 'info' : 'warning'">
              {{ typeLabelMap[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('icon')" prop="icon" label="图标" min-width="80" align="center" show-overflow-tooltip :formatter="emptyFormatter">
          <template #default="{ row }">
            <el-icon v-if="row.icon && iconMap[row.icon]">
              <component :is="iconMap[row.icon]" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('path')" prop="path" label="路由路径" min-width="140" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('component')" prop="component" label="组件路径" min-width="140" show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('sort')" prop="sort" label="排序" min-width="90" align="center" header-align="center" sortable show-overflow-tooltip :formatter="emptyFormatter" />
        <el-table-column v-if="getColVisible('status')" prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="success" size="small">启用</el-tag>
            <el-tag v-else-if="row.status === 1" type="danger" size="small">禁用</el-tag>
            <el-tag v-else-if="row.status === 2" type="info" size="small">已删除</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('description')" prop="description" label="描述" min-width="120" show-overflow-tooltip :formatter="emptyFormatter" />
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
        <el-table-column v-if="getColVisible('parent')" prop="parentId" label="父权限" min-width="120" show-overflow-tooltip :formatter="emptyFormatter">
          <template #default="{ row }">
            {{ getParentName(row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column v-if="getColVisible('operations')" :label="t('common.operations')" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button
              :type="scope.row.status === 0 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 0 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              v-if="scope.row.status !== 2"
              type="danger"
              link
              @click="handleSoftDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button
              v-else
              type="danger"
              link
              @click="handlePhysicalDelete(scope.row)"
            >
              彻底删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页和搜索统计 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <div class="search-stats" v-if="hasSearchCriteria">
            <el-tag type="info" size="small">
              搜索找到 {{ filteredPermissionList.length }} 条结果
            </el-tag>
          </div>
        </div>
        <div class="pagination-right">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="filteredPermissionList.length"
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
    <!-- 添加/编辑权限对话框 -->
    <FormDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :title="dialogType === 'add' ? '新增权限' : '编辑权限'"
      width="500px"
      :loading="submitting"
      :cancel-text="t('common.cancel')"
      :confirm-text="t('common.confirm')"
      @confirm="handleSubmit"
      @cancel="close"
    >
      <PermissionForm
        ref="permissionFormRef"
        :model-value="form"
        :is-edit="dialogType === 'edit'"
        :parent-options="allPermissionsTree"
      />
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, Refresh, Setting, User, Menu, HomeFilled, Lock, Bell, Folder, Document, Edit, Delete, Star, Warning, InfoFilled, Tools, DataAnalysis, Monitor, PieChart, Tickets, Message, ChatLineRound, Calendar, Collection, Connection, Upload, Download, Link, Compass, Flag, Key, List, Location, Notification, OfficeBuilding, Postcard, Promotion, QuestionFilled, Reading, RefreshRight, School, Service, Shop, ShoppingCart, Stopwatch, Suitcase, SwitchButton, Timer, TrendCharts, Trophy, UploadFilled, UserFilled, Van, VideoCamera, Wallet, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PermissionForm from './components/PermissionForm.vue';
import FormDialog from '@/components/common/FormDialog.vue';
import { 
  getPermissionList, 
  createPermission, 
  updatePermission, 
  deletePermission,
  getPermissionTree
} from './services/permission-service';
import { request, formatDateTime } from '@/utils';
import { debounce } from 'lodash-es';
// 只在顶部导入一次 Permission 类型
import type { Permission } from '@/types';
import { useMenuStore } from '@/stores/menu';
import { useTablePersist, useSearchHistory, useDialog } from '@/composables'

// 自动完成建议项类型
interface AutocompleteSuggestion {
  value: string;
}

const { t } = useI18n();
// 分页和列显示持久化
const defaultTableOptions = {
  page: 1,
  pageSize: 10,
  allColumns: [
    { prop: 'selection', label: '选择', visible: false },
    { prop: 'name', label: t('permission.name'), visible: true },
    { prop: 'code', label: t('permission.code'), visible: true },
    { prop: 'type', label: t('permission.type'), visible: true },
    { prop: 'icon', label: '图标', visible: false },
    { prop: 'parent', label: '父权限', visible: true },
    { prop: 'path', label: '路由路径', visible: false },
    { prop: 'component', label: '组件路径', visible: false },
    { prop: 'sort', label: '排序', visible: false },
    { prop: 'status', label: '状态', visible: true },
    { prop: 'description', label: '描述', visible: false },
    { prop: 'createTime', label: '创建时间', visible: false },
    { prop: 'updateTime', label: '更新时间', visible: false },
    { prop: 'operations', label: t('common.operations'), visible: true }
  ]
}
const tableOptions = useTablePersist('system-permission', defaultTableOptions)

// 搜索历史管理
const { addSearchRecord } = useSearchHistory('permission-search-history', 10)

// 只保留一份分页和列声明
const page = ref(tableOptions.value.page)
const pageSize = ref(tableOptions.value.pageSize)
const allColumns = ref(tableOptions.value.allColumns)
const total = ref(0)
const loading = ref(false)
const permissionList = ref<Permission[]>([])
const currentId = ref<string>('')
const permissionFormRef = ref()
const allPermissionsTree = ref<Permission[]>([])
const allPermissionsFlat = ref<Permission[]>([])
const form = ref<Permission>({
  id: '',
  name: '',
  code: '',
  type: 'menu',
  parentId: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 0,
  description: '',
  children: [],
  createTime: '',
  updateTime: ''
})
const menuStore = useMenuStore()

// safeItem 定义（用于表单重置）
const safeItem: Permission = {
  id: '',
  name: '',
  code: '',
  type: 'menu',
  parentId: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 0,
  description: '',
  children: [],
  createTime: '',
  updateTime: ''
};

// 使用 useDialog 管理弹窗状态
const resetForm = () => {
  form.value = { ...safeItem };
  form.value.parentId = String(form.value.parentId ?? '');
  permissionFormRef.value?.resetForm();
  form.value.type = 'menu'; // 确保type为menu
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

// 类型映射
const typeLabelMap = {
  menu: '菜单',
  button: '按钮',
  api: 'API'
};

const iconMap = {
  user: User,
  menu: Menu,
  home: HomeFilled,
  setting: Setting,
  lock: Lock,
  bell: Bell,
  folder: Folder,
  document: Document,
  edit: Edit,
  delete: Delete,
  star: Star,
  warning: Warning,
  info: InfoFilled,
  tools: Tools,
  analysis: DataAnalysis,
  monitor: Monitor,
  pie: PieChart,
  tickets: Tickets,
  message: Message,
  chat: ChatLineRound,
  calendar: Calendar,
  collection: Collection,
  connection: Connection,
  upload: Upload,
  download: Download,
  link: Link,
  compass: Compass,
  flag: Flag,
  key: Key,
  list: List,
  location: Location,
  notification: Notification,
  office: OfficeBuilding,
  postcard: Postcard,
  promotion: Promotion,
  question: QuestionFilled,
  reading: Reading,
  refresh: RefreshRight,
  school: School,
  service: Service,
  shop: Shop,
  cart: ShoppingCart,
  stopwatch: Stopwatch,
  suitcase: Suitcase,
  switch: SwitchButton,
  timer: Timer,
  trend: TrendCharts,
  trophy: Trophy,
  uploadfilled: UploadFilled,
  userfilled: UserFilled,
  van: Van,
  video: VideoCamera,
  wallet: Wallet,
  zoomin: ZoomIn,
  zoomout: ZoomOut
};

// 父权限查找
const getParentName = (parentId: string) => {
  const pid = String(parentId);
  if (!pid || pid === '0') return '—';
  const parent = allPermissionsFlat.value.find(p => String(p.id) === pid);
  return parent ? parent.name : '—';
};

// safeItem 已在上面定义，这里不再重复定义

const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? t('common.add') : t('common.edit');
});

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  type: '',
  status: '',
  showDeleted: false
});

const getColVisible = (prop: string) => allColumns.value.find(col => col.prop === prop)?.visible;

// 判断是否有搜索条件
const hasSearchCriteria = computed(() => {
  return searchForm.name || searchForm.code || searchForm.type || (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined)
})

// 实时过滤权限列表
const filteredPermissionList = computed(() => {
  let filtered = permissionList.value;
  
  // 权限名称过滤
  if (searchForm.name) {
    filtered = filtered.filter(permission => 
      permission.name.toLowerCase().includes(searchForm.name.toLowerCase())
    );
  }
  
  // 权限编码过滤
  if (searchForm.code) {
    filtered = filtered.filter(permission => 
      permission.code.toLowerCase().includes(searchForm.code.toLowerCase())
    );
  }
  
  // 权限类型过滤
  if (searchForm.type) {
    filtered = filtered.filter(permission => 
      permission.type === searchForm.type
    );
  }
  
  // 状态过滤 - 由于状态过滤已经在后端处理，这里不需要再过滤
  // 但为了保持一致性，仍然保留前端的过滤逻辑作为兜底
  if (searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined) {
    const statusNum = typeof searchForm.status === 'string' ? parseInt(searchForm.status) : searchForm.status;
    filtered = filtered.filter(permission => permission.status === statusNum);
  }
  
  return filtered;
});

// 分页后的权限列表
const paginatedPermissionList = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredPermissionList.value.slice(start, end);
});

// 联想建议函数
const queryNameSuggestions = (queryString: string, cb: (suggestions: AutocompleteSuggestion[]) => void) => {
  const suggestions = permissionList.value
    .filter(permission => permission.name.toLowerCase().includes(queryString.toLowerCase()))
    .map(permission => ({ value: permission.name }))
    .slice(0, 10); // 限制建议数量
  cb(suggestions);
};

const queryCodeSuggestions = (queryString: string, cb: (suggestions: AutocompleteSuggestion[]) => void) => {
  const suggestions = permissionList.value
    .filter(permission => permission.code.toLowerCase().includes(queryString.toLowerCase()))
    .map(permission => ({ value: permission.code }))
    .slice(0, 10);
  cb(suggestions);
};

// 空值formatter，防止tooltipFormatter报错
const emptyFormatter = (row, column, cellValue) => cellValue == null ? '' : cellValue;

onMounted(() => {
  fetchPermissionList();
  fetchAllPermissions();
});

// 获取权限列表
const fetchPermissionList = async () => {
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
    
    // 只有当权限类型有有效值时才传递类型参数
    if (searchForm.type) {
      params.type = searchForm.type;
    }
    const res = await getPermissionList(params);
    // 兼容返回结构
    let list: Permission[] = [];
    let totalCount = 0;
    if (Array.isArray(res)) {
      list = res;
      totalCount = res.length;
    } else if (res && typeof res === 'object') {
      const resObj = res as Record<string, any>;
      if ('permissions' in resObj) {
        list = (resObj.permissions || []) as Permission[];
        totalCount = resObj.total ?? list.length ?? 0;
      } else if ('items' in resObj || 'list' in resObj) {
        list = ((resObj.items || resObj.list) || []) as Permission[];
        totalCount = resObj.total || list.length || 0;
      } else if ('data' in resObj && typeof resObj.data === 'object' && (('items' in resObj.data) || ('list' in resObj.data))) {
        list = ((resObj.data.items || resObj.data.list) || []) as Permission[];
        totalCount = resObj.data.total || list.length || 0;
      } else {
        list = (Array.isArray(res) ? res : []) as Permission[];
        totalCount = list.length || 0;
      }
    } else {
      list = [];
      totalCount = 0;
    }
    permissionList.value = list.map((item: any) => {
      const result: Permission = { ...safeItem, ...item };
      result.id = String(item.id ?? '');
      result.parentId = String(item.parentId ?? '');
      result.sort = Number(item.sort ?? 0);
      result.status = Number(item.status ?? 0);
      // 修正：兼容后端type字段
      if (item.type) {
        result.type = item.type;
      }
      // 兼容后端各种时间字段
      result.createTime = item.createTime || item.created_at || item.createdAt || item.create_time || '';
      result.updateTime = item.updateTime || item.updated_at || item.updatedAt || item.update_time || '';
      return result;
    });
    total.value = totalCount;
    
    // 记录搜索历史（使用当前搜索的字段作为关键词）
    const searchKeywords = [
      searchForm.name,
      searchForm.code,
      searchForm.type,
      searchForm.status !== '' && searchForm.status != null && searchForm.status !== undefined ? `状态:${(typeof searchForm.status === 'string' ? parseInt(searchForm.status) : searchForm.status) === 0 ? '启用' : '禁用'}` : null
    ].filter(Boolean)
    
    if (searchKeywords.length > 0) {
      const keyword = searchKeywords.join(' ')
      addSearchRecord(keyword, filteredPermissionList.value.length)
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '获取权限列表失败，请稍后重试');
    console.error('获取权限列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 字段搜索（带防抖）
const handleFieldSearch = debounce(() => {
  // 字段变化时重新获取数据以确保数据完整性
  fetchPermissionList();
}, 300);

// 状态变化处理
const handleStatusChange = () => {
  // 状态变化时立即重新获取数据
  fetchPermissionList();
};

// 显示已删除权限开关变化处理
const handleShowDeletedChange = () => {
  // 显示已删除权限开关变化时立即重新获取数据
  fetchPermissionList();
};
// 重置搜索
const resetSearch = () => {
  searchForm.name = '';
  searchForm.code = '';
  searchForm.type = '';
  searchForm.status = '';
  searchForm.showDeleted = false; // 重置显示已删除权限开关
  fetchPermissionList();
};
// 分页相关方法
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  page.value = 1;
  // 本地分页，不需要重新请求数据
};

const handleCurrentChange = (newPage: number) => {
  page.value = newPage;
  // 本地分页，不需要重新请求数据
};

// 添加权限
const handleAdd = () => {
  openAdd();
};

// 编辑权限
const handleEdit = (row: Permission) => {
  currentId.value = String(row.id);
  form.value = { ...safeItem, ...row };
  form.value.id = String(row.id ?? '');
  form.value.parentId = String(row.parentId ?? '');
  form.value.sort = Number(row.sort ?? 0);
  form.value.status = Number(row.status ?? 0);
  openEdit(row);
};

// 删除权限
const handleDelete = (row: Permission) => {
  ElMessageBox.confirm(
    t('common.deleteConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deletePermission(String(row.id));
      ElMessage.success(t('common.deleteSuccess'));
      fetchPermissionList();
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error?.message || t('common.deleteFailed') || '删除失败，请稍后重试');
        console.error('删除失败:', error);
      }
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return;
  const valid = await permissionFormRef.value.validate();
  if (!valid) return;

  setSubmitting(true);
  try {
    const permissionData = permissionFormRef.value.form;
    // 兜底处理 parentId，确保为 null
    let parentId = permissionData.parentId;
    if (parentId === '' || parentId === undefined || parentId === 0 || parentId === '0') {
      parentId = null;
    }
    // 只提交可编辑字段
    const submitData = dialogType.value === 'add' ? {
      name: permissionData.name,
      code: permissionData.code,
      type: permissionData.type,
      parentId: parentId,
      path: permissionData.path,
      component: permissionData.component,
      icon: permissionData.icon,
      sort: permissionData.sort,
      status: permissionData.status,
      description: permissionData.description
    } : {
      id: permissionData.id,
      name: permissionData.name,
      code: permissionData.code,
      type: permissionData.type,
      parentId: parentId,
      path: permissionData.path,
      component: permissionData.component,
      icon: permissionData.icon,
      sort: permissionData.sort,
      status: permissionData.status,
      description: permissionData.description
    };
    if (dialogType.value === 'add') {
      await createPermission(submitData);
      ElMessage.success(t('common.addSuccess'));
    } else {
      await updatePermission(submitData.id, submitData);
      ElMessage.success(t('common.editSuccess'));
    }
    close();
    fetchPermissionList();
    
    // 权限变更后刷新菜单栏
    try {
      await menuStore.getUserMenus();
    } catch (error) {
      // 菜单刷新失败不影响主流程，静默处理
      console.error('权限变更后菜单刷新失败:', error);
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '操作失败，请稍后重试');
    console.error('提交表单失败:', error);
  } finally {
    setSubmitting(false);
  }
};

const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要${row.status === 0 ? '禁用' : '启用'}该权限吗？`,
      '提示',
      { type: 'warning', closeOnClickModal: false }
    );
    await request.patch(`/system/permissions/${row.id}`, { id: row.id, status: row.status === 0 ? 1 : 0 });
    ElMessage.success(`${row.status === 0 ? '禁用' : '启用'}成功`);
    fetchPermissionList();
    await menuStore.getUserMenus(); // 权限变更后刷新菜单栏
  } catch (error) {
    // 用户取消不提示
  }
};

// 新增软删除和物理删除方法
const handleSoftDelete = (row: Permission) => {
  ElMessageBox.confirm(
    '确定要删除该权限吗？（可在回收站彻底删除）',
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await request.patch(`/system/permissions/${row.id}`, { id: row.id, status: 2 });
      ElMessage.success('已移入回收站');
      fetchPermissionList();
      await menuStore.getUserMenus(); // 权限变更后刷新菜单栏
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};
const handlePhysicalDelete = (row: Permission) => {
  ElMessageBox.confirm(
    '此操作将彻底删除该权限，无法恢复，是否继续？',
    '警告',
    {
      confirmButtonText: '彻底删除',
      cancelButtonText: '取消',
      type: 'error',
      closeOnClickModal: false
    }
  ).then(async () => {
    try {
      await deletePermission(row.id); // 只传 id，不传 body，不设置 Content-Type
      ElMessage.success('已彻底删除');
      fetchPermissionList();
      await menuStore.getUserMenus(); // 权限变更后刷新菜单栏
    } catch (error) {
      ElMessage.error('彻底删除失败');
    }
  });
};

// 获取所有权限树
const fetchAllPermissions = async () => {
  try {
    const tree = await request.get('/system/permissions/tree');
    const treeData = Array.isArray(tree) ? tree : (tree.data || []);
    allPermissionsTree.value = treeData;
    allPermissionsFlat.value = flattenPermissions(treeData);
  } catch (e) {
    allPermissionsTree.value = [];
    allPermissionsFlat.value = [];
  }
};

// 递归扁平化权限树
const flattenPermissions = (tree: Permission[], parentId: string = '0'): Permission[] => {
  let flat: Permission[] = [];
  tree.forEach(node => {
    const currentNode = { ...node, parentId: parentId };
    flat.push(currentNode);
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenPermissions(node.children, node.id));
    }
  });
  return flat;
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
.permission-management {
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
// 权限名称输入框下拉菜单（200px）
:deep(.autocomplete-permission-name-popper.el-popper),
:deep(.autocomplete-permission-name-popper.el-autocomplete-suggestion) {
  min-width: 200px !important;
  width: 200px !important;
  max-width: 200px !important;
}

// 权限编码输入框下拉菜单（250px）
:deep(.autocomplete-permission-code-popper.el-popper),
:deep(.autocomplete-permission-code-popper.el-autocomplete-suggestion) {
  min-width: 250px !important;
  width: 250px !important;
  max-width: 250px !important;
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
:deep(.el-table th) {
  vertical-align: middle !important;
  height: 40px !important;
  font-size: 14px;
}
</style> 