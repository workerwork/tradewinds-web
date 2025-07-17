<template>
  <div class="order-list">
    <div class="page-header">
      <h2>订单管理</h2>
      <el-button type="primary" @click="handleAdd">新增订单</el-button>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="订单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" />
      </el-form-item>
      <el-form-item label="客户">
        <el-select v-model="searchForm.customerId" placeholder="请选择客户">
          <el-option label="全部" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态">
          <el-option label="全部" value="" />
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="生产中" value="production" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="orderList" border style="width: 100%">
      <el-table-column prop="orderNo" label="订单号" width="180" />
      <el-table-column prop="customerName" label="客户名称" width="200" />
      <el-table-column prop="amount" label="订单金额" width="150">
        <template #default="{ row }">
          {{ row.currency }} {{ row.amount }}
        </template>
      </el-table-column>
      <el-table-column prop="orderDate" label="下单日期" width="180" />
      <el-table-column prop="deliveryDate" label="预计交期" width="180" />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button type="success" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" size="small" @click="handleTrack(row)">跟踪</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface SearchForm {
  orderNo: string
  customerId: string
  status: string
}

interface Order {
  id: number
  orderNo: string
  customerName: string
  amount: number
  currency: string
  orderDate: string
  deliveryDate: string
  status: string
}

const searchForm = reactive<SearchForm>({
  orderNo: '',
  customerId: '',
  status: ''
})

const orderList = ref<Order[]>([])

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.customerId = ''
  searchForm.status = ''
}

const handleAdd = () => {
  // TODO: 实现新增订单逻辑
}

const handleView = (row: Order) => {
  // TODO: 实现查看订单详情逻辑
}

const handleEdit = (row: Order) => {
  // TODO: 实现编辑订单逻辑
}

const handleTrack = (row: Order) => {
  // TODO: 实现订单跟踪逻辑
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    production: 'info',
    shipped: 'success',
    completed: ''
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    production: '生产中',
    shipped: '已发货',
    completed: '已完成'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.order-list {
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