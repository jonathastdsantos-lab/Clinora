import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User as UserIcon, 
  MapPin,
  MoreHorizontal,
  X,
  Check,
  Search,
  Stethoscope
} from 'lucide-react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  setHours,
  setMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Patient, Professional, Appointment } from '../types';

const Agenda: React.FC = () => {
  const { clinic } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [realAppointments, setRealAppointments] = useState<Appointment[]>([]);
  
  const [newAppt, setNewAppt] = useState({
    patientId: '',
    professionalId: '',
    time: '09:00',
    type: 'Consulta'
  });

  const startDate = startOfWeek(currentDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));
  const hours = [...Array(14)].map((_, i) => i + 7);

  // Default professionals if none found
  const mockProfessionals: Professional[] = [
    { id: 'p1', name: 'Dr. Silva', role: 'professional', specialty: 'Clínico Geral', registration: 'CRM 12345', email: 'silva@clinora.com' },
    { id: 'p2', name: 'Dra. Santos', role: 'professional', specialty: 'Dentista', registration: 'CRO 98765', email: 'santos@clinora.com' }
  ];

  useEffect(() => {
    if (!clinic) return;

    const unsubPatients = onSnapshot(collection(db, 'clinics', clinic.id, 'patients'), 
      (snap) => {
        setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, `clinics/${clinic.id}/patients`)
    );

    const unsubAppts = onSnapshot(
      query(collection(db, 'clinics', clinic.id, 'appointments'), orderBy('startTime', 'asc')), 
      (snap) => {
        setRealAppointments(snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate() || new Date()
          } as Appointment;
        }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, `clinics/${clinic.id}/appointments`)
    );

    // Attempt to fetch professionals, fallback to mocks if empty
    const unsubProfs = onSnapshot(collection(db, 'clinics', clinic.id, 'professionals'), 
      (snap) => {
        if (snap.empty) {
          setProfessionals(mockProfessionals);
        } else {
          setProfessionals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Professional)));
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `clinics/${clinic.id}/professionals`)
    );

    return () => {
      unsubPatients();
      unsubAppts();
      unsubProfs();
    };
  }, [clinic]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic || !newAppt.patientId || !newAppt.professionalId) return;

    const [hour, minute] = newAppt.time.split(':');
    const startTime = setMinutes(setHours(selectedDay, parseInt(hour)), parseInt(minute));
    const endTime = addDays(startTime, 0); // simplified for now

    const patient = patients.find(p => p.id === newAppt.patientId);
    const professional = professionals.find(p => p.id === newAppt.professionalId);

    const path = `clinics/${clinic.id}/appointments`;
    try {
      await addDoc(collection(db, path), {
        patientId: newAppt.patientId,
        patientName: patient?.name,
        professionalId: newAppt.professionalId,
        professionalName: professional?.name,
        startTime,
        endTime,
        status: 'scheduled',
        procedure: newAppt.type,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewAppt({ patientId: '', professionalId: '', time: '09:00', type: 'Consulta' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const dailySummary = {
    total: realAppointments.filter(a => isSameDay(a.startTime, selectedDay)).length,
    confirmed: realAppointments.filter(a => isSameDay(a.startTime, selectedDay) && a.status === 'confirmed').length,
    pending: realAppointments.filter(a => isSameDay(a.startTime, selectedDay) && a.status === 'scheduled').length,
  };

  const occupancy = dailySummary.total > 0 ? Math.min(100, Math.round((dailySummary.total / 12) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* Header Agenda */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <p className="text-sm text-slate-500">Gerencie seus compromissos e horários</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-100 p-1 shadow-sm">
            <button 
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button 
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-clinora-soft rounded-2xl flex items-center justify-center text-clinora-primary">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-clinora-night">Novo Agendamento</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateAppointment} className="space-y-6">
                  {/* Patient Selection */}
                  <div>
                    <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Selecionar Paciente</label>
                    <div className="relative">
                      <select 
                        value={newAppt.patientId}
                        onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}
                        className="w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium appearance-none"
                        required
                      >
                        <option value="">Selecione um paciente...</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <UserIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* Professional Selection */}
                  <div>
                    <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Profissional Responsável</label>
                    <div className="relative">
                      <select 
                        value={newAppt.professionalId}
                        onChange={e => setNewAppt({...newAppt, professionalId: e.target.value})}
                        className="w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium appearance-none"
                        required
                      >
                        <option value="">Selecione o profissional...</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>
                        ))}
                      </select>
                      <Stethoscope className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Horário</label>
                      <input 
                        type="time" 
                        value={newAppt.time}
                        onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                        className="w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-clinora-night mb-2 ml-1">Tipo de Procedimento</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Limpeza, Canal..."
                        value={newAppt.type}
                        onChange={e => setNewAppt({...newAppt, type: e.target.value})}
                        className="w-full px-5 py-4 bg-clinora-white border-none rounded-2xl focus:ring-2 focus:ring-clinora-green transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-clinora-night text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 mt-4"
                  >
                    <Check className="w-6 h-6 text-clinora-green" />
                    <span>Confirmar Agendamento</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Week View Bar */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, i) => (
          <button 
            key={i}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "flex flex-col items-center p-4 rounded-2xl transition-all border",
              isSameDay(day, selectedDay)
                ? "bg-slate-900 border-slate-900 shadow-lg shadow-slate-200"
                : "bg-white border-slate-100 hover:border-slate-300"
            )}
          >
            <span className={cn("text-xs font-bold uppercase mb-1", isSameDay(day, selectedDay) ? "text-slate-400" : "text-slate-400")}>
              {format(day, "eee", { locale: ptBR })}
            </span>
            <span className={cn("text-xl font-black", isSameDay(day, selectedDay) ? "text-white" : "text-slate-900")}>
              {format(day, "d")}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline View */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-bold text-lg text-slate-900">Agenda do Dia</h3>
          </div>
          <div className="p-8 max-h-[600px] overflow-y-auto custom-scrollbar">
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="group relative h-20 border-t border-slate-100 last:border-b">
                  <span className="absolute -top-3 -left-12 text-xs font-bold text-slate-300">
                    {hour < 10 ? `0${hour}` : hour}:00
                  </span>
                  
                  {/* Appointment Rendering */}
                  {realAppointments
                    .filter(a => isSameDay(a.startTime, selectedDay))
                    .filter(a => format(a.startTime, 'HH:00') === `${hour < 10 ? '0' + hour : hour}:00`)
                    .map((appt) => (
                      <motion.div 
                        key={appt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-2 left-4 right-4 bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-xl z-10 shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-indigo-900 text-sm">
                              {appt.patientName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Stethoscope className="w-3 h-3 text-indigo-400" />
                              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight">
                                {appt.professionalName} • {appt.procedure}
                              </p>
                            </div>
                          </div>
                          <button className="p-1 hover:bg-white/50 rounded-lg text-indigo-400 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details / Side Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl shadow-slate-200">
            <h3 className="font-bold text-lg mb-4">Resumo do Dia</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Total de Pacientes</span>
                <span className="text-white font-bold">{dailySummary.total}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Confirmados</span>
                <span className="text-emerald-400 font-bold">{dailySummary.confirmed}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Pendentes</span>
                <span className="text-amber-400 font-bold">{dailySummary.pending}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm">Ocupação da Agenda</span>
                <span className="text-xl font-bold">{occupancy}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-6">Salas Ocupadas</h3>
            <div className="space-y-4">
              {['Consultório 01', 'Consultório 02', 'RX Central'].map((sala, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    i === 0 ? "bg-emerald-500" : (i === 1 ? "bg-amber-500" : "bg-slate-200")
                  )}></div>
                  <span className="text-sm font-medium text-slate-700">{sala}</span>
                  <span className="ml-auto text-xs text-slate-400 font-bold">
                    {i === 2 ? 'Livre' : 'Ocupada'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
