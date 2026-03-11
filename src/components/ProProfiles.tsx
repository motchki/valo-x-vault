import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Copy, Check, Loader2 } from 'lucide-react';
import { CrosshairPreview, Crosshair } from './CrosshairPreview';

interface ProProfile {
  id: number;
  name: string;
  team: string;
  role: string;
  image_url: string;
  crosshair_code: string;
}

// Simple parser for Valorant crosshair codes
const parseCrosshairCode = (code: string): Partial<Crosshair> => {
  const config: Partial<Crosshair> = {
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
  };

  if (!code) return config;

  if (code.includes('c;1')) config.color = '#ffffff';
  if (code.includes('c;2')) config.color = '#00ff00';
  if (code.includes('c;3')) config.color = '#ffff00';
  if (code.includes('c;4')) config.color = '#00ffff';
  if (code.includes('c;5')) config.color = '#ff00ff';
  if (code.includes('o;1')) config.outlines = true;
  if (code.includes('o;0')) config.outlines = false;
  if (code.includes('d;1')) config.centerDot = true;
  if (code.includes('d;0')) config.centerDot = false;
  
  // Inner Lines
  const innerLengthMatch = code.match(/0l;(\d+)/);
  if (innerLengthMatch) config.innerLength = parseInt(innerLengthMatch[1]);
  const innerThicknessMatch = code.match(/0t;(\d+)/);
  if (innerThicknessMatch) config.innerThickness = parseInt(innerThicknessMatch[1]);
  const innerOffsetMatch = code.match(/0o;(\d+)/);
  if (innerOffsetMatch) config.innerOffset = parseInt(innerOffsetMatch[1]);
  
  // Outer Lines
  const outerLengthMatch = code.match(/1l;(\d+)/);
  if (outerLengthMatch) {
    config.outerLines = true;
    config.outerLength = parseInt(outerLengthMatch[1]);
  }
  const outerThicknessMatch = code.match(/1t;(\d+)/);
  if (outerThicknessMatch) config.outerThickness = parseInt(outerThicknessMatch[1]);
  const outerOffsetMatch = code.match(/1o;(\d+)/);
  if (outerOffsetMatch) config.outerOffset = parseInt(outerOffsetMatch[1]);

  return config;
};

export const ProProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/pro-profiles');
        const data = await response.json();
        if (Array.isArray(data)) {
          setProfiles(data);
        } else {
          console.error("Expected array from /api/pro-profiles, got:", data);
          setProfiles([]);
        }
      } catch (err) {
        console.error(err);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {profiles.map((profile) => (
        <motion.div
          key={profile.id}
          whileHover={{ y: -8 }}
          className="glass-card overflow-hidden rounded-3xl flex flex-col group"
        >
          <div className="relative h-64 overflow-hidden bg-[#0a0a0a]">
            <div className="absolute inset-0 z-0 opacity-40">
              <img 
                src={profile.image_url} 
                alt={profile.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 blur-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center p-12">
              <CrosshairPreview crosshair={parseCrosshairCode(profile.crosshair_code)} />
            </div>
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 z-30">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-[10px] font-bold uppercase tracking-wider">
                  {profile.team}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter">{profile.name}</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Crosshair Code</div>
              <div className="bg-black/40 p-3 rounded-xl font-mono text-xs text-white/60 break-all border border-white/5">
                {profile.crosshair_code}
              </div>
            </div>
            
            <button
              onClick={() => handleCopy(profile.id, profile.crosshair_code)}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                copiedId === profile.id ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {copiedId === profile.id ? <Check size={18} /> : <Copy size={18} />}
              {copiedId === profile.id ? 'Copied!' : 'Copy Pro Code'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
