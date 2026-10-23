import React from 'react';
import { Zap, DownloadCloud, Gauge, Compass, FolderClosed } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';

export type ActiveNavTab = 'dashboard' | 'downloads' | 'benchmark' | 'browser' | 'storage';

interface AndroidNavBarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  showSystemButtons?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onSelectTab,
  showSystemButtons = true,
}) => {
  const { tasks } = useDownloads();
  const activeCount = tasks.filter(t => t.status === 'downloading').length;

  const navItems: Array<{ id: ActiveNavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Turbo', icon: Zap },
    { id: 'downloads', label: 'Queue', icon: DownloadCloud },
    { id: 'benchmark', label: 'Speed Test', icon: Gauge },
    { id: 'browser', label: 'Sniffer', icon: Compass },
    { id: 'storage', label: 'Files', icon: FolderClosed },
  ];

  return (
    <footer className="w-full bg-black/95 backdrop-blur-md border-t border-zinc-850 select-none shrink-0 z-20">
      {/* 5-Tab Ergonomic Bottom Navigation (Monochrome) */}
      <nav className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all relative ${
                isActive ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-white' : ''}`} />
                {item.id === 'downloads' && activeCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <div className="w-6 h-0.5 bg-white rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Android System 3-Button Navigation Bar Simulator */}
      {showSystemButtons && (
        <div className="h-7 w-full flex items-center justify-around px-16 border-t border-zinc-900 bg-black">
          {/* Back Triangle */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Android Back"
          >
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[9px] border-r-zinc-400" />
          </button>
          {/* Home Circle */}
          <button
            onClick={() => onSelectTab('dashboard')}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Android Home"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400" />
          </button>
          {/* Recents Square */}
          <button
            onClick={() => onSelectTab('downloads')}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Android App Switcher"
          >
            <div className="w-3 h-3 rounded-[2px] border-2 border-zinc-400" />
          </button>
        </div>
      )}
    </footer>
  );
};
