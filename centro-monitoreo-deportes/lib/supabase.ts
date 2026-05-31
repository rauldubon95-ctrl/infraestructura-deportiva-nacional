import { createClient } from '@supabase/supabase-js';

// Las credenciales deben estar en variables de entorno, NUNCA hardcodeadas.
// Crear .env.local con:
//   NEXT_PUBLIC_SUPABASE_URL=https://iaolmlfrzjaafmklkoju.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu clave anon del Dashboard>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Crea un archivo .env.local con estas variables.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
