'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { CENSOS_2024 } from '../lib/censos'; 
import { 
  Database, Plus, Map as MapIcon, Activity, Trophy, Filter, LogOut, CheckCircle, 
  Users, Building, BarChart3, Globe, UserCheck, LayoutDashboard, Lock
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
  
  // Totales
  hombres: number;
  mujeres: number;
  usuarios: number;

  // Desglose Demográfico
  hombres_0_12: number;
  mujeres_0_12: number;
  hombres_13_29: number;
  mujeres_13_29: number;
  hombres_30_mas: number;
  mujeres_30_mas: number;

  departamento: string;
  municipio: string;
  distrito: string;
  responsable?: string;
  objetivos?: string;
}

const MapWithNoSSR = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500 font-mono text-xs">Cargando Sistema de Información Geográfica...</div>
});

// --- COMPONENTES VISUALES ---
const StatBar = ({ label, value, total, color = "bg-blue-600" }: { label: string, value: number, total: number, color?: string }) => {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1 text-slate-400 font-bold">
        <span>{label}</span>
        <span className="font-mono">{value} ({percent.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-full transition-all duration-700 ease-out`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
};

// --- PIRÁMIDE POBLACIONAL ---
const AgePyramid = ({ data }: { data: Academia[] }) => {
  const stats = data.reduce((acc, curr) => ({
    h_0_12: acc.h_0_12 + (curr.hombres_0_12 || 0),
    m_0_12: acc.m_0_12 + (curr.mujeres_0_12 || 0),
    h_13_29: acc.h_13_29 + (curr.hombres_13_29 || 0),
    m_13_29: acc.m_13_29 + (curr.mujeres_13_29 || 0),
    h_30_mas: acc.h_30_mas + (curr.hombres_30_mas || 0),
    m_30_mas: acc.m_30_mas + (curr.mujeres_30_mas || 0),
  }), { h_0_12: 0, m_0_12: 0, h_13_29: 0, m_13_29: 0, h_30_mas: 0, m_30_mas: 0 });

  const maxVal = Math.max(
    stats.h_0_12, stats.m_0_12, stats.h_13_29, stats.m_13_29, stats.h_30_mas, stats.m_30_mas
  ) || 1;

  const Row = ({ label, hVal, mVal }: { label: string, hVal: number, mVal: number }) => (
    <div className="grid grid-cols-7 items-center gap-2 mb-3 text-xs">
      <div className="col-span-3 flex justify-end items-center gap-2">
         <span className="text-slate-400 font-mono">{hVal}</span>
         <div className="h-4 bg-blue-600 rounded-l-sm transition-all duration-500" style={{ width: `${(hVal/maxVal)*100}%`}}></div>
      </div>
      <div className="col-span-1 text-center text-white font-bold text-[9px] uppercase tracking-widest bg-slate-800 rounded py-1">
        {label}
      </div>
      <div className="col-span-3 flex justify-start items-center gap-2">
         <div className="h-4 bg-pink-500 rounded-r-sm transition-all duration-500" style={{ width: `${(mVal/maxVal)*100}%`}}></div>
         <span className="text-slate-400 font-mono">{mVal}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
      <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider flex gap-2 border-b border-slate-800 pb-2">
        <Users size={14} className="text-purple-500"/> Distribución Demográfica (Edad/Sexo)
      </h3>
      <div className="flex justify-between text-[9px] text-slate-500 uppercase mb-2 px-10">
        <span>Hombres</span>
        <span>Mujeres</span>
      </div>
      <Row label="30+ Años" hVal={stats.h_30_mas} mVal={stats.m_30_mas} />
      <Row label="13-29 Años" hVal={stats.h_13_29} mVal={stats.m_13_29} />
      <Row label="0-12 Años" hVal={stats.h_0_12} mVal={stats.m_0_12} />
      
      <div className="mt-4 flex justify-center gap-4 text-[10px] text-slate-400">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded-full"></div> Masc.</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-pink-500 rounded-full"></div> Fem.</div>
      </div>
    </div>
  );
};

// --- DASHBOARD VIEW ---
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

  // 2. POBLACIÓN REFERENCIA
  let poblacionReferencia = 0;
  if (filterDept && !filterMuni) {
    poblacionReferencia = CENSOS_2024[filterDept]?.poblacion || 0;
  } else if (filterDept && filterMuni) {
    poblacionReferencia = 0; 
  } else {
    poblacionReferencia = Object.values(CENSOS_2024).reduce((acc: number, curr: any) => acc + (curr.poblacion || 0), 0);
  }

  // 3. INDICADORES
  const totalInfraestructuras = filteredData.length;
  const beneficiariosHombres = filteredData.reduce((acc, curr) => acc + (curr.hombres || 0), 0);
  const beneficiariosMujeres = filteredData.reduce((acc, curr) => acc + (curr.mujeres || 0), 0);
  const totalBeneficiarios = beneficiariosHombres + beneficiariosMujeres;
  const tasaCobertura = poblacionReferencia > 0 ? ((totalBeneficiarios / poblacionReferencia) * 100).toFixed(2) : "N/A";

  const countByKey = (key: keyof Academia) => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => { 
        const val = item[key] ? String(item[key]) : 'No definido'; 
        counts[val] = (counts[val] || 0) + 1; 
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const mapData = filteredData.map(a => ({
    id: a.id, nombre: a.nombre, lat: a.lat, lng: a.lng, deporte: a.deporte,
    infraestructura: a.infraestructura, usuarios: a.usuarios, municipio: a.municipio, 
    departamento: a.departamento, usos: a.usos 
  }));

  return (
    <div className="h-full w-full bg-slate-950 p-6 overflow-y-auto pb-40 font-sans text-slate-200">
      
      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Activity className="text-blue-500"/> MONITOREO ESTRATÉGICO
                </h2>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
                    Nivel de Análisis: {filterDist ? 'Distrital' : filterMuni ? 'Municipal' : filterDept ? 'Departamental' : 'Nacional'}
                </p>
            </div>
            
            {/* KPI DEMOGRÁFICO */}
            <div className="flex gap-8 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
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

        {/* FILTROS */}
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
            
            {/* KPIS PRINCIPALES */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Infraestructuras</p>
                    <p className="text-3xl font-light text-white mt-1">{totalInfraestructuras}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10"><UserCheck size={40}/></div>
                   <p className="text-[10px] text-blue-400 uppercase font-bold">Total Hombres</p>
                   <p className="text-2xl font-light text-white mt-1">{beneficiariosHombres.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10"><UserCheck size={40}/></div>
                   <p className="text-[10px] text-pink-400 uppercase font-bold">Total Mujeres</p>
                   <p className="text-2xl font-light text-white mt-1">{beneficiariosMujeres.toLocaleString()}</p>
                </div>
            </div>

            {/* PIRÁMIDE POBLACIONAL */}
            <AgePyramid data={filteredData} />

            {/* TABLAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                    <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider flex gap-2 border-b border-slate-800 pb-2"><Trophy size={14} className="text-yellow-500"/> Por Disciplina</h3>
                    {countByKey('deporte').slice(0, 5).map(([name, count]) => (
                        <StatBar key={name} label={name} value={count} total={totalInfraestructuras} color="bg-yellow-600"/>
                    ))}
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                    <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-wider flex gap-2 border-b border-slate-800 pb-2"><Building size={14} className="text-blue-500"/> Por Infraestructura</h3>
                    {countByKey('infraestructura').slice(0, 5).map(([name, count]) => (
                        <StatBar key={name} label={name} value={count} total={totalInfraestructuras} color="bg-blue-600"/>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMNA 2: GEORREFERENCIACIÓN */}
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg shadow-lg">
                <div className="bg-slate-950 p-2 border-b border-slate-800 mb-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2"><MapIcon size={12}/> Mapa Territorial</p>
                </div>
                <div className="h-72 w-full rounded overflow-hidden relative bg-slate-950">
                    <MapWithNoSSR data={mapData} isAddingMode={false} onMapClick={()=>{}}/>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
                <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex gap-2"><BarChart3 size={14} className="text-green-500"/> Gestión / Uso</h3>
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
  
  // ESTADO NUEVO: Controla si el usuario está en la lista blanca
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const [view, setView] = useState<'MAP' | 'STATS'>('MAP');

  useEffect(() => {
    // 1. Verificar Sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) checkUserAuthorization(session.user.email);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
            checkUserAuthorization(session.user.email);
        } else {
            setIsAuthorized(false); // Reset al salir
        }
    });
    
    // 2. Cargar Datos
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
              usos: d.usos || 'No definido',
              hombres: d.hombres || 0,
              mujeres: d.mujeres || 0,
              usuarios: d.usuarios || 0,
              hombres_0_12: d.hombres_0_12 || 0,
              mujeres_0_12: d.mujeres_0_12 || 0,
              hombres_13_29: d.hombres_13_29 || 0,
              mujeres_13_29: d.mujeres_13_29 || 0,
              hombres_30_mas: d.hombres_30_mas || 0,
              mujeres_30_mas: d.mujeres_30_mas || 0,
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

  // FUNCIÓN NUEVA: Verifica en Supabase si el correo tiene permiso
  const checkUserAuthorization = async (email: string | undefined) => {
      if (!email) return;
      
      const { count, error } = await supabase
        .from('allowed_users')
        .select('*', { count: 'exact', head: true }) // Solo cuenta, no baja datos
        .eq('email', email);

      if (!error && count && count > 0) {
          setIsAuthorized(true);
      } else {
          setIsAuthorized(false);
      }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const mapData = academias.map(a => ({
      id: a.id,
      nombre: a.nombre,
      lat: a.lat,
      lng: a.lng,
      deporte: a.deporte,
      infraestructura: a.infraestructura,
      usuarios: a.usuarios,
      municipio: a.municipio,
      departamento: a.departamento,
      usos: a.usos 
  }));

  return (
    <main className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* SIDEBAR (Ahora oculto en móvil con hidden md:flex) */}
      <aside className="hidden md:flex w-72 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col z-50 shadow-2xl">
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
              
              {/* LÓGICA DE PROTECCIÓN VISUAL */}
              {isAuthorized ? (
                  <button onClick={() => router.push('/registro')} className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 transition-all border border-blue-500/50 text-sm">
                    <Plus size={16}/> REGISTRAR INFRAESTRUCTURA
                  </button>
              ) : (
                  <div className="w-full bg-slate-800/50 p-3 rounded-lg border border-red-900/30 text-center">
                      <div className="flex justify-center text-red-500 mb-1"><Lock size={16}/></div>
                      <p className="text-xs text-slate-300 font-bold">Modo Lectura</p>
                      <p className="text-[9px] text-slate-500 mt-1">No tienes permisos para registrar nuevos datos.</p>
                  </div>
              )}
            </div>
          )}

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

      <div className="flex-1 relative bg-slate-950 flex flex-col h-full">
         {/* Área Principal de Contenido */}
         <div className="flex-1 relative overflow-hidden">
             {view === 'MAP' ? <MapWithNoSSR data={mapData} isAddingMode={false} onMapClick={() => {}} /> : <DashboardView data={academias} />}
         </div>
         {/* Espaciador inferior para que la barra móvil no tape contenido */}
         <div className="h-16 md:hidden"></div>
      </div>

      {/* NUEVA: BARRA INFERIOR MÓVIL (Solo visible en celular) */}
      <div className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around items-center p-3 z-50 pb-safe shadow-2xl">
          <button onClick={() => setView('MAP')} className={`flex flex-col items-center gap-1 ${view === 'MAP' ? 'text-blue-500' : 'text-slate-500'}`}>
              <MapIcon size={24} />
              <span className="text-[10px] font-bold">Mapa</span>
          </button>
          
          {/* Botón Central de Acción Flotante */}
          {session && isAuthorized ? (
             <button onClick={() => router.push('/registro')} className="bg-blue-600 p-3 rounded-full -mt-8 shadow-lg shadow-blue-900/50 border-4 border-slate-950 text-white">
                 <Plus size={28} />
             </button>
          ) : (
             <button onClick={session ? handleLogout : handleLogin} className="bg-slate-800 p-3 rounded-full -mt-8 shadow-lg border-4 border-slate-950 text-slate-400">
                 {session ? <LogOut size={24}/> : <UserCheck size={24}/>}
             </button>
          )}

          <button onClick={() => setView('STATS')} className={`flex flex-col items-center gap-1 ${view === 'STATS' ? 'text-blue-500' : 'text-slate-500'}`}>
              <LayoutDashboard size={24} />
              <span className="text-[10px] font-bold">Datos</span>
          </button>
      </div>

    </main>
  );
}