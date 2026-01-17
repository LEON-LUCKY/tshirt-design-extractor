<!--
  ImageUploader Component
  
  Handles user image uploads with drag-and-drop support, file validation,
  and preview display.
  
  Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
-->

<template>
  <div class="image-uploader">
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'has-preview': previewUrl }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <!-- File Input (Hidden) -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptedFormats.join(',')"
        @change="handleFileSelect"
        class="file-input"
        aria-label="选择图片文件"
      />

      <!-- Upload Prompt (shown when no preview) -->
      <div v-if="!previewUrl" class="upload-prompt">
        <div class="upload-icon">📁</div>
        <p class="upload-text">
          <strong>点击上传</strong> 或拖放图片到此处
        </p>
        <p class="upload-hint">
          支持 JPG、PNG、WebP 格式，最大 10MB
        </p>
      </div>

      <!-- Preview (shown when image is uploaded) -->
      <div v-else class="preview-container">
        <img
          :src="previewUrl"
          alt="上传的图片预览"
          class="preview-image"
        />
        <button
          @click.stop="clearImage"
          class="clear-button"
          aria-label="清除图片"
          title="清除图片"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message" role="alert">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
    </div>
  </div>
</template>

<script>
import { validateFile } from '@/utils/validation';
import { ACCEPTED_MIME_TYPES } from '@/constants';

export default {
  name: 'ImageUploader',

  props: {
    /**
     * Maximum allowed file size in bytes
     */
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },

    /**
     * Accepted image MIME types
     */
    acceptedFormats: {
      type: Array,
      default: () => ACCEPTED_MIME_TYPES
    }
  },

  data() {
    return {
      isDragOver: false,
      previewUrl: null,
      errorMessage: null,
      currentFile: null
    };
  },

  methods: {
    /**
     * Triggers the hidden file input click
     */
    triggerFileInput() {
      if (this.previewUrl) {
        // Don't trigger file input if preview is shown
        return;
      }
      this.$refs.fileInput.click();
    },

    /**
     * Handles file selection from file input
     * @param {Event} event - The change event from file input
     */
    handleFileSelect(event) {
      const files = event.target.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    },

    /**
     * Handles drag over event
     */
    handleDragOver() {
      this.isDragOver = true;
    },

    /**
     * Handles drag leave event
     */
    handleDragLeave() {
      this.isDragOver = false;
    },

    /**
     * Handles file drop event
     * @param {DragEvent} event - The drop event
     */
    handleDrop(event) {
      this.isDragOver = false;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    },

    /**
     * Validates and processes the selected file
     * @param {File} file - The file to process
     */
    processFile(file) {
      // Clear previous error
      this.errorMessage = null;

      // Validate file
      const validation = validateFile(file);

      if (!validation.isValid) {
        // Show error and emit error event
        this.errorMessage = validation.error.message;
        this.$emit('upload-error', validation.error);
        return;
      }

      // Store current file
      this.currentFile = file;

      // Generate preview
      this.generatePreview(file);
    },

    /**
     * Generates a preview DataURL for the file
     * @param {File} file - The file to preview
     */
    generatePreview(file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.previewUrl = e.target.result;
        // Emit image-selected event with file and dataUrl
        this.$emit('image-selected', file, e.target.result);
      };

      reader.onerror = () => {
        this.errorMessage = '图片预览生成失败，请重试';
        this.$emit('upload-error', {
          code: 'PREVIEW_ERROR',
          message: '图片预览生成失败，请重试'
        });
      };

      reader.readAsDataURL(file);
    },

    /**
     * Clears the current image and resets the component
     */
    clearImage() {
      this.previewUrl = null;
      this.currentFile = null;
      this.errorMessage = null;
      this.$refs.fileInput.value = '';
      this.$emit('image-cleared');
    },

    /**
     * Public method to reset the uploader
     */
    reset() {
      this.clearImage();
    }
  }
};
</script>

<style scoped>
.image-uploader {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  position: relative;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f7fafc;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

.upload-area.drag-over {
  border-color: #3182ce;
  background-color: #bee3f8;
  transform: scale(1.02);
}

.upload-area.has-preview {
  cursor: default;
  padding: 20px;
  min-height: auto;
}

.upload-area.has-preview:hover {
  border-color: #cbd5e0;
  background-color: #f7fafc;
}

.file-input {
  display: none;
}

.upload-prompt {
  pointer-events: none;
}

.upload-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 18px;
  color: #2d3748;
  margin-bottom: 8px;
}

.upload-text strong {
  color: #4299e1;
}

.upload-hint {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.preview-container {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.clear-button {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e53e3e;
  color: white;
  border: 2px solid white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.clear-button:hover {
  background-color: #c53030;
  transform: scale(1.1);
}

.clear-button:active {
  transform: scale(0.95);
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #fff5f5;
  border: 1px solid #fc8181;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-text {
  color: #c53030;
  font-size: 14px;
  text-align: left;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .upload-area {
    padding: 30px 15px;
    min-height: 250px;
  }

  .upload-icon {
    font-size: 48px;
  }

  .upload-text {
    font-size: 16px;
  }

  .upload-hint {
    font-size: 13px;
  }

  .preview-image {
    max-height: 300px;
  }
}
</style>
