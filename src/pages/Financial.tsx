import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  PieChart as PieIcon,
  Filter,
  Plus
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
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
  Pie
} from 'recharts';

const Financial: React.FC = () => {
  const { clinic } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinic) return;

    const q = query(
      collection(db, 'clinics', clinic.id, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date?.toDate() || new Date() } as Transaction));
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinic.id}/transactions`);
    });

    return () => unsubscribe();
  }, [clinic]);

  const pieData = [
    { name: 'Procedimentos', value: 35000, color: '#6366f1' },
    { name: 'Consultas', value: 12000, color: '#f59e0b' },
    { name: 'Exames', value: 5000, color: '#10b981' },
  ];

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-clinora-night">Financeiro</h2>
          <p className="text-sm text-slate-500">Controle completo de fluxo de caixa e faturamento</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-clinora-soft px-5 py-2.5 rounded-xl font-bold hover:bg-clinora-soft transition-all shadow-sm">
            <Download className="w-5 h-5 text-slate-500" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center gap-2 bg-clinora-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-clinora-green-light transition-all shadow-md active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-clinora-green p-8 rounded-[32px] text-white shadow-xl shadow-clinora-green/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="font-bold">Saldo Total</span>
          </div>
          <p className="text-3xl font-black mb-1">{formatCurrency(totalIncome - totalExpense)}</p>
          <p className="text-clinora-soft text-sm opacity-80">+R$ 4.250 em relação ao mês anterior</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-clinora-soft shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-clinora-soft rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-clinora-green" />
            </div>
            <span className="font-bold text-clinora-night">Receitas</span>
          </div>
          <p className="text-3xl font-black text-clinora-night mb-1">{formatCurrency(totalIncome)}</p>
          <p className="text-clinora-green-light text-sm font-bold">128 entradas cadastradas</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-clinora-soft shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-bold text-clinora-night">Despesas</span>
          </div>
          <p className="text-3xl font-black text-clinora-night mb-1">{formatCurrency(totalExpense)}</p>
          <p className="text-red-500 text-sm font-bold">45 saídas cadastradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-clinora-soft shadow-sm overflow-hidden">
          <div className="p-8 border-b border-clinora-soft flex items-center justify-between">
            <h3 className="font-bold text-lg text-clinora-night">Transações Recentes</h3>
            <button className="p-2 hover:bg-clinora-soft rounded-xl transition-colors">
              <Filter className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">Nenhuma transação registrada.</div>
            ) : transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-5 group">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  t.type === 'income' ? "bg-clinora-soft text-clinora-green" : "bg-red-50 text-red-600"
                )}>
                  {t.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-clinora-night truncate">{t.description}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase">{t.category} • {formatDate(t.date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("font-bold text-lg", t.type === 'income' ? "text-clinora-green" : "text-red-600")}>
                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-8 rounded-[32px] border border-clinora-soft shadow-sm">
          <h3 className="font-bold text-lg text-clinora-night mb-8">Por Categoria</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <PieIcon className="w-6 h-6 text-slate-300" />
            </div>
          </div>
          <div className="space-y-4 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium text-slate-600">{item.name}</span>
                <span className="ml-auto text-sm font-bold text-clinora-night">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;
