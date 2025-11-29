import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, MessageSquareText, Bell, Search, 
  ChevronRight, Send, Globe, Database, MapPin, UploadCloud, Download, Layers, 
  Zap, Truck, Sprout, ThermometerSun, Activity, 
  Calendar, Eye, X, FileText, CheckCircle2, ArrowUpRight, Filter, Share2, BookOpen, MoreHorizontal, Hash, Maximize2,
  Loader, Gavel, Wallet, Sparkles, Languages
} from 'lucide-react';

// --- 다국어 번역 시스템 (i18n) ---
const TRANSLATIONS = {
  en: {
    // Navigation
    platform: 'Platform',
    commandCenter: 'Command Center',
    policyLibrary: 'Policy Library',
    dataLake: 'Data Lake',
    
    // Header
    climateResilience: 'Climate Resilience Platform',
    systemStatus: 'System Status',
    apiConnected: 'API Connected',
    
    // Scenarios
    agriFood: 'Agri-Food Security',
    energyGrid: 'Energy Grid Resilience',
    supplyChain: 'Supply Chain Logistics',
    urbanHealth: 'Urban Health & Safety',
    
    // Dashboard
    liveView: 'Live View',
    exportReport: 'Export Report',
    loadingData: 'Loading data...',
    waitingAPI: 'Waiting for API Data',
    connectingAPI: 'Connecting to Open-Meteo API for',
    
    // Data Cards
    soilMoisture: 'Soil Moisture',
    soilTemp: 'Soil Temp',
    precipitation: 'Precipitation',
    airTemp: 'Air Temp',
    solarRadiation: 'Solar Radiation',
    cloudCover: 'Cloud Cover',
    windSpeed: 'Wind Speed',
    windGusts: 'Wind Gusts',
    avgWind: 'Avg Wind',
    snowfall: 'Snowfall',
    temperature: 'Temperature',
    feelsLike: 'Feels Like',
    actualTemp: 'Actual Temp',
    uvProxy: 'UV Proxy',
    
    // AI Briefing
    aiStrategicBriefing: 'AI Strategic Briefing',
    ragAnalyzing: 'RAG analyzing...',
    aiDrivenInsight: 'AI-Driven Insight',
    keyPoints: 'Key Points',
    policyDocRef: 'Policy Document Reference',
    currentSignal: 'Current Signal',
    mappedProtocol: 'Mapped Protocol',
    loadingPolicyDB: 'Loading Policy DB...',
    openDocument: 'Open Document',
    recommendation: 'Recommendation',
    authorizeAction: 'Authorize Action',
    
    // Related Policies
    relatedPolicies: 'Related Policy Documents',
    documents: 'documents',
    viewAll: 'View All',
    viewPDF: 'View PDF',
    
    // Policy Library
    policyDocExplorer: 'Policy Document Explorer',
    loadingDocs: 'Loading documents...',
    showingDocs: 'Showing',
    docsFromBackend: 'documents from backend',
    searchPlaceholder: 'Search by title, country, category...',
    loadingFromServer: 'Loading documents from server...',
    noDocsFound: 'No documents found. Make sure the backend server is running.',
    fileInfo: 'File Info',
    viewDocument: 'View Document',
    
    // Data Lake
    filteredView: 'Filtered view for',
    scenario: 'Scenario',
    lastDays: 'Last',
    days: 'Days',
    records: 'records',
    
    // Chat
    aiCoPilot: 'AI Co-Pilot',
    systemReady: 'System is now operational. Receiving real-time API data. You can ask about "budget" or "legal" topics.',
    aiSearching: 'AI is searching policy documents...',
    tryBudgetLegal: 'Try "Budget" or "Legal"...',
    refDocs: 'Reference documents',
    aiServerFailed: 'AI server connection failed (is the backend running?)',
    
    // Periods
    week: 'Week',
    month: 'Month',
    quarter: 'Quarter',
    year: 'Year'
  },
  
  ko: {
    // Navigation
    platform: '플랫폼',
    commandCenter: '지휘 센터',
    policyLibrary: '정책 라이브러리',
    dataLake: '데이터 레이크',
    
    // Header
    climateResilience: '기후 회복력 플랫폼',
    systemStatus: '시스템 상태',
    apiConnected: 'API 연결됨',
    
    // Scenarios
    agriFood: '농식품 안보',
    energyGrid: '에너지 그리드 회복력',
    supplyChain: '공급망 물류',
    urbanHealth: '도시 건강 & 안전',
    
    // Dashboard
    liveView: '실시간 보기',
    exportReport: '보고서 내보내기',
    loadingData: '데이터 로딩 중...',
    waitingAPI: 'API 데이터 대기 중',
    connectingAPI: 'Open-Meteo API 연결 중',
    
    // Data Cards
    soilMoisture: '토양 수분',
    soilTemp: '토양 온도',
    precipitation: '강수량',
    airTemp: '기온',
    solarRadiation: '태양 복사량',
    cloudCover: '구름량',
    windSpeed: '풍속',
    windGusts: '돌풍',
    avgWind: '평균 풍속',
    snowfall: '적설량',
    temperature: '온도',
    feelsLike: '체감 온도',
    actualTemp: '실제 온도',
    uvProxy: 'UV 지수',
    
    // AI Briefing
    aiStrategicBriefing: 'AI 전략 브리핑',
    ragAnalyzing: 'RAG 분석 중...',
    aiDrivenInsight: 'AI 기반 인사이트',
    keyPoints: '핵심 포인트',
    policyDocRef: '정책 문서 참조',
    currentSignal: '현재 신호',
    mappedProtocol: '매핑된 프로토콜',
    loadingPolicyDB: '정책 DB 로딩 중...',
    openDocument: '문서 열기',
    recommendation: '권고 사항',
    authorizeAction: '조치 승인',
    
    // Related Policies
    relatedPolicies: '관련 정책 문서',
    documents: '문서',
    viewAll: '전체 보기',
    viewPDF: 'PDF 보기',
    
    // Policy Library
    policyDocExplorer: '정책 문서 탐색기',
    loadingDocs: '문서 로딩 중...',
    showingDocs: '표시 중',
    docsFromBackend: '백엔드에서 가져온 문서',
    searchPlaceholder: '제목, 국가, 카테고리로 검색...',
    loadingFromServer: '서버에서 문서 로딩 중...',
    noDocsFound: '문서를 찾을 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.',
    fileInfo: '파일 정보',
    viewDocument: '문서 보기',
    
    // Data Lake
    filteredView: '필터링된 보기',
    scenario: '시나리오',
    lastDays: '최근',
    days: '일',
    records: '레코드',
    
    // Chat
    aiCoPilot: 'AI 보조 조종사',
    systemReady: '시스템이 정상 가동되었습니다. 실시간 API 데이터 수신 중입니다. "예산" 또는 "법률" 관련 질문이 가능합니다.',
    aiSearching: 'AI가 정책 문서를 검색 중입니다...',
    tryBudgetLegal: '"예산" 또는 "법률" 입력...',
    refDocs: '참조 문서',
    aiServerFailed: 'AI 서버 연결 실패 (백엔드가 켜져있나요?)',
    
    // Periods
    week: '주',
    month: '월',
    quarter: '분기',
    year: '년'
  },
  
  fr: {
    // Navigation
    platform: 'Plateforme',
    commandCenter: 'Centre de Commande',
    policyLibrary: 'Bibliothèque des Politiques',
    dataLake: 'Lac de Données',
    
    // Header
    climateResilience: 'Plateforme de Résilience Climatique',
    systemStatus: 'État du Système',
    apiConnected: 'API Connectée',
    
    // Scenarios
    agriFood: 'Sécurité Agroalimentaire',
    energyGrid: 'Résilience du Réseau Énergétique',
    supplyChain: 'Logistique de la Chaîne d\'Approvisionnement',
    urbanHealth: 'Santé Urbaine & Sécurité',
    
    // Dashboard
    liveView: 'Vue en Direct',
    exportReport: 'Exporter le Rapport',
    loadingData: 'Chargement des données...',
    waitingAPI: 'En Attente des Données API',
    connectingAPI: 'Connexion à l\'API Open-Meteo pour',
    
    // Data Cards
    soilMoisture: 'Humidité du Sol',
    soilTemp: 'Temp. du Sol',
    precipitation: 'Précipitations',
    airTemp: 'Temp. de l\'Air',
    solarRadiation: 'Rayonnement Solaire',
    cloudCover: 'Couverture Nuageuse',
    windSpeed: 'Vitesse du Vent',
    windGusts: 'Rafales de Vent',
    avgWind: 'Vent Moyen',
    snowfall: 'Chutes de Neige',
    temperature: 'Température',
    feelsLike: 'Ressenti',
    actualTemp: 'Temp. Réelle',
    uvProxy: 'Indice UV',
    
    // AI Briefing
    aiStrategicBriefing: 'Briefing Stratégique IA',
    ragAnalyzing: 'Analyse RAG en cours...',
    aiDrivenInsight: 'Insight Piloté par IA',
    keyPoints: 'Points Clés',
    policyDocRef: 'Référence Document de Politique',
    currentSignal: 'Signal Actuel',
    mappedProtocol: 'Protocole Mappé',
    loadingPolicyDB: 'Chargement de la BD Politique...',
    openDocument: 'Ouvrir le Document',
    recommendation: 'Recommandation',
    authorizeAction: 'Autoriser l\'Action',
    
    // Related Policies
    relatedPolicies: 'Documents de Politique Connexes',
    documents: 'documents',
    viewAll: 'Voir Tout',
    viewPDF: 'Voir PDF',
    
    // Policy Library
    policyDocExplorer: 'Explorateur de Documents de Politique',
    loadingDocs: 'Chargement des documents...',
    showingDocs: 'Affichage de',
    docsFromBackend: 'documents du backend',
    searchPlaceholder: 'Rechercher par titre, pays, catégorie...',
    loadingFromServer: 'Chargement des documents depuis le serveur...',
    noDocsFound: 'Aucun document trouvé. Assurez-vous que le serveur backend fonctionne.',
    fileInfo: 'Info Fichier',
    viewDocument: 'Voir le Document',
    
    // Data Lake
    filteredView: 'Vue filtrée pour',
    scenario: 'Scénario',
    lastDays: 'Derniers',
    days: 'Jours',
    records: 'enregistrements',
    
    // Chat
    aiCoPilot: 'Co-Pilote IA',
    systemReady: 'Le système est opérationnel. Réception des données API en temps réel. Posez des questions sur le "budget" ou les aspects "juridiques".',
    aiSearching: 'L\'IA recherche des documents de politique...',
    tryBudgetLegal: 'Essayez "Budget" ou "Juridique"...',
    refDocs: 'Documents de référence',
    aiServerFailed: 'Échec de connexion au serveur IA (le backend est-il en marche?)',
    
    // Periods
    week: 'Semaine',
    month: 'Mois',
    quarter: 'Trimestre',
    year: 'Année'
  },
  
  de: {
    // Navigation
    platform: 'Plattform',
    commandCenter: 'Kommandozentrale',
    policyLibrary: 'Richtlinienbibliothek',
    dataLake: 'Datensee',
    
    // Header
    climateResilience: 'Klimaresilienz-Plattform',
    systemStatus: 'Systemstatus',
    apiConnected: 'API Verbunden',
    
    // Scenarios
    agriFood: 'Agrar-Ernährungssicherheit',
    energyGrid: 'Energienetz-Resilienz',
    supplyChain: 'Lieferketten-Logistik',
    urbanHealth: 'Städtische Gesundheit & Sicherheit',
    
    // Dashboard
    liveView: 'Live-Ansicht',
    exportReport: 'Bericht Exportieren',
    loadingData: 'Daten werden geladen...',
    waitingAPI: 'Warten auf API-Daten',
    connectingAPI: 'Verbindung zur Open-Meteo API für',
    
    // Data Cards
    soilMoisture: 'Bodenfeuchtigkeit',
    soilTemp: 'Bodentemperatur',
    precipitation: 'Niederschlag',
    airTemp: 'Lufttemperatur',
    solarRadiation: 'Sonnenstrahlung',
    cloudCover: 'Bewölkung',
    windSpeed: 'Windgeschwindigkeit',
    windGusts: 'Windböen',
    avgWind: 'Durchschn. Wind',
    snowfall: 'Schneefall',
    temperature: 'Temperatur',
    feelsLike: 'Gefühlt wie',
    actualTemp: 'Tatsächl. Temp.',
    uvProxy: 'UV-Index',
    
    // AI Briefing
    aiStrategicBriefing: 'KI Strategisches Briefing',
    ragAnalyzing: 'RAG analysiert...',
    aiDrivenInsight: 'KI-Gesteuerter Einblick',
    keyPoints: 'Kernpunkte',
    policyDocRef: 'Richtliniendokument-Referenz',
    currentSignal: 'Aktuelles Signal',
    mappedProtocol: 'Zugeordnetes Protokoll',
    loadingPolicyDB: 'Richtlinien-DB wird geladen...',
    openDocument: 'Dokument Öffnen',
    recommendation: 'Empfehlung',
    authorizeAction: 'Aktion Autorisieren',
    
    // Related Policies
    relatedPolicies: 'Verwandte Richtliniendokumente',
    documents: 'Dokumente',
    viewAll: 'Alle Anzeigen',
    viewPDF: 'PDF Ansehen',
    
    // Policy Library
    policyDocExplorer: 'Richtliniendokument-Explorer',
    loadingDocs: 'Dokumente werden geladen...',
    showingDocs: 'Zeigt',
    docsFromBackend: 'Dokumente vom Backend',
    searchPlaceholder: 'Nach Titel, Land, Kategorie suchen...',
    loadingFromServer: 'Dokumente werden vom Server geladen...',
    noDocsFound: 'Keine Dokumente gefunden. Stellen Sie sicher, dass der Backend-Server läuft.',
    fileInfo: 'Dateiinfo',
    viewDocument: 'Dokument Anzeigen',
    
    // Data Lake
    filteredView: 'Gefilterte Ansicht für',
    scenario: 'Szenario',
    lastDays: 'Letzte',
    days: 'Tage',
    records: 'Datensätze',
    
    // Chat
    aiCoPilot: 'KI Co-Pilot',
    systemReady: 'System ist betriebsbereit. Empfange Echtzeit-API-Daten. Sie können Fragen zu "Budget" oder "Recht" stellen.',
    aiSearching: 'KI durchsucht Richtliniendokumente...',
    tryBudgetLegal: 'Versuchen Sie "Budget" oder "Recht"...',
    refDocs: 'Referenzdokumente',
    aiServerFailed: 'KI-Server-Verbindung fehlgeschlagen (läuft das Backend?)',
    
    // Periods
    week: 'Woche',
    month: 'Monat',
    quarter: 'Quartal',
    year: 'Jahr'
  }
};

