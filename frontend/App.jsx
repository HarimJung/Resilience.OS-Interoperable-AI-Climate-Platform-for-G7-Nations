import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, MessageSquareText, Settings, Bell, Search, 
  ChevronRight, Send, Globe, Database, MapPin, UploadCloud, Download, Layers, 
  Zap, Truck, Sprout, ThermometerSun, AlertTriangle, Activity, 
  Calendar, Eye, X, RefreshCw, CreditCard, Scale, Loader, 
  Sun, Wind, Droplets, Anchor, Gavel, Wallet, FileText, CheckCircle2, ArrowUpRight, Filter, Share2, BookOpen
} from 'lucide-react';

// --- 설정 (Configuration) ---
const GEO_CONFIG = {
  'Toronto': { country: 'Canada', flag: '🇨🇦', code: 'CA', lat: 43.70, lon: -79.42 },
  'Vancouver': { country: 'Canada', flag: '🇨🇦', code: 'CA', lat: 49.25, lon: -123.12 },
  'Berlin': { country: 'Germany', flag: '🇩🇪', code: 'DE', lat: 52.52, lon: 13.41 },
  'Paris': { country: 'France', flag: '🇫🇷', code: 'FR', lat: 48.85, lon: 2.35 },
  
};

// 시나리오 설정
const SCENARIO_CONFIG = {
  'Agri': { 
    id: 'Agri', label: 'Agri-Food Security', icon: Sprout, theme: 'emerald',
    metrics: ['Soil Moisture', 'Precipitation', 'Crop Stress'], 
    tableColumns: [ 
        { key: 'date', label: 'Date' },
        { key: 'soil', label: 'Soil Moist', unit: '%', color: 'emerald' },
        { key: 'soilTemp', label: 'Soil Temp', unit: '°C' },
        { key: 'rain', label: 'Precip', unit: 'mm', color: 'blue' },
        { key: 'temp', label: 'Air Temp', unit: '°C' }
    ]
  },
  'Energy': { 
    id: 'Energy', label: 'Energy Grid Resilience', icon: Zap, theme: 'amber', 
    metrics: ['Grid Load', 'Solar Output', 'Frequency'],
    tableColumns: [
        { key: 'date', label: 'Date' },
        { key: 'solar', label: 'Solar Rad', unit: 'MJ/m²', color: 'amber' },
        { key: 'cloud', label: 'Cloud Cover', unit: '%' },
        { key: 'wind', label: 'Wind Speed', unit: 'km/h', color: 'blue' },
        { key: 'temp', label: 'Air Temp', unit: '°C' }
    ]
  },
  'Supply': { 
    id: 'Supply', label: 'Supply Chain Logistics', icon: Truck, theme: 'blue',
    metrics: ['Port Status', 'Wind Gusts', 'Throughput'],
    tableColumns: [
        { key: 'date', label: 'Date' },
        { key: 'gust', label: 'Max Gusts', unit: 'km/h', color: 'purple' },
        { key: 'wind', label: 'Avg Wind', unit: 'km/h' },
        { key: 'snow', label: 'Snowfall', unit: 'cm', color: 'blue' },
        { key: 'temp', label: 'Freeze Check', unit: '°C' }
    ]
  },
  'Health': { 
    id: 'Health', label: 'Urban Health & Safety', icon: ThermometerSun, theme: 'rose', 
    metrics: ['Wet Bulb Temp', 'Air Quality', 'ER Visits'],
    tableColumns: [
        { key: 'date', label: 'Date' },
        { key: 'feel', label: 'Real Feel', unit: '°C', color: 'rose' },
        { key: 'temp', label: 'Actual Temp', unit: '°C' },
        { key: 'rain', label: 'Humidity Factor', unit: 'mm' },
        { key: 'solar', label: 'UV Proxy', unit: 'MJ' }
    ]
  }
};

