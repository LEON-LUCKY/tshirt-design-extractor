/**
 * Unit tests for ImageProcessorService
 * 
 * Tests the image processing workflow including:
 * - Main processing pipeline
 * - Image compression
 * - Background removal
 * - Blob to DataURL conversion
 * - Result caching
 */

import { ImageProcessorService } from '@/services/ImageProcessorService';
import CanvasUtility from '@/services/CanvasUtility';
import {
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  ERROR_TYPES,
  ERROR_CODES
} from '@/constants';

describe('ImageProcessorService', () => {
  let service;
  let mockBackgroundRemovalApi;

  beforeEach(() => {
    // Create fresh service instance for each test
    service = new ImageProcessorService();

    // Create mock API service
    mockBackgroundRemovalApi = {
      removeBackground: jest.fn().mockResolvedValue(
        new Blob(['mock-extracted-image'], { type: 'image/png' })
      ),
      checkApiStatus: jest.fn().mockResolvedValue(true)
    };

    // Set mock API
    service.setBackgroundRemovalApi(mockBackgroundRemovalApi);

    // Clear cache before each test
    service.clearCache();

    // Mock CanvasUtility.loadImage to avoid image loading issues in tests
    jest.spyOn(CanvasUtility, 'loadImage').mockImplementation((dataUrl) => {
      const img = new Image();
      img.width = 100;
      img.height = 100;
      img.src = dataUrl;
      return Promise.resolve(img);
    });
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('setBackgroundRemovalApi', () => {
    it('should set the background removal API service', () => {
      const newService = new ImageProcessorService();
      const mockApi = { removeBackground: jest.fn() };
      
      newService.setBackgroundRemovalApi(mockApi);
      
      expect(newService.backgroundRemovalApi).toBe(mockApi);
    });
  });

  describe('processImage', () => {
    it('should process a valid image file successfully', async () => {
      // Create a test file
      const file = new File(['test-image-data'], 'test.png', { type: 'image/png' });

      const result = await service.processImage(file);

      expect(result).toHaveProperty('originalDataUrl');
      expect(result).toHaveProperty('extractedDataUrl');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result).toHaveProperty('processingTime');
      expect(result.fromCache).toBe(false);
      expect(result.width).toBe(100); // From mocked Image
      expect(result.height).toBe(100); // From mocked Image
      expect(mockBackgroundRemovalApi.removeBackground).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no file is provided', async () => {
      await expect(service.processImage(null)).rejects.toThrow();
    });

    it('should throw error if invalid file is provided', async () => {
      await expect(service.processImage({})).rejects.toThrow();
    });

    it('should throw error if API service is not configured', async () => {
      const newService = new ImageProcessorService();
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      await expect(newService.processImage(file)).rejects.toMatchObject({
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_SERVICE_UNAVAILABLE
      });
    });

    it('should return cached result on second call with same file', async () => {
      // Create test file
      const file = new File(['test-image-data'], 'test.png', { 
        type: 'image/png',
        lastModified: 1234567890
      });

      // First call
      const result1 = await service.processImage(file);
      expect(result1.fromCache).toBe(false);
      expect(mockBackgroundRemovalApi.removeBackground).toHaveBeenCalledTimes(1);

      // Second call with same file
      const result2 = await service.processImage(file);
      expect(result2.fromCache).toBe(true);
      expect(result2.originalDataUrl).toBe(result1.originalDataUrl);
      expect(result2.extractedDataUrl).toBe(result1.extractedDataUrl);
      // API should not be called again
      expect(mockBackgroundRemovalApi.removeBackground).toHaveBeenCalledTimes(1);
    });

    it('should compress large images before processing', async () => {
      // Create a large test file
      const file = new File(['large-image-data'], 'large.png', { type: 'image/png' });

      // Mock loadImage to return large image dimensions
      const largeMockImage = {
        width: 3000,
        height: 2000,
        src: ''
      };
      
      // Replace the default mock for this test
      CanvasUtility.loadImage.mockResolvedValueOnce(largeMockImage);

      // Mock resizeImage to return a smaller canvas
      const mockResizedCanvas = document.createElement('canvas');
      mockResizedCanvas.width = MAX_IMAGE_WIDTH;
      mockResizedCanvas.height = Math.round(2000 * (MAX_IMAGE_WIDTH / 3000));
      jest.spyOn(CanvasUtility, 'resizeImage').mockReturnValueOnce(mockResizedCanvas);

      await service.processImage(file);

      // Verify API was called
      expect(mockBackgroundRemovalApi.removeBackground).toHaveBeenCalled();
      
      // Verify resizeImage was called (compression happened)
      expect(CanvasUtility.resizeImage).toHaveBeenCalledWith(
        largeMockImage,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT
      );
    });
  });

  describe('compressImage', () => {
    it('should not compress images smaller than max dimensions', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'small.png', { type: 'image/png' });

      const img = new Image();
      img.width = 800;
      img.height = 600;

      const result = await service.compressImage(file, img);

      // Should return original file
      expect(result).toBe(file);
    });

    it('should compress images larger than max dimensions', async () => {
      // Create large image
      const canvas = document.createElement('canvas');
      canvas.width = 3000;
      canvas.height = 2000;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 3000, 2000);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'large.png', { type: 'image/png' });

      const img = new Image();
      img.width = 3000;
      img.height = 2000;

      // Mock resizeImage to return a smaller canvas
      const mockResizedCanvas = document.createElement('canvas');
      mockResizedCanvas.width = MAX_IMAGE_WIDTH;
      mockResizedCanvas.height = Math.round(2000 * (MAX_IMAGE_WIDTH / 3000));
      
      jest.spyOn(CanvasUtility, 'resizeImage').mockReturnValue(mockResizedCanvas);

      const result = await service.compressImage(file, img);

      expect(result).toBeInstanceOf(Blob);
      expect(result).not.toBe(file);
      expect(CanvasUtility.resizeImage).toHaveBeenCalledWith(
        img,
        MAX_IMAGE_WIDTH,
        MAX_IMAGE_HEIGHT
      );

      // Restore mock
      CanvasUtility.resizeImage.mockRestore();
    });

    it('should throw error if compression fails', async () => {
      const img = new Image();
      img.width = 3000;
      img.height = 2000;

      const file = new File(['test'], 'test.png', { type: 'image/png' });

      // Mock resizeImage to throw error
      jest.spyOn(CanvasUtility, 'resizeImage').mockImplementation(() => {
        throw new Error('Resize failed');
      });

      await expect(service.compressImage(file, img)).rejects.toMatchObject({
        type: ERROR_TYPES.PROCESSING_ERROR,
        code: ERROR_CODES.CANVAS_ERROR
      });

      CanvasUtility.resizeImage.mockRestore();
    });
  });

  describe('removeBackground', () => {
    it('should call API service with correct parameters', async () => {
      const blob = new Blob(['test-image'], { type: 'image/png' });

      const result = await service.removeBackground(blob);

      expect(mockBackgroundRemovalApi.removeBackground).toHaveBeenCalledWith(
        blob,
        {
          size: 'auto',
          type: 'auto',
          format: 'png'
        }
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should throw error if API service is not configured', async () => {
      const newService = new ImageProcessorService();
      const blob = new Blob(['test'], { type: 'image/png' });

      await expect(newService.removeBackground(blob)).rejects.toMatchObject({
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_SERVICE_UNAVAILABLE
      });
    });

    it('should propagate API errors', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const apiError = new Error('API failed');
      apiError.type = ERROR_TYPES.API_ERROR;
      apiError.code = ERROR_CODES.API_QUOTA_EXCEEDED;

      mockBackgroundRemovalApi.removeBackground.mockRejectedValue(apiError);

      await expect(service.removeBackground(blob)).rejects.toMatchObject({
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_QUOTA_EXCEEDED
      });
    });
  });

  describe('blobToDataUrl', () => {
    it('should convert blob to DataURL successfully', async () => {
      const blob = new Blob(['test-data'], { type: 'image/png' });

      const dataUrl = await service.blobToDataUrl(blob);

      expect(typeof dataUrl).toBe('string');
      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('should throw error if blob is null', async () => {
      await expect(service.blobToDataUrl(null)).rejects.toMatchObject({
        type: ERROR_TYPES.PROCESSING_ERROR,
        code: ERROR_CODES.CANVAS_ERROR
      });
    });

    it('should throw error if blob is invalid', async () => {
      await expect(service.blobToDataUrl({})).rejects.toMatchObject({
        type: ERROR_TYPES.PROCESSING_ERROR,
        code: ERROR_CODES.CANVAS_ERROR
      });
    });
  });

  describe('Cache functionality', () => {
    it('should cache processing results', async () => {
      const file = new File(['test-data'], 'test.png', { 
        type: 'image/png',
        lastModified: 1234567890
      });

      // Process image
      await service.processImage(file);

      // Check cache stats
      const stats = service.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys.length).toBe(1);
    });

    it('should clear cache when clearCache is called', async () => {
      const file = new File(['test-data'], 'test.png', { type: 'image/png' });

      // Process and cache
      await service.processImage(file);
      expect(service.getCacheStats().size).toBe(1);

      // Clear cache
      service.clearCache();
      expect(service.getCacheStats().size).toBe(0);
    });

    it('should evict oldest entry when cache is full', async () => {
      // Process multiple different files to fill cache beyond MAX_CACHE_SIZE
      // The service uses MAX_CACHE_SIZE from constants (10)
      const filesToProcess = 11; // One more than MAX_CACHE_SIZE
      
      for (let i = 0; i < filesToProcess; i++) {
        const file = new File(['test-data'], `test${i}.png`, { 
          type: 'image/png',
          lastModified: Date.now() + i
        });

        await service.processImage(file);
      }

      // Cache should not exceed MAX_CACHE_SIZE (10 from constants)
      const stats = service.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
      expect(stats.size).toBe(10); // Should be exactly MAX_CACHE_SIZE
    });

    it('should generate different cache keys for different files', () => {
      const file1 = new File(['test1'], 'file1.png', { 
        type: 'image/png',
        lastModified: 1000
      });
      const file2 = new File(['test2'], 'file2.png', { 
        type: 'image/png',
        lastModified: 2000
      });

      const key1 = service._generateCacheKey(file1);
      const key2 = service._generateCacheKey(file2);

      expect(key1).not.toBe(key2);
    });

    it('should generate same cache key for identical file properties', () => {
      const file1 = new File(['test'], 'file.png', { 
        type: 'image/png',
        lastModified: 1000
      });
      const file2 = new File(['test'], 'file.png', { 
        type: 'image/png',
        lastModified: 1000
      });

      const key1 = service._generateCacheKey(file1);
      const key2 = service._generateCacheKey(file2);

      expect(key1).toBe(key2);
    });
  });

  describe('Error handling', () => {
    it('should create error with correct structure', () => {
      const error = service._createError(
        ERROR_TYPES.PROCESSING_ERROR,
        ERROR_CODES.CANVAS_ERROR,
        'Test error',
        true
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(ERROR_TYPES.PROCESSING_ERROR);
      expect(error.code).toBe(ERROR_CODES.CANVAS_ERROR);
      expect(error.details).toBe('Test error');
      expect(error.retryable).toBe(true);
    });

    it('should handle API errors during processing', async () => {
      const file = new File(['test-data'], 'test.png', { type: 'image/png' });

      const apiError = new Error('API error');
      apiError.type = ERROR_TYPES.API_ERROR;
      apiError.code = ERROR_CODES.API_SERVICE_UNAVAILABLE;

      mockBackgroundRemovalApi.removeBackground.mockRejectedValue(apiError);

      await expect(service.processImage(file)).rejects.toMatchObject({
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_SERVICE_UNAVAILABLE
      });
    });
  });
});
