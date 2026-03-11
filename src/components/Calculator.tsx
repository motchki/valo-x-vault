import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator as CalcIcon, User, Shield, Zap, Target, MousePointer2, TrendingUp, DollarSign, Crosshair, Timer, Map, Dices, Activity } from 'lucide-react';

const ToolCard: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, description, icon, children }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="glass-card p-6 rounded-2xl space-y-4 flex flex-col"
  >
    <div className="flex flex-col border-b border-white/5 pb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
          {icon}
        </div>
        <h3 className="font-bold text-lg tracking-tight uppercase">{title}</h3>
      </div>
      <p className="text-xs text-white/40">{description}</p>
    </div>
    <div className="flex-1 space-y-4 pt-2">
      {children}
    </div>
  </motion.div>
);

export const Tools: React.FC = () => {
  // 1. KDA
  const [kda, setKda] = useState({ k: 0, d: 0, a: 0 });
  const calcKDA = () => {
    if (kda.d === 0) return `Perfect! KDA: ${kda.k + kda.a}`;
    return ((kda.k + kda.a) / kda.d).toFixed(2);
  };

  // 2. Full Buy
  const [credits, setCredits] = useState(0);
  const canFullBuy = () => {
    const needed = 3900;
    if (credits >= needed) return `Yes! You have ${credits - needed} left for abilities.`;
    return `No, you need ${needed - credits} more credits.`;
  };

  // 3. Agent Roulette
  const [role, setRole] = useState('Duelist');
  const [selectedAgent, setSelectedAgent] = useState('');
  const agents: Record<string, string[]> = {
    Duelist: ['Jett', 'Reyna', 'Phoenix', 'Raze', 'Yoru', 'Neon', 'Iso'],
    Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko'],
    Controller: ['Omen', 'Brimstone', 'Viper', 'Astra', 'Harbor', 'Clove'],
    Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse']
  };
  const rollAgent = () => {
    const list = agents[role];
    const random = list[Math.floor(Math.random() * list.length)];
    setSelectedAgent(random);
  };

  // 4. Defuse Timer
  const [defuse, setDefuse] = useState({ time: 7, isHalf: false });
  const evalDefuse = () => {
    const needed = defuse.isHalf ? 3.5 : 7.0;
    return defuse.time >= needed ? "You have time! EZ defuse." : "Not enough time! Run and save.";
  };

  // 5. Sensitivity
  const [csSens, setCsSens] = useState(1);
  const valSens = (csSens / 3.181818).toFixed(3);

  // 6. Loss Bonus
  const [losses, setLosses] = useState(1);
  const getLossBonus = () => {
    if (losses === 1) return 1900;
    if (losses === 2) return 2400;
    return 2900;
  };

  // 7. Weapon Choice
  const [distance, setDistance] = useState(15);
  const getWeapon = () => distance > 15 ? "Vandal. Secure the 'One Tap' at long range." : "Phantom. Faster fire rate and no bullet tracers.";

  // 8. Drop Checker
  const [drop, setDrop] = useState({ allyCreds: 3900, weaponCost: 2900 });
  const canDrop = () => {
    if (drop.allyCreds >= drop.weaponCost + 3900) return "Yes! They can full buy and drop you.";
    if (drop.allyCreds >= drop.weaponCost) return "They can drop, but it will ruin their economy.";
    return "No, they don't even have enough for the weapon.";
  };

  // 9. ACS Estimator
  const [acs, setAcs] = useState({ damage: 0, rounds: 1 });
  const getACS = () => acs.rounds === 0 ? 0 : Math.round(acs.damage / acs.rounds);

  // 10. Ult Progress
  const [ult, setUlt] = useState({ k: 0, d: 0, o: 0, p: 0, def: 0 });
  const totalUlt = ult.k + ult.d + ult.o + ult.p + ult.def;

  // 11. Map Roulette
  const maps = ['Ascent', 'Bind', 'Breeze', 'Fracture', 'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset', 'Abyss'];
  const [selectedMap, setSelectedMap] = useState('');
  const rollMap = () => {
    const random = maps[Math.floor(Math.random() * maps.length)];
    setSelectedMap(random);
  };

  // 12. Strat Roulette
  const strats = [
    "Rush B, no stopping!",
    "Everyone buy Judges and hide in smokes.",
    "Bucky only, crab walk everywhere.",
    "Protect the President (one player gets a Vandal, rest get classics and body block).",
    "Odin go brrrrr (everyone buys Odin).",
    "Fake A, Fake B, go C (or back to A).",
    "Classic right-click only.",
    "No abilities allowed this round.",
    "Play from spawn with Operators/Marshals.",
    "Follow the bottom fragger blindly."
  ];
  const [selectedStrat, setSelectedStrat] = useState('');
  const rollStrat = () => {
    const random = strats[Math.floor(Math.random() * strats.length)];
    setSelectedStrat(random);
  };

  // 13. eDPI Calculator
  const [edpiInput, setEdpiInput] = useState({ dpi: 800, sens: 0.3 });
  const calcEdpi = () => (edpiInput.dpi * edpiInput.sens).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. KDA */}
      <ToolCard title="KDA Tool" description="Calculate your Kill/Death/Assist ratio." icon={<Target size={20} />}>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="K" className="bg-black/40 border border-white/10 rounded-lg p-2 text-center" onChange={e => setKda({...kda, k: Number(e.target.value)})} />
          <input type="number" placeholder="D" className="bg-black/40 border border-white/10 rounded-lg p-2 text-center" onChange={e => setKda({...kda, d: Number(e.target.value)})} />
          <input type="number" placeholder="A" className="bg-black/40 border border-white/10 rounded-lg p-2 text-center" onChange={e => setKda({...kda, a: Number(e.target.value)})} />
        </div>
        <div className="text-purple-400 font-bold text-center text-xl">{calcKDA()}</div>
      </ToolCard>

      {/* 2. Full Buy */}
      <ToolCard title="Full Buy Checker" description="Check if you can afford a full buy (3900 credits)." icon={<DollarSign size={20} />}>
        <input type="number" placeholder="Current Credits" className="w-full bg-black/40 border border-white/10 rounded-lg p-2" onChange={e => setCredits(Number(e.target.value))} />
        <div className="text-sm text-white/60">{canFullBuy()}</div>
      </ToolCard>

      {/* 3. Agent Roulette */}
      <ToolCard title="Agent Roulette" description="Can't decide who to play? Let fate decide." icon={<User size={20} />}>
        <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2" onChange={e => setRole(e.target.value)}>
          {Object.keys(agents).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={rollAgent} className="w-full py-2 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all">Roll Agent</button>
        {selectedAgent && <div className="text-center font-bold text-purple-400">Play as: {selectedAgent}</div>}
      </ToolCard>

      {/* 4. Defuse Timer */}
      <ToolCard title="Spike Defuse" description="Calculate if you have enough time to defuse." icon={<Timer size={20} />}>
        <div className="flex gap-4 items-center">
          <input type="number" step="0.1" placeholder="Secs" className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2" onChange={e => setDefuse({...defuse, time: Number(e.target.value)})} />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" onChange={e => setDefuse({...defuse, isHalf: e.target.checked})} /> Half Defuse
          </label>
        </div>
        <div className="text-sm text-white/60">{evalDefuse()}</div>
      </ToolCard>

      {/* 5. Sensitivity */}
      <ToolCard title="Sens Converter" description="Convert your CS:GO/CS2 sensitivity to Valorant." icon={<MousePointer2 size={20} />}>
        <div className="space-y-2">
          <label className="text-xs text-white/40">CS:GO / CS2 Sensitivity</label>
          <input type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-lg p-2" value={csSens} onChange={e => setCsSens(Number(e.target.value))} />
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">Valorant Sens</div>
          <div className="text-2xl font-bold text-purple-400">{valSens}</div>
        </div>
      </ToolCard>

      {/* 6. Loss Bonus */}
      <ToolCard title="Loss Bonus" description="Calculate your income based on consecutive losses." icon={<TrendingUp size={20} />}>
        <div className="space-y-2">
          <label className="text-xs text-white/40">Consecutive Losses</label>
          <input type="number" min="1" max="5" className="w-full bg-black/40 border border-white/10 rounded-lg p-2" value={losses} onChange={e => setLosses(Number(e.target.value))} />
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">Next Round Bonus</div>
          <div className="text-2xl font-bold text-emerald-400">+{getLossBonus()}</div>
        </div>
      </ToolCard>

      {/* 7. Vandal vs Phantom */}
      <ToolCard title="Vandal vs Phantom" description="Determine the best rifle based on engagement distance." icon={<Crosshair size={20} />}>
        <div className="space-y-2">
          <label className="text-xs text-white/40">Estimated Distance (m): {distance}m</label>
          <input type="range" min="0" max="50" className="w-full accent-purple-500" value={distance} onChange={e => setDistance(Number(e.target.value))} />
        </div>
        <div className="text-sm text-white/60">{getWeapon()}</div>
      </ToolCard>

      {/* 8. Drop Checker */}
      <ToolCard title="Can I get a Drop?" description="Check if your teammate can afford to buy you a weapon." icon={<Shield size={20} />}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase">Ally Credits</label>
            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm" value={drop.allyCreds} onChange={e => setDrop({...drop, allyCreds: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase">Weapon Cost</label>
            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm" value={drop.weaponCost} onChange={e => setDrop({...drop, weaponCost: Number(e.target.value)})} />
          </div>
        </div>
        <div className="text-xs text-white/60">{canDrop()}</div>
      </ToolCard>

      {/* 9. ACS Estimator */}
      <ToolCard title="ACS Estimator" description="Estimate your Average Combat Score." icon={<Zap size={20} />}>
        <div className="grid grid-cols-2 gap-2">
          <input type="number" placeholder="Total Damage" className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm" onChange={e => setAcs({...acs, damage: Number(e.target.value)})} />
          <input type="number" placeholder="Rounds" className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm" onChange={e => setAcs({...acs, rounds: Number(e.target.value)})} />
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">Estimated ACS</div>
          <div className="text-2xl font-bold text-purple-400">{getACS()}</div>
        </div>
      </ToolCard>

      {/* 10. Ult Progress */}
      <ToolCard title="Ultimate Progress" description="Track your ultimate points." icon={<CalcIcon size={20} />}>
        <div className="grid grid-cols-5 gap-1">
          {['K', 'D', 'O', 'P', 'Def'].map(label => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] text-white/40 text-center block">{label}</label>
              <input 
                type="number" 
                className="w-full bg-black/40 border border-white/10 rounded-lg p-1 text-center text-xs" 
                onChange={e => {
                  const val = Number(e.target.value);
                  if (label === 'K') setUlt({...ult, k: val});
                  if (label === 'D') setUlt({...ult, d: val});
                  if (label === 'O') setUlt({...ult, o: val});
                  if (label === 'P') setUlt({...ult, p: val});
                  if (label === 'Def') setUlt({...ult, def: val});
                }} 
              />
            </div>
          ))}
        </div>
        <div className="text-center font-bold text-purple-400">Total Points: {totalUlt}</div>
      </ToolCard>

      {/* 11. Map Roulette */}
      <ToolCard title="Map Roulette" description="Randomly pick a map for your next custom game." icon={<Map size={20} />}>
        <button onClick={rollMap} className="w-full py-4 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all">Roll Map</button>
        {selectedMap && <div className="text-center font-black text-2xl text-purple-400 uppercase tracking-widest">{selectedMap}</div>}
      </ToolCard>

      {/* 12. Strat Roulette */}
      <ToolCard title="Strat Roulette" description="Spice up your unrated games with random strats." icon={<Dices size={20} />}>
        <button onClick={rollStrat} className="w-full py-2 bg-purple-600 rounded-lg font-bold hover:bg-purple-500 transition-all">Get Strat</button>
        {selectedStrat && <div className="text-center font-bold text-emerald-400 text-sm italic">"{selectedStrat}"</div>}
      </ToolCard>

      {/* 13. eDPI Calculator */}
      <ToolCard title="eDPI Calculator" description="Calculate your effective DPI (DPI * Sensitivity)." icon={<Activity size={20} />}>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase">Mouse DPI</label>
            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm" value={edpiInput.dpi} onChange={e => setEdpiInput({...edpiInput, dpi: Number(e.target.value)})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase">In-Game Sens</label>
            <input type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm" value={edpiInput.sens} onChange={e => setEdpiInput({...edpiInput, sens: Number(e.target.value)})} />
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">Your eDPI</div>
          <div className="text-2xl font-bold text-purple-400">{calcEdpi()}</div>
        </div>
      </ToolCard>
    </div>
  );
};

