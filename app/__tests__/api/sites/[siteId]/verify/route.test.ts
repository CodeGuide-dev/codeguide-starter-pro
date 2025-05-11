import { NextResponse } from "next/server";
import { GET, POST } from "@/app/api/sites/[siteId]/verify/route";
import { createWebhookRequest, createRequest, parseResponse, resetAllMocks, setAuthorized, setUnauthorized, createParams } from "../../../../helpers";
import { mockResponseData } from "../../../../__mocks__/supabase";
import { VerificationMethod } from "@/types/sites";
import { verifyDnsTxt, getSiteVerifications, createVerificationAttempt } from "@/lib/sites";
import { ZodError } from "zod";

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => require("../../../../__mocks__/@clerk/nextjs/server"));
jest.mock("@/utils/supabase/server", () => ({
  createClerkSupabaseClientSsr: require("../../../../__mocks__/supabase").createClerkSupabaseClientSsr,
}));
jest.mock("@/lib/sites", () => require("../../../../__mocks__/sites"));

// Mock createVerificationSchema
jest.mock("@/types/sites", () => {
  const actual = jest.requireActual("@/types/sites");
  return {
    ...actual,
    createVerificationSchema: {
      parse: jest.fn().mockImplementation((data) => {
        // Validate required fields
        if (!data.method) {
          throw new ZodError([{
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["method"],
            message: "Method is required"
          }]);
        }
        if (!data.verification_data) {
          throw new ZodError([{
            code: "invalid_type",
            expected: "object",
            received: "undefined",
            path: ["verification_data"],
            message: "Verification data is required"
          }]);
        }
        return data;
      })
    }
  };
});

// Define response types for type safety
interface ErrorResponse {
  error: {
    message: string;
    details?: any;
  };
}

interface VerificationsResponse {
  verifications: Array<any>;
}

interface VerificationResponse {
  verification: any;
  result?: {
    success: boolean;
    message: string;
  };
}

