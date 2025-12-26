/**
 * 文件上传工具函数
 */

/**
 * 创建 FormData 并添加文件
 * @param file 要上传的文件
 * @param fieldName 字段名称，默认为 'file'
 * @returns FormData 实例
 */
export function createFormData(file: File, fieldName: string = 'file'): FormData {
  const formData = new FormData();
  formData.append(fieldName, file);
  return formData;
}

/**
 * 文件上传请求配置
 */
export const FILE_UPLOAD_CONFIG = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
} as const;
