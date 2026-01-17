/**
 * Unit Tests for DownloadButton Component
 * 
 * Tests button visibility, download functionality, success feedback,
 * and integration with DownloadManager service.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { mount } from '@vue/test-utils';
import DownloadButton from '@/components/DownloadButton.vue';
import DownloadManager from '@/services/DownloadManager';

// Mock DownloadManager
jest.mock('@/services/DownloadManager', () => {
  const mockGenerateFilename = jest.fn(() => 'extracted-design-2024-01-01T00-00-00-000Z.png');
  const mockDownloadImage = jest.fn();
  
  return {
    __esModule: true,
    default: {
      downloadImage: mockDownloadImage,
      generateFilename: mockGenerateFilename
    },
    downloadImage: mockDownloadImage,
    generateFilename: mockGenerateFilename
  };
});

describe('DownloadButton Component', () => {
  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  describe('Button Visibility', () => {
    it('should not be visible when no extracted image', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: null
        }
      });
      
      expect(wrapper.find('.download-button-container').exists()).toBe(false);
    });

    it('should be visible when extracted image is provided', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.find('.download-button-container').exists()).toBe(true);
    });

    it('should respect explicit visible prop', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: null,
          visible: true
        }
      });
      
      expect(wrapper.find('.download-button-container').exists()).toBe(true);
    });

    it('should hide when visible prop is false even with extracted image', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test',
          visible: false
        }
      });
      
      expect(wrapper.find('.download-button-container').exists()).toBe(false);
    });
  });

  describe('Download Functionality', () => {
    it('should call DownloadManager.downloadImage when button clicked', async () => {
      const extractedImage = 'data:image/png;base64,test';
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(DownloadManager.downloadImage).toHaveBeenCalled();
      expect(DownloadManager.generateFilename).toHaveBeenCalled();
    });

    it('should generate filename with timestamp', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      
      expect(DownloadManager.generateFilename).toHaveBeenCalled();
    });

    it('should use custom filename prefix if provided', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test',
          filenamePrefix: 'my-design'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      
      expect(DownloadManager.generateFilename).toHaveBeenCalledWith('my-design');
    });

    it('should not download when no extracted image', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: null,
          visible: true
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      
      expect(DownloadManager.downloadImage).not.toHaveBeenCalled();
    });

    it('should not download when already downloading', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.isDownloading = true;
      await wrapper.vm.$nextTick();
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      
      expect(DownloadManager.downloadImage).not.toHaveBeenCalled();
    });
  });

  describe('Success Feedback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should emit download-success event after successful download', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('download-success')).toBeTruthy();
      expect(wrapper.emitted('download-success')[0][0]).toHaveProperty('filename');
    });

    it('should show success feedback after download', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.showSuccess).toBe(true);
    });

    it('should hide success feedback after timeout', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.showSuccess).toBe(true);
      
      jest.runAllTimers();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.showSuccess).toBe(false);
    });

    it('should display success feedback UI', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.showSuccess = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.success-feedback').exists()).toBe(true);
      expect(wrapper.find('.success-text').text()).toContain('成功');
    });
  });

  describe('Button States', () => {
    it('should show default icon and text initially', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.vm.buttonIcon).toBe('⬇️');
      expect(wrapper.vm.buttonText).toBe('下载图案');
    });

    it('should show downloading state', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.isDownloading = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.buttonIcon).toBe('⏳');
      expect(wrapper.vm.buttonText).toBe('下载中...');
      expect(wrapper.find('.download-button').classes()).toContain('downloading');
    });

    it('should show success state', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.showSuccess = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.buttonIcon).toBe('✓');
      expect(wrapper.vm.buttonText).toBe('下载成功');
      expect(wrapper.find('.download-button').classes()).toContain('success');
    });

    it('should disable button when downloading', async () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.isDownloading = true;
      await wrapper.vm.$nextTick();
      
      const button = wrapper.find('.download-button');
      expect(button.attributes('disabled')).toBe('disabled');
    });
  });

  describe('Error Handling', () => {
    it('should emit download-error event on failure', async () => {
      const error = new Error('Download failed');
      DownloadManager.downloadImage.mockImplementationOnce(() => {
        throw error;
      });
      
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('download-error')).toBeTruthy();
    });

    it('should reset downloading state after error', async () => {
      DownloadManager.downloadImage.mockImplementationOnce(() => {
        throw new Error('Download failed');
      });
      
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('.download-button');
      await button.trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isDownloading).toBe(false);
    });
  });

  describe('Props', () => {
    it('should accept extractedImage prop', () => {
      const imageUrl = 'data:image/png;base64,test';
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: imageUrl
        }
      });
      
      expect(wrapper.props().extractedImage).toBe(imageUrl);
    });

    it('should accept filenamePrefix prop', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test',
          filenamePrefix: 'custom-prefix'
        }
      });
      
      expect(wrapper.props().filenamePrefix).toBe('custom-prefix');
    });

    it('should use default filenamePrefix', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.props().filenamePrefix).toBe('extracted-design');
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should clear timeout on destroy', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.successTimeout = setTimeout(() => {}, 1000);
      const timeoutId = wrapper.vm.successTimeout;
      
      wrapper.destroy();
      
      // Timeout should be cleared
      expect(wrapper.vm.successTimeout).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should have data-test attribute', () => {
      wrapper = mount(DownloadButton, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const button = wrapper.find('[data-test="download-button"]');
      expect(button.exists()).toBe(true);
    });
  });
});
