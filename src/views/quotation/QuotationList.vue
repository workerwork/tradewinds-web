<template>
  <div class="quotation-list">
    <div class="page-header">
      <h2>报价管理</h2>
      <el-button type="primary" @click="handleAdd">新增报价单</el-button>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="报价单号">
        <el-input v-model="searchForm.quotationNo" placeholder="请输入报价单号" />
      </el-form-item>
      <el-form-item label="客户">
        <el-select v-model="searchForm.customerId" placeholder="请选择客户">
          <el-option label="全部" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发送" value="sent" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已失效" value="expired" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="quotationList" border style="width: 100%">
      <el-table-column prop="quotationNo" label="报价单号" width="180" />
      <el-table-column prop="customerName" label="客户名称" width="200" />
      <el-table-column prop="totalAmount" label="总金额" width="150">
        <template #default="{ row }">
          {{ row.currency }} {{ row.totalAmount }}
        </template>
      </el-table-column>
      <el-table-column prop="validUntil" label="有效期至" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button 
            type="success" 
            size="small" 
            @click="handleEdit(row)"
            :disabled="row.status !== 'draft'"
          >编辑</el-button>
          <el-button 
            type="warning" 
            size="small" 
            @click="handleSend(row)"
            :disabled="row.status !== 'draft'"
          >发送</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface SearchForm {
  quotationNo: string
  customerId: string
  status: string
}

interface Quotation {
  id: number
  quotationNo: string
  customerName: string
  totalAmount: number
  currency: string
  validUntil: string
  createTime: string
  status: 'draft' | 'sent' | 'confirmed' | 'expired'
}

const searchForm = reactive<SearchForm>({
  quotationNo: '',
  customerId: '',
  status: ''
})

const quotationList = ref<Quotation[]>([])

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  searchForm.quotationNo = ''
  searchForm.customerId = ''
  searchForm.status = ''
}

const handleAdd = () => {
  // TODO: 实现新增报价单逻辑
}

const handleView = (row: Quotation) => {
  // TODO: 实现查看报价单详情逻辑
}

const handleEdit = (row: Quotation) => {
  // TODO: 实现编辑报价单逻辑
}

const handleSend = (row: Quotation) => {
  // TODO: 实现发送报价单逻辑
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'info',
    sent: 'warning',
    confirmed: 'success',
    expired: 'danger'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    sent: '已发送',
    confirmed: '已确认',
    expired: '已失效'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.quotation-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style> 