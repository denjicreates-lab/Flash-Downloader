import React, { useState } from 'react';
import { X, Zap, Link, Folder, Layers } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { SAMPLE_PRESET_DOWNLOADS, formatBytes } from '../utils/constants';
import { DownloadCategory } from '../types/download';

interface NewDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
}

export const NewDownloadModal: React.FC<NewDownloadModalProps> = ({
  isOpen,
  onClose,
  initialUrl = '',
}) => {
  const { addTask } = useDownloads();

  const [url, setUrl] = useState(initialUrl);
  const [name, setName] = useState('');
  const [sizeMb, setSizeMb] = useState(250);
  const [category, setCategory] = useState<DownloadCategory>('video');
  const [threadCount, setThreadCount] = useState<number>(32);
  const [bondingMode, setBondingMode] = useState<'turbo' | 'wifi_only' | 'cellular_only'>('turbo');
  const [isRealDownload, setIsRealDownload] = useState(true);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof SAMPLE_PRESET_DOWNLOADS[0]) => {
    setUrl(preset.url);
    setName(preset.name);
    setSizeMb(Math.round(preset.sizeBytes / (1024 * 1024)));
    setCategory(preset.category);
    setThreadCount(preset.threads);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let finalName = name.trim();
    if (!finalName) {
      try {
        const u = new URL(url);
        finalName = u.pathname.split('/').pop() || 'file_' + Date.now();
      } catch {
        finalName = 'download_' + Date.now() + '.bin';
      }
    }

    addTask({
      name: finalName,
      url: url.trim(),
      sizeBytes: sizeMb * 1024 * 1024,
      category,
      threadCount,
      bondingMode,
      isRealDownload,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">New Dual-Channel Download</h3>
              <p className="text-xs text-zinc-400">Bond Wi-Fi & 5G cellular to download at maximum speed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Picker */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
            Default Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SAMPLE_PRESET_DOWNLOADS.slice(0, 4).map(preset => {
              const isPicked = url === preset.url;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isPicked
                      ? 'bg-zinc-800 border-white text-white'
                      : 'bg-black border-zinc-850 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate max-w-[170px]">{preset.name}</span>
                    <span className="text-[10px] font-mono text-white font-semibold">
                      {formatBytes(preset.sizeBytes, 0)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate mt-1">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStart} className="flex flex-col gap-4">
          {/* URL Input */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between mb-1.5">
              <span>Target File URL (HTTP/HTTPS)</span>
              <span className="text-[10px] text-zinc-400 font-mono">Range Slicing Active</span>
            </label>
            <div className="relative flex items-center">
              <Link className="w-4 h-4 text-zinc-500 absolute left-3" />
              <input
                type="text"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/largefile.zip or .apk"
                className="w-full bg-black border border-zinc-800 focus:border-white rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Filename & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Save Filename
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Auto-detected or enter name"
                className="w-full bg-black border border-zinc-800 focus:border-white rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as DownloadCategory)}
                className="w-full bg-black border border-zinc-800 focus:border-white rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none"
              >
                <option value="apk">APK App</option>
                <option value="video">Video</option>
                <option value="music">Audio</option>
                <option value="archive">Archive / ISO</option>
                <option value="document">Document</option>
                <option value="other">Binary File</option>
              </select>
            </div>
          </div>

          {/* Thread Count */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-zinc-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-white" /> Parallel Streams (Threads)
              </span>
              <span className="font-mono text-white font-bold">{threadCount} Concurrent Streams</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[8, 16, 32, 64].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThreadCount(t)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    threadCount === t
                      ? 'bg-white text-black border-white'
                      : 'bg-black border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {t}x Streams
                </button>
              ))}
            </div>
          </div>

          {/* Network Bonding Mode */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Network Routing Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBondingMode('turbo')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  bondingMode === 'turbo'
                    ? 'bg-zinc-800 border-white text-white'
                    : 'bg-black border-zinc-850 text-zinc-400'
                }`}
              >
                <span className="text-xs font-bold block text-white">Dual Turbo</span>
                <span className="text-[10px] text-zinc-400">Wi-Fi + 5G Bonded</span>
              </button>

              <button
                type="button"
                onClick={() => setBondingMode('wifi_only')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  bondingMode === 'wifi_only'
                    ? 'bg-zinc-800 border-white text-white'
                    : 'bg-black border-zinc-850 text-zinc-400'
                }`}
              >
                <span className="text-xs font-bold block text-white">Wi-Fi Only</span>
                <span className="text-[10px] text-zinc-400">Saves mobile data</span>
              </button>

              <button
                type="button"
                onClick={() => setBondingMode('cellular_only')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  bondingMode === 'cellular_only'
                    ? 'bg-zinc-800 border-white text-white'
                    : 'bg-black border-zinc-850 text-zinc-400'
                }`}
              >
                <span className="text-xs font-bold block text-white">5G Only</span>
                <span className="text-[10px] text-zinc-400">Cellular stream</span>
              </button>
            </div>
          </div>

          {/* Destination path */}
          <div className="p-2.5 rounded-xl bg-black border border-zinc-850 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
            <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="truncate">/storage/emulated/0/Download/Flash/</span>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1"
          >
            <Zap className="w-4 h-4 fill-black text-black" /> Start Turbo Download
          </button>
        </form>
      </div>
    </div>
  );
};
