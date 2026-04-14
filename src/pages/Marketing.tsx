import React from 'react';
import { Target, Megaphone, Smartphone, Mail, UserPlus, BarChart3, Plus, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Marketing: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Marketing</h1>
          <p className="text-slate-500">Crea e gestisci le tue campagne di marketing multicanale</p>
        </div>
        <Button className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-6 font-bold">
          <Plus size={18} className="mr-2" />
          CREA CAMPAGNA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campagne Attive', value: '12', icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Email Inviate', value: '45.2k', icon: Mail, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Nuovi Lead', value: '892', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Conversion Rate', value: '3.2%', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Campagne Recenti</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input placeholder="Cerca campagne..." className="pl-10 h-9 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Campagna</th>
                <th className="px-6 py-3 font-semibold">Canale</th>
                <th className="px-6 py-3 font-semibold">Stato</th>
                <th className="px-6 py-3 font-semibold">Inviati</th>
                <th className="px-6 py-3 font-semibold">Aperti</th>
                <th className="px-6 py-3 font-semibold">Click</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Sconto Estivo 2024', channel: 'Email', status: 'In corso', sent: '12,400', open: '24%', click: '5.2%' },
                { name: 'Webinar AI CRM', channel: 'SMS', status: 'Completata', sent: '2,500', open: '98%', click: '12.4%' },
                { name: 'Newsletter Maggio', channel: 'Email', status: 'Pianificata', sent: '45,000', open: '--', click: '--' },
                { name: 'Promo New User', channel: 'Email', status: 'In corso', sent: '8,900', open: '32%', click: '8.1%' },
              ].map((camp, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{camp.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {camp.channel === 'Email' ? <Mail size={14} /> : <Smartphone size={14} />}
                      {camp.channel}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={
                      camp.status === 'In corso' ? 'bg-blue-500' : 
                      camp.status === 'Completata' ? 'bg-emerald-500' : 'bg-slate-400'
                    }>
                      {camp.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{camp.sent}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{camp.open}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{camp.click}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
