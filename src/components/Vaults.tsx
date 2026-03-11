import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Share2, Copy, Check, Loader2, Folder, ArrowLeft, UserPlus } from 'lucide-react';
import { CrosshairPreview, Crosshair } from './CrosshairPreview';

interface Vault {
  id: number;
  name: string;
  invite_code: string;
  owner_id: number;
}

export const Vaults: React.FC<{ user: any }> = ({ user }) => {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [vaultCrosshairs, setVaultCrosshairs] = useState<Crosshair[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const res = await fetch('/api/vaults');
      const data = await res.json();
      if (Array.isArray(data)) setVaults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaultCrosshairs = async (vaultId: number) => {
    try {
      const res = await fetch(`/api/crosshairs?vaultId=${vaultId}`);
      const data = await res.json();
      if (Array.isArray(data)) setVaultCrosshairs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVault = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      const res = await fetch('/api/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchVaults();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinVault = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inviteCode = formData.get('inviteCode') as string;

    try {
      const res = await fetch('/api/vaults/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      });
      if (res.ok) {
        setShowJoinModal(false);
        fetchVaults();
      } else {
        alert('Invalid invite code');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  if (selectedVault) {
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setSelectedVault(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Vaults
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">{selectedVault.name}</h2>
            <p className="text-white/40">Collaborative Vault • {vaultCrosshairs.length} Crosshairs</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Invite Code</span>
              <code className="font-mono text-purple-400">{selectedVault.invite_code}</code>
              <button 
                onClick={() => copyInviteCode(selectedVault.invite_code)}
                className="text-white/40 hover:text-white transition-colors"
              >
                {copiedCode ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        {vaultCrosshairs.length === 0 ? (
          <div className="glass-card p-20 rounded-3xl text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Plus size={40} className="text-white/20" />
            </div>
            <h3 className="text-xl font-bold">This vault is empty</h3>
            <p className="text-white/40 max-w-xs mx-auto">Start adding crosshairs to this collaborative vault from the editor or browse sections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vaultCrosshairs.map((crosshair) => (
              <motion.div 
                key={crosshair.id}
                whileHover={{ y: -6 }}
                className="glass-card p-6 rounded-2xl flex flex-col gap-4 group"
              >
                <div className="h-40">
                  <CrosshairPreview crosshair={crosshair} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{crosshair.name}</h3>
                  <p className="text-xs text-white/40">by {crosshair.author}</p>
                </div>
                <div className="bg-black/40 p-2 rounded-lg font-mono text-[10px] text-white/60 truncate border border-white/5">
                  {crosshair.code}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">My Vaults</h2>
          <p className="text-white/40">Group and share crosshairs with your team.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} /> Join Vault
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Plus size={18} /> Create Vault
          </button>
        </div>
      </div>

      {vaults.length === 0 ? (
        <div className="glass-card p-20 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
            <Folder size={40} className="text-purple-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">No Vaults Found</h3>
            <p className="text-white/40 max-w-sm mx-auto">Vaults allow you to group crosshairs and invite friends to collaborate on a shared collection.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-purple-600 rounded-2xl font-bold hover:bg-purple-500 transition-all"
          >
            Create Your First Vault
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vaults.map((vault) => (
            <motion.div 
              key={vault.id}
              whileHover={{ y: -8 }}
              onClick={() => {
                setSelectedVault(vault);
                fetchVaultCrosshairs(vault.id);
              }}
              className="glass-card p-8 rounded-3xl cursor-pointer group border border-white/5 hover:border-purple-500/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Folder size={24} className="text-purple-500 group-hover:text-white transition-colors" />
                </div>
                <div className="flex items-center gap-1 text-white/20">
                  <Users size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{vault.name}</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                <span>Invite Code:</span>
                <span className="text-purple-400/60">{vault.invite_code}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase">Create New Vault</h2>
              <form onSubmit={handleCreateVault} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Vault Name</label>
                  <input name="name" required type="text" placeholder="e.g. Team Liquid Strats" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 shadow-lg shadow-purple-500/20">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJoinModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 rounded-3xl relative z-10 space-y-6"
            >
              <h2 className="text-2xl font-black uppercase">Join a Vault</h2>
              <form onSubmit={handleJoinVault} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase">Invite Code</label>
                  <input name="inviteCode" required type="text" placeholder="ENTER CODE" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono focus:outline-none focus:border-purple-500 text-center text-xl tracking-widest" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-purple-600 font-bold hover:bg-purple-500 shadow-lg shadow-purple-500/20">Join</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
