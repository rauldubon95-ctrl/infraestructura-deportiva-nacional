'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { CENSOS_2024 } from '../lib/censos'; 
import { 
  Database, Plus, Map as MapIcon, Activity, Trophy, Filter, LogOut, CheckCircle, 
  Users, Building, Loader2, BarChart3, Home as HomeIcon, 
  UserCheck, LayoutDashboard, Settings, Globe // <--- AGREGADO AQUÍ
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

// --- INTERFAZ ---
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

const MapWithNoSSR = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500 font-mono text-xs">Cargando Sistema de Información Geográfica...</div>
});

// --- CONSTANTES PARA SIMULACIÓN Y FORMULARIO ---
const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Patinaje', 'Béisbol', 'Softbol', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público', 'Pista', 'Piscinas', 'Cancha de Baloncesto'];
const USOS = ['Recreativo', 'Entrenamiento', 'Alto Rendimiento', 'Competencia Local', 'Escolar', 'Comunitario', 'Privado'];

// Función auxiliar para simular datos realistas
const generarDatosSimulados = async () => {
  const confirmacion = confirm("⚠️ ¿Estás seguro? Esto insertará 20 registros de prueba en la base de datos.");
  if (!confirmacion) return;

  const deptosKeys = Object.keys(CENSOS_2024);
  const payloads = [];

  for (let i = 0; i < 20; i++) {
    const randomDept = deptosKeys[Math.floor(Math.random() * deptosKeys.length)];
    const munisKeys = Object.keys(CENSOS_2024[randomDept].municipios);
    const randomMuni = munisKeys[Math.floor(Math.random() * munisKeys.length)];
    const distritosList = CENSOS_2024[randomDept].municipios[randomMuni].distritos;
    const randomDist = distritosList[Math.floor(Math.random() * distritosList.length)];
    
    // Coordenadas base aprox de El Salvador + variación aleatoria
    const latBase = 13.7 + (Math.random() * 0.3 - 0.15);
    const lngBase = -89.2 + (Math.random() * 1.5 - 0.75);

    const hombres = Math.floor(Math.random() * 500) + 50;
    const mujeres = Math.floor(Math.random() * 500) + 50;

    payloads.push({
      nombre: `Instalación Deportiva ${randomDist} #${i+1}`,
      lat: latBase,
      lng: lngBase,
      deporte: DEPORTES[Math.floor(Math.random() * DEPORTES.length)],
      infraestructura: INFRA[Math.floor(Math.random() * INFRA.length)],
      usos: USOS[Math.floor(Math.random() * USOS.length)],
      hombres: hombres,
      mujeres: mujeres,
      usuarios: hombres + mujeres,
      departamento: randomDept,
      municipio: randomMuni,
      distrito: randomDist,
      responsable: "Simulación Cooperación",
      objetivos: "Registro generado para pruebas de carga y visualización de indicadores."
    });
  }

  const { error } = await supabase.from('academias').insert(payloads);
  if (error) alert("Error al simular: " + error.message);
  else {
    alert("✅ 20 Registros insertados. Recarga la página para ver los indicadores.");
    window.location.reload();
  }
};

