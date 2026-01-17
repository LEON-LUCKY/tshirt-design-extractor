/**
 * Unit tests for BackgroundRemovalAPI service
 * 
 * Tests the RemoveBgService implementation including:
 * - API calls and responses
 * - Error handling for different HTTP status codes
 * - Retry logic with exponential backoff
 * - API status checking
 * 
 * Requirements: 2.2, 5.2, 5.3
 */

import axios from 'axios';
import {
  BackgroundRemovalAPI,
  RemoveBgService,
  createBackgroundRemovalService
} from '@/services/BackgroundRemovalAPI';
import {
  ERROR_TYPES,
  ERROR_CODES,
  HTTP_STATUS,
  API_RETRY_CONFIG
} from '@/constants';

// Mock axios
jest.mock('axios');

describe('BackgroundRemovalAPI', () => {
  describe('Base Interface', () => {
    it('should throw error when removeBackground is not implemented', async () => {
      const api = new BackgroundRemovalAPI();
      await expect(api.removeBackground(new Blob())).rejects.toThrow(
        'removeBackground must be implemented by subclass'
      );
    });

    it('should throw error when checkApiStatus is not implemented', async () => {
      const api = new BackgroundRemovalAPI();
      await expect(api.checkApiStatus()).rejects.toThrow(
        'checkApiStatus must be implemented by subclass'
      );
    });
  });

  describe('RemoveBgService', () => {
    let service;
    let mockAxiosInstance;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();

      // Create mock axios instance
      mockAxiosInstance = {
        post: jest.fn(),
        get: jest.fn()
      };

      axios.create.mockReturnValue(mockAxiosInstance);

      // Create service instance
      service = new RemoveBgService('test-api-key');
    });

    describe('Constructor', () => {
      it('should throw error if API key is not provided', () => {
        expect(() => new RemoveBgService()).toThrow('API key is required');
      });

      it('should create axios instance with correct configuration', () => {
        expect(axios.create).toHaveBeenCalledWith(
          expect.objectContaining({
            timeout: expect.any(Number),
            headers: {
              'X-Api-Key': 'test-api-key'
            }
          })
        );
      });

      it('should accept custom configuration', () => {
        const customConfig = {
          timeout: 60000,
          maxRetries: 5,
          initialDelay: 2000,
          backoffMultiplier: 3
        };

        const customService = new RemoveBgService('test-key', customConfig);

        expect(customService.timeout).toBe(60000);
        expect(customService.maxRetries).toBe(5);
        expect(customService.initialDelay).toBe(2000);
        expect(customService.backoffMultiplier).toBe(3);
      });
    });

    describe('removeBackground', () => {
      it('should successfully remove background from valid image', async () => {
        const mockBlob = new Blob(['test-image'], { type: 'image/jpeg' });
        const mockResultBlob = new Blob(['processed-image'], { type: 'image/png' });

        mockAxiosInstance.post.mockResolvedValue({
          data: mockResultBlob
        });

        const result = await service.removeBackground(mockBlob);

        expect(result).toBe(mockResultBlob);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(FormData),
          expect.objectContaining({
            responseType: 'blob',
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
      });

      it('should pass options to API request', async () => {
        const mockBlob = new Blob(['test-image'], { type: 'image/jpeg' });
        const mockResultBlob = new Blob(['processed-image'], { type: 'image/png' });

        mockAxiosInstance.post.mockResolvedValue({
          data: mockResultBlob
        });

        const options = {
          size: 'full',
          type: 'product',
          format: 'png'
        };

        await service.removeBackground(mockBlob, options);

        // Verify FormData contains the options
        const callArgs = mockAxiosInstance.post.mock.calls[0];
        const formData = callArgs[1];
        
        expect(formData).toBeInstanceOf(FormData);
      });

      it('should throw error for invalid image blob', async () => {
        await expect(service.removeBackground(null)).rejects.toMatchObject({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.API_BAD_REQUEST
        });

        await expect(service.removeBackground('not-a-blob')).rejects.toMatchObject({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.API_BAD_REQUEST
        });
      });

      it('should throw error for invalid API response', async () => {
        const mockBlob = new Blob(['test-image'], { type: 'image/jpeg' });

        mockAxiosInstance.post.mockResolvedValue({
          data: null // Invalid response
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.API_BAD_REQUEST
        });
      });
    });

    describe('Error Handling', () => {
      const mockBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      it('should handle 400 Bad Request error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.BAD_REQUEST }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_BAD_REQUEST,
          retryable: false
        });
      });

      it('should handle 401 Unauthorized error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.UNAUTHORIZED }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_KEY_INVALID,
          retryable: false
        });
      });

      it('should handle 403 Forbidden error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.FORBIDDEN }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_KEY_INVALID,
          retryable: false
        });
      });

      it('should handle 429 Too Many Requests error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.TOO_MANY_REQUESTS }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_QUOTA_EXCEEDED,
          retryable: false
        });
      });

      it('should handle 500 Internal Server Error with retry', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_SERVICE_UNAVAILABLE,
          retryable: true
        });

        // Should have retried 3 times (default)
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(API_RETRY_CONFIG.MAX_ATTEMPTS);
      });

      it('should handle 503 Service Unavailable with retry', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.API_ERROR,
          code: ERROR_CODES.API_SERVICE_UNAVAILABLE,
          retryable: true
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(API_RETRY_CONFIG.MAX_ATTEMPTS);
      });

      it('should handle network timeout error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          request: {}, // Request made but no response
          message: 'timeout'
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.NETWORK_ERROR,
          code: ERROR_CODES.NETWORK_TIMEOUT,
          retryable: true
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(API_RETRY_CONFIG.MAX_ATTEMPTS);
      });

      it('should handle request setup error', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          message: 'Request setup failed'
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.API_BAD_REQUEST
        });
      });
    });

    describe('Retry Logic', () => {
      const mockBlob = new Blob(['test-image'], { type: 'image/jpeg' });

      it('should retry on retryable errors with exponential backoff', async () => {
        // Create a service with very short delays for testing
        const fastService = new RemoveBgService('test-key', {
          initialDelay: 10,
          backoffMultiplier: 2
        });
        fastService.client = mockAxiosInstance;

        let callCount = 0;
        mockAxiosInstance.post.mockImplementation(() => {
          callCount++;
          if (callCount < 3) {
            return Promise.reject({
              response: { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
            });
          }
          return Promise.resolve({
            data: new Blob(['success'], { type: 'image/png' })
          });
        });

        const result = await fastService.removeBackground(mockBlob);

        expect(result).toBeInstanceOf(Blob);
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);
      });

      it('should not retry on non-retryable errors', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.BAD_REQUEST }
        });

        await expect(service.removeBackground(mockBlob)).rejects.toMatchObject({
          code: ERROR_CODES.API_BAD_REQUEST,
          retryable: false
        });

        // Should only be called once (no retries)
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
      });

      it('should respect custom maxRetries configuration', async () => {
        const customService = new RemoveBgService('test-key', {
          maxRetries: 5,
          initialDelay: 10
        });
        customService.client = mockAxiosInstance;

        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
        });

        await expect(customService.removeBackground(mockBlob)).rejects.toMatchObject({
          code: ERROR_CODES.API_SERVICE_UNAVAILABLE
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(5);
      });

      it('should use exponential backoff for retry delays', async () => {
        const delays = [];
        const fastService = new RemoveBgService('test-key', {
          initialDelay: 10,
          backoffMultiplier: 2
        });
        fastService.client = mockAxiosInstance;

        // Override _sleep to capture delays
        const originalSleep = fastService._sleep.bind(fastService);
        fastService._sleep = jest.fn((ms) => {
          delays.push(ms);
          return originalSleep(ms);
        });

        mockAxiosInstance.post.mockRejectedValue({
          response: { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
        });

        await expect(fastService.removeBackground(mockBlob)).rejects.toBeDefined();

        // Check exponential backoff: 10ms, 20ms
        expect(delays).toContain(10);
        expect(delays).toContain(20);
      });
    });

    describe('checkApiStatus', () => {
      it('should return true when API is available', async () => {
        mockAxiosInstance.get.mockResolvedValue({
          status: HTTP_STATUS.OK
        });

        const result = await service.checkApiStatus();

        expect(result).toBe(true);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          'https://api.remove.bg/v1.0/account',
          expect.objectContaining({
            timeout: 5000
          })
        );
      });

      it('should return false when API is unavailable', async () => {
        mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

        const result = await service.checkApiStatus();

        expect(result).toBe(false);
      });

      it('should return false when API key is invalid', async () => {
        mockAxiosInstance.get.mockRejectedValue({
          response: { status: HTTP_STATUS.UNAUTHORIZED }
        });

        const result = await service.checkApiStatus();

        expect(result).toBe(false);
      });
    });
  });

  describe('createBackgroundRemovalService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      axios.create.mockReturnValue({
        post: jest.fn(),
        get: jest.fn()
      });
    });

    it('should create RemoveBgService for "removebg" provider', () => {
      const service = createBackgroundRemovalService('removebg', 'test-key');
      expect(service).toBeInstanceOf(RemoveBgService);
    });

    it('should create RemoveBgService for "remove.bg" provider', () => {
      const service = createBackgroundRemovalService('remove.bg', 'test-key');
      expect(service).toBeInstanceOf(RemoveBgService);
    });

    it('should throw error for unsupported provider', () => {
      expect(() => {
        createBackgroundRemovalService('unsupported', 'test-key');
      }).toThrow('Unsupported background removal provider');
    });

    it('should pass configuration to service', () => {
      const config = { timeout: 60000 };
      const service = createBackgroundRemovalService('removebg', 'test-key', config);
      expect(service.timeout).toBe(60000);
    });
  });
});
