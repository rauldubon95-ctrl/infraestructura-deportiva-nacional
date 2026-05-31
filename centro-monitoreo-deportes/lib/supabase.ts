import { createClient } from '@supabase/supabase-js';

// Las credenciales deben estar en variables de entorno, NUNCA hardcodeadas.
// Crear .env.local con:
//   NEXT_PUBLIC_SUPABASE_URL=https://iaolmlfrzjaafmklkoju.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu clave anon del Dashboard>
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  // Advertencia en lugar de throw para no romper SSG/build en tiempo de construcción.
  // Las peticiones reales fallarán en tiempo de ejecución si las vars no están configuradas.
  console.warn(
    '[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Configura estas variables en .env.local o en el panel de Vercel.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
);
