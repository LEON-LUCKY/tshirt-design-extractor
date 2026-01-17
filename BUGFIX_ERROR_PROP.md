# 🐛 Bug 修复：Error Prop 类型错误

## 问题描述

在上传图片并尝试提取图案时，控制台出现以下警告：

```
[Vue warn]: Invalid prop: type check failed for prop "error". 
Expected Object, got Error

found in
---> <ImageProcessor> at src/components/ImageProcessor.vue
     <ErrorBoundary> at src/components/ErrorBoundary.vue
     <App> at src/App.vue
     <Root>
```

同时用户看到"服务不可用"的错误提示。

## 根本原因

Vue 组件的 prop 验证期望接收一个**普通 JavaScript 对象**（plain object），但在某些错误处理路径中，代码传递了 JavaScript 的 **Error 实例**。

### 问题代码

在 `App.vue` 中：

```javascript
// 问题：直接传递 Error 实例
handleError(error) {
  this.error = error;  // error 可能是 Error 实例
  // ...
}
```

在 `ImageProcessor.vue` 中：

```javascript
// prop 验证只接受普通对象
error: {
  type: Object,  // 不接受 Error 实例
  default: null
}
```

## 解决方案

### 1. 修复 `App.vue` 的错误处理

#### 修改 `handleError` 方法

```javascript
handleError(error) {
  // 确保 error 是普通对象，而不是 Error 实例
  if (error instanceof Error) {
    this.error = {
      type: ERROR_TYPES.PROCESSING_ERROR,
      code: ERROR_CODES.CANVAS_ERROR,
      message: error.message || '处理失败，请重试',
      details: error.stack || '',
      retryable: true
    };
  } else {
    this.error = error;
  }
  this.processingStatus = PROCESSING_STATUS.ERROR;
  this.isProcessing = false;
}
```

#### 修改 `handleProcessingError` 方法

```javascript
handleProcessingError(err) {
  // 检查是否已经是结构化错误
  if (err && err.type && err.code && 
      typeof err.message === 'string' && 
      typeof err.retryable === 'boolean') {
    this.handleError(err);
    return;
  }
  
  // 将 Error 对象转换为普通对象
  const errorMessage = err && err.message ? err.message : String(err);
  
  // ... 错误类型判断逻辑 ...
  
  // 创建普通对象错误（不是 Error 实例）
  this.handleError({
    type: errorType,
    code: errorCode,
    message: ERROR_MESSAGES[errorCode] || '处理失败，请重试',
    details: errorMessage,
    retryable
  });
}
```

### 2. 改进 `ImageProcessor.vue` 的 prop 验证

```javascript
error: {
  type: [Object, null],  // 明确允许 null
  default: null,
  validator: (value) => {
    if (value === null || value === undefined) return true;
    // 接受具有 message 和 retryable 属性的普通对象
    return (
      value &&
      typeof value === 'object' &&
      typeof value.message === 'string' &&
      typeof value.retryable === 'boolean'
    );
  }
}
```

## 错误对象结构

修复后，所有错误对象都遵循以下结构：

```javascript
{
  type: 'API_ERROR' | 'NETWORK_ERROR' | 'PROCESSING_ERROR' | 'UPLOAD_ERROR',
  code: 'API_KEY_INVALID' | 'API_QUOTA_EXCEEDED' | ...,
  message: '用户友好的错误消息',
  details: '详细的错误信息（可选）',
  retryable: true | false
}
```

## 测试验证

所有相关测试都已通过：

```bash
npm run test -- tests/unit/App.spec.js tests/unit/components/ImageProcessor.spec.js
```

结果：
- ✅ 65 个测试全部通过
- ✅ handleProcessingError 方法的所有测试通过
- ✅ ImageProcessor 组件的 prop 验证测试通过

## 影响范围

### 修改的文件

1. **src/App.vue**
   - `handleError()` 方法 - 添加 Error 实例检测和转换
   - `handleProcessingError()` 方法 - 改进错误对象创建逻辑

2. **src/components/ImageProcessor.vue**
   - `error` prop 定义 - 改进类型验证

### 不影响的功能

- ✅ 正常的图片上传流程
- ✅ 图案提取功能
- ✅ 错误重试机制
- ✅ 错误消息显示
- ✅ 所有其他组件

## 预防措施

为了避免将来出现类似问题：

1. **始终使用普通对象传递错误**
   ```javascript
   // ✅ 正确
   this.error = {
     type: ERROR_TYPES.API_ERROR,
     message: 'API 调用失败',
     retryable: true
   };
   
   // ❌ 错误
   this.error = new Error('API 调用失败');
   ```

2. **在 catch 块中转换 Error 实例**
   ```javascript
   try {
     // ...
   } catch (err) {
     // 转换为普通对象
     this.handleProcessingError(err);
   }
   ```

3. **使用 prop 验证器**
   ```javascript
   error: {
     type: [Object, null],
     validator: (value) => {
       // 验证对象结构
     }
   }
   ```

## 相关文档

- [Vue Props 验证](https://v2.vuejs.org/v2/guide/components-props.html#Prop-Validation)
- [JavaScript Error 对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- 项目错误处理规范：`src/constants.js` 中的 `ERROR_TYPES` 和 `ERROR_CODES`

## 总结

这个修复确保了：
1. ✅ 所有错误都以统一的普通对象格式传递
2. ✅ Vue 的 prop 验证不会报警告
3. ✅ 错误消息能正确显示给用户
4. ✅ 错误重试机制正常工作
5. ✅ 所有测试通过

修复已完成，可以正常使用应用了！🎉
