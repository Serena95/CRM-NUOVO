import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CheckSquare, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  HelpCircle,
  Clock,
  FileText,
  FileEdit,
  HardDrive,
  Mail,
  Target,
  Zap,
  TrendingUp,
  Grid,
  MoreHorizontal,
  Info,
  Headphones,
  Home,
  BarChart3,
  Activity,
  PieChart,
  Layers,
  FileCheck,
  Share2,
  History,
  Inbox,
  Send,
  FileSignature,
  MailSearch,
  Users2,
  FolderKanban,
  GanttChart,
  Megaphone,
  Smartphone,
  MousePointerClick,
  Workflow,
  Bot,
  Timer,
  Globe,
  Store,
  ShieldCheck,
  UserCog,
  Database,
  PhoneCall,
  Hash,
  Video,
  User,
  Folder,
  FolderPlus,
  DollarSign,
  Building,
  GitBranch,
  UserPlus,
  Sparkles,
  Compass,
  PlusCircle
} from 'lucide-react';
import ChatAgente from './crm/ChatAgente';
import { motion, AnimatePresence } from 'framer-motion';
import { CRM_PIPELINES } from '@/constants/crm';
import { initializePipelines, getPipelineCounts } from '@/services/crmService';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, tenant, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['crm', 'tasks']);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [pipelineCounts, setPipelineCounts] = useState<Record<string, number>>({});

  // React.useEffect(() => {
  //   if (tenant) {
  //     initializePipelines(tenant.id);
  //     const unsub = getPipelineCounts(tenant.id, setPipelineCounts);
  //     return () => unsub();
  //   }
  // }, [tenant]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getContextualBubbles = () => {
    const isCRM = activeTab === 'crm' || activeTab === 'leads' || activeTab === 'deals' || activeTab === 'contacts' || activeTab === 'companies' || activeTab.startsWith('nexus-') || activeTab.startsWith('pipeline-') || activeTab === 'preventivi' || activeTab === 'nexus-preventivi';
    const isTasks = activeTab.startsWith('tasks');

    if (isCRM) {
      return [
        { id: 'new-lead', icon: UserPlus, color: 'bg-blue-500', label: 'Nuovo Lead' },
        { id: 'new-deal', icon: DollarSign, color: 'bg-emerald-500', label: 'Nuovo Affare' },
        { id: 'new-contact', icon: Users, color: 'bg-amber-500', label: 'Nuovo Contatto' },
        { id: 'new-company', icon: Building, color: 'bg-purple-500', label: 'Nuova Azienda' },
        { id: 'crm-settings', icon: Settings, color: 'bg-slate-600', label: 'Impostazioni CRM' }
      ];
    }

    if (isTasks) {
      return [
        { id: 'new-task', icon: CheckSquare, color: 'bg-purple-500', label: 'Nuovo Task' },
        { id: 'new-project', icon: Briefcase, color: 'bg-blue-500', label: 'Nuovo Progetto' },
        { id: 'tasks-kanban', icon: Grid, color: 'bg-emerald-500', label: 'Vista Kanban' },
        { id: 'tasks-gantt', icon: GanttChart, color: 'bg-amber-500', label: 'Vista Gantt' },
        { id: 'tasks-settings', icon: Settings, color: 'bg-slate-600', label: 'Impostazioni Task' }
      ];
    }

    // Default global bubbles
    return [
      { id: 'chat', icon: MessageSquare, color: 'bg-blue-500', label: 'Chat' },
      { id: 'calendar', icon: CalendarIcon, color: 'bg-emerald-500', label: 'Calendario' },
      { id: 'feed', icon: Layers, color: 'bg-amber-500', label: 'Feed' },
      { id: 'drive', icon: HardDrive, color: 'bg-purple-500', label: 'Drive' },
      { id: 'settings', icon: Settings, color: 'bg-slate-600', label: 'Impostazioni' }
    ];
  };

  const handleBubbleClick = (id: string) => {
    switch (id) {
      case 'new-lead':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'lead' } }));
        break;
      case 'new-deal':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'deal' } }));
        break;
      case 'new-contact':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'contact' } }));
        break;
      case 'new-company':
        window.dispatchEvent(new CustomEvent('crm:openCreate', { detail: { type: 'company' } }));
        break;
      case 'new-task':
        window.dispatchEvent(new CustomEvent('tasks:openCreate'));
        break;
      case 'chat':
        setActiveTab('chat');
        break;
      case 'calendar':
        setActiveTab('calendar');
        break;
      case 'feed':
        setActiveTab('feed');
        break;
      case 'drive':
        setActiveTab('drive');
        break;
      case 'settings':
      case 'crm-settings':
      case 'tasks-settings':
        setActiveTab('settings');
        break;
      case 'tasks-kanban':
        setActiveTab('tasks-kanban');
        break;
      case 'tasks-gantt':
        setActiveTab('tasks-gantt');
        break;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Monitoraggio CRM', icon: Home, subItems: [
      { id: 'dashboard-home', label: 'Home dashboard', icon: LayoutDashboard },
      { id: 'dashboard-kpi', label: 'KPI', icon: BarChart3 },
      { id: 'dashboard-recent', label: 'Attività recenti', icon: Activity },
      { id: 'dashboard-pipeline', label: 'Pipeline overview', icon: PieChart },
    ]},
    { id: 'feed', label: 'Feed Attività', icon: Sparkles },
    { id: 'chat', label: 'Chat e chiamate', icon: MessageSquare, subItems: [
      { id: 'chat-private', label: 'Chat privata', icon: MessageSquare },
      { id: 'chat-group', label: 'Chat gruppo', icon: Users2 },
      { id: 'chat-channels', label: 'Canali', icon: Hash },
      { id: 'chat-video', label: 'Video call', icon: Video },
      { id: 'chat-voip', label: 'Chiamate VoIP', icon: PhoneCall },
    ]},
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon, subItems: [
      { id: 'calendar-personal', label: 'Calendario personale', icon: User },
      { id: 'calendar-team', label: 'Calendario team', icon: Users },
      { id: 'calendar-events', label: 'Eventi', icon: CalendarIcon },
    ]},
    { id: 'docs', label: 'Documenti', icon: FileText, subItems: [
      { id: 'docs-manager', label: 'File manager', icon: Folder },
      { id: 'docs-folders', label: 'Cartelle', icon: FolderPlus },
      { id: 'docs-sharing', label: 'Condivisione', icon: Share2 },
    ]},
    { id: 'drive', label: 'Nexus Drive', icon: HardDrive, subItems: [
      { id: 'drive-personal', label: 'Drive personale', icon: HardDrive },
      { id: 'drive-team', label: 'Drive team', icon: Users },
      { id: 'drive-shared', label: 'File condivisi', icon: Share2 },
    ]},
    { id: 'mail', label: 'Webmail', icon: Mail, subItems: [
      { id: 'mail-inbox', label: 'Inbox', icon: Inbox },
      { id: 'mail-send', label: 'Invio email', icon: Send },
      { id: 'mail-templates', label: 'Template email', icon: FileSignature },
    ]},
    { id: 'groups', label: 'Gruppi di lavoro', icon: Users, subItems: [
      { id: 'groups-list', label: 'Gruppi', icon: Users },
      { id: 'groups-projects', label: 'Progetti', icon: Briefcase },
    ]},
    { id: 'crm', label: 'CRM', icon: Briefcase, subItems: [
      { id: 'leads', label: 'Lead', icon: UserPlus },
      { id: 'affari', label: 'Affari', icon: DollarSign },
      { id: 'contacts', label: 'Contatti', icon: Users },
      { id: 'companies', label: 'Aziende', icon: Building },
      { id: 'preventivi', label: 'Preventivi', icon: FileEdit },
      { id: 'activities', label: 'Attività', icon: Activity },
    ]},
    { id: 'tasks', label: 'Task e progetti', icon: CheckSquare, subItems: [
      { id: 'tasks-my', label: 'I miei task', icon: CheckSquare },
      { id: 'tasks-all', label: 'Tutti i task', icon: Layers },
      { id: 'tasks-kanban', label: 'Kanban', icon: Grid },
      { id: 'tasks-gantt', label: 'Gantt', icon: GanttChart },
    ]},
    { id: 'marketing', label: 'Marketing', icon: Target, subItems: [
      { id: 'marketing-email', label: 'Email marketing', icon: Mail },
      { id: 'marketing-sms', label: 'SMS marketing', icon: Smartphone },
      { id: 'marketing-campaigns', label: 'Campagne', icon: Megaphone },
      { id: 'marketing-leads', label: 'Lead generation', icon: UserPlus },
    ]},
    { id: 'automation', label: 'Automazione', icon: Zap, subItems: [
      { id: 'automation-workflow', label: 'Workflow builder', icon: Workflow },
      { id: 'automation-triggers', label: 'Trigger', icon: Zap },
      { id: 'automation-robots', label: 'Robot', icon: Bot },
    ]},
    { id: 'analytics', label: 'Analisi', icon: TrendingUp, subItems: [
      { id: 'analytics-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics-sales', label: 'Vendite', icon: DollarSign },
      { id: 'analytics-pipeline', label: 'Pipeline', icon: GitBranch },
    ]},
    { id: 'contact-center', label: 'Contact center', icon: Headphones, subItems: [
      { id: 'cc-livechat', label: 'Live chat', icon: MessageSquare },
      { id: 'cc-whatsapp', label: 'WhatsApp', icon: MessageSquare },
      { id: 'cc-telegram', label: 'Telegram', icon: Send },
    ]},
    { id: 'apps', label: 'Applicazioni', icon: Grid, subItems: [
      { id: 'apps-marketplace', label: 'Marketplace app', icon: Store },
      { id: 'apps-integrations', label: 'Integrazioni', icon: Layers },
    ]},
    { id: 'settings', label: 'Impostazioni', icon: Settings, subItems: [
      { id: 'settings-users', label: 'Utenti', icon: Users },
      { id: 'settings-roles', label: 'Ruoli', icon: ShieldCheck },
      { id: 'settings-permissions', label: 'Permessi', icon: ShieldCheck },
    ]},
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full nexus-sidebar-gradient text-white/70">
      <div className="p-6 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-xl tracking-tight text-white">Nexus</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-white/70 hover:text-white hover:bg-white/10" 
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto nexus-scrollbar py-4">
        {navItems.map((item) => (
          <div key={item.id} className="mb-1">
            <button
              onClick={() => {
                if (item.subItems) {
                  toggleMenu(item.id);
                  if (item.id === 'crm' && activeTab !== 'affari') {
                    setActiveTab('affari');
                  }
                } else {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all text-xs font-medium group",
                (activeTab === item.id || (item.subItems?.some(s => s.id === activeTab)))
                  ? "bg-white/10 text-white shadow-sm" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={cn(
                  "transition-colors",
                  (activeTab === item.id || (item.subItems?.some(s => s.id === activeTab))) ? "text-brand-yellow" : "group-hover:text-brand-yellow"
                )} />
                {item.label}
              </div>
              {item.subItems && (
                expandedMenus.includes(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              )}
            </button>

            {item.subItems && expandedMenus.includes(item.id) && (
              <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveTab(sub.id);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all text-[11px] font-medium group",
                      activeTab === sub.id
                        ? "text-white bg-white/5" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <sub.icon size={14} className={cn(
                        "transition-colors",
                        activeTab === sub.id ? "text-blue-400" : "group-hover:text-blue-400"
                      )} />
                      {sub.label}
                    </div>
                    {(sub as any).badge !== undefined && (sub as any).badge > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                        {(sub as any).badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <Button variant="ghost" className="w-full justify-start text-white/50 hover:text-white hover:bg-white/5 text-xs">
          <Settings size={14} className="mr-2" />
          Configura menu
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f7fb] text-slate-900 overflow-hidden relative font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-60 flex-col z-30 shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-60 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-[60px] nexus-topbar-gradient flex items-center justify-between px-4 lg:px-6 z-40 shrink-0 text-white shadow-lg">
          <div className="flex items-center gap-4 flex-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-white/70 hover:text-white" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </Button>
            
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" size={16} />
                <Input 
                  placeholder="Trova persone, documenti e altro" 
                  className="pl-10 bg-white/10 border-none focus-visible:ring-1 focus-visible:ring-white/20 text-white placeholder:text-white/50 h-9 rounded-full backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/70 backdrop-blur-md">
              <Clock size={14} className="text-brand-yellow" />
              <span>08:45</span>
            </div>

            <Button variant="ghost" size="icon" className="relative text-white/70 hover:text-white hidden xs:flex">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#2D3E8B]"></span>
            </Button>

            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hidden sm:flex">
              <HelpCircle size={20} />
            </Button>
            
            <div className="h-8 w-[1px] bg-white/10 mx-1 lg:mx-2 hidden xs:block"></div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-white/10 p-1 rounded-lg transition-colors outline-none shrink-0 min-w-0">
                <Avatar className="h-8 w-8 border border-white/20 shrink-0 rounded-lg">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback className="bg-brand-blue text-white font-bold">{profile?.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-black text-slate-800 hidden md:inline truncate max-w-[100px]">{profile?.displayName}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>Profilo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>Impostazioni</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut size={16} className="mr-2" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              onClick={() => setActiveTab('settings-users')}
              className="bg-[#2FC6F6] hover:bg-[#1eb0e0] text-white font-bold rounded-full px-6 hidden sm:flex"
            >
              INVITA
            </Button>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-auto bg-[#f5f7fb] w-full max-w-full">
          {children}
        </div>

        {/* AI Agent Bubble - Bottom Right */}
        <div className="fixed right-4 bottom-24 lg:bottom-8 z-[70]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                size="icon" 
                className={cn(
                  "w-12 h-12 lg:w-16 lg:h-16 rounded-full shadow-2xl hover:scale-110 transition-transform text-white border-2 border-white bg-brand-blue z-10",
                  isAIChatOpen && "rotate-90"
                )}
              >
                {isAIChatOpen ? <X size={28} /> : <Bot size={28} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-slate-900 text-white border-none font-bold text-[10px] uppercase tracking-widest">
              Assistente AI
            </TooltipContent>
          </Tooltip>
        </div>

        {/* AI Chat Popover */}
        <AnimatePresence>
          {isAIChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-36 lg:bottom-28 right-4 z-[60] w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] shadow-2xl rounded-3xl overflow-hidden max-h-[70vh] flex flex-col"
            >
              <ChatAgente clientId="floating-user" onClose={() => setIsAIChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
