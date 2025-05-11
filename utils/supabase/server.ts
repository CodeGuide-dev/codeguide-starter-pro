import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// For tests, ensure we have fallback values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-supabase-url.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'test-supabase-key-for-testing';

export async function createClerkSupabaseClientSsr() {
    // Get the Supabase token in test mode or from Clerk in production
    let supabaseToken;
    
    if (process.env.TEST_MODE === 'true') {
        // For tests, use a mock token
        supabaseToken = 'test-token';
    } else {
        // For production, get from Clerk
        const { getToken } = await auth();
        supabaseToken = await getToken({
            template: 'supabase',
        });
    }

    return createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            global: {
                // Get the custom Supabase token from Clerk
                fetch: async (url, options = {}) => {
                    // Insert the Clerk Supabase token into the headers
                    const headers = new Headers(options?.headers);
                    headers.set('Authorization', `Bearer ${supabaseToken}`);

                    // Now call the default fetch
                    return fetch(url, {
                        ...options,
                        headers,
                    });
                },
            },
        },
    );
}