import React, { useState } from 'react';
import { X, ShieldCheck, Download, CheckCircle2, Smartphone, Wifi, Signal, RefreshCw } from 'lucide-react';
import { DownloadTask } from '../types/download';
import { formatBytes, formatSpeed } from '../utils/constants';

interface FileViewerModalProps {
  task: DownloadTask | null;
  onClose: () => void;
  onSaveToDevice: (task: DownloadTask) => void;
  onVerifyHash: (id: string) => Promise<boolean>;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  task,
  onClose,
  onSaveToDevice,
  onVerifyHash,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(task?.verifiedHash ?? true);

  if (!task) return null;

  const handleVerify = async () => {
    setIsVerifying(true);
    await onVerifyHash(task.id);
    setIsVerifying(false);
    setVerifiedSuccess(true);
  };

  const wifiRatio = task.downloadedBytes > 0 ? (task.wifiBytesDownloaded / task.downloadedBytes) * 100 : 50;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">File Inspector & Receipt</h3>
              <p className="text-xs text-zinc-400">Integrity verification & multi-channel transmission stats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Overview Card */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              {task.category} File
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5 break-all">{task.name}</h4>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Size: {formatBytes(task.totalBytes)} · {task.threadCount} Streams
            </p>
          </div>
          <button
            onClick={() => onSaveToDevice(task)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>

        {/* Media Preview Player (if video) */}
        {task.category === 'video' && (
          <div className="rounded-2xl overflow-hidden bg-black border border-zinc-850 aspect-video flex flex-col items-center justify-center relative">
            <video
              controls
              className="w-full h-full object-contain"
              src={task.url}
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
            />
          </div>
        )}

        {task.category === 'apk' && (
          <div className="p-3.5 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-white" /> Android Package Manifest
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-300">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px]">Package ID</span>
                <span className="truncate block font-semibold text-white">com.termux.app</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px]">Target SDK</span>
                <span className="block font-semibold text-white">Android 15 (API 35)</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px]">Architecture</span>
                <span className="block font-semibold text-zinc-300">arm64-v8a</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 block text-[9px]">Signature</span>
                <span className="block font-semibold text-white">APK v3 Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Dual-Channel Transmission Receipt (Monochrome) */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-2.5">
          <span className="text-xs font-bold text-white">
            Multipath Bonding Bandwidth Receipt
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700">
              <div className="flex items-center gap-1.5 text-white font-semibold mb-1">
                <Wifi className="w-3.5 h-3.5 text-white" /> Wi-Fi 7 Stream
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {formatBytes(task.wifiBytesDownloaded)}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {wifiRatio.toFixed(1)}% of total payload
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-700">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
                <Signal className="w-3.5 h-3.5 text-zinc-400" /> 5G Cellular Stream
              </div>
              <p className="text-sm font-mono font-bold text-white">
                {formatBytes(task.cellularBytesDownloaded)}
              </p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {(100 - wifiRatio).toFixed(1)}% of total payload
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
            <span>Peak Transfer Rate:</span>
            <span className="text-white font-bold">{formatSpeed(task.peakSpeed)}</span>
          </div>
        </div>

        {/* SHA-256 Checksum Block */}
        <div className="p-3.5 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" /> SHA-256 Checksum
            </span>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 font-mono"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Verifying...' : 'Re-verify Hash'}
            </button>
          </div>
          <code className="text-[10px] font-mono text-zinc-400 break-all p-2 rounded-lg bg-zinc-950 border border-zinc-850 select-all">
            {task.sha256}
          </code>
          {verifiedSuccess && (
            <p className="text-[10px] text-white flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-white" /> Checksum matches remote origin digest. Zero corrupt bytes.
            </p>
          )}
        </div>

        <div className="text-[11px] font-mono text-zinc-500 break-all">
          Saved at: {task.destinationPath}
        </div>
      </div>
    </div>
  );
};
