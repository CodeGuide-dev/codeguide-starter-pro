import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createVerificationAttempt, verifyDnsTxt, getSiteVerifications } from "@/lib/sites";
import { createVerificationSchema, VerificationMethod } from "@/types/sites";
import { ZodError } from "zod";

// Get verification attempts for a site
export async function GET(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    
    const { siteId } = params;
    
    // Get verification attempts
    const verifications = await getSiteVerifications(siteId, userId);
    
    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Error fetching verification history:", error);
    
    // If the error is a Supabase data error (404), return a proper 404 response
    if ((error as any)?.code === "PGRST116") {
      return NextResponse.json({ error: { message: "Site not found" } }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: { message: "Failed to fetch verification history", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
}

// Create a verification attempt
export async function POST(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    
    const { siteId } = params;
    const body = await req.json();
    
    // Validate request body
    try {
      createVerificationSchema.parse({ ...body, site_id: siteId });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: { message: "Invalid request", details: error.format() } }, { status: 400 });
      }
      throw error;
    }
    
    const { method, verification_data } = body;
    
    // Create verification attempt
    const verification = await createVerificationAttempt(siteId, method as VerificationMethod, userId, verification_data);
    
    // If it's a DNS TXT method, perform immediate verification
    if (method === VerificationMethod.DNS_TXT) {
      const result = await verifyDnsTxt(siteId, userId);
      return NextResponse.json({ verification, result });
    }
    
    return NextResponse.json({ verification }, { status: 201 });
  } catch (error) {
    console.error("Error creating verification attempt:", error);
    
    // If the error is a Supabase data error (404), return a proper 404 response
    if ((error as any)?.code === "PGRST116") {
      return NextResponse.json({ error: { message: "Site not found" } }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: { message: "Failed to create verification attempt", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
} 