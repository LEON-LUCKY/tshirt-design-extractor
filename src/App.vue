<template>
  <div id="app" role="application" aria-label="T恤图案提取工具">
    <!-- Skip to Main Content Link for Screen Readers -->
    <a href="#main-content" class="skip-to-main">跳转到主内容</a>

    <ErrorBoundary
      :on-retry="retry"
      :on-reset="reset"
    >
      <!-- Header -->
      <header class="app-header" role="banner">
        <h1 class="app-title">
          <span class="title-icon" aria-hidden="true">👕</span>
          T恤图案提取工具
        </h1>
        <p class="app-subtitle">
          自动提取T恤上的图案设计，生成透明背景的平面设计图
        </p>
      </header>

      <!-- Main Content -->
      <main id="main-content" class="app-main" role="main" aria-label="主要内容区域">
        <!-- Step 1: Upload Image -->
        <section 
          class="app-section" 
          aria-labelledby="upload-heading"
          role="region"
        >
          <div class="section-header">
            <span class="step-number" aria-hidden="true">1</span>
            <h2 id="upload-heading" class="section-title">上传图片</h2>
          </div>
          <ImageUploader
            @image-selected="uploadImage"
            @upload-error="handleError"
            @image-cleared="reset"
          />
        </section>

        <!-- Step 2: Process Image -->
        <section 
          v-if="originalImageUrl" 
          class="app-section"
          aria-labelledby="process-heading"
          role="region"
        >
          <div class="section-header">
            <span class="step-number" aria-hidden="true">2</span>
            <h2 id="process-heading" class="section-title">提取图案</h2>
          </div>
          <ImageProcessor
            :is-processing="isProcessing"
            :can-process="canProcess"
            :has-result="!!extractedImageUrl"
            :status="processingStatus"
            :progress="processingProgress"
            :error="error"
            :on-process="processImage"
            :on-retry="retry"
            :on-reset="reset"
          />
        </section>

        <!-- Step 3: View Results -->
        <section 
          v-if="showComparison" 
          class="app-section"
          aria-labelledby="results-heading"
          role="region"
          aria-live="polite"
        >
          <div class="section-header">
            <span class="step-number" aria-hidden="true">3</span>
            <h2 id="results-heading" class="section-title">查看结果</h2>
          </div>
          <ImageComparison
            :original-image="originalImageUrl"
            :extracted-image="extractedImageUrl"
          />
        </section>

        <!-- Step 4: Download -->
        <section 
          v-if="extractedImageUrl" 
          class="app-section"
          aria-labelledby="download-heading"
          role="region"
        >
          <div class="section-header">
            <span class="step-number" aria-hidden="true">4</span>
            <h2 id="download-heading" class="section-title">下载图案</h2>
          </div>
          <DownloadButton
            :extracted-image="extractedImageUrl"
            @download-success="handleDownloadSuccess"
            @download-error="handleError"
          />
        </section>

        <!-- Screen Reader Status Announcements -->
        <div 
          class="sr-only" 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {{ screenReaderStatus }}
        </div>
      </main>

      <!-- Footer -->
      <footer class="app-footer" role="contentinfo">
        <p class="footer-text">
          使用AI技术自动提取图案 · 支持JPG、PNG、WebP格式
        </p>
      </footer>
    </ErrorBoundary>
  </div>
</template>

<script>
import ImageUploader from '@/components/ImageUploader.vue';
import ImageProcessor from '@/components/ImageProcessor.vue';
import ImageComparison from '@/components/ImageComparison.vue';
import DownloadButton from '@/components/DownloadButton.vue';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import ImageProcessorService from '@/services/ImageProcessorService';
import DownloadManager from '@/services/DownloadManager';
import { ERROR_TYPES, ERROR_CODES, ERROR_MESSAGES, PROCESSING_STATUS } from '@/constants';

