import { createClerkSupabaseClientSsr } from "@/utils/supabase/server";
import { randomBytes } from "crypto";
import { SiteStatus, VerificationMethod, VerificationStatus, Site } from "@/types/sites";
import dns from "dns";
import { promisify } from "util";

// DNS resolver for verification
const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

// Generate a random verification token
export const generateVerificationToken = (): string => {
  return randomBytes(32).toString("hex");
};

// Generate the embed code for a site
export const generateEmbedCode = (siteId: string): string => {
  return `
<script>
  (function(s,o,c,i,a,l){s[o]=s[o]||function(){(s[o].q=s[o].q||[]).push(arguments)};
  a=document.createElement('script');a.type='text/javascript';a.async=true;a.src=c;
  l=document.getElementsByTagName('script')[0];l.parentNode.insertBefore(a,l);
  })(window,'SocialProof','https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'}/api/embed/${siteId}.js','${siteId}');
  SocialProof('init', { siteId: '${siteId}' });
</script>
`;
};

// Create a new site
export const createSite = async (name: string, domain: string, userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  // Remove protocol and www. if present
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").toLowerCase();
  
  // Generate verification token
  const verificationToken = generateVerificationToken();
  
  const { data, error } = await supabase
    .from("sites")
    .insert({
      name,
      domain: cleanDomain,
      owner_id: userId,
      status: SiteStatus.PENDING_VERIFICATION,
      verification_token: verificationToken,
      settings: {}
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating site:", error);
    throw error;
  }
  
  return data;
};

// Get all sites for a user
export const getUserSites = async (userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching user sites:", error);
    throw error;
  }
  
  return data;
};

// Get a single site by ID
export const getSiteById = async (siteId: string, userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("owner_id", userId)
    .single();
  
  if (error) {
    console.error("Error fetching site:", error);
    throw error;
  }
  
  return data;
};

// Update a site
export const updateSite = async (
  siteId: string, 
  updates: Partial<Pick<Site, 'name' | 'domain' | 'settings'>>, 
  userId: string
) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  // If domain is being updated, clean it and reset verification status
  if (updates.domain) {
    const cleanDomain = updates.domain.replace(/^(https?:\/\/)?(www\.)?/, "").toLowerCase();
    
    const updatedFields: Partial<Site> = {
      ...updates,
      domain: cleanDomain,
      status: SiteStatus.PENDING_VERIFICATION,
      verification_token: generateVerificationToken()
    };
    
    const { data, error } = await supabase
      .from("sites")
      .update(updatedFields)
      .eq("id", siteId)
      .eq("owner_id", userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating site:", error);
      throw error;
    }
    
    return data;
  } else {
    // Regular update without domain change
    const { data, error } = await supabase
      .from("sites")
      .update(updates)
      .eq("id", siteId)
      .eq("owner_id", userId)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating site:", error);
      throw error;
    }
    
    return data;
  }
};

// Delete a site
export const deleteSite = async (siteId: string, userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId)
    .eq("owner_id", userId);
  
  if (error) {
    console.error("Error deleting site:", error);
    throw error;
  }
  
  return true;
};

// Create a verification attempt
export const createVerificationAttempt = async (siteId: string, method: VerificationMethod, userId: string, verificationData?: any) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  // First verify the site belongs to the user
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("owner_id", userId)
    .single();
  
  if (siteError) {
    console.error("Error fetching site for verification:", siteError);
    throw siteError;
  }
  
  // Create verification record
  const { data, error } = await supabase
    .from("site_verifications")
    .insert({
      site_id: siteId,
      method,
      status: VerificationStatus.PENDING,
      verification_data: verificationData || null
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating verification attempt:", error);
    throw error;
  }
  
  return data;
};

// Verify a site using DNS TXT record
export const verifyDnsTxt = async (siteId: string, userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  // Get the site
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("owner_id", userId)
    .single();
  
  if (siteError) {
    console.error("Error fetching site for verification:", siteError);
    throw siteError;
  }
  
  try {
    // Check DNS TXT record
    const records = await resolveTxt(site.domain);
    const verificationFound = records.flat().some(record => record.includes(site.verification_token));
    
    if (verificationFound) {
      // Update site verification status
      const { data, error } = await supabase
        .from("sites")
        .update({
          status: SiteStatus.VERIFIED,
          embed_code: generateEmbedCode(site.id)
        })
        .eq("id", siteId)
        .eq("owner_id", userId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating site verification:", error);
        throw error;
      }
      
      // Update verification record
      await supabase
        .from("site_verifications")
        .update({
          status: VerificationStatus.VERIFIED,
          verified_at: new Date().toISOString()
        })
        .eq("site_id", siteId)
        .eq("method", VerificationMethod.DNS_TXT)
        .eq("status", VerificationStatus.PENDING);
      
      return { verified: true, site: data };
    } else {
      return { verified: false, message: "Verification token not found in DNS TXT records" };
    }
  } catch (error) {
    console.error("DNS verification error:", error);
    
    // Update verification record as failed
    await supabase
      .from("site_verifications")
      .update({
        status: VerificationStatus.FAILED,
        verification_data: { error: (error as Error).message }
      })
      .eq("site_id", siteId)
      .eq("method", VerificationMethod.DNS_TXT)
      .eq("status", VerificationStatus.PENDING);
    
    return { verified: false, message: "Could not verify domain - DNS error" };
  }
};

// Get verification attempts for a site
export const getSiteVerifications = async (siteId: string, userId: string) => {
  const supabase = await createClerkSupabaseClientSsr();
  
  // First verify the site belongs to the user
  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("owner_id", userId)
    .single();
  
  if (siteError) {
    console.error("Error fetching site for verification history:", siteError);
    throw siteError;
  }
  
  const { data, error } = await supabase
    .from("site_verifications")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching verification history:", error);
    throw error;
  }
  
  return data;
}; 