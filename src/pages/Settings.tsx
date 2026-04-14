import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Building, User, CreditCard, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const Settings: React.FC = () => {
  const { profile, tenant, logout } = useAuth();
  const [activeSection, setActiveSection] = React.useState('profile');

  const sections = [
    { id: 'profile', label: 'Mio Profilo', icon: User },
    { id: 'workspace', label: 'Impostazioni Workspace', icon: Building },
    { id: 'security', label: 'Sicurezza', icon: Shield },
    { id: 'billing', label: 'Abbonamento e Fatturazione', icon: CreditCard },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f7fb]">
      {/* Settings Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Impostazioni</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Gestisci il tuo account e le preferenze del workspace.</p>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Settings Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeSection === section.id 
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-white hover:text-slate-800"
                )}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-slate-200">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
              >
                <LogOut size={18} />
                Esci dall'account
              </button>
            </div>
          </aside>

          {/* Settings Content */}
          <div className="flex-1 space-y-6">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Informazioni Profilo</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Aggiorna i tuoi dati personali e come appari agli altri.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile?.photoURL} />
                      <AvatarFallback className="bg-blue-500 text-white text-2xl">{profile?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-widest">
                      Cambia
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{profile?.displayName}</h3>
                    <p className="text-sm text-slate-400 font-medium">{profile?.email}</p>
                    <Badge className="mt-2 bg-blue-50 text-blue-600 border-none font-bold uppercase tracking-wider text-[10px]">
                      {profile?.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Visualizzato</Label>
                    <Input defaultValue={profile?.displayName} className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</Label>
                    <Input defaultValue={profile?.email} disabled className="bg-slate-100 border-none h-11 rounded-xl opacity-60" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-8 shadow-lg shadow-blue-200">
                    SALVA MODIFICHE
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Dettagli Workspace</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">Informazioni sulla tua organizzazione.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Workspace</Label>
                  <Input defaultValue={tenant?.name} className="bg-slate-50 border-none h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-400/30" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Piano Attuale</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800 uppercase">{tenant?.plan}</span>
                      <Badge className="bg-emerald-500 text-white border-none text-[9px] font-bold">ATTIVO</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full px-6 font-bold text-xs border-slate-200 hover:bg-white">
                    UPGRADE
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
