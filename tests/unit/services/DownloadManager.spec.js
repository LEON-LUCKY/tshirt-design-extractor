/**
 * Unit Tests for DownloadManager Service
 * 
 * Tests download functionality, filename generation, and error handling.
 * 
 * Requirements: 4.2, 4.3
 */

import { DownloadManager } from '@/services/DownloadManager';
import {
  DOWNLOAD_FILENAME_PREFIX,
  DOWNLOAD_FILE_EXTENSION
} from '@/constants';

describe('DownloadManager Service', () => {
  let downloadManager;
  let mockLink;
  let appendChildSpy;
  let removeChildSpy;

  beforeEach(() => {
    downloadManager = new DownloadManager();
    
    // Mock DOM elements
    mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    
    // Mock document methods
    document.createElement = jest.fn(() => mockLink);
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  describe('downloadImage', () => {
    it('should successfully download image with valid parameters', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const filename = 'test-image.png';

      downloadManager.downloadImage(dataUrl, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe(dataUrl);
      expect(mockLink.download).toBe(filename);
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(mockLink.click).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should throw error when dataUrl is null', () => {
      expect(() => {
        downloadManager.downloadImage(null, 'test.png');
      }).toThrow('Invalid dataUrl: must be a non-empty string');
    });

    it('should throw error when dataUrl is undefined', () => {
      expect(() => {
        downloadManager.downloadImage(undefined, 'test.png');
      }).toThrow('Invalid dataUrl: must be a non-empty string');
    });

    it('should throw error when dataUrl is empty string', () => {
      expect(() => {
        downloadManager.downloadImage('', 'test.png');
      }).toThrow('Invalid dataUrl: must be a non-empty string');
    });

    it('should throw error when dataUrl is not a string', () => {
      expect(() => {
        downloadManager.downloadImage(123, 'test.png');
      }).toThrow('Invalid dataUrl: must be a non-empty string');
    });

    it('should throw error when filename is null', () => {
      expect(() => {
        downloadManager.downloadImage('data:image/png;base64,test', null);
      }).toThrow('Invalid filename: must be a non-empty string');
    });

    it('should throw error when filename is undefined', () => {
      expect(() => {
        downloadManager.downloadImage('data:image/png;base64,test', undefined);
      }).toThrow('Invalid filename: must be a non-empty string');
    });

    it('should throw error when filename is empty string', () => {
      expect(() => {
        downloadManager.downloadImage('data:image/png;base64,test', '');
      }).toThrow('Invalid filename: must be a non-empty string');
    });

    it('should throw error when filename is not a string', () => {
      expect(() => {
        downloadManager.downloadImage('data:image/png;base64,test', 123);
      }).toThrow('Invalid filename: must be a non-empty string');
    });

    it('should handle blob URLs', () => {
      const blobUrl = 'blob:http://localhost:8080/abc-123';
      const filename = 'test.png';

      downloadManager.downloadImage(blobUrl, filename);

      expect(mockLink.href).toBe(blobUrl);
      expect(mockLink.download).toBe(filename);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should create and remove link element in correct order', () => {
      const dataUrl = 'data:image/png;base64,test';
      const filename = 'test.png';

      downloadManager.downloadImage(dataUrl, filename);

      // Verify order of operations
      const appendCall = appendChildSpy.mock.invocationCallOrder[0];
      const clickCall = mockLink.click.mock.invocationCallOrder[0];
      const removeCall = removeChildSpy.mock.invocationCallOrder[0];

      expect(appendCall).toBeLessThan(clickCall);
      expect(clickCall).toBeLessThan(removeCall);
    });
  });

  describe('generateFilename', () => {
    beforeEach(() => {
      // Mock Date to return consistent timestamp
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:30:45.123Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should generate filename with default prefix', () => {
      const filename = downloadManager.generateFilename();

      expect(filename).toContain(DOWNLOAD_FILENAME_PREFIX);
      expect(filename).toContain('2024-01-15T10-30-45-123Z');
      expect(filename.endsWith(DOWNLOAD_FILE_EXTENSION)).toBe(true);
    });

    it('should generate filename with custom prefix', () => {
      const customPrefix = 'my-design';
      const filename = downloadManager.generateFilename(customPrefix);

      expect(filename).toContain(customPrefix);
      expect(filename).toContain('2024-01-15T10-30-45-123Z');
      expect(filename.endsWith(DOWNLOAD_FILE_EXTENSION)).toBe(true);
    });

    it('should replace colons with hyphens in timestamp', () => {
      const filename = downloadManager.generateFilename();

      expect(filename).not.toContain(':');
      expect(filename).toContain('-');
    });

    it('should replace dots with hyphens in timestamp', () => {
      const filename = downloadManager.generateFilename();

      // Should not contain dots except in file extension
      const filenameWithoutExtension = filename.replace(DOWNLOAD_FILE_EXTENSION, '');
      expect(filenameWithoutExtension).not.toContain('.');
    });

    it('should generate unique filenames for different timestamps', () => {
      const filename1 = downloadManager.generateFilename();

      // Advance time by 1 second
      jest.advanceTimersByTime(1000);

      const filename2 = downloadManager.generateFilename();

      expect(filename1).not.toBe(filename2);
    });

    it('should throw error when prefix is not a string', () => {
      expect(() => {
        downloadManager.generateFilename(123);
      }).toThrow('Invalid prefix: must be a string');
    });

    it('should throw error when prefix is a boolean', () => {
      expect(() => {
        downloadManager.generateFilename(true);
      }).toThrow('Invalid prefix: must be a string');
    });

    it('should throw error when prefix is an object', () => {
      expect(() => {
        downloadManager.generateFilename({});
      }).toThrow('Invalid prefix: must be a string');
    });

    it('should accept empty string as prefix', () => {
      const filename = downloadManager.generateFilename('');

      expect(filename).toContain('-2024-01-15T10-30-45-123Z');
      expect(filename.endsWith(DOWNLOAD_FILE_EXTENSION)).toBe(true);
    });

    it('should format filename correctly', () => {
      const filename = downloadManager.generateFilename('test');

      // Expected format: test-2024-01-15T10-30-45-123Z.png
      expect(filename).toMatch(/^test-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png$/);
    });

    it('should use ISO 8601 timestamp format', () => {
      const filename = downloadManager.generateFilename();

      // Should contain date and time components
      expect(filename).toContain('2024-01-15');
      expect(filename).toContain('T10-30-45');
      expect(filename).toContain('Z');
    });

    it('should include milliseconds in timestamp', () => {
      const filename = downloadManager.generateFilename();

      expect(filename).toContain('-123Z');
    });
  });

  describe('Integration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:30:45.123Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should generate filename and download in one flow', () => {
      const dataUrl = 'data:image/png;base64,test';
      const filename = downloadManager.generateFilename('my-design');

      downloadManager.downloadImage(dataUrl, filename);

      expect(mockLink.href).toBe(dataUrl);
      expect(mockLink.download).toBe('my-design-2024-01-15T10-30-45-123Z.png');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should handle multiple downloads', () => {
      const dataUrl1 = 'data:image/png;base64,test1';
      const dataUrl2 = 'data:image/png;base64,test2';

      downloadManager.downloadImage(dataUrl1, 'file1.png');
      downloadManager.downloadImage(dataUrl2, 'file2.png');

      expect(mockLink.click).toHaveBeenCalledTimes(2);
      expect(appendChildSpy).toHaveBeenCalledTimes(2);
      expect(removeChildSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long data URLs', () => {
      const longDataUrl = 'data:image/png;base64,' + 'A'.repeat(10000);
      const filename = 'test.png';

      expect(() => {
        downloadManager.downloadImage(longDataUrl, filename);
      }).not.toThrow();

      expect(mockLink.href).toBe(longDataUrl);
    });

    it('should handle special characters in filename', () => {
      const dataUrl = 'data:image/png;base64,test';
      const filename = 'test-图案-design.png';

      downloadManager.downloadImage(dataUrl, filename);

      expect(mockLink.download).toBe(filename);
    });

    it('should handle filename with spaces', () => {
      const dataUrl = 'data:image/png;base64,test';
      const filename = 'my test file.png';

      downloadManager.downloadImage(dataUrl, filename);

      expect(mockLink.download).toBe(filename);
    });
  });
});
