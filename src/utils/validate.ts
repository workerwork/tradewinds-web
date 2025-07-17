/**
 * 判断是否是外部链接
 * @param {string} path
 * @returns {boolean}
 */
export function isExternal(path: string): boolean {
    return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 验证用户名
 * @param {string} str
 * @returns {boolean}
 */
export function validUsername(str: string): boolean {
    return str.length >= 3 && str.length <= 20;
}

/**
 * 验证密码
 * @param {string} str
 * @returns {boolean}
 */
export function validPassword(str: string): boolean {
    return str.length >= 6;
}

/**
 * 验证手机号
 * @param {string} str
 * @returns {boolean}
 */
export function validPhone(str: string): boolean {
    return /^1[3-9]\d{9}$/.test(str);
}

/**
 * 验证邮箱
 * @param {string} str
 * @returns {boolean}
 */
export function validEmail(str: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
} 