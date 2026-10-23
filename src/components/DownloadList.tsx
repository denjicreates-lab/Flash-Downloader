import React, { useState } from 'react';
import {
  DownloadCloud,
  Pause,
  Play,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  FileCode,
  Video,
  Music,
  Archive,
  FileText,
  File,
  Plus,
  Wifi,
  Signal,
  Eye,
  Download,
} from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { DownloadCategory, DownloadTask } from '../types/download';
import { formatBytes, formatSpeed, formatSeconds } from '../utils/constants';

interface DownloadListProps {
  onOpenNewModal: () => void;
  onPreviewFile: (task: DownloadTask) => void;
}

export const DownloadList: React.FC<DownloadListProps> = ({
  onOpenNewModal,
  onPreviewFile,
}) => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    pauseTask,
    resumeTask,
    deleteTask,
    restartTask,
    triggerBrowserSave,
  } = useDownloads();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'active' && task.status === 'completed') return false;
    if (activeTab === 'completed' && task.status !== 'completed') return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (cat: DownloadCategory) => {
    switch (cat) {
      case 'apk':
        return <FileCode className="w-5 h-5 text-white" />;
      case 'video':
        return <Video className="w-5 h-5 text-white" />;
      case 'music':
        return <Music className="w-5 h-5 text-white" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-white" />;
      case 'document':
        return <FileText className="w-5 h-5 text-white" />;
      default:
        return <File className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-4 text-white">
      {/* Top Header & New Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-white" />
          <h3 className="text-base font-bold text-white">Download Queue</h3>
          <span className="text-xs font-mono text-zinc-500 ml-1">({tasks.length} files)</span>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Add File URL
        </button>
      </div>

      {/* Tabs & Category Filter (Monochrome) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-zinc-850">
        {/* Status Tab buttons */}
        <div className="flex items-center gap-1 p-1 bg-black rounded-xl border border-zinc-850 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'active' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Active ({tasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'completed' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Completed ({tasks.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 text-xs">
          {['all', 'apk', 'video', 'music', 'archive'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3 mt-1">
        {filteredTasks.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-black border border-dashed border-zinc-850 text-center flex flex-col items-center justify-center gap-2">
            <DownloadCloud className="w-8 h-8 text-zinc-600" />
            <p className="text-sm font-semibold text-zinc-300">No downloads found in this view</p>
            <p className="text-xs text-zinc-500 max-w-sm">
              Start downloading any APK, 4K video, ISO, or paste your link to utilize bonded dual-channel speeds.
            </p>
            <button
              onClick={onOpenNewModal}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              Select from Presets
            </button>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isDownloading = task.status === 'downloading';
            const isPaused = task.status === 'paused';
            const isSelected = selectedTaskId === task.id;
            const percent = Math.min(100, Math.floor((task.downloadedBytes / task.totalBytes) * 100));
            const wifiRatio = task.downloadedBytes > 0 ? (task.wifiBytesDownloaded / task.downloadedBytes) * 100 : 50;

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black border-white shadow-lg ring-1 ring-white/50'
                    : 'bg-black/70 border-zinc-850 hover:border-zinc-700'
                }`}
              >
                {/* Header: File info & status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white break-all leading-snug">
                        {task.name}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {formatBytes(task.downloadedBytes)} / {formatBytes(task.totalBytes)} · {task.threadCount} streams
                      </p>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="text-right shrink-0">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-white bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Done
                      </span>
                    ) : isDownloading ? (
                      <span className="text-sm font-mono font-bold text-white">
                        {formatSpeed(task.totalSpeed)}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                        Paused
                      </span>
                    )}
                    {!isCompleted && (
                      <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        ETA: {formatSeconds(task.etaSeconds)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress Bar (Monochrome White & Zinc) */}
                <div className="mt-3">
                  <div className="relative h-2 w-full bg-zinc-850 rounded-full overflow-hidden flex">
                    {isCompleted ? (
                      <div className="h-full w-full bg-white" />
                    ) : (
                      <>
                        <div
                          style={{ width: `${percent * (wifiRatio / 100)}%` }}
                          className="h-full bg-white transition-all duration-300"
                          title={`Wi-Fi: ${formatBytes(task.wifiBytesDownloaded)}`}
                        />
                        <div
                          style={{ width: `${percent * ((100 - wifiRatio) / 100)}%` }}
                          className="h-full bg-zinc-500 transition-all duration-300"
                          title={`Cellular: ${formatBytes(task.cellularBytesDownloaded)}`}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5">
                    <span>{percent}% finished</span>
                    {isDownloading && (
                      <div className="flex items-center gap-3">
                        <span className="text-white flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-white" /> {task.currentSpeedWifi.toFixed(1)} MB/s
                        </span>
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Signal className="w-3 h-3 text-zinc-400" /> {task.currentSpeedCellular.toFixed(1)} MB/s
                        </span>
                      </div>
                    )}
                    {isCompleted && (
                      <span className="text-zinc-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" /> SHA-256 Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-900">
                  <div className="flex items-center gap-1.5">
                    {isDownloading ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pauseTask(task.id);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1 transition-colors"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    ) : isPaused ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resumeTask(task.id);
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white text-black font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Resume
                      </button>
                    ) : null}

                    {isCompleted && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewFile(task);
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerBrowserSave(task);
                          }}
                          className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1 transition-colors"
                          title="Save to device storage"
                        >
                          <Download className="w-3.5 h-3.5" /> Save
                        </button>
                      </>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restartTask(task.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Re-download with Turbo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskId(task.id);
                      }}
                      className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                      {isSelected ? 'Viewing Segments ↓' : 'View Chunk Map'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors"
                      title="Delete download"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
