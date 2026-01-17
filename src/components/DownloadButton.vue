<!--
  DownloadButton Component
  
  Displays a download button that is only visible when extracted image is available.
  Integrates with DownloadManager service to trigger downloads with proper filenames.
  
  Requirements: 4.1, 4.2, 4.3, 4.4
-->

<template>
  <div class="download-button-container" v-if="isVisible">
    <button
      @click="handleDownload"
      :disabled="isDownloading"
      class="download-button"
      :class="{ downloading: isDownloading, success: showSuccess }"
      data-test="download-button"
    >
      <span class="button-icon">{{ buttonIcon }}</span>
      <span class="button-text">{{ buttonText }}</span>
    </button>

    <!-- Success Feedback -->
    <transition name="fade">
      <div v-if="showSuccess" class="success-feedback">
        <span class="success-icon">✓</span>
        <span class="success-text">下载成功！</span>
      </div>
    </transition>
  </div>
</template>

<script>
import DownloadManager from '@/services/DownloadManager';
import { SUCCESS_MESSAGE_DURATION } from '@/constants';

export default {
  name: 'DownloadButton',

  props: {
    /**
     * Data URL of the extracted image to download
     */
    extractedImage: {
      type: String,
      default: null
    },

    /**
     * Custom filename prefix (optional)
     */
    filenamePrefix: {
      type: String,
      default: 'extracted-design'
    },

    /**
     * Whether to show the button (overrides automatic visibility logic)
     */
    visible: {
      type: Boolean,
      default: null
    }
  },

  data() {
    return {
      isDownloading: false,
      showSuccess: false,
      successTimeout: null
    };
  },

  computed: {
    /**
     * Determines if the download button should be visible
     * Button is visible only when extracted image is available
     * Requirements: 4.1
     */
    isVisible() {
      // If visible prop is explicitly set, use it
      if (this.visible !== null) {
        return this.visible;
      }
      // Otherwise, show button only when extracted image is available
      return !!this.extractedImage;
    },

    /**
     * Returns the appropriate button icon based on state
     */
    buttonIcon() {
      if (this.showSuccess) {
        return '✓';
      }
      if (this.isDownloading) {
        return '⏳';
      }
      return '⬇️';
    },

    /**
     * Returns the appropriate button text based on state
     */
    buttonText() {
      if (this.showSuccess) {
        return '下载成功';
      }
      if (this.isDownloading) {
        return '下载中...';
      }
      return '下载图案';
    }
  },

  beforeDestroy() {
    // Clear timeout if component is destroyed
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  },

  methods: {
    /**
     * Handles download button click
     * Requirements: 4.2, 4.3, 4.4
     */
    async handleDownload() {
      if (!this.extractedImage || this.isDownloading) {
        return;
      }

      try {
        this.isDownloading = true;

        // Generate filename with timestamp
        // Requirements: 4.3
        const filename = DownloadManager.generateFilename(this.filenamePrefix);

        // Trigger download using DownloadManager
        // Requirements: 4.2 (PNG format with transparency)
        DownloadManager.downloadImage(this.extractedImage, filename);

        // Show success feedback
        // Requirements: 4.4
        this.showSuccessFeedback();

        // Emit download event
        this.$emit('download-success', { filename });

      } catch (error) {
        console.error('Download failed:', error);
        this.$emit('download-error', error);
        
        // Show error feedback
        this.showErrorFeedback();
      } finally {
        this.isDownloading = false;
      }
    },

    /**
     * Shows success feedback for a limited duration
     */
    showSuccessFeedback() {
      this.showSuccess = true;

      // Clear existing timeout if any
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }

      // Hide success feedback after duration
      this.successTimeout = setTimeout(() => {
        this.showSuccess = false;
        this.successTimeout = null;
      }, SUCCESS_MESSAGE_DURATION);
    },

    /**
     * Shows error feedback
     */
    showErrorFeedback() {
      // Could be extended to show error UI
      // For now, just emit event for parent to handle
    }
  }
};
</script>

<style scoped>
.download-button-container {
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  padding: 0 20px;
}

.download-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
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
  box-shadow: 0 4px 6px rgba(72, 187, 120, 0.3);
}

.download-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(72, 187, 120, 0.4);
}

.download-button:active:not(:disabled) {
  transform: translateY(0);
}

.download-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.download-button.downloading {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
}

.download-button.success {
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  animation: successPulse 0.5s ease;
}

@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.button-icon {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.download-button:hover:not(:disabled) .button-icon {
  transform: translateY(2px);
}

.button-text {
  font-size: 18px;
}

/* Success Feedback */
.success-feedback {
  margin-top: 16px;
  padding: 12px 20px;
  background-color: #f0fff4;
  border: 2px solid #9ae6b4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  width: 24px;
  height: 24px;
  background-color: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.success-text {
  color: #22543d;
  font-size: 16px;
  font-weight: 600;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .download-button-container {
    padding: 0 15px;
  }

  .download-button {
    padding: 14px 20px;
    font-size: 16px;
  }

  .button-icon {
    font-size: 20px;
  }

  .button-text {
    font-size: 16px;
  }

  .success-feedback {
    padding: 10px 16px;
  }

  .success-text {
    font-size: 14px;
  }
}

/* Accessibility */
.download-button:focus {
  outline: 3px solid #9ae6b4;
  outline-offset: 2px;
}

.download-button:focus:not(:focus-visible) {
  outline: none;
}

/* Print styles */
@media print {
  .download-button-container {
    display: none;
  }
}
</style>
