const fs = require('fs');
const path = require('path');

const files = [
    'src/views/system/user/index.vue',
    'src/views/system/tools/task.vue',
    'src/views/system/permission/index.vue',
    'src/views/system/menu/index.vue',
    'src/views/system/monitor/logs.vue',
    'src/views/system/config/menu.vue',
    'src/api/product/index.ts',
    'src/api/system/user.ts',
    'src/api/system/role.ts',
    'src/api/system/log.ts',
    'src/api/order/index.ts',
    'src/api/customer/index.ts'
];

function updateFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 替换导入语句
    content = content.replace(
        /import\s*{\s*(get|post|put|del)(?:\s*,\s*(get|post|put|del))*\s*}\s*from\s*['"]@\/utils\/request['"]/g,
        'import { request } from \'@/utils/request\''
    );

    // 替换方法调用
    content = content.replace(/\bget\(/g, 'request.get(');
    content = content.replace(/\bpost\(/g, 'request.post(');
    content = content.replace(/\bput\(/g, 'request.put(');
    content = content.replace(/\bdel\(/g, 'request.del(');

    // 修复参数格式
    content = content.replace(/request\.get\(([^,\)]+),\s*([^,\)]+)\)/g, 'request.get($1, { params: $2 })');

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${filePath}`);
}

files.forEach(updateFile);
console.log('All files updated successfully!'); 