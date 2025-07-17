<template>
  <div class="product-info">
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>产品信息管理</span>
          <div class="header-actions">
            <el-select
              v-model="selectedFactory"
              placeholder="选择工厂"
              clearable
              @change="handleFactoryChange"
              style="width: 200px; margin-right: 16px;"
            >
              <el-option
                v-for="item in factoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="handleAdd">新增产品</el-button>
          </div>
        </div>
      </template>

      <el-table :data="productList" style="width: 100%" v-loading="loading">
        <el-table-column type="expand">
          <template #default="props">
            <el-form label-position="left" inline class="product-detail">
              <el-form-item label="产品描述">
                <span>{{ props.row.description }}</span>
              </el-form-item>
              <el-form-item label="材料规格">
                <span>{{ props.row.specifications }}</span>
              </el-form-item>
              <el-form-item label="包装方式">
                <span>{{ props.row.packaging }}</span>
              </el-form-item>
              <el-form-item label="认证信息">
                <el-tag
                  v-for="cert in props.row.certifications"
                  :key="cert"
                  style="margin-right: 8px"
                >
                  {{ cert }}
                </el-tag>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="产品ID" width="100" />
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="factoryName" label="生产工厂" />
        <el-table-column prop="category" label="产品类别" />
        <el-table-column prop="moq" label="最小订量" width="100" />
        <el-table-column prop="price" label="参考价格" width="120">
          <template #default="{ row }">
            {{ row.currency }} {{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '在售' : '停售' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" @click="handleQuote(row)">报价</el-button>
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
      :title="dialogType === 'add' ? '新增产品' : '编辑产品'"
      width="700px"
    >
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称" required>
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产工厂" required>
              <el-select v-model="form.factoryId" filterable>
                <el-option
                  v-for="item in factoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品类别">
              <el-cascader
                v-model="form.category"
                :options="categoryOptions"
                :props="{ checkStrictly: true }"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最小订量">
              <el-input-number v-model="form.moq" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="参考价格">
              <el-input v-model="form.price">
                <template #prepend>
                  <el-select v-model="form.currency" style="width: 80px">
                    <el-option label="USD" value="USD" />
                    <el-option label="CNY" value="CNY" />
                    <el-option label="EUR" value="EUR" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status">
                <el-option label="在售" value="active" />
                <el-option label="停售" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="产品描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产品详细描述"
          />
        </el-form-item>

        <el-form-item label="材料规格">
          <el-input
            v-model="form.specifications"
            type="textarea"
            :rows="2"
            placeholder="请输入材料规格信息"
          />
        </el-form-item>

        <el-form-item label="包装方式">
          <el-input
            v-model="form.packaging"
            type="textarea"
            :rows="2"
            placeholder="请输入包装方式信息"
          />
        </el-form-item>

        <el-form-item label="认证信息">
          <el-select
            v-model="form.certifications"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入认证信息"
          >
            <el-option label="CE" value="CE" />
            <el-option label="RoHS" value="RoHS" />
            <el-option label="FCC" value="FCC" />
            <el-option label="ISO9001" value="ISO9001" />
          </el-select>
        </el-form-item>

        <el-form-item label="产品图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref('add')
const selectedFactory = ref('')

// 模拟工厂选项数据
const factoryOptions = [
  { value: '1', label: '工厂A' },
  { value: '2', label: '工厂B' },
  { value: '3', label: '工厂C' }
]

// 模拟产品类别数据
const categoryOptions = [
  {
    value: 'electronics',
    label: '电子产品',
    children: [
      { value: 'computer', label: '计算机' },
      { value: 'mobile', label: '手机' },
      { value: 'accessories', label: '配件' }
    ]
  },
  {
    value: 'clothing',
    label: '服装',
    children: [
      { value: 'men', label: '男装' },
      { value: 'women', label: '女装' },
      { value: 'children', label: '童装' }
    ]
  }
]

// 模拟产品列表数据
const productList = ref([
  {
    id: '1',
    name: '示例产品A',
    factoryName: '工厂A',
    category: ['electronics', 'accessories'],
    moq: 1000,
    price: '10.50',
    currency: 'USD',
    status: 'active',
    description: '这是一个示例产品的详细描述...',
    specifications: '材料：塑料，尺寸：10x5x2cm',
    packaging: '独立包装，100个/箱',
    certifications: ['CE', 'RoHS']
  }
])

const form = reactive({
  id: '',
  name: '',
  factoryId: '',
  category: [],
  moq: 1000,
  price: '',
  currency: 'USD',
  status: 'active',
  description: '',
  specifications: '',
  packaging: '',
  certifications: []
})

onMounted(() => {
  const factoryId = route.query.factoryId
  if (factoryId) {
    selectedFactory.value = factoryId as string
    handleFactoryChange(factoryId as string)
  }
})

const handleFactoryChange = (factoryId: string) => {
  if (factoryId) {
    loading.value = true
    // 模拟加载数据
    setTimeout(() => {
      loading.value = false
    }, 1000)
  }
}

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.factoryId = selectedFactory.value
  form.category = []
  form.moq = 1000
  form.price = ''
  form.currency = 'USD'
  form.status = 'active'
  form.description = ''
  form.specifications = ''
  form.packaging = ''
  form.certifications = []
}

const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除产品 ${row.name} 吗？`,
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

const handleQuote = (row: any) => {
  router.push(`/quotation/create?productId=${row.id}`)
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
.product-info {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
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

.product-detail {
  padding: 20px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 32px;
  margin-bottom: 16px;
}

:deep(.el-select),
:deep(.el-cascader) {
  width: 100%;
}

:deep(.el-input-number) {
  width: 100%;
}
</style> 