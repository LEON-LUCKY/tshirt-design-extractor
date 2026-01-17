<!--
  ImageComparison Component
  
  Displays original and extracted images side-by-side with responsive layout.
  Shows transparency grid for extracted images.
  
  Requirements: 3.1, 3.2, 3.3, 3.4, 7.3
-->

<template>
  <div class="image-comparison" v-if="originalImage || extractedImage">
    <h2 class="comparison-title">图片对比</h2>
    
    <div class="comparison-container" :class="{ 'mobile-layout': isMobile }">
      <!-- Original Image -->
      <div v-if="originalImage" class="image-panel">
        <h3 class="panel-title">原始图片</h3>
        <div class="image-wrapper">
          <img
            :src="originalImage"
            alt="原始T恤图片"
            class="comparison-image"
            @load="handleImageLoad"
          />
        </div>
      </div>

      <!-- Extracted Image -->
      <div v-if="extractedImage" class="image-panel">
        <h3 class="panel-title">提取的图案</h3>
        <div class="image-wrapper with-transparency-grid">
          <div class="transparency-grid"></div>
          <img
            :src="extractedImage"
            alt="提取的图案设计"
            class="comparison-image extracted"
            @load="handleImageLoad"
          />
        </div>
        <p class="panel-hint">✓ 背景已移除（透明）</p>
      </div>
    </div>
  </div>
</template>

<script>
import { MOBILE_BREAKPOINT } from '@/constants';

export default {
  name: 'ImageComparison',

  props: {
    /**
     * Original image data URL
     */
    originalImage: {
      type: String,
      default: null
    },

    /**
     * Extracted image data URL (with transparent background)
     */
    extractedImage: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      isMobile: false
    };
  },

  mounted() {
    this.checkMobileLayout();
    window.addEventListener('resize', this.checkMobileLayout);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.checkMobileLayout);
  },

  methods: {
    /**
     * Checks if the current viewport is mobile size
     */
    checkMobileLayout() {
      this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    },

    /**
     * Handles image load event
     */
    handleImageLoad() {
      this.$emit('image-loaded');
    }
  }
};
</script>

<style scoped>
.image-comparison {
  width: 100%;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.comparison-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin-bottom: 32px;
}

.comparison-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.comparison-container.mobile-layout {
  grid-template-columns: 1fr;
  gap: 24px;
}

.image-panel {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 16px;
  text-align: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper.with-transparency-grid {
  background-color: transparent;
}

/* Transparency Grid (Checkerboard Pattern) */
.transparency-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  z-index: 0;
}

.comparison-image {
  position: relative;
  max-width: 100%;
  max-height: 500px;
  height: auto;
  width: auto;
  display: block;
  margin: 0 auto;
  object-fit: contain;
  z-index: 1;
  border-radius: 4px;
}

.comparison-image.extracted {
  /* Ensure extracted image is above the transparency grid */
  position: relative;
  z-index: 2;
}

.panel-hint {
  margin-top: 12px;
  font-size: 14px;
  color: #48bb78;
  text-align: center;
  font-weight: 500;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .image-comparison {
    margin: 30px auto;
    padding: 0 15px;
  }

  .comparison-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .image-panel {
    padding: 20px;
  }

  .panel-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .comparison-image {
    max-height: 350px;
  }

  .transparency-grid {
    background-size: 15px 15px;
    background-position: 0 0, 0 7.5px, 7.5px -7.5px, -7.5px 0px;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  .comparison-container {
    gap: 24px;
  }

  .comparison-image {
    max-height: 400px;
  }
}

/* Animation for image load */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.comparison-image {
  animation: fadeIn 0.3s ease;
}

/* Print styles */
@media print {
  .image-comparison {
    page-break-inside: avoid;
  }

  .comparison-container {
    grid-template-columns: 1fr 1fr;
  }

  .image-panel {
    box-shadow: none;
    border: 1px solid #e2e8f0;
  }
}
</style>
