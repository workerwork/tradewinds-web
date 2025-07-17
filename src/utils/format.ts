/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param dateTime 日期时间字符串、Date对象或时间戳
 * @param format 格式类型：'datetime' | 'date' | 'time'
 * @returns 格式化后的字符串
 */
export const formatDateTime = (
    dateTime: string | Date | number | null | undefined,
    format: 'datetime' | 'date' | 'time' = 'datetime'
): string => {
    if (!dateTime) return '--';

    try {
        let date: Date;
        if (dateTime instanceof Date) {
            date = dateTime;
        } else if (typeof dateTime === 'number') {
            // 处理时间戳（毫秒）
            // 如果是秒级时间戳，转换为毫秒级
            date = new Date(dateTime * (dateTime < 10000000000 ? 1000 : 1));
        } else if (typeof dateTime === 'string') {
            // 尝试解析字符串日期
            if (/^\d+$/.test(dateTime)) {
                // 如果是纯数字字符串，当作时间戳处理
                const timestamp = parseInt(dateTime);
                date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
            } else {
                // 尝试直接解析日期字符串
                date = new Date(dateTime);
            }
        } else {
            return '--';
        }

        if (isNaN(date.getTime())) return '--';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        switch (format) {
            case 'date':
                return `${year}-${month}-${day}`;
            case 'time':
                return `${hours}:${minutes}:${seconds}`;
            case 'datetime':
            default:
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
    } catch (error) {
        console.warn('时间格式化失败:', {
            输入值: dateTime,
            输入类型: typeof dateTime,
            错误信息: error
        });
        return '--';
    }
};

/**
 * 格式化相对时间（如：2小时前、3天前）
 * @param dateTime 日期时间
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (dateTime: string | Date | null | undefined): string => {
    if (!dateTime) return '--';

    try {
        const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
        if (isNaN(date.getTime())) return '--';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) return `${years}年前`;
        if (months > 0) return `${months}个月前`;
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        if (seconds > 0) return `${seconds}秒前`;
        return '刚刚';
    } catch (error) {
        console.warn('相对时间格式化失败:', dateTime, error);
        return '--';
    }
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
    if (bytes === null || bytes === undefined || bytes < 0) return '--';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number | null | undefined, decimals: number = 0): string => {
    if (num === null || num === undefined || isNaN(num)) return '--';

    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币符号
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (amount: number | null | undefined, currency: string = '¥'): string => {
    if (amount === null || amount === undefined || isNaN(amount)) return '--';

    return `${currency}${formatNumber(amount, 2)}`;
};

/**
 * 格式化百分比
 * @param value 数值（0-1之间或0-100之间）
 * @param isDecimal 是否为小数（true表示0-1之间，false表示0-100之间）
 * @returns 格式化后的百分比字符串
 */
export const formatPercentage = (value: number | null | undefined, isDecimal: boolean = true): string => {
    if (value === null || value === undefined || isNaN(value)) return '--';

    const percentage = isDecimal ? value * 100 : value;
    return `${percentage.toFixed(1)}%`;
};

/**
 * 截断文本
 * @param text 文本内容
 * @param maxLength 最大长度
 * @param suffix 后缀
 * @returns 截断后的文本
 */
export const truncateText = (text: string | null | undefined, maxLength: number = 50, suffix: string = '...'): string => {
    if (!text) return '--';

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength - suffix.length) + suffix;
}; 