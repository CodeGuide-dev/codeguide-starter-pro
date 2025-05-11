import { NextResponse } from "next/server";
import { GET, PATCH, DELETE } from "@/app/api/sites/[siteId]/route";
import { createRequest, parseResponse, resetAllMocks, setAuthorized, setUnauthorized, createParams, createWebhookRequest } from "../../../helpers";
import { getSiteById, updateSite, deleteSite } from "@/lib/sites";
import { ZodError } from "zod";

// Mock dependencies
jest.mock("@clerk/nextjs/server", () => require("../../../__mocks__/@clerk/nextjs/server"));
jest.mock("@/utils/supabase/server", () => ({
  createClerkSupabaseClientSsr: require("../../../__mocks__/supabase").createClerkSupabaseClientSsr,
}));
jest.mock("@/lib/sites", () => require("../../../__mocks__/sites"));

// Mock validation schema
jest.mock("@/types/sites", () => {
  const actual = jest.requireActual("@/types/sites");
  return {
    ...actual,
    updateSiteSchema: {
      parse: jest.fn().mockImplementation((data) => {
        if (data.domain && data.domain.includes(" ")) {
          const error = new Error("Validation error");
          error.name = "ZodError";
          // Add format method to simulate ZodError
          (error as any).format = () => ({
            _errors: [],
            domain: { _errors: ["Domain cannot contain spaces"] }
          });
          
          // For ZodError instance checks (instanceof)
          Object.setPrototypeOf(error, ZodError.prototype);
          
          throw error;
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

interface SiteResponse {
  site: any;
}

interface SuccessResponse {
  success: boolean;
}

describe("Site API Routes", () => {
  
  beforeEach(() => {
    resetAllMocks();
  });
  
  const existingSiteId = "site-1";
  const nonExistentSiteId = "nonexistent-site";
  
  describe("GET /api/sites/[siteId]", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Setup
      setUnauthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Unauthorized" } });
    });
    
    it("should return site if it exists", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const data = await parseResponse<SiteResponse>(response);
      expect(data).toHaveProperty("site");
      expect(data.site.id).toBe(existingSiteId);
    });
    
    it("should handle nonexistent site with 404 status", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${nonExistentSiteId}`);
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Mock getSiteById to throw a specific error for nonexistent site
      (getSiteById as jest.Mock).mockRejectedValueOnce({ 
        code: "PGRST116", 
        message: "Site not found" 
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Site not found");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
    
    it("should handle generic server errors", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("GET", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Mock getSiteById to throw a generic error
      (getSiteById as jest.Mock).mockRejectedValueOnce(new Error("Database connection error"));
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await GET(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to fetch site");
      expect(data.error).toHaveProperty("details", "Database connection error");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe("PATCH /api/sites/[siteId]", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Setup
      setUnauthorized();
      const req = createRequest("PATCH", `https://example.com/api/sites/${existingSiteId}`, {
        name: "Updated Site Name"
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Unauthorized" } });
    });
    
    it("should update a site if request is valid", async () => {
      // Setup
      setAuthorized();
      const updatedName = "Updated Site Name";
      const req = createWebhookRequest("PATCH", `https://example.com/api/sites/${existingSiteId}`, {
        name: updatedName
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const data = await parseResponse<SiteResponse>(response);
      expect(data).toHaveProperty("site");
      expect(data.site.name).toBe(updatedName);
      
      // Verify updateSite was called with correct parameters
      expect(updateSite).toHaveBeenCalledWith(
        existingSiteId,
        { name: updatedName },
        expect.any(String)
      );
    });
    
    it("should return 400 if request body is invalid", async () => {
      // Setup
      setAuthorized();
      // Invalid domain format
      const req = createWebhookRequest("PATCH", `https://example.com/api/sites/${existingSiteId}`, {
        domain: "invalid domain with spaces"
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Invalid request");
      expect(data.error).toHaveProperty("details");
    });
    
    it("should handle non-ZodError validation errors", async () => {
      // Setup
      setAuthorized();
      const req = createWebhookRequest("PATCH", `https://example.com/api/sites/${existingSiteId}`, {
        name: "Updated Name"
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Mock updateSiteSchema.parse to throw a non-ZodError
      const updateSiteSchema = require("@/types/sites").updateSiteSchema;
      jest.spyOn(updateSiteSchema, "parse").mockImplementationOnce(() => {
        throw new Error("Non-ZodError validation error");
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to update site");
      expect(data.error).toHaveProperty("details", "Non-ZodError validation error");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
    
    it("should handle nonexistent site with 404 status", async () => {
      // Setup
      setAuthorized();
      const req = createWebhookRequest("PATCH", `https://example.com/api/sites/${nonExistentSiteId}`, {
        name: "Updated Nonexistent Site"
      });
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Mock updateSite to throw a specific error for nonexistent site
      (updateSite as jest.Mock).mockRejectedValueOnce({ 
        code: "PGRST116", 
        message: "Site not found" 
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Site not found");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
    
    it("should handle generic server errors during update", async () => {
      // Setup
      setAuthorized();
      const req = createWebhookRequest("PATCH", `https://example.com/api/sites/${existingSiteId}`, {
        name: "Updated Site Name"
      });
      const params = createParams({ siteId: existingSiteId });
      
      // Mock updateSite to throw a generic error
      (updateSite as jest.Mock).mockRejectedValueOnce(new Error("Database connection error"));
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await PATCH(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to update site");
      expect(data.error).toHaveProperty("details", "Database connection error");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe("DELETE /api/sites/[siteId]", () => {
    
    it("should return 401 if user is not authenticated", async () => {
      // Setup
      setUnauthorized();
      const req = createRequest("DELETE", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await DELETE(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data).toEqual({ error: { message: "Unauthorized" } });
    });
    
    it("should successfully delete an existing site", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("DELETE", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Execute
      const response = await DELETE(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      
      const data = await parseResponse<SuccessResponse>(response);
      expect(data).toEqual({ success: true });
      
      // Verify deleteSite was called with correct parameters
      expect(deleteSite).toHaveBeenCalledWith(existingSiteId, expect.any(String));
    });
    
    it("should handle nonexistent site with 404 status", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("DELETE", `https://example.com/api/sites/${nonExistentSiteId}`);
      const params = createParams({ siteId: nonExistentSiteId });
      
      // Mock deleteSite to throw a specific error for nonexistent site
      (deleteSite as jest.Mock).mockRejectedValueOnce({ 
        code: "PGRST116", 
        message: "Site not found" 
      });
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await DELETE(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(404);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Site not found");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
    
    it("should handle generic server errors during deletion", async () => {
      // Setup
      setAuthorized();
      const req = createRequest("DELETE", `https://example.com/api/sites/${existingSiteId}`);
      const params = createParams({ siteId: existingSiteId });
      
      // Mock deleteSite to throw a generic error
      (deleteSite as jest.Mock).mockRejectedValueOnce(new Error("Database connection error"));
      
      // Spy on console.error
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      // Execute
      const response = await DELETE(req, params);
      
      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(500);
      
      const data = await parseResponse<ErrorResponse>(response);
      expect(data.error).toHaveProperty("message", "Failed to delete site");
      expect(data.error).toHaveProperty("details", "Database connection error");
      
      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 