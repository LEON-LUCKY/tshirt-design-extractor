/**
 * Constants for T-shirt Design Extractor
 * 
 * This file contains all constant values used throughout the application
 * including validation rules, error types, and configuration values.
 */

// ============================================================================
// File Validation Constants
// ============================================================================

/**
 * Maximum allowed file size in bytes (10MB)
 * Can be overridden by VUE_APP_MAX_FILE_SIZE environment variable
 */
export const MAX_FILE_SIZE = process.env.VUE_APP_MAX_FILE_SIZE 
  ? parseInt(process.env.VUE_APP_MAX_FILE_SIZE, 10) 
  : 10 * 1024 * 1024; // 10MB

/**
 * Accepted image MIME types
 */
export const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

/**
 * Accepted file extensions
 */
export const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp'
];

// ============================================================================
// Error Type Constants
// ============================================================================

/**
 * Error types for different failure scenarios
 */
export const ERROR_TYPES = {
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

/**
 * Error codes for specific validation failures
 */
export const ERROR_CODES = {
  INVALID_TYPE: 'INVALID_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_CORRUPTED: 'FILE_CORRUPTED',
  CANVAS_ERROR: 'CANVAS_ERROR',
  IMAGE_LOAD_ERROR: 'IMAGE_LOAD_ERROR',
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_QUOTA_EXCEEDED: 'API_QUOTA_EXCEEDED',
  API_SERVICE_UNAVAILABLE: 'API_SERVICE_UNAVAILABLE',
  API_BAD_REQUEST: 'API_BAD_REQUEST',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE'
};

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_TYPE]: '文件类型不支持，请上传 JPG、PNG 或 WebP 格式的图片',
  [ERROR_CODES.FILE_TOO_LARGE]: '文件太大，请上传小于 10MB 的图片',
  [ERROR_CODES.FILE_CORRUPTED]: '文件已损坏，请尝试其他图片',
  [ERROR_CODES.CANVAS_ERROR]: '图片处理失败，请重试',
  [ERROR_CODES.IMAGE_LOAD_ERROR]: '图片加载失败，请重试或尝试其他图片',
  [ERROR_CODES.API_KEY_INVALID]: 'API密钥无效，请联系管理员',
  [ERROR_CODES.API_QUOTA_EXCEEDED]: 'API配额已用完，请联系管理员',
  [ERROR_CODES.API_SERVICE_UNAVAILABLE]: '服务暂时不可用，请稍后重试',
  [ERROR_CODES.API_BAD_REQUEST]: '无法识别图片中的T恤图案，请尝试更清晰的照片',
  [ERROR_CODES.NETWORK_TIMEOUT]: '网络请求超时，请检查网络后重试',
  [ERROR_CODES.NETWORK_OFFLINE]: '网络连接失败，请检查网络后重试'
};

// ============================================================================
// Processing State Constants
// ============================================================================

/**
 * Processing status values
 */
export const PROCESSING_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  COMPRESSING: 'compressing',
  REMOVING_BACKGROUND: 'removing-background',
  RENDERING: 'rendering',
  COMPLETE: 'complete',
  ERROR: 'error'
};

// ============================================================================
// Image Processing Constants
// ============================================================================

/**
 * Maximum image width for compression (in pixels)
 * Images wider than this will be compressed before API upload
 * Can be overridden by VUE_APP_COMPRESSION_THRESHOLD environment variable
 */
export const MAX_IMAGE_WIDTH = process.env.VUE_APP_COMPRESSION_THRESHOLD
  ? parseInt(process.env.VUE_APP_COMPRESSION_THRESHOLD, 10)
  : 2000;

/**
 * Maximum image height for compression (in pixels)
 */
export const MAX_IMAGE_HEIGHT = process.env.VUE_APP_COMPRESSION_THRESHOLD
  ? parseInt(process.env.VUE_APP_COMPRESSION_THRESHOLD, 10)
  : 2000;

/**
 * Maximum compressed width (in pixels)
 * Can be overridden by VUE_APP_MAX_COMPRESSED_WIDTH environment variable
 */
export const MAX_COMPRESSED_WIDTH = process.env.VUE_APP_MAX_COMPRESSED_WIDTH
  ? parseInt(process.env.VUE_APP_MAX_COMPRESSED_WIDTH, 10)
  : 1500;

