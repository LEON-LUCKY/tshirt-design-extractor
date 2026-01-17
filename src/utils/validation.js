/**
 * File Validation Utilities
 * 
 * This module provides validation functions for file uploads.
 * It validates file types, sizes, and provides comprehensive file validation.
 * 
 * Requirements: 1.2, 1.3, 1.4
 */

import {
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  ERROR_CODES,
  ERROR_MESSAGES
} from '@/constants';

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {Object|null} error - Error details if validation failed
 * @property {string} error.code - Error code from ERROR_CODES
 * @property {string} error.message - User-friendly error message
 */

/**
 * Validates if a file's MIME type is supported
 * 
 * Accepts JPEG, PNG, and WebP image formats.
 * 
 * @param {string} mimeType - The MIME type to validate (e.g., 'image/jpeg')
 * @returns {ValidationResult} Validation result with isValid flag and error details
 * 
 * @example
 * validateFileType('image/jpeg') // { isValid: true, error: null }
 * validateFileType('image/gif')  // { isValid: false, error: { code: 'INVALID_TYPE', message: '...' } }
 */
export function validateFileType(mimeType) {
  if (!mimeType || typeof mimeType !== 'string') {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.INVALID_TYPE,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]
      }
    };
  }

  const isValid = ACCEPTED_MIME_TYPES.includes(mimeType);

  if (!isValid) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.INVALID_TYPE,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]
      }
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validates if a file's size is within the allowed limit
 * 
 * The maximum allowed file size is 10MB (10 * 1024 * 1024 bytes).
 * 
 * @param {number} fileSize - The file size in bytes
 * @param {number} [maxSize=MAX_FILE_SIZE] - Maximum allowed file size in bytes (default: 10MB)
 * @returns {ValidationResult} Validation result with isValid flag and error details
 * 
 * @example
 * validateFileSize(5000000)    // { isValid: true, error: null }
 * validateFileSize(15000000)   // { isValid: false, error: { code: 'FILE_TOO_LARGE', message: '...' } }
 */
export function validateFileSize(fileSize, maxSize = MAX_FILE_SIZE) {
  if (typeof fileSize !== 'number' || fileSize < 0) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.FILE_TOO_LARGE,
        message: ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE]
      }
    };
  }

  const isValid = fileSize <= maxSize;

  if (!isValid) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.FILE_TOO_LARGE,
        message: ERROR_MESSAGES[ERROR_CODES.FILE_TOO_LARGE]
      }
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Performs comprehensive validation on a file
 * 
 * Validates both file type and file size. Returns the first validation error encountered.
 * 
 * @param {File} file - The File object to validate
 * @returns {ValidationResult} Validation result with isValid flag and error details
 * 
 * @example
 * const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
 * validateFile(file) // { isValid: true, error: null }
 * 
 * const invalidFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
 * validateFile(invalidFile) // { isValid: false, error: { code: 'INVALID_TYPE', message: '...' } }
 */
export function validateFile(file) {
  // Check if file is provided and is a valid File object
  if (!file || !(file instanceof File)) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.INVALID_TYPE,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]
      }
    };
  }

  // Validate file type first
  const typeValidation = validateFileType(file.type);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  // Additional validation: check file extension
  const fileName = file.name || '';
  const hasValidExtension = ACCEPTED_EXTENSIONS.some(ext => 
    fileName.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      isValid: false,
      error: {
        code: ERROR_CODES.INVALID_TYPE,
        message: ERROR_MESSAGES[ERROR_CODES.INVALID_TYPE]
      }
    };
  }

  // All validations passed
  return {
    isValid: true,
    error: null
  };
}
