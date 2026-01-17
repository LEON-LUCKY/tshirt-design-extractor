/**
 * Pattern Extractor Service
 * 
 * 从移除背景后的图片中提取图案区域
 * 通过分析像素的透明度和颜色，自动检测图案边界并裁剪
 */

/**
 * 图案提取器类
 */
class PatternExtractor {
  /**
   * 从图片中提取图案区域
   * 
   * @param {HTMLImageElement|HTMLCanvasElement} image - 已移除背景的图片
   * @param {Object} options - 提取选项
   * @param {number} options.padding - 边界填充（像素）
   * @param {number} options.threshold - 透明度阈值（0-255）
   * @returns {Promise<HTMLCanvasElement>} 裁剪后的图案
   */
  async extractPattern(image, options = {}) {
    const {
      padding = 20,           // 边界填充
      threshold = 10          // 透明度阈值
    } = options;

    console.log('[PatternExtractor] 开始检测图案边界...');
    console.log('[PatternExtractor] 图片尺寸:', image.width, 'x', image.height);
    console.log('[PatternExtractor] 填充:', padding, '像素');
    console.log('[PatternExtractor] 阈值:', threshold);

    // 创建临时 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // 绘制图片
    ctx.drawImage(image, 0, 0);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // 检测图案边界
    const bounds = this._detectPatternBounds(pixels, canvas.width, canvas.height, threshold);
    
    if (!bounds) {
      // 如果没有检测到图案，返回原图
      console.log('[PatternExtractor] 未检测到图案边界，返回原图');
      return canvas;
    }
    
    console.log('[PatternExtractor] 检测到边界:', bounds);
    
    // 添加填充
    const paddedBounds = {
      left: Math.max(0, bounds.left - padding),
      top: Math.max(0, bounds.top - padding),
      right: Math.min(canvas.width, bounds.right + padding),
      bottom: Math.min(canvas.height, bounds.bottom + padding)
    };
    
    console.log('[PatternExtractor] 添加填充后:', paddedBounds);
    
    // 计算裁剪后的尺寸
    const croppedWidth = paddedBounds.right - paddedBounds.left;
    const croppedHeight = paddedBounds.bottom - paddedBounds.top;
    
    console.log('[PatternExtractor] 裁剪尺寸:', croppedWidth, 'x', croppedHeight);
    
    // 创建裁剪后的 canvas
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    
    // 裁剪图案
    croppedCtx.drawImage(
      canvas,
      paddedBounds.left,
      paddedBounds.top,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );
    
    console.log('[PatternExtractor] 图案提取完成！');
    
    return croppedCanvas;
  }

  /**
   * 检测图案边界（改进版 - 排除纯色区域）
   * 
   * @private
   * @param {Uint8ClampedArray} pixels - 像素数据
   * @param {number} width - 图片宽度
   * @param {number} height - 图片高度
   * @param {number} threshold - 透明度阈值
   * @returns {Object|null} 边界坐标 {left, top, right, bottom}
   */
  _detectPatternBounds(pixels, width, height, threshold) {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    // 首先，采样检测主要颜色（T恤的颜色）
    const dominantColor = this._detectDominantColor(pixels, width, height);
    console.log('[PatternExtractor] 检测到主色调:', dominantColor);

    // 扫描所有像素，排除与主色调相似的区域
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3]; // Alpha 通道
        
        // 如果像素不透明
        if (alpha > threshold) {
          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          
          // 检查是否与主色调相似（如果相似，可能是 T恤 本身，不是图案）
          const colorDiff = this._colorDistance(
            { r, g, b },
            dominantColor
          );
          
          // 如果颜色差异大于阈值，认为是图案
          if (colorDiff > 30) { // 颜色差异阈值
            hasContent = true;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
    }

    if (!hasContent) {
      console.log('[PatternExtractor] 未检测到图案（可能全是纯色）');
      // 如果没有检测到图案，回退到基本检测
      return this._detectPatternBoundsBasic(pixels, width, height, threshold);
    }

    return {
      left: minX,
      top: minY,
      right: maxX + 1,
      bottom: maxY + 1
    };
  }

  /**
   * 基本边界检测（不考虑颜色）
   * 
   * @private
   */
  _detectPatternBoundsBasic(pixels, width, height, threshold) {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let hasContent = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > threshold) {
          hasContent = true;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (!hasContent) {
      return null;
    }

    return {
      left: minX,
      top: minY,
      right: maxX + 1,
      bottom: maxY + 1
    };
  }

