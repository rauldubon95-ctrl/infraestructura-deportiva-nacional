import { createClient } from '@supabase/supabase-js';

// TU URL
const supabaseUrl = 'https://iaolmlfrzjaafmklkoju.supabase.co';

// TU LLAVE REAL (La recuperé de tu mensaje anterior)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb2xtbGZyemphYWZta2xrb2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQyNzcsImV4cCI6MjA4NTk3MDI3N30.BgU9q4VasKJ27ppWlNjufhm-NfF5qx9j98jJwssdFAY';

export const supabase = createClient(supabaseUrl, supabaseKey);