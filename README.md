# T恤图案提取工具 (T-shirt Design Extractor)

一个基于Vue.js的Web应用，用于自动提取T恤产品照片中的图案设计，并生成透明背景的平面设计图。

## ✨ 功能特性

- 📤 **图片上传** - 支持拖放和文件选择，支持JPG、PNG、WebP格式
- 🎨 **智能提取** - 使用AI技术自动识别并提取T恤上的图案
- 🔍 **对比查看** - 并排显示原始图片和提取结果
- 💾 **一键下载** - 下载PNG格式的透明背景设计图
- 📱 **响应式设计** - 完美适配桌面和移动设备
- ♿ **无障碍支持** - 支持键盘导航和屏幕阅读器

## 🚀 快速开始

### 前置要求

- Node.js 14.x 或更高版本
- npm 6.x 或更高版本

### 安装依赖

```bash
npm install
```

**注意**: 如果遇到依赖冲突，请参考 [INSTALL.md](./INSTALL.md) 获取详细的安装指南。

### 配置环境变量

1. 复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的Remove.bg API密钥：

```env
VUE_APP_REMOVE_BG_API_KEY=your_actual_api_key_here
```

#### 获取Remove.bg API密钥

1. 访问 [Remove.bg API](https://www.remove.bg/api)
2. 注册账号或登录
3. 在API页面获取你的API密钥
4. 免费账号每月有50次免费调用额度

### 开发模式运行

```bash
npm run serve
```

应用将在 `http://localhost:8080` 启动

### 生产构建

```bash
npm run build
```

构建文件将输出到 `dist/` 目录

### 代码检查和修复

```bash
npm run lint
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行属性测试
npm run test:properties

# 查看测试覆盖率
npm run test:coverage
```

## 📖 使用说明

### 基本流程

1. **上传图片** - 点击上传区域或拖放T恤图片
2. **提取图案** - 点击"提取图案"按钮开始处理
3. **查看结果** - 对比原始图片和提取的图案
4. **下载图案** - 点击"下载图案"按钮保存PNG文件

### 键盘快捷键

- `Escape` - 重置应用到初始状态
- `Enter` - 开始处理图片（当图片已上传时）
- `R` - 重试失败的操作（当有可重试的错误时）

### 文件要求

- **支持格式**：JPG、PNG、WebP
- **最大文件大小**：10MB
- **推荐分辨率**：1000x1000 到 3000x3000 像素

## 🏗️ 技术栈

- **前端框架**：Vue.js 2 (Options API)
- **图像处理**：Canvas API, HTML5 File API
- **背景移除**：Remove.bg API
- **HTTP客户端**：Axios
- **测试框架**：Jest, @vue/test-utils
- **属性测试**：fast-check

## 📁 项目结构

```
src/
├── assets/
│   └── styles/
│       └── global.css          # 全局样式
├── components/
│   ├── ImageUploader.vue       # 图片上传组件
│   ├── ImageProcessor.vue      # 图片处理组件
│   ├── ImageComparison.vue     # 图片对比组件
│   ├── DownloadButton.vue      # 下载按钮组件
│   └── ErrorBoundary.vue       # 错误边界组件
├── services/
│   ├── ImageProcessorService.js    # 图像处理服务
│   ├── BackgroundRemovalAPI.js     # 背景移除API服务
│   ├── CanvasUtility.js            # Canvas工具类
│   ├── DownloadManager.js          # 下载管理器
│   └── ErrorRecovery.js            # 错误恢复服务
├── utils/
│   └── validation.js           # 文件验证工具
├── constants.js                # 常量定义
├── App.vue                     # 主应用组件
└── main.js                     # 应用入口
```

## 🔧 配置选项

所有配置选项都可以在 `.env` 文件中设置：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VUE_APP_REMOVE_BG_API_KEY` | Remove.bg API密钥 | 必填 |
| `VUE_APP_REMOVE_BG_API_ENDPOINT` | API端点 | `https://api.remove.bg/v1.0/removebg` |
| `VUE_APP_MAX_FILE_SIZE` | 最大文件大小（字节） | `10485760` (10MB) |
| `VUE_APP_COMPRESSION_THRESHOLD` | 压缩阈值（像素） | `2000` |
| `VUE_APP_MAX_COMPRESSED_WIDTH` | 压缩后最大宽度 | `1500` |
| `VUE_APP_API_TIMEOUT` | API超时时间（毫秒） | `30000` |
| `VUE_APP_DEBUG` | 调试模式 | `false` |

## 🐛 故障排除

### API调用失败

- 检查 `.env` 文件中的API密钥是否正确
- 确认API配额是否用完（免费账号每月50次）
- 检查网络连接是否正常

### 图片上传失败

- 确认文件格式为JPG、PNG或WebP
- 检查文件大小是否超过10MB
- 尝试使用其他图片

### 处理速度慢

- 大图片会自动压缩，但仍需要时间上传到API
- 建议使用分辨率在2000x2000以下的图片
- 检查网络速度

## 📝 开发指南

### 添加新功能

1. 在 `src/components/` 创建新组件
2. 在 `src/services/` 添加业务逻辑
3. 更新 `App.vue` 集成新功能
4. 编写单元测试和属性测试

### 代码规范

- 使用ESLint进行代码检查
- 遵循Vue.js风格指南
- 组件使用Options API
- 添加JSDoc注释

### 测试要求

- 单元测试覆盖率 ≥ 80%
- 核心业务逻辑覆盖率 ≥ 90%
- 所有属性测试至少运行100次迭代

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📮 联系方式

如有问题或建议，请提交Issue。

---

使用AI技术自动提取图案 · 支持JPG、PNG、WebP格式
