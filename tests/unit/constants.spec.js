/**
 * Unit tests for constants
 * 
 * This test verifies that all constants are properly defined and exported.
 */

import {
  MAX_FILE_SIZE,
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
  ERROR_TYPES,
  ERROR_CODES,
  ERROR_MESSAGES,
  PROCESSING_STATUS,
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  OUTPUT_FORMAT,
  API_RETRY_CONFIG,
  API_TIMEOUT,
  MOBILE_BREAKPOINT,
  DOWNLOAD_FILENAME_PREFIX,
  VALIDATION_RULES,
  HTTP_STATUS,
  ASPECT_RATIO_TOLERANCE
} from '@/constants';

describe('Constants', () => {
  describe('File Validation Constants', () => {
    it('should define MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should define accepted MIME types', () => {
      expect(ACCEPTED_MIME_TYPES).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp'
      ]);
    });

    it('should define accepted file extensions', () => {
      expect(ACCEPTED_EXTENSIONS).toEqual([
        '.jpg',
        '.jpeg',
        '.png',
        '.webp'
      ]);
    });
  });

  describe('Error Type Constants', () => {
    it('should define all error types', () => {
      expect(ERROR_TYPES).toHaveProperty('UPLOAD_ERROR');
      expect(ERROR_TYPES).toHaveProperty('PROCESSING_ERROR');
      expect(ERROR_TYPES).toHaveProperty('API_ERROR');
      expect(ERROR_TYPES).toHaveProperty('NETWORK_ERROR');
    });

    it('should define all error codes', () => {
      expect(ERROR_CODES).toHaveProperty('INVALID_TYPE');
      expect(ERROR_CODES).toHaveProperty('FILE_TOO_LARGE');
      expect(ERROR_CODES).toHaveProperty('API_KEY_INVALID');
      expect(ERROR_CODES).toHaveProperty('NETWORK_TIMEOUT');
    });

    it('should define error messages for all error codes', () => {
      expect(ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]).toBeDefined();
      expect(ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE]).toBeDefined();
      expect(ERROR_MESSAGES[ERROR_CODES.API_KEY_INVALID]).toBeDefined();
    });
  });

  describe('Processing State Constants', () => {
    it('should define all processing statuses', () => {
      expect(PROCESSING_STATUS).toHaveProperty('IDLE');
      expect(PROCESSING_STATUS).toHaveProperty('UPLOADING');
      expect(PROCESSING_STATUS).toHaveProperty('COMPRESSING');
      expect(PROCESSING_STATUS).toHaveProperty('REMOVING_BACKGROUND');
      expect(PROCESSING_STATUS).toHaveProperty('RENDERING');
      expect(PROCESSING_STATUS).toHaveProperty('COMPLETE');
      expect(PROCESSING_STATUS).toHaveProperty('ERROR');
    });
  });

  describe('Image Processing Constants', () => {
    it('should define maximum image dimensions', () => {
      expect(MAX_IMAGE_WIDTH).toBe(2000);
      expect(MAX_IMAGE_HEIGHT).toBe(2000);
    });

    it('should define output format as PNG', () => {
      expect(OUTPUT_FORMAT).toBe('image/png');
    });
  });

  describe('API Configuration Constants', () => {
    it('should define API retry configuration', () => {
      expect(API_RETRY_CONFIG).toHaveProperty('MAX_ATTEMPTS', 3);
      expect(API_RETRY_CONFIG).toHaveProperty('INITIAL_DELAY', 1000);
      expect(API_RETRY_CONFIG).toHaveProperty('BACKOFF_MULTIPLIER', 2);
    });

    it('should define API timeout', () => {
      expect(API_TIMEOUT).toBe(30000);
    });
  });

  describe('UI Constants', () => {
    it('should define mobile breakpoint', () => {
      expect(MOBILE_BREAKPOINT).toBe(768);
    });
  });

  describe('Download Constants', () => {
    it('should define download filename prefix', () => {
      expect(DOWNLOAD_FILENAME_PREFIX).toBe('extracted-design');
    });
  });

  describe('Validation Rules', () => {
    it('should consolidate validation rules', () => {
      expect(VALIDATION_RULES).toHaveProperty('maxFileSize', MAX_FILE_SIZE);
      expect(VALIDATION_RULES).toHaveProperty('acceptedMimeTypes', ACCEPTED_MIME_TYPES);
      expect(VALIDATION_RULES).toHaveProperty('acceptedExtensions', ACCEPTED_EXTENSIONS);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should define common HTTP status codes', () => {
      expect(HTTP_STATUS).toHaveProperty('OK', 200);
      expect(HTTP_STATUS).toHaveProperty('BAD_REQUEST', 400);
      expect(HTTP_STATUS).toHaveProperty('UNAUTHORIZED', 401);
      expect(HTTP_STATUS).toHaveProperty('TOO_MANY_REQUESTS', 429);
      expect(HTTP_STATUS).toHaveProperty('INTERNAL_SERVER_ERROR', 500);
    });
  });

  describe('Aspect Ratio Tolerance', () => {
    it('should define aspect ratio tolerance', () => {
      expect(ASPECT_RATIO_TOLERANCE).toBe(0.01);
    });
  });
});
