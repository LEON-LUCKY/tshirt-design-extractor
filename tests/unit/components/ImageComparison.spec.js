/**
 * Unit Tests for ImageComparison Component
 * 
 * Tests side-by-side image display, responsive layout,
 * transparency grid, and image scaling.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 7.3
 */

import { mount } from '@vue/test-utils';
import ImageComparison from '@/components/ImageComparison.vue';
import { MOBILE_BREAKPOINT } from '@/constants';

describe('ImageComparison Component', () => {
  let wrapper;

  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  describe('Component Rendering', () => {
    it('should not render when no images provided', () => {
      wrapper = mount(ImageComparison);
      expect(wrapper.find('.image-comparison').exists()).toBe(false);
    });

    it('should render when original image is provided', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      expect(wrapper.find('.image-comparison').exists()).toBe(true);
    });

    it('should render when extracted image is provided', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.find('.image-comparison').exists()).toBe(true);
    });

    it('should render both images when provided', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,original',
          extractedImage: 'data:image/png;base64,extracted'
        }
      });
      
      const panels = wrapper.findAll('.image-panel');
      expect(panels.length).toBe(2);
    });
  });

  describe('Image Display', () => {
    it('should display original image with correct src', () => {
      const originalUrl = 'data:image/jpeg;base64,original';
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: originalUrl
        }
      });
      
      const images = wrapper.findAll('.comparison-image');
      expect(images.at(0).attributes('src')).toBe(originalUrl);
    });

    it('should display extracted image with correct src', () => {
      const extractedUrl = 'data:image/png;base64,extracted';
      wrapper = mount(ImageComparison, {
        propsData: {
          extractedImage: extractedUrl
        }
      });
      
      const images = wrapper.findAll('.comparison-image');
      expect(images.at(0).attributes('src')).toBe(extractedUrl);
    });

    it('should have alt text on images', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const images = wrapper.findAll('.comparison-image');
      images.wrappers.forEach(img => {
        expect(img.attributes('alt')).toBeTruthy();
      });
    });
  });

  describe('Transparency Grid', () => {
    it('should show transparency grid for extracted image', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.find('.transparency-grid').exists()).toBe(true);
    });

    it('should not show transparency grid for original image', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      const wrappers = wrapper.findAll('.image-wrapper');
      const originalWrapper = wrappers.at(0);
      expect(originalWrapper.classes()).not.toContain('with-transparency-grid');
    });

    it('should apply with-transparency-grid class to extracted image wrapper', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,original',
          extractedImage: 'data:image/png;base64,extracted'
        }
      });
      
      const wrappers = wrapper.findAll('.image-wrapper');
      const extractedWrapper = wrappers.at(1);
      expect(extractedWrapper.classes()).toContain('with-transparency-grid');
    });
  });

  describe('Responsive Layout', () => {
    it('should use desktop layout by default', () => {
      window.innerWidth = 1024;
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.checkMobileLayout();
      expect(wrapper.vm.isMobile).toBe(false);
    });

    it('should detect mobile layout when width < MOBILE_BREAKPOINT', () => {
      window.innerWidth = 500;
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.checkMobileLayout();
      expect(wrapper.vm.isMobile).toBe(true);
    });

    it('should apply mobile-layout class when isMobile is true', async () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.isMobile = true;
      await wrapper.vm.$nextTick();
      
      const container = wrapper.find('.comparison-container');
      expect(container.classes()).toContain('mobile-layout');
    });

    it('should not apply mobile-layout class when isMobile is false', async () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      wrapper.vm.isMobile = false;
      await wrapper.vm.$nextTick();
      
      const container = wrapper.find('.comparison-container');
      expect(container.classes()).not.toContain('mobile-layout');
    });
  });

  describe('Window Resize Handling', () => {
    it('should add resize event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', wrapper.vm.checkMobileLayout);
      
      addEventListenerSpy.mockRestore();
    });

    it('should remove resize event listener on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      const checkMobileLayout = wrapper.vm.checkMobileLayout;
      wrapper.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', checkMobileLayout);
      
      removeEventListenerSpy.mockRestore();
    });

    it('should update layout on window resize', async () => {
      window.innerWidth = 1024;
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      expect(wrapper.vm.isMobile).toBe(false);
      
      // Simulate resize to mobile
      window.innerWidth = 500;
      wrapper.vm.checkMobileLayout();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.vm.isMobile).toBe(true);
    });
  });

  describe('Image Load Event', () => {
    it('should emit image-loaded event when image loads', async () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      const image = wrapper.find('.comparison-image');
      await image.trigger('load');
      
      expect(wrapper.emitted('image-loaded')).toBeTruthy();
    });
  });

  describe('Panel Titles', () => {
    it('should show correct title for original image', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const titles = wrapper.findAll('.panel-title');
      expect(titles.at(0).text()).toContain('原始');
    });

    it('should show correct title for extracted image', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test',
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      const titles = wrapper.findAll('.panel-title');
      expect(titles.at(1).text()).toContain('提取');
    });
  });

  describe('Panel Hint', () => {
    it('should show hint for extracted image', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          extractedImage: 'data:image/png;base64,test'
        }
      });
      
      expect(wrapper.find('.panel-hint').exists()).toBe(true);
      expect(wrapper.find('.panel-hint').text()).toContain('背景已移除');
    });

    it('should not show hint for original image only', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: 'data:image/jpeg;base64,test'
        }
      });
      
      expect(wrapper.find('.panel-hint').exists()).toBe(false);
    });
  });

  describe('Props', () => {
    it('should accept originalImage prop', () => {
      const originalUrl = 'data:image/jpeg;base64,test';
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: originalUrl
        }
      });
      
      expect(wrapper.props().originalImage).toBe(originalUrl);
    });

    it('should accept extractedImage prop', () => {
      const extractedUrl = 'data:image/png;base64,test';
      wrapper = mount(ImageComparison, {
        propsData: {
          extractedImage: extractedUrl
        }
      });
      
      expect(wrapper.props().extractedImage).toBe(extractedUrl);
    });

    it('should handle null props', () => {
      wrapper = mount(ImageComparison, {
        propsData: {
          originalImage: null,
          extractedImage: null
        }
      });
      
      expect(wrapper.find('.image-comparison').exists()).toBe(false);
    });
  });
});
