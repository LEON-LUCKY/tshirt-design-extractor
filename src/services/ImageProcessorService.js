/**
 * Image Processor Service
 * 
 * This service orchestrates the image processing workflow:
 * 1. Compress large images before API upload
 * 2. Call background removal API
 * 3. Convert results to DataURL for display
 * 4. Cache processed results to avoid redundant API calls
 * 
 * Requirements: 2.1, 2.2, 2.3, 8.2, 8.5
 */

import CanvasUtility from './CanvasUtility';
import PatternExtractor from './PatternExtractor';
import {
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  OUTPUT_FORMAT,
  PNG_QUALITY,
  MAX_CACHE_SIZE,
  CACHE_EXPIRATION_TIME,
  ERROR_TYPES,
  ERROR_CODES,
  ERROR_MESSAGES,
  ENABLE_PATTERN_EXTRACTION,
  PATTERN_PADDING
} from '../constants';

/**
 * ImageProcessorService class
 * 
 * Coordinates the image processing pipeline from upload to extraction.
 * Includes compression, background removal, and result caching.
 */
class ImageProcessorService {
  constructor() {
    this.canvasUtil = CanvasUtility;
    this.patternExtractor = PatternExtractor;
    this.backgroundRemovalApi = null;
    
    // Cache for processed results
    // Key: file hash/identifier, Value: { result, timestamp }
    this.cache = new Map();
  }

  /**
   * Set the background removal API service
   * 
   * @param {Object} apiService - Background removal API service instance
   */
  setBackgroundRemovalApi(apiService) {
    this.backgroundRemovalApi = apiService;
  }

