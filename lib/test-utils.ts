import { NextRequest } from 'next/server';

/**
 * Utility to check if the request is in test mode
 * @param req The Next.js request object
 * @returns Object with isTest flag and test userId if available
 */
export function checkTestMode(req: Request | NextRequest) {
  const headers = req.headers;
  
  // More reliable test mode detection including environment vars
  const isTestMode = 
    headers.get('X-Test-Auth') === 'true' || 
    process.env.TEST_MODE === 'true' || 
    process.env.NODE_ENV === 'test';
    
  const testUserId = headers.get('x-middleware-test-user-id') || 'test_user_123';
  
  console.log('Test mode detection:', { 
    isTestMode, 
    testUserId,
    envTestMode: process.env.TEST_MODE,
    nodeEnv: process.env.NODE_ENV,
    testHeader: headers.get('X-Test-Auth')
  });
  
  return {
    isTestMode,
    testUserId: isTestMode ? testUserId : null
  };
} 