export default {
  name: 'App',
  
  components: {
    ImageUploader,
    ImageProcessor,
    ImageComparison,
    DownloadButton,
    ErrorBoundary
  },
  
  data() {
    return {
      // Upload state
      uploadedFile: null,
      originalImageUrl: null,
      
      // Processing state
      isProcessing: false,
      processingProgress: 0,
      processingStatus: PROCESSING_STATUS.IDLE,
      
      // Result state
      extractedImageUrl: null,
      processedImage: null,
      
      // Error state
      error: null,
      
      // UI state
      showComparison: false,
      isMobile: false
    };
  },
  
  computed: {
    /**
     * Check if download button should be visible
     * Requirements: 4.1
     */
    canDownload() {
      return this.extractedImageUrl !== null && !this.isProcessing;
    },
    
    /**
     * Check if process button should be enabled
     * Requirements: 1.6
     */
    canProcess() {
      return this.originalImageUrl !== null && !this.isProcessing;
    },
    
    /**
     * Check if there's an error that can be retried
     * Requirements: 5.2
     */
    canRetry() {
      return this.error !== null && this.error.retryable;
    },
    
    /**
     * Screen reader status announcements
     * Requirements: 7.5
     */
    screenReaderStatus() {
      if (this.isProcessing) {
        return `正在处理图片，进度 ${this.processingProgress}%`;
      }
      if (this.error) {
        return `错误：${this.error.message}`;
      }
      if (this.extractedImageUrl) {
        return '图案提取成功，可以下载';
      }
      if (this.originalImageUrl) {
        return '图片已上传，可以开始提取';
      }
      return '请上传T恤图片';
    }
  },
  
  mounted() {
    // Detect mobile viewport
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    
    // Add keyboard navigation support
    // Requirements: 7.5
    window.addEventListener('keydown', this.handleKeyboardNavigation);
    
    // Remove preload class to enable transitions
    document.body.classList.remove('preload');
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('keydown', this.handleKeyboardNavigation);
  },
  
  methods: {
    /**
     * Handle image upload
     * Requirements: 1.6, 5.1
     * 
     * @param {File} file - The uploaded image file
     * @param {string} dataUrl - The preview DataURL
     */
    async uploadImage(file, dataUrl) {
      try {
        // Clear any previous errors
        this.error = null;
        
        // Store uploaded file and preview
        this.uploadedFile = file;
        this.originalImageUrl = dataUrl;
        
        // Update processing status
        this.processingStatus = PROCESSING_STATUS.IDLE;
        
        // Clear previous results
        this.extractedImageUrl = null;
        this.processedImage = null;
        this.showComparison = false;
        
      } catch (err) {
        this.handleError({
          type: ERROR_TYPES.UPLOAD_ERROR,
          code: ERROR_CODES.FILE_CORRUPTED,
          message: ERROR_MESSAGES[ERROR_CODES.FILE_CORRUPTED],
          details: err.message,
          retryable: false
        });
      }
    },
    
    /**
     * Process the uploaded image to extract design
     * Requirements: 2.4, 2.5, 2.6, 5.1
     */
    async processImage() {
      if (!this.uploadedFile) {
        this.handleError({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.IMAGE_LOAD_ERROR,
          message: '请先上传图片',
          details: 'No file uploaded',
          retryable: false
        });
        return;
      }
      
      try {
        // Set processing state
        this.isProcessing = true;
        this.error = null;
        this.processingStatus = PROCESSING_STATUS.REMOVING_BACKGROUND;
        this.processingProgress = 0;
        
        // Process the image
        const result = await ImageProcessorService.processImage(this.uploadedFile);
        
        // Store results
        this.processedImage = result;
        this.extractedImageUrl = result.extractedDataUrl;
        
        // Update UI state
        this.processingStatus = PROCESSING_STATUS.COMPLETE;
        this.processingProgress = 100;
        this.showComparison = true;
        
      } catch (err) {
        // Handle different error types
        this.handleProcessingError(err);
        
      } finally {
        this.isProcessing = false;
      }
    },
    
    /**
     * Download the extracted design
     * Requirements: 4.2, 4.3, 4.4
     */
    downloadExtracted() {
      if (!this.extractedImageUrl) {
        this.handleError({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.IMAGE_LOAD_ERROR,
          message: '没有可下载的图片',
          details: 'No extracted image available',
          retryable: false
        });
        return;
      }
      
      try {
        // Generate filename with timestamp
        const filename = DownloadManager.generateFilename();
        
        // Trigger download
        DownloadManager.downloadImage(this.extractedImageUrl, filename);
        
        // Could emit success event here for UI feedback
        // Requirements: 4.4
        
      } catch (err) {
        this.handleError({
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.CANVAS_ERROR,
          message: '下载失败，请重试',
          details: err.message,
          retryable: true
        });
      }
    },
    
    /**
     * Reset application to initial state
     * Requirements: 5.2
     */
    reset() {
      // Clear all state
      this.uploadedFile = null;
      this.originalImageUrl = null;
      this.extractedImageUrl = null;
      this.processedImage = null;
      this.error = null;
      this.isProcessing = false;
      this.processingProgress = 0;
      this.processingStatus = PROCESSING_STATUS.IDLE;
      this.showComparison = false;
    },
    
    /**
     * Handle processing errors with appropriate error types
     * Requirements: 2.5, 5.2, 5.3
     * 
     * @param {Error} err - The error object
     */
    handleProcessingError(err) {
      // Check if it's already a structured error
      if (err && err.type && err.code && typeof err.message === 'string' && typeof err.retryable === 'boolean') {
        this.handleError(err);
        return;
      }
      
      // Convert Error object to plain object
      const errorMessage = err && err.message ? err.message : String(err);
      
      // Determine error type based on error message/properties
      let errorType = ERROR_TYPES.PROCESSING_ERROR;
      let errorCode = ERROR_CODES.CANVAS_ERROR;
      let retryable = true;
      
      // Network errors
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Network')) {
        errorType = ERROR_TYPES.NETWORK_ERROR;
        errorCode = ERROR_CODES.NETWORK_OFFLINE;
      }
      // API errors
      else if (err && err.response) {
        errorType = ERROR_TYPES.API_ERROR;
        
        // Map HTTP status codes to error codes
        if (err.response.status === 401) {
          errorCode = ERROR_CODES.API_KEY_INVALID;
          retryable = false;
        } else if (err.response.status === 429) {
          errorCode = ERROR_CODES.API_QUOTA_EXCEEDED;
          retryable = false;
        } else if (err.response.status === 400) {
          errorCode = ERROR_CODES.API_BAD_REQUEST;
          retryable = true;
        } else if (err.response.status >= 500) {
          errorCode = ERROR_CODES.API_SERVICE_UNAVAILABLE;
          retryable = true;
        }
      }
      
      // Create a plain object error (not Error instance)
      this.handleError({
        type: errorType,
        code: errorCode,
        message: ERROR_MESSAGES[errorCode] || '处理失败，请重试',
        details: errorMessage,
        retryable
      });
    },
    
    /**
     * Handle errors and update error state
     * Requirements: 5.1, 5.2
     * 
     * @param {Object} error - Structured error object
     */
    handleError(error) {
      // Ensure error is a plain object, not an Error instance
      if (error instanceof Error) {
        this.error = {
          type: ERROR_TYPES.PROCESSING_ERROR,
          code: ERROR_CODES.CANVAS_ERROR,
          message: error.message || '处理失败，请重试',
          details: error.stack || '',
          retryable: true
        };
      } else {
        this.error = error;
      }
      this.processingStatus = PROCESSING_STATUS.ERROR;
      this.isProcessing = false;
    },
    
    /**
     * Retry the last failed operation
     * Requirements: 5.2
     */
    async retry() {
      if (!this.canRetry) {
        return;
      }
      
      // Clear error and retry processing
      this.error = null;
      await this.processImage();
    },
    
    /**
     * Check if viewport is mobile size
     * Requirements: 7.3
     */
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
    },
    
    /**
     * Handle successful download
     * Requirements: 4.4
     */
    handleDownloadSuccess(data) {
      console.log('Download successful:', data.filename);
      // Could show a toast notification here
    },
    
    /**
     * Handle keyboard navigation
     * Requirements: 7.5
     */
    handleKeyboardNavigation(event) {
      // Escape key - Reset application
      if (event.key === 'Escape' && (this.error || this.extractedImageUrl)) {
        event.preventDefault();
        this.reset();
      }
      
      // Enter key on process - Trigger processing if ready
      if (event.key === 'Enter' && this.canProcess && !this.isProcessing && !this.extractedImageUrl) {
        const activeElement = document.activeElement;
        // Only trigger if not already focused on a button
        if (activeElement.tagName !== 'BUTTON' && activeElement.tagName !== 'INPUT') {
          event.preventDefault();
          this.processImage();
        }
      }
      
      // R key - Retry if error is retryable
      if ((event.key === 'r' || event.key === 'R') && this.canRetry && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement;
        // Only trigger if not in an input field
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          event.preventDefault();
          this.retry();
        }
      }
    }
  }
};
</script>

