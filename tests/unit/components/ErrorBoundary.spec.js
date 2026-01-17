/**
 * Unit Tests for ErrorBoundary Component
 * Tests error capture, display, retry functionality, and reset behavior.
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import { mount, createLocalVue } from '@vue/test-utils';
import ErrorBoundary from '@/components/ErrorBoundary.vue';

describe('ErrorBoundary Component', () => {
  let wrapper;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
    console.error.mockRestore();
  });

  it('should render slot content when no error', () => {
    wrapper = mount(ErrorBoundary, {
      localVue,
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    });

    expect(wrapper.find('.test-content').exists()).toBe(true);
    expect(wrapper.find('.error-display').exists()).toBe(false);
  });

  it('should not show error UI initially', () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    expect(wrapper.vm.hasError).toBe(false);
    expect(wrapper.find('.error-display').exists()).toBe(false);
  });

  it('should capture errors manually', () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    const error = new Error('Test error');
    wrapper.vm.captureError(error, 'Manual capture');

    expect(wrapper.vm.hasError).toBe(true);
    expect(wrapper.vm.error).toBe(error);
    expect(wrapper.vm.errorInfo).toBe('Manual capture');
  });

  it('should show error UI when error occurs', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    const error = new Error('Test error');
    wrapper.vm.captureError(error, 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.error-display').exists()).toBe(true);
    expect(wrapper.find('.error-title').exists()).toBe(true);
  });

  it('should show retry and reset buttons', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.retry-button').exists()).toBe(true);
    expect(wrapper.find('.reset-button').exists()).toBe(true);
  });

  it('should clear error state on retry', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasError).toBe(true);

    await wrapper.find('.retry-button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasError).toBe(false);
    expect(wrapper.vm.error).toBeNull();
  });

  it('should emit retry event', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    await wrapper.find('.retry-button').trigger('click');

    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  it('should call onRetry callback if provided', async () => {
    const onRetry = jest.fn();
    wrapper = mount(ErrorBoundary, {
      localVue,
      propsData: {
        onRetry
      }
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    await wrapper.find('.retry-button').trigger('click');

    expect(onRetry).toHaveBeenCalled();
  });

  it('should clear error state on reset', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasError).toBe(true);

    await wrapper.find('.reset-button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.hasError).toBe(false);
    expect(wrapper.vm.error).toBeNull();
  });

  it('should emit reset event', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    await wrapper.find('.reset-button').trigger('click');

    expect(wrapper.emitted('reset')).toBeTruthy();
  });

  it('should call onReset callback if provided', async () => {
    const onReset = jest.fn();
    wrapper = mount(ErrorBoundary, {
      localVue,
      propsData: {
        onReset
      }
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    await wrapper.vm.$nextTick();

    await wrapper.find('.reset-button').trigger('click');

    expect(onReset).toHaveBeenCalled();
  });

  it('should clear error via clearError method', () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Test'), 'render');
    expect(wrapper.vm.hasError).toBe(true);

    wrapper.vm.clearError();

    expect(wrapper.vm.hasError).toBe(false);
    expect(wrapper.vm.error).toBeNull();
    expect(wrapper.vm.errorInfo).toBeNull();
  });

  it('should accept fallbackMessage prop', () => {
    wrapper = mount(ErrorBoundary, {
      localVue,
      propsData: {
        fallbackMessage: 'Custom error message'
      }
    });

    expect(wrapper.props().fallbackMessage).toBe('Custom error message');
  });

  it('should accept showDetails prop', () => {
    wrapper = mount(ErrorBoundary, {
      localVue,
      propsData: {
        showDetails: true
      }
    });

    expect(wrapper.props().showDetails).toBe(true);
  });

  it('should have error-boundary class', () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    expect(wrapper.find('.error-boundary').exists()).toBe(true);
  });

  it('should handle error without message', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    const error = new Error();
    wrapper.vm.captureError(error, 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.error-message').exists()).toBe(true);
  });

  it('should handle multiple errors', async () => {
    wrapper = mount(ErrorBoundary, {
      localVue
    });

    wrapper.vm.captureError(new Error('Error 1'), 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.error.message).toBe('Error 1');

    wrapper.vm.captureError(new Error('Error 2'), 'render');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.error.message).toBe('Error 2');
  });
});