describe("Site Verification API Routes", () => {
  
  beforeEach(() => {
    resetAllMocks();
  });
  
  const existingSiteId = "site-1";
  const nonExistentSiteId = "nonexistent-site";
  
  describe("GET /api/sites/[siteId]/verify", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Setup
      setUnauthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}/verify`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Unauthorized" } });
    });
    
    it("should return verifications for a site", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}/verify`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const data = await parseResponse<VerificationsResponse>(response);
      expect(data).toHaveProperty("verifications");
      expect(Array.isArray(data.verifications)).toBe(true);
      
      // We expect to get verifications for this site
      const siteVerifications = mockResponseData.verifications.filter(v => v.site_id === existingSiteId);
      expect(data.verifications.length).toBe(siteVerifications.length);
    });
    
    it("should handle nonexistent site", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${nonExistentSiteId}/verify`);
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Mock getSiteVerifications to throw a specific error for nonexistent site
      (getSiteVerifications as jest.Mock).mockRejectedValueOnce({ 
        code: "PGRST116", 
        message: "Site not found" 
      });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Site not found" } });
    });
    
    it("should handle generic errors", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}/verify`);
      const params = createParams({ siteId: existingSiteId });
      
      // Mock getSiteVerifications to throw a generic error
      (getSiteVerifications as jest.Mock).mockRejectedValueOnce(new Error("Database connection error"));
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to fetch verification history");
      expect(data.error).toHaveProperty("details", "Database connection error");
    });
  });
  
  describe("POST /api/sites/[siteId]/verify", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Setup
      setUnauthorized();
      const req = createRequest("POST", `https://example.com/api/sites/${existingSiteId}/verify`, {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Unauthorized" } });
    });
    
    it("should handle verification with DNS_TXT method", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${existingSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      // Verify that both the verification was created and the DNS check was performed
      expect(createVerificationAttempt).toHaveBeenCalledWith(
        existingSiteId, 
        VerificationMethod.DNS_TXT, 
        expect.any(String), 
        verificationData.verification_data
      );
      expect(verifyDnsTxt).toHaveBeenCalledWith(existingSiteId, expect.any(String));
      
      const data = await parseResponse<VerificationResponse>(response);
      expect(data).toHaveProperty("verification");
      expect(data).toHaveProperty("result");
      expect(data.result).toHaveProperty("success", true);
    });
    
    it("should handle verification with another method", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.FILE_UPLOAD,
        verification_data: { filename: "verification.txt" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${existingSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(201);
      
      // Verify that only the verification was created (no DNS check for FILE_UPLOAD)
      expect(createVerificationAttempt).toHaveBeenCalledWith(
        existingSiteId, 
        VerificationMethod.FILE_UPLOAD, 
        expect.any(String), 
        verificationData.verification_data
      );
      expect(verifyDnsTxt).not.toHaveBeenCalled();
      
      const data = await parseResponse<VerificationResponse>(response);
      expect(data).toHaveProperty("verification");
      expect(data).not.toHaveProperty("result");
    });
    
    it("should handle invalid verification data", async () => {
      // Setup
      setAuthorized();
      // Missing required field 'verification_data'
      const req = createRequest("POST", `https://example.com/api/sites/${existingSiteId}/verify`, {
        method: VerificationMethod.DNS_TXT
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Invalid request");
      expect(data.error).toHaveProperty("details");
    });
    
    it("should handle missing method field", async () => {
      // Setup
      setAuthorized();
      // Missing required field 'method'
      const req = createRequest("POST", `https://example.com/api/sites/${existingSiteId}/verify`, {
        verification_data: { token: "test-token" }
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Invalid request");
      expect(data.error).toHaveProperty("details");
    });
    
    it("should handle nonexistent site", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${nonExistentSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Mock createVerificationAttempt to throw a specific error for nonexistent site
      (createVerificationAttempt as jest.Mock).mockRejectedValueOnce({ 
        code: "PGRST116", 
        message: "Site not found" 
      });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Site not found" } });
    });
    
    it("should handle DNS verification failure", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${existingSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: existingSiteId });
      
      // Mock successful creation but failed verification
      (verifyDnsTxt as jest.Mock).mockResolvedValueOnce({
        success: false,
        message: "DNS record not found"
      });
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const data = await parseResponse<VerificationResponse>(response);
      expect(data).toHaveProperty("verification");
      expect(data).toHaveProperty("result");
      expect(data.result).toHaveProperty("success", false);
      expect(data.result).toHaveProperty("message", "DNS record not found");
    });
    
    it("should handle generic errors during verification", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${existingSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: existingSiteId });
      
      // Mock createVerificationAttempt to throw a generic error
      (createVerificationAttempt as jest.Mock).mockRejectedValueOnce(new Error("Database connection error"));
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to create verification attempt");
      expect(data.error).toHaveProperty("details", "Database connection error");
    });
    
    it("should handle validation errors that are not ZodError", async () => {
      // Setup
      setAuthorized();
      const verificationData = {
        method: VerificationMethod.DNS_TXT,
        verification_data: { token: "test-token" }
      };
      
      // Create a request that will pass validation
      const req = createWebhookRequest(
        "POST", 
        `https://example.com/api/sites/${existingSiteId}/verify`, 
        verificationData
      );
      
      const params = createParams({ siteId: existingSiteId });
      
      // Mock createVerificationSchema.parse to throw an error that is not ZodError
      const createVerificationSchema = require("@/types/sites").createVerificationSchema;
      jest.spyOn(createVerificationSchema, "parse").mockImplementationOnce(() => {
        const error = new Error("Non-ZodError validation error");
        // Make sure it's not a ZodError
        error.name = "ValidationError";
        throw error;
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await POST(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500); // Should be 500 for non-ZodError
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to create verification attempt");
      expect(data.error).toHaveProperty("details", "Non-ZodError validation error");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 