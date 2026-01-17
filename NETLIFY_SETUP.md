# 🚀 Netlify 部署配置指南

## 当前状态

你已经成功在 Netlify 部署了项目！现在需要配置环境变量让功能正常工作。

---

## 📝 配置步骤

### 1. 进入项目设置

在 Netlify 网站上：

1. 找到你的项目（tshirt-design-extractor）
2. 点击左侧菜单的 **"Site configuration"** 或 **"Project configuration"**
3. 找到 **"Environment variables"** 部分

### 2. 添加环境变量

点击 **"Add a variable"** 或 **"Add environment variable"**，添加以下 4 个变量：

#### 变量 1: API 密钥
```
Key:   VUE_APP_REMOVE_BG_API_KEY
Value: jTJvBundp3dugXgiZyJPp82E
```

#### 变量 2: API 端点
```
Key:   VUE_APP_REMOVE_BG_API_ENDPOINT
Value: https://api.remove.bg/v1.0/removebg
```

#### 变量 3: 启用图案提取
```
Key:   VUE_APP_ENABLE_PATTERN_EXTRACTION
Value: true
```

#### 变量 4: 图案边距
```
Key:   VUE_APP_PATTERN_PADDING
Value: 20
```

### 3. 保存并重新部署

1. 点击 **"Save"** 保存所有环境变量
2. 回到项目主页
3. 点击 **"Deploys"** 标签
4. 点击 **"Trigger deploy"** → **"Deploy site"**
5. 等待 1-2 分钟完成部署

### 4. 测试网站

部署完成后：

1. 点击你的网站链接（类似 `https://xxx.netlify.app`）
2. 上传一张 T恤 图片
3. 点击"提取图案"
4. 检查是否成功移除背景

---

## ⚠️ 重要说明

### CORS 问题

Remove.bg API 支持跨域请求，所以直接从浏览器调用 API 是可以的。

但是这意味着：
- ✅ 部署简单，无需额外配置
- ⚠️ API 密钥会暴露在前端代码中
- ⚠️ 任何人都可以查看你的 API 密钥

### 安全建议

1. **监控 API 使用量**
   - 登录 Remove.bg 账号
   - 查看 API 调用次数
   - 设置使用限制

2. **定期更换密钥**
   - 如果发现异常使用
   - 立即更换 API 密钥
   - 更新 Netlify 环境变量

3. **升级方案（可选）**
   - 使用 Netlify Functions 创建后端代理
   - 隐藏 API 密钥在服务器端
   - 需要额外的开发工作

---

## 🔍 故障排除

### 问题 1: 上传图片后提示"服务暂不可用"

**可能原因**：
- 环境变量未配置
- 环境变量名称错误
- 未重新部署

**解决方法**：
1. 检查环境变量是否正确添加
2. 确保变量名以 `VUE_APP_` 开头
3. 重新部署网站

### 问题 2: 控制台显示 CORS 错误

**可能原因**：
- API 端点配置错误
- Remove.bg API 暂时不可用

**解决方法**：
1. 检查 `VUE_APP_REMOVE_BG_API_ENDPOINT` 是否为：
   ```
   https://api.remove.bg/v1.0/removebg
   ```
2. 访问 https://www.remove.bg/api 检查 API 状态

### 问题 3: API 密钥无效

**可能原因**：
- 密钥输入错误
- 密钥已过期或被禁用

**解决方法**：
1. 登录 Remove.bg 账号
2. 检查 API 密钥状态
3. 如需要，生成新密钥并更新环境变量

### 问题 4: 页面空白或加载失败

**可能原因**：
- 构建失败
- JavaScript 错误

**解决方法**：
1. 在 Netlify 查看部署日志
2. 检查是否有构建错误
3. 打开浏览器控制台查看错误信息

---

## 📊 查看部署日志

如果遇到问题：

1. 进入 Netlify 项目
2. 点击 **"Deploys"** 标签
3. 点击最新的部署记录
4. 查看 **"Deploy log"** 了解详细信息

---

## 🎉 完成！

配置完成后，你的 T恤图案提取工具就可以正常使用了！

分享你的网站链接给朋友试试吧！🚀

