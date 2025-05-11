import { mockResponseData } from "./supabase";
import { SiteStatus, VerificationMethod, VerificationStatus } from "@/types/sites";

// Mock site-related functions
export const createSite = jest.fn().mockImplementation((name, domain, userId) => {
  const site = {
    id: `site-${Date.now()}`,
    name,
    domain,
    user_id: userId,
    status: SiteStatus.PENDING_VERIFICATION,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockResponseData.sites.push(site);
  return Promise.resolve(site);
});

export const getUserSites = jest.fn().mockImplementation((userId) => {
  const sites = mockResponseData.sites.filter(site => site.user_id === userId);
  return Promise.resolve(sites);
});

export const getSiteById = jest.fn().mockImplementation((siteId, userId) => {
  const site = mockResponseData.sites.find(site => site.id === siteId && site.user_id === userId);
  if (!site) {
    const error: any = new Error("Site not found");
    error.code = "PGRST116";
    return Promise.reject(error);
  }
  return Promise.resolve(site);
});

export const updateSite = jest.fn().mockImplementation((siteId, data, userId) => {
  const siteIndex = mockResponseData.sites.findIndex(site => site.id === siteId && site.user_id === userId);
  if (siteIndex === -1) {
    const error: any = new Error("Site not found");
    error.code = "PGRST116";
    return Promise.reject(error);
  }
  
  mockResponseData.sites[siteIndex] = {
    ...mockResponseData.sites[siteIndex],
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  return Promise.resolve(mockResponseData.sites[siteIndex]);
});

export const deleteSite = jest.fn().mockImplementation((siteId, userId) => {
  const siteIndex = mockResponseData.sites.findIndex(site => site.id === siteId && site.user_id === userId);
  if (siteIndex === -1) {
    const error: any = new Error("Site not found");
    error.code = "PGRST116";
    return Promise.reject(error);
  }
  
  mockResponseData.sites.splice(siteIndex, 1);
  
  return Promise.resolve();
});

export const createVerificationAttempt = jest.fn().mockImplementation(
  (siteId, method, userId, verificationData) => {
    const site = mockResponseData.sites.find(site => site.id === siteId && site.user_id === userId);
    if (!site) {
      const error: any = new Error("Site not found");
      error.code = "PGRST116";
      return Promise.reject(error);
    }
    
    const verification = {
      id: `verification-${Date.now()}`,
      site_id: siteId,
      method,
      status: VerificationStatus.PENDING,
      verification_data: verificationData || {},
      created_at: new Date().toISOString(),
      user_id: userId,
    };
    
    mockResponseData.verifications.push(verification);
    
    return Promise.resolve(verification);
  }
);

export const getSiteVerifications = jest.fn().mockImplementation((siteId, userId) => {
  const verifications = mockResponseData.verifications.filter(
    v => v.site_id === siteId && v.user_id === userId
  );
  
  return Promise.resolve(verifications);
});

export const verifyDnsTxt = jest.fn().mockImplementation((siteId, userId) => {
  const site = mockResponseData.sites.find(site => site.id === siteId && site.user_id === userId);
  if (!site) {
    const error: any = new Error("Site not found");
    error.code = "PGRST116";
    return Promise.reject(error);
  }
  
  // Simulate successful verification
  const siteIndex = mockResponseData.sites.findIndex(s => s.id === siteId);
  mockResponseData.sites[siteIndex] = {
    ...mockResponseData.sites[siteIndex],
    status: SiteStatus.VERIFIED,
    updated_at: new Date().toISOString(),
  };
  
  // Update latest verification to VERIFIED
  const verificationIndex = mockResponseData.verifications.findIndex(
    v => v.site_id === siteId && v.method === VerificationMethod.DNS_TXT
  );
  
  if (verificationIndex !== -1) {
    mockResponseData.verifications[verificationIndex] = {
      ...mockResponseData.verifications[verificationIndex],
      status: VerificationStatus.VERIFIED,
    };
  }
  
  return Promise.resolve({
    success: true,
    message: "Site verified successfully",
  });
}); 