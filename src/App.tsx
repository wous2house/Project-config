import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Check, Monitor, LayoutTemplate, Briefcase, ArrowRight, Calculator, ChevronDown, Edit2, Rocket, Info } from 'lucide-react';

// --- Data Configuration ---
const SITE_TYPES = [
  { id: 'werken-bij', label: 'Werken-bij site', price: 0, icon: Briefcase },
  { id: 'landingspagina', label: 'Landingspagina', price: 0, icon: LayoutTemplate },
  { id: 'corporate', label: 'Corporate website', price: 0, icon: Monitor },
];

const SITE_SIZES = [
  {
    id: 'small',
    label: 'Small',
    price: 4500,
    pages: 'tot 4 core pagina\'s',
    features: [
      'Homepage',
      'Vacatureoverzicht',
      'Losse vacature(s)',
      'Over ons'
    ]
  },
  {
    id: 'medium',
    label: 'Medium',
    price: 6500,
    pages: '5 - 8 core pagina\'s',
    features: [
      'Homepage',
      'Vacatureoverzicht',
      'Losse vacature(s)',
      'Bedrijfscultuur / onze collega\'s',
      'Extra informatiepagina(s)',
      'Over ons',
      'Contact'
    ]
  },
  {
    id: 'large',
    label: 'Large',
    price: 9000,
    pages: '9+ core pagina\'s',
    features: [
      'Homepage',
      'Vacatureoverzicht',
      'Losse vacature(s)',
      'Bedrijfscultuur / onze collega\'s',
      'Extra informatiepagina(s)',
      'Vestigingoverzicht',
      'Losse vestigingen',
      'Afdelingoverzicht',
      'Losse afdelingen',
      'Over ons',
      'Blogoverzicht',
      'Blogposts',
      'Contact'
    ]
  }
];

const CUSTOM_SIZE = {
  id: 'custom',
  label: 'Stel samen',
  price: 0,
  pages: 'Zelf bepalen',
  description: 'Kies zelf exact welke pagina\'s je nodig hebt voor jouw project. We begeleiden je stap voor stap.'
};

const CUSTOM_PAGES = [
  'Homepage',
  'Vacatureoverzicht',
  'Losse vacature(s)',
  'Bedrijfscultuur / onze collega\'s',
  'Extra informatiepagina(s)',
  'Vestigingoverzicht',
  'Losse vestigingen',
  'Afdelingoverzicht',
  'Losse afdelingen',
  'Over ons',
  'Blogoverzicht',
  'Blogposts',
  'Contact',
  'Webshop'
];

const LANDINGSPAGINA_SIZES = [
  {
    id: 'standaard',
    label: 'Standaard',
    price: 800,
    description: 'Simpele landingspagina met simpele huisstijl of kopie van een eerder gemaakte landingspagina'
  },
  {
    id: 'premium',
    label: 'Premium',
    price: 1025,
    description: 'Uitgebreidere landingspagina in huisstijl van klant of een nieuw design met eventueel meerdere vacatures'
  }
];

const FUNCTIONALITIES = [
  { id: 'zoekfuncties', label: 'Zoekfuncties en filters', price: 70, yearlyPrice: 70 },
  { id: 'sollicitatieformulier', label: 'Sollicitatieformulier', price: 62.50, yearlyPrice: 62.50 },
  { id: 'social-uitgebreid', label: 'Uitgebreide social-media feed', description: 'Plaatst ook video\'s/shorts, ordening en filtering en opent op de pagina zelf', price: 30, yearlyPrice: 30 },
  { id: 'ats', label: 'Koppeling met ATS', description: 'Koppel met je favoriete ATS systeem', price: 650, yearlyPrice: 105, hasDropdown: true }
];

const ATS_OPTIONS = [
  'Force Flow', 'Ubeeo', 'Recruitee', 'Workday', 'Otys', 'Talent Soft', 'People XS', 
  'Visma EasyCruit', 'SAP SuccessFactors', 'Oracle', 'Digivition', 'Nocore', 
  'SmartRecruiters', 'Salesforce', 'Emply', 'AFAS software', 'Recruitnow', 'HR Office'
];

