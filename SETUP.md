# T-shirt Design Extractor - Project Setup Documentation

## Overview

This document describes the project setup completed for the T-shirt Design Extractor application, including dependencies, configuration, and testing infrastructure.

## Completed Setup (Task 1)

### 1. Dependencies Installed

#### Production Dependencies
- **axios** (^1.13.2) - HTTP client for API requests

#### Development Dependencies
- **jest** (^30.2.0) - Testing framework
- **@vue/test-utils** (^1.3.6) - Vue 2 component testing utilities
- **@vue/vue2-jest** (^29.2.6) - Jest transformer for Vue 2 components
- **babel-jest** (^30.2.0) - Jest transformer for JavaScript files
- **fast-check** (^4.5.3) - Property-based testing library
- **jest-environment-jsdom** (^30.2.0) - Browser-like test environment

### 2. Configuration Files Created

#### jest.config.js
Complete Jest configuration with:
- jsdom test environment for browser API simulation
- Vue 2 and JavaScript transformers
- Module path aliases (@/ → src/)
- Coverage collection settings (80% threshold)
- Test file patterns for unit, property, and integration tests
- 30-second timeout for property-based tests

#### babel.config.js
Already exists in the project for Vue CLI.

### 3. Constants Definition

#### src/constants.js
Comprehensive constants file including:

**File Validation**
- `MAX_FILE_SIZE` - 10MB limit
- `ACCEPTED_MIME_TYPES` - JPEG, PNG, WebP
- `ACCEPTED_EXTENSIONS` - File extensions

**Error Handling**
- `ERROR_TYPES` - Upload, Processing, API, Network errors
- `ERROR_CODES` - Specific error codes for each failure type
- `ERROR_MESSAGES` - User-friendly Chinese error messages

**Processing States**
- `PROCESSING_STATUS` - Idle, Uploading, Compressing, etc.

**Image Processing**
- `MAX_IMAGE_WIDTH/HEIGHT` - 2000px compression threshold
- `OUTPUT_FORMAT` - PNG with transparency
- `JPEG_QUALITY`, `PNG_QUALITY` - Compression quality settings

**API Configuration**
- `API_RETRY_CONFIG` - Retry attempts and exponential backoff
- `API_TIMEOUT` - 30-second timeout
- `REMOVE_BG_API_ENDPOINT` - Remove.bg API URL

**UI Constants**
- `MOBILE_BREAKPOINT` - 768px responsive breakpoint
- Animation and message durations

**Download Settings**
- `DOWNLOAD_FILENAME_PREFIX` - Default filename prefix
- `DOWNLOAD_FILE_EXTENSION` - .png extension

**Cache Settings**
- `MAX_CACHE_SIZE` - 10 cached results
- `CACHE_EXPIRATION_TIME` - 1 hour

**Validation & Utilities**
- `VALIDATION_RULES` - Consolidated validation rules
- `HTTP_STATUS` - HTTP status code constants
- `ASPECT_RATIO_TOLERANCE` - 0.01 for floating-point comparison

### 4. Test Infrastructure

#### Test Directory Structure
```
tests/
├── unit/                    # Unit tests
│   ├── constants.spec.js   # Constants validation test
│   └── .gitkeep
├── properties/              # Property-based tests
│   ├── example.property.spec.js  # Example PBT
│   └── .gitkeep
├── integration/             # Integration tests
│   └── .gitkeep
├── __mocks__/              # Mock files
│   ├── styleMock.js        # CSS import mock
│   └── fileMock.js         # Image import mock
├── setup.js                # Jest setup and global mocks
└── README.md               # Testing guide
```

#### tests/setup.js
Comprehensive test setup with mocks for:
- Canvas API (getContext, toBlob, toDataURL)
- Image constructor with async loading simulation
- FileReader (readAsDataURL, readAsArrayBuffer)
- Blob and File constructors
- URL.createObjectURL and revokeObjectURL
- window.matchMedia for responsive design tests
- Global test utilities (flushPromises)

