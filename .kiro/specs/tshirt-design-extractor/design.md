# Design Document: T恤图案提取和转换工具

## Overview

T恤图案提取和转换工具是一个基于Vue.js的单页应用（SPA），利用现代Web技术和AI服务实现自动化图案提取。系统采用前端为主的架构，通过集成第三方背景移除API（如remove.bg、Cloudinary AI或类似服务）来实现智能图像处理。

核心工作流程：
1. 用户通过拖放或文件选择器上传T恤产品图片
2. 前端验证图片格式和大小
3. 使用Canvas API进行图像预处理（如压缩、格式转换）
4. 调用背景移除服务API提取图案
5. 在Canvas上渲染提取结果，生成透明背景的设计图
6. 并排显示原始图片和提取结果
7. 提供PNG格式下载功能

技术栈：
- **前端框架**: Vue.js 2 (Options API)
- **图像处理**: Canvas API, HTML5 File API
- **背景移除**: Remove.bg API 或 Cloudinary AI Background Removal
- **UI组件**: 原生Vue组件（轻量级实现）
- **状态管理**: Vuex 或 Vue实例data
- **HTTP客户端**: Axios

## Architecture

### 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Vue.js Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Upload     │  │   Image      │  │   Display    │      │
│  │  Component   │  │  Processor   │  │  Component   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  State Manager  │                        │
│                   │  (Composition)  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Canvas Utility │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────┐
                    │  Background Removal │
                    │     API Service     │
                    └─────────────────────┘
```

### 组件层次结构

```
App.vue
├── ImageUploader.vue
│   ├── 文件选择器
│   ├── 拖放区域
│   └── 预览区域
├── ImageProcessor.vue
│   ├── 处理控制按钮
│   ├── 加载状态指示器
│   └── 错误提示
├── ImageComparison.vue
│   ├── 原始图片显示
│   ├── 提取结果显示
│   └── 透明背景网格
└── DownloadButton.vue
    └── 下载控制
```

## Components and Interfaces

### 1. ImageUploader Component

**职责**: 处理用户图片上传，验证文件，显示预览

**Props**:
```javascript
props: {
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  acceptedFormats: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/webp']
  }
}
```

**Events**:
```javascript
// 'image-selected': (file, dataUrl)
// 'upload-error': (error)
```

**核心方法**:
- `validateFile(file)` - 验证文件类型和大小
- `handleFileSelect(event)` - 处理文件选择事件
- `handleDrop(event)` - 处理拖放事件
- `generatePreview(file)` - 生成预览DataURL

### 2. ImageProcessor Service

**职责**: 协调图像处理流程，调用背景移除API

**接口**:
```javascript
// ImageProcessorService
class ImageProcessorService {
  async processImage(imageFile) {
    // 返回 { originalDataUrl, extractedDataUrl, width, height, processingTime }
  }
  
  async compressImage(imageFile, maxWidth) {
    // 返回 Blob
  }
  
  async removeBackground(imageBlob) {
    // 返回 Blob
  }
}
```

**核心方法**:
- `processImage(imageFile)` - 主处理流程
- `compressImage(imageFile, maxWidth)` - 压缩大图片
- `removeBackground(imageBlob)` - 调用API移除背景
- `blobToDataUrl(blob)` - 转换为DataURL

### 3. BackgroundRemovalAPI Service

**职责**: 封装第三方背景移除API调用

**接口**:
```javascript
// BackgroundRemovalAPI
class BackgroundRemovalAPI {
  async removeBackground(imageBlob, options) {
    // options: { size, type, format }
    // 返回 Blob
  }
  
  async checkApiStatus() {
    // 返回 boolean
  }
}
```

**实现选项**:

**选项A: Remove.bg API**
```javascript
class RemoveBgService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.remove.bg/v1.0/removebg';
  }
  
  async removeBackground(imageBlob) {
    const formData = new FormData();
    formData.append('image_file', imageBlob);
    formData.append('size', 'auto');
    
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'X-Api-Key': this.apiKey },
      body: formData
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.blob();
  }
}
```

**选项B: Cloudinary AI Background Removal**
```javascript
class CloudinaryService {
  constructor(cloudName, uploadPreset) {
    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
  }
  