// 정책 DB (RAG 로딩 전 보여줄 기본값)
const FULL_POLICY_DB = [
  { id: 'GL-01', country: 'Global', tags: ['agri', 'food'], title: 'UN Zero Hunger Challenge (SDG 2)', type: 'Goal', year: '2015', desc: 'Global initiative to end hunger.', excerpt: 'Target 2.4: Ensure sustainable food production systems.' },
  { id: 'CA-A1', country: 'Canada', tags: ['agri', 'strategy', 'budget'], title: 'Sustainable Canadian Agricultural Partnership', type: 'Framework', year: '2023', desc: '$3.5B agreement for agri-resilience.', excerpt: 'Clause 4.2: $250M allocated for Resilient Agricultural Landscape Program.' },
  { id: 'CA-A2', country: 'Canada', tags: ['agri', 'law'], title: 'Canada Grain Act Modernization', type: 'Legislation', year: '2021', desc: 'Grain quality assurance protocols.', excerpt: 'Section 12: Emergency grain storage protocols during extreme weather.' },
  { id: 'DE-E1', country: 'Germany', tags: ['energy', 'law'], title: 'Renewable Energy Sources Act (EEG 2023)', type: 'Legislation', year: '2023', desc: 'Eco-power expansion instrument.', excerpt: 'Para 8: Priority feed-in for renewables established as public security matter.' },
  { id: 'FR-H1', country: 'France', tags: ['health', 'heat'], title: 'Plan National Canicule', type: 'Protocol', year: '2023', desc: 'Heat wave management levels.', excerpt: 'Level 3 (Orange): Mandatory cooling center activation in urban zones.' }
];

