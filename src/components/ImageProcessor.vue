<!--
  ImageProcessor Component
  
  Displays processing controls, loading states, progress indicators,
  and error messages for image processing operations.
  
  Requirements: 2.4, 2.5, 5.1, 5.4
-->

<template>
  <div class="image-processor">
    <!-- Process Button -->
    <button
      v-if="!isProcessing && !hasResult"
      @click="handleProcess"
      :disabled="!canProcess"
      class="process-button"
      :class="{ disabled: !canProcess }"
      data-test="process-button"
    >
      <span class="button-icon">🎨</span>
      <span class="button-text">提取图案</span>
    </button>

    <!-- Loading State -->
    <div v-if="isProcessing" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
      <div v-if="showProgress" class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
      <p v-if="showProgress" class="progress-text">{{ progress }}%</p>
    </div>

    <!-- Success State -->
    <div v-if="hasResult && !error" class="success-container">
      <div class="success-icon">✓</div>
      <p class="success-text">图案提取成功！</p>
      <button
        @click="handleReset"
        class="reset-button"
      >
        <span class="button-icon">🔄</span>
        <span class="button-text">重新处理</span>
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container" role="alert">
      <div class="error-icon">⚠️</div>
      <p class="error-title">处理失败</p>
      <p class="error-message">{{ error.message }}</p>
      <div class="error-actions">
        <button
          v-if="error.retryable"
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
</template>

<script>
import { PROCESSING_STATUS } from '@/constants';

export default {
  name: 'ImageProcessor',

  props: {
    /**
     * Whether processing is currently in progress
     */
    isProcessing: {
      type: Boolean,
      default: false
    },

    /**
     * Whether the image can be processed (e.g., image is uploaded)
     */
    canProcess: {
      type: Boolean,
      default: false
    },

    /**
     * Whether processing has completed successfully
     */
    hasResult: {
      type: Boolean,
      default: false
    },

    /**
     * Current processing status
     */
    status: {
      type: String,
      default: PROCESSING_STATUS.IDLE,
      validator: (value) => {
        return Object.values(PROCESSING_STATUS).includes(value);
      }
    },

    /**
     * Processing progress (0-100)
     */
    progress: {
      type: Number,
      default: 0,
      validator: (value) => {
        return value >= 0 && value <= 100;
      }
    },

    /**
     * Error object if processing failed
     */
    error: {
      type: Object,
      default: null,
      validator: (value) => {
        if (value === null) return true;
        return (
          typeof value.message === 'string' &&
          typeof value.retryable === 'boolean'
        );
      }
    },

    /**
     * Function to call when process button is clicked
     */
    onProcess: {
      type: Function,
      default: null
    },

    /**
     * Function to call when retry button is clicked
     */
    onRetry: {
      type: Function,
      default: null
    },

    /**
     * Function to call when reset button is clicked
     */
    onReset: {
      type: Function,
      default: null
    }
  },

  computed: {
    /**
     * Returns the appropriate loading message based on status
     */
    loadingMessage() {
      switch (this.status) {
        case PROCESSING_STATUS.UPLOADING:
          return '正在上传图片...';
        case PROCESSING_STATUS.COMPRESSING:
          return '正在压缩图片...';
        case PROCESSING_STATUS.REMOVING_BACKGROUND:
          return '正在提取图案...';
        case PROCESSING_STATUS.RENDERING:
          return '正在渲染结果...';
        default:
          return '正在处理...';
      }
    },

    /**
     * Whether to show progress bar
     */
    showProgress() {
      return (
        this.status === PROCESSING_STATUS.REMOVING_BACKGROUND ||
        this.status === PROCESSING_STATUS.UPLOADING
      );
    }
  },

  methods: {
    /**
     * Handles process button click
     */
    handleProcess() {
      if (this.onProcess) {
        this.onProcess();
      } else {
        this.$emit('process');
      }
    },

    /**
     * Handles retry button click
     */
    handleRetry() {
      if (this.onRetry) {
        this.onRetry();
      } else {
        this.$emit('retry');
      }
    },

    /**
     * Handles reset button click
     */
    handleReset() {
      if (this.onReset) {
        this.onReset();
      } else {
        this.$emit('reset');
      }
    }
  }
};
</script>

<style scoped>
.image-processor {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

/* Process Button */
.process-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.process-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.process-button:active:not(.disabled) {
  transform: translateY(0);
}

.process-button.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  box-shadow: none;
}

.button-icon {
  font-size: 24px;
}

.button-text {
  font-size: 18px;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.progress-text {
  font-size: 14px;
  color: #718096;
  font-weight: 600;
}

/* Success State */
.success-container {
  text-align: center;
  padding: 30px 20px;
  background-color: #f0fff4;
  border: 2px solid #9ae6b4;
  border-radius: 8px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 16px;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-text {
  font-size: 18px;
  color: #22543d;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Error State */
.error-container {
  text-align: center;
  padding: 30px 20px;
  background-color: #fff5f5;
  border: 2px solid #fc8181;
  border-radius: 8px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 20px;
  color: #c53030;
  font-weight: 600;
  margin-bottom: 8px;
}

.error-message {
  font-size: 16px;
  color: #742a2a;
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Retry Button */
.retry-button {
  padding: 12px 24px;
  background-color: #4299e1;
  color: white;
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

.retry-button:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.retry-button:active {
  transform: translateY(0);
}

/* Reset Button */
.reset-button {
  padding: 12px 24px;
  background-color: #718096;
  color: white;
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

.reset-button:hover {
  background-color: #4a5568;
  transform: translateY(-1px);
}

.reset-button:active {
  transform: translateY(0);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .image-processor {
    padding: 15px;
  }

  .process-button {
    padding: 14px 20px;
    font-size: 16px;
  }

  .button-icon {
    font-size: 20px;
  }

  .button-text {
    font-size: 16px;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
  }

  .success-icon {
    width: 50px;
    height: 50px;
    font-size: 30px;
  }

  .error-actions {
    flex-direction: column;
  }

  .retry-button,
  .reset-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
