'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { CENSOS_2024 } from '../lib/censos'; 
import { 
  Database, Plus, Map as MapIcon, Activity, Trophy, Filter, LogOut, CheckCircle, 
  Users, Building, Loader2, BarChart3, Home as HomeIcon, 
  UserCheck, LayoutDashboard, Settings, Globe, PieChart
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';

// --- INTERFAZ ACTUALIZADA (Con desglose por edad) ---
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

  // Desglose Demográfico Nuevo
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

// --- CONSTANTES ---
const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Patinaje', 'Béisbol', 'Softbol', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público', 'Pista', 'Piscinas', 'Cancha de Baloncesto'];
const USOS = ['Recreativo', 'Entrenamiento', 'Alto Rendimiento', 'Competencia Local', 'Escolar', 'Comunitario', 'Privado'];

// --- SIMULACIÓN AVANZADA ---
const generarDatosSimulados = async () => {
  const confirmacion = confirm("⚠️ ESTO GENERARÁ NUEVOS DATOS.\n\nSe insertarán 20 registros con desglose por EDAD y GÉNERO.\n¿Deseas continuar?");
  if (!confirmacion) return;

  const deptosKeys = Object.keys(CENSOS_2024);
  const payloads = [];

  for (let i = 0; i < 20; i++) {
    const randomDept = deptosKeys[Math.floor(Math.random() * deptosKeys.length)];
    const munisKeys = Object.keys(CENSOS_2024[randomDept].municipios);
    const randomMuni = munisKeys[Math.floor(Math.random() * munisKeys.length)];
    const distritosList = CENSOS_2024[randomDept].municipios[randomMuni].distritos;
    const randomDist = distritosList[Math.floor(Math.random() * distritosList.length)];
    
    // Coordenadas
    const latBase = 13.7 + (Math.random() * 0.3 - 0.15);
    const lngBase = -89.2 + (Math.random() * 1.5 - 0.75);

    // Generación demográfica detallada
    const h_0_12 = Math.floor(Math.random() * 150);
    const m_0_12 = Math.floor(Math.random() * 150);
    const h_13_29 = Math.floor(Math.random() * 200);
    const m_13_29 = Math.floor(Math.random() * 200);
    const h_30_mas = Math.floor(Math.random() * 100);
    const m_30_mas = Math.floor(Math.random() * 100);

    // Cálculos automáticos de totales
    const totalHombres = h_0_12 + h_13_29 + h_30_mas;
    const totalMujeres = m_0_12 + m_13_29 + m_30_mas;

    payloads.push({
      nombre: `Instalación Deportiva ${randomDist} #${i+1}`,
      lat: latBase,
      lng: lngBase,
      deporte: DEPORTES[Math.floor(Math.random() * DEPORTES.length)],
      infraestructura: INFRA[Math.floor(Math.random() * INFRA.length)],
      usos: USOS[Math.floor(Math.random() * USOS.length)],
      
      // Datos Demográficos Nuevos
      hombres_0_12: h_0_12,
      mujeres_0_12: m_0_12,
      hombres_13_29: h_13_29,
      mujeres_13_29: m_13_29,
      hombres_30_mas: h_30_mas,
      mujeres_30_mas: m_30_mas,

      hombres: totalHombres,
      mujeres: totalMujeres,
      usuarios: totalHombres + totalMujeres,
      
      departamento: randomDept,
      municipio: randomMuni,
      distrito: randomDist,
      responsable: "Simulación Cooperación",
      objetivos: "Registro con desglose etario generado automáticamente."
    });
  }

  const { error } = await supabase.from('academias').insert(payloads);
  if (error) alert("Error al simular: " + error.message);
  else {
    alert("✅ Datos demográficos generados. Recargando...");
    window.location.reload();
  }
};

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

// --- NUEVO COMPONENTE: PIRÁMIDE POBLACIONAL ---
const AgePyramid = ({ data }: { data: Academia[] }) => {
  // Sumarizar datos
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

            {/* --- NUEVA SECCIÓN: PIRÁMIDE POBLACIONAL --- */}
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
              usos: d.usos || 'No definido',
              
              // Mapeo seguro de los nuevos datos
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
              
              <button onClick={() => router.push('/registro')} className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20 transition-all border border-blue-500/50 text-sm">
                <Plus size={16}/> REGISTRAR INFRAESTRUCTURA
              </button>

              <button onClick={generarDatosSimulados} className="w-full bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-xs text-slate-400 flex justify-center items-center gap-2 border border-slate-700 border-dashed">
                <Settings size={12}/> Generar Datos de Prueba
              </button>
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

      <div className="flex-1 relative bg-slate-950">
        {view === 'MAP' ? <MapWithNoSSR data={mapData} isAddingMode={false} onMapClick={() => {}} /> : <DashboardView data={academias} />}
      </div>
    </main>
  );
}