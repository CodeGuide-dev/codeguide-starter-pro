import { NextResponse } from "next/server";
import { GET } from "@/app/api/embed/[siteId].js/route";
import { createRequest, parseResponse, resetAllMocks, createParams } from "../../../helpers";
import { mockResponseData } from "../../../__mocks__/supabase";

// Mock dependencies
jest.mock("@/utils/supabase/server", () => ({
  createClerkSupabaseClientSsr: require("../../../__mocks__/supabase").createClerkSupabaseClientSsr,
}));

describe("Embed Script API Route", () => {
  
  beforeEach(() => {
    resetAllMocks();
    
    // Save original environment variable
    process.env.NEXT_PUBLIC_VERCEL_URL = "test.social-proof.app";
  });
  
  const verifiedSiteId = "site-2"; // This site has status: VERIFIED in mock data
  const pendingSiteId = "site-1"; // This site has status: PENDING_VERIFICATION in mock data
  const nonExistentSiteId = "nonexistent-site";
  
  describe("GET /api/embed/[siteId].js", () => {
    
    it("should return embed script for verified site", async () => {
      // Setup
      const req = createRequest("GET", `https://example.com/api/embed/${verifiedSiteId}.js`);
      const params = createParams({ siteId: verifiedSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      // Check content type and cache headers
      expect(response.headers.get("Content-Type")).toBe("application/javascript");
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
      expect(response.headers.get("Cross-Origin-Resource-Policy")).toBe("cross-origin");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      
      // Check content contains expected script parts
      const script = await parseResponse<string>(response);
      expect(script).toContain(`var config = {`);
      expect(script).toContain(`siteId: "${verifiedSiteId}"`);
      expect(script).toContain(`apiEndpoint: "${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}/api"`);
      
      // Check it has core functionality
      expect(script).toContain("window.SocialProof");
      expect(script).toContain("fetchNotifications");
      expect(script).toContain("showNotification");
      expect(script).toContain("sendEvent");
    });
    
    it("should return error script for unverified site", async () => {
      // Setup
      const req = createRequest("GET", `https://example.com/api/embed/${pendingSiteId}.js`);
      const params = createParams({ siteId: pendingSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      // Check content type and cache headers
      expect(response.headers.get("Content-Type")).toBe("application/javascript");
      expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
      
      // Check content is error script
      const script = await parseResponse<string>(response);
      expect(script).toBe("console.error('Social Proof: Site not verified');");
    });
    
    it("should return 404 for nonexistent site", async () => {
      // Setup
      const req = createRequest("GET", `https://example.com/api/embed/${nonExistentSiteId}.js`);
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      // Check content type
      expect(response.headers.get("Content-Type")).toBe("application/javascript");
      
      // Check content is error script
      const script = await parseResponse<string>(response);
      expect(script).toBe("console.error('Social Proof: Invalid site ID');");
    });
    
    it("should handle server errors", async () => {
      // Setup
      const req = createRequest("GET", `https://example.com/api/embed/${verifiedSiteId}.js`);
      const params = createParams({ siteId: verifiedSiteId });
      
      // Force an error by making supabase client throw
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      const mockCreateClient = require("../../../__mocks__/supabase").createClerkSupabaseClientSsr;
      mockCreateClient.mockRejectedValueOnce(new Error("Database connection error"));
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      // Check content type
      expect(response.headers.get("Content-Type")).toBe("application/javascript");
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
      
      // Check content is error script
      const script = await parseResponse<string>(response);
      expect(script).toBe("console.error('Social Proof: Server error');");
    });
    
    it("should handle database error when fetching site", async () => {
      // Setup
      const req = createRequest("GET", `https://example.com/api/embed/${verifiedSiteId}.js`);
      const params = createParams({ siteId: verifiedSiteId });
      
      // Mock the supabase client to return an error
      const mockSupabase = require("../../../__mocks__/supabase");
      const originalFrom = mockSupabase.mockSupabaseClient.from;
      mockSupabase.mockSupabaseClient.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              error: { message: "Database error" },
              data: null
            })
          })
        })
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await GET(req, params);
      
      // Restore original implementation
      mockSupabase.mockSupabaseClient.from = originalFrom;
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      // Check content type
      expect(response.headers.get("Content-Type")).toBe("application/javascript");
      
      // Check content is error script
      const script = await parseResponse<string>(response);
      expect(script).toBe("console.error('Social Proof: Invalid site ID');");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 