#### Test Scripts (package.json)
```json
{
  "test": "jest",
  "test:unit": "jest tests/unit",
  "test:properties": "jest tests/properties",
  "test:integration": "jest tests/integration",
  "test:coverage": "jest --coverage",
  "test:watch": "jest --watch"
}
```

### 5. Documentation

#### tests/README.md
Comprehensive testing guide covering:
- Test structure and organization
- Running different types of tests
- Writing unit tests, property-based tests, and component tests
- Mocking strategies
- Coverage requirements
- Best practices
- Troubleshooting guide

#### SETUP.md (this file)
Project setup documentation.

## Verification

All setup has been verified with passing tests:

### Constants Test
```bash
npm test -- tests/unit/constants.spec.js
```
✅ 16 tests passed - All constants properly defined and exported

### Property-Based Test Example
```bash
npm run test:properties
```
✅ 3 example property tests passed - fast-check working correctly

## Next Steps

The project is now ready for implementation of the remaining tasks:

1. **Task 2**: Implement file validation utility functions
2. **Task 3**: Implement Canvas utility service
3. **Task 4**: Implement background removal API service
4. **Task 5**: Implement image processor service
5. And so on...

## Environment Variables

For API integration (Task 16), you'll need to create a `.env` file:

```env
# Remove.bg API Key
VUE_APP_REMOVE_BG_API_KEY=your_api_key_here

# Optional: API endpoint override
VUE_APP_REMOVE_BG_API_ENDPOINT=https://api.remove.bg/v1.0/removebg
```

Create a `.env.example` file as a template:
```env
# Remove.bg API Key (get from https://remove.bg/api)
VUE_APP_REMOVE_BG_API_KEY=

# Optional: API endpoint override
VUE_APP_REMOVE_BG_API_ENDPOINT=https://api.remove.bg/v1.0/removebg
```

## Development Workflow

### Running the Development Server
```bash
npm run serve
```

### Running Tests During Development
```bash
npm run test:watch
```

### Checking Code Coverage
```bash
npm run test:coverage
```

### Linting Code
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Project Structure

```
my-project/
├── .kiro/
│   └── specs/
│       └── tshirt-design-extractor/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── node_modules/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   ├── App.vue
│   ├── main.js
│   └── constants.js          # ✅ Created in Task 1
├── tests/                     # ✅ Created in Task 1
│   ├── unit/
│   ├── properties/
│   ├── integration/
│   ├── __mocks__/
│   ├── setup.js
│   └── README.md
├── .gitignore
├── babel.config.js
├── jest.config.js             # ✅ Created in Task 1
├── jsconfig.json
├── package.json               # ✅ Updated in Task 1
├── package-lock.json
├── README.md
├── SETUP.md                   # ✅ Created in Task 1
└── vue.config.js
```

## Troubleshooting

### Peer Dependency Warnings
If you encounter peer dependency conflicts during installation, use:
```bash
npm install --legacy-peer-deps
```

### Jest Environment Issues
If tests fail with "jest-environment-jsdom cannot be found", ensure it's installed:
```bash
npm install --save-dev jest-environment-jsdom --legacy-peer-deps
```

### Module Resolution Issues
If imports fail, check:
1. The path alias in `jest.config.js` (`@/` → `<rootDir>/src/`)
2. The path alias in `jsconfig.json` (for IDE support)
3. The actual file location

## Resources

- [Vue.js 2 Documentation](https://v2.vuejs.org/)
- [Jest Documentation](https://jestjs.io/)
- [Vue Test Utils v1](https://v1.test-utils.vuejs.org/)
- [fast-check Documentation](https://fast-check.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Remove.bg API Documentation](https://www.remove.bg/api)

## Support

For questions or issues:
1. Check the specification documents in `.kiro/specs/tshirt-design-extractor/`
2. Review the testing guide in `tests/README.md`
3. Consult the design document for architecture details
4. Check the tasks document for implementation order

---

**Task 1 Status**: ✅ Complete

All dependencies installed, constants defined, Jest configured, and test infrastructure set up.
