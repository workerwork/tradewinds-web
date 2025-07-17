<template>
  <div class="dict-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('menu.system.config.dict') }}</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            {{ t('common.add') }}
          </el-button>
        </div>
      </template>
      
      <el-table :data="dictList" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" :label="t('dict.name')" />
        <el-table-column prop="code" :label="t('dict.code')" />
        <el-table-column prop="description" :label="t('dict.description')" />
        <el-table-column :label="t('common.operations')" width="250">
          <template #default="scope">
            <el-button type="primary" link @click="handleViewItems(scope.row)">
              {{ t('dict.items') }}
            </el-button>
            <el-button type="primary" link @click="handleEdit(scope.row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 字典表单对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="t('dict.name')" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('dict.code')" prop="code">
          <el-input v-model="form.code" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item :label="t('dict.description')" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 字典项对话框 -->
    <el-dialog
      :title="currentDict?.name + ' - ' + t('dict.items')"
      v-model="itemsDialogVisible"
      width="800px"
    >
      <div class="dict-items-header">
        <el-button type="primary" @click="handleAddItem">
          <el-icon><Plus /></el-icon>
          {{ t('common.add') }}
        </el-button>
      </div>

      <el-table :data="dictItemsList" style="width: 100%" v-loading="itemsLoading">
        <el-table-column prop="label" :label="t('dict.label')" />
        <el-table-column prop="value" :label="t('dict.value')" />
        <el-table-column prop="sort" :label="t('dict.sort')" width="80" align="center" />
        <el-table-column prop="status" :label="t('dict.status')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status ? 'success' : 'info'" size="small">
              {{ row.status ? t('common.enabled') : t('common.disabled') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.operations')" width="200">
          <template #default="scope">
            <el-button type="primary" link @click="handleEditItem(scope.row)">
              {{ t('common.edit') }}
            </el-button>
            <el-button type="danger" link @click="handleDeleteItem(scope.row)">
              {{ t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 字典项表单对话框 -->
    <el-dialog
      :title="itemDialogTitle"
      v-model="itemDialogVisible"
      width="500px"
    >
      <el-form
        ref="itemFormRef"
        :model="itemForm"
        :rules="itemRules"
        label-width="100px"
      >
        <el-form-item :label="t('dict.label')" prop="label">
          <el-input v-model="itemForm.label" />
        </el-form-item>
        <el-form-item :label="t('dict.value')" prop="value">
          <el-input v-model="itemForm.value" />
        </el-form-item>
        <el-form-item :label="t('dict.sort')" prop="sort">
          <el-input-number v-model="itemForm.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item :label="t('dict.status')" prop="status">
          <el-switch v-model="itemForm.status" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="itemDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleItemSubmit">
            {{ t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

const { t } = useI18n();
const loading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();

const form = ref({
  name: '',
  code: '',
  description: ''
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '以小写字母开头，只能包含小写字母、数字和下划线', trigger: 'blur' }
  ]
};

const dictList = ref([
  {
    name: '性别',
    code: 'sex',
    description: '用户性别'
  },
  {
    name: '状态',
    code: 'status',
    description: '数据状态'
  }
]);

// 字典项管理
const itemsDialogVisible = ref(false);
const itemsLoading = ref(false);
const currentDict = ref<any>(null);
const dictItemsList = ref([
  {
    label: '男',
    value: '1',
    sort: 1,
    status: true
  },
  {
    label: '女',
    value: '2',
    sort: 2,
    status: true
  }
]);

// 字典项表单
const itemDialogVisible = ref(false);
const itemDialogType = ref<'add' | 'edit'>('add');
const itemFormRef = ref<FormInstance>();
const itemForm = ref({
  label: '',
  value: '',
  sort: 0,
  status: true
});

const itemRules: FormRules = {
  label: [
    { required: true, message: '请输入字典标签', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典键值', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ]
};

const dialogTitle = computed(() => {
  return dialogType.value === 'add' ? t('common.add') : t('common.edit');
});

const itemDialogTitle = computed(() => {
  return itemDialogType.value === 'add' ? t('common.add') : t('common.edit');
});

// 字典操作
const handleAdd = () => {
  dialogType.value = 'add';
  form.value = {
    name: '',
    code: '',
    description: ''
  };
  dialogVisible.value = true;
};

const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  form.value = { ...row };
  dialogVisible.value = true;
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    t('common.deleteConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? t('common.addSuccess') : t('common.editSuccess'));
      dialogVisible.value = false;
    }
  });
};

// 字典项操作
const handleViewItems = (row: any) => {
  currentDict.value = row;
  itemsDialogVisible.value = true;
};

const handleAddItem = () => {
  itemDialogType.value = 'add';
  itemForm.value = {
    label: '',
    value: '',
    sort: 0,
    status: true
  };
  itemDialogVisible.value = true;
};

const handleEditItem = (row: any) => {
  itemDialogType.value = 'edit';
  itemForm.value = { ...row };
  itemDialogVisible.value = true;
};

const handleDeleteItem = (row: any) => {
  ElMessageBox.confirm(
    t('common.deleteConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(t('common.deleteSuccess'));
  });
};

const handleItemSubmit = async () => {
  if (!itemFormRef.value) return;
  
  await itemFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(itemDialogType.value === 'add' ? t('common.addSuccess') : t('common.editSuccess'));
      itemDialogVisible.value = false;
    }
  });
};
</script>

<style scoped>
.dict-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
}

.dict-items-header {
  margin-bottom: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 