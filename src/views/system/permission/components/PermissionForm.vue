<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="权限名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入权限名称" />
    </el-form-item>
    <el-form-item label="父权限" prop="parentId">
      <el-tree-select
        v-model="form.parentId"
        :data="parentOptions"
        :props="{ label: 'name', value: 'id', children: 'children', disabled: 'disabled' }"
        placeholder="请选择父权限"
        check-strictly
        clearable
        :filterable="true"
        :disabled="isEdit && !form.id"
        :default-expand-all="true"
        :render-after-expand="false"
        :node-key="'id'"
        :show-checkbox="false"
        :highlight-current="true"
        :expand-on-click-node="false"
      />
    </el-form-item>
    <el-form-item label="权限编码" prop="code">
      <el-input 
        v-model="form.code" 
        placeholder="请输入权限编码"
        :disabled="props.isEdit"
      />
    </el-form-item>
    <el-form-item label="权限类型" prop="type">
      <el-select v-model="form.type" style="width: 100%">
        <el-option label="菜单" value="menu" />
        <el-option label="按钮" value="button" />
        <el-option label="API" value="api" />
      </el-select>
    </el-form-item>
    <el-form-item label="路由路径" prop="path">
      <el-input v-model="form.path" placeholder="如 /system/permission，仅菜单权限填写" />
    </el-form-item>
    <el-form-item label="组件路径" prop="component">
      <el-input v-model="form.component" placeholder="如 @/views/system/permission/index.vue，仅菜单权限填写" />
    </el-form-item>
    <el-form-item label="图标" prop="icon">
      <el-select v-model="form.icon" placeholder="请选择图标" filterable style="width: 100%">
        <el-option v-for="(comp, key) in iconMap" :key="key" :label="key" :value="key">
          <el-icon style="margin-right: 8px;"><component :is="comp" /></el-icon>
          <span>{{ key }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="排序" prop="sort">
      <el-input-number v-model="form.sort" :min="0" :max="999" style="width: 100%" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-switch
        v-model="form.status"
        :active-value="0"
        :inactive-value="1"
        active-text="启用"
        inactive-text="禁用"
      />
    </el-form-item>
    <el-form-item label="描述" prop="description">
      <el-input
        v-model="form.description"
        type="textarea"
        placeholder="请输入描述"
        :rows="3"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { User, Menu, HomeFilled, Setting, Lock, Bell, Folder, Document, Edit, Delete, Star, Warning, InfoFilled, Tools, DataAnalysis, Monitor, PieChart, Tickets, Message, ChatLineRound, Calendar, Collection, Connection, Upload, Download, Link, Compass, Flag, Key, List, Location, Notification, OfficeBuilding, Postcard, Promotion, QuestionFilled, Reading, RefreshRight, School, Service, Shop, ShoppingCart, Stopwatch, Suitcase, SwitchButton, Timer, TrendCharts, Trophy, UploadFilled, UserFilled, Van, VideoCamera, Wallet, ZoomIn, ZoomOut } from '@element-plus/icons-vue';

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

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  parentOptions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

// 表单引用
const formRef = ref<FormInstance>();

// 表单数据
const form = reactive({
  id: '',
  name: '',
  code: '',
  type: 'menu',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 0,
  description: '',
  parentId: '' // 新增父权限ID
});

// 监听 props.modelValue 变化，更新表单数据
const updateForm = () => {
  if (props.modelValue) {
    Object.assign(form, {
      ...props.modelValue,
      // 新增时如果type为空，强制设为'menu'，否则用后端返回的type
      type: props.modelValue.type !== undefined && props.modelValue.type !== null && props.modelValue.type !== ''
        ? props.modelValue.type
        : 'menu',
      // status始终为数字类型
      status: Number(props.modelValue.status ?? 0),
      // parentId始终为字符串类型
      parentId: String(props.modelValue.parentId ?? '')
    });
  }
};

// 初始化表单
updateForm();

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-z_]+:[a-z_]+$/, message: '格式为 module:action，允许下划线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    { required: false, message: '请输入路由路径', trigger: 'blur' }
  ],
  component: [
    { required: false, message: '请输入组件路径', trigger: 'blur' }
  ],
  icon: [
    { required: false, message: '请选择图标', trigger: 'change' }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  parentId: [
    { required: false, message: '请选择父权限', trigger: 'change' }
  ]
});

// 表单验证
const validate = async () => {
  if (!formRef.value) return false;
  return formRef.value.validate();
};

// 重置表单
const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

// 暴露方法给父组件
defineExpose({
  formRef,
  form,
  validate,
  resetForm,
  updateForm
});

// 监听表单变化，更新 modelValue，保证 parentId 字段一定存在且为 null
watch(form, (newVal) => {
  let parentId = newVal.parentId;
  if (parentId === '' || parentId === undefined || parentId === 0 || parentId === '0') {
    parentId = null;
  }
  // 明确传递 parentId 字段
  const emitObj = { ...newVal, parentId };
  // 防止 parentId 被删除
  if (!('parentId' in emitObj)) emitObj.parentId = null;
  emit('update:modelValue', emitObj);
}, { deep: true });

// 监听 props.modelValue 变化，更新表单数据
watch(() => props.modelValue, updateForm, { immediate: true, deep: true });

// 禁用自身和所有子节点作为父权限
function isSelfOrDescendant(node) {
  if (!form.id) return false;
  if (node.id === form.id) return true;
  // 递归判断是否为自身的子节点
  function isDescendant(nodes) {
    if (!nodes) return false;
    for (const n of nodes) {
      if (n.id === form.id) return true;
      if (n.children && isDescendant(n.children)) return true;
    }
    return false;
  }
  return isDescendant(node.children);
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 