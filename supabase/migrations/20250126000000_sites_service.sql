-- Create the sites table for storing verified merchant websites
CREATE TABLE IF NOT EXISTS "public"."sites" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "owner_id" TEXT NOT NULL, -- Clerk user ID
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'pending_verification', -- pending_verification, verified, suspended
    "verification_token" TEXT,
    "embed_code" TEXT,
    "settings" JSONB DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on any changes
CREATE TRIGGER trigger_sites_updated_at
BEFORE UPDATE ON sites
FOR EACH ROW
EXECUTE FUNCTION update_sites_updated_at();

-- Create site verification table to track verification attempts
CREATE TABLE IF NOT EXISTS "public"."site_verifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "site_id" UUID NOT NULL REFERENCES "public"."sites"("id") ON DELETE CASCADE,
    "method" TEXT NOT NULL, -- dns_txt, dns_cname, file_upload, meta_tag
    "status" TEXT NOT NULL DEFAULT 'pending', -- pending, verified, failed
    "verification_data" JSONB,
    "verified_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "public"."site_verifications" ENABLE ROW LEVEL SECURITY;

-- Create trigger for site_verifications updated_at
CREATE TRIGGER trigger_site_verifications_updated_at
BEFORE UPDATE ON site_verifications
FOR EACH ROW
EXECUTE FUNCTION update_sites_updated_at();

-- Create index on owner_id for faster queries
CREATE INDEX idx_sites_owner_id ON sites(owner_id);

-- Create index on domain for faster lookups
CREATE INDEX idx_sites_domain ON sites(domain);

-- Create RLS policies for the sites table

-- Owner can do everything with their own sites
CREATE POLICY "Users can manage their own sites"
ON "public"."sites"
FOR ALL
TO authenticated
USING (owner_id = requesting_user_id())
WITH CHECK (owner_id = requesting_user_id());

-- Site verifications can only be managed by site owners
CREATE POLICY "Users can manage their own site verifications"
ON "public"."site_verifications"
FOR ALL
TO authenticated
USING (
    site_id IN (
        SELECT id FROM sites WHERE owner_id = requesting_user_id()
    )
)
WITH CHECK (
    site_id IN (
        SELECT id FROM sites WHERE owner_id = requesting_user_id()
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_verifications TO authenticated; 