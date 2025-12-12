
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('Supabase URL not found in environment variables.');
    // Safe warning to developer
}

export const supabase = createClient(supabaseUrl, supabaseKey);
