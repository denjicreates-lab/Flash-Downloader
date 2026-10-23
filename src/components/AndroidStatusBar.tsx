import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging, ArrowDown, Zap, Bell } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';

interface AndroidStatusBarProps {
  onOpenShade: () => void;
  isShadeOpen: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ onOpenShade }) => {
  const { networkStats, activeTask } = useDownloads();
  const [timeStr, setTimeStr] = useState('12:45');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const hasActiveDownloads = Boolean(activeTask && activeTask.status === 'downloading');

  return (
    <header 
      onClick={onOpenShade}
      className="w-full bg-black border-b border-zinc-850 px-4 py-2 select-none cursor-pointer flex items-center justify-between transition-colors hover:bg-zinc-950"
      title="Tap to open Quick Settings & Notification Drawer"
    >
      {/* Left zone: Clock & Status */}
      <div className="flex items-center gap-2 text-xs font-semibold tracking-tight text-zinc-300">
        <span className="font-mono text-white">{timeStr}</span>

        {hasActiveDownloads && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-750">
            <Zap className="w-3 h-3 text-white fill-white" />
            <span className="font-mono">{activeTask?.totalSpeed.toFixed(0)} MB/s</span>
          </div>
        )}

        {networkStats.turboBondingActive && (
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 hidden sm:inline-block">
            Dual Turbo
          </span>
        )}
      </div>

      {/* Center punch hole camera */}
      <div className="flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-black border border-zinc-700 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
        </div>
      </div>

      {/* Right zone: Monochrome Network Signals & Battery */}
      <div className="flex items-center gap-2 text-xs text-zinc-300">
        {/* Cellular 5G status */}
        <div className="flex items-center gap-0.5" title={`${networkStats.cellular.carrier} - ${networkStats.cellular.networkType}`}>
          <span className="text-[10px] font-extrabold text-white font-mono">5G</span>
          <Signal className={`w-3.5 h-3.5 ${networkStats.cellular.enabled ? 'text-white' : 'text-zinc-600'}`} />
          {hasActiveDownloads && networkStats.cellular.enabled && (
            <ArrowDown className="w-2.5 h-2.5 text-white animate-bounce" />
          )}
        </div>

        {/* Wi-Fi 7 status */}
        <div className="flex items-center gap-0.5" title={`${networkStats.wifi.ssid} - ${networkStats.wifi.standard}`}>
          <Wifi className={`w-3.5 h-3.5 ${networkStats.wifi.enabled ? 'text-white' : 'text-zinc-600'}`} />
          {hasActiveDownloads && networkStats.wifi.enabled && (
            <ArrowDown className="w-2.5 h-2.5 text-white animate-bounce" />
          )}
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-200">
          <span>88%</span>
          <div className="relative flex items-center">
            <BatteryCharging className="w-4 h-4 text-white" />
          </div>
        </div>

        <button 
          type="button" 
          aria-label="Notification shade toggle"
          className="text-zinc-400 hover:text-white ml-0.5 p-0.5"
        >
          <Bell className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
