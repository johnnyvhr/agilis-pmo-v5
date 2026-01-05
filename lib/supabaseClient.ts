
import { createClient } from '@supabase/supabase-js';

// Access environment variables with robust fallback and checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        'CRITICAL ERROR: Supabase environment variables are missing. ' +
        'Please check your .env file locally or Deployment Environment Variables on Vercel. ' +
        'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
    // We throw to fail fast and visibly rather than crashing deep in Supabase code
    throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
