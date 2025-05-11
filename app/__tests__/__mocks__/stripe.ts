import { jest } from '@jest/globals';

// Mock Stripe instance
export const stripe = {
  webhooks: {
    constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
      if (!signature || !secret || signature === 'invalid-signature') {
        throw new Error('Invalid signature');
      }
      
      // Return a mock event based on the payload
      return JSON.parse(payload as string);
    })
  }
};

// Mock module exports
export default jest.fn().mockImplementation(() => stripe); 