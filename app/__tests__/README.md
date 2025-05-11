# API Tests

This directory contains tests for the API routes in the application.

## Setup

The tests use Jest as the test runner and mock the necessary dependencies, such as authentication, database access, and request/response objects.

### Directory Structure

- `__mocks__/`: Contains mock implementations of dependencies
  - `auth.ts`: Mocks for Clerk authentication
  - `supabase.ts`: Mocks for Supabase database client
  - `sites.ts`: Mocks for site-related functions
  - `@clerk/`: Mock for Clerk auth package
- `helpers.ts`: Helper functions for creating mock requests and responses
- `jest.setup.ts`: Jest setup file to configure the test environment

### Route Tests

The route tests are organized to match the directory structure of the API routes:

- `api/sites/route.test.ts`: Tests for the main sites collection API
- `api/sites/[siteId]/route.test.ts`: Tests for individual site operations
- `api/sites/[siteId]/verify/route.test.ts`: Tests for site verification
- `api/embed/[siteId].js/route.test.ts`: Tests for the embed script API

## Running Tests

To run all the API tests:

```bash
npm run test:api
```

To run a specific test file:

```bash
npm test -- --testPathPattern="app/__tests__/api/sites/route.test.ts"
```

## Adding New Tests

When adding new tests:

1. Create mock implementations for any new dependencies in `__mocks__/`
2. Use the `createRequest` helper to create mock requests
3. Use the `parseResponse` helper to extract data from responses
4. Add appropriate assertions to validate the behavior

## Mock Data

The tests use a preset collection of mock data defined in `__mocks__/supabase.ts`:

- `mockSites`: Sample site records
- `mockVerifications`: Sample verification records
- `mockResponseData`: Collection of all mock data for the tests

For tests that need to modify data, you can use `resetMockData()` in the `beforeEach` hook to reset the data between tests. 