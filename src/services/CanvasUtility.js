/**
 * Canvas Utility Service
 * 
 * This service provides utility functions for Canvas operations including:
 * - Loading images from DataURL
 * - Creating canvas elements
 * - Converting canvas to Blob
 * - Resizing images while maintaining aspect ratio
 * 
 * Requirements: 3.2, 3.3, 6.1
 */

import {
  ERROR_CODES,
  ERROR_MESSAGES
} from '@/constants';

/**
 * CanvasUtility class provides Canvas manipulation utilities
 */
class CanvasUtility {
  /**
   * Loads an image from a DataURL
   * 
   * Creates an HTMLImageElement and loads the image from the provided DataURL.
   * Returns a Promise that resolves with the loaded image or rejects on error.
   * 
   * @param {string} dataUrl - The DataURL of the image to load
   * @returns {Promise<HTMLImageElement>} Promise that resolves with the loaded image
   * @throws {Error} If the image fails to load or dataUrl is invalid
   * 
   * @example
   * const canvasUtil = new CanvasUtility();
   * const img = await canvasUtil.loadImage('data:image/png;base64,...');
   * console.log(img.width, img.height);
   */
  loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      // Validate dataUrl parameter
      if (!dataUrl || typeof dataUrl !== 'string') {
        reject(new Error(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]));
        return;
      }

      // Create image element
      const img = new Image();

      // Set up load handler
      img.onload = () => {
        resolve(img);
      };

      // Set up error handler
      img.onerror = () => {
        reject(new Error(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]));
      };

      // Start loading the image
      img.src = dataUrl;
    });
  }

  /**
   * Creates a canvas element with specified dimensions
   * 
   * Creates an HTMLCanvasElement with the given width and height.
   * The canvas is created in memory and not attached to the DOM.
   * 
   * @param {number} width - The width of the canvas in pixels
   * @param {number} height - The height of the canvas in pixels
   * @returns {HTMLCanvasElement} The created canvas element
   * @throws {Error} If width or height are invalid
   * 
   * @example
   * const canvasUtil = new CanvasUtility();
   * const canvas = canvasUtil.createCanvas(800, 600);
   * const ctx = canvas.getContext('2d');
   */
  createCanvas(width, height) {
    // Validate parameters
    if (typeof width !== 'number' || typeof height !== 'number' || 
        width <= 0 || height <= 0 || 
        !isFinite(width) || !isFinite(height)) {
      throw new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    }

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  /**
   * Converts a canvas to a Blob
   * 
   * Converts the canvas content to a Blob in the specified format.
   * Returns a Promise that resolves with the Blob or rejects on error.
   * 
   * @param {HTMLCanvasElement} canvas - The canvas to convert
   * @param {string} [format='image/png'] - The output format (MIME type)
   * @param {number} [quality=0.95] - The image quality (0-1) for lossy formats
   * @returns {Promise<Blob>} Promise that resolves with the Blob
   * @throws {Error} If conversion fails or canvas is invalid
   * 
   * @example
   * const canvasUtil = new CanvasUtility();
   * const blob = await canvasUtil.imageToBlob(canvas, 'image/png');
   * console.log(blob.size, blob.type);
   */
  imageToBlob(canvas, format = 'image/png', quality = 0.95) {
    return new Promise((resolve, reject) => {
      // Validate canvas parameter
      if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
        reject(new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]));
        return;
      }

      // Validate format parameter
      if (typeof format !== 'string' || !format.startsWith('image/')) {
        reject(new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]));
        return;
      }

      // Validate quality parameter
      if (typeof quality !== 'number' || quality < 0 || quality > 1) {
        reject(new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]));
        return;
      }

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]));
          }
        },
        format,
        quality
      );
    });
  }

  /**
   * Resizes an image while maintaining aspect ratio
   * 
   * Resizes the image to fit within the specified maximum dimensions
   * while preserving the original aspect ratio. If the image is smaller
   * than the maximum dimensions, it is not upscaled.
   * 
   * The function ensures that:
   * - The output width does not exceed maxWidth
   * - The output height does not exceed maxHeight
   * - The aspect ratio is preserved (within ASPECT_RATIO_TOLERANCE)
   * 
   * @param {HTMLImageElement} image - The image to resize
   * @param {number} maxWidth - Maximum width in pixels
   * @param {number} maxHeight - Maximum height in pixels
   * @returns {HTMLCanvasElement} Canvas containing the resized image
   * @throws {Error} If parameters are invalid
   * 
   * @example
   * const canvasUtil = new CanvasUtility();
   * const img = await canvasUtil.loadImage('data:image/png;base64,...');
   * const canvas = canvasUtil.resizeImage(img, 800, 600);
   * // If img was 1600x1200, canvas will be 800x600 (aspect ratio preserved)
   */
  resizeImage(image, maxWidth, maxHeight) {
    // Validate image parameter
    if (!image || !(image instanceof HTMLImageElement)) {
      throw new Error(ERROR_MESSAGES[ERROR_CODES.IMAGE_LOAD_ERROR]);
    }

    // Validate dimension parameters
    if (typeof maxWidth !== 'number' || typeof maxHeight !== 'number' ||
        maxWidth <= 0 || maxHeight <= 0 ||
        !isFinite(maxWidth) || !isFinite(maxHeight)) {
      throw new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    }

    // Get original dimensions
    let width = image.width;
    let height = image.height;

    // If image is already smaller than max dimensions, use original size
    if (width <= maxWidth && height <= maxHeight) {
      const canvas = this.createCanvas(width, height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return canvas;
    }

    // Calculate new dimensions while maintaining aspect ratio
    // First, try to fit by width
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
    }

    // Then, check if height still exceeds maxHeight
    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = Math.round(width * ratio);
    }

    // Create canvas with new dimensions
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw resized image
    ctx.drawImage(image, 0, 0, width, height);

    return canvas;
  }

  /**
   * Adds a transparency grid background to a canvas
   * 
   * Draws a checkerboard pattern (like in image editors) to visualize
   * transparent areas. This is useful for displaying images with transparency.
   * 
   * @param {HTMLCanvasElement} canvas - The canvas to add the grid to
   * @param {number} [gridSize=10] - Size of each grid square in pixels
   * @param {string} [color1='#ffffff'] - First color of the checkerboard
   * @param {string} [color2='#cccccc'] - Second color of the checkerboard
   * @returns {HTMLCanvasElement} A new canvas with the grid background
   * 
   * @example
   * const canvasUtil = new CanvasUtility();
   * const gridCanvas = canvasUtil.addTransparencyGrid(canvas);
   */
  addTransparencyGrid(canvas, gridSize = 10, color1 = '#ffffff', color2 = '#cccccc') {
    // Validate canvas parameter
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error(ERROR_MESSAGES[ERROR_CODES.CANVAS_ERROR]);
    }

    // Create a new canvas with the same dimensions
    const newCanvas = this.createCanvas(canvas.width, canvas.height);
    const ctx = newCanvas.getContext('2d');

    // Draw checkerboard pattern
    for (let y = 0; y < canvas.height; y += gridSize) {
      for (let x = 0; x < canvas.width; x += gridSize) {
        // Alternate colors in checkerboard pattern
        const isEvenRow = Math.floor(y / gridSize) % 2 === 0;
        const isEvenCol = Math.floor(x / gridSize) % 2 === 0;
        const useColor1 = isEvenRow === isEvenCol;
        
        ctx.fillStyle = useColor1 ? color1 : color2;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }

    // Draw the original canvas on top
    ctx.drawImage(canvas, 0, 0);

    return newCanvas;
  }
}

// Export a singleton instance
export default new CanvasUtility();

// Also export the class for testing purposes
export { CanvasUtility };