// 언어 설정 객체
const LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  ko: { code: 'ko', name: '한국어', flag: '🇰🇷' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
};

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

// 정책 DB (RAG 로딩 전 보여줄 기본값 - 백엔드 API로 대체됨)
const FULL_POLICY_DB = [];

// 데이터 카드 컴포넌트
const DataCard = ({ label, value, color = 'slate', icon: Icon }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    slate: 'bg-slate-50 border-slate-200 text-slate-700'
  };
  
  return (
    <div className={`p-5 rounded-2xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase opacity-70">{label}</span>
        {Icon && <Icon size={18} className="opacity-50" />}
      </div>
      <div className="text-2xl font-bold">{value || '-'}</div>
    </div>
  );
};

const G7PolicyCoPilot = () => {
  const [selectedCity, setSelectedCity] = useState('Toronto');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeScenario, setActiveScenario] = useState('Agri');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en'); // 다국어 상태
  const [showLangMenu, setShowLangMenu] = useState(false); // 언어 메뉴 토글
  
  // 번역 함수
  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  
  // Real Data State (API)
  const [scenarioData, setScenarioData] = useState(null); 
  const [rawData, setRawData] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1W'); // 1W, 1M, 1Q, 1Y
  
  // Policy Library State (from Backend)
  const [policyDocuments, setPolicyDocuments] = useState([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  
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
    policyMatch: null,
    relatedPolicies: [],  // 관련 정책 문서 목록 추가
    // RAG 인사이트 추가
    headline: '',
    analysis: '',
    keyPoints: [],
    policyRelevance: '',
    sources: []
  });
  const [insightLoading, setInsightLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const currentCity = GEO_CONFIG[selectedCity];
  const currentScenario = SCENARIO_CONFIG[activeScenario];
  
  // 검색 필터링 (백엔드에서 가져온 문서 목록 사용)
  const contextPolicies = policyDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- 0. 백엔드에서 문서 목록 가져오기 ---
  useEffect(() => {
    const fetchDocuments = async () => {
      setPolicyLoading(true);
      try {
        const response = await fetch('http://localhost:8000/documents');
        const data = await response.json();
        if (data.documents) {
          setPolicyDocuments(data.documents);
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err);
      } finally {
        setPolicyLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  // PDF 보기 함수
  const handleViewDocument = (filename) => {
    window.open(`http://localhost:8000/pdf/${filename}`, '_blank');
  };

  // --- 1. 날씨 API 호출 (기간별 데이터) ---
  const fetchDataForPeriod = async (period) => {
    setIsLoading(true);
    const { lat, lon } = currentCity;
    
    // 기간별 날짜 계산
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];
    
    let startDate, endDate = formatDate(today);
    let daysCount;
    
    switch(period) {
      case '1W':
        daysCount = 7;
        startDate = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case '1M':
        daysCount = 30;
        startDate = formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
        break;
      case '1Q':
        daysCount = 90;
        startDate = formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000));
        break;
      case '1Y':
        daysCount = 365;
        startDate = formatDate(new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000));
        break;
      default:
        daysCount = 7;
        startDate = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    }
    
    try {
      let url;
      
      // 1주일은 Forecast API의 past_days 사용, 그 이상은 Archive API
      if (period === '1W') {
        url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum,apparent_temperature_max&past_days=7&timezone=auto`;
      } else {
        // Archive API (과거 데이터)
        url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max,shortwave_radiation_sum,apparent_temperature_max&timezone=auto`;
      }
      
      console.log(`Fetching ${period} data:`, url);
      
      const response = await fetch(url);
      const json = await response.json();
      
      if (!json.daily) throw new Error("No data from API");
      
      const d = json.daily;
      const latestIdx = d.time.length - 1;
      
      const mappedRaw = d.time.map((date, i) => ({
        date,
        temp: d.temperature_2m_max[i] ?? '-',
        rain: d.precipitation_sum[i] ?? 0,
        snow: d.snowfall_sum[i] ?? 0,
        wind: d.wind_speed_10m_max[i] ?? 0,
        soil: (Math.random() * 40 + 20).toFixed(1), // 시뮬레이션
        soilTemp: d.temperature_2m_min[i] ?? 0,
        solar: d.shortwave_radiation_sum[i] ?? 0,
        cloud: (Math.random() * 50 + 25).toFixed(0), // 시뮬레이션
        gust: d.wind_gusts_10m_max[i] ?? 0,
        feel: d.apparent_temperature_max[i] ?? d.temperature_2m_max[i]
      })).reverse();
      
      setRawData(mappedRaw);
      
      // 최신 데이터
      const current = {
        soilMoisture: (Math.random() * 0.3 + 0.2),
        soilTemp: d.temperature_2m_min[latestIdx] ?? 10,
        rain: d.precipitation_sum[latestIdx] ?? 0,
        solarRad: d.shortwave_radiation_sum[latestIdx] ?? 5,
        cloud: Math.random() * 50 + 25,
        wind: d.wind_speed_10m_max[latestIdx] ?? 10,
        gust: d.wind_gusts_10m_max[latestIdx] ?? 15,
        snow: d.snowfall_sum[latestIdx] ?? 0,
        feelTemp: d.apparent_temperature_max[latestIdx] ?? d.temperature_2m_max[latestIdx],
        realTemp: d.temperature_2m_max[latestIdx] ?? 15
      };
      
      setScenarioData(current);
      
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 1-1. 초기 로드 및 기간/도시 변경 시 데이터 호출 ---
  useEffect(() => {
    fetchDataForPeriod(selectedPeriod);
  }, [selectedCity, selectedPeriod]);

  // [핵심] scenarioData 변경 시 백엔드 RAG 인사이트 API 호출
  useEffect(() => {
    const fetchRagInsight = async () => {
      if (!scenarioData) return;
      
      setInsightLoading(true);
      
      try {
        const response = await fetch('http://localhost:8000/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: currentCity.country,
            scenario: activeScenario,
            weather_data: scenarioData,
            language: language  // 현재 선택된 언어 전달
          })
        });
        
        const data = await response.json();
        console.log('RAG Insight:', data);
        
        // 관련 정책 문서 필터링 (sources 기반)
        const relatedPolicies = policyDocuments.filter(doc => 
          data.sources?.some(s => doc.filename.includes(s) || s.includes(doc.filename))
        );
        
        setAiBriefing({
          mode: 'DATA',
          title: `${activeScenario} Protocol`,
          signal: data.signal || `${activeScenario} Analysis`,
          status: data.status || 'STABLE',
          action: data.action || 'Monitor',
          headline: data.headline || '',
          analysis: data.analysis || '',
          keyPoints: data.key_points || [],
          policyRelevance: data.policy_relevance || '',
          sources: data.sources || [],
          policyMatch: relatedPolicies[0] || null,
          relatedPolicies: relatedPolicies.length > 0 ? relatedPolicies : 
            policyDocuments.filter(d => d.country === currentCity.country || d.country === 'Global').slice(0, 4),
          
          // 🆕 Deep RAG 데이터
          reasoningChain: data.reasoning_chain || [],
          microCitations: data.micro_citations || [],
          confidenceScore: data.confidence_score || 0.7,
          detailedCitations: data.detailed_citations || []
        });
        
      } catch (err) {
        console.error('RAG Insight Error:', err);
        // 폴백: 기존 로직 사용
        setAiBriefing(generateDataBriefing(scenarioData, activeScenario, policyDocuments));
      } finally {
        setInsightLoading(false);
      }
    };
    
    fetchRagInsight();
  }, [scenarioData, activeScenario, currentCity.country, policyDocuments]);

  // --- 2. 로직 핸들러 ---
  const generateDataBriefing = (data, scenario, docs = []) => {
      let signal = "";
      let status = "STABLE";
      let action = "";
      let policyMatch = null;
      let relatedPolicies = [];
      
      // 현재 국가에 맞는 정책 필터링
      const countryDocs = docs.filter(d => 
        d.country === currentCity.country || d.country === 'Global'
      );

      if (scenario === 'Agri') {
          const isDrought = data.soilMoisture < 0.25;
          signal = `Soil Moisture: ${(data.soilMoisture * 100).toFixed(1)}%`;
          status = isDrought ? "DROUGHT ALERT" : "OPTIMAL";
          action = isDrought ? "Activate Water Subsidies" : "Monitor Crop Yields";
          relatedPolicies = countryDocs.filter(d => 
            d.category === 'Agriculture' || d.category === 'Climate' ||
            d.title.toLowerCase().includes('agri') || d.title.toLowerCase().includes('food')
          );
      } else if (scenario === 'Energy') {
          const isLowSolar = data.solarRad < 10; 
          signal = `Solar Output: ${data.solarRad?.toFixed(1) || 0} MJ/m²`;
          status = isLowSolar ? "LOW GENERATION" : "PEAK OUTPUT";
          action = isLowSolar ? "Request Grid Load Shedding" : "Export Excess Power";
          relatedPolicies = countryDocs.filter(d => 
            d.category === 'Energy' || d.category === 'Climate' ||
            d.title.toLowerCase().includes('energy') || d.title.toLowerCase().includes('emission')
          );
      } else if (scenario === 'Supply') {
          const isHighWind = data.gust > 40;
          signal = `Wind Gusts: ${data.gust?.toFixed(1) || 0} km/h`;
          status = isHighWind ? "PORT RISK" : "OPERATIONAL";
          action = isHighWind ? "Halt Crane Operations" : "Standard Logistics";
          relatedPolicies = countryDocs.filter(d => 
            d.category === 'Policy' || d.category === 'Climate' ||
            d.title.toLowerCase().includes('supply') || d.title.toLowerCase().includes('transition')
          );
      } else {
          const isHeatWave = data.feelTemp > 30;
          signal = `Apparent Temp: ${data.feelTemp?.toFixed(1) || 0}°C`;
          status = isHeatWave ? "HEAT WARNING" : "SAFE";
          action = isHeatWave ? "Deploy Mobile Cooling Units" : "Public Health Monitoring";
          relatedPolicies = countryDocs.filter(d => 
            d.category === 'Climate' || d.category === 'Policy' ||
            d.title.toLowerCase().includes('health') || d.title.toLowerCase().includes('climate')
          );
      }
      
      // 첫 번째 관련 정책을 policyMatch로 설정
      policyMatch = relatedPolicies[0] || null;
      
      return { mode: 'DATA', title: `${scenario} Protocol`, signal, status, action, policyMatch, relatedPolicies };
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
                scenario: activeScenario,
                language: language  // 현재 선택된 언어 전달
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
                content: `🔍 ${t('refDocs')}: ${data.sources.join(', ')}` 
            }]);
            
            // AI가 찾은 정책으로 브리핑 카드 업데이트
            setAiBriefing(prev => ({
                ...prev,
                policyMatch: { title: data.sources[0], excerpt: "AI found relevant policy document." }
            }));
        }

    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'ai', type: 'error', content: t('aiServerFailed') }]);
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
              <div className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 hidden lg:block">{t('platform')}</div>
              <NavItem icon={LayoutDashboard} label={t('commandCenter')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={Layers} label={t('policyLibrary')} active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
              <NavItem icon={Database} label={t('dataLake')} active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
           </nav>
        </div>
        
        {/* Language Selector in Sidebar */}
        <div className="p-4 border-t border-slate-100">
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Languages size={18} className="text-slate-500" />
              <span className="hidden lg:block text-sm font-medium text-slate-700">
                {LANGUAGES[language].flag} {LANGUAGES[language].name}
              </span>
            </button>
            
            {showLangMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${language === lang.code ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="hidden lg:block">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
           <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-slate-700 hidden md:block">{t('climateResilience')}</h1>
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
                 <div className="text-xs font-bold text-slate-400 uppercase">{t('systemStatus')}</div>
                 <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1"><Activity size={10}/> {t('apiConnected')}</div>
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
                    <div className="flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full gap-2">
                         {Object.values(SCENARIO_CONFIG).map((cfg) => (
                             <button key={cfg.id} onClick={() => { setActiveScenario(cfg.id); setAiBriefing(prev => ({...prev, mode: 'DATA'})); }} 
                               className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                   activeScenario === cfg.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                               }`}>
                                 <cfg.icon size={16} /> {cfg.label}
                             </button>
                         ))}
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg text-sm font-bold whitespace-nowrap">
                        <Download size={18} /> {t('exportReport')}
                    </button>
                 </div>

                 {/* 2. TABLEAU CONTAINER - 실제 데이터 표시 */}
                 <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative flex flex-col group">
                     <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm absolute w-full top-0 z-10">
                        <div className="flex items-center gap-3">
                           <span className={`w-2.5 h-2.5 rounded-full ${scenarioData ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></span>
                           <span className="font-bold text-slate-700">{t('liveView')}: {selectedCity}</span>
                           <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500 font-mono border border-slate-200">
                             {currentScenario.metrics.join(' • ')}
                           </span>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Filter size={18}/></button>
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Share2 size={18}/></button>
                        </div>
                     </div>
                     <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 relative p-8 pt-24">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                              <Loader className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                              <p className="text-slate-500">{t('loadingData')} - {selectedCity}</p>
                            </div>
                        ) : scenarioData ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {/* 시나리오별 데이터 카드 */}
                              {activeScenario === 'Agri' && (
                                <>
                                  <DataCard label={t('soilMoisture')} value={`${(scenarioData.soilMoisture * 100).toFixed(1)}%`} color="emerald" icon={Sprout} />
                                  <DataCard label={t('soilTemp')} value={`${scenarioData.soilTemp?.toFixed(1)}°C`} color="amber" icon={ThermometerSun} />
                                  <DataCard label={t('precipitation')} value={`${scenarioData.rain?.toFixed(1)} mm`} color="blue" icon={Activity} />
                                  <DataCard label={t('airTemp')} value={`${scenarioData.realTemp?.toFixed(1)}°C`} color="rose" icon={ThermometerSun} />
                                </>
                              )}
                              {activeScenario === 'Energy' && (
                                <>
                                  <DataCard label={t('solarRadiation')} value={`${scenarioData.solarRad?.toFixed(1)} MJ/m²`} color="amber" icon={Zap} />
                                  <DataCard label={t('cloudCover')} value={`${scenarioData.cloud?.toFixed(0)}%`} color="slate" icon={Activity} />
                                  <DataCard label={t('windSpeed')} value={`${scenarioData.wind?.toFixed(1)} km/h`} color="blue" icon={Activity} />
                                  <DataCard label={t('airTemp')} value={`${scenarioData.realTemp?.toFixed(1)}°C`} color="rose" icon={ThermometerSun} />
                                </>
                              )}
                              {activeScenario === 'Supply' && (
                                <>
                                  <DataCard label={t('windGusts')} value={`${scenarioData.gust?.toFixed(1)} km/h`} color="purple" icon={Truck} />
                                  <DataCard label={t('avgWind')} value={`${scenarioData.wind?.toFixed(1)} km/h`} color="blue" icon={Activity} />
                                  <DataCard label={t('snowfall')} value={`${scenarioData.snow?.toFixed(1)} cm`} color="cyan" icon={Activity} />
                                  <DataCard label={t('temperature')} value={`${scenarioData.realTemp?.toFixed(1)}°C`} color="rose" icon={ThermometerSun} />
                                </>
                              )}
                              {activeScenario === 'Health' && (
                                <>
                                  <DataCard label={t('feelsLike')} value={`${scenarioData.feelTemp?.toFixed(1)}°C`} color="rose" icon={ThermometerSun} />
                                  <DataCard label={t('actualTemp')} value={`${scenarioData.realTemp?.toFixed(1)}°C`} color="amber" icon={ThermometerSun} />
                                  <DataCard label={t('precipitation')} value={`${scenarioData.rain?.toFixed(1)} mm`} color="blue" icon={Activity} />
                                  <DataCard label={t('uvProxy')} value={`${scenarioData.solarRad?.toFixed(0)} MJ`} color="yellow" icon={Zap} />
                                </>
                              )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="p-8 rounded-full bg-indigo-50 mb-6 shadow-inner">
                                   <currentScenario.icon className="w-20 h-20 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700">{t('waitingAPI')}</h3>
                                <p className="text-slate-400 max-w-md mt-3">
                                  {t('connectingAPI')} <strong>{selectedCity}</strong>...
                                </p>
                            </div>
                        )}
                     </div>
                 </div>

                 {/* 3. AI STRATEGIC BRIEFING CARDS */}
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                        <MessageSquareText className="text-white" size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{t('aiStrategicBriefing')}</h3>
                      {insightLoading && (
                        <span className="text-xs text-indigo-600 flex items-center gap-1">
                          <div className="animate-spin h-3 w-3 border border-indigo-600 border-t-transparent rounded-full"></div>
                          {t('ragAnalyzing')}
                        </span>
                      )}
                    </div>
                    
                    {/* RAG 인사이트 메인 카드 */}
                    {aiBriefing.headline && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200 mb-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="text-indigo-600" size={20} />
                            <span className="text-xs font-bold text-indigo-600 uppercase">{t('aiDrivenInsight')}</span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                            aiBriefing.status === 'ALERT' ? 'bg-red-100 text-red-700' :
                            aiBriefing.status === 'CAUTION' ? 'bg-amber-100 text-amber-700' :
                            aiBriefing.status === 'OPTIMAL' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>{aiBriefing.status}</span>
                        </div>
                        
                        <h4 className="text-xl font-bold text-slate-800 mb-3">{aiBriefing.headline}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{aiBriefing.analysis}</p>
                        
                        {aiBriefing.keyPoints && aiBriefing.keyPoints.length > 0 && (
                          <div className="bg-white/60 p-4 rounded-xl mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('keyPoints')}</p>
                            <ul className="space-y-2">
                              {aiBriefing.keyPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                  <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {aiBriefing.policyRelevance && (
                          <div className="bg-white/60 p-4 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t('policyDocRef')}</p>
                            <p className="text-sm text-slate-600">{aiBriefing.policyRelevance}</p>
                            {aiBriefing.sources && aiBriefing.sources.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {aiBriefing.sources.slice(0, 3).map((src, i) => (
                                  <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded">
                                    📄 {src.length > 30 ? src.slice(0, 30) + '...' : src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 🆕 CHAIN OF THOUGHT - AI 추론 과정 시각화 */}
                        {aiBriefing.reasoningChain && aiBriefing.reasoningChain.length > 0 && (
                          <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-purple-600 rounded-lg">
                                <Sparkles size={14} className="text-white" />
                              </div>
                              <p className="text-xs font-bold text-purple-700 uppercase">AI Reasoning Chain</p>
                              {aiBriefing.confidenceScore && (
                                <span className="ml-auto text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                  {(aiBriefing.confidenceScore * 100).toFixed(0)}% confidence
                                </span>
                              )}
                            </div>
                            <div className="space-y-3">
                              {aiBriefing.reasoningChain.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      step.type === 'DATA_OBSERVATION' ? 'bg-blue-500' :
                                      step.type === 'POLICY_LOOKUP' ? 'bg-amber-500' :
                                      step.type === 'INFERENCE' ? 'bg-purple-500' :
                                      'bg-green-500'
                                    }`}>
                                      {step.step || i + 1}
                                    </div>
                                    {i < aiBriefing.reasoningChain.length - 1 && (
                                      <div className="w-0.5 h-full bg-slate-200 mt-1"></div>
                                    )}
                                  </div>
                                  <div className="flex-1 pb-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                        step.type === 'DATA_OBSERVATION' ? 'bg-blue-100 text-blue-700' :
                                        step.type === 'POLICY_LOOKUP' ? 'bg-amber-100 text-amber-700' :
                                        step.type === 'INFERENCE' ? 'bg-purple-100 text-purple-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {step.type?.replace('_', ' ')}
                                      </span>
                                      {step.citation && (
                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                          📄 p.{step.citation.page} {step.citation.section && `• ${step.citation.section}`}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{step.content}</p>
                                    {step.citation?.source && (
                                      <p className="text-[11px] text-amber-700 mt-1 font-medium">📑 {step.citation.source}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 🆕 MICRO-CITATIONS - 정밀 인용 */}
                        {aiBriefing.microCitations && aiBriefing.microCitations.length > 0 && (
                          <div className="mt-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 bg-amber-500 rounded-lg">
                                <BookOpen size={14} className="text-white" />
                              </div>
                              <p className="text-xs font-bold text-amber-700 uppercase">Micro-Citations</p>
                            </div>
                            <div className="space-y-3">
                              {aiBriefing.microCitations.slice(0, 3).map((cite, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer" onClick={() => cite.source && handleViewDocument(cite.source)}>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="w-5 h-5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                        {cite.doc_id || i + 1}
                                      </span>
                                      <span className="text-xs font-bold text-slate-700 break-words">
                                        {cite.source}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                      p.{cite.page} {cite.section && `• ${cite.section}`}
                                    </span>
                                  </div>
                                  {cite.quote && (
                                    <p className="text-xs text-slate-600 italic border-l-2 border-amber-300 pl-2 mb-2">
                                      "{cite.quote}"
                                    </p>
                                  )}
                                  {cite.relevance && (
                                    <p className="text-[11px] text-slate-500">
                                      <span className="font-semibold">Relevance:</span> {cite.relevance}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
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
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                              aiBriefing.status === 'ALERT' ? 'bg-red-100 text-red-700' :
                              aiBriefing.status === 'CAUTION' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>{aiBriefing.status}</span>
                         </div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">{t('currentSignal')}</div>
                         <div className="text-xl font-bold text-slate-800 mb-2">{aiBriefing.signal}</div>
                      </div>

                      {/* CARD 2: POLICY MATCH */}
                      <div 
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
                        onClick={() => aiBriefing.policyMatch && handleViewDocument(aiBriefing.policyMatch.filename)}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                               <BookOpen size={24}/>
                            </div>
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase flex items-center gap-1">RAG Match <ArrowUpRight size={10}/></span>
                         </div>
                         <div className="text-xs font-bold text-slate-400 uppercase mb-1">{t('mappedProtocol')}</div>
                         <div className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">
                             {aiBriefing.policyMatch?.title || t('loadingPolicyDB')}
                         </div>
                         <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                              <span className="font-semibold">{aiBriefing.policyMatch?.country || "..."}</span> - {aiBriefing.policyMatch?.category || "..."} ({aiBriefing.policyMatch?.year || "..."})
                            </p>
                         </div>
                         {aiBriefing.policyMatch && (
                           <button className="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                             {t('openDocument')}
                           </button>
                         )}
                      </div>

                      {/* CARD 3: ACTION PLAN */}
                      <div className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm relative overflow-hidden group">
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                               <CheckCircle2 size={24} className="text-green-600"/>
                               <span className="text-xs font-bold text-green-700 uppercase">{t('recommendation')}</span>
                            </div>
                            <h4 className="text-2xl font-bold text-green-900 mb-3">{aiBriefing.action}</h4>
                            <button className="mt-4 w-full py-3 bg-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all text-slate-800">
                              {t('authorizeAction')}
                            </button>
                         </div>
                         <div className="absolute -right-6 -bottom-6 text-green-200 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform">
                            <currentScenario.icon size={120} />
                         </div>
                      </div>
                    </div>
                 </div>

                 {/* 4. RELATED POLICY DOCUMENTS - 관련 정책 문서 카드 */}
                 {aiBriefing.relatedPolicies && aiBriefing.relatedPolicies.length > 0 && (
                 <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg shadow-lg shadow-amber-200">
                          <FileText className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{t('relatedPolicies')}</h3>
                          <p className="text-sm text-slate-500">{currentCity.country} - {activeScenario} {t('scenario')} ({aiBriefing.relatedPolicies.length} {t('documents')})</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('library')}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        {t('viewAll')} <ArrowUpRight size={14}/>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {aiBriefing.relatedPolicies.slice(0, 4).map((doc, idx) => (
                        <div 
                          key={doc.id} 
                          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer"
                          onClick={() => handleViewDocument(doc.filename)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                              doc.country === 'Canada' ? 'bg-red-50 text-red-600' :
                              doc.country === 'France' ? 'bg-blue-50 text-blue-600' :
                              doc.country === 'Germany' ? 'bg-yellow-50 text-yellow-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {doc.country}
                            </span>
                            <span className="text-[10px] text-slate-400">{doc.year}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2">{doc.title}</h4>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-1">{doc.category}</p>
                          <button className="w-full py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
                            <Eye size={12}/> {t('viewPDF')}
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>
                 )}
             </div>
           )}

           {/* === POLICY LIBRARY TAB === */}
           {activeTab === 'library' && (
             <div className="max-w-7xl mx-auto animate-in fade-in">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('policyDocExplorer')}</h2>
                    <p className="text-slate-500 mt-1">
                      {policyLoading ? t('loadingDocs') : `${t('showingDocs')} ${contextPolicies.length} ${t('docsFromBackend')}`}
                    </p>
                  </div>
                  <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                      <input 
                        type="text" 
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                  </div>
                </div>

                {policyLoading ? (
                  <div className="text-center py-16">
                    <Loader className="animate-spin w-8 h-8 text-indigo-600 mx-auto mb-4"/>
                    <p className="text-slate-500">{t('loadingFromServer')}</p>
                  </div>
                ) : contextPolicies.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
                    <p className="text-slate-500">{t('noDocsFound')}</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {contextPolicies.map(doc => (
                    <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col h-full">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{doc.type}</span>
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">{doc.country}</span>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">{doc.category}</span>
                         </div>
                         <span className="text-xs font-medium text-slate-400 flex items-center gap-1"><Calendar size={12}/> {doc.year}</span>
                       </div>
                       <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{doc.title}</h3>
                       <p className="text-sm text-slate-500 mb-4 line-clamp-2 break-all">{doc.filename}</p>
                       <div className="mt-auto bg-amber-50/50 p-3 rounded-xl border border-amber-100 mb-4">
                          <p className="text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wide">{t('fileInfo')}</p>
                          <p className="text-xs text-slate-700">ID: {doc.id}</p>
                       </div>
                       <button 
                         onClick={() => handleViewDocument(doc.filename)}
                         className="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                       >
                          <Eye size={16}/> {t('viewDocument')}
                       </button>
                    </div>
                  ))}
                </div>
                )}
             </div>
           )}

           {/* === DATA LAKE TAB === */}
           {activeTab === 'data' && (
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                   <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div>
                           <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                               <Database size={18} className="text-indigo-600"/>
                               {currentScenario.label} {t('dataLake')}
                           </h2>
                           <p className="text-xs text-slate-500">
                             {t('filteredView')}: {activeScenario} {t('scenario')} • {t('lastDays')} {selectedPeriod === '1W' ? '7' : selectedPeriod === '1M' ? '30' : selectedPeriod === '1Q' ? '90' : '365'} {t('days')} ({rawData.length} {t('records')})
                           </p>
                       </div>
                       <div className="flex items-center gap-3">
                         {/* Period Filter Buttons */}
                         <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                           {['1W', '1M', '1Q', '1Y'].map((period) => (
                             <button
                               key={period}
                               onClick={() => setSelectedPeriod(period)}
                               className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                                 selectedPeriod === period 
                                   ? 'bg-indigo-600 text-white' 
                                   : 'bg-white text-slate-600 hover:bg-slate-50'
                               }`}
                             >
                               {period}
                             </button>
                           ))}
                         </div>
                         <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"><Download size={14}/> CSV</button>
                       </div>
                   </div>
                   {isLoading ? (
                     <div className="p-12 text-center text-slate-400">
                       <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                       <p className="text-sm">{t('loadingData')}</p>
                     </div>
                   ) : (
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left whitespace-nowrap">
                           <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                               <tr>
                                   {currentScenario.tableColumns.map((col, idx) => (
                                       <th key={col.key} className={`p-4 ${idx === 0 ? 'pl-6 sticky left-0 bg-slate-50 z-10 border-r' : 'text-center'}`}>
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
                   )}
               </div>
           )}

        </div>
      </main>

      {/* CHATBOT */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 flex flex-col border-l border-slate-200 ${chatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-14 border-b border-slate-100 flex items-center px-6 font-bold text-slate-700 justify-between">
            <span>{t('aiCoPilot')}</span>
            <button onClick={() => setChatOpen(false)}><X size={18}/></button>
         </div>
         <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
             {messages.map(m => (
                 <div key={m.id} className={`mb-3 p-3 rounded-xl text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white ml-8' : 'bg-white border border-slate-200 mr-8'}`}>
                     {m.content}
                 </div>
             ))}
             {isChatLoading && <div className="text-xs text-slate-400 p-2">{t('aiSearching')}</div>}
             <div ref={messagesEndRef}/>
         </div>
         <div className="p-3 border-t bg-white">
             <div className="flex gap-2">
                 <input 
                    value={input} 
                    onChange={e=>setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm" 
                    placeholder={t('tryBudgetLegal')}
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
