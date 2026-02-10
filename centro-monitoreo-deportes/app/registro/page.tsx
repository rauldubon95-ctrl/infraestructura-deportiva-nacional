'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { CENSOS_2024 } from '../../lib/censos'; 
import { Save, ArrowLeft, MapPin, CheckCircle, AlertTriangle, Calculator, User } from 'lucide-react';

const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Patinaje', 'Béisbol', 'Softbol', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público', 'Pista', 'Piscinas', 'Cancha de Baloncesto'];
const USOS = ['Recreativo', 'Entrenamiento', 'Alto Rendimiento', 'Competencia Local', 'Escolar', 'Comunitario', 'Privado'];

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    lat: 0,
    lng: 0,
    deporte: DEPORTES[0],
    infraestructura: INFRA[0],
    usos: USOS[0],
    departamento: '',
    municipio: '',
    distrito: '',
    responsable: '',
    objetivos: '',
    
    // Matriz Demográfica
    hombres_0_12: 0,
    mujeres_0_12: 0,
    hombres_13_29: 0,
    mujeres_13_29: 0,
    hombres_30_mas: 0,
    mujeres_30_mas: 0,
  });

  // Totales Calculados (Solo lectura)
  const [totales, setTotales] = useState({ hombres: 0, mujeres: 0, total: 0 });

  // Efecto para calcular totales automáticamente
  useEffect(() => {
    const h = (parseInt(form.hombres_0_12 as any) || 0) + (parseInt(form.hombres_13_29 as any) || 0) + (parseInt(form.hombres_30_mas as any) || 0);
    const m = (parseInt(form.mujeres_0_12 as any) || 0) + (parseInt(form.mujeres_13_29 as any) || 0) + (parseInt(form.mujeres_30_mas as any) || 0);
    setTotales({
        hombres: h,
        mujeres: m,
        total: h + m
    });
  }, [form.hombres_0_12, form.mujeres_0_12, form.hombres_13_29, form.mujeres_13_29, form.hombres_30_mas, form.mujeres_30_mas]);

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");
    navigator.geolocation.getCurrentPosition(
        (pos) => setForm({ ...form, lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => alert("Error obteniendo ubicación: " + err.message)
    );
  };

  const guardar = async () => {
    if (!form.nombre || !form.departamento || !form.municipio || !form.distrito) {
        return alert("Por favor completa los campos obligatorios (Nombre y Ubicación).");
    }

    setLoading(true);
    const { error } = await supabase.from('academias').insert([{
        ...form,
        hombres: totales.hombres,
        mujeres: totales.mujeres,
        usuarios: totales.total,
        created_at: new Date()
    }]);

    setLoading(false);
    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("✅ Infraestructura registrada correctamente.");
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
            
            {/* Encabezado */}
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Nueva Infraestructura</h1>
                    <p className="text-sm text-slate-500">Formulario de Registro Nacional v2.0</p>
                </div>
            </div>

            {/* Fila 1: Datos Generales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                    <h3 className="font-bold text-blue-400 uppercase text-xs tracking-wider mb-2">1. Información Básica</h3>
                    
                    <div>
                        <label className="block text-xs mb-1">Nombre de la Instalación *</label>
                        <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none" 
                            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Ej. Estadio Municipal..."/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs mb-1">Deporte Principal</label>
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                                value={form.deporte} onChange={e => setForm({...form, deporte: e.target.value})}>
                                {DEPORTES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs mb-1">Tipo de Infraestructura</label>
                            <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                                value={form.infraestructura} onChange={e => setForm({...form, infraestructura: e.target.value})}>
                                {INFRA.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                         </div>
                    </div>

                    <div>
                        <label className="block text-xs mb-1">Modelo de Gestión / Uso</label>
                        <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                            value={form.usos} onChange={e => setForm({...form, usos: e.target.value})}>
                            {USOS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-lg border border-slate-800 space-y-4">
                    <h3 className="font-bold text-green-400 uppercase text-xs tracking-wider mb-2">2. Ubicación Geográfica</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs mb-1">Latitud</label>
                             <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" 
                                value={form.lat} onChange={e => setForm({...form, lat: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-xs mb-1">Longitud</label>
                             <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm" 
                                value={form.lng} onChange={e => setForm({...form, lng: parseFloat(e.target.value)})} />
                        </div>
                    </div>
                    <button onClick={obtenerUbicacion} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded flex items-center justify-center gap-2 border border-slate-700 transition">
                        <MapPin size={14}/> Usar mi Ubicación GPS Actual
                    </button>

                    <div>
                        <label className="block text-xs mb-1">Departamento *</label>
                        <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                             value={form.departamento} onChange={e => setForm({...form, departamento: e.target.value, municipio: '', distrito: ''})}>
                             <option value="">-- Seleccionar --</option>
                             {Object.keys(CENSOS_2024).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    {form.departamento && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs mb-1">Municipio *</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                                    value={form.municipio} onChange={e => setForm({...form, municipio: e.target.value, distrito: ''})}>
                                    <option value="">-- Seleccionar --</option>
                                    {Object.keys(CENSOS_2024[form.departamento].municipios).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Distrito *</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm"
                                    value={form.distrito} onChange={e => setForm({...form, distrito: e.target.value})}>
                                    <option value="">-- Seleccionar --</option>
                                    {form.municipio && CENSOS_2024[form.departamento].municipios[form.municipio].distritos.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fila 2: Matriz Demográfica */}
            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-purple-400 uppercase text-xs tracking-wider">3. Beneficiarios (Desglose Demográfico)</h3>
                    <div className="bg-slate-950 px-3 py-1 rounded border border-slate-800 text-xs font-mono text-slate-400">
                        Total Calculado: <span className="text-white font-bold">{totales.total}</span> personas
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Niñez */}
                    <div className="space-y-3">
                        <p className="text-center text-xs font-bold text-slate-500 border-b border-slate-800 pb-1">NIÑEZ (0-12 Años)</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-blue-400 font-bold">NIÑOS</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-blue-500 outline-none"
                                value={form.hombres_0_12} onChange={e => setForm({...form, hombres_0_12: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-pink-400 font-bold">NIÑAS</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-pink-500 outline-none"
                                value={form.mujeres_0_12} onChange={e => setForm({...form, mujeres_0_12: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>

                    {/* Juventud */}
                    <div className="space-y-3">
                        <p className="text-center text-xs font-bold text-slate-500 border-b border-slate-800 pb-1">JUVENTUD (13-29 Años)</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-blue-400 font-bold">HOMBRES</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-blue-500 outline-none"
                                value={form.hombres_13_29} onChange={e => setForm({...form, hombres_13_29: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-pink-400 font-bold">MUJERES</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-pink-500 outline-none"
                                value={form.mujeres_13_29} onChange={e => setForm({...form, mujeres_13_29: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>

                    {/* Adultos */}
                    <div className="space-y-3">
                        <p className="text-center text-xs font-bold text-slate-500 border-b border-slate-800 pb-1">ADULTOS (30+ Años)</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-blue-400 font-bold">HOMBRES</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-blue-500 outline-none"
                                value={form.hombres_30_mas} onChange={e => setForm({...form, hombres_30_mas: parseInt(e.target.value) || 0})} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] w-12 text-pink-400 font-bold">MUJERES</span>
                            <input type="number" min="0" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm font-mono text-center focus:border-pink-500 outline-none"
                                value={form.mujeres_30_mas} onChange={e => setForm({...form, mujeres_30_mas: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón Guardar */}
            <button onClick={guardar} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-lg font-bold text-white shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <span className="animate-spin">⏳</span> : <Save size={20}/>}
                {loading ? "Guardando Registro..." : "REGISTRAR INFRAESTRUCTURA"}
            </button>

        </div>
    </div>
  );
}