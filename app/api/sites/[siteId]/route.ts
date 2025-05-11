import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSiteById, updateSite, deleteSite } from "@/lib/sites";
import { updateSiteSchema } from "@/types/sites";
import { ZodError } from "zod";

// Get a specific site
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
    
    // Get the site
    const site = await getSiteById(siteId, userId);
    
    return NextResponse.json({ site });
  } catch (error) {
    console.error("Error fetching site:", error);
    
    // If the error is a Supabase data error (404), return a proper 404 response
    if ((error as any)?.code === "PGRST116") {
      return NextResponse.json({ error: { message: "Site not found" } }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: { message: "Failed to fetch site", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
}

// Update a specific site
export async function PATCH(
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
      updateSiteSchema.parse({ ...body, id: siteId });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: { message: "Invalid request", details: error.format() } }, { status: 400 });
      }
      throw error;
    }
    
    // Update the site
    const site = await updateSite(siteId, body, userId);
    
    return NextResponse.json({ site });
  } catch (error) {
    console.error("Error updating site:", error);
    
    // If the error is a Supabase data error (404), return a proper 404 response
    if ((error as any)?.code === "PGRST116") {
      return NextResponse.json({ error: { message: "Site not found" } }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: { message: "Failed to update site", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
}

// Delete a specific site
export async function DELETE(
  req: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    
    const { siteId } = params;
    
    // Delete the site
    await deleteSite(siteId, userId);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting site:", error);
    
    // If the error is a Supabase data error (404), return a proper 404 response
    if ((error as any)?.code === "PGRST116") {
      return NextResponse.json({ error: { message: "Site not found" } }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: { message: "Failed to delete site", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
} 