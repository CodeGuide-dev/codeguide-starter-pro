// Mock for Supabase client
import { SiteStatus } from "@/types/sites";

// Default site data for tests
export const mockSites = [
  {
    id: "site-1",
    name: "Test Site 1",
    domain: "test1.example.com",
    user_id: "test-user-id",
    status: SiteStatus.PENDING_VERIFICATION,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "site-2",
    name: "Test Site 2",
    domain: "test2.example.com",
    user_id: "test-user-id",
    status: SiteStatus.VERIFIED,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Default verification data for tests
export const mockVerifications = [
  {
    id: "verification-1",
    site_id: "site-1",
    method: "DNS_TXT",
    status: "PENDING",
    verification_data: { token: "verify-token-1" },
    created_at: new Date().toISOString(),
    user_id: "test-user-id",
  },
];

// Mock response data
export let mockResponseData = {
  sites: [...mockSites],
  verifications: [...mockVerifications],
};

// Reset mock data to default values
export const resetMockData = () => {
  mockResponseData = {
    sites: [...mockSites],
    verifications: [...mockVerifications],
  };
};

// Helper to find a site by ID
const findSiteById = (id: string) => mockResponseData.sites.find(site => site.id === id);

// Mock function types for Supabase
type MockFn = jest.Mock<any, any>;

// Define the Supabase methods
const selectMethod = (): MockFn => jest.fn().mockImplementation(() => ({
  eq: jest.fn().mockImplementation((field: string, value: string) => ({
    single: jest.fn().mockImplementation(() => {
      if (field === "id") {
        const site = findSiteById(value);
        if (!site) {
          return { data: null, error: { code: "PGRST116", message: "Site not found" } };
        }
        return { data: site, error: null };
      }
      return { data: null, error: { message: "Not found" } };
    }),
    match: jest.fn().mockImplementation((filters: Record<string, any>) => {
      // Filter sites by given criteria
      const filteredSites = mockResponseData.sites.filter(site => {
        for (const [key, val] of Object.entries(filters)) {
          if (site[key as keyof typeof site] !== val) return false;
        }
        return true;
      });
      return { data: filteredSites, error: null };
    }),
  })),
  order: jest.fn().mockReturnThis(),
  match: jest.fn().mockImplementation((filters: Record<string, any>) => {
    // Filter sites by given criteria
    const filteredSites = mockResponseData.sites.filter(site => {
      for (const [key, val] of Object.entries(filters)) {
        if (site[key as keyof typeof site] !== val) return false;
      }
      return true;
    });
    return { data: filteredSites, error: null };
  }),
}));

const insertMethod = (): MockFn => jest.fn().mockImplementation((data: any) => {
  const newSite = Array.isArray(data) ? data[0] : data;
  const site = {
    ...newSite,
    id: newSite.id || `site-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockResponseData.sites.push(site);
  return { data: site, error: null };
});

const updateMethod = (): MockFn => jest.fn().mockImplementation((data: any) => ({
  eq: jest.fn().mockImplementation((field: string, value: string) => {
    if (field === "id") {
      const siteIndex = mockResponseData.sites.findIndex(s => s.id === value);
      if (siteIndex === -1) {
        return { data: null, error: { code: "PGRST116", message: "Site not found" } };
      }
      mockResponseData.sites[siteIndex] = {
        ...mockResponseData.sites[siteIndex],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { data: mockResponseData.sites[siteIndex], error: null };
    }
    return { data: null, error: { message: "Not found" } };
  }),
}));

const deleteMethod = (): MockFn => jest.fn().mockImplementation(() => ({
  eq: jest.fn().mockImplementation((field: string, value: string) => {
    if (field === "id") {
      const siteIndex = mockResponseData.sites.findIndex(s => s.id === value);
      if (siteIndex === -1) {
        return { data: null, error: { code: "PGRST116", message: "Site not found" } };
      }
      const deletedSite = mockResponseData.sites[siteIndex];
      mockResponseData.sites.splice(siteIndex, 1);
      return { data: deletedSite, error: null };
    }
    return { data: null, error: { message: "Not found" } };
  }),
}));

const selectVerificationsMethod = (): MockFn => jest.fn().mockImplementation(() => ({
  eq: jest.fn().mockImplementation((field: string, value: string) => ({
    order: jest.fn().mockReturnThis(),
    match: jest.fn().mockImplementation((filters: Record<string, any>) => {
      const filteredVerifications = mockResponseData.verifications.filter(v => {
        for (const [key, val] of Object.entries(filters)) {
          if (v[key as keyof typeof v] !== val) return false;
        }
        return v[field as keyof typeof v] === value;
      });
      return { data: filteredVerifications, error: null };
    }),
  })),
}));

const insertVerificationMethod = (): MockFn => jest.fn().mockImplementation((data: any) => {
  const newVerification = Array.isArray(data) ? data[0] : data;
  const verification = {
    ...newVerification,
    id: newVerification.id || `verification-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  mockResponseData.verifications.push(verification);
  return { data: verification, error: null };
});

// Create mock Supabase client with proper method structure
export const mockSupabaseClient = {
  from: jest.fn().mockImplementation((table) => {
    if (table === "sites") {
      return {
        select: selectMethod(),
        insert: insertMethod(),
        update: updateMethod(),
        delete: deleteMethod(),
      };
    } 
    else if (table === "site_verifications") {
      return {
        select: selectVerificationsMethod(),
        insert: insertVerificationMethod(),
      };
    }
    else {
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
      };
    }
  }),
};

export const createClerkSupabaseClientSsr = jest.fn().mockImplementation(() => {
  return Promise.resolve(mockSupabaseClient);
}); 