import { NextResponse } from "next/server";
import { setMockUserId, resetMockAuth } from "./__mocks__/auth";
import { resetMockData } from "./__mocks__/supabase";

// Interface for the minimum properties needed for a Request
interface MockRequest extends Request {
  method: string;
  url: string;
  headers: Headers;
  _bodyInit?: string;
  json(): Promise<any>;
  text(): Promise<string>;
}

// Mock Next.js request
export function createRequest(method: string, url: string, body?: any): Request {
  // Create body if provided
  const bodyStr = body ? JSON.stringify(body) : undefined;
  
  // Create a headers object
  const headers = new Headers({
    "Content-Type": "application/json"
  });
  
  // Create a full Request object
  return new Request(url, {
    method,
    headers,
    body: bodyStr
  });
}

// Create a Request object for testing webhooks
export function createWebhookRequest(method: string, url: string, body?: any, headers?: Record<string, string>): Request {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };
  
  if (body) {
    if (typeof body === 'string') {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
    }
  }
  
  return new Request(url, init);
}

// Helper to parse NextResponse
export async function parseResponse<T>(response: NextResponse): Promise<T> {
  // For NextResponse objects
  if (response && typeof response.text === 'function') {
    try {
      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        return text as unknown as T;
      }
    } catch (e) {
      // Fallback if text() fails
      return {} as T;
    }
  }
  
  // For direct object responses in tests
  return response as unknown as T;
}

// Reset all mocks between tests
export function resetAllMocks() {
  resetMockAuth();
  resetMockData();
  jest.clearAllMocks();
}

// Set user as unauthorized
export function setUnauthorized() {
  setMockUserId(null);
}

// Set user as authorized with custom ID
export function setAuthorized(userId: string = "test-user-id") {
  setMockUserId(userId);
}

// Helper to create params object for route handlers
export function createParams<T extends Record<string, string>>(params: T): { params: T } {
  return { params };
} 