<template>
  <div class="params-config">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="参数名称">
          <el-input v-model="searchForm.paramName" placeholder="请输入参数名称" clearable />
        </el-form-item>
        <el-form-item label="参数键名">
          <el-input v-model="searchForm.paramKey" placeholder="请输入参数键名" clearable />
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

    <!-- 操作按钮区域 -->
    <div class="table-operations">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增参数
      </el-button>
      <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" type="index" width="80" />
        <el-table-column prop="paramName" label="参数名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="paramKey" label="参数键名" min-width="150" show-overflow-tooltip />
        <el-table-column prop="paramValue" label="参数值" min-width="150" show-overflow-tooltip />
        <el-table-column prop="type" label="系统内置" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'Y' ? 'success' : 'info'">
              {{ row.type === 'Y' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="'0'"
              :inactive-value="'1'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)" :disabled="row.type === 'Y'">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="参数名称" prop="paramName">
          <el-input v-model="form.paramName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="paramKey">
          <el-input v-model="form.paramKey" placeholder="请输入参数键名" :disabled="form.type === 'Y'" />
        </el-form-item>
        <el-form-item label="参数值" prop="paramValue">
          <el-input v-model="form.paramValue" placeholder="请输入参数值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="type">
          <el-radio-group v-model="form.type" :disabled="!!form.id">
            <el-radio label="Y">是</el-radio>
            <el-radio label="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确 定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { getParamList, addParam, updateParam, deleteParam, batchDeleteParams } from '@/api/system'
import { useErrorHandler } from '@/composables'

interface ParamItem {
  id: number
  paramName: string
  paramKey: string
  paramValue: string
  type: 'Y' | 'N'
  status: '0' | '1'
  remark: string
  createTime: string
}

// 搜索表单
const searchForm = reactive({
  paramName: '',
  paramKey: ''
})

// 表格数据
const loading = ref(false)
const tableData = ref<ParamItem[]>([])

// 选中行
const selectedRows = ref<ParamItem[]>([])

// 错误处理
const { handleApiError } = useErrorHandler()

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<ParamItem>({
  id: 0,
  paramName: '',
  paramKey: '',
  paramValue: '',
  type: 'N',
  status: '0',
  remark: '',
  createTime: ''
})

const rules: FormRules = {
  paramName: [
    { required: true, message: '请输入参数名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  paramKey: [
    { required: true, message: '请输入参数键名', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  paramValue: [
    { required: true, message: '请输入参数值', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择系统内置', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 初始化
onMounted(() => {
  fetchData()
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const { data } = await getParamList(params)
    tableData.value = data.list
    pagination.total = data.total
  } catch (error: unknown) {
    handleApiError(error, '获取参数列表失败', 'ConfigParams')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.paramName = ''
  searchForm.paramKey = ''
  handleSearch()
}

// 选择行
const handleSelectionChange = (rows: ParamItem[]) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增参数'
  Object.assign(form, {
    id: 0,
    paramName: '',
    paramKey: '',
    paramValue: '',
    type: 'N',
    status: '0',
    remark: '',
    createTime: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: ParamItem) => {
  dialogTitle.value = '编辑参数'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: ParamItem) => {
  ElMessageBox.confirm(
    '确定要删除该参数吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await deleteParam(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      handleApiError(error, '删除失败', 'ConfigParams')
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择要删除的参数')
    return
  }
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个参数吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.id)
      await batchDeleteParams(ids)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error: unknown) {
      handleApiError(error, '批量删除失败', 'ConfigParams')
    }
  })
}

// 状态变更
const handleStatusChange = async (row: ParamItem) => {
  try {
    await updateParam(row.id, { status: row.status })
    ElMessage.success(`状态更新成功：${row.status === '0' ? '启用' : '停用'}`)
  } catch (error: unknown) {
    handleApiError(error, '状态更新失败', 'ConfigParams')
    // 恢复状态
    row.status = row.status === '0' ? '1' : '0'
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await updateParam(form.id, form)
          ElMessage.success('修改成功')
        } else {
          await addParam(form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error: unknown) {
        handleApiError(error, '保存失败', 'ConfigParams')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 分页相关
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  fetchData()
}
</script>

<style scoped>
.params-config {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-operations {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  padding: 20px !important;
}

:deep(.el-form--inline .el-form-item) {
  margin-bottom: 0;
}
</style> 