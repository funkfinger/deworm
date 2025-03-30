// This file contains setup code for Vitest
// Import any global test setup here

// Mock global fetch if needed
// global.fetch = vi.fn();

// Add any test-specific global variables
// global.testVar = 'test';

import "@testing-library/jest-dom";

// Reset mocks between tests
beforeEach(() => {
  vi.resetAllMocks();
});
