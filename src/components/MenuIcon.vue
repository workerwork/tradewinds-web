<template>
  <el-icon v-if="iconComponent" :size="size">
    <component :is="iconComponent" />
  </el-icon>
  <el-icon v-else :size="size">
    <Document />
  </el-icon>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { 
  Document,
  House,
  DataLine,
  Coordinate,
  Monitor,
  User,
  Bell,
  InfoFilled,
  Goods,
  List,
  Setting,
  UserFilled,
  Lock,
  OfficeBuilding,
  Warning,
  Star,
  Calendar,
  Connection,
  TrendCharts,
  Collection,
  Download,
  Folder,
  SetUp,
  Menu,
  Timer,
  Tools,
  View,
  Key,
  Grid,
  Files,
  Cpu,
  Money,
  Shop,
  Promotion,
  Management,
  HelpFilled,
  Service,
  Platform,
  Operation,
  Top,
  Bottom,
  Right,
  Plus,
  Delete,
  Edit,
  Search,
  Refresh,
  Close,
  Check,
  More,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from '@element-plus/icons-vue';

interface Props {
  icon?: string;
  size?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  size: ''
});

// 图标映射表
const iconMap: Record<string, any> = {
  // Element Plus 原始图标名
  House,
  DataLine,
  Coordinate,
  Monitor,
  User,
  Bell,
  InfoFilled,
  Goods,
  List,
  Setting,
  UserFilled,
  Lock,
  OfficeBuilding,
  Warning,
  Star,
  Calendar,
  Connection,
  TrendCharts,
  Collection,
  Download,
  Folder,
  SetUp,
  Menu,
  Timer,
  Document,
  Tools,
  View,
  Key,
  Grid,
  Files,
  Cpu,
  Money,
  Shop,
  Promotion,
  Management,
  HelpFilled,
  Service,
  Platform,
  Operation,
  Top,
  Bottom,
  Right,
  Plus,
  Delete,
  Edit,
  Search,
  Refresh,
  Close,
  Check,
  More,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  
  // 常用别名映射（支持不同命名格式）
  'house': House,
  'home': House,
  'dashboard': DataLine,
  'data-line': DataLine,
  'coordinate': Coordinate,
  'location': Coordinate,
  'monitor': Monitor,
  'system': Monitor,
  'user': User,
  'users': User,
  'bell': Bell,
  'notification': Bell,
  'info': InfoFilled,
  'goods': Goods,
  'product': Goods,
  'list': List,
  'table': List,
  'setting': Setting,
  'settings': Setting,
  'config': Setting,
  'user-filled': UserFilled,
  'profile': UserFilled,
  'lock': Lock,
  'security': Lock,
  'office-building': OfficeBuilding,
  'building': OfficeBuilding,
  'warning': Warning,
  'alert': Warning,
  'star': Star,
  'favorite': Star,
  'calendar': Calendar,
  'date': Calendar,
  'connection': Connection,
  'network': Connection,
  'trend-charts': TrendCharts,
  'chart': TrendCharts,
  'analytics': TrendCharts,
  'collection': Collection,
  'folder': Folder,
  'directory': Folder,
  'download': Download,
  'backup': Download,
  'setup': SetUp,
  'tools': Tools,
  'tool': Tools,
  'maintenance': Tools,
  'menu': Menu,
  'navigation': Menu,
  'timer': Timer,
  'time': Timer,
  'super-admin': Star, // 使用星形图标代替
  'crown': Star, // 皇冠图标用星形代替
  'admin': Management,
  'board': Grid,
  'operation': Operation,
  'ops': Operation,
  'view': View,
  'eye': View,
  'key': Key,
  'password': Key,
  'grid': Grid,
  'layout': Grid,
  'files': Files,
  'file': Files,
  'document': Document,
  'cpu': Cpu,
  'performance': Cpu,
  'money': Money,
  'finance': Money,
  'shop': Shop,
  'store': Shop,
  'promotion': Promotion,
  'marketing': Promotion,
  'management': Management,
  'manage': Management,
  'help': HelpFilled,
  'support': HelpFilled,
  'service': Service,
  'customer-service': Service,
  'platform': Platform,
  'system-platform': Platform,
  'edit': Edit,
  'search': Search,
  'refresh': Refresh,
  'delete': Delete,
  'add': Plus,
  'plus': Plus,
  'check': Check,
  'more': More,
  
  // 业务特定图标映射
  'role': UserFilled,
  'customer': User,
  'track': Calendar,
  'order': List
};

// 计算图标组件
const iconComponent = computed(() => {
  if (!props.icon) {
    return Document;
  }
  
  // 支持多种格式
  const iconName = props.icon.toLowerCase().trim();
  
  // 先尝试直接匹配
  if (iconMap[props.icon]) {
    return iconMap[props.icon];
  }
  
  // 再尝试小写匹配
  if (iconMap[iconName]) {
    return iconMap[iconName];
  }
  
  // 尝试转换连字符格式
  const kebabCase = iconName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  if (iconMap[kebabCase]) {
    return iconMap[kebabCase];
  }
  
  // 默认返回文档图标
  return Document;
});
</script> 