import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Plus,
  Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200",
      active 
        ? "bg-clinora-primary text-white shadow-lg shadow-clinora-primary/20" 
        : "text-slate-500 hover:bg-clinora-soft hover:text-clinora-primary"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

interface Props {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<Props> = ({ children, activeTab, setActiveTab }) => {
  const { clinic, profile, logout } = useAuth();

  return (
    <div className="flex h-screen bg-clinora-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Logo className="w-10 h-10 shadow-lg shadow-clinora-primary/20" />
          <div>
            <h1 className="font-display font-black text-clinora-night text-xl leading-tight">Clinora</h1>
            <p className="text-[10px] font-bold text-clinora-light uppercase tracking-widest">{clinic?.name || 'Gestão que cuida'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={Calendar} 
            label="Agenda" 
            active={activeTab === 'agenda'} 
            onClick={() => setActiveTab('agenda')} 
          />
          <NavItem 
            icon={Users} 
            label="Pacientes" 
            active={activeTab === 'patients'} 
            onClick={() => setActiveTab('patients')} 
          />
          <NavItem 
            icon={FileText} 
            label="Prontuários" 
            active={activeTab === 'records'} 
            onClick={() => setActiveTab('records')} 
          />
          <NavItem 
            icon={DollarSign} 
            label="Financeiro" 
            active={activeTab === 'financial'} 
            onClick={() => setActiveTab('financial')} 
          />
          <NavItem 
            icon={Settings} 
            label="Configurações" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          {profile?.role === 'super-admin' && (
            <NavItem 
              icon={Shield} 
              label="Super Admin" 
              active={activeTab === 'superadmin'} 
              onClick={() => setActiveTab('superadmin')} 
            />
          )}
        </nav>

        <div className="pt-6 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-clinora-soft flex items-center justify-center text-clinora-primary font-bold shadow-sm">
              {profile?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-clinora-night truncate">{profile?.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-clinora-error hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 bg-clinora-white px-5 py-2.5 rounded-2xl w-96 border border-slate-50">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:bg-clinora-soft hover:text-clinora-primary rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-clinora-error rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 bg-clinora-primary text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-clinora-light transition-all shadow-lg shadow-clinora-primary/20 active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
