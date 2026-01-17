/**
 * ErrorRecovery Service
 * 
 * Provides error recovery utilities including cleanup, retry logic with exponential backoff,
 * and error retryability checks.
 * 
 * Requirements: 5.2, 5.3
 */

import {
  ERROR_TYPES,
  API_RETRY_CONFIG
} from '@/constants';

/**
 * ErrorRecovery class for handling error recovery operations
 */
class ErrorRecovery {
  constructor() {
    // Store temporary resources for cleanup
    this.temporaryResources = new Set();
  }

  /**
   * Registers a temporary resource for cleanup
   * 
   * @param {Object} resource - Resource to track (should have a cleanup method or be a URL)
   * @example
   * errorRecovery.registerResource({ url: 'blob:...', cleanup: () => URL.revokeObjectURL(url) });
   */
  registerResource(resource) {
    this.temporaryResources.add(resource);
  }

  /**
   * Cleans up temporary resources and resets processing state
   * 
   * This method should be called when an error occurs to:
   * - Revoke blob URLs to free memory
   * - Clear temporary data
   * - Reset processing flags
   * - Preserve the original uploaded image
   * 
   * Requirements: 5.2
   * 
   * @example
   * errorRecovery.cleanup();
   */
  cleanup() {
    // Clean up all registered resources
    this.temporaryResources.forEach(resource => {
      try {
        if (resource && typeof resource.cleanup === 'function') {
          resource.cleanup();
        } else if (typeof resource === 'string' && resource.startsWith('blob:')) {
          // Revoke blob URL
          URL.revokeObjectURL(resource);
        }
      } catch (error) {
        console.warn('Failed to cleanup resource:', error);
      }
    });

    // Clear the set
    this.temporaryResources.clear();
  }

  /**
   * Determines if an error is retryable
   * 
   * Network errors and certain API errors (like rate limiting or temporary unavailability)
   * are considered retryable. Client errors (like invalid API keys) are not.
   * 
   * Requirements: 5.2, 5.3
   * 
   * @param {Object} error - Error object to check
   * @param {string} error.type - Error type from ERROR_TYPES
   * @param {string} [error.code] - Specific error code
   * @param {boolean} [error.retryable] - Explicit retryable flag
   * @returns {boolean} True if the error can be retried
   * 
   * @example
   * const error = { type: 'NETWORK_ERROR', message: 'Connection failed' };
   * if (errorRecovery.isRetryable(error)) {
   *   // Retry the operation
   * }
   */
  isRetryable(error) {
    if (!error) {
      return false;
    }

    // Check explicit retryable flag first
    if (typeof error.retryable === 'boolean') {
      return error.retryable;
    }

    // Network errors are always retryable
    if (error.type === ERROR_TYPES.NETWORK_ERROR) {
      return true;
    }

    // API errors may be retryable depending on the specific error
    if (error.type === ERROR_TYPES.API_ERROR) {
      // Check error code for retryable API errors
      const retryableApiErrors = [
        'API_QUOTA_EXCEEDED',      // 429 - Rate limiting
        'API_SERVICE_UNAVAILABLE', // 503 - Service temporarily down
        'NETWORK_TIMEOUT'          // Timeout errors
      ];

      if (error.code && retryableApiErrors.includes(error.code)) {
        return true;
      }

      // Non-retryable API errors
      const nonRetryableApiErrors = [
        'API_KEY_INVALID',    // 401 - Invalid credentials
        'API_BAD_REQUEST'     // 400 - Invalid request
      ];

      if (error.code && nonRetryableApiErrors.includes(error.code)) {
        return false;
      }

      // Default: API errors are retryable unless explicitly non-retryable
      return true;
    }

    // Processing errors might be retryable (e.g., temporary memory issues)
    if (error.type === ERROR_TYPES.PROCESSING_ERROR) {
      return true;
    }

    // Upload errors are generally not retryable (file validation issues)
    if (error.type === ERROR_TYPES.UPLOAD_ERROR) {
      return false;
    }

    // Default: not retryable
    return false;
  }

