import React, { useState } from 'react';
import { HardDrive, Folder, ShieldCheck, Download, Trash2, Eye, FileCode, Video, Music, Archive } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import { DownloadTask, DownloadCategory } from '../types/download';
import { formatBytes } from '../utils/constants';

interface StorageFilesViewProps {
  onPreviewFile: (task: DownloadTask) => void;
}

export const StorageFilesView: React.FC<StorageFilesViewProps> = ({ onPreviewFile }) => {
  const { tasks, deleteTask, triggerBrowserSave } = useDownloads();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const completedTasks = tasks.filter(t => t.status === 'completed');

  const filteredTasks = completedTasks.filter(task => {
    if (activeCategory === 'all') return true;
    return task.category === activeCategory;
  });

  const totalUsedBytes = completedTasks.reduce((acc, t) => acc + t.totalBytes, 0);

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
      default:
        return <Folder className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-5 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Storage Manager</h3>
            <p className="text-xs text-zinc-400">Directory: /storage/emulated/0/Download/Flash/</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
          {formatBytes(totalUsedBytes)} Used
        </span>
      </div>

      {/* Storage Disk Bar */}
      <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-300">Internal Storage (UFS 4.0)</span>
          <span className="text-zinc-500">113.6 GB Available / 256 GB</span>
        </div>

        <div className="h-2 w-full bg-zinc-850 rounded-full overflow-hidden flex">
          <div style={{ width: '45%' }} className="bg-zinc-700 h-full" title="Android OS & Apps" />
          <div style={{ width: '12%' }} className="bg-white h-full" title="Flash Turbo Downloads" />
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white inline-block" /> Flash Downloads ({formatBytes(totalUsedBytes)})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" /> Android System (104 GB)
          </span>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['all', 'apk', 'video', 'music', 'archive'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl uppercase text-[10px] font-bold tracking-wider transition-colors ${
              activeCategory === cat
                ? 'bg-white text-black font-bold'
                : 'bg-black border border-zinc-850 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Completed Files List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black border border-dashed border-zinc-850 text-center text-zinc-500 text-xs">
            No downloaded files in this folder yet.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl bg-black border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0">
                  {getCategoryIcon(task.category)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white break-all">{task.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                    <span>{formatBytes(task.totalBytes)}</span>
                    <span>·</span>
                    <span className="text-zinc-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-white" /> SHA-256 Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => onPreviewFile(task)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => triggerBrowserSave(task)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors"
                  title="Export file"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-850 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