/**
 * Output image format for extracted designs
 */
export const OUTPUT_FORMAT = 'image/png';

/**
 * JPEG quality for compression (0-1)
 */
export const JPEG_QUALITY = 0.9;

/**
 * PNG quality for compression (0-1)
 */
export const PNG_QUALITY = 0.95;

// ============================================================================
// API Configuration Constants
// ============================================================================

/**
 * API retry configuration
 */
export const API_RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  BACKOFF_MULTIPLIER: 2 // Exponential backoff: 1s, 2s, 4s
};

/**
 * API timeout in milliseconds
 * Can be overridden by VUE_APP_API_TIMEOUT environment variable
 */
export const API_TIMEOUT = process.env.VUE_APP_API_TIMEOUT
  ? parseInt(process.env.VUE_APP_API_TIMEOUT, 10)
  : 30000; // 30 seconds

/**
 * Remove.bg API endpoint
 * Can be overridden by VUE_APP_REMOVE_BG_API_ENDPOINT environment variable
 */
export const REMOVE_BG_API_ENDPOINT = process.env.VUE_APP_REMOVE_BG_API_ENDPOINT
  || 'https://api.remove.bg/v1.0/removebg';

/**
 * Remove.bg API key
 * Must be set via VUE_APP_REMOVE_BG_API_KEY environment variable
 */
export const REMOVE_BG_API_KEY = process.env.VUE_APP_REMOVE_BG_API_KEY || '';

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Mobile breakpoint in pixels
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Loading animation duration in milliseconds
 */
export const LOADING_ANIMATION_DURATION = 300;

/**
 * Success message display duration in milliseconds
 * Can be overridden by VUE_APP_SUCCESS_MESSAGE_DURATION environment variable
 */
export const SUCCESS_MESSAGE_DURATION = process.env.VUE_APP_SUCCESS_MESSAGE_DURATION
  ? parseInt(process.env.VUE_APP_SUCCESS_MESSAGE_DURATION, 10)
  : 3000;

/**
 * Error message display duration in milliseconds
 */
export const ERROR_MESSAGE_DURATION = 5000;

/**
 * Debug mode flag
 * Can be enabled via VUE_APP_DEBUG environment variable
 */
export const DEBUG_MODE = process.env.VUE_APP_DEBUG === 'true';

// ============================================================================
// Pattern Extraction Constants
// ============================================================================

/**
 * Enable pattern extraction (crop to pattern bounds)
 * If true, only the pattern will be extracted (not the whole t-shirt)
 * If false, the whole t-shirt will be kept (background removed)
 */
export const ENABLE_PATTERN_EXTRACTION = process.env.VUE_APP_ENABLE_PATTERN_EXTRACTION !== 'false';

/**
 * Pattern extraction padding in pixels
 * Adds padding around the detected pattern bounds
 */
export const PATTERN_PADDING = process.env.VUE_APP_PATTERN_PADDING
  ? parseInt(process.env.VUE_APP_PATTERN_PADDING, 10)
  : 20;

// ============================================================================
// Download Constants
// ============================================================================

/**
 * Default filename prefix for downloaded images
 */
export const DOWNLOAD_FILENAME_PREFIX = 'extracted-design';

/**
 * Download file extension
 */
export const DOWNLOAD_FILE_EXTENSION = '.png';

// ============================================================================
// Cache Constants
// ============================================================================

/**
 * Maximum number of cached results
 */
export const MAX_CACHE_SIZE = 10;

/**
 * Cache expiration time in milliseconds (1 hour)
 */
export const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// ============================================================================
// Validation Rules Object
// ============================================================================

/**
 * Consolidated validation rules
 */
export const VALIDATION_RULES = {
  maxFileSize: MAX_FILE_SIZE,
  acceptedMimeTypes: ACCEPTED_MIME_TYPES,
  acceptedExtensions: ACCEPTED_EXTENSIONS
};

// ============================================================================
// HTTP Status Codes
// ============================================================================

/**
 * HTTP status codes for API error handling
 */
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// ============================================================================
// Aspect Ratio Tolerance
// ============================================================================

/**
 * Tolerance for aspect ratio comparison (floating point precision)
 */
export const ASPECT_RATIO_TOLERANCE = 0.01;