  async removeBackground(imageBlob) {
    // 上传到Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('transformation', 'e_background_removal');
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    // 获取处理后的图片
    const imageResponse = await fetch(data.secure_url);
    return await imageResponse.blob();
  }
}
```

### 4. CanvasUtility Service

**职责**: Canvas操作的工具函数集合

**接口**:
```javascript
// CanvasUtility
class CanvasUtility {
  loadImage(dataUrl) {
    // 返回 Promise<HTMLImageElement>
  }
  
  createCanvas(width, height) {
    // 返回 HTMLCanvasElement
  }
  
  imageToBlob(canvas, format) {
    // 返回 Promise<Blob>
  }
  
  resizeImage(image, maxWidth, maxHeight) {
    // 返回 HTMLCanvasElement
  }
  
  addTransparencyGrid(canvas) {
    // 添加透明背景网格
  }
}
```

**核心方法**:
```javascript
class CanvasUtilityImpl {
  loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
  
  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  
  imageToBlob(canvas, format = 'image/png') {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob conversion failed'));
      }, format);
    });
  }
  
  resizeImage(image, maxWidth, maxHeight) {
    let width = image.width;
    let height = image.height;
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }
}
```

### 5. DownloadManager Service

**职责**: 处理文件下载

**接口**:
```javascript
// DownloadManager
class DownloadManager {
  downloadImage(dataUrl, filename) {
    // 触发浏览器下载
  }
  
