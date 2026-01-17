/**
 * Unit Tests for ImageProcessor Component
 * 
 * Tests processing button, loading states, progress display,
 * error messages, and success states.
 * 
 * Requirements: 2.4, 2.5, 5.1, 5.4
 */

import { mount } from '@vue/test-utils';
import ImageProcessor from '@/components/ImageProcessor.vue';
import { PROCESSING_STATUS } from '@/constants';

describe('ImageProcessor Component', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ImageProcessor);
  });

  afterEach(() => {
    wrapper.destroy();
  });

  describe('Component Rendering', () => {
    it('should render process button when not processing and no result', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: false,
          hasResult: false,
          canProcess: true
        }
      });
      
      expect(wrapper.find('.process-button').exists()).toBe(true);
    });

    it('should not render process button when processing', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true,
          hasResult: false
        }
      });
      
      expect(wrapper.find('.process-button').exists()).toBe(false);
    });

    it('should not render process button when has result', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: false,
          hasResult: true
        }
      });
      
      expect(wrapper.find('.process-button').exists()).toBe(false);
    });
  });

  describe('Process Button', () => {
    it('should be disabled when canProcess is false', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          canProcess: false
        }
      });
      
      const button = wrapper.find('.process-button');
      expect(button.attributes('disabled')).toBe('disabled');
      expect(button.classes()).toContain('disabled');
    });

    it('should be enabled when canProcess is true', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          canProcess: true
        }
      });
      
      const button = wrapper.find('.process-button');
      expect(button.attributes('disabled')).toBeUndefined();
    });

    it('should emit process event when clicked', async () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          canProcess: true
        }
      });
      
      const button = wrapper.find('.process-button');
      await button.trigger('click');
      
      expect(wrapper.emitted('process')).toBeTruthy();
    });

    it('should call onProcess prop when provided', async () => {
      const onProcess = jest.fn();
      wrapper = mount(ImageProcessor, {
        propsData: {
          canProcess: true,
          onProcess
        }
      });
      
      const button = wrapper.find('.process-button');
      await button.trigger('click');
      
      expect(onProcess).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading container when processing', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true
        }
      });
      
      expect(wrapper.find('.loading-container').exists()).toBe(true);
      expect(wrapper.find('.loading-spinner').exists()).toBe(true);
    });

    it('should display loading message based on status', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true,
          status: PROCESSING_STATUS.UPLOADING
        }
      });
      
      expect(wrapper.find('.loading-text').text()).toContain('上传');
    });

    it('should show progress bar for certain statuses', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true,
          status: PROCESSING_STATUS.REMOVING_BACKGROUND,
          progress: 50
        }
      });
      
      expect(wrapper.find('.progress-bar').exists()).toBe(true);
      expect(wrapper.find('.progress-text').text()).toBe('50%');
    });

    it('should update progress bar width', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true,
          status: PROCESSING_STATUS.REMOVING_BACKGROUND,
          progress: 75
        }
      });
      
      const progressFill = wrapper.find('.progress-fill');
      expect(progressFill.attributes('style')).toContain('width: 75%');
    });

    it('should not show progress bar for non-progress statuses', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          isProcessing: true,
          status: PROCESSING_STATUS.COMPRESSING
        }
      });
      
      expect(wrapper.find('.progress-bar').exists()).toBe(false);
    });
  });

  describe('Success State', () => {
    it('should show success container when has result and no error', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          hasResult: true,
          error: null
        }
      });
      
      expect(wrapper.find('.success-container').exists()).toBe(true);
      expect(wrapper.find('.success-icon').exists()).toBe(true);
    });

    it('should show reset button in success state', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          hasResult: true,
          error: null
        }
      });
      
      expect(wrapper.find('.reset-button').exists()).toBe(true);
    });

    it('should emit reset event when reset button clicked', async () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          hasResult: true,
          error: null
        }
      });
      
      const resetButton = wrapper.find('.reset-button');
      await resetButton.trigger('click');
      
      expect(wrapper.emitted('reset')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    const testError = {
      message: 'Test error message',
      retryable: true
    };

    it('should show error container when error exists', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError
        }
      });
      
      expect(wrapper.find('.error-container').exists()).toBe(true);
      expect(wrapper.find('.error-icon').exists()).toBe(true);
    });

    it('should display error message', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError
        }
      });
      
      expect(wrapper.find('.error-message').text()).toBe(testError.message);
    });

    it('should show retry button when error is retryable', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError
        }
      });
      
      expect(wrapper.find('.retry-button').exists()).toBe(true);
    });

    it('should not show retry button when error is not retryable', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: {
            message: 'Non-retryable error',
            retryable: false
          }
        }
      });
      
      expect(wrapper.find('.retry-button').exists()).toBe(false);
    });

    it('should emit retry event when retry button clicked', async () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError
        }
      });
      
      const retryButton = wrapper.find('.retry-button');
      await retryButton.trigger('click');
      
      expect(wrapper.emitted('retry')).toBeTruthy();
    });

    it('should call onRetry prop when provided', async () => {
      const onRetry = jest.fn();
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError,
          onRetry
        }
      });
      
      const retryButton = wrapper.find('.retry-button');
      await retryButton.trigger('click');
      
      expect(onRetry).toHaveBeenCalled();
    });

    it('should have role="alert" on error container', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          error: testError
        }
      });
      
      expect(wrapper.find('.error-container').attributes('role')).toBe('alert');
    });
  });

  describe('Loading Messages', () => {
    const statusMessages = [
      { status: PROCESSING_STATUS.UPLOADING, expected: '上传' },
      { status: PROCESSING_STATUS.COMPRESSING, expected: '压缩' },
      { status: PROCESSING_STATUS.REMOVING_BACKGROUND, expected: '提取' },
      { status: PROCESSING_STATUS.RENDERING, expected: '渲染' }
    ];

    statusMessages.forEach(({ status, expected }) => {
      it(`should show correct message for ${status} status`, () => {
        wrapper = mount(ImageProcessor, {
          propsData: {
            isProcessing: true,
            status
          }
        });
        
        expect(wrapper.vm.loadingMessage).toContain(expected);
      });
    });
  });

  describe('Props Validation', () => {
    it('should validate status prop', () => {
      const validator = wrapper.vm.$options.props.status.validator;
      
      expect(validator(PROCESSING_STATUS.IDLE)).toBe(true);
      expect(validator(PROCESSING_STATUS.UPLOADING)).toBe(true);
      expect(validator('invalid-status')).toBe(false);
    });

    it('should validate progress prop', () => {
      const validator = wrapper.vm.$options.props.progress.validator;
      
      expect(validator(0)).toBe(true);
      expect(validator(50)).toBe(true);
      expect(validator(100)).toBe(true);
      expect(validator(-1)).toBe(false);
      expect(validator(101)).toBe(false);
    });

    it('should validate error prop', () => {
      const validator = wrapper.vm.$options.props.error.validator;
      
      expect(validator(null)).toBe(true);
      expect(validator({ message: 'test', retryable: true })).toBe(true);
      expect(validator({ message: 'test' })).toBe(false); // missing retryable
      expect(validator({ retryable: true })).toBe(false); // missing message
    });
  });

  describe('Computed Properties', () => {
    it('should compute showProgress correctly', () => {
      wrapper = mount(ImageProcessor, {
        propsData: {
          status: PROCESSING_STATUS.REMOVING_BACKGROUND
        }
      });
      expect(wrapper.vm.showProgress).toBe(true);

      wrapper = mount(ImageProcessor, {
        propsData: {
          status: PROCESSING_STATUS.COMPRESSING
        }
      });
      expect(wrapper.vm.showProgress).toBe(false);
    });
  });
});
