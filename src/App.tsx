import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from '@/components/Layout';
import { db } from '@/lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import Dashboard from '@/pages/Dashboard';
import CRM from '@/pages/CRM';
import Tasks from '@/pages/Tasks';
import Chat from '@/pages/Chat';
import Settings from '@/pages/Settings';
import Feed from '@/pages/Feed';
import Calendar from '@/pages/Calendar';
import Drive from '@/pages/Drive';
import Docs from '@/pages/Docs';
import Webmail from '@/pages/Webmail';
import Groups from '@/pages/Groups';
import Marketing from '@/pages/Marketing';
import ContactCenter from '@/pages/ContactCenter';
import Applications from '@/pages/Applications';
import Automations from '@/pages/Automations';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import BusinessModule from '@/pages/BusinessModule';
import QuoteModule from '@/pages/QuoteModule';
import NexusIndex from '@/pages/NexusIndex';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard-home');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore connection error: The client is offline or configuration is incorrect.");
        }
      }
    }
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Nexus...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <>
          <Login onBack={() => setShowLogin(false)} />
          <Toaster position="top-right" />
        </>
      );
    }
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  const renderContent = () => {
    // Handle sub-tabs by mapping them to main modules
    const mainTab = activeTab.split('-')[0];
    
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'dashboard':
      case 'dashboard-home':
      case 'dashboard-kpi':
      case 'dashboard-recent':
      case 'dashboard-pipeline':
        return <Dashboard activeTab={activeTab} />;
      case 'leads':
      case 'deals':
      case 'contacts':
      case 'companies':
      case 'activities':
      case 'pipelines':
      case 'pipeline-settings':
      case 'quotes':
      case 'invoices':
      case 'crm':
      case 'preventivi':
      case 'finanza-agevolata':
      case 'servizi-digitali':
      case 'ai-agente':
        return <CRM activeTab={activeTab} />;
      case 'tasks':
      case 'tasks-my':
      case 'tasks-all':
      case 'tasks-kanban':
      case 'tasks-gantt':
        return <Tasks activeTab={activeTab} />;
      case 'chat':
      case 'chat-private':
      case 'chat-group':
      case 'chat-channels':
      case 'chat-video':
      case 'chat-voip':
        return <Chat />;
      case 'calendar':
      case 'calendar-personal':
      case 'calendar-team':
      case 'calendar-events':
        return <Calendar />;
      case 'docs':
      case 'docs-manager':
      case 'docs-folders':
      case 'docs-sharing':
        return <Docs />;
      case 'drive':
      case 'drive-personal':
      case 'drive-team':
      case 'drive-shared':
        return <Drive />;
      case 'mail':
      case 'mail-inbox':
      case 'mail-send':
      case 'mail-templates':
        return <Webmail />;
      case 'groups':
      case 'groups-list':
      case 'groups-projects':
        return <Groups />;
      case 'marketing':
      case 'marketing-email':
      case 'marketing-sms':
      case 'marketing-campaigns':
      case 'marketing-leads':
        return <Marketing />;
      case 'automation':
      case 'automation-workflow':
      case 'automation-triggers':
      case 'automation-robots':
        return <Automations />;
      case 'analytics':
      case 'analytics-dashboard':
      case 'analytics-sales':
      case 'analytics-pipeline':
        return <Analytics />;
      case 'contact-center':
      case 'cc-livechat':
      case 'cc-whatsapp':
      case 'cc-telegram':
        return <ContactCenter />;
      case 'apps':
      case 'apps-marketplace':
      case 'apps-integrations':
        return <Applications />;
      case 'nexus-general':
      case 'nexus-finanza':
      case 'nexus-digitale':
      case 'nexus-consulenze':
      case 'nexus-eventi':
      case 'nexus-prodotti':
      case 'nexus-formazione':
      case 'nexus-coworking':
      case 'nexus-prenotazioni':
      case 'nexus-economie':
        return <CRM activeTab={activeTab} />;
      case 'settings':
      case 'settings-users':
      case 'settings-roles':
      case 'settings-permissions':
        return <Settings />;
      default:
        if (activeTab.startsWith('pipeline-') || activeTab.startsWith('nexus-')) {
          return <CRM activeTab={activeTab} />;
        }
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white m-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
              <Plus size={40} className="rotate-45" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Modulo in Sviluppo</h2>
            <p className="text-slate-500 max-w-md mt-2">
              Stiamo lavorando per portare tutte le funzionalità necessarie su questa piattaforma. 
              Il modulo <span className="font-bold text-blue-500 uppercase">"{activeTab}"</span> sarà disponibile a breve.
            </p>
            <Button 
              onClick={() => setActiveTab('feed')}
              className="mt-8 bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white rounded-full px-8 font-bold"
            >
              TORNA ALLA DASHBOARD
            </Button>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
      <Toaster position="top-right" />
    </TooltipProvider>
  );
};

export default App;
