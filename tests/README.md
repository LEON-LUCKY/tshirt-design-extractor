# T-shirt Design Extractor - Testing Guide

This directory contains all tests for the T-shirt Design Extractor application.

## Test Structure

```
tests/
├── unit/               # Unit tests for components, services, and utilities
├── properties/         # Property-based tests using fast-check
├── integration/        # Integration tests for full workflows
├── __mocks__/         # Mock files for static assets
├── setup.js           # Jest setup and global mocks
└── README.md          # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run unit tests only
```bash
npm run test:unit
```

### Run property-based tests only
```bash
npm run test:properties
```

### Run integration tests only
```bash
npm run test:integration
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests in watch mode
```bash
npm run test:watch
```

## Test Configuration

The Jest configuration is defined in `jest.config.js` at the project root. Key settings:

- **Test Environment**: jsdom (browser-like environment)
- **Transformers**: 
  - `@vue/vue2-jest` for `.vue` files
  - `babel-jest` for `.js` files
- **Module Aliases**: `@/` maps to `src/`
- **Coverage Threshold**: 80% for all metrics

## Writing Tests

### Unit Tests

Unit tests should be placed in `tests/unit/` and follow the naming convention `*.spec.js`.

Example:
```javascript
import { myFunction } from '@/utils/myModule';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Property-Based Tests

Property-based tests should be placed in `tests/properties/` and follow the naming convention `*.property.spec.js`.

All property tests must:
- Run at least 100 iterations
- Include a comment linking to the design document property
- Use the format: `// Feature: tshirt-design-extractor, Property N: [property text]`

Example:
```javascript
import fc from 'fast-check';
import { validateFileSize } from '@/utils/validation';

describe('File Validation Properties', () => {
  // Feature: tshirt-design-extractor, Property 2: 文件大小限制
  it('should reject files larger than 10MB', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 * 1024 * 1024 }),
        (fileSize) => {
          const result = validateFileSize(fileSize, 10 * 1024 * 1024);
          
          if (fileSize > 10 * 1024 * 1024) {
            expect(result.isValid).toBe(false);
          } else {
            expect(result.isValid).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Component Tests

Component tests use `@vue/test-utils` for mounting and testing Vue components.

Example:
```javascript
import { mount } from '@vue/test-utils';
import MyComponent from '@/components/MyComponent.vue';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.find('.my-class').exists()).toBe(true);
  });
});
```

## Mocking

### Browser APIs

The `tests/setup.js` file provides mocks for common browser APIs:
- Canvas API
- Image constructor
- FileReader
- Blob and File
- URL.createObjectURL

### Static Assets

Static assets (CSS, images) are mocked using files in `tests/__mocks__/`:
- `styleMock.js` - Mocks CSS imports
- `fileMock.js` - Mocks image/file imports

### API Calls

API calls should be mocked in individual test files using Jest's mock functions:

```javascript
import axios from 'axios';
jest.mock('axios');

axios.post.mockResolvedValue({ data: { success: true } });
```

## Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

Coverage thresholds are set to 80% for:
- Branches
- Functions
- Lines
- Statements

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and assertion phases
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Mocking**: Mock external dependencies to keep tests fast and reliable
5. **Property Tests**: Use property-based testing for universal properties and edge cases
6. **Coverage**: Aim for high coverage but focus on meaningful tests, not just coverage numbers

## Troubleshooting

### Tests fail with "Cannot find module"
- Check that the module path is correct
- Verify the module alias in `jest.config.js`
- Ensure the file exists in the expected location

### Canvas-related errors
- The Canvas API is mocked in `tests/setup.js`
- If you need custom Canvas behavior, update the mock in setup.js

### Async test timeouts
- The default timeout is 30 seconds (for property-based tests)
- Increase timeout for specific tests: `jest.setTimeout(60000)`

### Property test failures
- Property tests may find edge cases you didn't consider
- Review the failing input and adjust your code or test accordingly
- Ensure generators produce valid inputs for your function

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vue Test Utils Documentation](https://v1.test-utils.vuejs.org/)
- [fast-check Documentation](https://fast-check.dev/)
