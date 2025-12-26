<template>
  <div class="menu-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.name" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;" popper-class="custom-select-popper">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
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
          <span>菜单列表</span>
          <el-button type="primary" @click="() => handleAdd()" v-permission="'system:menu:add'">
            <el-icon><Plus /></el-icon>新增菜单
          </el-button>
        </div>
      </template>

      <el-table
        :data="menuList"
        v-loading="loading"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-icon v-if="row.icon" class="menu-icon">
              <component :is="row.icon" />
            </el-icon>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'menu' ? undefined : 'info'" size="small">
              {{ row.type === 'menu' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="120" show-overflow-tooltip />
        <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="permission" label="权限标识" min-width="150" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                link 
                @click="handleAdd(row)"
                v-permission="'system:menu:add'"
              >
                新增
              </el-button>
              <el-button 
                type="primary" 
                link 
                @click="handleEdit(row)"
                v-permission="'system:menu:edit'"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleDelete(row)"
                v-permission="'system:menu:delete'"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 菜单表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级菜单"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <template v-if="form.type === 'menu'">
          <el-form-item label="图标" prop="icon">
            <el-input v-model="form.icon" placeholder="请输入图标名称">
              <template #prefix>
                <el-icon v-if="form.icon">
                  <component :is="form.icon" />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="form.path" placeholder="请输入路由路径" />
          </el-form-item>
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
        </template>
        <el-form-item label="权限标识" prop="permission" v-if="form.type === 'button'">
          <el-input v-model="form.permission" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { Search, Plus, Refresh } from '@element-plus/icons-vue';
import type { Menu, Permission } from '@/types';
import { request } from '@/utils';
import { useErrorHandler } from '@/composables';

// 分页参数
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
});

// 表格数据
const { handleApiError } = useErrorHandler();
const loading = ref(false);
const menuList = ref<Menu[]>([]);
const menuOptions = ref<Menu[]>([]);

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const submitting = ref(false);

// 表单
const formRef = ref<FormInstance>();
const form = reactive({
  id: '',
  parentId: undefined as string | undefined,
  type: 'menu' as 'menu' | 'button',
  name: '',
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  status: 1
});

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur' }
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
};

// 获取菜单列表
const getMenuList = async () => {
  loading.value = true;
  try {
    const res = await request.get<Menu[]>('/system/menu/list', {
      params: {
        ...searchForm,
        page: page.value,
        size: pageSize.value
      }
    });
    menuList.value = res;
    const rootMenu: Menu = {
      id: '0',
      name: '顶级菜单',
      children: res,
      type: 'menu',
      icon: '',
      path: '',
      component: '',
      code: 'ROOT',
      parentId: '0',
      sort: 0,
      status: 1,
      description: ''
    };
    menuOptions.value = [rootMenu];
  } catch (error: unknown) {
    handleApiError(error, '获取菜单列表失败，请稍后重试', 'MenuManagement');
  } finally {
    loading.value = false;
  }
};

// 获取菜单选项
const getMenuOptions = async () => {
  try {
    const res = await request.get<Permission[]>('/system/menu/tree');
    const rootMenu: Menu = {
      id: '0',
      name: '顶级菜单',
      children: res,
      type: 'menu',
      icon: '',
      path: '',
      component: '',
      code: 'ROOT',
      parentId: '0',
      sort: 0,
      status: 1,
      description: ''
    };
    menuOptions.value = [rootMenu];
  } catch (error: unknown) {
    handleApiError(error, '获取菜单选项失败，请稍后重试', 'MenuManagement');
  }
};

// 搜索
const handleSearch = () => {
  getMenuList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = '';
  searchForm.status = '';
  handleSearch();
};

// 新增菜单
const handleAdd = (row?: Menu) => {
  dialogType.value = 'add';
  form.id = '';
  form.parentId = row?.id ? String(row.id) : undefined;
  form.type = 'menu';
  form.name = '';
  form.icon = '';
  form.path = '';
  form.component = '';
  form.permission = '';
  form.sort = 0;
  form.status = 1;
  dialogVisible.value = true;
};

// 编辑菜单
const handleEdit = (row: Menu) => {
  dialogType.value = 'edit';
  Object.assign(form, row);
  dialogVisible.value = true;
};

// 删除菜单
const handleDelete = async (row: Menu) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
      type: 'warning'
    });
    await request.delete(`/system/menu/delete/${row.id}`);
    ElMessage.success('删除成功');
    getMenuList();
  } catch (error: unknown) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败，请稍后重试', 'MenuManagement');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (dialogType.value === 'add') {
          await request.post('/system/menu/add', form);
          ElMessage.success('添加成功');
        } else {
          await request.put(`/system/menu/update/${form.id}`, form);
          ElMessage.success('更新成功');
        }
        dialogVisible.value = false;
        getMenuList();
      } catch (error: unknown) {
        handleApiError(error, '操作失败，请稍后重试', 'MenuManagement');
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  getMenuList();
  getMenuOptions();
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

// ==================== 页面布局 ====================
.menu-management {
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

// ==================== 菜单图标 ====================
.menu-icon {
  margin-right: 4px;
  vertical-align: middle;
  transition: $transition-base;
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
</style> 