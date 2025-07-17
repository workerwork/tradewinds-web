<template>
  <div class="product-list">
    <div class="page-header">
      <h2>产品管理</h2>
      <el-button type="primary" @click="handleAdd">新增产品</el-button>
    </div>

    <el-form :inline="true" class="search-form">
      <el-form-item label="产品编号">
        <el-input v-model="searchForm.code" placeholder="请输入产品编号" />
      </el-form-item>
      <el-form-item label="产品名称">
        <el-input v-model="searchForm.name" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item label="类别">
        <el-select v-model="searchForm.category" placeholder="请选择类别">
          <el-option label="全部" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="productList" border style="width: 100%">
      <el-table-column prop="code" label="产品编号" width="120" />
      <el-table-column prop="name" label="产品名称" width="200" />
      <el-table-column prop="category" label="类别" width="120" />
      <el-table-column prop="specification" label="规格" width="150" />
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column prop="price" label="标准价格" width="120">
        <template #default="{ row }">
          {{ row.currency }} {{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '在售' : '停售' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="success" size="small" @click="handlePricing(row)">定价</el-button>
          <el-button type="warning" size="small" @click="handleStock(row)">库存</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface SearchForm {
  code: string
  name: string
  category: string
}

interface Product {
  id: number
  code: string
  name: string
  category: string
  specification: string
  unit: string
  price: number
  currency: string
  stock: number
  status: 'active' | 'inactive'
}

const searchForm = reactive<SearchForm>({
  code: '',
  name: '',
  category: ''
})

const productList = ref<Product[]>([])

const handleSearch = () => {
  // TODO: 实现搜索逻辑
}

const handleReset = () => {
  searchForm.code = ''
  searchForm.name = ''
  searchForm.category = ''
}

const handleAdd = () => {
  // TODO: 实现新增产品逻辑
}

const handleEdit = (row: Product) => {
  // TODO: 实现编辑产品逻辑
}

const handlePricing = (row: Product) => {
  // TODO: 实现产品定价逻辑
}

const handleStock = (row: Product) => {
  // TODO: 实现库存管理逻辑
}
</script>

<style scoped>
.product-list {
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