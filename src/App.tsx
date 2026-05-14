import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Patients from './pages/Patients';
import Records from './pages/Records';
import Financial from './pages/Financial';
import SuperAdmin from './pages/SuperAdmin';
import Landing from './pages/Landing';
import { motion } from 'motion/react';
import { LogIn, Plus, Stethoscope, Scissors, Heart, Utensils, Settings, Shield } from 'lucide-react';
import { Logo } from './components/Logo';

const LoginPage = ({ onBack }: { onBack: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, companyCode);
    } catch (err: any) {
      setError(err.message === 'auth/invalid-credential' || err.code === 'auth/invalid-credential'
        ? 'Credenciais inválidas. Verifique os dados e tente novamente.'
        : err.message || 'Erro ao entrar na plataforma.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-clinora-night p-6">
      <div className="w-full max-w-md bg-white p-12 rounded-[48px] shadow-2xl shadow-black/20 border border-white/10 relative overflow-hidden">
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 text-slate-400 hover:text-clinora-primary font-black text-xs uppercase tracking-widest z-10"
        >
          ← Voltar
        </button>
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-clinora-soft rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
        
        <div className="text-center mb-10 relative">
          <Logo className="w-20 h-20 mx-auto mb-6 shadow-xl shadow-clinora-primary/30" />
          <h1 className="text-4xl font-black text-clinora-night mb-2 tracking-tight">Clinora</h1>
          <p className="text-slate-500 font-medium">Acesso Restrito</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-clinora-error rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Código da Empresa</label>
            <input 
              type="text" 
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="ex: sublime"
              className="w-full px-6 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-primary transition-all font-bold text-clinora-night"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail corporativo</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@clinora.com.br"
              className="w-full px-6 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-primary transition-all font-bold text-clinora-night"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Senha</label>
              <button type="button" className="text-xs font-bold text-clinora-primary hover:underline">Esqueceu a senha?</button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-primary transition-all font-bold text-clinora-night"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-clinora-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-clinora-light transition-all shadow-xl shadow-clinora-primary/20 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Verificando..." : "Entrar na Plataforma"}
          </button>
        </form>
        
        <p className="mt-10 text-center text-xs text-slate-400 font-medium">
          Problemas com o acesso? <button className="text-clinora-primary font-bold hover:underline">Fale com o suporte</button>
        </p>
      </div>
    </div>
  );
};

const OnboardingPage = () => {
  const { createClinic } = useAuth();
  const [name, setName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [specialty, setSpecialty] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const specialties = [
    { id: 'dentist', label: 'Dentista', icon: Scissors, color: 'bg-indigo-500' },
    { id: 'medical', label: 'Médico', icon: Stethoscope, color: 'bg-clinora-primary' },
    { id: 'aesthetic', label: 'Estética', icon: Heart, color: 'bg-rose-500' },
    { id: 'general', label: 'Geral', icon: Utensils, color: 'bg-clinora-amber' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty || !companyCode) return;
    setLoading(true);
    setError('');
    try {
      await createClinic(name, companyCode, specialty);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar sua clínica.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-clinora-white p-6">
      <div className="w-full max-w-3xl bg-white p-16 rounded-[64px] shadow-2xl shadow-slate-200 border border-slate-50">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-clinora-night mb-4 tracking-tight">Bem-vindo à Clinora</h1>
          <p className="text-slate-500 text-xl font-medium">A gestão de saúde que cuida de quem cuida.</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 text-clinora-error rounded-3xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nome da Clínica</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Clinora Saúde"
                className="w-full px-7 py-5 bg-clinora-white border-none rounded-3xl focus:ring-2 focus:ring-clinora-primary transition-all font-bold text-clinora-night text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Código Único (Slug)</label>
              <input 
                type="text" 
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="ex: clinora-premium"
                className="w-full px-7 py-5 bg-clinora-white border-none rounded-3xl focus:ring-2 focus:ring-clinora-primary transition-all font-bold text-clinora-night text-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-5 ml-1">Sua Especialidade</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {specialties.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSpecialty(item.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 rounded-[40px] border-4 transition-all group relative overflow-hidden",
                    specialty === item.id 
                      ? "border-clinora-primary bg-clinora-primary text-white scale-105 shadow-2xl shadow-clinora-primary/30" 
                      : "border-slate-50 bg-clinora-white hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg",
                    specialty === item.id ? "bg-white/20" : item.color
                  )}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-clinora-night text-white py-6 rounded-[32px] font-black text-2xl hover:bg-clinora-primary transition-all shadow-2xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 mt-6"
          >
            {loading ? "Configurando..." : "Finalizar Configuração"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Simple utility for CN in App.tsx
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const AppContent = () => {
  const { user, profile, clinic, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
    return <Landing onStart={() => setShowLogin(true)} />;
  }
  
  if (!clinic) return <OnboardingPage />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'agenda' && <Agenda />}
        {activeTab === 'patients' && <Patients onNavigate={setActiveTab} />}
        {activeTab === 'records' && <Records />}
        {activeTab === 'financial' && <Financial />}
        {activeTab === 'superadmin' && <SuperAdmin />}
        {activeTab === 'settings' && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-white rounded-[40px] border border-slate-100 p-12">
             <div className="text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Configurações do Sistema</h3>
              <p className="font-medium max-w-sm">Personalize horários de funcionamento, equipe, logotipo e integrações com WhatsApp e Notas Fiscais.</p>
              <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                Abrir Painel de Controle
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

