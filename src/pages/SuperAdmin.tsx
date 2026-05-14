import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Clinic, UserProfile } from '../types';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Cpu, 
  Activity, 
  Database,
  Search,
  Filter,
  CheckCircle2,
  Presentation
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { downloadPitchDeck } from '../lib/pptxService';

const SuperAdmin = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const clinicsSnapshot = await getDocs(query(collection(db, 'clinics'), limit(20)));
        const usersSnapshot = await getDocs(query(collection(db, 'users'), limit(50)));
        
        setClinics(clinicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Clinic)));
        setUsers(usersSnapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (error: any) {
        console.error('Error fetching system data:', error);
        // Better error reporting for the user
        const errorInfo = {
          message: error.message,
          code: error.code,
          path: error.path || 'unknown',
          auth: auth.currentUser?.email
        };
        alert(`Erro de Permissão: ${error.message}\nUsuário: ${auth.currentUser?.email}\nVerifique se este e-mail está na lista de Devs nas regras.`);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  const stats = [
    { label: 'Total Clínicas', value: clinics.length, icon: Building2, color: 'text-clinora-primary', bg: 'bg-clinora-soft' },
    { label: 'Usuários Ativos', value: users.length, icon: Users, color: 'text-clinora-action', bg: 'bg-blue-50' },
    { label: 'Saúde da API', value: '100%', icon: Activity, color: 'text-clinora-success', bg: 'bg-emerald-50' },
    { label: 'Database Load', value: '12%', icon: Database, color: 'text-clinora-amber', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-clinora-night tracking-tight">Painel Developer</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-clinora-success rounded-full animate-pulse" />
            <p className="text-slate-500 font-medium italic">Monitoramento global da Clinora</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => downloadPitchDeck()}
            className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-[24px] font-black hover:border-clinora-primary hover:text-clinora-primary transition-all active:scale-95"
          >
            <Presentation className="w-5 h-5" />
            <span>Baixar Pitch Deck</span>
          </button>
          <button className="flex items-center gap-2 bg-clinora-night text-white px-8 py-3 rounded-[24px] font-black hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95">
            <Cpu className="w-5 h-5" />
            <span>Deploy Sistema</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className={cn(stat.bg, "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12")}>
              <stat.icon className={stat.color + " w-7 h-7"} />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-3xl font-black text-clinora-night tracking-tight">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Clinics Table */}
        <div className="lg:col-span-2 bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-clinora-night tracking-tight">Estatísticas de Clínicas</h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">Empresas registradas no barramento central</p>
            </div>
            <div className="flex gap-2">
               <button className="p-3 text-slate-400 hover:bg-clinora-soft hover:text-clinora-primary rounded-2xl transition-all">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-3 text-slate-400 hover:bg-clinora-soft hover:text-clinora-primary rounded-2xl transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto text-sm">
            <table className="w-full">
              <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6 text-left">Empresa</th>
                  <th className="px-10 py-6 text-left">Código Único</th>
                  <th className="px-10 py-6 text-left">Segmento</th>
                  <th className="px-10 py-6 text-left">Status Infra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-clinora-white transition-colors group">
                    <td className="px-10 py-6 font-black text-clinora-night group-hover:text-clinora-primary transition-colors">{clinic.name}</td>
                    <td className="px-10 py-6 text-clinora-action font-mono font-black tracking-tighter">{clinic.companyCode || '-'}</td>
                    <td className="px-10 py-6">
                      <span className="bg-clinora-soft text-clinora-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {clinic.specialty}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-clinora-success font-black text-[10px] uppercase tracking-tighter">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Operacional</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-8">
          <div className="bg-clinora-night text-white rounded-[48px] p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-clinora-primary rounded-full -mr-16 -mt-16 blur-3xl opacity-30" />
             
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
              <Activity className="w-7 h-7 text-clinora-light" />
              Relatórios Globais
            </h3>
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-all">
                <span className="font-bold text-slate-300">Novos Usuários</span>
                <span className="text-clinora-light font-black">+12%</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-all">
                <span className="font-bold text-slate-300">Estabilidade</span>
                <span className="text-emerald-400 font-black">99.9%</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[24px] hover:bg-white/10 transition-all">
                <span className="font-bold text-slate-300">Recursos AWS/GCP</span>
                <span className="text-clinora-amber font-black">OK</span>
              </div>
            </div>
            <button className="w-full mt-10 py-5 bg-clinora-primary text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] hover:bg-clinora-light transition-all shadow-xl shadow-clinora-primary/20">
              Gerar Relatório
            </button>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm">
            <h3 className="text-lg font-black text-clinora-night mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-clinora-action" />
              Roadmap Clínico
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-tight">
                <div className="w-2 h-2 bg-clinora-soft border-2 border-clinora-primary rounded-full" />
                IA Predict de Faturamento
              </li>
              <li className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-tight">
                <div className="w-2 h-2 bg-clinora-soft border-2 border-clinora-primary rounded-full" />
                Teleclínica Blue 2.0
              </li>
               <li className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-tight">
                <div className="w-2 h-2 bg-clinora-soft border-2 border-clinora-primary rounded-full" />
                Marketplace de Suplementos
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
