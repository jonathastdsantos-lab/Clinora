import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
  >
    <div className="flex items-start justify-between mb-6">
      <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter",
          trend === 'up' ? "text-clinora-success bg-emerald-50" : "text-clinora-error bg-rose-50"
        )}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-3xl font-black text-clinora-night tracking-tight">{value}</p>
  </motion.div>
);

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Dashboard: React.FC = () => {
  const { clinic } = useAuth();
  const [seeding, setSeeding] = useState(false);

  const seedDemoData = async () => {
    if (!clinic) return;
    setSeeding(true);
    try {
      // Seed Patients
      const patients = [
        { name: 'Ana Silva', email: 'ana@email.com', phone: '(11) 98888-7777', cpf: '123.456.789-01' },
        { name: 'Bernardo Costa', email: 'ber@email.com', phone: '(11) 97777-6666', cpf: '234.567.890-12' },
      ];
      
      for (const p of patients) {
        const pRef = await addDoc(collection(db, 'clinics', clinic.id, 'patients'), {
          ...p,
          createdAt: serverTimestamp()
        });

        // Seed Records for these patients
        await addDoc(collection(db, 'clinics', clinic.id, 'healthRecords'), {
          patientId: pRef.id,
          type: 'consultation',
          content: `Paciente ${p.name} compareceu para consulta de rotina. Relata bem-estar geral.`,
          createdAt: serverTimestamp()
        });
      }

      // Seed Transactions
      const trans = [
        { type: 'income', amount: 450, description: 'Consulta Ana Silva', category: 'Consulta', status: 'received' },
        { type: 'expense', amount: 1200, description: 'Aluguel Sala', category: 'Infraestrutura', status: 'received' },
      ];

      for (const t of trans) {
        await addDoc(collection(db, 'clinics', clinic.id, 'transactions'), {
          ...t,
          date: serverTimestamp()
        });
      }

      alert('Dados de demonstração carregados com sucesso!');
    } catch (error: any) {
      console.error(error);
      handleFirestoreError(error, OperationType.WRITE, `clinics/${clinic.id}/seed`);
    } finally {
      setSeeding(false);
    }
  };

  const chartData = [
    { name: 'Seg', valor: 4000 },
    { name: 'Ter', valor: 3000 },
    { name: 'Qua', valor: 5000 },
    { name: 'Qui', valor: 2780 },
    { name: 'Sex', valor: 1890 },
    { name: 'Sáb', valor: 2390 },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-clinora-night tracking-tight">Olá, {clinic?.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 font-medium">Aqui está o que está acontecendo na sua clínica hoje.</p>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-orange-100">
                <div className="w-1.5 h-1.5 bg-clinora-amber rounded-full animate-pulse" />
                Firebase
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-clinora-success rounded-lg text-[10px] font-black uppercase tracking-tighter border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-clinora-success rounded-full animate-pulse" />
                Supabase
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={seedDemoData}
          disabled={seeding}
          className="px-5 py-2.5 text-xs font-black text-slate-400 hover:text-clinora-primary border-2 border-slate-50 rounded-2xl hover:bg-clinora-soft transition-all disabled:opacity-50 uppercase tracking-widest"
        >
          {seeding ? "Carregando..." : "Dados de Demonstração"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Agendamentos Hoje" 
          value="18" 
          icon={Calendar} 
          trend="up" 
          trendValue="+12%" 
          color="bg-clinora-primary"
        />
        <StatCard 
          title="Novos Pacientes" 
          value="124" 
          icon={Users} 
          trend="up" 
          trendValue="+5%" 
          color="bg-clinora-light"
        />
        <StatCard 
          title="Faturamento Mensal" 
          value={formatCurrency(48250)} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+8%" 
          color="bg-clinora-amber"
        />
        <StatCard 
          title="Cancelamentos" 
          value="4.2%" 
          icon={TrendingDown} 
          trend="down" 
          trendValue="-2%" 
          color="bg-clinora-error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-clinora-soft rounded-full -mr-32 -mt-32 blur-[80px] opacity-30" />
          
          <div className="flex items-center justify-between mb-10 relative">
            <div>
              <h3 className="font-black text-2xl text-clinora-night tracking-tight">Faturamento Semanal</h3>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Receita bruta operacional</p>
            </div>
            <select className="bg-clinora-white border-2 border-clinora-soft rounded-2xl text-xs font-black px-5 py-2.5 focus:ring-clinora-green uppercase tracking-widest text-clinora-night outline-none">
              <option>Esta semana</option>
              <option>Última semana</option>
            </select>
          </div>
          <div className="h-[320px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D7A5F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D7A5F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(val) => `R$ ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  itemStyle={{ fontWeight: 800, color: '#0D7A5F' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#0B1320' }}
                  formatter={(val: number) => [formatCurrency(val), 'Faturamento']}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#0D7A5F" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small List: Next Appointments */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xl text-clinora-night tracking-tight">Próximos Pacientes</h3>
            <button className="text-xs text-clinora-primary font-black uppercase tracking-widest hover:underline">Ver Agenda</button>
          </div>
          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-5 group cursor-pointer">
                <div className="w-14 h-14 bg-clinora-soft rounded-[20px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6 text-clinora-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-black text-clinora-night truncate text-sm">Paciente de Teste {i}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulta de Rotina • 14:30</p>
                </div>
                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-clinora-primary group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
