/**
 * DownloadManager Service
 * 
 * Handles file download operations for the T-shirt design extractor application.
 * Provides methods to trigger browser downloads and generate timestamped filenames.
 * 
 * Requirements: 4.2, 4.3
 */

import {
  DOWNLOAD_FILENAME_PREFIX,
  DOWNLOAD_FILE_EXTENSION
} from '@/constants';

/**
 * DownloadManager class for handling image downloads
 */
class DownloadManager {
  /**
   * Triggers a browser download for the given image data
   * 
   * Creates a temporary anchor element, sets the download attribute,
   * and programmatically clicks it to trigger the browser's download dialog.
   * The anchor is immediately removed after triggering the download.
   * 
   * @param {string} dataUrl - The data URL of the image to download
   * @param {string} filename - The filename to use for the download
   * @throws {Error} If dataUrl or filename are invalid
   * 
   * Requirements:
   * - 4.2: Download extracted design in PNG format (preserving transparency)
   * 
   * @example
   * const downloadManager = new DownloadManager();
   * downloadManager.downloadImage('data:image/png;base64,...', 'my-design.png');
   */
  downloadImage(dataUrl, filename) {
    // Validate parameters
    if (!dataUrl || typeof dataUrl !== 'string') {
      throw new Error('Invalid dataUrl: must be a non-empty string');
    }

    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename: must be a non-empty string');
    }

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates a filename with a descriptive prefix and timestamp
   * 
   * Creates a filename in the format: prefix-YYYY-MM-DDTHH-MM-SS-sss.png
   * The timestamp is based on ISO 8601 format with colons and dots replaced
   * by hyphens to ensure filesystem compatibility.
   * 
   * @param {string} [prefix] - The prefix for the filename (defaults to DOWNLOAD_FILENAME_PREFIX constant)
   * @returns {string} Filename in format: prefix-YYYY-MM-DDTHH-MM-SS-sss.png
   * @throws {Error} If prefix is provided but not a string
   * 
   * Requirements:
   * - 4.3: Use descriptive filename with timestamp
   * 
   * @example
   * const downloadManager = new DownloadManager();
   * const filename = downloadManager.generateFilename();
   * // Returns: 'extracted-design-2024-01-15T10-30-45-123Z.png'
   * 
   * const customFilename = downloadManager.generateFilename('my-design');
   * // Returns: 'my-design-2024-01-15T10-30-45-123Z.png'
   */
  generateFilename(prefix = DOWNLOAD_FILENAME_PREFIX) {
    // Validate prefix parameter
    if (prefix !== undefined && typeof prefix !== 'string') {
      throw new Error('Invalid prefix: must be a string');
    }

    // Get current timestamp and format it
    // Replace colons and dots with hyphens for filesystem compatibility
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Return formatted filename with .png extension
    return `${prefix}-${timestamp}${DOWNLOAD_FILE_EXTENSION}`;
  }
}

// Export singleton instance
export default new DownloadManager();

// Also export the class for testing purposes
export { DownloadManager };
