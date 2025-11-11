import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `
=== SUPABASE CONNECTION ERROR ===
Missing Supabase environment variables.

The hardcoded Supabase URL in your .env file does not exist or has been deleted.

To fix this issue:
1. Go to https://supabase.com and log in
2. Select your project (or create a new one)
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key
5. Update the .env file with:
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
6. Restart your development server

Current values:
  URL: ${supabaseUrl || '(not set)'}
  Key: ${supabaseAnonKey ? '(set)' : '(not set)'}
=================================
  `;

  console.error(errorMessage);
  throw new Error('Missing Supabase environment variables. Please update your .env file with valid credentials.');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
