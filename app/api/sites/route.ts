import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSite, getUserSites } from "@/lib/sites";
import { createSiteSchema } from "@/types/sites";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate request body
    try {
      createSiteSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: { message: "Invalid request", details: error.format() } }, { status: 400 });
      }
      throw error;
    }
    
    const { name, domain } = body;
    
    // Create the site
    const site = await createSite(name, domain, userId);
    
    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: { message: "Failed to create site", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
    }
    
    // Get all sites for the user
    const sites = await getUserSites(userId);
    
    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: { message: "Failed to fetch sites", details: (error as Error).message } }, 
      { status: 500 }
    );
  }
} 