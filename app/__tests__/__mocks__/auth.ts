// Mock for Clerk auth
let mockUserId: string | null = "test-user-id";

export const setMockUserId = (userId: string | null) => {
  mockUserId = userId;
};

export const mockAuth = {
  auth: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      userId: mockUserId,
    });
  }),
};

// Reset mockUserId to default value
export const resetMockAuth = () => {
  mockUserId = "test-user-id";
}; 