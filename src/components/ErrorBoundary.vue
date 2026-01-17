<!--
  ErrorBoundary Component
  
  Catches and handles Vue errors in child components.
  Displays error UI with retry functionality.
  
  Requirements: 5.1, 5.2, 5.3, 5.4
-->

<template>
  <div class="error-boundary">
    <!-- Error State -->
    <div v-if="hasError" class="error-display">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">出错了</h2>
        <p class="error-message">{{ errorMessage }}</p>
        
        <div v-if="showDetails" class="error-details">
          <button
            @click="toggleDetails"
            class="details-toggle"
          >
            {{ detailsExpanded ? '隐藏详情' : '显示详情' }}
          </button>
          <pre v-if="detailsExpanded" class="error-stack">{{ errorStack }}</pre>
        </div>

        <div class="error-actions">
          <button
            @click="handleRetry"
            class="retry-button"
          >
            <span class="button-icon">🔄</span>
            <span class="button-text">重试</span>
          </button>
          <button
            @click="handleReset"
            class="reset-button"
          >
            <span class="button-icon">↺</span>
            <span class="button-text">重新开始</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Normal Content (when no error) -->
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorBoundary',

  props: {
    /**
     * Custom error message to display
     */
    fallbackMessage: {
      type: String,
      default: '应用遇到了一个错误，请重试或刷新页面'
    },

    /**
     * Whether to show error details (stack trace)
     */
    showDetails: {
      type: Boolean,
      default: process.env.NODE_ENV === 'development'
    },

    /**
     * Callback function when retry is clicked
     */
    onRetry: {
      type: Function,
      default: null
    },

    /**
     * Callback function when reset is clicked
     */
    onReset: {
      type: Function,
      default: null
    }
  },

  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
      detailsExpanded: false
    };
  },

  computed: {
    /**
     * Returns user-friendly error message
     */
    errorMessage() {
      if (this.error && this.error.message) {
        // Check if it's a user-friendly message
        if (this.isUserFriendlyMessage(this.error.message)) {
          return this.error.message;
        }
      }
      return this.fallbackMessage;
    },

    /**
     * Returns error stack trace for debugging
     */
    errorStack() {
      if (this.error && this.error.stack) {
        return this.error.stack;
      }
      if (this.errorInfo) {
        return this.errorInfo;
      }
      return 'No stack trace available';
    }
  },

  /**
   * Vue 2 error capture hook
   * Catches errors from child components
   * Requirements: 5.1, 5.2
   */
  errorCaptured(err, vm, info) {
    // Capture error details
    this.hasError = true;
    this.error = err;
    this.errorInfo = info;

    // Log error for debugging
    this.logError(err, vm, info);

    // Emit error event for parent components
    this.$emit('error', {
      error: err,
      vm: vm,
      info: info
    });

    // Prevent error from propagating further
    // Return false to stop propagation
    return false;
  },

  methods: {
    /**
     * Checks if error message is user-friendly
     * (doesn't contain technical jargon or stack traces)
     */
    isUserFriendlyMessage(message) {
      // Check for technical patterns
      const technicalPatterns = [
        /undefined/i,
        /null/i,
        /cannot read property/i,
        /is not a function/i,
        /at Object\./,
        /at Function\./,
        /webpack/i
      ];

      return !technicalPatterns.some(pattern => pattern.test(message));
    },

    /**
     * Logs error details to console
     * Requirements: 5.4
     */
    logError(err, vm, info) {
      console.error('[ErrorBoundary] Caught error:', {
        error: err,
        errorMessage: err.message,
        errorStack: err.stack,
        componentName: vm.$options.name || 'Anonymous',
        errorInfo: info,
        timestamp: new Date().toISOString()
      });

      // In production, you could send this to an error tracking service
      // if (process.env.NODE_ENV === 'production' && window.Sentry) {
      //   window.Sentry.captureException(err, {
      //     extra: { vm, info }
      //   });
      // }
    },

    /**
     * Toggles error details visibility
     */
    toggleDetails() {
      this.detailsExpanded = !this.detailsExpanded;
    },

    /**
     * Handles retry button click
     * Requirements: 5.3
     */
    handleRetry() {
      // Reset error state
      this.hasError = false;
      this.error = null;
      this.errorInfo = null;
      this.detailsExpanded = false;

      // Call custom retry handler if provided
      if (this.onRetry) {
        this.onRetry();
      }

      // Emit retry event
      this.$emit('retry');
    },

    /**
     * Handles reset button click
     * Requirements: 5.3
     */
    handleReset() {
      // Reset error state
      this.hasError = false;
      this.error = null;
      this.errorInfo = null;
      this.detailsExpanded = false;

      // Call custom reset handler if provided
      if (this.onReset) {
        this.onReset();
      } else {
        // Default behavior: reload page
        window.location.reload();
      }

      // Emit reset event
      this.$emit('reset');
    },

    /**
     * Public method to manually trigger error state
     * Useful for testing or manual error handling
     */
    captureError(error, info = 'Manual error capture') {
      this.hasError = true;
      this.error = error;
      this.errorInfo = info;
      this.logError(error, this, info);
    },

    /**
     * Public method to clear error state
     */
    clearError() {
      this.hasError = false;
      this.error = null;
      this.errorInfo = null;
      this.detailsExpanded = false;
    }
  }
};
</script>

<style scoped>
.error-boundary {
  width: 100%;
}

.error-display {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.error-content {
  max-width: 600px;
  width: 100%;
  background-color: #fff5f5;
  border: 2px solid #fc8181;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-title {
  font-size: 28px;
  font-weight: 700;
  color: #c53030;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: #742a2a;
  line-height: 1.6;
  margin-bottom: 24px;
}

.error-details {
  margin-bottom: 24px;
}

.details-toggle {
  padding: 8px 16px;
  background-color: #e2e8f0;
  color: #2d3748;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.details-toggle:hover {
  background-color: #cbd5e0;
}

.error-stack {
  margin-top: 16px;
  padding: 16px;
  background-color: #2d3748;
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button,
.reset-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.retry-button {
  background-color: #4299e1;
  color: white;
}

.retry-button:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.reset-button {
  background-color: #718096;
  color: white;
}

.reset-button:hover {
  background-color: #4a5568;
  transform: translateY(-1px);
}

.button-icon {
  font-size: 18px;
}

.button-text {
  font-size: 16px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .error-display {
    padding: 30px 15px;
    min-height: 350px;
  }

  .error-content {
    padding: 30px 20px;
  }

  .error-icon {
    font-size: 48px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-message {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
  }

  .retry-button,
  .reset-button {
    width: 100%;
    justify-content: center;
  }

  .error-stack {
    font-size: 11px;
    max-height: 200px;
  }
}

/* Accessibility */
.retry-button:focus,
.reset-button:focus,
.details-toggle:focus {
  outline: 3px solid #4299e1;
  outline-offset: 2px;
}

.retry-button:focus:not(:focus-visible),
.reset-button:focus:not(:focus-visible),
.details-toggle:focus:not(:focus-visible) {
  outline: none;
}
</style>
