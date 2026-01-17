/**
 * Jest Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

// Mock Canvas API for Node.js environment
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function() {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn()
      })),
      createPattern: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1
      })),
      putImageData: jest.fn(),
      canvas: {
        width: 300,
        height: 150
      }
    };
  };

  HTMLCanvasElement.prototype.toBlob = function(callback, type, quality) {
    setTimeout(() => {
      callback(new Blob(['mock-canvas-blob'], { type: type || 'image/png' }));
    }, 0);
  };

  HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  };
}

// Mock Image constructor
if (typeof Image === 'undefined') {
  global.Image = class {
    constructor() {
      this.src = '';
      this.width = 0;
      this.height = 0;
      this.onload = null;
      this.onerror = null;
    }

    set src(value) {
      this._src = value;
      // Simulate async image loading
      setTimeout(() => {
        this.width = 100;
        this.height = 100;
        if (this.onload) {
          this.onload();
        }
      }, 0);
    }

    get src() {
      return this._src;
    }
  };
}

// Mock FileReader
if (typeof FileReader === 'undefined') {
  global.FileReader = class {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onerror = null;
    }

    readAsDataURL(blob) {
      setTimeout(() => {
        this.result = 'data:image/png;base64,mock-data';
        if (this.onload) {
          this.onload({ target: this });
        }
      }, 0);
    }

    readAsArrayBuffer(blob) {
      setTimeout(() => {
        this.result = new ArrayBuffer(8);
        if (this.onload) {
          this.onload({ target: this });
        }
      }, 0);
    }
  };
}

// Mock Blob
if (typeof Blob === 'undefined') {
  global.Blob = class {
    constructor(parts, options) {
      this.parts = parts || [];
      this.type = (options && options.type) || '';
      this.size = this.parts.reduce((acc, part) => {
        if (typeof part === 'string') {
          return acc + part.length;
        }
        return acc + (part.byteLength || part.length || 0);
      }, 0);
    }
  };
}

// Mock File
if (typeof File === 'undefined') {
  global.File = class extends global.Blob {
    constructor(parts, filename, options) {
      super(parts, options);
      this.name = filename;
      this.lastModified = Date.now();
    }
  };
}

// Mock URL.createObjectURL and revokeObjectURL
if (typeof URL !== 'undefined') {
  if (!URL.createObjectURL) {
    URL.createObjectURL = jest.fn((blob) => {
      return `blob:mock-url-${Math.random().toString(36).substr(2, 9)}`;
    });
  }
  
  if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = jest.fn();
  }
}

// Suppress console errors in tests (optional)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();

// Set up global test utilities
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
