import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  PieChart as PieIcon,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Logo } from '../components/Logo';

const Financial: React.FC = () => {
  const { clinic } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'transactions'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    status: 'received' as 'received' | 'pending',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !newTransaction.amount || !newTransaction.description) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'clinics', clinic.id, 'transactions'), {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewTransaction({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        status: 'received',
      });
    } catch (error: any) {
      handleFirestoreError(error, OperationType.WRITE, `clinics/${clinic.id}/transactions`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!clinic) return;

    const q = query(
      collection(db, 'clinics', clinic.id, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        date: doc.data().date?.toDate() || new Date() 
      } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinic.id}/transactions`);
    });

    return () => unsubscribe();
  }, [clinic]);

  // Derived Data
  const stats = useMemo(() => {
    const incomeTotal = transactions.filter(t => t.type === 'income' && t.status === 'received').reduce((acc, t) => acc + t.amount, 0);
    const expenseTotal = transactions.filter(t => t.type === 'expense' && t.status === 'received').reduce((acc, t) => acc + t.amount, 0);
    const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const balance = incomeTotal - expenseTotal;

    return { 
      totalIncome: incomeTotal, 
      totalExpense: expenseTotal, 
      outstanding: pendingTotal, 
      balance, 
      pendingCount: transactions.filter(t => t.status === 'pending').length 
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const months: Record<string, { name: string; income: number; expense: number }> = {};
    const last6MonthsNames = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('pt-BR', { month: 'short' });
    }).reverse();

    last6MonthsNames.forEach(m => {
      months[m] = { name: m, income: 0, expense: 0 };
    });

    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleString('pt-BR', { month: 'short' });
      if (months[month] && t.status === 'received') {
        if (t.type === 'income') months[month].income += t.amount;
        else months[month].expense += t.amount;
      }
    });

    return Object.values(months);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#0D7A5F', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-clinora-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-clinora-night rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-black text-clinora-night tracking-tight">Finanças</h2>
          </div>
          <p className="text-slate-500 font-medium text-lg">Visão estratégica do seu faturamento e fluxo de caixa.</p>
        </div>
        
        <div className="flex p-1.5 bg-white border border-slate-100 rounded-[28px] shadow-sm">
          <button 
            onClick={() => setActiveView('overview')}
            className={cn(
              "px-8 py-3.5 rounded-[22px] text-sm font-black transition-all",
              activeView === 'overview' ? "bg-clinora-night text-white shadow-xl shadow-black/20" : "text-slate-400 hover:text-clinora-night"
            )}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveView('transactions')}
            className={cn(
              "px-8 py-3.5 rounded-[22px] text-sm font-black transition-all",
              activeView === 'transactions' ? "bg-clinora-night text-white shadow-xl shadow-black/20" : "text-slate-400 hover:text-clinora-night"
            )}
          >
            Lançamentos
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'overview' ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-10"
          >
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-clinora-night p-8 rounded-[48px] text-white shadow-2xl shadow-clinora-night/20 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Disponível</span>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Saldo em Caixa</h3>
                <p className="text-4xl font-black tracking-tighter mb-2">{formatCurrency(stats.balance)}</p>
                <div className="flex items-center gap-2 text-clinora-green text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  <span>+R$ 4.250 este mês</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 transition-transform group-hover:rotate-12">
                    <ArrowUpRight className="w-6 h-6 text-clinora-green" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Receitas</span>
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Recebido</h3>
                <p className="text-4xl font-black text-clinora-night tracking-tighter mb-2">{formatCurrency(stats.totalIncome)}</p>
                <p className="text-clinora-green text-xs font-bold uppercase tracking-tighter tracking-widest tracking-widest">Mês de Maio</p>
              </div>

              <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 transition-transform group-hover:-rotate-12">
                    <ArrowDownLeft className="w-6 h-6 text-rose-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Despesas</span>
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Pago</h3>
                <p className="text-4xl font-black text-clinora-night tracking-tighter mb-2">{formatCurrency(stats.totalExpense)}</p>
                <p className="text-rose-500 text-xs font-bold uppercase tracking-tighter uppercase tracking-widest">Saídas confirmadas</p>
              </div>

              <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                <div className="flex items-center justify-between mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                    stats.outstanding > 0 ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-slate-100"
                  )}>
                    <Clock className={cn("w-6 h-6", stats.outstanding > 0 ? "text-clinora-amber" : "text-slate-300")} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">A Receber</span>
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Pendentes</h3>
                <p className={cn("text-4xl font-black tracking-tighter mb-2", stats.outstanding > 0 ? "text-clinora-amber" : "text-slate-200")}>
                  {formatCurrency(Math.abs(stats.outstanding))}
                </p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{stats.pendingCount} Lançamentos abertos</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Trends Chart */}
              <div className="lg:col-span-2 bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-clinora-soft rounded-full -mr-40 -mt-40 blur-[100px] opacity-40 pointer-events-none" />
                
                <div className="flex items-center justify-between mb-12 relative">
                  <div>
                    <h4 className="font-black text-2xl text-clinora-night tracking-tight">Fluxo de Caixa Mensal</h4>
                    <p className="text-sm text-slate-400 font-medium">Comparativo de performance semestral</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-clinora-night" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receitas</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-rose-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Despesas</span>
                    </div>
                  </div>
                </div>

                <div className="h-[380px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                        tickFormatter={(val) => `R$ ${val/1000}k`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC', radius: 16 }}
                        contentStyle={{ 
                          borderRadius: '32px', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.12)', 
                          padding: '24px' 
                        }}
                        formatter={(val: number) => [formatCurrency(val)]}
                      />
                      <Bar 
                        dataKey="income" 
                        fill="#0B1320" 
                        radius={[12, 12, 4, 4]} 
                        barSize={32}
                      />
                      <Bar 
                        dataKey="expense" 
                        fill="#F43F5E" 
                        radius={[12, 12, 4, 4]} 
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Outstanding Actions */}
              <div className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h4 className="font-black text-2xl text-clinora-night tracking-tight">Pendências</h4>
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-clinora-amber" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  {transactions.filter(t => t.status === 'pending').slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-5 group cursor-pointer p-4 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border",
                        t.type === 'income' ? "bg-emerald-50 border-emerald-100 text-clinora-green" : "bg-rose-50 border-rose-100 text-rose-500"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-clinora-night text-sm truncate uppercase tracking-tight">{t.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("font-black text-sm", t.type === 'income' ? "text-clinora-green" : "text-rose-500")}>
                          {formatCurrency(t.amount)}
                        </p>
                        <ChevronRight className="w-4 h-4 text-slate-200 ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}

                  {stats.pendingCount === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
                      <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mb-6">
                        <DollarSign className="w-10 h-10 text-clinora-green opacity-40" />
                      </div>
                      <p className="font-black text-clinora-night tracking-tight uppercase text-xs">Sem Pendências</p>
                      <p className="text-slate-400 text-sm mt-2 font-medium px-4">Todas as transações do mês foram processadas com sucesso.</p>
                    </div>
                  )}
                </div>

                <button className="mt-8 w-full py-5 bg-clinora-soft text-clinora-night font-black rounded-3xl text-xs uppercase tracking-[0.2em] hover:bg-clinora-night hover:text-white transition-all">
                  Ver Todo Histórico
                </button>
              </div>
            </div>

            {/* Bottom Section: Categories + Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="bg-white p-12 rounded-[64px] border border-slate-100 shadow-sm lg:flex items-center">
                 <div className="lg:w-1/2 flex flex-col items-center">
                    <div className="h-[280px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <PieIcon className="w-8 h-8 text-slate-200" />
                      </div>
                    </div>
                 </div>
                 <div className="lg:w-1/2 mt-10 lg:mt-0 lg:pl-10 space-y-6">
                    <div>
                      <h4 className="font-black text-2xl text-clinora-night tracking-tight">Categorias</h4>
                      <p className="text-sm text-slate-400 font-medium">Fontes de arrecadação</p>
                    </div>
                    <div className="space-y-4">
                       {categoryData.map((item, index) => (
                         <div key={item.name} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                               <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-clinora-night transition-colors">{item.name}</span>
                            </div>
                            <span className="font-black text-sm text-clinora-night">{formatCurrency(item.value)}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>

               <div className="bg-emerald-900 p-12 rounded-[64px] text-white relative overflow-hidden flex flex-col justify-between group">
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full -mb-48 -mr-48 blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
                  <div>
                    <h4 className="text-4xl font-black tracking-tight mb-4">Gerencie sua expansão</h4>
                    <p className="text-white/60 font-medium text-lg leading-relaxed max-w-sm">Acompanhe métricas avançadas de crescimento e lucratividade média por profissional.</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-4 mt-12 relative">
                    <button className="flex-1 flex items-center bg-white/10 hover:bg-white/20 p-6 rounded-[32px] border border-white/10 transition-all group">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-clinora-green transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Exportar</p>
                        <p className="font-black text-sm uppercase tracking-tight">Relatório DRE</p>
                      </div>
                    </button>
                    <button className="flex-1 flex items-center bg-white/10 hover:bg-white/20 p-6 rounded-[32px] border border-white/10 transition-all group">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-clinora-green transition-colors">
                        <Download className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Arquivos</p>
                        <p className="font-black text-sm uppercase tracking-tight">Extrato Mensal</p>
                      </div>
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden"
          >
             <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="font-black text-2xl text-clinora-night tracking-tight">Registro de Operações</h3>
               <div className="flex gap-4">
                  <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-2xl border border-slate-200">
                    <Filter className="w-4 h-4 text-slate-400 mr-2" />
                    <select className="bg-transparent border-none focus:outline-none text-xs font-black uppercase tracking-widest text-slate-500 outline-none">
                      <option>Todos Lançamentos</option>
                      <option>Apenas Receitas</option>
                      <option>Apenas Despesas</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-clinora-night text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-clinora-light transition-all shadow-xl shadow-black/10 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Transação</span>
                  </button>
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="text-left border-b border-slate-100">
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {transactions.map((t) => (
                     <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-10 py-8">
                         <div className="flex items-center gap-3">
                           <Calendar className="w-4 h-4 text-slate-300" />
                           <span className="text-sm font-bold text-slate-600 tracking-tight">{formatDate(t.date)}</span>
                         </div>
                       </td>
                       <td className="px-10 py-8">
                         <p className="font-black text-clinora-night text-base leading-tight group-hover:text-clinora-primary transition-colors">{t.description}</p>
                       </td>
                       <td className="px-10 py-8">
                         <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                           {t.category}
                         </span>
                       </td>
                       <td className="px-10 py-8">
                         <div className="flex justify-center">
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                              t.status === 'received' ? "bg-emerald-50 border-emerald-100 text-clinora-green" : 
                              t.status === 'pending' ? "bg-orange-50 border-orange-100 text-clinora-amber" : 
                              "bg-rose-50 border-rose-100 text-rose-500"
                            )}>
                              {t.status === 'received' ? 'Recebido' : t.status === 'pending' ? 'Pendente' : 'Cancelado'}
                            </span>
                         </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                         <span className={cn(
                           "text-xl font-black tracking-tighter",
                           t.type === 'income' ? "text-clinora-green font-black" : "text-rose-500 font-bold"
                         )}>
                           {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             {transactions.length === 0 && (
               <div className="text-center py-32 bg-slate-50/20">
                  <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                    <DollarSign className="w-10 h-10 text-slate-200" />
                  </div>
                  <h4 className="text-2xl font-black text-clinora-night mb-2 tracking-tight">Nenhum registro encontrado</h4>
                  <p className="text-slate-400 font-medium max-w-sm mx-auto">Toda gestão financeira do seu negócio começa registrando seu primeiro lançamento aqui.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-8 px-8 py-4 bg-clinora-night text-white rounded-3xl font-black tracking-widest uppercase text-xs hover:bg-clinora-primary transition-all shadow-xl shadow-black/10 active:scale-95"
                  >
                    Adicionar agora
                  </button>
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-clinora-night/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-clinora-night tracking-tight uppercase">Novo Lançamento</h3>
                    <p className="text-slate-400 font-medium mt-1 uppercase text-xs tracking-widest font-black">Registro de entrada ou saída</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-slate-300 rotate-45" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex p-1.5 bg-slate-50 rounded-[28px] border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                        newTransaction.type === 'income' ? "bg-white text-clinora-green shadow-xl shadow-clinora-green/10 border border-slate-100" : "text-slate-400"
                      )}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Receita
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-4 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all",
                        newTransaction.type === 'expense' ? "bg-white text-rose-500 shadow-xl shadow-rose-500/10 border border-slate-100" : "text-slate-400"
                      )}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      Despesa
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Descrição</label>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Consulta Odontológica"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-clinora-night focus:bg-white rounded-3xl px-6 py-4 text-clinora-night font-bold transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Valor (R$)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-clinora-night focus:bg-white rounded-3xl px-6 py-4 text-clinora-night font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria</label>
                      <select
                        required
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-clinora-night focus:bg-white rounded-3xl px-6 py-4 text-clinora-night font-bold transition-all outline-none appearance-none"
                      >
                        <option value="">Selecione...</option>
                        {newTransaction.type === 'income' ? (
                          <>
                            <option value="Consulta">Consulta</option>
                            <option value="Procedimento">Procedimento</option>
                            <option value="Exame">Exame</option>
                            <option value="Outros">Outros</option>
                          </>
                        ) : (
                          <>
                            <option value="Aluguel">Aluguel</option>
                            <option value="Suprimentos">Suprimentos</option>
                            <option value="Salários">Salários</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Outros">Outros</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Status</label>
                      <select
                        value={newTransaction.status}
                        onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-clinora-night focus:bg-white rounded-3xl px-6 py-4 text-clinora-night font-bold transition-all outline-none appearance-none"
                      >
                        <option value="received">{newTransaction.type === 'income' ? 'Recebido' : 'Pago'}</option>
                        <option value="pending">Pendente</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] py-5 bg-clinora-night text-white font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-clinora-primary transition-all shadow-xl shadow-black/20 disabled:opacity-50"
                    >
                      {submitting ? 'Salvando...' : 'Confirmar Lançamento'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Financial;
