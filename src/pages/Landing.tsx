import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

const Landing = ({ onStart }: { onStart: () => void }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Preciso instalar algum software?", a: "Não. A Clinora é 100% na nuvem. Acesse pelo navegador em qualquer computador, tablet ou celular, sem instalar nada." },
    { q: "Como funciona a migração dos meus dados?", a: "Nossa equipe faz a migração completa dos seus dados do sistema atual para a Clinora gratuitamente. O processo leva de 1 a 3 dias úteis e não interrompe o funcionamento da clínica." },
    { q: "A Clinora está em conformidade com a LGPD e o CFM?", a: "Sim. A Clinora utiliza criptografia AES-256, possui DPO nomeado, e o prontuário eletrônico segue a Resolução CFM 2.314/2022 com assinatura digital ICP-Brasil e retenção de 20 anos." },
    { q: "Posso usar em mais de uma unidade?", a: "Sim. O plano Pro suporta múltiplas unidades com BI unificado e benchmarking entre unidades. Redes e franquias têm condições especiais — fale com nosso time." },
    { q: "Como funciona o suporte?", a: "Todos os planos têm suporte por WhatsApp e email em horário comercial. O plano Pro tem suporte prioritário 24h. Também oferecemos treinamento online para toda a equipe." },
    { q: "O plano pode ser cancelado a qualquer momento?", a: "Sim. Sem fidelidade e sem multa. Se cancelar, mantém acesso até o fim do período pago e pode exportar todos os seus dados." },
  ];

  return (
    <div className="bg-clinora-white font-sans text-clinora-night selection:bg-clinora-soft selection:text-clinora-green">
      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-clinora-white/90 backdrop-blur-xl border-b border-clinora-soft px-[5%] py-4">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-8 h-8" />
            <span className="text-lg font-black tracking-tighter">Clinora</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-bold text-slate-500 hover:text-clinora-green transition-colors">Funcionalidades</a>
            <a href="#especialidades" className="text-sm font-bold text-slate-500 hover:text-clinora-green transition-colors">Especialidades</a>
            <a href="#precos" className="text-sm font-bold text-slate-500 hover:text-clinora-green transition-colors">Preços</a>
            <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-clinora-green transition-colors">FAQ</a>
          </div>
          <button 
            onClick={onStart}
            className="bg-[#0b1320] text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-black/10"
          >
            Acessar Plataforma
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto py-20 px-[5%] grid md:grid-cols-2 gap-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-clinora-soft text-clinora-green text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-clinora-green rounded-full" />
            Plataforma completa para clínicas
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            A gestão que a sua clínica <em className="italic text-clinora-green not-italic">merece</em>
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-[480px]">
            Agendamento online, prontuário eletrônico, financeiro completo e gestão de equipe — tudo integrado.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onStart} className="bg-[#0b1320] text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-2xl shadow-black/20">
              Começar grátis por 14 dias
            </button>
            <a href="#funcionalidades" className="bg-white border-2 border-clinora-soft px-8 py-4 rounded-2xl font-black text-clinora-night hover:border-clinora-green transition-all">
              Ver funcionalidades
            </a>
          </div>
          <div className="mt-10 flex items-center gap-6">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-clinora-soft ring-2 ring-clinora-white" />
               ))}
             </div>
             <p className="text-sm font-bold text-slate-400">+1.200 clínicas já confiam na Clinora</p>
          </div>
        </motion.div>

        <div className="relative flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full aspect-[4/3] rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50 relative group"
          >
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000" 
              alt="Clinora Plataforma" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex items-center gap-5">
              <Logo className="w-14 h-14" variant="light" />
              <div>
                <p className="text-white font-black text-xl leading-tight">Clínica Digital Clinora</p>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Sua gestão completa e segura</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos */}
      <div className="bg-clinora-night py-12">
        <div className="max-w-[1100px] mx-auto px-[5%] flex flex-wrap items-center justify-between gap-8 opacity-40 grayscale contrast-200">
           {['Clínica Saúde+', 'OdontoVida', 'EstéticaPro', 'DermaCenter', 'MedGroup'].map(logo => (
             <span key={logo} className="text-white font-black text-xl tracking-tighter italic uppercase">{logo}</span>
           ))}
        </div>
      </div>

      {/* Features */}
      <section id="funcionalidades" className="py-32 px-[5%] max-w-[1100px] mx-auto text-center">
        <div className="bg-clinora-soft text-clinora-green text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-6">Funcionalidades</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-16 leading-tight">Tudo que sua clínica precisa,<br />em uma plataforma só</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { t: 'Agendamento inteligente', d: 'Agenda online 24h, confirmação automática via WhatsApp e fila de espera digital.', i: '📅' },
            { t: 'Prontuário eletrônico', d: 'Templates personalizados, fotos antes/depois e assinatura digital ICP-Brasil.', i: '📋' },
            { t: 'Financeiro completo', d: 'Fluxo de caixa, emissão de NFS-e, gestão de convênios e comissões automáticas.', i: '💰' },
            { t: 'WhatsApp nativo', d: 'API oficial integrada para lembretes e campanhas de marketing automáticas.', i: '💬' },
            { t: 'Gestão de equipe', d: 'Permissões por função, controle de ponto e metas de faturamento por profissional.', i: '👥' },
            { t: 'BI e Relatórios', d: 'Dashboard em tempo real com ticket médio, LTV e taxa de ocupação da clínica.', i: '📊' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[48px] border border-clinora-soft hover:shadow-2xl hover:shadow-clinora-green/5 transition-all text-left group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform inline-block">{f.i}</div>
              <h3 className="text-lg font-black mb-3">{f.t}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section id="especialidades" className="bg-clinora-night py-32 px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-20">
             <div className="bg-clinora-green/20 text-clinora-green text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-6">Especialidades</div>
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Feita para o seu tipo de clínica</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: 'Odontologia', i: '🦷', d: 'Odontograma interativo' },
              { n: 'Clínica Médica', i: '🩺', d: 'Faturamento TISS' },
              { n: 'Estética', i: '✨', d: 'Evolução por fotos' },
              { n: 'Consultórios', i: '🏥', d: 'Prontuário rápido' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[40px] text-center hover:bg-white/10 transition-all cursor-default group">
                <div className="text-5xl mb-6 group-hover:rotate-12 transition-transform inline-block">{s.i}</div>
                <h3 className="text-white font-black text-lg mb-2">{s.n}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-32 px-[5%] max-w-[1100px] mx-auto">
        <div className="text-center mb-20">
           <div className="bg-clinora-soft text-clinora-green text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full inline-block mb-6">Preços</div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Planos para cada tamanho de clínica</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
           <div className="bg-white p-12 rounded-[48px] border border-clinora-soft transition-all h-full">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Solo</p>
             <div className="flex items-baseline gap-1 mb-8">
               <span className="text-4xl font-black text-clinora-night">R$ 197</span>
               <span className="text-slate-400 font-bold">/mês</span>
             </div>
             <ul className="space-y-4 mb-10">
               {['1 profissional', 'Agendamento online', 'WhatsApp automático', 'Financeiro básico'].map(f => (
                 <li key={f} className="text-sm font-bold text-slate-500 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-clinora-green rounded-full" />
                   {f}
                 </li>
               ))}
             </ul>
             <button onClick={onStart} className="w-full border-2 border-clinora-soft py-4 rounded-2xl font-black hover:border-clinora-green transition-all">Começar Agora</button>
           </div>

           <div className="bg-clinora-night p-12 rounded-[48px] shadow-2xl shadow-black/20 text-white relative h-full scale-105 border-4 border-clinora-green">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-clinora-green text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Mais Popular</div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Clínica</p>
             <div className="flex items-baseline gap-1 mb-8">
               <span className="text-4xl font-black">R$ 397</span>
               <span className="text-slate-500 font-bold">/mês</span>
             </div>
             <ul className="space-y-4 mb-10">
               {['Até 5 profissionais', 'Faturamento NFS-e', 'CRM completo', 'Estoque & Insumos', 'BI & Dashboards'].map(f => (
                 <li key={f} className="text-sm font-bold text-slate-300 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-clinora-green rounded-full" />
                   {f}
                 </li>
               ))}
             </ul>
             <button onClick={onStart} className="w-full bg-clinora-green text-white py-4 rounded-2xl font-black hover:bg-clinora-green-light transition-all shadow-xl shadow-clinora-green/20">Testar Grátis</button>
           </div>

           <div className="bg-white p-12 rounded-[48px] border border-clinora-soft transition-all h-full">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Pro</p>
             <div className="flex items-baseline gap-1 mb-8">
               <span className="text-4xl font-black text-clinora-night">R$ 797</span>
               <span className="text-slate-400 font-bold">/mês</span>
             </div>
             <ul className="space-y-4 mb-10">
               {['Ilimitados profissionais', 'Multi-unidade', 'API Pública', 'IA por voz', 'Prioridade 24h'].map(f => (
                 <li key={f} className="text-sm font-bold text-slate-500 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-clinora-green rounded-full" />
                   {f}
                 </li>
               ))}
             </ul>
             <button onClick={onStart} className="w-full border-2 border-clinora-soft py-4 rounded-2xl font-black hover:border-clinora-green transition-all">Falar com Time</button>
           </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-[5%] bg-clinora-white">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-3xl border border-clinora-soft overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 text-left flex items-center justify-between group"
                >
                  <span className="font-black text-lg group-hover:text-clinora-green transition-colors">{f.q}</span>
                  <span className="text-2xl text-slate-300 font-light">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="p-8 pt-0 text-slate-500 font-medium leading-relaxed border-t border-clinora-white">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-clinora-green py-24 px-[5%] text-center">
        <h2 className="text-5xl font-black text-white tracking-tight mb-8">Comece grátis hoje mesmo</h2>
        <p className="text-white/80 text-xl font-medium mb-12 max-w-[500px] mx-auto">
          14 dias sem cobrar nada. Sem cartão de crédito. Cancele quando quiser.
        </p>
        <button onClick={onStart} className="bg-white text-clinora-green px-12 py-5 rounded-[24px] font-black text-xl hover:bg-clinora-soft transition-all shadow-2xl active:scale-95">
          Criar conta grátis
        </button>
        <p className="text-white/40 text-xs font-bold mt-8 uppercase tracking-widest">Setup em 3 minutos • Migração gratuita</p>
      </section>

      <footer className="bg-clinora-night py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
             <div className="flex items-center gap-2.5 mb-6">
              <Logo className="w-8 h-8" />
              <span className="text-white text-lg font-black tracking-tighter">Clinora</span>
            </div>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">A plataforma que cuida da sua clínica para você cuidar dos seus pacientes.</p>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Produto</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><a href="#" className="hover:text-clinora-green">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-clinora-green">Especialidades</a></li>
              <li><a href="#" className="hover:text-clinora-green">Preços</a></li>
              <li><a href="#" className="hover:text-clinora-green">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Empresa</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><a href="#" className="hover:text-clinora-green">Sobre nós</a></li>
              <li><a href="#" className="hover:text-clinora-green">Blog</a></li>
              <li><a href="#" className="hover:text-clinora-green">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4 text-slate-500 text-sm font-bold">
              <li><a href="#" className="hover:text-clinora-green">Termos</a></li>
              <li><a href="#" className="hover:text-clinora-green">Privacidade</a></li>
              <li><a href="#" className="hover:text-clinora-green">LGPD</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
          <p className="text-slate-600 font-bold text-xs">© 2026 Clinora. Todos os direitos reservados.</p>
          <div className="flex gap-8 text-slate-600 font-bold text-xs italic">
            <span>Desenvolvido com ♥ no Brasil</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
