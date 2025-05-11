import { z } from 'zod';
import { Json } from './database.types';

// Site status enum
export enum SiteStatus {
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
  
}

// Verification method enum
export enum VerificationMethod {
  DNS_TXT = 'dns_txt',
  DNS_CNAME = 'dns_cname',
  FILE_UPLOAD = 'file_upload',
  META_TAG = 'meta_tag',
}

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

// Site schema for validation
export const createSiteSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100, 'Site name must be less than 100 characters'),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .max(253, 'Domain must be less than 253 characters')
    .regex(
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
      'Invalid domain format. Example: example.com'
    ),
});

export const updateSiteSchema = createSiteSchema.partial().extend({
  id: z.string().uuid('Invalid site ID'),
});

// Site verification schema for validation
export const createVerificationSchema = z.object({
  site_id: z.string().uuid('Invalid site ID'),
  method: z.nativeEnum(VerificationMethod),
  verification_data: z.any().optional(),
});

// Site data interfaces
export interface Site {
  id: string;
  owner_id: string;
  name: string;
  domain: string;
  status: SiteStatus;
  verification_token: string | null;
  embed_code: string | null;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface SiteVerification {
  id: string;
  site_id: string;
  method: VerificationMethod;
  status: VerificationStatus;
  verification_data: Json | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// API request/response types
export type CreateSiteRequest = z.infer<typeof createSiteSchema>;
export type UpdateSiteRequest = z.infer<typeof updateSiteSchema>;
export type CreateVerificationRequest = z.infer<typeof createVerificationSchema>;

export interface SiteResponse {
  site: Site;
}

export interface SitesResponse {
  sites: Site[];
}

export interface VerificationResponse {
  verification: SiteVerification;
}

export interface VerificationsResponse {
  verifications: SiteVerification[];
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
} 