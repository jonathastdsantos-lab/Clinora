import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Patient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Patients: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { clinic } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', cpf: '' });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === 'name') {
      newErrors.name = value.trim().length < 3 ? 'O nome deve ter pelo menos 3 caracteres.' : '';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      newErrors.email = value && !emailRegex.test(value) ? 'E-mail inválido.' : '';
    }
    if (name === 'phone') {
      const phoneDigits = value.replace(/\D/g, '');
      newErrors.phone = value && phoneDigits.length < 10 ? 'Telefone deve ter pelo menos 10 dígitos.' : '';
    }
    setErrors(newErrors);
  };

  useEffect(() => {
    if (!clinic) return;

    const q = query(
      collection(db, 'clinics', clinic.id, 'patients'),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
      setPatients(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinic.id}/patients`);
    });

    return () => unsubscribe();
  }, [clinic]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = newPatient.phone.replace(/\D/g, '');
    
    if (newPatient.name.trim().length < 3 || 
        (newPatient.email && !emailRegex.test(newPatient.email)) || 
        (newPatient.phone && phoneDigits.length < 10)) {
      validateField('name', newPatient.name);
      validateField('email', newPatient.email);
      validateField('phone', newPatient.phone);
      return;
    }

    if (!clinic) return;

    try {
      await addDoc(collection(db, 'clinics', clinic.id, 'patients'), {
        ...newPatient,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewPatient({ name: '', email: '', phone: '', cpf: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-clinora-night">Pacientes</h2>
          <p className="text-sm text-slate-500">{patients.length} pacientes cadastrados no total</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-clinora-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-clinora-green-light transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Cadastrar Paciente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white border border-clinora-soft rounded-2xl flex items-center px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-clinora-green transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou e-mail..." 
            className="bg-transparent border-none focus:outline-none w-full text-sm font-medium text-clinora-night"
          />
        </div>
        <button className="bg-white border border-clinora-soft px-4 py-3 rounded-2xl text-slate-600 hover:bg-clinora-soft transition-all shadow-sm">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-[32px] border border-clinora-soft shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clinora-white/50 border-b border-clinora-soft">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Paciente</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Última Visita</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinora-soft">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400">Carregando pacientes...</td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400">Nenhum paciente encontrado.</td></tr>
              ) : patients.map((patient) => (
                <React.Fragment key={patient.id}>
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "hover:bg-slate-50/30 transition-colors group cursor-pointer",
                      selectedPatientId === patient.id && "bg-clinora-soft/50"
                    )}
                    onClick={() => setSelectedPatientId(selectedPatientId === patient.id ? null : patient.id)}
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4 group">
                        <div className="w-14 h-14 bg-clinora-soft text-clinora-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-transform group-hover:scale-110">
                          {patient.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-clinora-night text-base">{patient.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-0.5">{patient.cpf || 'Sem CPF'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[150px]">{patient.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span>{patient.createdAt ? '12/05/2026' : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                        <ChevronRight className={cn("w-5 h-5 transition-transform", selectedPatientId === patient.id && "rotate-90")} />
                      </button>
                    </td>
                  </motion.tr>
                  <AnimatePresence>
                    {selectedPatientId === patient.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-clinora-white/30"
                      >
                        <td colSpan={4} className="px-10 py-8">
                          <div className="bg-white rounded-3xl border border-clinora-soft p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                              <div className="flex-1 space-y-6">
                                {/* Expanded Header */}
                                <div className="pb-6 border-b border-clinora-soft">
                                  <h4 className="text-lg font-black text-clinora-night mb-4">Detalhes do Paciente</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-clinora-soft rounded-xl flex items-center justify-center text-clinora-green">
                                        <Phone className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</p>
                                        <p className="text-sm font-bold text-clinora-night">{patient.phone || 'Não informado'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-clinora-soft rounded-xl flex items-center justify-center text-clinora-green">
                                        <Mail className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</p>
                                        <p className="text-sm font-bold text-clinora-night">{patient.email || 'Não informado'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-clinora-soft rounded-xl flex items-center justify-center text-clinora-green">
                                        <CalendarIcon className="w-5 h-5" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Visita</p>
                                        <p className="text-sm font-bold text-clinora-night">12 de Maio, 2026</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-4">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigate?.('agenda');
                                    }}
                                    className="flex items-center gap-2 bg-clinora-night text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Agendar Consulta</span>
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigate?.('records');
                                    }}
                                    className="flex items-center gap-2 bg-white border border-clinora-soft text-clinora-night px-6 py-3 rounded-xl font-bold text-sm hover:bg-clinora-soft transition-all shadow-sm active:scale-95"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Ver Prontuário</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-clinora-night">Novo Paciente</h3>
                    <p className="text-slate-500">Preencha as informações básicas para o prontuário.</p>
                  </div>
                  <Users className="w-10 h-10 text-clinora-soft" />
                </div>

                 <form onSubmit={handleCreatePatient} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Nome Completo</label>
                       <input 
                        type="text" 
                        value={newPatient.name}
                        onChange={e => {
                          const val = e.target.value;
                          setNewPatient({...newPatient, name: val});
                          validateField('name', val);
                        }}
                        onBlur={e => validateField('name', e.target.value)}
                        className={cn(
                          "w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium",
                          errors.name && "ring-2 ring-red-400"
                        )}
                        required
                       />
                       {errors.name && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.name}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Telefone</label>
                       <input 
                        type="text" 
                        value={newPatient.phone}
                        onChange={e => {
                          const val = e.target.value;
                          setNewPatient({...newPatient, phone: val});
                          validateField('phone', val);
                        }}
                        onBlur={e => validateField('phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                        className={cn(
                          "w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium",
                          errors.phone && "ring-2 ring-red-400"
                        )}
                       />
                       {errors.phone && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.phone}</p>}
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">E-mail</label>
                       <input 
                        type="email" 
                        value={newPatient.email}
                        onChange={e => {
                          const val = e.target.value;
                          setNewPatient({...newPatient, email: val});
                          validateField('email', val);
                        }}
                        onBlur={e => validateField('email', e.target.value)}
                        placeholder="exemplo@email.com"
                        className={cn(
                          "w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium",
                          errors.email && "ring-2 ring-red-400"
                        )}
                       />
                       {errors.email && <p className="text-red-500 text-xs mt-2 ml-1 font-bold">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-clinora-soft rounded-2xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-clinora-green text-white py-4 rounded-2xl font-bold hover:bg-clinora-green-light transition-all shadow-lg active:scale-95"
                    >
                      Salvar Paciente
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

export default Patients;
