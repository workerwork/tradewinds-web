<template>
  <div class="customer-track">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户跟踪记录</span>
          <el-button type="primary" @click="handleAdd">新增跟踪</el-button>
        </div>
      </template>

      <el-table :data="trackList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="customerName" label="客户名称" width="150" />
        <el-table-column prop="type" label="跟踪类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="跟踪内容" show-overflow-tooltip />
        <el-table-column prop="nextPlan" label="下一步计划" show-overflow-tooltip />
        <el-table-column prop="trackTime" label="跟踪时间" width="180" />
        <el-table-column prop="creator" label="跟踪人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增跟踪记录' : '编辑跟踪记录'"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="客户名称" required>
          <el-select v-model="form.customerId" filterable placeholder="请选择客户">
            <el-option
              v-for="item in customerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="跟踪类型" required>
          <el-select v-model="form.type">
            <el-option label="电话沟通" value="电话沟通" />
            <el-option label="邮件往来" value="邮件往来" />
            <el-option label="现场拜访" value="现场拜访" />
            <el-option label="视频会议" value="视频会议" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="跟踪内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入跟踪内容"
          />
        </el-form-item>
        <el-form-item label="下一步计划">
          <el-input
            v-model="form.nextPlan"
            type="textarea"
            :rows="3"
            placeholder="请输入下一步计划"
          />
        </el-form-item>
        <el-form-item label="跟踪时间" required>
          <el-date-picker
            v-model="form.trackTime"
            type="datetime"
            placeholder="选择跟踪时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')

// 模拟客户选项数据
const customerOptions = [
  { value: '1', label: '客户A' },
  { value: '2', label: '客户B' },
  { value: '3', label: '客户C' }
]

// 模拟跟踪记录数据
const trackList = ref([
  {
    id: '1',
    customerName: '客户A',
    type: '电话沟通',
    content: '讨论了新产品需求和价格',
    nextPlan: '准备详细报价方案',
    trackTime: '2024-03-15 14:30:00',
    creator: '张三'
  }
])

const form = reactive({
  id: '',
  customerId: '',
  type: '',
  content: '',
  nextPlan: '',
  trackTime: ''
})

const getTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '电话沟通': 'info',
    '邮件往来': 'success',
    '现场拜访': 'warning',
    '视频会议': 'primary',
    '其他': ''
  }
  return typeMap[type] || ''
}

const resetForm = () => {
  form.id = ''
  form.customerId = ''
  form.type = ''
  form.content = ''
  form.nextPlan = ''
  form.trackTime = ''
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    ...row,
    customerId: '1' // 这里需要根据实际数据设置
  })
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除该跟踪记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
  })
}

const handleSubmit = () => {
  ElMessage({
    type: 'success',
    message: dialogType.value === 'add' ? '添加成功' : '更新成功',
  })
  dialogVisible.value = false
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.customer-track {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-tag) {
  text-align: center;
  min-width: 80px;
}
</style> 