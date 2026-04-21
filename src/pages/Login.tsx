import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { ArrowLeft, Layout } from 'lucide-react';

interface LoginProps {
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50"></div>

      <Card className="max-w-md w-full shadow-2xl border-none rounded-[2rem] relative z-10 overflow-hidden">
        <CardContent className="p-10 md:p-12 text-center">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="absolute top-6 left-6 rounded-full h-10 w-10 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-200">
            <Layout size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 mb-2">Nexus<span className="text-blue-500">SaaS</span></h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Accesso Piattaforma</p>
          
          <div className="space-y-6">
            <Button 
              onClick={signIn} 
              className="w-full h-14 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-4 font-bold text-sm rounded-2xl shadow-sm transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continua con Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="bg-white px-4 text-slate-300">Oppure</span>
              </div>
            </div>

            <div className="space-y-3">
              <Input placeholder="Email Aziendale" className="h-12 rounded-xl border-slate-200 bg-slate-50/50" disabled />
              <Button disabled className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest bg-slate-100 text-slate-400">
                Accedi con Email
              </Button>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Accedendo, accetti i nostri <a href="#" className="text-blue-500 hover:underline">Termini di Servizio</a> e la <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
