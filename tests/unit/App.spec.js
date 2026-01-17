/**
 * Unit tests for App.vue state management
 * 
 * Tests the state management logic including:
 * - Upload handling
 * - Image processing
 * - Download functionality
 * - Error handling and recovery
 * - State transitions
 */

import { shallowMount } from '@vue/test-utils';
import App from '@/App.vue';
import ImageProcessorService from '@/services/ImageProcessorService';
import DownloadManager from '@/services/DownloadManager';
import { ERROR_TYPES, ERROR_CODES, PROCESSING_STATUS } from '@/constants';

// Mock the services
jest.mock('@/services/ImageProcessorService');
jest.mock('@/services/DownloadManager');

describe('App.vue State Management', () => {
  let wrapper;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create wrapper
    wrapper = shallowMount(App);
  });
  
  afterEach(() => {
    wrapper.destroy();
  });
  
  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      expect(wrapper.vm.uploadedFile).toBeNull();
      expect(wrapper.vm.originalImageUrl).toBeNull();
      expect(wrapper.vm.isProcessing).toBe(false);
      expect(wrapper.vm.processingProgress).toBe(0);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.IDLE);
      expect(wrapper.vm.extractedImageUrl).toBeNull();
      expect(wrapper.vm.processedImage).toBeNull();
      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.showComparison).toBe(false);
    });
  });
  
  describe('uploadImage method', () => {
    it('should store uploaded file and preview URL', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataUrl = 'data:image/jpeg;base64,test';
      
      await wrapper.vm.uploadImage(file, dataUrl);
      
      expect(wrapper.vm.uploadedFile).toBe(file);
      expect(wrapper.vm.originalImageUrl).toBe(dataUrl);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.IDLE);
    });
    
    it('should clear previous results when uploading new image', async () => {
      // Set some previous state
      wrapper.vm.extractedImageUrl = 'previous-url';
      wrapper.vm.processedImage = { some: 'data' };
      wrapper.vm.showComparison = true;
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataUrl = 'data:image/jpeg;base64,test';
      
      await wrapper.vm.uploadImage(file, dataUrl);
      
      expect(wrapper.vm.extractedImageUrl).toBeNull();
      expect(wrapper.vm.processedImage).toBeNull();
      expect(wrapper.vm.showComparison).toBe(false);
    });
    
    it('should clear previous errors when uploading new image', async () => {
      wrapper.vm.error = { type: ERROR_TYPES.UPLOAD_ERROR, message: 'test error' };
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dataUrl = 'data:image/jpeg;base64,test';
      
      await wrapper.vm.uploadImage(file, dataUrl);
      
      expect(wrapper.vm.error).toBeNull();
    });
  });
  
  describe('processImage method', () => {
    it('should process image successfully', async () => {
      // Setup
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      wrapper.vm.uploadedFile = file;
      
      const mockResult = {
        originalDataUrl: 'data:image/jpeg;base64,original',
        extractedDataUrl: 'data:image/png;base64,extracted',
        width: 800,
        height: 600,
        processingTime: 1500,
        fromCache: false
      };
      
      ImageProcessorService.processImage.mockResolvedValue(mockResult);
      
      // Execute
      await wrapper.vm.processImage();
      
      // Verify
      expect(ImageProcessorService.processImage).toHaveBeenCalledWith(file);
      expect(wrapper.vm.processedImage).toEqual(mockResult);
      expect(wrapper.vm.extractedImageUrl).toBe(mockResult.extractedDataUrl);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.COMPLETE);
      expect(wrapper.vm.processingProgress).toBe(100);
      expect(wrapper.vm.showComparison).toBe(true);
      expect(wrapper.vm.isProcessing).toBe(false);
    });
    
    it('should set processing state during processing', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      wrapper.vm.uploadedFile = file;
      
      // Mock a delayed response
      ImageProcessorService.processImage.mockImplementation(() => {
        // Check state during processing
        expect(wrapper.vm.isProcessing).toBe(true);
        expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.REMOVING_BACKGROUND);
        
        return Promise.resolve({
          originalDataUrl: 'data:image/jpeg;base64,original',
          extractedDataUrl: 'data:image/png;base64,extracted',
          width: 800,
          height: 600,
          processingTime: 1500
        });
      });
      
      await wrapper.vm.processImage();
      
      expect(wrapper.vm.isProcessing).toBe(false);
    });
    
    it('should handle error when no file is uploaded', async () => {
      wrapper.vm.uploadedFile = null;
      
      await wrapper.vm.processImage();
      
      expect(wrapper.vm.error).not.toBeNull();
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.PROCESSING_ERROR);
      expect(wrapper.vm.error.retryable).toBe(false);
      expect(ImageProcessorService.processImage).not.toHaveBeenCalled();
    });
    
    it('should handle processing errors', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      wrapper.vm.uploadedFile = file;
      
      const mockError = new Error('Processing failed');
      ImageProcessorService.processImage.mockRejectedValue(mockError);
      
      await wrapper.vm.processImage();
      
      expect(wrapper.vm.error).not.toBeNull();
      expect(wrapper.vm.isProcessing).toBe(false);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.ERROR);
    });
    
    it('should clear previous errors before processing', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      wrapper.vm.uploadedFile = file;
      wrapper.vm.error = { type: ERROR_TYPES.PROCESSING_ERROR, message: 'old error' };
      
      ImageProcessorService.processImage.mockResolvedValue({
        originalDataUrl: 'data:image/jpeg;base64,original',
        extractedDataUrl: 'data:image/png;base64,extracted',
        width: 800,
        height: 600,
        processingTime: 1500
      });
      
      await wrapper.vm.processImage();
      
      expect(wrapper.vm.error).toBeNull();
    });
  });
  
  describe('downloadExtracted method', () => {
    it('should download extracted image successfully', () => {
      wrapper.vm.extractedImageUrl = 'data:image/png;base64,extracted';
      
      const mockFilename = 'extracted-design-2024-01-01T12-00-00.png';
      DownloadManager.generateFilename.mockReturnValue(mockFilename);
      DownloadManager.downloadImage.mockImplementation(() => {});
      
      wrapper.vm.downloadExtracted();
      
      expect(DownloadManager.generateFilename).toHaveBeenCalled();
      expect(DownloadManager.downloadImage).toHaveBeenCalledWith(
        wrapper.vm.extractedImageUrl,
        mockFilename
      );
    });
    
    it('should handle error when no extracted image is available', () => {
      wrapper.vm.extractedImageUrl = null;
      
      wrapper.vm.downloadExtracted();
      
      expect(wrapper.vm.error).not.toBeNull();
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.PROCESSING_ERROR);
      expect(DownloadManager.downloadImage).not.toHaveBeenCalled();
    });
    
    it('should handle download errors', () => {
      wrapper.vm.extractedImageUrl = 'data:image/png;base64,extracted';
      
      DownloadManager.generateFilename.mockReturnValue('test.png');
      DownloadManager.downloadImage.mockImplementation(() => {
        throw new Error('Download failed');
      });
      
      wrapper.vm.downloadExtracted();
      
      expect(wrapper.vm.error).not.toBeNull();
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.PROCESSING_ERROR);
      expect(wrapper.vm.error.retryable).toBe(true);
    });
  });
  
  describe('reset method', () => {
    it('should reset all state to initial values', () => {
      // Set some state
      wrapper.vm.uploadedFile = new File(['test'], 'test.jpg');
      wrapper.vm.originalImageUrl = 'data:image/jpeg;base64,test';
      wrapper.vm.extractedImageUrl = 'data:image/png;base64,extracted';
      wrapper.vm.processedImage = { some: 'data' };
      wrapper.vm.error = { type: ERROR_TYPES.PROCESSING_ERROR };
      wrapper.vm.isProcessing = true;
      wrapper.vm.processingProgress = 50;
      wrapper.vm.processingStatus = PROCESSING_STATUS.REMOVING_BACKGROUND;
      wrapper.vm.showComparison = true;
      
      // Reset
      wrapper.vm.reset();
      
      // Verify all state is cleared
      expect(wrapper.vm.uploadedFile).toBeNull();
      expect(wrapper.vm.originalImageUrl).toBeNull();
      expect(wrapper.vm.extractedImageUrl).toBeNull();
      expect(wrapper.vm.processedImage).toBeNull();
      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.isProcessing).toBe(false);
      expect(wrapper.vm.processingProgress).toBe(0);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.IDLE);
      expect(wrapper.vm.showComparison).toBe(false);
    });
  });
  
  describe('handleProcessingError method', () => {
    it('should handle structured errors', () => {
      const structuredError = {
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_KEY_INVALID,
        message: 'API key invalid',
        retryable: false
      };
      
      wrapper.vm.handleProcessingError(structuredError);
      
      expect(wrapper.vm.error).toEqual(structuredError);
      expect(wrapper.vm.processingStatus).toBe(PROCESSING_STATUS.ERROR);
    });
    
    it('should handle network errors', () => {
      const networkError = new Error('network error occurred');
      
      wrapper.vm.handleProcessingError(networkError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.NETWORK_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.NETWORK_OFFLINE);
      expect(wrapper.vm.error.retryable).toBe(true);
    });
    
    it('should handle API 401 errors', () => {
      const apiError = {
        response: { status: 401 },
        message: 'Unauthorized'
      };
      
      wrapper.vm.handleProcessingError(apiError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.API_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.API_KEY_INVALID);
      expect(wrapper.vm.error.retryable).toBe(false);
    });
    
    it('should handle API 429 errors', () => {
      const apiError = {
        response: { status: 429 },
        message: 'Too many requests'
      };
      
      wrapper.vm.handleProcessingError(apiError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.API_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.API_QUOTA_EXCEEDED);
      expect(wrapper.vm.error.retryable).toBe(false);
    });
    
    it('should handle API 400 errors', () => {
      const apiError = {
        response: { status: 400 },
        message: 'Bad request'
      };
      
      wrapper.vm.handleProcessingError(apiError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.API_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.API_BAD_REQUEST);
      expect(wrapper.vm.error.retryable).toBe(true);
    });
    
    it('should handle API 500 errors', () => {
      const apiError = {
        response: { status: 500 },
        message: 'Internal server error'
      };
      
      wrapper.vm.handleProcessingError(apiError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.API_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.API_SERVICE_UNAVAILABLE);
      expect(wrapper.vm.error.retryable).toBe(true);
    });
    
    it('should handle generic processing errors', () => {
      const genericError = new Error('Something went wrong');
      
      wrapper.vm.handleProcessingError(genericError);
      
      expect(wrapper.vm.error.type).toBe(ERROR_TYPES.PROCESSING_ERROR);
      expect(wrapper.vm.error.code).toBe(ERROR_CODES.CANVAS_ERROR);
      expect(wrapper.vm.error.retryable).toBe(true);
    });
  });
  
  describe('retry method', () => {
    it('should retry processing when error is retryable', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      wrapper.vm.uploadedFile = file;
      wrapper.vm.error = {
        type: ERROR_TYPES.NETWORK_ERROR,
        code: ERROR_CODES.NETWORK_OFFLINE,
        retryable: true
      };
      
      ImageProcessorService.processImage.mockResolvedValue({
        originalDataUrl: 'data:image/jpeg;base64,original',
        extractedDataUrl: 'data:image/png;base64,extracted',
        width: 800,
        height: 600,
        processingTime: 1500
      });
      
      await wrapper.vm.retry();
      
      expect(wrapper.vm.error).toBeNull();
      expect(ImageProcessorService.processImage).toHaveBeenCalled();
    });
    
    it('should not retry when error is not retryable', async () => {
      wrapper.vm.error = {
        type: ERROR_TYPES.API_ERROR,
        code: ERROR_CODES.API_KEY_INVALID,
        retryable: false
      };
      
      await wrapper.vm.retry();
      
      expect(ImageProcessorService.processImage).not.toHaveBeenCalled();
    });
    
    it('should not retry when there is no error', async () => {
      wrapper.vm.error = null;
      
      await wrapper.vm.retry();
      
      expect(ImageProcessorService.processImage).not.toHaveBeenCalled();
    });
  });
  
  describe('Computed Properties', () => {
    describe('canDownload', () => {
      it('should return true when extracted image is available and not processing', () => {
        wrapper.vm.extractedImageUrl = 'data:image/png;base64,extracted';
        wrapper.vm.isProcessing = false;
        
        expect(wrapper.vm.canDownload).toBe(true);
      });
      
      it('should return false when no extracted image', () => {
        wrapper.vm.extractedImageUrl = null;
        wrapper.vm.isProcessing = false;
        
        expect(wrapper.vm.canDownload).toBe(false);
      });
      
      it('should return false when processing', () => {
        wrapper.vm.extractedImageUrl = 'data:image/png;base64,extracted';
        wrapper.vm.isProcessing = true;
        
        expect(wrapper.vm.canDownload).toBe(false);
      });
    });
    
    describe('canProcess', () => {
      it('should return true when image is uploaded and not processing', () => {
        wrapper.vm.originalImageUrl = 'data:image/jpeg;base64,original';
        wrapper.vm.isProcessing = false;
        
        expect(wrapper.vm.canProcess).toBe(true);
      });
      
      it('should return false when no image uploaded', () => {
        wrapper.vm.originalImageUrl = null;
        wrapper.vm.isProcessing = false;
        
        expect(wrapper.vm.canProcess).toBe(false);
      });
      
      it('should return false when processing', () => {
        wrapper.vm.originalImageUrl = 'data:image/jpeg;base64,original';
        wrapper.vm.isProcessing = true;
        
        expect(wrapper.vm.canProcess).toBe(false);
      });
    });
    
    describe('canRetry', () => {
      it('should return true when error is retryable', () => {
        wrapper.vm.error = {
          type: ERROR_TYPES.NETWORK_ERROR,
          retryable: true
        };
        
        expect(wrapper.vm.canRetry).toBe(true);
      });
      
      it('should return false when error is not retryable', () => {
        wrapper.vm.error = {
          type: ERROR_TYPES.API_ERROR,
          retryable: false
        };
        
        expect(wrapper.vm.canRetry).toBe(false);
      });
      
      it('should return false when no error', () => {
        wrapper.vm.error = null;
        
        expect(wrapper.vm.canRetry).toBe(false);
      });
    });
  });
  
  describe('Mobile Detection', () => {
    it('should detect mobile viewport on mount', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      const mobileWrapper = shallowMount(App);
      
      expect(mobileWrapper.vm.isMobile).toBe(true);
      
      mobileWrapper.destroy();
    });
    
    it('should detect desktop viewport on mount', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      const desktopWrapper = shallowMount(App);
      
      expect(desktopWrapper.vm.isMobile).toBe(false);
      
      desktopWrapper.destroy();
    });
    
    it('should update mobile state on window resize', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      const resizeWrapper = shallowMount(App);
      expect(resizeWrapper.vm.isMobile).toBe(false);
      
      // Simulate resize to mobile
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
      
      expect(resizeWrapper.vm.isMobile).toBe(true);
      
      resizeWrapper.destroy();
    });
  });
});
