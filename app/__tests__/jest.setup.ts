// Mock the environment for tests
Object.defineProperty(global, 'process', {
  value: {
    ...process,
    env: {
      ...process.env,
      // Add default environment variables for tests
      NEXT_PUBLIC_VERCEL_URL: 'test.social-proof.app',
    },
  },
});

// Mock global.fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  })
);

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress specific error messages in tests
  if (args[0] && typeof args[0] === 'string' && (
    args[0].includes('Site not found') || 
    args[0].includes('Error fetching site') ||
    args[0].includes('Error deleting site')
  )) {
    return;
  }
  originalConsoleError(...args);
}; 