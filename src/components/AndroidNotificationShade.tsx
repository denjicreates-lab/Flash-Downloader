import React from 'react';
import { Wifi, Signal, Zap, Pause, X, ChevronUp, Cpu } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { formatSpeed } from '../utils/constants';

interface AndroidNotificationShadeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const AndroidNotificationShade: React.FC<AndroidNotificationShadeProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const {
    tasks,
    networkStats,
    toggleBondingTurbo,
    toggleWifi,
    toggleCellular,
    pauseTask,
    cancelTask,
  } = useDownloads();

  if (!isOpen) return null;

  const activeDownloadingTasks = tasks.filter(t => t.status === 'downloading');
  const totalBondedSpeed = activeDownloadingTasks.reduce((acc, t) => acc + t.totalSpeed, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-start animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl mx-auto bg-zinc-950 border-b border-zinc-800 rounded-b-3xl shadow-2xl p-5 text-white flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        {/* Header & Close handle */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-zinc-400">Android System · Quick Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Collapse drawer"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Settings Tiles Grid (Clean B&W) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Dual Turbo Tile */}
          <button
            onClick={toggleBondingTurbo}
            className={`p-3 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left border ${
              networkStats.turboBondingActive
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Zap className={`w-5 h-5 ${networkStats.turboBondingActive ? 'text-black fill-black' : 'text-zinc-500'}`} />
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${networkStats.turboBondingActive ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                {networkStats.turboBondingActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <div>
              <p className={`text-xs font-bold ${networkStats.turboBondingActive ? 'text-black' : 'text-white'}`}>Dual Turbo</p>
              <p className={`text-[10px] ${networkStats.turboBondingActive ? 'text-zinc-700' : 'text-zinc-400'}`}>Bonded Stream</p>
            </div>
          </button>

          {/* Wi-Fi Tile */}
          <button
            onClick={toggleWifi}
            className={`p-3 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left border ${
              networkStats.wifi.enabled
                ? 'bg-zinc-900 border-white/60 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Wifi className={`w-5 h-5 ${networkStats.wifi.enabled ? 'text-white' : 'text-zinc-600'}`} />
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${networkStats.wifi.enabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                {networkStats.wifi.enabled ? '6G' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Wi-Fi 7</p>
              <p className="text-[10px] text-zinc-400 truncate max-w-[85px]">{networkStats.wifi.ssid}</p>
            </div>
          </button>

          {/* 5G Cellular Data Tile */}
          <button
            onClick={toggleCellular}
            className={`p-3 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left border ${
              networkStats.cellular.enabled
                ? 'bg-zinc-900 border-white/60 text-white'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Signal className={`w-5 h-5 ${networkStats.cellular.enabled ? 'text-white' : 'text-zinc-600'}`} />
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${networkStats.cellular.enabled ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}>
                {networkStats.cellular.enabled ? '5G' : 'OFF'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Cellular Data</p>
              <p className="text-[10px] text-zinc-400">{networkStats.cellular.carrier}</p>
            </div>
          </button>

          {/* Thermal Guard & Settings */}
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="p-3 rounded-2xl flex flex-col items-start gap-1.5 transition-all text-left border bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
          >
            <div className="flex items-center justify-between w-full">
              <Cpu className="w-5 h-5 text-white" />
              <span className="text-[10px] font-mono text-white font-semibold">{networkStats.batteryTempC}°C</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Thermal Guard</p>
              <p className="text-[10px] text-zinc-400">Normal · 28% CPU</p>
            </div>
          </button>
        </div>

        {/* Android Active Notification: Flash Downloader */}
        <div className="mt-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Notifications</span>
            {activeDownloadingTasks.length > 0 && (
              <span className="text-white font-mono lowercase">
                bonded {formatSpeed(totalBondedSpeed)}
              </span>
            )}
          </div>

          {activeDownloadingTasks.length === 0 ? (
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400 text-xs">
              No active downloads in background.
            </div>
          ) : (
            activeDownloadingTasks.map(task => {
              const percent = Math.min(100, Math.floor((task.downloadedBytes / task.totalBytes) * 100));
              const wifiRatio = task.downloadedBytes > 0 ? (task.wifiBytesDownloaded / task.downloadedBytes) * 100 : 50;

              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2.5 mb-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center p-0.5">
                        <Zap className="w-4 h-4 fill-black text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Flash Downloader</span>
                          <span className="text-[10px] text-zinc-500">· Now</span>
                        </div>
                        <p className="text-xs font-medium text-zinc-200 truncate max-w-[240px] sm:max-w-xs">
                          {task.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-white">
                        {formatSpeed(task.totalSpeed)}
                      </span>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        {percent}%
                      </p>
                    </div>
                  </div>

                  {/* Monochrome progress bar: White for Wi-Fi, Zinc-400 for 5G */}
                  <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(percent * (wifiRatio / 100))}%` }}
                      className="bg-white h-full transition-all duration-300"
                      title="Wi-Fi 7 chunk portion"
                    />
                    <div
                      style={{ width: `${(percent * ((100 - wifiRatio) / 100))}%` }}
                      className="bg-zinc-400 h-full transition-all duration-300"
                      title="5G Cellular chunk portion"
                    />
                  </div>

                  {/* Speed breakdown & Action buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="text-zinc-200 flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-white" /> {task.currentSpeedWifi.toFixed(1)} MB/s
                      </span>
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Signal className="w-3 h-3 text-zinc-400" /> {task.currentSpeedCellular.toFixed(1)} MB/s
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => pauseTask(task.id)}
                        className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1 transition-colors"
                      >
                        <Pause className="w-3 h-3" /> Pause
                      </button>
                      <button
                        onClick={() => cancelTask(task.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Cancel download"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto my-1 cursor-pointer" onClick={onClose} />
      </div>
    </div>
  );
};
