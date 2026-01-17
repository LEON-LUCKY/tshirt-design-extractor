/**
 * Example Property-Based Test
 * 
 * This is a simple example demonstrating how to write property-based tests
 * using fast-check. This test can be deleted once real property tests are implemented.
 */

import fc from 'fast-check';

describe('Example Property-Based Tests', () => {
  // Example: Addition is commutative
  it('should demonstrate that addition is commutative', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          expect(a + b).toBe(b + a);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Example: String concatenation length
  it('should demonstrate that concatenated string length equals sum of lengths', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (str1, str2) => {
          const concatenated = str1 + str2;
          expect(concatenated.length).toBe(str1.length + str2.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Example: Array reverse is involutive (reversing twice gives original)
  it('should demonstrate that reversing an array twice gives the original array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const reversed = [...arr].reverse();
          const doubleReversed = [...reversed].reverse();
          expect(doubleReversed).toEqual(arr);
        }
      ),
      { numRuns: 100 }
    );
  });
});