  /**
   * 检测主色调（采样法）
   * 
   * @private
   * @param {Uint8ClampedArray} pixels - 像素数据
   * @param {number} width - 图片宽度
   * @param {number} height - 图片高度
   * @returns {Object} 主色调 {r, g, b}
   */
  _detectDominantColor(pixels, width, height) {
    const colorCounts = {};
    const sampleRate = 10; // 每10个像素采样一次
    
    for (let y = 0; y < height; y += sampleRate) {
      for (let x = 0; x < width; x += sampleRate) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];
        
        // 只统计不透明的像素
        if (alpha > 200) {
          const r = Math.floor(pixels[index] / 32) * 32; // 量化颜色
          const g = Math.floor(pixels[index + 1] / 32) * 32;
          const b = Math.floor(pixels[index + 2] / 32) * 32;
          
          const colorKey = `${r},${g},${b}`;
          colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }
      }
    }
    
    // 找到出现次数最多的颜色
    let maxCount = 0;
    let dominantColorKey = '0,0,0';
    
    for (const [colorKey, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantColorKey = colorKey;
      }
    }
    
    const [r, g, b] = dominantColorKey.split(',').map(Number);
    return { r, g, b };
  }

  /**
   * 计算两个颜色之间的距离
   * 
   * @private
   * @param {Object} color1 - 颜色1 {r, g, b}
   * @param {Object} color2 - 颜色2 {r, g, b}
   * @returns {number} 颜色距离
   */
  _colorDistance(color1, color2) {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    
    // 欧几里得距离
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * 智能裁剪 - 基于内容密度
   * 
   * 这个方法会分析图案的内容密度，尝试只保留主要图案区域
   * 
   * @param {HTMLImageElement|HTMLCanvasElement} image - 已移除背景的图片
   * @param {Object} options - 裁剪选项
   * @param {number} options.densityThreshold - 内容密度阈值（0-1）
   * @param {number} options.padding - 边界填充（像素）
   * @returns {Promise<HTMLCanvasElement>} 裁剪后的图案
   */
  async smartCrop(image, options = {}) {
    const {
      densityThreshold = 0.05,  // 内容密度阈值
      padding = 20
    } = options;

    // 创建临时 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // 绘制图片
    ctx.drawImage(image, 0, 0);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // 计算每行和每列的内容密度
    const rowDensity = this._calculateRowDensity(pixels, canvas.width, canvas.height);
    const colDensity = this._calculateColumnDensity(pixels, canvas.width, canvas.height);
    
    // 找到内容区域
    const bounds = this._findContentBounds(rowDensity, colDensity, densityThreshold);
    
    if (!bounds) {
      // 如果没有检测到内容，使用基本边界检测
      return this.extractPattern(image, { padding });
    }
    
    // 添加填充
    const paddedBounds = {
      left: Math.max(0, bounds.left - padding),
      top: Math.max(0, bounds.top - padding),
      right: Math.min(canvas.width, bounds.right + padding),
      bottom: Math.min(canvas.height, bounds.bottom + padding)
    };
    
    // 计算裁剪后的尺寸
    const croppedWidth = paddedBounds.right - paddedBounds.left;
    const croppedHeight = paddedBounds.bottom - paddedBounds.top;
    
    // 创建裁剪后的 canvas
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = croppedWidth;
    croppedCanvas.height = croppedHeight;
    
    // 裁剪图案
    croppedCtx.drawImage(
      canvas,
      paddedBounds.left,
      paddedBounds.top,
      croppedWidth,
      croppedHeight,
      0,
      0,
      croppedWidth,
      croppedHeight
    );
    
    return croppedCanvas;
  }

  /**
   * 计算每行的内容密度
   * 
   * @private
   * @param {Uint8ClampedArray} pixels - 像素数据
   * @param {number} width - 图片宽度
   * @param {number} height - 图片高度
   * @returns {Array<number>} 每行的内容密度（0-1）
   */
  _calculateRowDensity(pixels, width, height) {
    const density = new Array(height).fill(0);
    
    for (let y = 0; y < height; y++) {
      let opaquePixels = 0;
      
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 10) {
          opaquePixels++;
        }
      }
      
      density[y] = opaquePixels / width;
    }
    
    return density;
  }

  /**
   * 计算每列的内容密度
   * 
   * @private
   * @param {Uint8ClampedArray} pixels - 像素数据
   * @param {number} width - 图片宽度
   * @param {number} height - 图片高度
   * @returns {Array<number>} 每列的内容密度（0-1）
   */
  _calculateColumnDensity(pixels, width, height) {
    const density = new Array(width).fill(0);
    
    for (let x = 0; x < width; x++) {
      let opaquePixels = 0;
      
      for (let y = 0; y < height; y++) {
        const index = (y * width + x) * 4;
        const alpha = pixels[index + 3];
        
        if (alpha > 10) {
          opaquePixels++;
        }
      }
      
      density[x] = opaquePixels / height;
    }
    
    return density;
  }

  /**
   * 根据密度找到内容边界
   * 
   * @private
   * @param {Array<number>} rowDensity - 行密度
   * @param {Array<number>} colDensity - 列密度
   * @param {number} threshold - 密度阈值
   * @returns {Object|null} 边界坐标
   */
  _findContentBounds(rowDensity, colDensity, threshold) {
    // 找到第一行和最后一行有内容的位置
    let top = 0;
    let bottom = rowDensity.length - 1;
    
    for (let i = 0; i < rowDensity.length; i++) {
      if (rowDensity[i] > threshold) {
        top = i;
        break;
      }
    }
    
    for (let i = rowDensity.length - 1; i >= 0; i--) {
      if (rowDensity[i] > threshold) {
        bottom = i + 1;
        break;
      }
    }
    
    // 找到第一列和最后一列有内容的位置
    let left = 0;
    let right = colDensity.length - 1;
    
    for (let i = 0; i < colDensity.length; i++) {
      if (colDensity[i] > threshold) {
        left = i;
        break;
      }
    }
    
    for (let i = colDensity.length - 1; i >= 0; i--) {
      if (colDensity[i] > threshold) {
        right = i + 1;
        break;
      }
    }
    
    if (top >= bottom || left >= right) {
      return null;
    }
    
    return { top, bottom, left, right };
  }
}

// 导出单例
export default new PatternExtractor();

// 也导出类供测试使用
export { PatternExtractor };
