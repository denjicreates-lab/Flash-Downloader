import React, { useState } from 'react';
import { Smartphone, Monitor, Zap, Plus, Sliders, RotateCcw } from 'lucide-react';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavBar, ActiveNavTab } from './AndroidNavBar';
import { useDownloads } from '../context/DownloadContext';

interface AndroidFrameProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenNewModal: () => void;
  onOpenSettings: () => void;
  onOpenShade: () => void;
  isShadeOpen: boolean;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewModal,
  onOpenSettings,
  onOpenShade,
  isShadeOpen,
  children,
}) => {
  const [isPhoneMode, setIsPhoneMode] = useState(true);
  const { resetToDefaultSettings } = useDownloads();
  const [showResetNotice, setShowResetNotice] = useState(false);

  const handleReset = () => {
    resetToDefaultSettings();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start p-0 sm:p-4 lg:p-6 selection:bg-white selection:text-black">
      {/* Universal Top Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 py-3 px-4 mb-3 border-b border-zinc-850">
        {/* Brand Zone: Pure clean typography */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white text-black font-extrabold flex items-center justify-center border border-zinc-300 shadow-sm shrink-0">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">FLASH</span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                Dual Turbo
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Wi-Fi & Cellular Multi-Segment Downloader
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {showResetNotice && (
            <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-lg">
              Settings Reset
            </span>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Defaults</span>
          </button>

          <button
            onClick={() => setIsPhoneMode(!isPhoneMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors"
            title="Toggle between phone frame and full screen desktop"
          >
            {isPhoneMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden md:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden md:inline">Phone Frame</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Engine Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Download</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      {isPhoneMode ? (
        /* Phone Chassis Simulator Mode (Monochrome Matte Black) */
        <div className="relative w-full max-w-[430px] bg-black rounded-[48px] border-[6px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col min-h-[820px] max-h-[92vh]">
          {/* Side Volume Buttons on chassis */}
          <div className="absolute -left-[9px] top-28 w-[3px] h-12 bg-zinc-700 rounded-l" />
          <div className="absolute -left-[9px] top-44 w-[3px] h-12 bg-zinc-700 rounded-l" />
          <div className="absolute -right-[9px] top-32 w-[3px] h-16 bg-zinc-700 rounded-r" />

          {/* Android Status Bar */}
          <AndroidStatusBar onOpenShade={onOpenShade} isShadeOpen={isShadeOpen} />

          {/* Phone Scrollable App Body */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-4 bg-black">
            {children}
          </main>

          {/* Android Bottom Nav Bar */}
          <AndroidNavBar
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            showSystemButtons={true}
          />
        </div>
      ) : (
        /* Full Expanded Dashboard Mode */
        <div className="w-full max-w-6xl mx-auto bg-black border border-zinc-850 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
          <AndroidStatusBar onOpenShade={onOpenShade} isShadeOpen={isShadeOpen} />

          <main className="p-5 md:p-6 space-y-5 bg-black">
            {children}
          </main>

          <AndroidNavBar
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            showSystemButtons={false}
          />
        </div>
      )}
    </div>
  );
};