// --- COMPONENTE DE BARRA DE PROGRESO (FORMAL) ---
const StatBar = ({ label, value, total, color = "bg-blue-600" }: { label: string, value: number, total: number, color?: string }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] uppercase tracking-wider mb-1 text-slate-400">
        <span>{label}</span>
        <span className="font-mono">{value} ({percent.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-slate-800 rounded-sm h-1.5 overflow-hidden">
        <div className={`${color} h-full transition-all duration-700 ease-out`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

// --- DASHBOARD PROFESIONAL ---
const DashboardView = ({ data }: { data: Academia[] }) => {
  const [filterDept, setFilterDept] = useState('');
  const [filterMuni, setFilterMuni] = useState('');
  const [filterDist, setFilterDist] = useState('');

  // 1. FILTRADO
  const filteredData = data.filter(item => {
    if (filterDept && item.departamento !== filterDept) return false;
    if (filterMuni && item.municipio !== filterMuni) return false;
    if (filterDist && item.distrito !== filterDist) return false;
    return true;
  });

  // 2. CÁLCULO DE POBLACIÓN (CENSO) vs BENEFICIARIOS
  let poblacionReferencia = 0;
  
  if (filterDept && !filterMuni) {
    // Nivel Depto
    poblacionReferencia = CENSOS_2024[filterDept]?.poblacion || 0;
  } else if (filterDept && filterMuni) {
    // Nivel Municipio (OJO: Tu estructura actual en censos.ts no tiene poblacion por municipio explícita, 
    // asumiremos un cálculo proporcional o 0 si no está el dato. 
    // *Para mejorar esto, debemos actualizar censos.ts con datos reales por municipio*)
    // Por ahora, usaremos la del departamento como base de contexto o 0 para no mentir.
    poblacionReferencia = 0; 
  } else {
    // Nivel Nacional (Suma de todo)
    poblacionReferencia = Object.values(CENSOS_2024).reduce((acc: number, curr: any) => acc + (curr.poblacion || 0), 0);
  }

  // 3. INDICADORES
  const totalInfraestructuras = filteredData.length;
  const beneficiariosHombres = filteredData.reduce((acc, curr) => acc + (curr.hombres || 0), 0);
  const beneficiariosMujeres = filteredData.reduce((acc, curr) => acc + (curr.mujeres || 0), 0);
  const totalBeneficiarios = beneficiariosHombres + beneficiariosMujeres;

  // Tasa de Cobertura (Solo si tenemos dato de población válido)
  const tasaCobertura = poblacionReferencia > 0 ? ((totalBeneficiarios / poblacionReferencia) * 100).toFixed(2) : "N/A";

  // Agrupaciones
  const countByKey = (key: keyof Academia) => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => { const val = String(item[key] || 'No definido'); counts[val] = (counts[val] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const mapData = filteredData.map(a => ({
    id: a.id, nombre: a.nombre, lat: a.lat, lng: a.lng, deporte: a.deporte,
    infraestructura: a.infraestructura, usuarios: a.usuarios, municipio: a.municipio, departamento: a.departamento
  }));

  return (
    <div className="h-full w-full bg-slate-950 p-6 overflow-y-auto pb-40 font-sans text-slate-200">
      
      {/* HEADER DE CONTROL */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Activity className="text-blue-500"/> SISTEMA DE MONITOREO ESTRATÉGICO
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
                    Nivel de Análisis: {filterDist ? 'Distrital' : filterMuni ? 'Municipal' : filterDept ? 'Departamental' : 'Nacional'}
                </p>
            </div>
            
            {/* KPI DEMOGRÁFICO */}
            <div className="flex gap-8 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Población Total (Censo)</p>
                    <p className="text-2xl font-mono text-white">{poblacionReferencia > 0 ? poblacionReferencia.toLocaleString() : "Selec. Depto"}</p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Población Activa</p>
                    <p className="text-2xl font-mono text-green-400">{totalBeneficiarios.toLocaleString()}</p>
                </div>
                <div className="w-px bg-slate-800"></div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">% Cobertura</p>
                    <p className="text-2xl font-mono text-blue-400">{tasaCobertura}%</p>
                </div>
            </div>
        </div>

        {/* FILTROS FORMALES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest"><Filter size={12}/> Segmentación:</div>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-blue-500 transition-colors" 
                value={filterDept} onChange={e => { setFilterDept(e.target.value); setFilterMuni(''); setFilterDist(''); }}>
                <option value="">TERRITORIO NACIONAL</option>
                {Object.keys(CENSOS_2024).map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-blue-500 transition-colors disabled:opacity-50" 
                disabled={!filterDept} value={filterMuni} onChange={e => { setFilterMuni(e.target.value); setFilterDist(''); }}>
                <option value="">TODOS LOS MUNICIPIOS</option>
                {filterDept && CENSOS_2024[filterDept]?.municipios && Object.keys(CENSOS_2024[filterDept].municipios).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded p-2 outline-none focus:border-blue-500 transition-colors disabled:opacity-50" 
                disabled={!filterMuni} value={filterDist} onChange={e => setFilterDist(e.target.value)}>
                <option value="">TODOS LOS DISTRITOS</option>
                {filterDept && filterMuni && CENSOS_2024[filterDept]?.municipios[filterMuni]?.distritos?.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
      </div>

      {/* CUERPO DEL REPORTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: DETALLE ESTADÍSTICO */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* TARJETAS KPI SECUNDARIAS */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Infraestructuras</p>
                    <p className="text-3xl font-light text-white mt-1">{totalInfraestructuras}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><UserCheck size={40}/></div>
                    <p className="text-[10px] text-blue-400 uppercase font-bold">Participación Masculina</p>
                    <p className="text-2xl font-light text-white mt-1">{beneficiariosHombres.toLocaleString()}</p>
                    <div className="w-full bg-slate-800 h-1 mt-2"><div className="bg-blue-500 h-1" style={{width: `${(beneficiariosHombres/totalBeneficiarios)*100}%`}}></div></div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><UserCheck size={40}/></div>
                    <p className="text-[10px] text-pink-400 uppercase font-bold">Participación Femenina</p>
                    <p className="text-2xl font-light text-white mt-1">{beneficiariosMujeres.toLocaleString()}</p>
                    <div className="w-full bg-slate-800 h-1 mt-2"><div className="bg-pink-500 h-1" style={{width: `${(beneficiariosMujeres/totalBeneficiarios)*100}%`}}></div></div>
                </div>
            </div>

            {/* TABLA DE INDICADORES POR DISCIPLINA */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider flex gap-2 border-b border-slate-800 pb-2"><Trophy size={14} className="text-yellow-500"/> Frecuencia por Disciplina Deportiva</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {countByKey('deporte').slice(0, 10).map(([name, count]) => (
                        <StatBar key={name} label={name} value={count} total={totalInfraestructuras} color="bg-yellow-600"/>
                    ))}
                </div>
            </div>

            {/* TABLA DE TIPOLOGÍA */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider flex gap-2 border-b border-slate-800 pb-2"><Building size={14} className="text-blue-500"/> Tipología de Infraestructura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {countByKey('infraestructura').slice(0, 8).map(([name, count]) => (
                        <StatBar key={name} label={name} value={count} total={totalInfraestructuras} color="bg-blue-600"/>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMNA 2: GEORREFERENCIACIÓN Y USOS */}
        <div className="space-y-6">
            
            {/* MAPA CONTEXTUAL */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg shadow-lg">
                <div className="bg-slate-950 p-2 border-b border-slate-800 mb-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"><MapIcon size={12}/> Visualización Territorial</p>
                </div>
                <div className="h-72 w-full rounded overflow-hidden relative bg-slate-950">
                    <MapWithNoSSR data={mapData} isAddingMode={false} onMapClick={()=>{}}/>
                </div>
            </div>

            {/* GRÁFICO DE USOS */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex gap-2"><BarChart3 size={14} className="text-green-500"/> Modelo de Gestión / Uso</h3>
                <div className="space-y-4">
                    {countByKey('usos').map(([name, count]) => (
                        <StatBar key={name} label={name} value={count} total={totalInfraestructuras} color="bg-green-600"/>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const router = useRouter();
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'MAP' | 'STATS'>('MAP');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
    const load = async () => {
      const { data } = await supabase.from('academias').select('*');
      if (data) {
          const cleanData: Academia[] = data.map((d: any) => ({
              id: d.id,
              nombre: d.nombre,
              lat: d.lat,
              lng: d.lng,
              deporte: d.deporte,
              infraestructura: d.infraestructura,
              usos: d.usos,
              hombres: d.hombres,
              mujeres: d.mujeres,
              usuarios: d.usuarios,
              departamento: d.departamento,
              municipio: d.municipio,
              distrito: d.distrito,
              responsable: d.responsable,
              objetivos: d.objetivos
          }));
          setAcademias(cleanData);
      }
    };
    load();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // DATOS PARA EL MAPA GRANDE
  const mapData = academias.map(a => ({
      id: a.id,
      nombre: a.nombre,
      lat: a.lat,
      lng: a.lng,
      deporte: a.deporte,
      infraestructura: a.infraestructura,
      usuarios: a.usuarios,
      municipio: a.municipio,
      departamento: a.departamento
  }));

  return (
    <main className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      <aside className="w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-50 shadow-2xl">
        <div className="p-6 border-b border-slate-800 font-bold text-lg flex gap-3 items-center text-slate-100">
            <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Database size={16} className="text-white"/> 
            </div>
            <div>
                <p className="leading-none">ONID</p>
                <p className="text-[9px] text-slate-500 font-normal uppercase tracking-wider">Sistema Nacional</p>
            </div>
        </div>
        
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* USUARIO */}
          {!session ? (
            <button onClick={handleLogin} className="w-full bg-slate-100 hover:bg-white text-slate-900 p-3 rounded-md font-bold transition flex justify-center items-center gap-2 text-sm">
                <Globe size={16}/> Acceso Institucional
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="text-xs text-green-400 flex items-center gap-2 mb-2 truncate font-bold">
                      <CheckCircle size={12}/> {session.user.email?.split('@')[0]}
                  </div>
                  <button onClick={handleLogout} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition uppercase font-bold tracking-wider">
                      <LogOut size={10}/> Cerrar Sesión
                  </button>
              </div>
              
              <button 
                onClick={() => router.push('/registro')} 
                className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 transition-all border border-blue-500/50 text-sm"
              >
                <Plus size={16}/> REGISTRAR INFRAESTRUCTURA
              </button>

              {/* BOTÓN DE SIMULACIÓN (SOLO DESARROLLO) */}
              <button 
                onClick={generarDatosSimulados} 
                className="w-full bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-xs text-slate-400 flex justify-center items-center gap-2 border border-slate-700 border-dashed"
              >
                <Settings size={12}/> Generar Datos de Prueba
              </button>
            </div>
          )}

          {/* MENÚ */}
          <div className="space-y-1 pt-4 border-t border-slate-800">
            <p className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Módulos</p>
            <button onClick={() => setView('MAP')} className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-all text-xs font-medium ${view === 'MAP' ? 'bg-slate-800 text-white border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <MapIcon size={16}/> Mapa Georreferenciado
            </button>
            <button onClick={() => setView('STATS')} className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-all text-xs font-medium ${view === 'STATS' ? 'bg-slate-800 text-white border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <LayoutDashboard size={16}/> Tablero de Indicadores
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <div className="flex-1 relative bg-slate-950">
        {view === 'MAP' ? (
           <MapWithNoSSR data={mapData} isAddingMode={false} onMapClick={() => {}} />
        ) : (
           <DashboardView data={academias} />
        )}
      </div>
    </main>
  );
}