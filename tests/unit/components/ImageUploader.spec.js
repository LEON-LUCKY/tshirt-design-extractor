/**
 * Unit Tests for ImageUploader Component
 * 
 * Tests file selection, drag-and-drop, validation, preview generation,
 * and error handling.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { mount } from '@vue/test-utils';
import ImageUploader from '@/components/ImageUploader.vue';
import { ERROR_CODES } from '@/constants';

describe('ImageUploader Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ImageUploader);
  });

  afterEach(() => {
    wrapper.destroy();
  });

  describe('Component Rendering', () => {
    it('should render upload area', () => {
      expect(wrapper.find('.upload-area').exists()).toBe(true);
    });

    it('should render file input', () => {
      const fileInput = wrapper.find('input[type="file"]');
      expect(fileInput.exists()).toBe(true);
    });

    it('should show upload prompt when no preview', () => {
      expect(wrapper.find('.upload-prompt').exists()).toBe(true);
      expect(wrapper.find('.preview-container').exists()).toBe(false);
    });
  });

  describe('File Selection', () => {
    it('should emit image-selected event when valid file is selected', async () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null,
        result: 'data:image/jpeg;base64,test'
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const input = wrapper.find('input[type="file"]');
      
      // Simulate file selection
      Object.defineProperty(input.element, 'files', {
        value: [file],
        writable: false
      });
      
      await input.trigger('change');
      
      // Trigger FileReader onload
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('image-selected')).toBeTruthy();
      expect(wrapper.emitted('image-selected')[0][0]).toBe(file);
      expect(wrapper.emitted('image-selected')[0][1]).toBe('data:image/jpeg;base64,test');
    });

    it('should show preview after valid file selection', async () => {
      wrapper.vm.previewUrl = 'data:image/jpeg;base64,test';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.preview-container').exists()).toBe(true);
      expect(wrapper.find('.preview-image').exists()).toBe(true);
      expect(wrapper.find('.upload-prompt').exists()).toBe(false);
    });
  });

  describe('File Validation', () => {
    it('should emit upload-error when file is too large', async () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024,
        writable: false
      });
      
      wrapper.vm.processFile(largeFile);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('upload-error')).toBeTruthy();
      const error = wrapper.emitted('upload-error')[0][0];
      expect(error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should emit upload-error when file type is invalid', async () => {
      const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      wrapper.vm.processFile(invalidFile);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('upload-error')).toBeTruthy();
      const error = wrapper.emitted('upload-error')[0][0];
      expect(error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should display error message when validation fails', async () => {
      const invalidFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      
      wrapper.vm.processFile(invalidFile);
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.error-message').exists()).toBe(true);
      expect(wrapper.vm.errorMessage).toBeTruthy();
    });
  });

  describe('Drag and Drop', () => {
    it('should add drag-over class on dragover', async () => {
      const uploadArea = wrapper.find('.upload-area');
      
      await uploadArea.trigger('dragover');
      
      expect(wrapper.vm.isDragOver).toBe(true);
      expect(uploadArea.classes()).toContain('drag-over');
    });

    it('should remove drag-over class on dragleave', async () => {
      wrapper.vm.isDragOver = true;
      await wrapper.vm.$nextTick();
      
      const uploadArea = wrapper.find('.upload-area');
      await uploadArea.trigger('dragleave');
      
      expect(wrapper.vm.isDragOver).toBe(false);
      expect(uploadArea.classes()).not.toContain('drag-over');
    });

    it('should process file on drop', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      // Mock FileReader for this test
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null,
        onerror: null,
        result: 'data:image/jpeg;base64,test'
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const uploadArea = wrapper.find('.upload-area');
      const dropEvent = {
        dataTransfer: {
          files: [file]
        }
      };
      
      await uploadArea.trigger('drop', dropEvent);
      
      // Trigger FileReader onload
      if (mockFileReader.onload) {
        mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
      }
      
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isDragOver).toBe(false);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });
  });

  describe('Clear Image', () => {
    it('should clear preview when clear button is clicked', async () => {
      wrapper.vm.previewUrl = 'data:image/jpeg;base64,test';
      wrapper.vm.currentFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await wrapper.vm.$nextTick();
      
      const clearButton = wrapper.find('.clear-button');
      await clearButton.trigger('click');
      
      expect(wrapper.vm.previewUrl).toBeNull();
      expect(wrapper.vm.currentFile).toBeNull();
      expect(wrapper.emitted('image-cleared')).toBeTruthy();
    });

    it('should reset error message when clearing image', async () => {
      wrapper.vm.errorMessage = 'Test error';
      wrapper.vm.previewUrl = 'data:image/jpeg;base64,test';
      await wrapper.vm.$nextTick();
      
      wrapper.vm.clearImage();
      
      expect(wrapper.vm.errorMessage).toBeNull();
    });
  });

  describe('Props', () => {
    it('should accept custom maxFileSize prop', () => {
      const customWrapper = mount(ImageUploader, {
        propsData: {
          maxFileSize: 5 * 1024 * 1024 // 5MB
        }
      });
      
      expect(customWrapper.props().maxFileSize).toBe(5 * 1024 * 1024);
      customWrapper.destroy();
    });

    it('should accept custom acceptedFormats prop', () => {
      const customFormats = ['image/jpeg', 'image/png'];
      const customWrapper = mount(ImageUploader, {
        propsData: {
          acceptedFormats: customFormats
        }
      });
      
      expect(customWrapper.props().acceptedFormats).toEqual(customFormats);
      customWrapper.destroy();
    });
  });

  describe('Public Methods', () => {
    it('should have reset method', () => {
      expect(typeof wrapper.vm.reset).toBe('function');
    });

    it('should reset component state when reset is called', () => {
      wrapper.vm.previewUrl = 'data:image/jpeg;base64,test';
      wrapper.vm.errorMessage = 'Test error';
      wrapper.vm.currentFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      wrapper.vm.reset();
      
      expect(wrapper.vm.previewUrl).toBeNull();
      expect(wrapper.vm.errorMessage).toBeNull();
      expect(wrapper.vm.currentFile).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on file input', () => {
      const fileInput = wrapper.find('input[type="file"]');
      expect(fileInput.attributes('aria-label')).toBeTruthy();
    });

    it('should have role="alert" on error message', async () => {
      wrapper.vm.errorMessage = 'Test error';
      await wrapper.vm.$nextTick();
      
      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.attributes('role')).toBe('alert');
    });

    it('should have alt text on preview image', async () => {
      wrapper.vm.previewUrl = 'data:image/jpeg;base64,test';
      await wrapper.vm.$nextTick();
      
      const previewImage = wrapper.find('.preview-image');
      expect(previewImage.attributes('alt')).toBeTruthy();
    });
  });
});
