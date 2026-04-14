import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Gen', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'Mag', value: 500 },
  { name: 'Giu', value: 900 },
];

const pieData = [
  { name: 'Vinti', value: 45 },
  { name: 'Persi', value: 25 },
  { name: 'In Corso', value: 30 },
];

const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

const Dashboard: React.FC<{ activeTab?: string }> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard-kpi':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader><CardTitle>KPI Vendite Mensili</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2FC6F6" strokeWidth={3} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader><CardTitle>Distribuzione Lead</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard-recent':
        return (
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Tutte le Attività Recenti</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {[
                  { user: 'Marco Rossi', action: 'ha aggiornato lo stadio dell\'affare', target: 'Enterprise Software License', detail: 'Negoziazione', time: '2 ore fa' },
                  { user: 'Giulia Bianchi', action: 'ha creato un nuovo lead', target: 'Studio Legale Verdi', detail: 'Nuovo', time: '4 ore fa' },
                  { user: 'Luca Neri', action: 'ha completato il task', target: 'Invia proposta commerciale', detail: 'Completato', time: 'Ieri' },
                  { user: 'Sara Viola', action: 'ha aggiunto una nota a', target: 'Azienda Agricola Sole', detail: 'Nota', time: 'Ieri' },
                  { user: 'Davide Gialli', action: 'ha pianificato un meeting con', target: 'Tech Solutions SpA', detail: 'Meeting', time: '2 giorni fa' },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <Clock size={20} />
                      </div>
                      {i < 4 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-slate-100"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">{activity.user}</span> {activity.action} 
                        <span className="text-blue-500 font-bold"> "{activity.target}"</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] ml-2 font-bold uppercase tracking-wider">{activity.detail}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      case 'dashboard-pipeline':
        return (
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader><CardTitle>Panoramica Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Lead Totali', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', trendColor: 'text-emerald-600' },
                { label: 'Affari Attivi', value: '432', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+8%', trendColor: 'text-emerald-600' },
                { label: 'Fatturato', value: '€84,200', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '-3%', trendColor: 'text-rose-600' },
                { label: 'Task Completati', value: '89', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+15%', trendColor: 'text-emerald-600' },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                      </div>
                      <div className={cn("flex items-center text-sm font-bold", stat.trendColor)}>
                        {stat.trend.startsWith('+') ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {stat.trend}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <CardTitle className="text-base font-bold text-slate-800">Previsione Pipeline Vendite</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                        <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold'}}
                          cursor={{fill: '#f8fafc'}}
                        />
                        <Bar dataKey="value" fill="#2FC6F6" radius={[6, 6, 0, 0]} barSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 pb-4">
                  <CardTitle className="text-base font-bold text-slate-800">Conversione Affari</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-3">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                          <span className="text-slate-500 font-bold">{item.name}</span>
                        </div>
                        <span className="font-black text-slate-800">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Attività Recente</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {[
                    { user: 'Marco Rossi', action: 'ha aggiornato lo stadio dell\'affare', target: 'Enterprise Software License', detail: 'Negoziazione', time: '2 ore fa' },
                    { user: 'Giulia Bianchi', action: 'ha creato un nuovo lead', target: 'Studio Legale Verdi', detail: 'Nuovo', time: '4 ore fa' },
                    { user: 'Luca Neri', action: 'ha completato il task', target: 'Invia proposta commerciale', detail: 'Completato', time: 'Ieri' },
                    { user: 'Sara Viola', action: 'ha aggiunto una nota a', target: 'Azienda Agricola Sole', detail: 'Nota', time: 'Ieri' },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Clock size={20} />
                        </div>
                        {i < 3 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-slate-100"></div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-bold text-slate-800">{activity.user}</span> {activity.action} 
                          <span className="text-blue-500 font-bold"> "{activity.target}"</span>
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] ml-2 font-bold uppercase tracking-wider">{activity.detail}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {activeTab === 'dashboard-kpi' ? 'KPI Performance' : 
             activeTab === 'dashboard-recent' ? 'Attività Recenti' : 
             activeTab === 'dashboard-pipeline' ? 'Pipeline Overview' : 'Dashboard'}
          </h1>
          <p className="text-sm lg:text-base text-slate-500 font-medium">Benvenuto! Ecco cosa sta succedendo oggi.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-full px-4 font-bold text-xs border-slate-200">ESPORTA</Button>
          <Button size="sm" className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold text-xs shadow-lg shadow-blue-200">
            AGGIORNA
          </Button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default Dashboard;
