-- 系统基本信息配置
INSERT INTO sys_config (param_name, param_key, param_value, type, status, remark) VALUES 
('系统名称', 'sys.name', 'AiMan管理系统', 'Y', '0', '系统名称'),
('系统版本', 'sys.version', '1.0.0', 'Y', '0', '系统版本号'),
('系统Logo', 'sys.logo', 'https://example.com/logo.png', 'Y', '0', '系统Logo图片地址'),
('系统描述', 'sys.description', 'AiMan是一个基于Tauri的现代化管理系统', 'Y', '0', '系统描述'),
('系统页脚', 'sys.footer', 'Copyright © 2024 AiMan', 'Y', '0', '系统页脚版权信息'),
('系统主题', 'sys.theme', 'light', 'Y', '0', '系统主题(light/dark)'),

-- 系统功能配置
('开启注册', 'sys.register.enabled', 'true', 'Y', '0', '是否开启用户注册功能'),
('开启验证码', 'sys.captcha.enabled', 'true', 'Y', '0', '是否开启验证码功能'),
('会话超时时间', 'sys.session.timeout', '1800', 'Y', '0', '会话超时时间(秒)'),
('密码最小长度', 'sys.password.minLength', '6', 'Y', '0', '密码最小长度'),
('密码复杂度要求', 'sys.password.complexity', 'medium', 'Y', '0', '密码复杂度(low/medium/high)'),
('上传文件大小限制', 'sys.upload.maxSize', '10', 'Y', '0', '上传文件大小限制(MB)'),
('允许上传的文件类型', 'sys.upload.allowTypes', 'jpg,jpeg,png,gif,doc,docx,xls,xlsx,pdf', 'Y', '0', '允许上传的文件类型'),

-- 业务配置
('每页显示记录数', 'sys.page.size', '10', 'Y', '0', '默认的分页大小'),
('数据列表显示操作列', 'sys.table.showActions', 'true', 'Y', '0', '数据列表是否显示操作列'),
('数据列表显示复选框', 'sys.table.showCheckbox', 'true', 'Y', '0', '数据列表是否显示复选框'),
('数据列表显示序号', 'sys.table.showIndex', 'true', 'Y', '0', '数据列表是否显示序号'),

-- 日志配置
('操作日志保存天数', 'sys.log.keepDays', '30', 'Y', '0', '操作日志保存天数'),
('登录日志保存天数', 'sys.loginLog.keepDays', '90', 'Y', '0', '登录日志保存天数'); 