'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { Academia } from '../components/Map';
import { 
  LayoutDashboard, 
  MapPin, 
  BarChart3, 
  Plus, 
  UserCircle, 
  Search,
  Filter,
  Map as MapIcon,
  ChevronRight,
  Database,
  Users
} from 'lucide-react';

const MapWithNoSSR = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-full w-full bg-slate-900 text-white font-medium">Cargando Sistema Nacional...</div>
});

const DEPORTES = ['Fútbol', 'Baloncesto', 'Natación', 'Artes Marciales', 'Voleibol', 'Atletismo', 'Otros'];
const INFRA = ['Estadio', 'Cancha Sintética', 'Cancha Natural', 'Gimnasio Techado', 'Complejo Deportivo', 'Espacio Público'];

// --- BASE DE DATOS REAL (CENSO 2024) ---
// Estructura Jerárquica: Dept -> Muni -> Dist -> Población
const POBLACION_DATA: any = {
  "Ahuachapán": { "poblacion": 348880, "municipios": { "Ahuachapán Centro": { "poblacion": 180913, "distritos": { "Ahuachapán": 127301, "Apaneca": 9436, "Concepción de Ataco": 12968, "Tacuba": 31208 } }, "Ahuachapán Norte": { "poblacion": 65290, "distritos": { "Atiquizaya": 34209, "El Refugio": 9827, "San Lorenzo": 11132, "Turín": 10122 } }, "Ahuachapán Sur": { "poblacion": 102677, "distritos": { "Guaymango": 21607, "Jujutla": 27415, "San Francisco Menéndez": 44906, "San Pedro Puxtla": 8749 } } } },
  "Santa Ana": { "poblacion": 552938, "municipios": { "Santa Ana Centro": { "poblacion": 250760, "distritos": { "Santa Ana": 250760 } }, "Santa Ana Este": { "poblacion": 63958, "distritos": { "Coatepeque": 36371, "El Congo": 27587 } }, "Santa Ana Norte": { "poblacion": 90056, "distritos": { "Masahuat": 2762, "Metapán": 63763, "Santa Rosa Guachipilín": 4260, "Texistepeque": 19271 } }, "Santa Ana Oeste": { "poblacion": 148164, "distritos": { "Candelaria de La Frontera": 23229, "Chalchuapa": 74025, "El Porvenir": 12721, "San Antonio Pajonal": 3168, "San Sebastián Salitrillo": 30004, "Santiago de La Frontera": 5017 } } } },
  "Sonsonate": { "poblacion": 470455, "municipios": { "Sonsonate Centro": { "poblacion": 149482, "distritos": { "Nahulingo": 10199, "San Antonio del Monte": 31533, "Santo Domingo de Guzmán": 7291, "Sonsonate": 72233, "Sonzacate": 28226 } }, "Sonsonate Este": { "poblacion": 166110, "distritos": { "Armenia": 35926, "Caluco": 10330, "Cuisnahuat": 12421, "Izalco": 77529, "San Julián": 19591, "Santa Isabel Ishuatán": 10313 } }, "Sonsonate Norte": { "poblacion": 99556, "distritos": { "Juayúa": 24344, "Nahuizalco": 55641, "Salcoatitán": 7504, "Santa Catarina Masahuat": 12067 } }, "Sonsonate Oeste": { "poblacion": 55307, "distritos": { "Acajutla": 55307 } } } },
  "Chalatenango": { "poblacion": 185930, "municipios": { "Chalatenango Centro": { "poblacion": 85829, "distritos": { "Agua Caliente": 7341, "Dulce Nombre de María": 4708, "El Paraíso": 11622, "La Reina": 7583, "Nueva Concepción": 27209, "San Fernando": 2512, "San Francisco Morazán": 3036, "San Rafael": 3964, "Santa Rita": 4298, "Tejutla": 13556 } }, "Chalatenango Norte": { "poblacion": 26806, "distritos": { "Citalá": 4581, "La Palma": 13066, "San Ignacio": 9159 } }, "Chalatenango Sur": { "poblacion": 73295, "distritos": { "Arcatao": 2252, "Azacualpa": 1053, "Cancasque": 1907, "Chalatenango": 30679, "Comalapa": 4136, "Concepción Quezaltepeque": 6011, "El Carrizal": 2235, "La Laguna": 3988, "Las Flores": 1301, "Las Vueltas": 1609, "Nombre de Jesús": 4017, "Nueva Trinidad": 1672, "Ojos de Agua": 3023, "Potonico": 1766, "San Antonio de La Cruz": 1747, "San Antonio Los Ranchos": 1009, "San Francisco Lempa": 774, "San Isidro Labrador": 586, "San Luis del Carmen": 1038, "San Miguel de Mercedes": 2492 } } } },
  "La Libertad": { "poblacion": 765879, "municipios": { "La Libertad Centro": { "poblacion": 162760, "distritos": { "Ciudad Arce": 65550, "San Juan Opico": 97210 } }, "La Libertad Costa": { "poblacion": 85917, "distritos": { "Chiltiupán": 10914, "Jicalapa": 6312, "La Libertad": 44761, "Tamanique": 14068, "Teotepeque": 9862 } }, "La Libertad Este": { "poblacion": 108097, "distritos": { "Antiguo Cuscatlán": 37451, "Huizúcar": 12287, "Nuevo Cuscatlán": 12699, "San José Villanueva": 19150, "Zaragoza": 26510 } }, "La Libertad Norte": { "poblacion": 88356, "distritos": { "Quezaltepeque": 62572, "San Matías": 7074, "San Pablo Tacachico": 18710 } }, "La Libertad Oeste": { "poblacion": 182512, "distritos": { "Colón": 130513, "Jayaque": 16391, "Sacacoyo": 15915, "Talnique": 5596, "Tepecoyo": 14097 } }, "La Libertad Sur": { "poblacion": 138237, "distritos": { "Comasagua": 12705, "Santa Tecla": 125532 } } } },
  "San Salvador": { "poblacion": 1563371, "municipios": { "San Salvador Centro": { "poblacion": 673319, "distritos": { "Ayutuxtepeque": 31631, "Ciudad Delgado": 106367, "Cuscatancingo": 68137, "Mejicanos": 136641, "San Salvador": 330543 } }, "San Salvador Este": { "poblacion": 496761, "distritos": { "Ilopango": 88824, "San Martín": 87931, "Soyapango": 230255, "Tonacatepeque": 89751 } }, "San Salvador Norte": { "poblacion": 61864, "distritos": { "Aguilares": 21051, "El Paisnal": 15469, "Guazapa": 25344 } }, "San Salvador Oeste": { "poblacion": 164756, "distritos": { "Apopa": 129083, "Nejapa": 35673 } }, "San Salvador Sur": { "poblacion": 166671, "distritos": { "Panchimalco": 44404, "Rosario de Mora": 12993, "San Marcos": 57094, "Santiago Texacuangos": 20081, "Santo Tomás": 32099 } } } },
  "Cuscatlán": { "poblacion": 244901, "municipios": { "Cuscatlán Norte": { "poblacion": 99591, "distritos": { "Oratorio de Concepción": 3748, "San Bartolomé Perulapía": 7681, "San José Guayabal": 14032, "San Pedro Perulapán": 51414, "Suchitoto": 22716 } }, "Cuscatlán Sur": { "poblacion": 145310, "distritos": { "Candelaria": 11307, "Cojutepeque": 46839, "El Carmen": 15961, "El Rosario": 3639, "Monte San Juan": 12239, "San Cristobal": 9497, "San Rafael Cedros": 16303, "San Ramón": 6516, "Santa Cruz Analquito": 2409, "Santa Cruz Michapa": 13893, "Tenancingo": 6707 } } } },
  "La Paz": { "poblacion": 318374, "municipios": { "La Paz Centro": { "poblacion": 117548, "distritos": { "El Rosario": 17551, "Jerusalén": 2586, "Mercedes La Ceiba": 632, "Paraíso de Osorio": 2607, "San Antonio Masahuat": 3949, "San Emigdio": 2779, "San Juan Tepezontes": 3758, "San Luis La Herradura": 20542, "San Miguel Tepezontes": 5594, "San Pedro Nonualco": 9443, "Santa María Ostuma": 5853, "Santiago Nonualco": 42254 } }, "La Paz Este": { "poblacion": 92118, "distritos": { "San Juan Nonualco": 18068, "San Rafael Obrajuelo": 9566, "Zacatecoluca": 64484 } }, "La Paz Oeste": { "poblacion": 108708, "distritos": { "Cuyultitán": 6313, "Olocuilta": 30989, "San Francisco Chinameca": 7481, "San Juan Talpa": 7666, "San Luis Talpa": 24036, "San Pedro Masahuat": 28512, "Tapalhuaca": 3711 } } } },
  "Cabañas": { "poblacion": 143049, "municipios": { "Cabañas Este": { "poblacion": 68054, "distritos": { "Villa Dolores": 6267, "Guacotecti": 7585, "San Isidro": 7333, "Sensuntepeque": 35916, "Victoria": 10953 } }, "Cabañas Oeste": { "poblacion": 74995, "distritos": { "Cinquera": 2096, "Ilobasco": 58581, "Jutiapa": 7129, "Tejutepeque": 7189 } } } },
  "San Vicente": { "poblacion": 161857, "municipios": { "San Vicente Norte": { "poblacion": 62613, "distritos": { "Apastepeque": 19646, "San Esteban Catarina": 6128, "San Ildefonso": 7233, "San Lorenzo": 5144, "San Sebastián": 12781, "Santa Clara": 5214, "Santo Domingo": 6467 } }, "San Vicente Sur": { "poblacion": 99244, "distritos": { "Guadalupe": 5851, "San Cayetano Istepeque": 4184, "San Vicente": 52461, "Tecoluca": 26656, "Tepetitán": 3869, "Verapaz": 6223 } } } },
  "Usulután": { "poblacion": 325494, "municipios": { "Usulután Este": { "poblacion": 149297, "distritos": { "California": 2619, "Concepción Batres": 10840, "Ereguayquín": 6618, "Jucuarán": 12722, "Ozatlán": 10497, "San Dionisio": 3676, "Santa Elena": 16051, "Santa María": 12780, "Tecapán": 7369, "Usulután": 66125 } }, "Usulután Norte": { "poblacion": 108523, "distritos": { "Alegría": 12294, "Berlín": 20683, "El Triunfo": 7099, "Estanzuelas": 7761, "Jucuapa": 17696, "Mercedes Umaña": 12547, "Nueva Granada": 7278, "San Buena Ventura": 5225, "Santiago de María": 17940 } }, "Usulután Oeste": { "poblacion": 67674, "distritos": { "Jiquilisco": 44271, "Puerto El Triunfo": 12983, "San Agustín": 5276, "San Francisco Javier": 5144 } } } },
  "San Miguel": { "poblacion": 447634, "municipios": { "San Miguel Centro": { "poblacion": 290274, "distritos": { "Chirilagua": 19368, "Comacarán": 3451, "Moncagua": 24167, "Quelepa": 7062, "San Miguel": 232887, "Uluazapa": 3339 } }, "San Miguel Norte": { "poblacion": 72035, "distritos": { "Carolina": 6419, "Chapeltique": 11295, "Ciudad Barrios": 23256, "Nuevo Edén de San Juan": 3791, "San Antonio": 5941, "San Gerardo": 5644, "San Luis de La Reina": 5561, "Sesori": 10128 } }, "San Miguel Oeste": { "poblacion": 85325, "distritos": { "Chinameca": 24142, "El Tránsito": 17057, "Lolotique": 15007, "Nueva Guadalupe": 7747, "San Jorge": 9414, "San Rafael Oriente": 11958 } } } },
  "Morazán": { "poblacion": 169784, "municipios": { "Morazán Norte": { "poblacion": 55667, "distritos": { "Arambala": 3861, "Cacaopera": 10488, "Corinto": 14847, "El Rosario": 1310, "Joateca": 3831, "Jocoaitique": 4253, "Meanguera": 6720, "Perquín": 2564, "San Fernando": 1900, "San Isidro": 2811, "Torola": 3082 } }, "Morazán Sur": { "poblacion": 114117, "distritos": { "Chilanga": 9610, "Delicias de Concepción": 4621, "El Divisadero": 7177, "Gualococti": 4263, "Guatajiagua": 10237, "Jocoro": 9658, "Lolotiquillo": 4592, "Osicala": 9177, "San Carlos": 4530, "San Francisco Gotera": 20330, "San Simón": 11205, "Sensembra": 2602, "Sociedad": 9963, "Yamabal": 3010, "Yoloaiquín": 3142 } } } },
  "La Unión": { "poblacion": 224375, "municipios": { "La Unión Norte": { "poblacion": 107540, "distritos": { "Anamorós": 14210, "Bolívar": 3482, "Concepción de Oriente": 7042, "El Sauce": 6506, "Lislique": 12732, "Nueva Esparta": 8638, "Pasaquina": 15286, "Polorós": 8750, "San José": 2544, "Santa Rosa de Lima": 28350 } }, "La Unión Sur": { "poblacion": 116835, "distritos": { "Conchagua": 24919, "El Carmen": 13611, "Intipucá": 6785, "La Unión": 40129, "Meanguera del Golfo": 2134, "San Alejo": 17269, "Yayantique": 5847, "Yucuaiquín": 6141 } } } }
};

