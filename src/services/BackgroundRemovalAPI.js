/**
 * Background Removal API Service
 * 
 * This module provides an interface and implementation for background removal services.
 * Currently implements Remove.bg API integration with error handling and retry logic.
 * 
 * Requirements: 2.2, 5.2, 5.3
 */

import axios from 'axios';
import {
  REMOVE_BG_API_ENDPOINT,
  API_RETRY_CONFIG,
  API_TIMEOUT,
  ERROR_TYPES,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS
} from '../constants';

/**
 * Base interface for background removal services
 * All background removal implementations should follow this interface
 */
export class BackgroundRemovalAPI {
  /**
   * Remove background from an image
   * @returns {Promise<Blob>} - The processed image with background removed
   */
  async removeBackground() {
    throw new Error('removeBackground must be implemented by subclass');
  }

  /**
   * Check if the API service is available
   * @returns {Promise<boolean>} - True if service is available
   */
  async checkApiStatus() {
    throw new Error('checkApiStatus must be implemented by subclass');
  }
}

/**
 * Remove.bg API Service Implementation
 * 
 * Integrates with Remove.bg API for AI-powered background removal.
 * Includes automatic retry logic with exponential backoff and comprehensive error handling.
 * 
 * @see https://www.remove.bg/api
 */
export class RemoveBgService extends BackgroundRemovalAPI {
  /**
   * Create a new RemoveBgService instance
   * @param {string} apiKey - Remove.bg API key
   * @param {Object} config - Optional configuration overrides
   */
  constructor(apiKey, config = {}) {
    super();
    
    if (!apiKey) {
      throw new Error('API key is required for RemoveBgService');
    }
    
    this.apiKey = apiKey;
    this.endpoint = config.endpoint || REMOVE_BG_API_ENDPOINT;
    this.timeout = config.timeout || API_TIMEOUT;
    this.maxRetries = config.maxRetries || API_RETRY_CONFIG.MAX_ATTEMPTS;
    this.initialDelay = config.initialDelay || API_RETRY_CONFIG.INITIAL_DELAY;
    this.backoffMultiplier = config.backoffMultiplier || API_RETRY_CONFIG.BACKOFF_MULTIPLIER;
    
    // Create axios instance with default config
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'X-Api-Key': this.apiKey
      }
    });
  }

  /**
   * Remove background from an image using Remove.bg API
   * 
   * @param {Blob} imageBlob - The image to process
   * @param {Object} options - Processing options
   * @param {string} options.size - Output size ('auto', 'preview', 'full', 'medium', 'hd', '4k')
   * @param {string} options.type - Foreground type ('auto', 'person', 'product', 'car')
   * @param {string} options.format - Output format ('auto', 'png', 'jpg', 'zip')
   * @param {boolean} options.crop - Whether to crop off all empty regions
   * @param {string} options.crop_margin - Margin around the cropped subject (e.g. '20px', '10%')
   * @param {string} options.position - Position of subject ('original', 'center', '0%', '50%')
   * @param {string} options.roi - Region of interest ('0% 0% 100% 100%')
   * @returns {Promise<Blob>} - The processed image with background removed
   * @throws {Error} - Throws error with type and details for different failure scenarios
   */
  async removeBackground(imageBlob, options = {}) {
    const {
      size = 'auto',
      type = 'auto',
      format = 'png',
      crop = false,
      crop_margin = '0px',
      position = 'original',
      roi = '0% 0% 100% 100%'
    } = options;

    // Validate input
    if (!imageBlob || !(imageBlob instanceof Blob)) {
      throw this._createError(
        ERROR_TYPES.PROCESSING_ERROR,
        ERROR_CODES.API_BAD_REQUEST,
        'Invalid image blob provided'
      );
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('image_file', imageBlob);
    formData.append('size', size);
    formData.append('type', type);
    formData.append('format', format);
    
    // 添加裁剪参数
    if (crop) {
      formData.append('crop', 'true');
      if (crop_margin) {
        formData.append('crop_margin', crop_margin);
      }
    }
    
    // 添加位置参数
    if (position && position !== 'original') {
      formData.append('position', position);
    }
    
    // 添加感兴趣区域参数
    if (roi && roi !== '0% 0% 100% 100%') {
      formData.append('roi', roi);
    }

    console.log('[RemoveBgService] 请求参数:', {
      size, type, format, crop, crop_margin, position, roi
    });

    // Execute with retry logic
    return await this._executeWithRetry(async () => {
      try {
        const response = await this.client.post(this.endpoint, formData, {
          responseType: 'blob',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Validate response
        if (!response.data || !(response.data instanceof Blob)) {
          throw this._createError(
            ERROR_TYPES.PROCESSING_ERROR,
            ERROR_CODES.API_BAD_REQUEST,
            'Invalid response from API'
          );
        }

        console.log('[RemoveBgService] API 响应成功，图片大小:', response.data.size, 'bytes');

        return response.data;
      } catch (error) {
        // Handle axios errors
        if (error.response) {
          // Server responded with error status
          throw this._handleApiError(error.response);
        } else if (error.request) {
          // Request made but no response received
          throw this._createError(
            ERROR_TYPES.NETWORK_ERROR,
            ERROR_CODES.NETWORK_TIMEOUT,
            'No response from server',
            true // retryable
          );
        } else {
          // Error in request setup
          throw this._createError(
            ERROR_TYPES.PROCESSING_ERROR,
            ERROR_CODES.API_BAD_REQUEST,
            error.message || 'Request setup failed'
          );
        }
      }
    });
  }

  /**
   * Check if Remove.bg API is available
   * 
   * @returns {Promise<boolean>} - True if API is available and responding
   */
  async checkApiStatus() {
    try {
      // Create a minimal test request to check API availability
      // We'll use account endpoint which is lightweight
      const response = await this.client.get('https://api.remove.bg/v1.0/account', {
        timeout: 5000 // Short timeout for status check
      });
      
      return response.status === HTTP_STATUS.OK;
    } catch (error) {
      // API is not available or key is invalid
      return false;
    }
  }

  /**
   * Execute an operation with retry logic and exponential backoff
   * 
   * @private
   * @param {Function} operation - Async operation to execute
   * @returns {Promise<any>} - Result of the operation
   * @throws {Error} - Throws the last error if all retries fail
   */
  async _executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if error is not retryable
        if (!error.retryable) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1);
        
        // Wait before retrying
        await this._sleep(delay);
      }
    }
    
    // This should never be reached, but just in case
    throw lastError;
  }

  /**
   * Handle API error responses and create appropriate error objects
   * 
   * @private
   * @param {Object} response - Axios error response
   * @returns {Error} - Formatted error object
   */
  _handleApiError(response) {
    const status = response.status;
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_BAD_REQUEST,
          'Invalid image or request parameters',
          false
        );
        
      case HTTP_STATUS.UNAUTHORIZED:
      case HTTP_STATUS.FORBIDDEN:
        return this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_KEY_INVALID,
          'Invalid or missing API key',
          false
        );
        
      case HTTP_STATUS.PAYMENT_REQUIRED:
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_QUOTA_EXCEEDED,
          'API quota exceeded or payment required',
          false
        );
        
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_SERVICE_UNAVAILABLE,
          'API service temporarily unavailable',
          true // retryable
        );
        
      default:
        return this._createError(
          ERROR_TYPES.API_ERROR,
          ERROR_CODES.API_SERVICE_UNAVAILABLE,
          `API error: ${status}`,
          status >= 500 // Retry on 5xx errors
        );
    }
  }

  /**
   * Create a standardized error object
   * 
   * @private
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string} code - Error code from ERROR_CODES
   * @param {string} details - Detailed error message
   * @param {boolean} retryable - Whether the error is retryable
   * @returns {Error} - Error object with additional properties
   */
  _createError(type, code, details, retryable = false) {
    const error = new Error(ERROR_MESSAGES[code] || details);
    error.type = type;
    error.code = code;
    error.details = details;
    error.retryable = retryable;
    return error;
  }

  /**
   * Sleep for specified milliseconds
   * 
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a background removal service
 * 
 * @param {string} provider - Service provider ('removebg')
 * @param {string} apiKey - API key for the provider
 * @param {Object} config - Optional configuration
 * @returns {BackgroundRemovalAPI} - Background removal service instance
 */
export function createBackgroundRemovalService(provider, apiKey, config = {}) {
  switch (provider.toLowerCase()) {
    case 'removebg':
    case 'remove.bg':
      return new RemoveBgService(apiKey, config);
      
    default:
      throw new Error(`Unsupported background removal provider: ${provider}`);
  }
}

// Default export
export default {
  BackgroundRemovalAPI,
  RemoveBgService,
  createBackgroundRemovalService
};
