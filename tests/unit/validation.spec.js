/**
 * Unit tests for validation utilities
 * 
 * Tests the file validation functions including type validation,
 * size validation, and comprehensive file validation.
 * 
 * Requirements: 1.2, 1.3, 1.4
 */

import {
  validateFileType,
  validateFileSize,
  validateFile
} from '@/utils/validation';

import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
  ERROR_CODES
} from '@/constants';

describe('File Validation Utilities', () => {
  describe('validateFileType', () => {
    it('should accept valid JPEG MIME type', () => {
      const result = validateFileType('image/jpeg');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept valid PNG MIME type', () => {
      const result = validateFileType('image/png');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept valid WebP MIME type', () => {
      const result = validateFileType('image/webp');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid MIME type (GIF)', () => {
      const result = validateFileType('image/gif');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
      expect(result.error.message).toBeDefined();
    });

    it('should reject invalid MIME type (PDF)', () => {
      const result = validateFileType('application/pdf');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject invalid MIME type (text)', () => {
      const result = validateFileType('text/plain');
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject empty string', () => {
      const result = validateFileType('');
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject null value', () => {
      const result = validateFileType(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject undefined value', () => {
      const result = validateFileType(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject non-string value', () => {
      const result = validateFileType(123);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should be case-sensitive', () => {
      const result = validateFileType('IMAGE/JPEG');
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });
  });

  describe('validateFileSize', () => {
    it('should accept file size of 0 bytes', () => {
      const result = validateFileSize(0);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept file size of 1 byte', () => {
      const result = validateFileSize(1);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept file size of 5MB', () => {
      const fiveMB = 5 * 1024 * 1024;
      const result = validateFileSize(fiveMB);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept file size exactly at 10MB limit', () => {
      const result = validateFileSize(MAX_FILE_SIZE);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject file size of 10MB + 1 byte', () => {
      const result = validateFileSize(MAX_FILE_SIZE + 1);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
      expect(result.error.message).toBeDefined();
    });

    it('should reject file size of 15MB', () => {
      const fifteenMB = 15 * 1024 * 1024;
      const result = validateFileSize(fifteenMB);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject file size of 100MB', () => {
      const hundredMB = 100 * 1024 * 1024;
      const result = validateFileSize(hundredMB);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject negative file size', () => {
      const result = validateFileSize(-1);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject non-number value (string)', () => {
      const result = validateFileSize('1000');
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject non-number value (null)', () => {
      const result = validateFileSize(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject non-number value (undefined)', () => {
      const result = validateFileSize(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should accept custom max size parameter', () => {
      const customMax = 5 * 1024 * 1024; // 5MB
      const result = validateFileSize(6 * 1024 * 1024, customMax);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should accept file at custom max size limit', () => {
      const customMax = 5 * 1024 * 1024; // 5MB
      const result = validateFileSize(customMax, customMax);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('validateFile', () => {
    it('should accept valid JPEG file with valid size', () => {
      const file = new File(['x'.repeat(1000)], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept valid PNG file with valid size', () => {
      const file = new File(['x'.repeat(1000)], 'test.png', { type: 'image/png' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept valid WebP file with valid size', () => {
      const file = new File(['x'.repeat(1000)], 'test.webp', { type: 'image/webp' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept JPEG file with .jpeg extension', () => {
      const file = new File(['x'.repeat(1000)], 'test.jpeg', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject file with invalid MIME type', () => {
      const file = new File(['x'.repeat(1000)], 'test.gif', { type: 'image/gif' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject file that is too large', () => {
      const largeContent = 'x'.repeat(MAX_FILE_SIZE + 1000);
      const file = new File([largeContent], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.FILE_TOO_LARGE);
    });

    it('should reject file with valid MIME type but invalid extension', () => {
      const file = new File(['x'.repeat(1000)], 'test.txt', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject file with invalid MIME type but valid extension', () => {
      const file = new File(['x'.repeat(1000)], 'test.jpg', { type: 'text/plain' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should accept file with uppercase extension', () => {
      const file = new File(['x'.repeat(1000)], 'test.JPG', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept file with mixed case extension', () => {
      const file = new File(['x'.repeat(1000)], 'test.JpG', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject null file', () => {
      const result = validateFile(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject undefined file', () => {
      const result = validateFile(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject non-File object', () => {
      const result = validateFile({ name: 'test.jpg', type: 'image/jpeg', size: 1000 });
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should reject empty object', () => {
      const result = validateFile({});
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should handle file with no extension', () => {
      const file = new File(['x'.repeat(1000)], 'test', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should handle file with empty name', () => {
      const file = new File(['x'.repeat(1000)], '', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_TYPE);
    });

    it('should accept file at exactly 10MB with valid type', () => {
      const content = 'x'.repeat(MAX_FILE_SIZE);
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle file with path in name', () => {
      const file = new File(['x'.repeat(1000)], 'path/to/test.jpg', { type: 'image/jpeg' });
      const result = validateFile(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Integration - All validation functions', () => {
    it('should have consistent error codes across functions', () => {
      const typeResult = validateFileType('image/gif');
      const file = new File(['x'], 'test.gif', { type: 'image/gif' });
      const fileResult = validateFile(file);
      
      expect(typeResult.error.code).toBe(fileResult.error.code);
    });

    it('should have consistent error messages across functions', () => {
      const typeResult = validateFileType('image/gif');
      const file = new File(['x'], 'test.gif', { type: 'image/gif' });
      const fileResult = validateFile(file);
      
      expect(typeResult.error.message).toBe(fileResult.error.message);
    });

    it('should validate all accepted MIME types', () => {
      ACCEPTED_MIME_TYPES.forEach(mimeType => {
        const result = validateFileType(mimeType);
        expect(result.isValid).toBe(true);
      });
    });

    it('should return proper structure for valid results', () => {
      const result = validateFileType('image/jpeg');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('error');
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should return proper structure for invalid results', () => {
      const result = validateFileType('image/gif');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('error');
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
    });
  });
});