export default function Home() {
  const [academias, setAcademias] = useState<Academia[]>([]);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [tempCoords, setTempCoords] = useState<{lat: number, lng: number} | null>(null);
  
  // --- ESTADO DE FILTROS GEOGRÁFICOS ---
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [selectedDist, setSelectedDist] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    deporte: 'Fútbol',
    infraestructura: 'Cancha Natural',
    usuarios: 0
  });

  // --- LÓGICA DE DATOS POBLACIONALES ---
  const currentPopulation = useMemo(() => {
    // Si hay Distrito seleccionado
    if (selectedDept && selectedMuni && selectedDist) {
      return POBLACION_DATA[selectedDept]?.municipios[selectedMuni]?.distritos[selectedDist] || 0;
    }
    // Si hay Municipio seleccionado
    if (selectedDept && selectedMuni) {
      return POBLACION_DATA[selectedDept]?.municipios[selectedMuni]?.poblacion || 0;
    }
    // Si hay Departamento seleccionado
    if (selectedDept) {
      return POBLACION_DATA[selectedDept]?.poblacion || 0;
    }
    // Total Nacional (Suma de todos los deptos)
    return Object.values(POBLACION_DATA).reduce((acc: number, curr: any) => acc + curr.poblacion, 0);
  }, [selectedDept, selectedMuni, selectedDist]);

  const handleMapClick = (lat: number, lng: number) => {
    setTempCoords({ lat, lng });
    setIsAddingMode(false); 
    setShowForm(true);
  };

  const guardarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempCoords) return;

    const nuevaAcademia: Academia = {
      id: Math.floor(Math.random() * 100000),
      nombre: formData.nombre,
      deporte: formData.deporte,
      infraestructura: formData.infraestructura,
      usuarios: Number(formData.usuarios),
      lat: tempCoords.lat,
      lng: tempCoords.lng
    };

    setAcademias([...academias, nuevaAcademia]);
    setShowForm(false);
    setFormData({ nombre: '', deporte: 'Fútbol', infraestructura: 'Cancha Natural', usuarios: 0 });
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* --- COLUMNA IZQUIERDA: DASHBOARD Y TAREAS --- */}
      <aside className="w-96 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        
        {/* Header Institucional */}
        <div className="p-6 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                    <Database size={20} strokeWidth={2} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight leading-none">ONID</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistema Nacional</p>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Sección de Estadísticas Rápidas (Población Real) */}
            <div className="p-6 grid grid-cols-2 gap-3 border-b border-slate-800/50">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Registros Activos</p>
                    <p className="text-3xl font-mono font-bold text-white">{academias.length}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                       <Users size={10} /> Población (Censo)
                    </p>
                    <p className="text-2xl font-mono font-bold text-blue-400 truncate" title={currentPopulation.toLocaleString()}>
                        {currentPopulation.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">
                       {selectedDist ? 'Distrito' : selectedMuni ? 'Municipio' : selectedDept ? 'Departamento' : 'Nacional'}
                    </p>
                </div>
            </div>

            {/* Menú de Navegación */}
            <div className="px-4 py-6 space-y-1">
                <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Herramientas</p>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-lg font-medium text-sm transition-all hover:bg-blue-600/20">
                    <LayoutDashboard size={18} /> Dashboard General
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium text-sm transition-all">
                    <BarChart3 size={18} /> Estadísticas Avanzadas
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium text-sm transition-all">
                    <Search size={18} /> Búsqueda de Activos
                </button>
            </div>

            {/* FILTROS GEOGRÁFICOS REALES */}
            <div className="px-6 pb-6">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <Filter size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Filtros Territoriales</span>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Departamento */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Departamento</label>
                            <select 
                                value={selectedDept}
                                onChange={(e) => { 
                                  setSelectedDept(e.target.value); 
                                  setSelectedMuni(''); 
                                  setSelectedDist('');
                                }}
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2.5 outline-none focus:border-blue-500"
                            >
                                <option value="">Nacional (Todos)</option>
                                {Object.keys(POBLACION_DATA).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* Municipio (Reactivo) */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Municipio</label>
                            <select 
                                value={selectedMuni}
                                onChange={(e) => {
                                  setSelectedMuni(e.target.value);
                                  setSelectedDist('');
                                }}
                                disabled={!selectedDept}
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
                            >
                                <option value="">Todos los Municipios</option>
                                {selectedDept && Object.keys(POBLACION_DATA[selectedDept].municipios).map(m => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Distrito (Reactivo) */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Distrito</label>
                            <select 
                                value={selectedDist}
                                onChange={(e) => setSelectedDist(e.target.value)}
                                disabled={!selectedMuni}
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
                            >
                                <option value="">Todos los Distritos</option>
                                {selectedDept && selectedMuni && Object.keys(POBLACION_DATA[selectedDept].municipios[selectedMuni].distritos).map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón de Agregar */}
            <div className="px-6 mb-6 mt-auto">
                 <button 
                    onClick={() => setIsAddingMode(!isAddingMode)}
                    className={`w-full py-4 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 border
                    ${isAddingMode 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse' 
                        : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500'}`}
                >
                    {isAddingMode ? (
                        <>📍 Seleccione punto en mapa...</>
                    ) : (
                        <>
                            <Plus size={18} strokeWidth={3} /> Agregar Registro
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Footer Usuario */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                 <UserCircle size={18} className="text-slate-400" />
             </div>
             <div className="flex-1">
                 <p className="text-xs font-bold text-white">Admin. Nacional</p>
                 <p className="text-[10px] text-green-500">Conectado</p>
             </div>
        </div>
      </aside>

      {/* --- COLUMNA DERECHA: MAPA --- */}
      <div className="flex-1 relative h-full bg-slate-900">
        
        {/* Barra Superior del Mapa (Breadcrumbs Dinámicos) */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-[500] flex items-center px-4 justify-between">
            <div className="flex items-center text-xs text-slate-400 gap-2">
                <MapIcon size={14} />
                <span>Vista Satelital</span>
                <ChevronRight size={12} />
                <span className="text-white font-medium">El Salvador</span>
                {selectedDept && <><ChevronRight size={12} /> <span className="text-white font-medium">{selectedDept}</span></>}
                {selectedMuni && <><ChevronRight size={12} /> <span className="text-white font-medium">{selectedMuni}</span></>}
                {selectedDist && <><ChevronRight size={12} /> <span className="text-white font-medium text-blue-400">{selectedDist}</span></>}
            </div>
            <div className="flex gap-3">
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">CENSO 2024</span>
            </div>
        </div>

        <MapWithNoSSR 
            data={academias} 
            isAddingMode={isAddingMode}
            onMapClick={handleMapClick}
        />

        {/* --- FORMULARIO MODAL --- */}
        {showForm && (
            <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-950 p-5 flex justify-between items-center border-b border-slate-800">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Plus size={18} className="text-blue-500"/> Nueva Instalación
                        </h3>
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            COORD: {tempCoords?.lat.toFixed(4)}, {tempCoords?.lng.toFixed(4)}
                        </div>
                    </div>
                    
                    <form onSubmit={guardarRegistro} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Lugar</label>
                            <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="Ej. Estadio Cuscatlán"
                                value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Disciplina</label>
                                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                    value={formData.deporte} onChange={(e) => setFormData({...formData, deporte: e.target.value})}>
                                    {DEPORTES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuarios</label>
                                <input required type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                    value={formData.usuarios} onChange={(e) => setFormData({...formData, usuarios: parseInt(e.target.value)})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Infraestructura</label>
                            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                                value={formData.infraestructura} onChange={(e) => setFormData({...formData, infraestructura: e.target.value})}>
                                {INFRA.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={() => setShowForm(false)} 
                                className="flex-1 py-3 bg-transparent border border-slate-700 text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" 
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all">
                                Guardar Registro
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}