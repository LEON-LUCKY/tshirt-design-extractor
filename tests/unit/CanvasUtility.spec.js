/**
 * Unit tests for CanvasUtility service
 * 
 * Tests the Canvas utility functions including image loading,
 * canvas creation, blob conversion, and image resizing.
 * 
 * Requirements: 3.2, 3.3, 6.1
 */

import { CanvasUtility } from '@/services/CanvasUtility';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  ASPECT_RATIO_TOLERANCE
} from '@/constants';

describe('CanvasUtility Service', () => {
  let canvasUtil;

  beforeEach(() => {
    canvasUtil = new CanvasUtility();
  });

  describe('createCanvas', () => {
    it('should create a canvas with specified dimensions', () => {
      const canvas = canvasUtil.createCanvas(800, 600);

      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('should create a canvas with small dimensions', () => {
      const canvas = canvasUtil.createCanvas(1, 1);

      expect(canvas.width).toBe(1);
      expect(canvas.height).toBe(1);
    });

    it('should create a canvas with large dimensions', () => {
      const canvas = canvasUtil.createCanvas(4000, 3000);

      expect(canvas.width).toBe(4000);
      expect(canvas.height).toBe(3000);
    });

    it('should create a canvas with non-square dimensions', () => {
      const canvas = canvasUtil.createCanvas(1920, 1080);

      expect(canvas.width).toBe(1920);
      expect(canvas.height).toBe(1080);
    });

    it('should throw error for zero width', () => {
      expect(() => {
        canvasUtil.createCanvas(0, 600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for zero height', () => {
      expect(() => {
        canvasUtil.createCanvas(800, 0);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for negative width', () => {
      expect(() => {
        canvasUtil.createCanvas(-800, 600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for negative height', () => {
      expect(() => {
        canvasUtil.createCanvas(800, -600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for non-number width', () => {
      expect(() => {
        canvasUtil.createCanvas('800', 600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for non-number height', () => {
      expect(() => {
        canvasUtil.createCanvas(800, '600');
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for NaN width', () => {
      expect(() => {
        canvasUtil.createCanvas(NaN, 600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for Infinity width', () => {
      expect(() => {
        canvasUtil.createCanvas(Infinity, 600);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should have a 2d context available', () => {
      const canvas = canvasUtil.createCanvas(800, 600);
      const ctx = canvas.getContext('2d');

      expect(ctx).toBeTruthy();
      expect(typeof ctx).toBe('object');
    });
  });

  describe('loadImage', () => {
    it('should load image from valid DataURL', async () => {
      // Create a simple 1x1 red pixel PNG DataURL
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

      // Mock Image to simulate successful load
      const originalImage = global.Image;
      global.Image = class MockImage {
        constructor() {
          this.width = 1;
          this.height = 1;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      };

      const img = await canvasUtil.loadImage(dataUrl);

      expect(img).toBeDefined();
      expect(img.width).toBeGreaterThan(0);
      expect(img.height).toBeGreaterThan(0);

      // Restore original Image
      global.Image = originalImage;
    });

    it('should reject with error for invalid DataURL', async () => {
      const invalidDataUrl = 'data:image/png;base64,invalid';

      // Mock Image to simulate error
      const originalImage = global.Image;
      global.Image = class MockImage {
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };

      await expect(canvasUtil.loadImage(invalidDataUrl)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );

      // Restore original Image
      global.Image = originalImage;
    });

    it('should reject with error for empty string', async () => {
      await expect(canvasUtil.loadImage('')).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );
    });

    it('should reject with error for null', async () => {
      await expect(canvasUtil.loadImage(null)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );
    });

    it('should reject with error for undefined', async () => {
      await expect(canvasUtil.loadImage(undefined)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );
    });

    it('should reject with error for non-string value', async () => {
      await expect(canvasUtil.loadImage(123)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );
    });

    it('should reject with error for malformed DataURL', async () => {
      const malformedDataUrl = 'not-a-data-url';

      // Mock Image to simulate error
      const originalImage = global.Image;
      global.Image = class MockImage {
        constructor() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };

      await expect(canvasUtil.loadImage(malformedDataUrl)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]
      );

      // Restore original Image
      global.Image = originalImage;
    });
  });

  describe('imageToBlob', () => {
    let canvas;

    beforeEach(() => {
      canvas = canvasUtil.createCanvas(100, 100);
      const ctx = canvas.getContext('2d');
      // Draw something on the canvas
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 100, 100);
    });

    it('should convert canvas to PNG blob by default', async () => {
      const blob = await canvasUtil.imageToBlob(canvas);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should convert canvas to PNG blob with explicit format', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/png');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should convert canvas to JPEG blob', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/jpeg');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should convert canvas to WebP blob', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/webp');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/webp');
    });

    it('should accept custom quality parameter', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/jpeg', 0.5);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('should reject with error for null canvas', async () => {
      await expect(canvasUtil.imageToBlob(null)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for undefined canvas', async () => {
      await expect(canvasUtil.imageToBlob(undefined)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for non-canvas object', async () => {
      const notCanvas = { width: 100, height: 100 };

      await expect(canvasUtil.imageToBlob(notCanvas)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for invalid format', async () => {
      await expect(canvasUtil.imageToBlob(canvas, 'text/plain')).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for empty format string', async () => {
      await expect(canvasUtil.imageToBlob(canvas, '')).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for quality < 0', async () => {
      await expect(canvasUtil.imageToBlob(canvas, 'image/png', -0.1)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should reject with error for quality > 1', async () => {
      await expect(canvasUtil.imageToBlob(canvas, 'image/png', 1.1)).rejects.toThrow(
        ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]
      );
    });

    it('should accept quality of 0', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/jpeg', 0);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should accept quality of 1', async () => {
      const blob = await canvasUtil.imageToBlob(canvas, 'image/jpeg', 1);

      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('resizeImage', () => {
    let createMockImage;

    beforeEach(() => {
      // Helper function to create mock images
      createMockImage = (width, height) => {
        const img = new Image();
        Object.defineProperty(img, 'width', { value: width, writable: false });
        Object.defineProperty(img, 'height', { value: height, writable: false });
        return img;
      };
    });

    it('should resize image to fit within max dimensions', () => {
      const img = createMockImage(1000, 500);
      const canvas = canvasUtil.resizeImage(img, 500, 500);

      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(250);
    });

    it('should maintain aspect ratio when resizing by width', () => {
      const img = createMockImage(2000, 1000);
      const canvas = canvasUtil.resizeImage(img, 1000, 2000);

      const originalRatio = 2000 / 1000;
      const resultRatio = canvas.width / canvas.height;

      expect(Math.abs(originalRatio - resultRatio)).toBeLessThan(ASPECT_RATIO_TOLERANCE);
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(500);
    });

    it('should maintain aspect ratio when resizing by height', () => {
      const img = createMockImage(1000, 2000);
      const canvas = canvasUtil.resizeImage(img, 2000, 1000);

      const originalRatio = 1000 / 2000;
      const resultRatio = canvas.width / canvas.height;

      expect(Math.abs(originalRatio - resultRatio)).toBeLessThan(ASPECT_RATIO_TOLERANCE);
      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(1000);
    });

    it('should not upscale image smaller than max dimensions', () => {
      const img = createMockImage(400, 300);
      const canvas = canvasUtil.resizeImage(img, 800, 600);

      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });

    it('should handle square images', () => {
      const img = createMockImage(1000, 1000);
      const canvas = canvasUtil.resizeImage(img, 500, 500);

      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(500);
    });

    it('should handle very wide images', () => {
      const img = createMockImage(4000, 1000);
      const canvas = canvasUtil.resizeImage(img, 2000, 2000);

      expect(canvas.width).toBe(2000);
      expect(canvas.height).toBe(500);
      expect(canvas.width).toBeLessThanOrEqual(2000);
      expect(canvas.height).toBeLessThanOrEqual(2000);
    });

    it('should handle very tall images', () => {
      const img = createMockImage(1000, 4000);
      const canvas = canvasUtil.resizeImage(img, 2000, 2000);

      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(2000);
      expect(canvas.width).toBeLessThanOrEqual(2000);
      expect(canvas.height).toBeLessThanOrEqual(2000);
    });

    it('should handle image that needs both width and height constraint', () => {
      const img = createMockImage(3000, 2000);
      const canvas = canvasUtil.resizeImage(img, 1500, 800);

      // Should be constrained by height (800)
      expect(canvas.height).toBe(800);
      expect(canvas.width).toBe(1200);
      expect(canvas.width).toBeLessThanOrEqual(1500);
      expect(canvas.height).toBeLessThanOrEqual(800);
    });

    it('should preserve aspect ratio for portrait images', () => {
      const img = createMockImage(600, 800);
      const canvas = canvasUtil.resizeImage(img, 300, 500);

      const originalRatio = 600 / 800;
      const resultRatio = canvas.width / canvas.height;

      expect(Math.abs(originalRatio - resultRatio)).toBeLessThan(ASPECT_RATIO_TOLERANCE);
    });

    it('should preserve aspect ratio for landscape images', () => {
      const img = createMockImage(800, 600);
      const canvas = canvasUtil.resizeImage(img, 500, 300);

      const originalRatio = 800 / 600;
      const resultRatio = canvas.width / canvas.height;

      expect(Math.abs(originalRatio - resultRatio)).toBeLessThan(ASPECT_RATIO_TOLERANCE);
    });

    it('should throw error for null image', () => {
      expect(() => {
        canvasUtil.resizeImage(null, 500, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]);
    });

    it('should throw error for undefined image', () => {
      expect(() => {
        canvasUtil.resizeImage(undefined, 500, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]);
    });

    it('should throw error for non-image object', () => {
      const notImage = { width: 100, height: 100 };

      expect(() => {
        canvasUtil.resizeImage(notImage, 500, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]);
    });

    it('should throw error for zero maxWidth', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, 0, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for zero maxHeight', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, 500, 0);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for negative maxWidth', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, -500, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for negative maxHeight', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, 500, -500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for non-number maxWidth', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, '500', 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for Infinity maxWidth', () => {
      const img = createMockImage(1000, 500);

      expect(() => {
        canvasUtil.resizeImage(img, Infinity, 500);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should handle 1x1 pixel image', () => {
      const img = createMockImage(1, 1);
      const canvas = canvasUtil.resizeImage(img, 100, 100);

      expect(canvas.width).toBe(1);
      expect(canvas.height).toBe(1);
    });

    it('should handle very large max dimensions', () => {
      const img = createMockImage(1000, 500);
      const canvas = canvasUtil.resizeImage(img, 10000, 10000);

      // Should not upscale
      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(500);
    });
  });

  describe('addTransparencyGrid', () => {
    let canvas;

    beforeEach(() => {
      canvas = canvasUtil.createCanvas(100, 100);
    });

    it('should add transparency grid to canvas', () => {
      const gridCanvas = canvasUtil.addTransparencyGrid(canvas);

      expect(gridCanvas).toBeInstanceOf(HTMLCanvasElement);
      expect(gridCanvas.width).toBe(100);
      expect(gridCanvas.height).toBe(100);
    });

    it('should create a new canvas (not modify original)', () => {
      const gridCanvas = canvasUtil.addTransparencyGrid(canvas);

      expect(gridCanvas).not.toBe(canvas);
    });

    it('should accept custom grid size', () => {
      const gridCanvas = canvasUtil.addTransparencyGrid(canvas, 20);

      expect(gridCanvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should accept custom colors', () => {
      const gridCanvas = canvasUtil.addTransparencyGrid(canvas, 10, '#ff0000', '#00ff00');

      expect(gridCanvas).toBeInstanceOf(HTMLCanvasElement);
    });

    it('should throw error for null canvas', () => {
      expect(() => {
        canvasUtil.addTransparencyGrid(null);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for undefined canvas', () => {
      expect(() => {
        canvasUtil.addTransparencyGrid(undefined);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });

    it('should throw error for non-canvas object', () => {
      const notCanvas = { width: 100, height: 100 };

      expect(() => {
        canvasUtil.addTransparencyGrid(notCanvas);
      }).toThrow(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    });
  });

  describe('Integration - Multiple operations', () => {
    it('should chain operations: create canvas, convert to blob', async () => {
      const canvas = canvasUtil.createCanvas(200, 200);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 200, 200);

      const blob = await canvasUtil.imageToBlob(canvas);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should chain operations: resize and convert to blob', async () => {
      const createMockImage = (width, height) => {
        const img = new Image();
        Object.defineProperty(img, 'width', { value: width, writable: false });
        Object.defineProperty(img, 'height', { value: height, writable: false });
        return img;
      };

      const img = createMockImage(1000, 500);
      const canvas = canvasUtil.resizeImage(img, 500, 500);
      const blob = await canvasUtil.imageToBlob(canvas);

      expect(blob).toBeInstanceOf(Blob);
      expect(canvas.width).toBe(500);
      expect(canvas.height).toBe(250);
    });

    it('should handle multiple canvas creations', () => {
      const canvas1 = canvasUtil.createCanvas(100, 100);
      const canvas2 = canvasUtil.createCanvas(200, 200);
      const canvas3 = canvasUtil.createCanvas(300, 300);

      expect(canvas1.width).toBe(100);
      expect(canvas2.width).toBe(200);
      expect(canvas3.width).toBe(300);
    });
  });
});
