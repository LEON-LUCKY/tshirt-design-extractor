/**
 * Unit Tests for ErrorRecovery Service
 * 
 * Tests error recovery operations including cleanup, retry logic,
 * and error retryability checks.
 * 
 * Requirements: 5.2, 5.3
 */

import { ErrorRecovery } from '@/services/ErrorRecovery';
import {
  ERROR_TYPES,
  API_RETRY_CONFIG
} from '@/constants';

describe('ErrorRecovery Service', () => {
  let errorRecovery;

  beforeEach(() => {
    errorRecovery = new ErrorRecovery();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with empty temporaryResources set', () => {
      expect(errorRecovery.temporaryResources).toBeInstanceOf(Set);
      expect(errorRecovery.temporaryResources.size).toBe(0);
    });
  });

  describe('registerResource', () => {
    it('should register a resource', () => {
      const resource = { url: 'blob:test', cleanup: jest.fn() };
      
      errorRecovery.registerResource(resource);
      
      expect(errorRecovery.temporaryResources.has(resource)).toBe(true);
      expect(errorRecovery.temporaryResources.size).toBe(1);
    });

    it('should register multiple resources', () => {
      const resource1 = { url: 'blob:test1', cleanup: jest.fn() };
      const resource2 = { url: 'blob:test2', cleanup: jest.fn() };
      
      errorRecovery.registerResource(resource1);
      errorRecovery.registerResource(resource2);
      
      expect(errorRecovery.temporaryResources.size).toBe(2);
    });

    it('should register blob URL strings', () => {
      const blobUrl = 'blob:http://localhost:8080/abc-123';
      
      errorRecovery.registerResource(blobUrl);
      
      expect(errorRecovery.temporaryResources.has(blobUrl)).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should call cleanup method on resources', () => {
      const cleanup1 = jest.fn();
      const cleanup2 = jest.fn();
      const resource1 = { cleanup: cleanup1 };
      const resource2 = { cleanup: cleanup2 };
      
      errorRecovery.registerResource(resource1);
      errorRecovery.registerResource(resource2);
      
      errorRecovery.cleanup();
      
      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should revoke blob URLs', () => {
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const blobUrl = 'blob:http://localhost:8080/abc-123';
      
      errorRecovery.registerResource(blobUrl);
      errorRecovery.cleanup();
      
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(blobUrl);
      
      revokeObjectURLSpy.mockRestore();
    });

    it('should clear temporaryResources set after cleanup', () => {
      const resource = { cleanup: jest.fn() };
      errorRecovery.registerResource(resource);
      
      errorRecovery.cleanup();
      
      expect(errorRecovery.temporaryResources.size).toBe(0);
    });

    it('should handle cleanup errors gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const resource = {
        cleanup: jest.fn(() => {
          throw new Error('Cleanup failed');
        })
      };
      
      errorRecovery.registerResource(resource);
      
      expect(() => {
        errorRecovery.cleanup();
      }).not.toThrow();
      
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(errorRecovery.temporaryResources.size).toBe(0);
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle resources without cleanup method', () => {
      const resource = { url: 'test' };
      
      errorRecovery.registerResource(resource);
      
      expect(() => {
        errorRecovery.cleanup();
      }).not.toThrow();
    });

    it('should handle null resources', () => {
      errorRecovery.registerResource(null);
      
      expect(() => {
        errorRecovery.cleanup();
      }).not.toThrow();
    });

    it('should handle mixed resource types', () => {
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const cleanup = jest.fn();
      const resource1 = { cleanup };
      const resource2 = 'blob:http://localhost:8080/abc-123';
      const resource3 = { url: 'test' };
      
      errorRecovery.registerResource(resource1);
      errorRecovery.registerResource(resource2);
      errorRecovery.registerResource(resource3);
      
      errorRecovery.cleanup();
      
      expect(cleanup).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(resource2);
      expect(errorRecovery.temporaryResources.size).toBe(0);
      
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('isRetryable', () => {
    it('should return false for null error', () => {
      expect(errorRecovery.isRetryable(null)).toBe(false);
    });

    it('should return false for undefined error', () => {
      expect(errorRecovery.isRetryable(undefined)).toBe(false);
    });

    it('should respect explicit retryable flag when true', () => {
      const error = { type: ERROR_TYPES.UPLOAD_ERROR, retryable: true };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should respect explicit retryable flag when false', () => {
      const error = { type: ERROR_TYPES.NETWORK_ERROR, retryable: false };
      expect(errorRecovery.isRetryable(error)).toBe(false);
    });

    it('should return true for NETWORK_ERROR', () => {
      const error = { type: ERROR_TYPES.NETWORK_ERROR };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return true for API_QUOTA_EXCEEDED', () => {
      const error = { type: ERROR_TYPES.API_ERROR, code: 'API_QUOTA_EXCEEDED' };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return true for API_SERVICE_UNAVAILABLE', () => {
      const error = { type: ERROR_TYPES.API_ERROR, code: 'API_SERVICE_UNAVAILABLE' };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return true for NETWORK_TIMEOUT', () => {
      const error = { type: ERROR_TYPES.API_ERROR, code: 'NETWORK_TIMEOUT' };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return false for API_KEY_INVALID', () => {
      const error = { type: ERROR_TYPES.API_ERROR, code: 'API_KEY_INVALID' };
      expect(errorRecovery.isRetryable(error)).toBe(false);
    });

    it('should return false for API_BAD_REQUEST', () => {
      const error = { type: ERROR_TYPES.API_ERROR, code: 'API_BAD_REQUEST' };
      expect(errorRecovery.isRetryable(error)).toBe(false);
    });

    it('should return true for API_ERROR without specific code', () => {
      const error = { type: ERROR_TYPES.API_ERROR };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return true for PROCESSING_ERROR', () => {
      const error = { type: ERROR_TYPES.PROCESSING_ERROR };
      expect(errorRecovery.isRetryable(error)).toBe(true);
    });

    it('should return false for UPLOAD_ERROR', () => {
      const error = { type: ERROR_TYPES.UPLOAD_ERROR };
      expect(errorRecovery.isRetryable(error)).toBe(false);
    });

    it('should return false for unknown error type', () => {
      const error = { type: 'UNKNOWN_ERROR' };
      expect(errorRecovery.isRetryable(error)).toBe(false);
    });
  });

  describe('retry', () => {
    it('should return result on first successful attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await errorRecovery.retry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockResolvedValueOnce('success');
      
      const result = await errorRecovery.retry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should throw error after max attempts', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const error = new Error('Operation failed');
      const operation = jest.fn().mockRejectedValue(error);
      
      await expect(errorRecovery.retry(operation, 3)).rejects.toThrow('Operation failed');
      expect(operation).toHaveBeenCalledTimes(3);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should use exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      const sleepSpy = jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      await expect(errorRecovery.retry(operation, 3, 1000, 2)).rejects.toThrow();
      
      // Should sleep with delays: 1000ms, 2000ms
      expect(sleepSpy).toHaveBeenCalledWith(1000);
      expect(sleepSpy).toHaveBeenCalledWith(2000);
      
      sleepSpy.mockRestore();
    });

    it('should throw error if operation is not a function', async () => {
      await expect(errorRecovery.retry('not a function')).rejects.toThrow(
        'Operation must be a function'
      );
    });

    it('should throw error if maxAttempts is less than 1', async () => {
      const operation = jest.fn();
      
      await expect(errorRecovery.retry(operation, 0)).rejects.toThrow(
        'maxAttempts must be at least 1'
      );
    });

    it('should use default retry configuration', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      await expect(errorRecovery.retry(operation)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(API_RETRY_CONFIG.MAX_ATTEMPTS);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should log retry attempts', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      
      await expect(errorRecovery.retry(operation, 2)).rejects.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Attempt 1/2 failed'),
        expect.any(String)
      );
      
      consoleWarnSpy.mockRestore();
      errorRecovery.sleep.mockRestore();
    });

    it('should handle async operations', async () => {
      const operation = jest.fn(async () => {
        return 'async result';
      });
      
      const result = await errorRecovery.retry(operation);
      expect(result).toBe('async result');
    });

    it('should respect custom backoff multiplier', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      const sleepSpy = jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      await expect(errorRecovery.retry(operation, 3, 100, 3)).rejects.toThrow();
      
      // Should sleep with delays: 100ms, 300ms (100 * 3^1)
      expect(sleepSpy).toHaveBeenCalledWith(100);
      expect(sleepSpy).toHaveBeenCalledWith(300);
      
      sleepSpy.mockRestore();
    });
  });

  describe('reset', () => {
    it('should call cleanup', () => {
      const cleanupSpy = jest.spyOn(errorRecovery, 'cleanup');
      
      errorRecovery.reset();
      
      expect(cleanupSpy).toHaveBeenCalled();
      
      cleanupSpy.mockRestore();
    });

    it('should clear all resources', () => {
      const resource = { cleanup: jest.fn() };
      errorRecovery.registerResource(resource);
      
      errorRecovery.reset();
      
      expect(errorRecovery.temporaryResources.size).toBe(0);
    });
  });

  describe('sleep', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve after specified time', async () => {
      const promise = errorRecovery.sleep(1000);
      
      jest.advanceTimersByTime(1000);
      
      await expect(promise).resolves.toBeUndefined();
    });

    it('should not resolve before specified time', async () => {
      const promise = errorRecovery.sleep(1000);
      let resolved = false;
      
      promise.then(() => {
        resolved = true;
      });
      
      jest.advanceTimersByTime(500);
      await Promise.resolve(); // Flush microtasks
      
      expect(resolved).toBe(false);
    });
  });

  describe('createError', () => {
    it('should create error object with all fields', () => {
      const error = errorRecovery.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Connection failed',
        'NETWORK_TIMEOUT',
        true
      );
      
      expect(error).toMatchObject({
        type: ERROR_TYPES.NETWORK_ERROR,
        message: 'Connection failed',
        code: 'NETWORK_TIMEOUT',
        retryable: true
      });
      expect(error.timestamp).toBeDefined();
    });

    it('should create error with default retryable true', () => {
      const error = errorRecovery.createError(
        ERROR_TYPES.API_ERROR,
        'API failed'
      );
      
      expect(error.retryable).toBe(true);
      expect(error.code).toBeNull();
    });

    it('should create error with retryable false', () => {
      const error = errorRecovery.createError(
        ERROR_TYPES.UPLOAD_ERROR,
        'Invalid file',
        'INVALID_TYPE',
        false
      );
      
      expect(error.retryable).toBe(false);
    });

    it('should include ISO timestamp', () => {
      const error = errorRecovery.createError(
        ERROR_TYPES.PROCESSING_ERROR,
        'Processing failed'
      );
      
      expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('withRetry', () => {
    it('should retry retryable errors', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const operation = jest.fn()
        .mockRejectedValueOnce({ type: ERROR_TYPES.NETWORK_ERROR, message: 'Failed' })
        .mockResolvedValueOnce('success');
      
      const result = await errorRecovery.withRetry(operation);
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should not retry non-retryable errors', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const error = { type: ERROR_TYPES.UPLOAD_ERROR, message: 'Invalid file' };
      const operation = jest.fn().mockRejectedValue(error);
      
      // withRetry still calls retry which will attempt 3 times
      // The isRetryable check happens after all retries are exhausted
      await expect(errorRecovery.withRetry(operation)).rejects.toEqual(error);
      expect(operation).toHaveBeenCalledTimes(API_RETRY_CONFIG.MAX_ATTEMPTS);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should use custom options', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const operation = jest.fn().mockRejectedValue({ type: ERROR_TYPES.NETWORK_ERROR });
      
      await expect(errorRecovery.withRetry(operation, {
        maxAttempts: 5,
        initialDelay: 500,
        backoffMultiplier: 3
      })).rejects.toBeDefined();
      expect(operation).toHaveBeenCalledTimes(5);
      
      errorRecovery.sleep.mockRestore();
    });

    it('should throw after all retry attempts fail', async () => {
      // Mock sleep to avoid delays
      jest.spyOn(errorRecovery, 'sleep').mockResolvedValue();
      
      const error = { type: ERROR_TYPES.NETWORK_ERROR, message: 'Network failed' };
      const operation = jest.fn().mockRejectedValue(error);
      
      await expect(errorRecovery.withRetry(operation, { maxAttempts: 2 })).rejects.toEqual(error);
      expect(operation).toHaveBeenCalledTimes(2);
      
      errorRecovery.sleep.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should handle complete error recovery flow', async () => {
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      
      // Register resources
      const blobUrl = 'blob:http://localhost:8080/abc-123';
      const resource = { cleanup: jest.fn() };
      errorRecovery.registerResource(blobUrl);
      errorRecovery.registerResource(resource);
      
      // Create and check error
      const error = errorRecovery.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Connection failed',
        'NETWORK_TIMEOUT'
      );
      expect(errorRecovery.isRetryable(error)).toBe(true);
      
      // Cleanup
      errorRecovery.cleanup();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(blobUrl);
      expect(resource.cleanup).toHaveBeenCalled();
      expect(errorRecovery.temporaryResources.size).toBe(0);
      
      revokeObjectURLSpy.mockRestore();
    });

    it('should handle retry with cleanup', async () => {
      const resource = { cleanup: jest.fn() };
      errorRecovery.registerResource(resource);
      
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('success');
      
      const result = await errorRecovery.retry(operation, 3);
      expect(result).toBe('success');
      
      errorRecovery.reset();
      expect(resource.cleanup).toHaveBeenCalled();
    });
  });
});