const MAINTENANCE_OPTIONS = [
  { 
    id: 'licht', 
    label: 'Licht', 
    price: 0,
    yearlyPrice: 500,
    features: [
      'Updates elke 3 maanden',
      'Backups elke 3 maanden',
      'Snelheidsoptimalisaties'
    ],
    description: 'Aan te bevelen voor Small Werken-bij sites met af en toe nieuwe vacatures, doorlopende Landingspagina\'s of small business websites / zzp-websites met weinig nieuwe content en lage bezoekersaantallen.'
  },
  { 
    id: 'gemiddeld', 
    label: 'Gemiddeld', 
    price: 0,
    yearlyPrice: 750,
    features: [
      'Updates elke maand',
      'Backups elke maand',
      'Snelheidsoptimalisaties'
    ],
    description: 'Aan te bevelen voor Medium Werken-bij sites met regelmatig nieuwe vacatures, of kleinere MKB websites, webshops of webblogs met geregeld nieuwe content en gemiddelde bezoekersaantallen.'
  },
  { 
    id: 'sterk', 
    label: 'Sterk', 
    price: 0,
    yearlyPrice: 975,
    features: [
      'Updates elke 2 weken',
      'Backups elke 2 weken',
      'Constante beveiligingsmonitoring',
      'Snelheidsoptimalisaties'
    ],
    description: 'Aan te bevelen voor Large Werken-bij sites met veel nieuwe vacatures, of zakelijke websites, grotere webshops of uitgebreide webblogs met veel nieuwe content en hoge bezoekersaantallen.'
  }
];