const G7PolicyCoPilot = () => {
  const [selectedCity, setSelectedCity] = useState('Toronto');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeScenario, setActiveScenario] = useState('Agri');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real Data State (API)
  const [scenarioData, setScenarioData] = useState(null); 
  const [rawData, setRawData] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat & AI State
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([{
    id: 1, 
    sender: 'ai', 
    type: 'text', 
    content: '시스템이 정상 가동되었습니다. 실시간 API 데이터 수신 중입니다. "예산" 또는 "법률" 관련 질문이 가능합니다.'
  }]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // AI Briefing State
  const [aiBriefing, setAiBriefing] = useState({ 
    mode: 'DATA', 
    title: 'Analyzing Telemetry...',
    signal: 'Waiting for API...', 
    status: 'SYNCING', 
    action: 'Standby',
    policyMatch: null
  });
  
  const messagesEndRef = useRef(null);
  const currentCity = GEO_CONFIG[selectedCity];
  const currentScenario = SCENARIO_CONFIG[activeScenario];
  const contextPolicies = FULL_POLICY_DB.filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // --- 1. 날씨 API 호출 (Open-Meteo) ---
  useEffect(() => {
    const fetchFullData = async () => {
      setIsLoading(true);
      
      const endDate = new Date().toISOString().split('T')[0];
      const startDateObj = new Date();
      startDateObj.setMonth(startDateObj.getMonth() - 2); 
      const startDate = startDateObj.toISOString().split('T')[0];
      
      const { lat, lon } = currentCity;

      const fields = [
        'temperature_2m_max', 'precipitation_sum', 'snowfall_sum', 'wind_speed_10m_max', 
        'soil_moisture_3_to_9cm', 'soil_temperature_0cm', 
        'shortwave_radiation_sum', 'cloud_cover_mean', 
        'wind_gusts_10m_max', 
        'apparent_temperature_max' 
      ].join(',');

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=${fields}&timezone=auto`;

      try {
        const response = await fetch(url);
        const json = await response.json();
        
        if (!json.daily) throw new Error("No data");

        const latestIdx = json.daily.time.length - 1;
        const d = json.daily;

        const mappedRaw = d.time.map((date, i) => ({
            date,
            temp: d.temperature_2m_max[i],
            rain: d.precipitation_sum[i],
            snow: d.snowfall_sum[i],
            wind: d.wind_speed_10m_max[i],
            soil: (d.soil_moisture_3_to_9cm[i] * 100).toFixed(1), 
            soilTemp: d.soil_temperature_0cm[i],
            solar: d.shortwave_radiation_sum[i],
            cloud: d.cloud_cover_mean[i],
            gust: d.wind_gusts_10m_max[i],
            feel: d.apparent_temperature_max[i]
        })).reverse();
        
        setRawData(mappedRaw); 

        const current = {
            soilMoisture: d.soil_moisture_3_to_9cm[latestIdx], 
            soilTemp: d.soil_temperature_0cm[latestIdx],
            rain: d.precipitation_sum[latestIdx],
            solarRad: d.shortwave_radiation_sum[latestIdx],
            cloud: d.cloud_cover_mean[latestIdx], 
            wind: d.wind_speed_10m_max[latestIdx],
            gust: d.wind_gusts_10m_max[latestIdx],
            snow: d.snowfall_sum[latestIdx],
            feelTemp: d.apparent_temperature_max[latestIdx],
            realTemp: d.temperature_2m_max[latestIdx]
        };
        setScenarioData(current);

        setAiBriefing(prev => {
            if (prev.mode !== 'DATA') return prev; 
            return generateDataBriefing(current, activeScenario);
        });

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullData();
  }, [selectedCity, activeScenario]);

  // --- 2. 로직 핸들러 ---
  const generateDataBriefing = (data, scenario) => {
      let signal = "";
      let status = "STABLE";
      let action = "";
      let policyMatch = FULL_POLICY_DB[0];

      if (scenario === 'Agri') {
          const isDrought = data.soilMoisture < 0.25;
          signal = `Soil Moisture: ${(data.soilMoisture * 100).toFixed(1)}%`;
          status = isDrought ? "DROUGHT ALERT" : "OPTIMAL";
          action = isDrought ? "Activate Water Subsidies" : "Monitor Crop Yields";
          policyMatch = FULL_POLICY_DB.find(p => p.tags.includes('agri')) || policyMatch;
      } else if (scenario === 'Energy') {
          const isLowSolar = data.solarRad < 10; 
          signal = `Solar Output: ${data.solarRad} MJ/m²`;
          status = isLowSolar ? "LOW GENERATION" : "PEAK OUTPUT";
          action = isLowSolar ? "Request Grid Load Shedding" : "Export Excess Power";
          policyMatch = FULL_POLICY_DB.find(p => p.tags.includes('energy')) || policyMatch;
      } else if (scenario === 'Supply') {
          const isHighWind = data.gust > 40;
          signal = `Wind Gusts: ${data.gust} km/h`;
          status = isHighWind ? "PORT RISK" : "OPERATIONAL";
          action = isHighWind ? "Halt Crane Operations" : "Standard Logistics";
          policyMatch = FULL_POLICY_DB.find(p => p.tags.includes('supply')) || policyMatch;
      } else {
          const isHeatWave = data.feelTemp > 30;
          signal = `Apparent Temp: ${data.feelTemp}°C`;
          status = isHeatWave ? "HEAT WARNING" : "SAFE";
          action = isHeatWave ? "Deploy Mobile Cooling Units" : "Public Health Monitoring";
          policyMatch = FULL_POLICY_DB.find(p => p.tags.includes('health')) || policyMatch;
      }
      return { mode: 'DATA', title: `${scenario} Protocol`, signal, status, action, policyMatch };
  };

  // [핵심] 채팅 핸들러: 백엔드(Python) 호출
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // UI 업데이트
    const userMsg = { id: Date.now(), sender: 'user', type: 'text', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    // Intent Recognition (간단한 키워드 체크는 프론트에서 즉시 반응)
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("budget") || lowerInput.includes("예산")) {
        setAiBriefing(prev => ({ ...prev, mode: 'BUDGET', title: 'Financial Review', status: 'FISCAL REVIEW', action: 'Check Reserves' }));
    } else if (lowerInput.includes("legal") || lowerInput.includes("법")) {
        setAiBriefing(prev => ({ ...prev, mode: 'LEGAL', title: 'Legal Check', status: 'LEGAL HOLD', action: 'Review Compliance' }));
    }

    // 백엔드 호출 (RAG)
    try {
        const currentCountry = GEO_CONFIG[selectedCity].country;
        
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                query: input,
                country: currentCountry,
                scenario: activeScenario
            })
        });

        const data = await response.json();

        setMessages(prev => [...prev, { 
            id: Date.now()+1, 
            sender: 'ai', 
            type: 'text', 
            content: data.answer 
        }]);

        if (data.sources && data.sources.length > 0) {
             setMessages(prev => [...prev, { 
                id: Date.now()+2, sender: 'system', type: 'info', 
                content: `🔍 참조 문서: ${data.sources.join(', ')}` 
            }]);
            
            // AI가 찾은 정책으로 브리핑 카드 업데이트
            setAiBriefing(prev => ({
                ...prev,
                policyMatch: { title: data.sources[0], excerpt: "AI found relevant policy document." }
            }));
        }

    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', type: 'error', content: "AI 서버 연결 실패 (백엔드가 켜져있나요?)" }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- UI COMPONENTS ---
  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={18} />
      <span className="font-medium text-sm hidden lg:block">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-30 flex-shrink-0">
        <div>
           <div className="h-20 flex items-center px-6 border-b border-slate-50 gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Globe size={20}/></div>
              <span className="hidden lg:block font-bold text-xl tracking-tight">GovAI<span className="text-indigo-600">.Nexus</span></span>
           </div>
           <nav className="p-4 space-y-1 mt-6">
              <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hidden lg:block">Platform</div>
              <NavItem icon={LayoutDashboard} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={Layers} label="Policy Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
              <NavItem icon={Database} label="Data Lake" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
           </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-slate-700 hidden md:block">Climate Resilience Platform</h1>
              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                 <MapPin size={16} className="text-indigo-600"/>
                 <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-transparent border-none font-bold text-slate-700 outline-none cursor-pointer">
                    {Object.keys(GEO_CONFIG).map(c => <option key={c} value={c}>{c} ({GEO_CONFIG[c].country})</option>)}
                 </select>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                 <div className="text-xs font-bold text-slate-400 uppercase">System Status</div>
                 <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1"><Activity size={10}/> API Connected</div>
              </div>
              <button className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><Bell size={18}/></button>
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">UN</div>
           </div>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
           
           {/* === DASHBOARD TAB === */}
           {activeTab === 'dashboard' && (
             <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in">
                 
                 {/* 1. SCENARIO SELECTOR */}
                 <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                         {Object.values(SCENARIO_CONFIG).map((cfg) => (
                             <button key={cfg.id} onClick={() => { setActiveScenario(cfg.id); setAiBriefing(prev => ({...prev, mode: 'DATA'})); }} 
                               className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                   activeScenario === cfg.id ? `bg-${cfg.theme}-600 text-white shadow-md` : 'text-slate-500 hover:bg-slate-50'
                               }`}>
                                 <cfg.icon size={16} /> {cfg.label}
                             </button>
                         ))}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm font-bold whitespace-nowrap">
                        <Download size={18} /> Export Report
                    </button>
                 </div>

                 {/* 2. TABLEAU CONTAINER */}
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative flex flex-col group">
                     <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm absolute w-full top-0 z-10">
                        <div className="flex items-center gap-3">
                           <span className={`w-2.5 h-2.5 rounded-full bg-${currentScenario.theme}-500 animate-pulse`}></span>
                           <span className="font-bold text-slate-700">Live View: {selectedCity}</span>
                           <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 font-mono border border-slate-200">
                             {currentScenario.metrics.join(' • ')}
                           </span>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Filter size={18}/></button>
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Share2 size={18}/></button>
                        </div>
                     </div>
                     <div className="flex-1 bg-slate-50 relative flex flex-col items-center justify-center text-center p-8 pt-20">
                        {isLoading ? (
                            <Loader className="w-12 h-12 text-slate-400 animate-spin" />
                        ) : (
                            <>
                                <div className={`p-8 rounded-full bg-${currentScenario.theme}-50 mb-6 shadow-inner`}>
                                   <currentScenario.icon className={`w-20 h-20 text-${currentScenario.theme}-500`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700">Tableau Analytics Container</h3>
                                <p className="text-slate-400 max-w-md mt-3">
                                  Visualizing real-time <strong>{activeScenario}</strong> data.<br/>
                                  (API Data: {scenarioData ? 'Loaded' : 'Waiting'})
                                </p>
                            </>
                        )}
                     </div>
                 </div>

                 {/* 3. AI STRATEGIC BRIEFING CARDS */}
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                        <MessageSquareText className="text-white" size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">AI Strategic Briefing</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* CARD 1: SIGNAL */}
                      <div className={`p-6 rounded-2xl border shadow-sm transition-all h-full ${
                          aiBriefing.mode === 'BUDGET' ? 'bg-emerald-50 border-emerald-200' :
                          aiBriefing.mode === 'LEGAL' ? 'bg-indigo-50 border-indigo-200' : 
                          'bg-white border-slate-200'
                      }`}>
                         <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${
                                aiBriefing.mode === 'BUDGET' ? 'bg-emerald-100 text-emerald-700' :
                                aiBriefing.mode === 'LEGAL' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-red-50 text-red-600'
                            }`}>
                               {aiBriefing.mode === 'BUDGET' ? <Wallet size={24}/> : aiBriefing.mode === 'LEGAL' ? <Gavel size={24}/> : <Activity size={24}/>}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-slate-100 text-slate-600">{aiBriefing.status}</span>
                         </div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">Detected Signal</div>
                         <div className="text-xl font-bold text-slate-800 mb-2">{aiBriefing.signal}</div>
                      </div>

                      {/* CARD 2: POLICY MATCH */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                               <BookOpen size={24}/>
                            </div>
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase flex items-center gap-1">RAG Match <ArrowUpRight size={10}/></span>
                         </div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">Mapped Protocol</div>
                         <div className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                             {aiBriefing.policyMatch?.title || "Searching Policy DB..."}
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                            <p className="text-xs text-slate-600 italic leading-relaxed line-clamp-3">
                              "{aiBriefing.policyMatch?.excerpt || "No context available."}"
                            </p>
                         </div>
                      </div>

                      {/* CARD 3: ACTION PLAN */}
                      <div className={`bg-${currentScenario.theme}-50 p-6 rounded-2xl border border-${currentScenario.theme}-200 shadow-sm relative overflow-hidden group`}>
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                               <CheckCircle2 size={24} className={`text-${currentScenario.theme}-600`}/>
                               <span className={`text-xs font-bold text-${currentScenario.theme}-700 uppercase`}>Recommendation</span>
                            </div>
                            <h4 className={`text-2xl font-bold text-${currentScenario.theme}-900 mb-3`}>{aiBriefing.action}</h4>
                            <button className="mt-4 w-full py-3 bg-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-slate-800">
                              Authorize Action
                            </button>
                         </div>
                         <div className={`absolute -right-6 -bottom-6 text-${currentScenario.theme}-200 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform`}>
                            <currentScenario.icon size={120} />
                         </div>
                      </div>
                    </div>
                 </div>
             </div>
           )}

           {/* === POLICY LIBRARY TAB === */}
           {activeTab === 'library' && (
             <div className="max-w-7xl mx-auto animate-in fade-in">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Policy Document Explorer</h2>
                    <p className="text-slate-500 mt-1">Showing <strong>{contextPolicies.length}</strong> documents for {selectedCity}</p>
                  </div>
                  <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                      <input 
                        type="text" 
                        placeholder="Search corpus..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {contextPolicies.map(doc => (
                    <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{doc.type}</span>
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">{doc.country}</span>
                         </div>
                         <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Calendar size={12}/> {doc.year}</span>
                       </div>
                       <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{doc.title}</h3>
                       <p className="text-sm text-slate-500 mb-4 line-clamp-2">{doc.desc}</p>
                       <div className="mt-auto bg-amber-50/50 p-3 rounded-xl border border-amber-100 mb-4">
                          <p className="text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wide">RAG Extract</p>
                          <p className="text-xs text-slate-700 italic line-clamp-3">"{doc.excerpt}"</p>
                       </div>
                       <button className="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                          <Eye size={16}/> View Document
                       </button>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* === DATA LAKE TAB === */}
           {activeTab === 'data' && (
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                       <div>
                           <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                               <Database size={18} className={`text-${currentScenario.theme}-600`}/>
                               {currentScenario.label} Data Lake
                           </h2>
                           <p className="text-xs text-slate-500">Filtered view for: {activeScenario} Scenario (API Source)</p>
                       </div>
                       <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"><Download size={14}/> CSV</button>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left whitespace-nowrap">
                           <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                               <tr>
                                   {currentScenario.tableColumns.map((col, idx) => (
                                       <th key={col.key} className={`p-4 ${idx === 0 ? 'pl-6 sticky left-0 bg-slate-50 z-10 border-r' : 'text-center'} ${col.color ? `text-${col.color}-700 bg-${col.color}-50/50` : ''}`}>
                                           {col.label} {col.unit && <span className="text-[10px] opacity-70 ml-1">({col.unit})</span>}
                                       </th>
                                   ))}
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {rawData.map((row, i) => (
                                   <tr key={i} className="hover:bg-slate-50 transition-colors">
                                       {currentScenario.tableColumns.map((col, idx) => (
                                           <td key={col.key} className={`p-4 ${idx === 0 ? 'pl-6 font-mono text-slate-600 font-medium sticky left-0 bg-white z-10 border-r' : 'text-center'}`}>
                                               {row[col.key] !== undefined ? row[col.key] : '-'}
                                           </td>
                                       ))}
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>
           )}

        </div>
      </main>

      {/* CHATBOT */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 flex flex-col border-l border-slate-200 ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-14 border-b border-slate-100 flex items-center px-6 font-bold text-slate-700 justify-between">
            <span>AI Co-Pilot</span>
            <button onClick={() => setChatOpen(false)}><X size={18}/></button>
         </div>
         <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
             {messages.map(m => (
                 <div key={m.id} className={`mb-3 p-3 rounded-xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white ml-8' : 'bg-white border border-slate-200 mr-8'}`}>
                     {m.content}
                 </div>
             ))}
             {isChatLoading && <div className="text-xs text-slate-400 p-2">AI가 정책 문서를 검색 중입니다...</div>}
             <div ref={messagesEndRef}/>
         </div>
         <div className="p-3 border-t bg-white">
             <div className="flex gap-2">
                 <input 
                    value={input} 
                    onChange={e=>setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm" 
                    placeholder="Try 'Budget' or 'Legal'..."
                 />
                 <button onClick={handleSend} className="bg-indigo-600 text-white p-2 rounded-lg"><Send size={16}/></button>
             </div>
         </div>
      </div>
      
      {!chatOpen && (
          <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50">
              <MessageSquareText />
          </button>
      )}

    </div>
  );
};

export default G7PolicyCoPilot;