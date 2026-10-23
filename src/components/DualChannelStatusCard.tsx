import React from 'react';
import { Wifi, Signal, Zap, Activity } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { formatSpeed } from '../utils/constants';

export const DualChannelStatusCard: React.FC = () => {
  const {
    networkStats,
    activeTask,
    toggleBondingTurbo,
    toggleWifi,
    toggleCellular,
  } = useDownloads();

  const wifiSpeed = activeTask?.currentSpeedWifi ?? 0;
  const cellSpeed = activeTask?.currentSpeedCellular ?? 0;
  const totalSpeed = activeTask?.totalSpeed ?? 0;

  // Calculate ratio
  const totalBoth = wifiSpeed + cellSpeed;
  const wifiPct = totalBoth > 0 ? Math.round((wifiSpeed / totalBoth) * 100) : 55;
  const cellPct = 100 - wifiPct;

  // Build SVG points from speed history
  const history = activeTask?.speedHistory || [];
  const svgWidth = 320;
  const svgHeight = 70;
  const maxScale = Math.max(120, activeTask?.peakSpeed || 120);

  const getPoints = (key: 'wifi' | 'cellular' | 'total') => {
    if (history.length < 2) {
      return `0,${svgHeight} ${svgWidth},${svgHeight}`;
    }
    const step = svgWidth / (history.length - 1);
    return history
      .map((pt, i) => {
        const x = i * step;
        const val = pt[key];
        const y = svgHeight - (val / maxScale) * (svgHeight - 10);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-5 text-white">
      {/* Top Bar: Title & Global Turbo Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-white fill-white" />
              Dual-Channel Turbo Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Aggregating Wi-Fi & Cellular into a bonded multi-path stream
          </p>
        </div>

        {/* Turbo Mode Switch */}
        <button
          onClick={toggleBondingTurbo}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            networkStats.turboBondingActive
              ? 'bg-white text-black border-white shadow-sm'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${networkStats.turboBondingActive ? 'bg-black' : 'bg-zinc-600'}`} />
          {networkStats.turboBondingActive ? 'TURBO BONDED' : 'SINGLE LINK'}
        </button>
      </div>

      {/* Main Bonded Pipe Display (Monochrome) */}
      <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-white" /> Bonded Download Speed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
              {totalSpeed.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-zinc-300 font-mono">MB/s</span>
            {totalSpeed > 0 && (
              <span className="text-xs text-zinc-500 font-mono ml-2">
                (~{(totalSpeed * 8).toFixed(0)} Mbps)
              </span>
            )}
          </div>
        </div>

        {/* Stat Strip */}
        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-zinc-850 pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Peak Speed</p>
            <p className="text-sm font-mono font-bold text-white">
              {formatSpeed(activeTask?.peakSpeed || 142.1)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Multipath Ratio</p>
            <p className="text-sm font-mono font-bold text-zinc-200">
              {wifiPct}% <span className="text-zinc-600">/</span> {cellPct}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider">MPTCP Algo</p>
            <p className="text-sm font-mono font-bold text-white">Flash BBR</p>
          </div>
        </div>
      </div>

      {/* Real-time Oscilloscope Speed Graph (Clean Monochrome) */}
      <div className="p-3.5 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400 font-medium">Throughput Oscilloscope</span>
          <div className="flex items-center gap-3 font-mono">
            <span className="text-white flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-white" /> Wi-Fi {wifiSpeed.toFixed(1)} MB/s
            </span>
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-b border-dashed border-zinc-400" /> 5G {cellSpeed.toFixed(1)} MB/s
            </span>
          </div>
        </div>

        <div className="w-full h-18 relative flex items-center">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            {/* Guide grids */}
            <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#27272a" strokeDasharray="3 3" strokeWidth="0.5" />
            <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#27272a" strokeDasharray="3 3" strokeWidth="0.5" />
            <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#27272a" strokeDasharray="3 3" strokeWidth="0.5" />

            {/* Wi-Fi Waveform (White solid) */}
            <polyline
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPoints('wifi')}
            />

            {/* Cellular Waveform (Zinc-400 dashed) */}
            <polyline
              fill="none"
              stroke="#a1a1aa"
              strokeWidth="2"
              strokeDasharray="4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPoints('cellular')}
            />

            {/* Total Combined Waveform (Crisp thin line) */}
            <polyline
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={getPoints('total')}
            />
          </svg>
        </div>
      </div>

      {/* Dual Interface Hardware Cards (Clean B&W) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Channel 1: Wi-Fi 7 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          networkStats.wifi.enabled
            ? 'bg-zinc-900/60 border-zinc-700'
            : 'bg-zinc-950 border-zinc-850 opacity-50'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-800 text-white">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{networkStats.wifi.ssid}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{networkStats.wifi.standard}</p>
              </div>
            </div>

            <button
              onClick={toggleWifi}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                networkStats.wifi.enabled
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {networkStats.wifi.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-zinc-400 block text-[10px]">Speed</span>
              <span className="font-mono font-bold text-white text-sm">
                {wifiSpeed.toFixed(1)} <span className="text-[10px]">MB/s</span>
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Latency</span>
              <span className="font-mono font-medium text-zinc-300">
                {networkStats.wifi.latencyMs} ms
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Signal</span>
              <span className="font-mono font-medium text-zinc-300">
                {networkStats.wifi.signalDbm} dBm
              </span>
            </div>
          </div>
        </div>

        {/* Channel 2: 5G Cellular */}
        <div className={`p-4 rounded-2xl border transition-all ${
          networkStats.cellular.enabled
            ? 'bg-zinc-900/60 border-zinc-700'
            : 'bg-zinc-950 border-zinc-850 opacity-50'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
                <Signal className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{networkStats.cellular.carrier}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{networkStats.cellular.networkType}</p>
              </div>
            </div>

            <button
              onClick={toggleCellular}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                networkStats.cellular.enabled
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {networkStats.cellular.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-zinc-400 block text-[10px]">Speed</span>
              <span className="font-mono font-bold text-zinc-200 text-sm">
                {cellSpeed.toFixed(1)} <span className="text-[10px]">MB/s</span>
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Latency</span>
              <span className="font-mono font-medium text-zinc-300">
                {networkStats.cellular.latencyMs} ms
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px]">Data Used</span>
              <span className="font-mono font-medium text-zinc-300">
                {networkStats.cellular.monthlyUsedGb} / {networkStats.cellular.monthlyQuotaGb} GB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
