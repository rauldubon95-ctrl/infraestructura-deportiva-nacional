'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Database, Plus, Map as MapIcon, Activity, Trophy, Filter, LogOut, CheckCircle, 
  Users, Building, Loader2, Globe, MapPin, BarChart3, XCircle, Home as HomeIcon, 
  UserCheck, LayoutDashboard, Save
} from 'lucide-react';

// Fix Leaflet para que no rompa en Next.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- INTERFAZ EXACTA (Coincide con tu BD y Mapa) ---
export interface Academia {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  deporte: string;
  infraestructura: string;
  usos: string;
  hombres: number;
  mujeres: number;
  usuarios: number;
  departamento: string;
  municipio: string;
  distrito: string;
  responsable?: string;
  objetivos?: string;
  beneficiarios?: string;
}

// Carga del mapa dinámica
const MapWithNoSSR = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-blue-500 font-bold">CARGANDO MAPA...</div>
});

const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Patinaje', 'Béisbol', 'Softbol', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público', 'Pista', 'Piscinas', 'Cancha de Baloncesto'];
const USOS = ['Recreativo', 'Entrenamiento', 'Alto Rendimiento', 'Competencia Local', 'Escolar', 'Comunitario', 'Privado'];

// --- DATA TERRITORIAL (Estructura: Depto -> municipios -> Muni -> distritos -> []) ---
const SV_DATA: any = {
  "Ahuachapán": { "municipios": { "Ahuachapán Centro": { "distritos": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"] }, "Ahuachapán Norte": { "distritos": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"] }, "Ahuachapán Sur": { "distritos": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"] } } },
  "Santa Ana": { "municipios": { "Santa Ana Centro": { "distritos": ["Santa Ana"] }, "Santa Ana Este": { "distritos": ["Coatepeque", "El Congo"] }, "Santa Ana Norte": { "distritos": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"] }, "Santa Ana Oeste": { "distritos": ["Candelaria de La Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de La Frontera"] } } },
  "Sonsonate": { "municipios": { "Sonsonate Centro": { "distritos": ["Nahulingo", "San Antonio del Monte", "Santo Domingo de Guzmán", "Sonsonate", "Sonzacate"] }, "Sonsonate Este": { "distritos": ["Armenia", "Caluco", "Cuisnahuat", "Izalco", "San Julián", "Santa Isabel Ishuatán"] }, "Sonsonate Norte": { "distritos": ["Juayúa", "Nahuizalco", "Salcoatitán", "Santa Catarina Masahuat"] }, "Sonsonate Oeste": { "distritos": ["Acajutla"] } } },
  "Chalatenango": { "municipios": { "Chalatenango Centro": { "distritos": ["Agua Caliente", "Dulce Nombre de María", "El Paraíso", "La Reina", "Nueva Concepción", "San Fernando", "San Francisco Morazán", "San Rafael", "Santa Rita", "Tejutla"] }, "Chalatenango Norte": { "distritos": ["Citalá", "La Palma", "San Ignacio"] }, "Chalatenango Sur": { "distritos": ["Arcatao", "Azacualpa", "Cancasque", "Chalatenango", "Comalapa", "Concepción Quezaltepeque", "El Carrizal", "La Laguna", "Las Flores", "Las Vueltas", "Nombre de Jesús", "Nueva Trinidad", "Ojos de Agua", "Potonico", "San Antonio de La Cruz", "San Antonio Los Ranchos", "San Francisco Lempa", "San Isidro Labrador", "San Luis del Carmen", "San Miguel de Mercedes"] } } },
  "La Libertad": { "municipios": { "La Libertad Centro": { "distritos": ["Ciudad Arce", "San Juan Opico"] }, "La Libertad Costa": { "distritos": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"] }, "La Libertad Este": { "distritos": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"] }, "La Libertad Norte": { "distritos": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"] }, "La Libertad Oeste": { "distritos": ["Colón", "Jayaque", "Sacacoyo", "Talnique", "Tepecoyo"] }, "La Libertad Sur": { "distritos": ["Comasagua", "Santa Tecla"] } } },
  "San Salvador": { "municipios": { "San Salvador Centro": { "distritos": ["Ayutuxtepeque", "Ciudad Delgado", "Cuscatancingo", "Mejicanos", "San Salvador"] }, "San Salvador Este": { "distritos": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"] }, "San Salvador Norte": { "distritos": ["Aguilares", "El Paisnal", "Guazapa"] }, "San Salvador Oeste": { "distritos": ["Apopa", "Nejapa"] }, "San Salvador Sur": { "distritos": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santiago Texacuangos", "Santo Tomás"] } } },
  "Cuscatlán": { "municipios": { "Cuscatlán Norte": { "distritos": ["Oratorio de Concepción", "San Bartolomé Perulapía", "San José Guayabal", "San Pedro Perulapán", "Suchitoto"] }, "Cuscatlán Sur": { "distritos": ["Candelaria", "Cojutepeque", "El Carmen", "El Rosario", "Monte San Juan", "San Cristobal", "San Rafael Cedros", "San Ramón", "Santa Cruz Analquito", "Santa Cruz Michapa", "Tenancingo"] } } },
  "La Paz": { "municipios": { "La Paz Centro": { "distritos": ["El Rosario", "Jerusalén", "Mercedes La Ceiba", "Paraíso de Osorio", "San Antonio Masahuat", "San Emigdio", "San Juan Tepezontes", "San Luis La Herradura", "San Miguel Tepezontes", "San Pedro Nonualco", "Santa María Ostuma", "Santiago Nonualco"] }, "La Paz Este": { "distritos": ["San Juan Nonualco", "San Rafael Obrajuelo", "Zacatecoluca"] }, "La Paz Oeste": { "distritos": ["Cuyultitán", "Olocuilta", "San Francisco Chinameca", "San Juan Talpa", "San Luis Talpa", "San Pedro Masahuat", "Tapalhuaca"] } } },
  "Cabañas": { "municipios": { "Cabañas Este": { "distritos": ["Guacotecti", "San Isidro", "Sensuntepeque", "Victoria", "Villa Dolores"] }, "Cabañas Oeste": { "distritos": ["Cinquera", "Ilobasco", "Jutiapa", "Tejutepeque"] } } },
  "San Vicente": { "municipios": { "San Vicente Norte": { "distritos": ["Apastepeque", "San Esteban Catarina", "San Ildefonso", "San Lorenzo", "San Sebastián", "Santa Clara", "Santo Domingo"] }, "San Vicente Sur": { "distritos": ["Guadalupe", "San Cayetano Istepeque", "San Vicente", "Tecoluca", "Tepetitán", "Verapaz"] } } },
  "Usulután": { "municipios": { "Usulután Norte": { "distritos": ["Alegría", "Berlín", "El Triunfo", "Estanzuelas", "Jucuapa", "Mercedes Umaña", "Nueva Granada", "San Buena Ventura", "Santiago de María"] }, "Usulután Este": { "distritos": ["California", "Concepción Batres", "Ereguayquín", "Jucuarán", "Ozatlán", "San Dionisio", "Santa Elena", "Santa María", "Tecapán", "Usulután"] }, "Usulután Oeste": { "distritos": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"] } } },
  "San Miguel": { "municipios": { "San Miguel Centro": { "distritos": ["Chirilagua", "Comacarán", "Moncagua", "Quelepa", "San Miguel", "Uluazapa"] }, "San Miguel Norte": { "distritos": ["Carolina", "Chapeltique", "Ciudad Barrios", "Nuevo Edén de San Juan", "San Antonio", "San Gerardo", "San Luis de La Reina", "Sesori"] }, "San Miguel Oeste": { "distritos": ["Chinameca", "El Tránsito", "Lolotique", "Nueva Guadalupe", "San Jorge", "San Rafael Oriente"] } } },
  "Morazán": { "municipios": { "Morazán Norte": { "distritos": ["Arambala", "Cacaopera", "Corinto", "El Rosario", "Joateca", "Jocoaitique", "Meanguera", "Perquín", "San Fernando", "San Isidro", "Torola"] }, "Morazán Sur": { "distritos": ["Chilanga", "Delicias de Concepción", "El Divisadero", "Gualococti", "Guatajiagua", "Jocoro", "Lolotiquillo", "Osicala", "San Carlos", "San Francisco Gotera", "San Simón", "Sensembra", "Sociedad", "Yamabal", "Yoloaiquín"] } } },
  "La Unión": { "municipios": { "La Unión Norte": { "distritos": ["Anamorós", "Bolívar", "Concepción de Oriente", "El Sauce", "Lislique", "Nueva Esparta", "Pasaquina", "Polorós", "San José", "Santa Rosa de Lima"] }, "La Unión Sur": { "distritos": ["Conchagua", "El Carmen", "Intipucá", "La Unión", "Meanguera del Golfo", "San Alejo", "Yayantique", "Yucuaiquín"] } } }
};

// --- DASHBOARD ---
const DashboardView = ({ data }: { data: Academia[] }) => {
  const total = data.length;
  const hombres = data.reduce((acc, curr) => acc + (curr.hombres || 0), 0);
  const mujeres = data.reduce((acc, curr) => acc + (curr.mujeres || 0), 0);

  const byDeporte = DEPORTES.map(d => ({ name: d, count: data.filter(i => i.deporte === d).length })).sort((a,b)=>b.count-a.count);
  const byInfra = INFRA.map(i => ({ name: i, count: data.filter(d => d.infraestructura === i).length })).sort((a,b)=>b.count-a.count);
  const byUso = USOS.map(u => ({ name: u, count: data.filter(i => i.usos === u).length })).sort((a,b)=>b.count-a.count);

  return (
    <div className="h-full w-full bg-slate-900 p-8 overflow-y-auto pb-32">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3"><Activity className="text-blue-500"/> Tablero ONID</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Infraestructuras</p>
          <p className="text-4xl font-black text-white">{total}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-l-4 border-blue-500">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Hombres</p>
          <p className="text-4xl font-black text-blue-400">{hombres}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-l-4 border-pink-500">
          <p className="text-slate-400 text-xs font-bold uppercase mb-1">Mujeres</p>
          <p className="text-4xl font-black text-pink-400">{mujeres}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Trophy size={16} className="text-yellow-500"/> Deportes</h3>
          <div className="space-y-2">{byDeporte.slice(0,8).map(x=><div key={x.name} className="flex justify-between text-xs text-slate-300"><span>{x.name}</span><span>{x.count}</span></div>)}</div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><HomeIcon size={16} className="text-green-500"/> Infraestructura</h3>
          <div className="space-y-2">{byInfra.slice(0,8).map(x=><div key={x.name} className="flex justify-between text-xs text-slate-300"><span>{x.name}</span><span>{x.count}</span></div>)}</div>
        </div>
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-purple-500"/> Usos</h3>
          <div className="space-y-2">{byUso.map(x=><div key={x.name} className="flex justify-between text-xs text-slate-300"><span>{x.name}</span><span>{x.count}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [currentView, setCurrentView] = useState<'MAP' | 'DASHBOARD'>('MAP');
  const [showForm, setShowForm] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [tempCoords, setTempCoords] = useState<{lat: number, lng: number} | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '', deporte: 'Fútbol', infraestructura: 'Cancha Natural', usos: 'Recreativo',
    hombres: 0, mujeres: 0, responsable: '', objetivos: '', 
    dept: '', muni: '', dist: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
      });
    }
    
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
    const load = async () => {
      const { data } = await supabase.from('academias').select('*');
      if (data) setAcademias(data as Academia[]);
    };
    load();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setShowForm(false); };

  // --- ABRIR FORMULARIO (FORZADO) ---
  const openForm = () => {
    if (!session) { handleLogin(); return; }
    setTempCoords(null);
    setFormData({
      nombre: '', deporte: 'Fútbol', infraestructura: 'Cancha Natural', usos: 'Recreativo',
      hombres: 0, mujeres: 0, responsable: '', objetivos: '',
      dept: '', muni: '', dist: ''
    });
    setShowForm(true);
  };

  const getGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) { alert("No GPS"); setGpsLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setTempCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setGpsLoading(false); alert("Error GPS. Use el mapa."); }
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dept || !formData.muni || !formData.dist) { alert("Faltan datos de ubicación (Depto/Muni/Distrito)"); return; }
    
    // Preparar objeto para Supabase (Sin ID, Supabase lo crea)
    const payload = {
      nombre: formData.nombre,
      deporte: formData.deporte,
      infraestructura: formData.infraestructura,
      usos: formData.usos,
      hombres: Number(formData.hombres),
      mujeres: Number(formData.mujeres),
      usuarios: Number(formData.hombres) + Number(formData.mujeres),
      lat: tempCoords?.lat || 13.6929,
      lng: tempCoords?.lng || -89.2182,
      departamento: formData.dept,
      municipio: formData.muni,
      distrito: formData.dist,
      responsable: formData.responsable,
      objetivos: formData.objetivos
    };

    const { data, error } = await supabase.from('academias').insert([payload]).select();
    
    if (error) {
      alert("Error Supabase: " + error.message);
    } else {
      if (data) setAcademias([...academias, data[0] as Academia]);
      alert("¡Guardado Exitosamente!");
      setShowForm(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-slate-950 text-white overflow-hidden">
      
      <aside className="w-80 flex-shrink-0 border-r border-slate-800 flex flex-col z-[50] shadow-2xl relative bg-slate-900">
        <div className="p-4 font-bold text-xl border-b border-slate-800 flex gap-2"><Database/> ONID</div>
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {!session ? (
            <button onClick={handleLogin} className="w-full bg-white text-slate-900 p-2 rounded font-bold">Ingresar con Google</button>
          ) : (
            <div className="bg-slate-800 p-3 rounded space-y-2 border border-slate-700">
              <div className="text-xs text-green-400 truncate">{session.user.email}</div>
              <button onClick={openForm} className="w-full bg-green-600 hover:bg-green-500 p-2 rounded font-bold flex justify-center gap-2 transition-all cursor-pointer"><Plus size={16}/> NUEVO REGISTRO</button>
              <button onClick={handleLogout} className="text-xs text-red-400 w-full text-left cursor-pointer">Cerrar Sesión</button>
            </div>
          )}

          <div className="space-y-1">
            <button onClick={() => setCurrentView('MAP')} className="w-full text-left p-2 hover:bg-slate-800 rounded flex gap-2 cursor-pointer"><MapIcon size={16}/> Mapa</button>
            <button onClick={() => setCurrentView('DASHBOARD')} className="w-full text-left p-2 hover:bg-slate-800 rounded flex gap-2 cursor-pointer"><LayoutDashboard size={16}/> Estadísticas</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 relative z-0">
        {currentView === 'MAP' ? (
          <MapWithNoSSR data={academias} isAddingMode={false} onMapClick={()=>{}}/>
        ) : (
          <DashboardView data={academias} selectedDept="" />
        )}

        {/* MODAL FORMULARIO - Z-INDEX 99999 PARA ASEGURAR VISIBILIDAD */}
        {showForm && (
          <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 shadow-2xl flex flex-col custom-scrollbar">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-50">
                <h2 className="text-xl font-bold text-white flex gap-2"><Plus className="text-blue-500"/> Nuevo Registro</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white cursor-pointer"><XCircle/></button>
              </div>

              <form onSubmit={save} className="p-6 space-y-6">
                
                {/* 1. UBICACIÓN */}
                <div className="bg-slate-800/50 p-4 rounded-xl border border-blue-500/20">
                  <div className="flex justify-between mb-4">
                    <span className="text-blue-400 font-bold text-xs flex items-center gap-2"><MapPin size={14}/> UBICACIÓN ADMINISTRATIVA</span>
                    <button type="button" onClick={getGPS} className="bg-blue-600 text-xs px-3 py-1 rounded flex gap-2 items-center hover:bg-blue-500 transition-colors">
                      {gpsLoading ? <Loader2 className="animate-spin" size={12}/> : <Globe size={12}/>} OBTENER GPS
                    </button>
                  </div>
                  {tempCoords && <div className="text-center text-xs font-mono text-green-400 mb-2">Lat: {tempCoords.lat} | Lng: {tempCoords.lng}</div>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">DEPARTAMENTO</label>
                      <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs" required value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value, muni: '', dist: ''})}>
                        <option value="">Seleccione...</option>
                        {Object.keys(SV_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">MUNICIPIO</label>
                      <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs" required disabled={!formData.dept} value={formData.muni} onChange={e => setFormData({...formData, muni: e.target.value, dist: ''})}>
                        <option value="">Seleccione...</option>
                        {formData.dept && SV_DATA[formData.dept]?.municipios && Object.keys(SV_DATA[formData.dept].municipios).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-bold">DISTRITO</label>
                      <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs" required disabled={!formData.muni} value={formData.dist} onChange={e => setFormData({...formData, dist: e.target.value})}>
                        <option value="">Seleccione...</option>
                        {formData.dept && formData.muni && SV_DATA[formData.dept]?.municipios[formData.muni]?.distritos && SV_DATA[formData.dept].municipios[formData.muni].distritos.map((d: string) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. DATOS GENERALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 block mb-1">Nombre Oficial</label>
                    <input className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" required placeholder="Ej. Estadio Municipal..." value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}/>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Deporte Principal</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" value={formData.deporte} onChange={e => setFormData({...formData, deporte: e.target.value})}>{DEPORTES.map(d=><option key={d} value={d}>{d}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Tipo Infraestructura</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" value={formData.infraestructura} onChange={e => setFormData({...formData, infraestructura: e.target.value})}>{INFRA.map(i=><option key={i} value={i}>{i}</option>)}</select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 block mb-1">Uso Principal</label>
                    <select className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" value={formData.usos} onChange={e => setFormData({...formData, usos: e.target.value})}>{USOS.map(u=><option key={u} value={u}>{u}</option>)}</select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-400 block mb-1">Hombres</label>
                    <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" required placeholder="0" value={formData.hombres} onChange={e => setFormData({...formData, hombres: parseInt(e.target.value)||0})}/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-pink-400 block mb-1">Mujeres</label>
                    <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" required placeholder="0" value={formData.mujeres} onChange={e => setFormData({...formData, mujeres: parseInt(e.target.value)||0})}/>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 block mb-1">Responsable</label>
                    <input className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none" placeholder="Ej. Alcaldía / INDES" value={formData.responsable} onChange={e => setFormData({...formData, responsable: e.target.value})}/>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 block mb-1">Observaciones</label>
                    <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm h-24 focus:border-blue-500 outline-none" value={formData.objetivos} onChange={e => setFormData({...formData, objetivos: e.target.value})}/>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-transparent border border-slate-600 rounded text-slate-400 hover:bg-slate-800 transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 rounded font-bold hover:bg-blue-500 shadow-lg transition-colors flex justify-center items-center gap-2"><Save size={16}/> GUARDAR FICHA</button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}