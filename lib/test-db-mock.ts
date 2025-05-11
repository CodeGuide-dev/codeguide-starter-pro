/**
 * Mock database utilities for testing
 */

// In-memory mock database
const mockDb = {
  sites: [],
  notifications: [],
  campaigns: [],
  events: [],
  // Add other collections as needed
};

/**
 * Reset the mock database to its initial state
 */
export function resetMockDb(): void {
  mockDb.sites = [];
  mockDb.notifications = [];
  mockDb.campaigns = [];
  mockDb.events = [];
  // Reset other collections as needed
}

/**
 * Get the mock database
 */
export function getMockDb() {
  return mockDb;
} 