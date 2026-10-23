import React, { useState } from 'react';
import { X, Sliders, Cpu, Signal, HardDrive, RotateCcw, Check } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';

interface SettingsThermalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsThermalDrawer: React.FC<SettingsThermalDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { networkStats, setMptcpAlgorithm, setMonthlyQuota, resetToDefaultSettings } = useDownloads();

  const [preAllocate, setPreAllocate] = useState(true);
  const [autoVerify, setAutoVerify] = useState(true);
  const [roamingProtection, setRoamingProtection] = useState(true);
  const [quotaGb, setQuotaGb] = useState(networkStats.cellular.monthlyQuotaGb);
  const [justReset, setJustReset] = useState(false);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    resetToDefaultSettings();
    setQuotaGb(50);
    setPreAllocate(true);
    setAutoVerify(true);
    setRoamingProtection(true);
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Turbo Engine Settings</h3>
              <p className="text-xs text-zinc-400">Bonding protocols, cellular guard, and hardware governors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Android Thermal Safety */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-white" /> Hardware Thermal Governor
            </span>
            <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
              {networkStats.batteryTempC}°C · Optimal
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] block">Battery Temp</span>
              <span className="font-mono font-bold text-white">{networkStats.batteryTempC}°C</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] block">CPU Load</span>
              <span className="font-mono font-bold text-white">{networkStats.cpuLoadPercent}%</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-zinc-500 text-[10px] block">Throttle State</span>
              <span className="font-mono font-bold text-zinc-300">Unthrottled</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400">
            Intelligently throttles multi-thread sockets if device temperature climbs past 42°C to protect battery health.
          </p>
        </div>

        {/* Section 2: Multipath Bonding Algorithm */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
            Multipath TCP (MPTCP) Slicing Algorithm
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'flash_hybrid', name: 'Flash Hybrid (Default)', desc: 'Auto-balances based on round-trip latency' },
              { id: 'bbr', name: 'Google BBR v3', desc: 'Optimizes bottleneck bandwidth & bufferbloat' },
              { id: 'cubic', name: 'CUBIC Multipath', desc: 'Standard high-speed loss-based congestion' },
            ].map(algo => (
              <button
                key={algo.id}
                type="button"
                onClick={() => setMptcpAlgorithm(algo.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  networkStats.mptcpAlgorithm === algo.id
                    ? 'bg-zinc-800 border-white text-white'
                    : 'bg-black border-zinc-850 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block text-white">{algo.name}</span>
                <span className="text-[10px] text-zinc-400 mt-1 block leading-tight">{algo.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Cellular Data Guard */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Signal className="w-4 h-4 text-white" /> Cellular Data Guard & Quota
            </span>
            <span className="text-xs font-mono text-white font-bold">
              {networkStats.cellular.monthlyUsedGb} GB / {quotaGb} GB
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span>Monthly Cellular Limit (Default: 50 GB)</span>
              <span className="font-mono font-bold text-white">{quotaGb} GB</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={quotaGb}
              onChange={e => {
                const val = Number(e.target.value);
                setQuotaGb(val);
                setMonthlyQuota(val);
              }}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-zinc-300">Disable 5G on International Roaming</span>
            <input
              type="checkbox"
              checked={roamingProtection}
              onChange={e => setRoamingProtection(e.target.checked)}
              className="accent-white w-4 h-4 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: File & Storage Options */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
            Storage & Verification
          </label>
          <div className="p-3 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-200">Pre-allocate Disk Space</p>
                <p className="text-[10px] text-zinc-500">Eliminates storage fragmentation</p>
              </div>
              <input
                type="checkbox"
                checked={preAllocate}
                onChange={e => setPreAllocate(e.target.checked)}
                className="accent-white w-4 h-4 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between border-t border-zinc-850 pt-2">
              <div>
                <p className="font-semibold text-zinc-200">Auto SHA-256 Verification</p>
                <p className="text-[10px] text-zinc-500">Validates segment checksums upon completion</p>
              </div>
              <input
                type="checkbox"
                checked={autoVerify}
                onChange={e => setAutoVerify(e.target.checked)}
                className="accent-white w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: Reset to Defaults + Save */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-850">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            {justReset ? 'Reset to Defaults!' : 'Reset to Default Settings'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