  /**
   * Main image processing workflow
   * 
   * Processes an image file through the complete extraction pipeline:
   * 1. Check cache for existing results
   * 2. Compress image if needed
   * 3. Remove background via API
   * 4. Convert to DataURL
   * 5. Cache the result
   * 
   * @param {File} imageFile - The image file to process
   * @returns {Promise<Object>} Processing result
   * @returns {string} result.originalDataUrl - Original image as DataURL
   * @returns {string} result.extractedDataUrl - Extracted design as DataURL
   * @returns {number} result.width - Image width
   * @returns {number} result.height - Image height
   * @returns {number} result.processingTime - Processing time in milliseconds
   * @returns {boolean} result.fromCache - Whether result was from cache
   * @throws {Error} If processing fails
   * 
   * Requirements: 2.1, 2.2, 2.3, 8.5
   */
  async processImage(imageFile) {
    const startTime = Date.now();

    try {
      // Validate input
      if (!imageFile || !(imageFile instanceof File)) {
        throw this._createError(
          ERROR_TYPES.PROCESSING_ERROR,
          ERROR_CODES.API_BAD_REQUEST,
          'Invalid image file provided'
        );
      }

      // Check if API service is configured
      if (!this.backgroundRemovalApi) {
        throw this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_SERVICE_UNAVAILABLE,
          'Background removal service not configured'
        );
      }

      // Generate cache key from file properties
      const cacheKey = this._generateCacheKey(imageFile);

      // Check cache first
      const cachedResult = this._getCachedResult(cacheKey);
      if (cachedResult) {
        return {
          ...cachedResult,
          processingTime: Date.now() - startTime,
          fromCache: true
        };
      }

      // Convert file to DataURL for original display
      const originalDataUrl = await this._fileToDataUrl(imageFile);

      // Load image to get dimensions
      const originalImage = await this.canvasUtil.loadImage(originalDataUrl);

      // Compress image if it's too large
      const imageBlob = await this._prepareImageForApi(imageFile, originalImage);

      // Remove background via API with auto-crop enabled
      const extractedBlob = await this.removeBackground(imageBlob, {
        size: 'auto',
        type: 'auto',
        format: 'png',
        crop: ENABLE_PATTERN_EXTRACTION,      // 使用 API 的自动裁剪
        crop_margin: `${PATTERN_PADDING}px`   // 裁剪边距
      });

      // Convert extracted result to DataURL
      const finalDataUrl = await this.blobToDataUrl(extractedBlob);
      
      // Load the result to get final dimensions
      const finalImage = await this.canvasUtil.loadImage(finalDataUrl);
      const finalWidth = finalImage.width;
      const finalHeight = finalImage.height;
      
      console.log('[ImageProcessor] 最终尺寸:', finalWidth, 'x', finalHeight);

      // Prepare result object
      const result = {
        originalDataUrl,
        extractedDataUrl: finalDataUrl,
        width: finalWidth,
        height: finalHeight,
        processingTime: Date.now() - startTime,
        fromCache: false
      };

      // Cache the result
      this._cacheResult(cacheKey, result);

      return result;
    } catch (error) {
      // Re-throw with additional context if needed
      if (error.type && error.code) {
        throw error;
      }
      
      throw this._createError(
        ERROR_TYPES.PROCESSING_ERROR,
        ERROR_CODES.CANVAS_ERROR,
        error.message || 'Image processing failed'
      );
    }
  }

  /**
   * Compress image if it exceeds maximum dimensions
   * 
   * Large images are resized to fit within MAX_IMAGE_WIDTH x MAX_IMAGE_HEIGHT
   * while maintaining aspect ratio. This reduces API upload time and costs.
   * 
   * @param {File} imageFile - Original image file
   * @param {HTMLImageElement} image - Loaded image element
   * @returns {Promise<Blob>} Compressed image blob or original if no compression needed
   * 
   * Requirements: 8.2
   */
  async compressImage(imageFile, image) {
    try {
      // Check if compression is needed
      if (image.width <= MAX_IMAGE_WIDTH && image.height <= MAX_IMAGE_HEIGHT) {
        // No compression needed, return original file as blob
        return imageFile;
      }

      // Resize image using canvas utility
      const resizedCanvas = this.canvasUtil.resizeImage(
        image,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT
      );

      // Convert canvas to blob
      const compressedBlob = await this.canvasUtil.imageToBlob(
        resizedCanvas,
        OUTPUT_FORMAT,
        PNG_QUALITY
      );

      return compressedBlob;
    } catch (error) {
      throw this._createError(
        ERROR_TYPES.PROCESSING_ERROR,
        ERROR_CODES.CANVAS_ERROR,
        `Image compression failed: ${error.message}`
      );
    }
  }

  /**
   * Remove background from image using API service
   * 
   * Calls the configured background removal API service.
   * The API service handles retries and error handling internally.
   * 
   * @param {Blob} imageBlob - Image blob to process
   * @param {Object} options - Processing options
   * @returns {Promise<Blob>} Processed image with background removed
   * @throws {Error} If API call fails
   * 
   * Requirements: 2.2
   */
  async removeBackground(imageBlob, options = {}) {
    if (!this.backgroundRemovalApi) {
      throw this._createError(
        ERROR_TYPES.API_ERROR,
        ERROR_CODES.API_SERVICE_UNAVAILABLE,
        'Background removal service not configured'
      );
    }

    // 使用 Remove.bg API 的 crop 参数自动裁剪
    const apiOptions = {
      size: options.size || 'auto',
      type: options.type || 'auto',
      format: options.format || 'png',
      crop: true,              // 自动裁剪空白区域
      crop_margin: '20px',     // 裁剪边距
      ...options
    };

    console.log('[ImageProcessor] API 选项:', apiOptions);

    // Call API service (it handles retries internally)
    const resultBlob = await this.backgroundRemovalApi.removeBackground(imageBlob, apiOptions);

    return resultBlob;
  }

  /**
   * Convert Blob to DataURL
   * 
   * Converts a Blob to a DataURL string for display in img elements.
   * 
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<string>} DataURL string
   * @throws {Error} If conversion fails
   * 
   * Requirements: 2.3
   */
  async blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      if (!blob || !(blob instanceof Blob)) {
        reject(this._createError(
          ERROR_TYPES.PROCESSING_ERROR,
          ERROR_CODES.CANVAS_ERROR,
          'Invalid blob provided'
        ));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(this._createError(
          ERROR_TYPES.PROCESSING_ERROR,
          ERROR_CODES.CANVAS_ERROR,
          'Failed to convert blob to DataURL'
        ));
      };

      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert File to DataURL
   * 
   * @private
   * @param {File} file - File to convert
   * @returns {Promise<string>} DataURL string
   */
  async _fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(this._createError(
          ERROR_TYPES.PROCESSING_ERROR,
          ERROR_CODES.IMAGE_LOAD_ERROR,
          'Failed to read image file'
        ));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Prepare image for API upload (compress if needed)
   * 
   * @private
   * @param {File} imageFile - Original image file
   * @param {HTMLImageElement} image - Loaded image element
   * @returns {Promise<Blob>} Image blob ready for API upload
   */
  async _prepareImageForApi(imageFile, image) {
    // Check if compression is needed
    const needsCompression = 
      image.width > MAX_IMAGE_WIDTH || 
      image.height > MAX_IMAGE_HEIGHT;

    if (needsCompression) {
      return await this.compressImage(imageFile, image);
    }

    // Return original file as-is
    return imageFile;
  }

  /**
   * Generate cache key from file properties
   * 
   * Creates a unique identifier for a file based on its properties.
   * Used for caching processed results.
   * 
   * @private
   * @param {File} file - File to generate key for
   * @returns {string} Cache key
   * 
   * Requirements: 8.5
   */
  _generateCacheKey(file) {
    // Use file properties to create a unique key
    // Note: This is a simple implementation. For production, consider using
    // a hash of the file content for more reliable cache keys.
    return `${file.name}-${file.size}-${file.lastModified}-${file.type}`;
  }

  /**
   * Get cached result if available and not expired
   * 
   * @private
   * @param {string} cacheKey - Cache key to lookup
   * @returns {Object|null} Cached result or null if not found/expired
   * 
   * Requirements: 8.5
   */
  _getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > CACHE_EXPIRATION_TIME) {
      // Cache expired, remove it
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.result;
  }

  /**
   * Cache processing result
   * 
   * Stores the processing result in cache with timestamp.
   * Implements LRU eviction when cache size exceeds MAX_CACHE_SIZE.
   * 
   * @private
   * @param {string} cacheKey - Cache key
   * @param {Object} result - Processing result to cache
   * 
   * Requirements: 8.5
   */
  _cacheResult(cacheKey, result) {
    // Check cache size and evict oldest entry if needed
    if (this.cache.size >= MAX_CACHE_SIZE) {
      // Get the first (oldest) key and delete it
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    // Store result with timestamp
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached results
   * 
   * Useful for testing or when user wants to force reprocessing.
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Create a standardized error object
   * 
   * @private
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string} code - Error code from ERROR_CODES
   * @param {string} details - Detailed error message
   * @param {boolean} retryable - Whether the error is retryable
   * @returns {Error} Error object with additional properties
   */
  _createError(type, code, details, retryable = false) {
    const error = new Error(ERROR_MESSAGES[code] || details);
    error.type = type;
    error.code = code;
    error.details = details;
    error.retryable = retryable;
    return error;
  }
}

// Export singleton instance
const imageProcessorService = new ImageProcessorService();

// Initialize with Remove.bg API service
// Requirements: 2.2
import { createBackgroundRemovalService } from './BackgroundRemovalAPI';
import { REMOVE_BG_API_KEY } from '../constants';

// Set up background removal API if key is available
if (REMOVE_BG_API_KEY) {
  try {
    const bgRemovalService = createBackgroundRemovalService('removebg', REMOVE_BG_API_KEY);
    imageProcessorService.setBackgroundRemovalApi(bgRemovalService);
  } catch (error) {
    console.error('Failed to initialize background removal service:', error);
  }
} else {
  console.warn('Remove.bg API key not configured. Set VUE_APP_REMOVE_BG_API_KEY in .env file.');
}

export default imageProcessorService;

// Also export class for testing
export { ImageProcessorService };
