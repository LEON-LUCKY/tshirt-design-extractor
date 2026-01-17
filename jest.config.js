/**
 * Jest Configuration for T-shirt Design Extractor
 * 
 * This configuration sets up Jest for testing Vue 2 components and JavaScript modules
 * with support for property-based testing using fast-check.
 */

module.exports = {
  // Use jsdom environment for browser-like testing
  testEnvironment: 'jsdom',

  // Transform files with appropriate transformers
  transform: {
    // Transform .vue files with vue2-jest
    '^.+\\.vue$': '@vue/vue2-jest',
    // Transform .js files with babel-jest
    '^.+\\.js$': 'babel-jest'
  },

  // Module file extensions
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],

  // Module name mapper for aliases
  moduleNameMapper: {
    // Map @ to src directory
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock static assets
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },

  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],

  // Test match patterns
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/tests/properties/**/*.property.spec.js',
    '**/tests/integration/**/*.spec.js'
  ],

  // Coverage collection
  collectCoverage: false, // Enable with --coverage flag
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!src/main.js',
    '!src/assets/**',
    '!**/node_modules/**',
    '!**/tests/**'
  ],

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Transform ignore patterns - don't transform node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(fast-check)/)'
  ],

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Test timeout (30 seconds for property-based tests)
  testTimeout: 30000,

  // Globals
  globals: {
    'vue-jest': {
      babelConfig: true
    }
  }
};