  generateFilename(prefix) {
    // 返回带时间戳的文件名
  }
}
```

**实现**:
```javascript
class DownloadManagerImpl {
  downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  generateFilename(prefix = 'extracted-design') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.png`;
  }
}
```

### 6. State Management

使用Vue 2的data和methods管理应用状态：

```javascript
// App.vue 或使用 Vuex
data() {
  return {
    // 上传状态
    uploadedFile: null,
    originalImageUrl: null,
    
    // 处理状态
    isProcessing: false,
    processingProgress: 0,
    
    // 结果状态
    extractedImageUrl: null,
    processedImage: null,
    
    // 错误状态
    error: null,
    
    // UI状态
    showComparison: false,
    isMobile: false
  };
},

methods: {
  async uploadImage(file) { /* ... */ },
  async processImage() { /* ... */ },
  downloadExtracted() { /* ... */ },
  reset() { /* ... */ }
}
```

## Data Models

### File Validation

```javascript
// ValidationResult
// {
//   isValid: boolean,
//   error: { code: string, message: string } | null
// }

const VALIDATION_RULES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};
```

### Processing State

```javascript
// ProcessingState 可以是以下之一:
// { status: 'idle' }
// { status: 'uploading', progress: number }
// { status: 'compressing' }
// { status: 'removing-background', progress: number }
// { status: 'rendering' }
// { status: 'complete', result: ProcessedImage }
// { status: 'error', error: AppError }

// AppError
// {
//   type: 'UPLOAD_ERROR' | 'PROCESSING_ERROR' | 'API_ERROR' | 'NETWORK_ERROR',
//   message: string,
//   details: string | null,
//   retryable: boolean
// }
```

### Image Metadata

```javascript
// ImageMetadata
// {
//   filename: string,
//   fileSize: number,
//   mimeType: string,
//   width: number,
//   height: number,
//   aspectRatio: number,
//   uploadedAt: Date
// }

// ProcessedImage
// {
//   original: {
//     dataUrl: string,
//     metadata: ImageMetadata
//   },
//   extracted: {
//     dataUrl: string,
//     metadata: ImageMetadata
//   },
//   processingTime: number,
//   apiCreditsUsed: number | null
// }
```

## Correctness Properties

*属性（Property）是指在系统所有有效执行中都应该成立的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*


### Property 1: 文件类型验证

*对于任何*文件输入，验证函数应该接受JPEG、PNG、WebP格式的文件，并拒绝所有其他格式的文件

**Validates: Requirements 1.2, 1.4**

### Property 2: 文件大小限制

*对于任何*文件输入，当文件大小超过10MB时，验证函数应该返回错误并阻止上传

**Validates: Requirements 1.3**

### Property 3: 预览生成

*对于任何*有效的图像文件，上传后应该生成一个有效的DataURL用于预览显示

**Validates: Requirements 1.5**

### Property 4: 状态转换一致性

*对于任何*处理流程（上传、处理、完成、错误），系统状态应该按照预期顺序转换，且每个状态都应该正确反映在UI状态标志中

**Validates: Requirements 1.6, 2.4, 2.6, 5.1**

### Property 5: PNG格式和透明度

*对于任何*提取的设计图，输出应该是PNG格式且包含完整的Alpha通道以支持透明度

**Validates: Requirements 2.3, 6.4**

### Property 6: 错误处理和恢复

*对于任何*处理失败的情况，系统应该设置错误状态、显示错误信息，并保持应用在可重试的状态

**Validates: Requirements 2.5, 5.2**

### Property 7: 宽高比保持

*对于任何*图像，在调整大小或缩放时，输出图像的宽高比应该与原始图像的宽高比相同（允许浮点误差范围内）

**Validates: Requirements 3.2**

### Property 8: 尺寸约束

*对于任何*需要缩放的图像，缩放后的宽度和高度都不应该超过指定的最大值，同时保持宽高比

**Validates: Requirements 3.3**

### Property 9: 下载按钮可见性

*对于任何*应用状态，下载按钮应该仅在提取的设计图可用时显示

**Validates: Requirements 4.1**

### Property 10: 下载文件格式

*对于任何*下载操作，生成的下载链接应该指向PNG格式的图像数据

**Validates: Requirements 4.2**

### Property 11: 文件名生成规则

*对于任何*下载操作，生成的文件名应该包含描述性前缀和时间戳，格式为 `prefix-YYYY-MM-DDTHH-MM-SS.png`

**Validates: Requirements 4.3**

### Property 12: 分辨率保持

*对于任何*图像处理操作（除了明确的压缩操作），输出图像的分辨率应该与输入图像的分辨率相同

**Validates: Requirements 4.5, 6.1**

### Property 13: 大文件压缩

*对于任何*宽度超过指定阈值（如2000px）的图像，在发送到API之前应该进行压缩处理

**Validates: Requirements 8.2**

### Property 14: 结果缓存

*对于任何*已处理的图像，如果使用相同的文件再次处理，系统应该返回缓存的结果而不是重新调用API

**Validates: Requirements 8.5**

## Error Handling

### 错误类型和处理策略

**1. 上传错误 (UPLOAD_ERROR)**
- **触发条件**: 文件类型无效、文件过大、文件损坏
- **处理策略**: 
  - 显示清晰的错误消息说明问题
  - 保持上传界面可用
  - 允许用户选择新文件
- **用户消息示例**: 
  - "文件类型不支持，请上传 JPG、PNG 或 WebP 格式的图片"
  - "文件太大，请上传小于 10MB 的图片"

**2. 处理错误 (PROCESSING_ERROR)**
- **触发条件**: Canvas操作失败、图像解码失败、内存不足
- **处理策略**:
  - 显示友好的错误消息
  - 提供重试按钮
  - 记录详细错误到控制台供调试
- **用户消息示例**: "图片处理失败，请重试或尝试其他图片"

**3. API错误 (API_ERROR)**
- **触发条件**: 
  - API密钥无效 (401)
  - API配额用尽 (429)
  - API服务不可用 (500, 503)
  - 图片内容不符合API要求 (400)
- **处理策略**:
  - 根据HTTP状态码提供具体指导
  - 对于临时错误（429, 503）提供重试选项
  - 对于永久错误（401）提示联系管理员
- **用户消息示例**:
  - "服务暂时不可用，请稍后重试"
  - "API配额已用完，请联系管理员"
  - "无法识别图片中的T恤图案，请尝试更清晰的照片"

**4. 网络错误 (NETWORK_ERROR)**
- **触发条件**: 网络连接中断、请求超时
- **处理策略**:
  - 显示网络问题提示
  - 提供重试按钮
  - 考虑实现自动重试（最多3次）
- **用户消息示例**: "网络连接失败，请检查网络后重试"

### 错误恢复流程

```javascript
// ErrorRecovery
class ErrorRecovery {
  // 错误发生时的清理操作
  cleanup() {
    // 清理临时资源
    // 重置处理状态
    // 保留原始上传的图片
  }
  
  // 判断错误是否可重试
  isRetryable(error) {
    return error.retryable && 
           (error.type === 'NETWORK_ERROR' || 
            error.type === 'API_ERROR');
  }
  
  // 重试逻辑（带指数退避）
  async retry(operation, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await operation();
        return;
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        // 指数退避: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }
  
  // 重置应用到初始状态
  reset() {
    // 清除所有状态
    // 返回到初始上传界面
  }
}
```

### 错误边界

在Vue 2中实现错误捕获：

```javascript
// ErrorBoundary.vue
export default {
  data() {
    return {
      error: null
    };
  },
  
  errorCaptured(err, vm, info) {
    this.error = err;
    console.error('Caught error:', err, info);
    // 阻止错误继续传播
    return false;
  }
};
```

### 日志和监控

```javascript
// ErrorLogger
class ErrorLogger {
  logError(error, context) {
    console.error('[ERROR]', {
      type: error.type,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      ...context
    });
    
    // 可选：发送到错误追踪服务（如Sentry）
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }
  
  logWarning(message, context) {
    console.warn('[WARNING]', {
      message,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
}
```

## Testing Strategy

### 测试方法概述

本项目采用**双重测试方法**，结合单元测试和基于属性的测试（Property-Based Testing, PBT）来确保全面的代码覆盖和正确性验证。

**单元测试**用于：
- 验证特定示例和边界情况
- 测试组件集成点
- 验证错误处理逻辑
- 测试UI交互的具体场景

**基于属性的测试**用于：
- 验证跨所有输入的通用属性
- 通过随机化实现全面的输入覆盖
- 发现边缘情况和意外行为
- 验证数学不变量和业务规则

两种方法是互补的：单元测试捕获具体的错误，而属性测试验证通用的正确性。

### 测试框架和工具

**测试框架**: Jest（Vue 2生态系统的标准选择）
- 成熟稳定的测试框架
- 与Vue 2完美集成
- 丰富的社区支持和插件

**属性测试库**: fast-check
- JavaScript/TypeScript的成熟PBT库
- 丰富的生成器和组合器
- 支持异步属性测试

**组件测试**: @vue/test-utils (Vue 2版本)
- Vue官方测试工具
- 支持组件挂载和交互测试

**Mock工具**: Jest内置mock功能
- Mock API调用
- Mock浏览器API（File, Canvas等）

### 测试配置

```javascript
// jest.config.js
module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue2-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json', 'vue'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 属性测试配置

每个属性测试必须：
- 运行至少**100次迭代**（由于随机化）
- 使用注释标签引用设计文档中的属性
- 标签格式: `// Feature: tshirt-design-extractor, Property N: [property text]`

示例：
```javascript
import fc from 'fast-check';
import { validateFileType } from '@/utils/validation';

describe('File Validation Properties', () => {
  // Feature: tshirt-design-extractor, Property 1: 文件类型验证
  it('should accept valid image formats and reject invalid ones', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('image/jpeg'),
          fc.constant('image/png'),
          fc.constant('image/webp'),
          fc.string() // 随机字符串作为无效类型
        ),
        (mimeType) => {
          const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
          const result = validateFileType(mimeType);
          
          if (validTypes.includes(mimeType)) {
            expect(result.isValid).toBe(true);
          } else {
            expect(result.isValid).toBe(false);
            expect(result.error.code).toBe('INVALID_TYPE');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 测试组织结构

```
tests/
├── unit/
│   ├── components/
│   │   ├── ImageUploader.spec.ts
│   │   ├── ImageProcessor.spec.ts
│   │   ├── ImageComparison.spec.ts
│   │   └── DownloadButton.spec.ts
│   ├── services/
│   │   ├── ImageProcessorService.spec.ts
│   │   ├── BackgroundRemovalAPI.spec.ts
│   │   ├── CanvasUtility.spec.ts
│   │   └── DownloadManager.spec.ts
│   └── composables/
│       └── useImageExtractor.spec.ts
├── properties/
│   ├── fileValidation.property.spec.ts
│   ├── imageProcessing.property.spec.ts
│   ├── stateManagement.property.spec.ts
│   └── download.property.spec.ts
└── integration/
    └── fullWorkflow.spec.ts
```

### 单元测试示例

**组件测试**:
```javascript
// tests/unit/components/ImageUploader.spec.js
import { mount } from '@vue/test-utils';
import ImageUploader from '@/components/ImageUploader.vue';

describe('ImageUploader Component', () => {
  it('should emit image-selected event when valid file is selected', async () => {
    const wrapper = mount(ImageUploader);
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    const input = wrapper.find('input[type="file"]');
    await input.trigger('change', {
      target: { files: [file] }
    });
    
    expect(wrapper.emitted('image-selected')).toBeTruthy();
    expect(wrapper.emitted('image-selected')[0]).toEqual([
      file,
      expect.any(String) // dataUrl
    ]);
  });
  
  it('should emit upload-error when file is too large', async () => {
    const wrapper = mount(ImageUploader, {
      propsData: { maxFileSize: 1024 } // 1KB
    });
    
    const largeFile = new File(['x'.repeat(2000)], 'large.jpg', { 
      type: 'image/jpeg' 
    });
    
    const input = wrapper.find('input[type="file"]');
    await input.trigger('change', {
      target: { files: [largeFile] }
    });
    
    expect(wrapper.emitted('upload-error')).toBeTruthy();
    const error = wrapper.emitted('upload-error')[0][0];
    expect(error.code).toBe('FILE_TOO_LARGE');
  });
});
```

**服务测试**:
```javascript
// tests/unit/services/CanvasUtility.spec.js
import { CanvasUtilityImpl } from '@/services/CanvasUtility';

describe('CanvasUtility Service', () => {
  let canvasUtil;
  
  beforeEach(() => {
    canvasUtil = new CanvasUtilityImpl();
  });
  
  it('should create canvas with specified dimensions', () => {
    const canvas = canvasUtil.createCanvas(800, 600);
    
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(canvas.tagName).toBe('CANVAS');
  });
  
  it('should resize image maintaining aspect ratio', () => {
    // 创建测试图像
    const img = new Image();
    img.width = 1000;
    img.height = 500;
    
    const canvas = canvasUtil.resizeImage(img, 500, 500);
    
    // 应该缩放到 500x250 以保持 2:1 的宽高比
    expect(canvas.width).toBe(500);
    expect(canvas.height).toBe(250);
  });
});
```

### 属性测试详细示例

**Property 2: 文件大小限制**
```javascript
// tests/properties/fileValidation.property.spec.js
import fc from 'fast-check';
import { validateFileSize } from '@/utils/validation';

describe('File Validation Properties', () => {
  // Feature: tshirt-design-extractor, Property 2: 文件大小限制
  it('should reject files larger than 10MB', () => {
    const MAX_SIZE = 10 * 1024 * 1024;
    
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 * 1024 * 1024 }), // 0-20MB
        (fileSize) => {
          const result = validateFileSize(fileSize, MAX_SIZE);
          
          if (fileSize > MAX_SIZE) {
            expect(result.isValid).toBe(false);
            expect(result.error.code).toBe('FILE_TOO_LARGE');
          } else {
            expect(result.isValid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 7: 宽高比保持**
```javascript
// tests/properties/imageProcessing.property.spec.js
import fc from 'fast-check';
import { CanvasUtilityImpl } from '@/services/CanvasUtility';

describe('Image Processing Properties', () => {
  // Feature: tshirt-design-extractor, Property 7: 宽高比保持
  it('should maintain aspect ratio when resizing images', () => {
    const canvasUtil = new CanvasUtilityImpl();
    
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 4000 }), // 原始宽度
        fc.integer({ min: 100, max: 4000 }), // 原始高度
        fc.integer({ min: 100, max: 2000 }), // 最大宽度
        fc.integer({ min: 100, max: 2000 }), // 最大高度
        (origWidth, origHeight, maxWidth, maxHeight) => {
          // 创建模拟图像
          const img = new Image();
          img.width = origWidth;
          img.height = origHeight;
          
          const canvas = canvasUtil.resizeImage(img, maxWidth, maxHeight);
          
          // 计算原始和结果的宽高比
          const originalRatio = origWidth / origHeight;
          const resultRatio = canvas.width / canvas.height;
          
          // 允许浮点误差
          const tolerance = 0.01;
          expect(Math.abs(originalRatio - resultRatio)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 8: 尺寸约束**
```typescript
// Feature: tshirt-design-extractor, Property 8: 尺寸约束
it('should not exceed maximum dimensions when resizing', () => {
  const canvasUtil = new CanvasUtilityImpl();
  
  fc.assert(
    fc.property(
      fc.integer({ min: 100, max: 5000 }),
      fc.integer({ min: 100, max: 5000 }),
      fc.integer({ min: 100, max: 1000 }),
      fc.integer({ min: 100, max: 1000 }),
      (origWidth, origHeight, maxWidth, maxHeight) => {
        const img = new Image();
        img.width = origWidth;
        img.height = origHeight;
        
        const canvas = canvasUtil.resizeImage(img, maxWidth, maxHeight);
        
        expect(canvas.width).toBeLessThanOrEqual(maxWidth);
        expect(canvas.height).toBeLessThanOrEqual(maxHeight);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property 11: 文件名生成规则**
```javascript
// tests/properties/download.property.spec.js
import fc from 'fast-check';
import { DownloadManagerImpl } from '@/services/DownloadManager';

describe('Download Properties', () => {
  // Feature: tshirt-design-extractor, Property 11: 文件名生成规则
  it('should generate filenames with prefix and timestamp', () => {
    const downloadManager = new DownloadManagerImpl();
    
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }), // 随机前缀
        (prefix) => {
          const filename = downloadManager.generateFilename(prefix);
          
          // 验证格式: prefix-YYYY-MM-DDTHH-MM-SS.png
          expect(filename).toMatch(new RegExp(`^${prefix}-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\.png$`));
          expect(filename).toContain(prefix);
          expect(filename).toEndWith('.png');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 14: 结果缓存**
```javascript
// Feature: tshirt-design-extractor, Property 14: 结果缓存
it('should return cached results for identical inputs', async () => {
  const processor = new ImageProcessorService();
  const mockApi = jest.fn().mockResolvedValue(new Blob());
  processor.setBackgroundRemovalApi(mockApi);
  
  await fc.assert(
    fc.asyncProperty(
      fc.uint8Array({ minLength: 100, maxLength: 1000 }), // 随机图像数据
      async (imageData) => {
        const file1 = new File([imageData], 'test.jpg', { type: 'image/jpeg' });
        const file2 = new File([imageData], 'test.jpg', { type: 'image/jpeg' });
        
        // 第一次处理
        await processor.processImage(file1);
        const firstCallCount = mockApi.mock.calls.length;
        
        // 第二次处理相同数据
        await processor.processImage(file2);
        const secondCallCount = mockApi.mock.calls.length;
        
        // API应该只被调用一次（使用缓存）
        expect(secondCallCount).toBe(firstCallCount);
      }
    ),
    { numRuns: 50 } // 异步测试可以减少迭代次数
  );
});
```

### Mock策略

**Mock背景移除API**:
```javascript
// tests/mocks/backgroundRemovalApi.mock.js
export const createMockBackgroundRemovalApi = () => ({
  removeBackground: jest.fn().mockImplementation(async (blob) => {
    // 返回模拟的透明PNG
    return new Blob(['mock-transparent-image'], { type: 'image/png' });
  }),
  checkApiStatus: jest.fn().mockResolvedValue(true)
});
```

**Mock Canvas API**:
```javascript
// tests/mocks/canvas.mock.js
export const mockCanvas = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    jest.spyOn(ctx, 'drawImage').mockImplementation(() => {});
    jest.spyOn(canvas, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['mock-image'], { type: 'image/png' }));
    });
  }
  
  return canvas;
};
```

### 集成测试

```javascript
// tests/integration/fullWorkflow.spec.js
import { mount } from '@vue/test-utils';
import App from '@/App.vue';

describe('Full Workflow Integration', () => {
  it('should complete full extraction workflow', async () => {
    const wrapper = mount(App);
    
    // 1. 上传图片
    const file = new File(['test-image'], 'tshirt.jpg', { type: 'image/jpeg' });
    const uploader = wrapper.findComponent({ name: 'ImageUploader' });
    uploader.vm.$emit('image-selected', file, 'data:image/jpeg;base64,test');
    await wrapper.vm.$nextTick();
    
    // 2. 触发处理
    const processButton = wrapper.find('[data-test="process-button"]');
    await processButton.trigger('click');
    
    // 3. 等待处理完成
    await new Promise(resolve => setTimeout(resolve, 100));
    await wrapper.vm.$nextTick();
    
    // 4. 验证下载按钮可用
    const downloadButton = wrapper.find('[data-test="download-button"]');
    expect(downloadButton.attributes('disabled')).toBeUndefined();
    
    // 5. 触发下载
    await downloadButton.trigger('click');
    // 验证下载逻辑被调用
  });
});
```

### 测试覆盖率目标

- **整体代码覆盖率**: ≥ 80%
- **核心业务逻辑**: ≥ 90%
- **工具函数**: ≥ 95%
- **UI组件**: ≥ 70%（某些UI交互难以测试）

### 持续集成

在CI/CD管道中运行测试：

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:properties
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### 测试命令

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:properties": "jest tests/properties",
    "test:integration": "jest tests/integration",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```
