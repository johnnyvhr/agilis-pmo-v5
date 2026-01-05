
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase URL not found in environment variables.');
    // Safe warning to developer
}

export const supabase = createClient(supabaseUrl, supabaseKey);
