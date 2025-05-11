import { jest } from '@jest/globals';

// Mock Supabase admin functions
export const upsertProductRecord = jest.fn().mockImplementation(() => Promise.resolve({ success: true }));
export const upsertPriceRecord = jest.fn().mockImplementation(() => Promise.resolve({ success: true }));
export const deleteProductRecord = jest.fn().mockImplementation(() => Promise.resolve({ success: true }));
export const deletePriceRecord = jest.fn().mockImplementation(() => Promise.resolve({ success: true }));
export const manageSubscriptionStatusChange = jest.fn().mockImplementation(() => Promise.resolve({ success: true })); 