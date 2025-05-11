/**
 * Script to generate a Clerk authentication token for testing
 */
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Generates a Clerk authentication token using the Clerk API
 */
async function generateClerkToken() {
  const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;

  if (!CLERK_API_KEY) {
    throw new Error('CLERK_SECRET_KEY is required to generate a test token');
  }

  try {
    console.log('🔑 Generating Clerk session token for testing...');
    
    // First, get users to find a valid user ID
    const usersResponse = await fetch('https://api.clerk.dev/v1/users', {
      headers: {
        'Authorization': `Bearer ${CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to get users: ${usersResponse.statusText}`);
    }
    
    const users = await usersResponse.json();
    
    if (!users.data || users.data.length === 0) {
      throw new Error('No users found in your Clerk application. Please create at least one user.');
    }
    
    // Use the first active user
    const user = users.data[0];
    console.log(`Using user: ${user.email_addresses[0].email_address} (${user.id})`);
    
    // Create a session for this user
    const sessionResponse = await fetch('https://api.clerk.dev/v1/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user.id,
      }),
    });
    
    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: ${sessionResponse.statusText}`);
    }
    
    const session = await sessionResponse.json();
    
    // Create a session token
    const tokenResponse = await fetch(`https://api.clerk.dev/v1/sessions/${session.id}/tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to create token: ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const sessionToken = tokenData.jwt;
    
    // Save to .env.test file
    await fs.writeFile(
      path.join(process.cwd(), '.env.test'),
      `# Test environment variables - generated ${new Date().toISOString()}\n` +
      `TEST_AUTH_TOKEN=${sessionToken}\n`
    );
    
    console.log('✅ Session token generated successfully!');
    console.log('Token saved to .env.test file');
    
    return sessionToken;
  } catch (error) {
    console.error('ERROR: Failed to generate token', error);
    throw error;
  }
}

// Execute the token generation
async function main() {
  try {
    console.log('Generating Clerk authentication token for testing...');
    await generateClerkToken();
    console.log('Token generation completed successfully!');
  } catch (error) {
    console.error('Failed to generate token:', error);
    process.exit(1);
  }
}

// Run the token generation
main().catch(console.error); 