export default function App() {
  const [selectedSiteType, setSelectedSiteType] = useState<string | null>(null);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [customPages, setCustomPages] = useState<string[]>([]);
  const [sizeConfirmed, setSizeConfirmed] = useState<boolean>(false);
  
  const [selectedFunctionalities, setSelectedFunctionalities] = useState<string[]>([]);
  const [functionalitiesConfirmed, setFunctionalitiesConfirmed] = useState<boolean>(false);
  
  const [selectedAts, setSelectedAts] = useState<string | null>(null);
  const [atsSearch, setAtsSearch] = useState('');
  const [isAtsDropdownOpen, setIsAtsDropdownOpen] = useState(false);
  const atsDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedMaintenance, setSelectedMaintenance] = useState<string | null>(null);
  const [maintenanceConfirmed, setMaintenanceConfirmed] = useState<boolean>(false);

  const [selectedDesign, setSelectedDesign] = useState<'aangeleverd' | 'niet-aangeleverd' | null>(null);
  const [designConfirmed, setDesignConfirmed] = useState<boolean>(false);

  const [toelichting, setToelichting] = useState('');
  const [selectionName, setSelectionName] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const currentSite = useMemo(() => SITE_TYPES.find(s => s.id === selectedSiteType), [selectedSiteType]);
  const currentSize = useMemo(() => {
    if (selectedSiteType === 'werken-bij') {
      return [...SITE_SIZES, CUSTOM_SIZE].find(s => s.id === selectedSize);
    } else if (selectedSiteType === 'landingspagina') {
      return LANDINGSPAGINA_SIZES.find(s => s.id === selectedSize);
    }
    return null;
  }, [selectedSiteType, selectedSize]);
  const currentMaintenance = useMemo(() => MAINTENANCE_OPTIONS.find(m => m.id === selectedMaintenance), [selectedMaintenance]);

  const customSizePrice = useMemo(() => {
    if (selectedSize !== 'custom') return 0;
    const count = customPages.length;
    if (count === 0) return 0;
    if (count <= 4) return 3000;
    if (count <= 8) return 5000;
    return 9000;
  }, [selectedSize, customPages]);

  // Handle click outside for ATS dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (atsDropdownRef.current && !atsDropdownRef.current.contains(event.target as Node)) {
        setIsAtsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSiteTypeSelect = (id: string) => {
    if (selectedSiteType !== id) {
      setSelectedSiteType(id);
      setSelectedSize(null);
      setSizeConfirmed(false);
      setSelectedFunctionalities([]);
      setFunctionalitiesConfirmed(false);
      setSelectedDesign(null);
      setDesignConfirmed(false);
      setSelectedMaintenance(null);
      setMaintenanceConfirmed(false);
      setToelichting('');
    }
  };

  const handleSizeSelect = (id: string) => {
    if (selectedSize !== id) {
      setSelectedSize(id);
      if (id !== 'custom') {
        setSizeConfirmed(true);
      } else {
        setSizeConfirmed(false);
      }
    }
  };

  const handleMaintenanceSelect = (id: string) => {
    if (selectedMaintenance === id) {
      // Deselect if already selected
      setSelectedMaintenance(null);
      setMaintenanceConfirmed(false);
    } else {
      setSelectedMaintenance(id);
      setMaintenanceConfirmed(false);
    }
  };

  const { totalPrice, totalYearly } = useMemo(() => {
    let total = 0;
    let yearly = 0;
    
    if (currentSite) total += currentSite.price;
    
    if (currentSize) {
      if (currentSize.id === 'custom') {
        total += customSizePrice;
      } else {
        total += currentSize.price;
      }
    }
    
    let functionalitiesYearly = 0;
    selectedFunctionalities.forEach(funcId => {
      const func = FUNCTIONALITIES.find(f => f.id === funcId);
      if (func) {
        // Do not add to total (one-time costs)
        functionalitiesYearly += func.yearlyPrice || 0;
      }
    });

    if (currentMaintenance) {
      // Do not add to total (one-time costs)
      
      // If a maintenance package is selected, the total yearly cost is exactly the maintenance package cost
      yearly += currentMaintenance.yearlyPrice || 0;
    } else {
      // If no maintenance package is selected, add up the other yearly costs
      if (selectedSiteType === 'werken-bij' && currentSize && ['small', 'medium', 'large'].includes(currentSize.id)) {
        yearly += 165; // Mandatory yearly license fee for Werken-bij sites (only for Small, Medium, Large)
      }
      yearly += functionalitiesYearly;
    }
    
    // TEMPORARILY DISABLED DESIGN STEP
    // if (selectedSiteType === 'werken-bij' && selectedDesign === 'niet-aangeleverd') {
    //   total += 3000;
    // }
    
    return { totalPrice: total, totalYearly: yearly };
  }, [currentSite, currentSize, currentMaintenance, selectedFunctionalities, customSizePrice, selectedSiteType, selectedDesign]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      let yPos = 20;
      const lineHeight = 7;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - margin * 2;

      // Helper function to add text and handle page breaks
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxLineWidth);
        
        for (let i = 0; i < lines.length; i++) {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(lines[i], margin, yPos);
          yPos += lineHeight;
        }
        yPos += 2; // Extra spacing after a block
      };

      // Title
      const dateStr = new Date().toLocaleDateString('nl-NL');
      const pdfTitle = selectionName.trim() ? `${selectionName} - ${dateStr}` : `Webdroids Project Samenvatting - ${dateStr}`;
      addText(pdfTitle, 18, true, [37, 99, 235]); // Blue color
      yPos += 5;

      // Project Type
      if (currentSite) {
        addText('Type Project:', 12, true);
        addText(currentSite.label, 11);
        yPos += 3;
      }

      // Size
      if (currentSize && selectedSiteType !== 'corporate') {
        addText('Grootte:', 12, true);
        addText(`${currentSize.label} (${currentSize.pages})`, 11);
        yPos += 3;
      }

      // Functionalities
      if (selectedFunctionalities.length > 0 && selectedSiteType !== 'corporate') {
        addText('Uitgebreide functionaliteiten:', 12, true);
        selectedFunctionalities.forEach(funcId => {
          const func = FUNCTIONALITIES.find(f => f.id === funcId);
          if (func) {
            addText(`- ${func.label}`, 11);
          }
        });
        yPos += 3;
      }

      // Maintenance
      if (currentMaintenance && selectedSiteType !== 'corporate') {
        addText('Onderhoud:', 12, true);
        addText(`${currentMaintenance.label} (€ ${currentMaintenance.yearlyPrice},- / jaar)`, 11);
        yPos += 3;
      }
      
      // Mandatory Yearly Fee
      if (selectedSiteType === 'werken-bij' && !currentMaintenance && currentSize && ['small', 'medium', 'large'].includes(currentSize.id)) {
        addText('Licentie:', 12, true);
        addText('Jaarlijkse Werken-bij licentie', 11);
        yPos += 3;
      }

      // Notes
      if (toelichting.trim() !== '') {
        addText('Toelichting:', 12, true);
        addText(toelichting, 11);
        yPos += 3;
      }

      // Pricing
      yPos += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      addText('Geschatte Kosten', 14, true);
      
      if (selectedSiteType === 'corporate') {
        addText('Eenmalig: In overleg', 12, true);
      } else {
        addText(`Eenmalig: € ${totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} excl. BTW`, 12, true);
        if (totalYearly > 0) {
          addText(`Jaarlijks: € ${totalYearly.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} excl. BTW`, 12, true);
        }
      }

      // Footer
      yPos = 285;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150, 150, 150);
      doc.text('Gegenereerd via de Webdroids Project Configurator.', margin, yPos);

      const filename = selectionName.trim() 
        ? `${selectionName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr.replace(/\//g, '-')}.pdf` 
        : `webdroids-project-samenvatting_${dateStr.replace(/\//g, '-')}.pdf`;
        
      doc.save(filename);

      // Save to server
      const pdfBlob = doc.output('blob');
      const formData = new FormData();
      formData.append('pdf', pdfBlob, filename);

      await fetch('/api/save-pdf', {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Er is een fout opgetreden bij het genereren van de PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isSizeStepVisible = selectedSiteType === 'werken-bij' || selectedSiteType === 'landingspagina';
  const isFunctionalitiesStepVisible = isSizeStepVisible && sizeConfirmed;
  
  // TEMPORARILY DISABLED DESIGN STEP
  const isDesignStepVisible = false; // selectedSiteType === 'corporate' || (selectedSiteType === 'werken-bij' && functionalitiesConfirmed);
  const isMaintenanceStepVisible = isFunctionalitiesStepVisible && functionalitiesConfirmed;
  const isToelichtingStepVisible = selectedSiteType === 'corporate' || (isMaintenanceStepVisible && maintenanceConfirmed);
  
  let stepSizeNum = 2;
  let stepFunctionalitiesNum = 3;
  let stepDesignNum = selectedSiteType === 'corporate' ? 2 : 4;
  let stepMaintenanceNum = 4;
  let stepToelichtingNum = selectedSiteType === 'corporate' ? 2 : 5;

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 font-sans pb-56">

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Intro */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Stel je project samen</h1>
          <p className="text-slate-500 text-lg">
            Kies het type website dat je wilt laten bouwen. Ons systeem bepaalt automatisch de best passende opties.
          </p>
        </div>

        {/* Step 1: Site Type */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">1</div>
            <h2 className="text-2xl font-bold text-slate-900">Type Website</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SITE_TYPES.map((site) => {
              const Icon = site.icon;
              const isSelected = selectedSiteType === site.id;
              return (
                <button
                  key={site.id}
                  onClick={() => handleSiteTypeSelect(site.id)}
                  className={`relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      <Icon size={24} />
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{site.label}</h3>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Size */}
        <AnimatePresence mode="wait">
          {isSizeStepVisible && (
            <motion.section
              key="size-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">{stepSizeNum}</div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedSiteType === 'landingspagina' ? 'Type Landingspagina' : 'Omvang van de website'}
                </h2>
              </div>
              
              {selectedSiteType === 'werken-bij' && (
                <div className="grid grid-cols-1 gap-4">
                  {SITE_SIZES.map((size) => {
                    const isSelected = selectedSize === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelect(size.id)}
                        className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex-1 space-y-2 w-full">
                          <div className="flex items-center gap-3">
                            <h3 className={`font-bold text-xl ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{size.label}</h3>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {size.pages}
                            </span>
                          </div>
                          <div className="mt-4">
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                              {size.features.map((feature, idx) => (
                                <li key={idx} className={`flex items-start gap-2 text-sm ${isSelected ? 'text-blue-800/80' : 'text-slate-500'}`}>
                                  <span className={`${isSelected ? 'text-blue-500' : 'text-slate-400'} mt-0.5`}>•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 sm:mt-0 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">of</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className={`relative rounded-xl border transition-all duration-200 ${
                      selectedSize === CUSTOM_SIZE.id
                        ? 'bg-blue-50 border-blue-500 shadow-md'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}>
                    <button
                      onClick={() => handleSizeSelect(CUSTOM_SIZE.id)}
                      className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 text-left"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-bold text-xl ${selectedSize === CUSTOM_SIZE.id ? 'text-blue-900' : 'text-slate-800'}`}>{CUSTOM_SIZE.label}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            selectedSize === CUSTOM_SIZE.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {CUSTOM_SIZE.pages}
                          </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${selectedSize === CUSTOM_SIZE.id ? 'text-blue-800/80' : 'text-slate-500'}`}>
                          {CUSTOM_SIZE.description}
                        </p>
                      </div>
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 sm:mt-0 ${
                        selectedSize === CUSTOM_SIZE.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedSize === CUSTOM_SIZE.id && <Check size={14} className="text-white" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {selectedSize === CUSTOM_SIZE.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-blue-100">
                            <div className="flex items-center justify-between mb-4 mt-4">
                              <h4 className="font-bold text-slate-900">Selecteer gewenste pagina's</h4>
                              {sizeConfirmed && (
                                <button 
                                  onClick={() => setSizeConfirmed(false)}
                                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Edit2 size={14} />
                                  Bewerk selectie
                                </button>
                              )}
                            </div>
                            
                            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 ${sizeConfirmed ? 'opacity-60 pointer-events-none' : ''}`}>
                              {CUSTOM_PAGES.map(page => (
                                <label key={page} className="flex items-center gap-3 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    customPages.includes(page) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white group-hover:border-blue-400'
                                  }`}>
                                    {customPages.includes(page) && <Check size={14} className="text-white" />}
                                  </div>
                                  <span className="text-sm text-slate-700 group-hover:text-slate-900">{page}</span>
                                  <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={customPages.includes(page)}
                                    onChange={() => {
                                      setCustomPages(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]);
                                    }}
                                  />
                                </label>
                              ))}
                            </div>
                            
                            {!sizeConfirmed && (
                              <button 
                                onClick={() => setSizeConfirmed(true)}
                                disabled={customPages.length === 0}
                                className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                  customPages.length === 0 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                              >
                                Ga verder
                                <ArrowRight size={16} />
                              </button>
                            )}
                            {sizeConfirmed && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                <Check size={16} />
                                {customPages.length} pagina's geselecteerd
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {selectedSiteType === 'landingspagina' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LANDINGSPAGINA_SIZES.map((size) => {
                    const isSelected = selectedSize === size.id;
                    return (
                      <button
                        key={size.id}
                        onClick={() => handleSizeSelect(size.id)}
                        className={`relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-md'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between w-full items-start">
                          <h3 className={`font-bold text-xl ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{size.label}</h3>
                          <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                        <p className={`text-sm leading-relaxed ${isSelected ? 'text-blue-800/80' : 'text-slate-500'}`}>
                          {size.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 3: Uitgebreide functionaliteiten */}
        <AnimatePresence mode="wait">
          {isFunctionalitiesStepVisible && (
            <motion.section
              key="functionalities-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">{stepFunctionalitiesNum}</div>
                <h2 className="text-2xl font-bold text-slate-900">Uitgebreide functionaliteiten</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {FUNCTIONALITIES.map((func) => {
                  const isSelected = selectedFunctionalities.includes(func.id);
                  return (
                    <div key={func.id} className={`relative flex flex-col p-4 rounded-xl border transition-all duration-200 ${
                      isSelected ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}>
                      <label className="flex items-start gap-4 cursor-pointer">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <span className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {func.label}
                          </span>
                          {func.description && (
                            <p className="text-sm text-slate-500 mt-1">{func.description}</p>
                          )}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isSelected}
                          onChange={() => {
                            setSelectedFunctionalities(prev => 
                              prev.includes(func.id) ? prev.filter(f => f !== func.id) : [...prev, func.id]
                            );
                          }}
                        />
                      </label>
                      
                      {/* ATS Dropdown */}
                      {func.hasDropdown && isSelected && (
                        <div className="mt-4 ml-9" ref={atsDropdownRef}>
                          <div className="relative">
                            <div className="relative">
                              <input 
                                type="text" 
                                placeholder="Zoek ATS systeem..." 
                                value={atsSearch}
                                onChange={(e) => {
                                  setAtsSearch(e.target.value);
                                  setIsAtsDropdownOpen(true);
                                }}
                                onFocus={() => setIsAtsDropdownOpen(true)}
                                className="w-full md:w-1/2 p-2.5 pl-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              />
                              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            
                            <AnimatePresence>
                              {isAtsDropdownOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute z-20 mt-1 w-full md:w-1/2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl"
                                >
                                  {ATS_OPTIONS.filter(ats => ats.toLowerCase().includes(atsSearch.toLowerCase())).map(ats => (
                                    <button
                                      key={ats}
                                      onClick={() => {
                                        setSelectedAts(ats);
                                        setAtsSearch(ats);
                                        setIsAtsDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-slate-700 focus:outline-none focus:bg-blue-50 transition-colors"
                                    >
                                      {ats}
                                    </button>
                                  ))}
                                  {ATS_OPTIONS.filter(ats => ats.toLowerCase().includes(atsSearch.toLowerCase())).length === 0 && (
                                    <div className="px-4 py-3 text-slate-500 text-sm">Geen ATS gevonden</div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {selectedAts && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                              <Check size={14} />
                              Geselecteerd: {selectedAts}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {!functionalitiesConfirmed && (
                <div className="pt-4">
                  <button 
                    onClick={() => setFunctionalitiesConfirmed(true)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    Ga verder
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step X: Design */}
        <AnimatePresence mode="wait">
          {isDesignStepVisible && (
            <motion.section
              key="design-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">{stepDesignNum}</div>
                <h2 className="text-2xl font-bold text-slate-900">Design</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => { setSelectedDesign('aangeleverd'); if (selectedSiteType === 'corporate') setDesignConfirmed(false); }}
                  className={`relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left transition-all duration-200 ${
                    selectedDesign === 'aangeleverd'
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <h3 className={`font-bold text-lg ${selectedDesign === 'aangeleverd' ? 'text-blue-900' : 'text-slate-800'}`}>Design wordt aangeleverd</h3>
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedDesign === 'aangeleverd' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedDesign === 'aangeleverd' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { setSelectedDesign('niet-aangeleverd'); if (selectedSiteType === 'corporate') setDesignConfirmed(false); }}
                  className={`relative flex flex-col items-start gap-4 p-6 rounded-xl border text-left transition-all duration-200 ${
                    selectedDesign === 'niet-aangeleverd'
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <h3 className={`font-bold text-lg ${selectedDesign === 'niet-aangeleverd' ? 'text-blue-900' : 'text-slate-800'}`}>Design wordt niet aangeleverd</h3>
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedDesign === 'niet-aangeleverd' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedDesign === 'niet-aangeleverd' && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  {selectedSiteType === 'werken-bij' && (
                    <p className="text-sm text-slate-500">+ € 3.000,00</p>
                  )}
                </button>
              </div>

              {!designConfirmed && (
                <div className="pt-4">
                  <button 
                    onClick={() => setDesignConfirmed(true)}
                    disabled={selectedSiteType === 'werken-bij' && !selectedDesign}
                    className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      (selectedSiteType === 'werken-bij' && !selectedDesign)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : (selectedDesign ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white border border-gray-300 text-slate-700 hover:bg-gray-50')
                    }`}
                  >
                    {selectedDesign || selectedSiteType === 'werken-bij' ? 'Ga verder' : 'Overslaan'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 4: Onderhoud */}
        <AnimatePresence mode="wait">
          {isMaintenanceStepVisible && (
            <motion.section
              key="maintenance-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">{stepMaintenanceNum}</div>
                <h2 className="text-2xl font-bold text-slate-900">Onderhoud</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {MAINTENANCE_OPTIONS.map((maintenance) => {
                  const isSelected = selectedMaintenance === maintenance.id;
                  return (
                    <button
                      key={maintenance.id}
                      onClick={() => handleMaintenanceSelect(maintenance.id)}
                      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-md'
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className={`font-bold text-xl ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>{maintenance.label}</h3>
                        </div>
                        
                        <div>
                          <ul className="space-y-2 mb-4">
                            {maintenance.features.map((feature, idx) => (
                              <li key={idx} className={`flex items-start gap-3 text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                <div className={`mt-0.5 shrink-0 w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center`}>
                                  <Check size={10} strokeWidth={3} />
                                </div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <p className={`text-sm leading-relaxed ${isSelected ? 'text-blue-800/80' : 'text-slate-500'}`}>
                            {maintenance.description}
                          </p>
                        </div>
                      </div>
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors mt-1 sm:mt-0 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!maintenanceConfirmed && (
                <div className="pt-4">
                  <button 
                    onClick={() => setMaintenanceConfirmed(true)}
                    className={`px-6 py-2.5 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                      selectedMaintenance
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white border border-gray-300 text-slate-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedMaintenance ? 'Ga verder' : 'Overslaan'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Step 5: Toelichting */}
        <AnimatePresence mode="wait">
          {isToelichtingStepVisible && (
            <motion.section
              key="toelichting-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white font-bold text-lg shadow-sm">{stepToelichtingNum}</div>
                <h2 className="text-2xl font-bold text-slate-900">Toelichting</h2>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <div>
                  <label htmlFor="selectionName" className="block text-sm font-medium text-slate-700 mb-3">
                    Geef je selectie/project een naam
                  </label>
                  <input
                    type="text"
                    id="selectionName"
                    value={selectionName}
                    onChange={(e) => setSelectionName(e.target.value)}
                    placeholder="Bijv. Project X"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 mb-6"
                  />
                  
                  {selectedSiteType !== 'corporate' && (
                    <label htmlFor="toelichting" className="block text-sm font-medium text-slate-700 mb-3">
                      Licht het project toe
                    </label>
                  )}
                  <textarea
                    id="toelichting"
                    rows={5}
                    value={toelichting}
                    onChange={(e) => setToelichting(e.target.value)}
                    placeholder="Typ hier"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Footer for Total */}
      <AnimatePresence>
        {selectedSiteType && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-20"
          >
            <div className="max-w-4xl mx-auto bg-[#0f172a] border border-slate-800 shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
                  <Calculator size={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-slate-400 font-medium">Geschatte kosten</p>
                  
                  {selectedSiteType === 'corporate' ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">In overleg</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                          € {totalPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-slate-500">excl. BTW</span>
                      </div>
                      {totalYearly > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-bold text-blue-400">
                            € {totalYearly.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-slate-500">jaarlijks excl. BTW</span>
                          <div className="group relative flex items-center">
                            <Info size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 text-center">
                              Dit bevat jaarlijkse licentiekosten voor tools en/of jaarlijkse kosten voor onderhoud
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className={`w-full md:w-auto px-8 py-3.5 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg ${
                    isGeneratingPDF 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-[#4ade80] hover:bg-[#22c55e] shadow-green-500/20'
                  }`}
                >
                  {isGeneratingPDF ? (
                    'Bezig met genereren...'
                  ) : (
                    <>Download als PDF <Rocket size={18} /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
