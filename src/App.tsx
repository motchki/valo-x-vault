import React, { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, Copy, Check, Star, Shield, Zap, Layout, MousePointer2, Info, Plus, Search, Sliders, Share2, Loader2, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CrosshairPreview, Crosshair } from './components/CrosshairPreview';
import { Tools } from './components/Calculator';
import { ProProfiles } from './components/ProProfiles';
import { Vaults } from './components/Vaults';

interface User {
  id: number;
  username: string;
}

// --- Types ---

// --- Components ---

const CrosshairCard: React.FC<{ crosshair: Crosshair, user: User | null, vaults: any[] }> = ({ crosshair, user, vaults }) => {
  const [copied, setCopied] = useState(false);
  const [showVaultSelect, setShowVaultSelect] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(crosshair.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToVault = async (vaultId: string) => {
    try {
      const response = await fetch('/api/crosshairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: crosshair.name,
          code: crosshair.code,
          author: crosshair.author,
          vaultId: vaultId
        })
      });
      if (response.ok) {
        alert('Added to vault!');
        setShowVaultSelect(false);
      } else {
        alert('Failed to add to vault');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className="glass-card p-4 md:p-6 rounded-2xl flex flex-col gap-4 group relative"
    >
      <div className="h-40">
        <CrosshairPreview crosshair={crosshair} />
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{crosshair.name}</h3>
          <p className="text-xs text-white/40">by {crosshair.author}</p>
        </div>
        <div className="flex gap-1">
           <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 uppercase tracking-wider font-semibold">Pro</span>
        </div>
      </div>
      <div className="bg-black/40 p-2 rounded-lg font-mono text-[10px] text-white/60 truncate border border-white/5">
        {crosshair.code}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={handleCopy}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            copied ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {user && vaults.length > 0 && (
          <div className="relative">
            <button 
              onClick={() => setShowVaultSelect(!showVaultSelect)}
              className="px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center bg-purple-600 hover:bg-purple-500 text-white"
              title="Save to Vault"
            >
              <Plus size={16} />
            </button>
            {showVaultSelect && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                <div className="p-2 text-xs font-bold text-white/40 uppercase border-b border-white/5">Select Vault</div>
                {vaults.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => handleAddToVault(v.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Editor = ({ onSave, user, vaults }: { onSave?: () => void, user: User | null, vaults: any[] }) => {
  const [config, setConfig] = useState<Partial<Crosshair>>({
    color: '#00ff00',
    outlines: true,
    outlineOpacity: 1,
    outlineThickness: 1,
    centerDot: false,
    dotOpacity: 1,
    dotThickness: 2,
    innerLines: true,
    innerOpacity: 1,
    innerLength: 6,
    innerThickness: 2,
    innerOffset: 3,
    outerLines: false,
    outerOpacity: 0.5,
    outerLength: 2,
    outerThickness: 2,
    outerOffset: 10,
    type: 'plus'
  });
  const [importCode, setImportCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  const update = (key: keyof Crosshair, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleImport = () => {
    if (!importCode.trim()) return;
    // Basic parser for demonstration
    const newConfig: Partial<Crosshair> = { ...config };
    if (importCode.includes('c;1')) newConfig.color = '#ffffff';
    if (importCode.includes('c;2')) newConfig.color = '#00ff00';
    if (importCode.includes('c;3')) newConfig.color = '#ffff00';
    if (importCode.includes('c;4')) newConfig.color = '#00ffff';
    if (importCode.includes('c;5')) newConfig.color = '#ff00ff';
    
    // Outlines
    if (importCode.includes('o;1')) newConfig.outlines = true;
    if (importCode.includes('o;0')) newConfig.outlines = false;
    
    // Center Dot
    if (importCode.includes('d;1')) newConfig.centerDot = true;
    if (importCode.includes('d;0')) newConfig.centerDot = false;
    
    // Inner Lines
    const innerLengthMatch = importCode.match(/0l;(\d+)/);
    if (innerLengthMatch) newConfig.innerLength = parseInt(innerLengthMatch[1]);
    const innerThicknessMatch = importCode.match(/0t;(\d+)/);
    if (innerThicknessMatch) newConfig.innerThickness = parseInt(innerThicknessMatch[1]);
    const innerOffsetMatch = importCode.match(/0o;(\d+)/);
    if (innerOffsetMatch) newConfig.innerOffset = parseInt(innerOffsetMatch[1]);
    
    setConfig(newConfig);
    setImportCode('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simple code generator
      const code = `0;P;c;${config.color?.replace('#', '')};o;${config.outlines ? '1' : '0'};d;${config.centerDot ? '1' : '0'};0l;${config.innerLength};0t;${config.innerThickness};0o;${config.innerOffset}`;
      const response = await fetch('/api/crosshairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Custom Crosshair',
          code,
          vaultId: selectedVaultId || null,
          ...config
        })
      });
      if (response.ok) {
        alert('Saved to Vault!');
        onSave?.();
      } else if (response.status === 401) {
        alert('Please login to save crosshairs!');
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    } finally {
      setSaving(false);
    }
  };

  const tutorialSteps = [
    {
      title: "Welcome to the Vault Editor",
      description: "This is where you craft your perfect aim. Let's walk through the core features.",
      target: "preview"
    },
    {
      title: "Real-time Preview",
      description: "Watch your crosshair change instantly as you adjust the sliders. This grid represents the in-game scale.",
      target: "preview"
    },
    {
      title: "Inner Lines",
      description: "The core of most crosshairs. Adjust length for visibility, thickness for precision, and offset for the 'gap'.",
      target: "inner-lines"
    },
    {
      title: "Outer Lines",
      description: "Used for movement/firing error or just as a secondary visual anchor. Many pros keep these off.",
      target: "outer-lines"
    },
    {
      title: "Outlines & Dot",
      description: "Outlines help your crosshair stand out against bright backgrounds. The center dot is great for precise headshots.",
      target: "visuals"
    },
    {
      title: "Save & Share",
      description: "Once you're happy, save it to your vault or copy the generated code to use in Valorant!",
      target: "actions"
    }
  ];

  const ControlGroup = ({ title, children, id }: { title: string, children: React.ReactNode, id?: string }) => (
    <div id={id} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
      <h4 className="text-sm font-black uppercase tracking-widest text-purple-400/80">{title}</h4>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const Slider = ({ label, value, min, max, step, onChange, description }: { label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void, description?: string }) => (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-tighter">{label}</label>
          {description && (
            <div className="relative group/info">
              <Info size={12} className="text-white/20 cursor-help" />
              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] text-white/60 opacity-0 group-hover/info:opacity-100 transition-opacity z-50 pointer-events-none">
                {description}
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{value}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );

  const Toggle = ({ label, active, onClick, icon: Icon, description }: { label: string, active: boolean, onClick: () => void, icon: any, description?: string }) => (
    <div className="flex flex-col gap-2">
      <button 
        onClick={onClick}
        className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${active ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-xs font-bold uppercase tracking-tighter">{label}</span>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-purple-500' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${active ? 'right-1' : 'left-1'}`} />
        </div>
      </button>
      {description && <p className="text-[10px] text-white/20 px-1">{description}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-20">
      {/* Tutorial Overlay */}
      <AnimatePresence>
        {tutorialStep !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-md p-8 rounded-3xl space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-purple-500" size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{tutorialSteps[tutorialStep].title}</h2>
              <p className="text-white/60 leading-relaxed">{tutorialSteps[tutorialStep].description}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTutorialStep(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 font-bold text-white/40 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={() => {
                    if (tutorialStep < tutorialSteps.length - 1) {
                      setTutorialStep(tutorialStep + 1);
                    } else {
                      setTutorialStep(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 transition-all"
                >
                  {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
              <div className="flex justify-center gap-1.5">
                {tutorialSteps.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === tutorialStep ? 'bg-purple-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Left Column: Preview & Code */}
      <div className="lg:col-span-4 space-y-6">
        <div id="preview" className="sticky top-8 space-y-6">
          <div className="aspect-[16/10] w-full max-w-[320px] mx-auto">
             <CrosshairPreview crosshair={config} />
          </div>
          
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Copy size={18} className="text-purple-500" /> Valorant Code
              </h3>
              <button 
                onClick={() => {
                  const code = `0;P;c;${config.color?.replace('#', '')};o;${config.outlines ? '1' : '0'};d;${config.centerDot ? '1' : '0'};0l;${config.innerLength};0t;${config.innerThickness};0o;${config.innerOffset}`;
                  navigator.clipboard.writeText(code);
                  alert('Code copied to clipboard!');
                }}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
              >
                Copy Code
              </button>
            </div>
            <div className="bg-black/40 p-4 rounded-xl font-mono text-xs text-purple-300 border border-purple-500/20 break-all leading-relaxed">
              0;P;c;{config.color?.replace('#', '')};o;{config.outlines ? '1' : '0'};d;{config.centerDot ? '1' : '0'};0l;${config.innerLength};0t;${config.innerThickness};0o;${config.innerOffset}
            </div>
          </div>

          <div id="actions" className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setTutorialStep(0)}
              className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <Info size={18} /> Tutorial
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} />}
              Save to Vault
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Controls */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Sliders className="text-purple-500" size={32} /> Customizer
          </h2>
          <div className="flex gap-2">
            {['#00ff00', '#ff0000', '#00ffff', '#ffffff', '#ffff00', '#ff00ff'].map(c => (
              <button 
                key={c}
                onClick={() => update('color', c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${config.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Visuals Group */}
          <ControlGroup id="visuals" title="General Visuals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle 
                label="Outlines" 
                active={config.outlines || false} 
                onClick={() => update('outlines', !config.outlines)}
                icon={Shield}
                description="Adds a black border to make the crosshair visible on all surfaces."
              />
              <Toggle 
                label="Center Dot" 
                active={config.centerDot || false} 
                onClick={() => update('centerDot', !config.centerDot)}
                icon={Zap}
                description="Adds a single pixel or larger dot in the exact center."
              />
            </div>
            {config.outlines && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Slider label="Outline Opacity" value={config.outlineOpacity || 0} min={0} max={1} step={0.1} onChange={(v) => update('outlineOpacity', v)} />
                <Slider label="Outline Thickness" value={config.outlineThickness || 0} min={1} max={6} step={1} onChange={(v) => update('outlineThickness', v)} />
              </div>
            )}
            {config.centerDot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Slider label="Dot Opacity" value={config.dotOpacity || 0} min={0} max={1} step={0.1} onChange={(v) => update('dotOpacity', v)} />
                <Slider label="Dot Thickness" value={config.dotThickness || 0} min={1} max={6} step={1} onChange={(v) => update('dotThickness', v)} />
              </div>
            )}
          </ControlGroup>

          {/* Inner Lines Group */}
          <ControlGroup id="inner-lines" title="Inner Lines">
            <Toggle 
              label="Show Inner Lines" 
              active={config.innerLines || false} 
              onClick={() => update('innerLines', !config.innerLines)}
              icon={Layout}
            />
            {config.innerLines && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Slider label="Opacity" value={config.innerOpacity || 0} min={0} max={1} step={0.1} onChange={(v) => update('innerOpacity', v)} description="How transparent the lines are." />
                <Slider label="Length" value={config.innerLength || 0} min={0} max={20} step={1} onChange={(v) => update('innerLength', v)} description="The length of each crosshair line." />
                <Slider label="Thickness" value={config.innerThickness || 0} min={1} max={10} step={1} onChange={(v) => update('innerThickness', v)} description="How wide the lines are." />
                <Slider label="Offset" value={config.innerOffset || 0} min={0} max={20} step={1} onChange={(v) => update('innerOffset', v)} description="The distance from the center." />
              </div>
            )}
          </ControlGroup>

          {/* Outer Lines Group */}
          <ControlGroup id="outer-lines" title="Outer Lines">
            <Toggle 
              label="Show Outer Lines" 
              active={config.outerLines || false} 
              onClick={() => update('outerLines', !config.outerLines)}
              icon={Plus}
            />
            {config.outerLines && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Slider label="Opacity" value={config.outerOpacity || 0} min={0} max={1} step={0.1} onChange={(v) => update('outerOpacity', v)} />
                <Slider label="Length" value={config.outerLength || 0} min={0} max={20} step={1} onChange={(v) => update('outerLength', v)} />
                <Slider label="Thickness" value={config.outerThickness || 0} min={1} max={10} step={1} onChange={(v) => update('outerThickness', v)} />
                <Slider label="Offset" value={config.outerOffset || 0} min={0} max={40} step={1} onChange={(v) => update('outerOffset', v)} />
              </div>
            )}
          </ControlGroup>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'home' | 'browse' | 'editor' | 'tools' | 'pro' | 'vaults'>('home');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [dbStatus, setDbStatus] = useState<{ database: string, mode: string } | null>(null);
  const [crosshairs, setCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(true);
  const [vaults, setVaults] = useState<any[]>([]);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Status fetch failed');
      const data = await response.json();
      setDbStatus(data);
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    }
  };

  const fetchCrosshairs = async () => {
    try {
      const response = await fetch('/api/crosshairs');
      if (!response.ok) throw new Error('Crosshairs fetch failed');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCrosshairs(data);
      } else {
        console.error("Expected array from /api/crosshairs, got:", data);
        setCrosshairs([]);
      }
    } catch (err) {
      console.error(err);
      setCrosshairs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaults = async () => {
    try {
      const response = await fetch('/api/vaults');
      if (!response.ok) throw new Error('Vaults fetch failed');
      const data = await response.json();
      if (Array.isArray(data)) setVaults(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkStatus();
    checkAuth();
    fetchCrosshairs();
  }, []);

  useEffect(() => {
    if (user) fetchVaults();
  }, [user]);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setShowAuthModal(false);
        fetchVaults();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to submit');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setView('home');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      code: formData.get('code'),
      vaultId: formData.get('vaultId') || null,
      author: user?.username || 'Community User'
    };

    try {
      const response = await fetch('/api/crosshairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setShowSubmitModal(false);
        fetchCrosshairs();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to submit');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <div className="mesh-background" />

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {authMode === 'login' ? 'Welcome Back' : 'Join the Vault'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Username</label>
                  <input name="username" required type="text" placeholder="Your username" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Password</label>
                  <input name="password" required type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all">
                  {authMode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>

              <div className="text-center text-sm text-white/40">
                {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-purple-400 font-bold hover:underline"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubmitModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6"
            >
              <h2 className="text-2xl font-black">SUBMIT NEW CODE</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Crosshair Name</label>
                  <input name="name" required type="text" placeholder="e.g. TenZ Final" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Valorant Code</label>
                  <input name="code" required type="text" placeholder="0;P;c;5;o;1..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-purple-500" />
                </div>
                {user && vaults.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase">Add to Vault (Optional)</label>
                    <select name="vaultId" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none">
                      <option value="">Public Gallery</option>
                      {vaults.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 shadow-lg shadow-purple-500/20">Submit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <header className="flex flex-wrap justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto gap-4">
        <div 
          className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-3"
          onClick={() => setView('home')}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-baseline">
              VALO<span className="text-purple-500">X</span>VAULT
            </div>
          </div>
          {dbStatus?.mode === 'demo' && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold hidden sm:inline-block">
              Demo Mode
            </span>
          )}
        </div>

        <div className="flex gap-2 md:gap-4 order-2 md:order-3">
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="hidden sm:block px-3 md:px-5 py-2 rounded-xl border border-white/10 text-xs md:text-sm font-bold hover:bg-white/5 transition-all"
              >
                Submit
              </button>
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <UserIcon size={14} className="text-purple-400" />
                <span className="text-xs md:text-sm font-bold truncate max-w-[80px] md:max-w-none">{user.username}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="px-3 md:px-5 py-2 rounded-xl border border-white/10 text-xs md:text-sm font-bold hover:bg-white/5 transition-all"
              >
                Login
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                className="px-3 md:px-5 py-2 rounded-xl bg-purple-600 text-xs md:text-sm font-bold hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        <nav className="flex overflow-x-auto w-full md:w-auto gap-6 md:gap-8 text-sm font-medium text-white/60 order-3 md:order-2 pb-2 md:pb-0 scrollbar-hide">
          <button onClick={() => setView('browse')} className={`whitespace-nowrap hover:text-white transition-colors ${view === 'browse' ? 'text-white' : ''}`}>Browse</button>
          <button onClick={() => setView('editor')} className={`whitespace-nowrap hover:text-white transition-colors ${view === 'editor' ? 'text-white' : ''}`}>Editor</button>
          <button onClick={() => setView('pro')} className={`whitespace-nowrap hover:text-white transition-colors ${view === 'pro' ? 'text-white' : ''}`}>Pro Profiles</button>
          {user && <button onClick={() => setView('vaults')} className={`whitespace-nowrap hover:text-white transition-colors ${view === 'vaults' ? 'text-white' : ''}`}>My Vaults</button>}
          <button onClick={() => setView('tools')} className={`whitespace-nowrap hover:text-white transition-colors ${view === 'tools' ? 'text-white' : ''}`}>Tools</button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              {/* Hero */}
              <section className="text-center space-y-8 pt-12">
                <motion.h1 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter"
                >
                  PERFECT YOUR AIM.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">BUILD YOUR EDGE.</span>
                </motion.h1>
                <p className="text-white/40 max-w-2xl mx-auto text-base md:text-lg">
                  Empowering players with a curated collection of proven Valorant crosshair codes, real-time previews and community insights.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setView('browse')}
                    className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 rounded-2xl font-bold text-base md:text-lg hover:bg-purple-500 transition-all shadow-xl shadow-purple-500/20"
                  >
                    Browse All Crosshairs
                  </button>
                  <button 
                    onClick={() => setView('editor')}
                    className="px-6 md:px-8 py-3 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-base md:text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    Open Advanced Editor
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 pt-12">
                  {['⭐ 1M+ Crosshairs Used', '⭐ Pro-Player Voted', '⭐ VLR.gg Recommended', '📋 Instant Copy-Paste'].map((stat, i) => (
                    <div key={i} className="glass-stat px-6 py-3 rounded-2xl text-sm font-medium text-white/80">
                      {stat}
                    </div>
                  ))}
                </div>
              </section>

              {/* Features */}
              <section className="space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black tracking-tight">THE VAULT: KEY FEATURES</h2>
                  <div className="h-1 w-20 bg-purple-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'PRO PRESETS', desc: 'Discover crosshairs from elite players.', icon: <Star className="text-yellow-400" /> },
                    { title: 'REAL-TIME PREVIEW', desc: 'Visualize your crosshair instantly.', icon: <Layout className="text-blue-400" /> },
                    { title: 'ADVANCED EDITOR', desc: 'Fine-tune color, thickness and behavior.', icon: <Sliders className="text-purple-400" /> },
                    { title: 'COMMUNITY TOP-RATED', desc: 'Browse popular designs from the community.', icon: <Zap className="text-orange-400" /> },
                    { title: 'ONE-CLICK COPY', desc: 'Instantly copy crosshair codes to clipboard.', icon: <Copy className="text-emerald-400" /> },
                    { title: 'EDITOR TUTORIAL', desc: 'Learn to master the editor settings.', icon: <Info className="text-pink-400" /> },
                  ].map((f, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -8 }}
                      className="glass-card p-6 md:p-8 rounded-3xl space-y-4 group cursor-default"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                        {f.icon}
                      </div>
                      <h3 className="font-bold text-xl">{f.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Featured Crosshairs */}
              <section className="space-y-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight">REAL PREVIEWS. PROVEN DESIGNS.</h2>
                    <p className="text-white/40">The most popular crosshairs used by the community this week.</p>
                  </div>
                  <button onClick={() => setView('browse')} className="text-purple-400 font-bold hover:text-purple-300 transition-colors flex items-center gap-2">
                    View All <Search size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                      <Loader2 className="animate-spin text-purple-500" size={40} />
                    </div>
                  ) : (
                    crosshairs.slice(0, 3).map(ch => (
                      <CrosshairCard key={ch.id} crosshair={ch} user={user} vaults={vaults} />
                    ))
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'browse' && (
            <motion.div 
              key="browse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <h1 className="text-4xl font-black tracking-tight">BROWSE VAULT</h1>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by player, team or name..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                  </div>
                ) : (
                  crosshairs.map(ch => (
                    <CrosshairCard key={ch.id} crosshair={ch} user={user} vaults={vaults} />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {view === 'editor' && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black tracking-tight">CROSSHAIR EDITOR</h1>
                <p className="text-white/40">Craft the perfect crosshair with our real-time visualizer.</p>
              </div>
              <Editor onSave={fetchCrosshairs} user={user} vaults={vaults} />
            </motion.div>
          )}
          {view === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black tracking-tight">VALORANT TOOLS</h1>
                <p className="text-white/40">Essential utilities to optimize your gameplay and economy.</p>
              </div>
              <Tools />
            </motion.div>
          )}

          {view === 'pro' && (
            <motion.div 
              key="pro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black tracking-tight">PRO PROFILES</h1>
                <p className="text-white/40">The exact settings and crosshairs used by the world's best players.</p>
              </div>
              <ProProfiles />
            </motion.div>
          )}

          {view === 'vaults' && user && (
            <motion.div 
              key="vaults"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Vaults user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 border-t border-white/5 mt-12 md:mt-24 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-white/20 text-sm text-center md:text-left">
        <div className="font-black tracking-tighter text-white/40 uppercase">VALOXVAULT</div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div>© 2026 VALOXVAULT. Not affiliated with Riot Games.</div>
      </footer>
    </div>
  );
}
