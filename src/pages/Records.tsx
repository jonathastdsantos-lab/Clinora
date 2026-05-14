import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Mic, 
  Search, 
  Plus, 
  Image as ImageIcon,
  History,
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  Phone,
  Mail,
  Activity,
  ClipboardList
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, limit, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { HealthRecord, Patient } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

import { uploadFile } from '../lib/supabase';

const Records: React.FC = () => {
  const { clinic } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clinic) return;

    setIsUploading(true);
    try {
      const path = `${clinic.id}/${Date.now()}-${file.name}`;
      // Recomendação: Criar bucket 'clinic-assets' como público no Supabase Console
      const url = await uploadFile('clinic-assets', path, file);
      setUploadedImages(prev => [...prev, url]);
    } catch (error) {
      console.error('Erro no upload Supabase:', error);
      alert('Certifique-se de que o bucket "clinic-assets" foi criado publicamente no seu Supabase Console.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!clinic) return;
    
    // Fetch Patients
    const qPatients = query(collection(db, 'clinics', clinic.id, 'patients'), limit(10));
    const unsubPatients = onSnapshot(qPatients, (snap) => {
      setPatients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinic.id}/patients`);
    });

    return () => unsubPatients();
  }, [clinic]);

  useEffect(() => {
    if (!clinic || !selectedPatient) return;

    const qRecords = query(
      collection(db, 'clinics', clinic.id, 'healthRecords'),
      where('patientId', '==', selectedPatient.id),
      orderBy('createdAt', 'desc')
    );

    const unsubRecords = onSnapshot(qRecords, (snap) => {
      const fetchedRecords = snap.docs.map(d => {
        const data = d.data();
        let createdAt: Date;
        
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAt = data.createdAt.toDate();
        } else if (data.createdAt) {
          createdAt = new Date(data.createdAt);
        } else {
          createdAt = new Date();
        }

        return { 
          id: d.id, 
          ...data, 
          createdAt 
        } as HealthRecord;
      });
      setRecords(fetchedRecords);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `clinics/${clinic.id}/healthRecords`);
    });

    return () => unsubRecords();
  }, [clinic, selectedPatient]);

  const handleTranscribe = async () => {
    setIsRecording(true);
    // Mocking AI Transcription call
    setTimeout(() => {
      setNewContent(prev => prev + (prev ? "\n\n" : "") + "O paciente apresenta melhora no quadro clínico. Recomenda-se continuidade do tratamento e retorno em 15 dias para nova avaliação de rotina.");
      setIsRecording(false);
    }, 2000);
  };

  const handleSaveRecord = async () => {
    if (!clinic || !selectedPatient || !newContent.trim()) return;

    const path = `clinics/${clinic.id}/healthRecords`;
    try {
      await addDoc(collection(db, path), {
        patientId: selectedPatient.id,
        content: newContent,
        type: 'evolution',
        createdAt: serverTimestamp(),
        assets: uploadedImages
      });
      setNewContent('');
      setUploadedImages([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] -m-8 gap-0">
      {/* Patient List Sidebar */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-clinora-soft">
          <h3 className="font-bold text-clinora-night mb-4">Prontuário Eletrônico</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..." 
              className="w-full bg-clinora-white border-none rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-clinora-green"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {patients.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPatient(p)}
              className={cn(
                "w-full p-6 text-left border-b border-clinora-soft hover:bg-clinora-soft transition-colors",
                selectedPatient?.id === p.id && "bg-clinora-soft border-l-4 border-l-clinora-green"
              )}
            >
              <p className="font-bold text-clinora-night mb-1">{p.name}</p>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">CPF: {p.cpf || '---'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* EHR Area */}
      <div className="flex-1 bg-[#F8FAFC] flex flex-col overflow-hidden">
        {selectedPatient ? (
          <>
            <div className="p-8 bg-white border-b border-clinora-soft flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-clinora-green text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-clinora-green/20">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-clinora-night">{selectedPatient.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    {selectedPatient.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-clinora-green" /> 
                        {selectedPatient.phone}
                      </span>
                    )}
                    {selectedPatient.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-clinora-green" /> 
                        {selectedPatient.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><History className="w-3.5 h-3.5" /> Última consulta: 12/05/2026</span>
                    <span className="flex items-center gap-1 font-medium text-clinora-blue"><CheckCircle className="w-3.5 h-3.5" /> Plano Ativo</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <label className={cn(
                  "p-3 bg-white border border-slate-200 rounded-xl hover:bg-clinora-soft transition-colors text-slate-600 shadow-sm cursor-pointer",
                  isUploading && "opacity-50 animate-pulse pointer-events-none"
                )}>
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
                <button className="flex items-center gap-2 bg-clinora-green text-white px-6 py-3 rounded-xl font-bold hover:bg-clinora-green-light transition-all shadow-md">
                  <Plus className="w-5 h-5" />
                  <span>Nova Evolução</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Preview of Uploaded Images (Supabase) */}
              {uploadedImages.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-100 flex-shrink-0 group">
                      <img src={url} alt="upload" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* New Record Compose */}
              <div className="bg-white rounded-[32px] border border-clinora-soft shadow-lg shadow-clinora-night/5 p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Nova entrada no prontuário</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleTranscribe}
                      disabled={isRecording}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        isRecording ? "bg-red-50 text-red-500 animate-pulse" : "bg-clinora-soft text-clinora-green hover:bg-clinora-soft/80"
                      )}
                    >
                      <Mic className="w-4 h-4" />
                      {isRecording ? "Ouvindo..." : "Ditado por IA"}
                    </button>
                  </div>
                </div>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Descreva a evolução do paciente ou utilize o ditado inteligente..."
                  className="w-full h-40 bg-clinora-white border-none rounded-2xl p-6 text-clinora-night placeholder:text-slate-400 focus:ring-2 focus:ring-clinora-green transition-all resize-none mb-6"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleSaveRecord}
                    disabled={!newContent.trim()}
                    className="flex items-center gap-2 bg-clinora-green text-white px-8 py-3 rounded-xl font-bold hover:bg-clinora-green-light transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>Salvar Registro</span>
                  </button>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-6">
                <h4 className="font-bold text-clinora-night ml-2">Histórico Cronológico</h4>
                {records.length === 0 ? (
                  <div className="p-10 text-center bg-white rounded-[32px] border border-dashed border-clinora-soft">
                    <div className="w-16 h-16 bg-clinora-white rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhum histórico disponível para este paciente.</p>
                  </div>
                ) : records.map((record) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={record.id} 
                    className="bg-white p-8 rounded-[32px] border border-clinora-soft shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-clinora-green"></div>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                          record.type === 'evolution' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {record.type === 'evolution' ? <Activity className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                             <div className="px-3 py-1 bg-clinora-night text-white text-[10px] font-black rounded-lg uppercase tracking-tighter">
                              {record.type}
                            </div>
                            <span className="text-sm font-bold text-slate-400">{formatDate(record.createdAt)}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-500">Registro por Dr. {clinic?.name || 'Plantão'}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-clinora-night p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                      <ReactMarkdown>{record.content}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6">
               <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Selecione um Paciente</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Escolha um paciente da lista lateral para visualizar seu histórico médico, fotos e evoluções.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Records;
