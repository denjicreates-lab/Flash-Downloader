import React, { useState } from 'react';
import { Compass, Globe, ArrowLeft, ArrowRight, RotateCw, Download, Zap, ShieldCheck } from 'lucide-react';
import { SAMPLE_PRESET_DOWNLOADS } from '../utils/constants';

interface BrowserSnifferViewProps {
  onStartDownloadWithUrl: (url: string, name: string) => void;
}

export const BrowserSnifferView: React.FC<BrowserSnifferViewProps> = ({
  onStartDownloadWithUrl,
}) => {
  const [address, setAddress] = useState('https://archive.org/download/open-media-vault');
  const [activeSite, setActiveSite] = useState<'archive' | 'github' | 'linux'>('archive');
  const [detectedSniffLink, setDetectedSniffLink] = useState<{
    name: string;
    url: string;
    size: string;
    type: string;
  } | null>({
    name: 'Cosmos-Laundromat-4K-HDR.mp4',
    url: SAMPLE_PRESET_DOWNLOADS[1].url,
    size: '640 MB',
    type: 'Video MP4',
  });

  const sites = {
    archive: [
      {
        title: 'Cosmos Laundromat (First Cycle) 4K Ultra-HD Master',
        file: 'Cosmos-Laundromat-4K-HDR.mp4',
        url: SAMPLE_PRESET_DOWNLOADS[1].url,
        size: '640 MB',
        type: '4K Video',
      },
      {
        title: 'Cyberpunk Ambient Lossless Soundtrack 24-bit FLAC',
        file: 'Cyberpunk-HiRes-Audio-OST-Lossless.flac',
        url: SAMPLE_PRESET_DOWNLOADS[3].url,
        size: '230 MB',
        type: 'FLAC Audio',
      },
      {
        title: 'Classic LibriVox Audio Archive Complete Works',
        file: 'librivox-audio-anthology-vol1.zip',
        url: 'https://example.com/audiobooks/vol1.zip',
        size: '185 MB',
        type: 'ZIP Archive',
      },
    ],
    github: [
      {
        title: 'Termux Android Terminal Environment (v0.119 Universal APK)',
        file: 'Termux-Pro-Terminal-v0.119.apk',
        url: SAMPLE_PRESET_DOWNLOADS[0].url,
        size: '100 MB',
        type: 'Android APK',
      },
      {
        title: 'TensorFlow Lite MobileNet NPU Neural Weight Binary',
        file: 'TensorFlow-Lite-MobileNet-v3.tflite',
        url: SAMPLE_PRESET_DOWNLOADS[4].url,
        size: '40 MB',
        type: 'Model Weights',
      },
    ],
    linux: [
      {
        title: 'Ubuntu Core 24.04 LTS Live ISO Image (x86_64)',
        file: 'Ubuntu-Core-24.04-LTS-x64.iso',
        url: SAMPLE_PRESET_DOWNLOADS[2].url,
        size: '1.5 GB',
        type: 'OS Image',
      },
      {
        title: 'Debian 12 Bookworm Minimal NetInstall Network ISO',
        file: 'debian-12.5.0-amd64-netinst.iso',
        url: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.5.0-amd64-netinst.iso',
        size: '628 MB',
        type: 'OS Image',
      },
    ],
  };

  const handleLinkClick = (item: { title: string; file: string; url: string; size: string; type: string }) => {
    setDetectedSniffLink({
      name: item.file,
      url: item.url,
      size: item.size,
      type: item.type,
    });
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Link Sniffer & Browser</h3>
            <p className="text-xs text-zinc-400">Auto-detects download links with 1-tap Dual Turbo</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Sniffer Armed</span>
        </div>
      </div>

      {/* Browser Bar (Monochrome) */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-black border border-zinc-850">
        <button className="p-1 text-zinc-500 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button className="p-1 text-zinc-500 hover:text-white">
          <ArrowRight className="w-4 h-4" />
        </button>
        <button className="p-1 text-zinc-500 hover:text-white">
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-transparent text-white focus:outline-none font-mono text-[11px]"
            placeholder="Enter web address or search"
          />
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveSite('archive');
            setAddress('https://archive.org/download/open-media-vault');
          }}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeSite === 'archive' ? 'bg-white text-black border-white' : 'bg-black border-zinc-850 text-zinc-400'
          }`}
        >
          Archive.org Vault
        </button>
        <button
          onClick={() => {
            setActiveSite('github');
            setAddress('https://github.com/releases/mobile-open-source');
          }}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeSite === 'github' ? 'bg-white text-black border-white' : 'bg-black border-zinc-850 text-zinc-400'
          }`}
        >
          GitHub Releases & APKs
        </button>
        <button
          onClick={() => {
            setActiveSite('linux');
            setAddress('https://mirrors.kernel.org/os-distros');
          }}
          className={`px-3 py-1.5 rounded-xl border transition-colors ${
            activeSite === 'linux' ? 'bg-white text-black border-white' : 'bg-black border-zinc-850 text-zinc-400'
          }`}
        >
          Linux OS Mirrors
        </button>
      </div>

      {/* Webpage Content Simulation */}
      <div className="p-4 rounded-2xl bg-black border border-zinc-850 min-h-[220px] flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-850 text-xs text-zinc-400">
          <span>Repository Index</span>
          <span className="font-mono text-[10px]">HTTP Range 206 Supported</span>
        </div>

        <div className="space-y-2">
          {sites[activeSite].map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleLinkClick(item)}
              className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-850 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {item.title}
                </p>
                <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  File: {item.file} · {item.type}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-white font-bold">{item.size}</span>
                <span className="p-1 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-white group-hover:text-black transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Sniffer Toast Alert (Clean B&W) */}
      {detectedSniffLink && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-black">
              <Zap className="w-5 h-5 fill-black text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Link Sniffer Caught File
                </span>
                <span className="text-[10px] text-zinc-300 font-mono font-semibold">({detectedSniffLink.size})</span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                {detectedSniffLink.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onStartDownloadWithUrl(detectedSniffLink.url, detectedSniffLink.name)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-black" /> Catch with Turbo
            </button>
            <button
              onClick={() => setDetectedSniffLink(null)}
              className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