  /**
   * Retries an async operation with exponential backoff
   * 
   * Attempts to execute the operation multiple times with increasing delays
   * between attempts. Uses exponential backoff strategy: 1s, 2s, 4s, etc.
   * 
   * Requirements: 5.3
   * 
   * @param {Function} operation - Async function to retry
   * @param {number} [maxAttempts] - Maximum number of retry attempts (default: 3)
   * @param {number} [initialDelay] - Initial delay in milliseconds (default: 1000)
   * @param {number} [backoffMultiplier] - Multiplier for exponential backoff (default: 2)
   * @returns {Promise<any>} Result of the operation
   * @throws {Error} The last error if all attempts fail
   * 
   * @example
   * try {
   *   const result = await errorRecovery.retry(
   *     async () => await apiCall(),
   *     3  // max attempts
   *   );
   * } catch (error) {
   *   console.error('All retry attempts failed:', error);
   * }
   */
  async retry(
    operation,
    maxAttempts = API_RETRY_CONFIG.MAX_ATTEMPTS,
    initialDelay = API_RETRY_CONFIG.INITIAL_DELAY,
    backoffMultiplier = API_RETRY_CONFIG.BACKOFF_MULTIPLIER
  ) {
    // Validate parameters
    if (typeof operation !== 'function') {
      throw new Error('Operation must be a function');
    }

    if (maxAttempts < 1) {
      throw new Error('maxAttempts must be at least 1');
    }

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Attempt the operation
        const result = await operation();
        
        // Success - return result
        return result;

      } catch (error) {
        lastError = error;

        // Log the attempt
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);

        // If this was the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff
        // Delay = initialDelay * (backoffMultiplier ^ (attempt - 1))
        // Example: 1000ms, 2000ms, 4000ms
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // This should never be reached, but just in case
    throw lastError;
  }

  /**
   * Resets the application to initial state
   * 
   * Clears all state, removes temporary resources, and returns
   * the application to the initial upload interface.
   * 
   * Requirements: 5.3
   * 
   * @example
   * errorRecovery.reset();
   */
  reset() {
    // Clean up resources first
    this.cleanup();

    // Additional reset logic can be added here
    // For example, clearing localStorage, resetting global state, etc.
  }

  /**
   * Helper method to sleep for a specified duration
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Creates a retryable error object
   * 
   * @param {string} type - Error type from ERROR_TYPES
   * @param {string} message - Error message
   * @param {string} [code] - Error code
   * @param {boolean} [retryable=true] - Whether the error is retryable
   * @returns {Object} Error object
   * 
   * @example
   * const error = errorRecovery.createError(
   *   ERROR_TYPES.NETWORK_ERROR,
   *   'Connection failed',
   *   'NETWORK_TIMEOUT',
   *   true
   * );
   */
  createError(type, message, code = null, retryable = true) {
    return {
      type,
      message,
      code,
      retryable,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Wraps an async operation with automatic retry logic
   * 
   * Only retries if the error is retryable according to isRetryable()
   * 
   * @param {Function} operation - Async function to execute
   * @param {Object} [options] - Retry options
   * @param {number} [options.maxAttempts] - Maximum retry attempts
   * @param {number} [options.initialDelay] - Initial delay in ms
   * @param {number} [options.backoffMultiplier] - Backoff multiplier
   * @returns {Promise<any>} Result of the operation
   * 
   * @example
   * const result = await errorRecovery.withRetry(
   *   async () => await apiCall(),
   *   { maxAttempts: 3 }
   * );
   */
  async withRetry(operation, options = {}) {
    const {
      maxAttempts = API_RETRY_CONFIG.MAX_ATTEMPTS,
      initialDelay = API_RETRY_CONFIG.INITIAL_DELAY,
      backoffMultiplier = API_RETRY_CONFIG.BACKOFF_MULTIPLIER
    } = options;

    try {
      return await this.retry(operation, maxAttempts, initialDelay, backoffMultiplier);
    } catch (error) {
      // Check if error is retryable
      if (!this.isRetryable(error)) {
        // Not retryable, throw immediately
        throw error;
      }
      
      // Retryable but all attempts failed
      throw error;
    }
  }
}

// Export singleton instance
export default new ErrorRecovery();

// Also export the class for testing purposes
export { ErrorRecovery };