<style>
/* Global Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2d3748;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

/* Skip to Main Content Link - Requirements: 7.5 */
.skip-to-main {
  position: absolute;
  top: -40px;
  left: 0;
  background: #667eea;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  border-radius: 0 0 4px 0;
  z-index: 1000;
  font-weight: 600;
}

.skip-to-main:focus {
  top: 0;
  outline: 3px solid white;
  outline-offset: 2px;
}

/* Screen Reader Only - Requirements: 7.5 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Header */
.app-header {
  text-align: center;
  padding: 40px 20px;
  color: white;
}

.app-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.title-icon {
  font-size: 48px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.app-subtitle {
  font-size: 18px;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Main Content */
.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Section */
.app-section {
  background-color: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 40px 20px;
  color: white;
  opacity: 0.9;
}

.footer-text {
  font-size: 14px;
  line-height: 1.6;
}

/* Mobile Responsive - Requirements: 7.2, 7.3 */
@media (max-width: 768px) {
  #app {
    padding: 15px;
  }

  .app-header {
    padding: 30px 15px;
  }

  .app-title {
    font-size: 32px;
    flex-direction: column;
    gap: 8px;
  }

  .title-icon {
    font-size: 40px;
  }

  .app-subtitle {
    font-size: 16px;
  }

  .app-main {
    padding: 0 10px;
  }

  .app-section {
    padding: 24px 20px;
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 20px;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .section-title {
    font-size: 20px;
  }

  .app-footer {
    padding: 30px 15px;
  }

  .footer-text {
    font-size: 13px;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-title {
    font-size: 38px;
  }

  .app-section {
    padding: 28px;
  }
}

/* Desktop Large Screens */
@media (min-width: 1440px) {
  .app-main {
    max-width: 1400px;
  }
}

/* Loading Animation */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Smooth Transitions */
.app-section {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
}

/* Print Styles */
@media print {
  #app {
    background: white;
    padding: 0;
  }

  .app-header,
  .app-footer {
    display: none;
  }

  .app-section {
    box-shadow: none;
    border: 1px solid #e2e8f0;
    page-break-inside: avoid;
  }

  .step-number {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

/* Accessibility - Requirements: 7.5 */
.app-section:focus-within {
  outline: 3px solid #667eea;
  outline-offset: 4px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
