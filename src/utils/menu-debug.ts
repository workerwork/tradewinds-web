// 菜单调试工具
export const debugMenuStructure = (menus: any[], level = 0) => {
    const indent = '  '.repeat(level);

    console.log(`${indent}=== 菜单层级 ${level} ===`);
    console.log(`${indent}菜单数量: ${menus.length}`);

    menus.forEach((menu, index) => {
        console.log(`${indent}菜单 ${index + 1}:`, {
            id: menu.id,
            name: menu.name,
            title: menu.title,
            path: menu.path,
            parentId: menu.parentId,
            visible: menu.visible,
            hasChildren: !!(menu.children && menu.children.length > 0),
            childrenCount: menu.children ? menu.children.length : 0
        });

        // 如果有子菜单，递归调试
        if (menu.children && menu.children.length > 0) {
            debugMenuStructure(menu.children, level + 1);
        }
    });
};

// 检查菜单数据是否包含三级菜单
export const checkMultiLevelMenus = (menus: any[]) => {
    let maxLevel = 0;

    const checkLevel = (menuList: any[], currentLevel = 0) => {
        maxLevel = Math.max(maxLevel, currentLevel);

        menuList.forEach(menu => {
            if (menu.children && menu.children.length > 0) {
                checkLevel(menu.children, currentLevel + 1);
            }
        });
    };

    checkLevel(menus);

    console.log('菜单层级检查结果:', {
        最大层级: maxLevel + 1, // +1 因为从0开始计算
        是否有三级菜单: maxLevel >= 2,
        菜单总数: countAllMenus(menus)
    });

    return maxLevel + 1;
};

// 计算菜单总数
export const countAllMenus = (menus: any[]): number => {
    let count = 0;

    const countMenus = (menuList: any[]) => {
        menuList.forEach(menu => {
            count++;
            if (menu.children && menu.children.length > 0) {
                countMenus(menu.children);
            }
        });
    };

    countMenus(menus);
    return count;
};

// 菜单数据规范化函数
export const normalizeMenuData = (menus: any[]): any[] => {
    return menus.map(menu => {
        const normalizedMenu = {
            ...menu,
            // 确保所有菜单都有统一的children结构
            children: menu.children || [],
            // 确保visible属性存在
            visible: menu.visible !== false,
            // 确保meta属性存在
            meta: {
                hidden: false,
                ...menu.meta
            }
        };

        // 递归规范化子菜单
        if (normalizedMenu.children.length > 0) {
            normalizedMenu.children = normalizeMenuData(normalizedMenu.children);
        }

        return normalizedMenu;
    });
};

// 检查菜单样式一致性
export const checkMenuStyleConsistency = (menus: any[], level = 0) => {
    const issues: string[] = [];

    menus.forEach((menu, index) => {
        // 检查同级菜单的数据结构一致性
        const hasChildren = !!(menu.children && menu.children.length > 0);
        const isVisible = menu.visible !== false;
        const hasPath = !!menu.path;
        const hasComponent = !!menu.component;

        console.log(`层级 ${level} - 菜单 "${menu.name}" 结构分析:`, {
            索引: index,
            有子菜单: hasChildren,
            可见: isVisible,
            有路径: hasPath,
            有组件: hasComponent,
            渲染类型: hasChildren ? 'el-sub-menu' : 'el-menu-item',
            应用CSS类: `menu-level-${level}`
        });

        // 递归检查子菜单
        if (hasChildren) {
            const childIssues = checkMenuStyleConsistency(menu.children, level + 1);
            issues.push(...childIssues);
        }
    });

    if (level === 0 && issues.length > 0) {
        console.warn('菜单样式一致性问题:', issues);
    }

    return issues;
};

// 查找同级菜单中的样式差异
export const findStyleDifferences = (menus: any[], level = 0) => {
    const sameLevel = menus.filter(menu => menu.visible !== false);

    if (sameLevel.length < 2) {
        return []; // 少于2个菜单，无需比较
    }

    const differences: any[] = [];

    for (let i = 0; i < sameLevel.length - 1; i++) {
        const menu1 = sameLevel[i];
        const menu2 = sameLevel[i + 1];

        const menu1HasChildren = !!(menu1.children && menu1.children.length > 0);
        const menu2HasChildren = !!(menu2.children && menu2.children.length > 0);

        if (menu1HasChildren !== menu2HasChildren) {
            differences.push({
                level: level,
                menu1: { name: menu1.name, hasChildren: menu1HasChildren },
                menu2: { name: menu2.name, hasChildren: menu2HasChildren },
                issue: `"${menu1.name}" 和 "${menu2.name}" 在同一层级但渲染类型不同`
            });
        }
    }

    // 递归检查子菜单
    sameLevel.forEach(menu => {
        if (menu.children && menu.children.length > 0) {
            const childDiffs = findStyleDifferences(menu.children, level + 1);
            differences.push(...childDiffs);
        }
    });

    if (level === 0 && differences.length > 0) {
        console.warn('发现同级菜单样式差异:', differences);
    }

    return differences;
};

// 在浏览器控制台中暴露调试函数
if (typeof window !== 'undefined') {
    (window as any).debugMenus = debugMenuStructure;
    (window as any).checkMenuLevels = checkMultiLevelMenus;
} 