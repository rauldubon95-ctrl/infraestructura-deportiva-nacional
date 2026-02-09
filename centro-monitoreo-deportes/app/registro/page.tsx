'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Nota los dos puntos ../../
import { CENSOS_2024 } from '../../lib/censos';
import { Save, MapPin, ArrowLeft, Loader2, Globe } from 'lucide-react';

// Importamos solo lo necesario para el mapa visual
import { Academia } from '../../components/Map'; 

// Cargamos el mapa sin SSR
const MapWithNoSSR = dynamic(() => import('../../components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-64 bg-slate-900 flex items-center justify-center text-white">Cargando Mapa...</div>
});

const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Patinaje', 'Béisbol', 'Softbol', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público', 'Pista', 'Piscinas', 'Cancha de Baloncesto'];
const USOS = ['Recreativo', 'Entrenamiento', 'Alto Rendimiento', 'Competencia Local', 'Escolar', 'Comunitario', 'Privado'];

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Coordenadas del punto seleccionado
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Formulario completo
  const [form, setForm] = useState({
    nombre: '', deporte: 'Fútbol', infraestructura: 'Cancha Natural', usos: 'Recreativo',
    hombres: 0, mujeres: 0, responsable: '', objetivos: '', 
    dept: '', muni: '', dist: ''
  });

  // Verificamos sesión al entrar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if(!session) {
            alert("Debes iniciar sesión para registrar.");
            router.push('/');
        }
    });
  }, []);

  // Función para capturar el click en el mapa
  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  // Función auxiliar de GPS (opcional, por si el usuario quiere usarlo)
  const getGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) { alert("Tu dispositivo no tiene GPS."); setGpsLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGpsLoading(false);
        },
        () => { alert("No se pudo obtener GPS. Por favor marca el punto en el mapa."); setGpsLoading(false); }
    );
  };

  // Guardar en Base de Datos
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!coords) { alert("⚠️ IMPORTANTE: Debes tocar el mapa para marcar dónde está la infraestructura."); return; }
    if (!form.dept || !form.muni || !form.dist) { alert("⚠️ Faltan datos administrativos (Depto/Muni/Distrito)."); return; }

    setLoading(true);

    const payload = {
        nombre: form.nombre,
        lat: coords.lat,
        lng: coords.lng,
        deporte: form.deporte,
        infraestructura: form.infraestructura,
        usos: form.usos,
        hombres: Number(form.hombres),
        mujeres: Number(form.mujeres),
        usuarios: Number(form.hombres) + Number(form.mujeres),
        departamento: form.dept,
        municipio: form.muni,
        distrito: form.dist,
        responsable: form.responsable,
        objetivos: form.objetivos
    };

    console.log("Enviando:", payload);

    const { error } = await supabase.from('academias').insert([payload]);

    setLoading(false);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("✅ ¡Registro Guardado Exitosamente!");
        router.push('/'); // Volvemos al Dashboard
    }
  };

  // Datos visuales para el mapa (Solo un punto temporal)
  const mapData: Academia[] = coords ? [{
      id: 0, 
      nombre: 'Nueva Ubicación', 
      lat: coords.lat, 
      lng: coords.lng, 
      deporte: 'Otro', 
      infraestructura: 'Marcador', 
      usuarios: 0 
  }] : [];

  if (!session) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-4">
            <button onClick={() => router.back()} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
                <ArrowLeft size={20}/> <span className="text-sm font-bold">VOLVER</span>
            </button>
            <h1 className="text-2xl font-bold text-blue-400">NUEVO REGISTRO DE INFRAESTRUCTURA</h1>
        </div>

        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: UBICACIÓN */}
            <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-bold text-blue-400 flex items-center gap-2"><MapPin size={16}/> 1. MARCAR EN MAPA</label>
                        <button type="button" onClick={getGPS} className="text-xs bg-slate-800 border border-slate-600 px-3 py-1 rounded hover:bg-slate-700 transition">
                            {gpsLoading ? "Buscando..." : "Usar mi GPS"}
                        </button>
                    </div>
                    
                    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-slate-600 relative">
                        <MapWithNoSSR 
                            data={mapData}
                            isAddingMode={true}
                            onMapClick={handleMapClick}
                        />
                        {!coords && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                                <span className="bg-black text-white px-4 py-2 rounded font-bold">👆 TOCA EL MAPA AQUÍ</span>
                            </div>
                        )}
                    </div>
                    {coords && <p className="text-center text-xs font-mono text-green-400 mt-2">Coordenadas: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">2. UBICACIÓN ADMINISTRATIVA</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-500 font-bold block mb-1">DEPARTAMENTO</label>
                            <select className="w-full bg-slate-950 border border-slate-600 rounded p-2.5 text-sm outline-none focus:border-blue-500" value={form.dept} onChange={e => setForm({...form, dept: e.target.value, muni: '', dist: ''})}>
                                <option value="">Seleccione...</option>
                                {Object.keys(CENSOS_2024).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold block mb-1">MUNICIPIO</label>
                            <select className="w-full bg-slate-950 border border-slate-600 rounded p-2.5 text-sm outline-none focus:border-blue-500" disabled={!form.dept} value={form.muni} onChange={e => setForm({...form, muni: e.target.value, dist: ''})}>
                                <option value="">Seleccione...</option>
                                {form.dept && CENSOS_2024[form.dept] && Object.keys(CENSOS_2024[form.dept].municipios).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold block mb-1">DISTRITO</label>
                            <select className="w-full bg-slate-950 border border-slate-600 rounded p-2.5 text-sm outline-none focus:border-blue-500" disabled={!form.muni} value={form.dist} onChange={e => setForm({...form, dist: e.target.value})}>
                                <option value="">Seleccione...</option>
                                {form.dept && form.muni && CENSOS_2024[form.dept]?.municipios[form.muni]?.distritos?.map((d: string) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: DATOS TÉCNICOS */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-fit space-y-6">
                <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Globe size={16}/> 3. FICHA TÉCNICA</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">NOMBRE DEL ESPACIO</label>
                        <input className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm focus:border-blue-500 outline-none" required placeholder="Ej. Cancha Municipal..." value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold block mb-1">DEPORTE</label>
                            <select className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm outline-none" value={form.deporte} onChange={e => setForm({...form, deporte: e.target.value})}>{DEPORTES.map(d=><option key={d} value={d}>{d}</option>)}</select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold block mb-1">INFRAESTRUCTURA</label>
                            <select className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm outline-none" value={form.infraestructura} onChange={e => setForm({...form, infraestructura: e.target.value})}>{INFRA.map(i=><option key={i} value={i}>{i}</option>)}</select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">USO PRINCIPAL</label>
                        <select className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm outline-none" value={form.usos} onChange={e => setForm({...form, usos: e.target.value})}>{USOS.map(u=><option key={u} value={u}>{u}</option>)}</select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
                        <div>
                            <label className="text-xs text-blue-400 font-bold block mb-1">HOMBRES</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-center" value={form.hombres} onChange={e => setForm({...form, hombres: parseInt(e.target.value)||0})}/>
                        </div>
                        <div>
                            <label className="text-xs text-pink-400 font-bold block mb-1">MUJERES</label>
                            <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-center" value={form.mujeres} onChange={e => setForm({...form, mujeres: parseInt(e.target.value)||0})}/>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">RESPONSABLE / CONTACTO</label>
                        <input className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm outline-none" placeholder="Ej. Alcaldía / INDES" value={form.responsable} onChange={e => setForm({...form, responsable: e.target.value})}/>
                    </div>

                    <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1">OBSERVACIONES</label>
                        <textarea className="w-full bg-slate-950 border border-slate-600 rounded p-3 text-sm h-24 outline-none resize-none" value={form.objetivos} onChange={e => setForm({...form, objetivos: e.target.value})}/>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg flex justify-center items-center gap-2 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <Save/>} GUARDAR REGISTRO
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}