import React, { useState } from 'react';
import { Layers, Wifi, Signal, CheckCircle2, HelpCircle } from 'lucide-react';
import { DownloadTask, DownloadSegment } from '../types/download';
import { formatBytes } from '../utils/constants';

interface SegmentMatrixVisualizerProps {
  task: DownloadTask | null;
  onSelectRouteMode?: (mode: 'turbo' | 'wifi_only' | 'cellular_only') => void;
}

export const SegmentMatrixVisualizer: React.FC<SegmentMatrixVisualizerProps> = ({
  task,
  onSelectRouteMode,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<DownloadSegment | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!task) {
    return (
      <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-6 text-center text-zinc-500 text-xs">
        No active file selected for multi-segment analysis.
      </div>
    );
  }

  const segments = task.segments || [];
  const completedCount = segments.filter(s => s.status === 'completed').length;
  const wifiSegments = segments.filter(s => s.route === 'wifi');
  const cellSegments = segments.filter(s => s.route === 'cellular');

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                Segment Multiplexer ({task.threadCount} Parallel Streams)
              </h3>
              <button
                onClick={() => setShowInfoModal(true)}
                className="text-zinc-500 hover:text-zinc-300"
                title="How segment bonding works"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Byte chunk distribution for <span className="text-white font-medium">{task.name}</span>
            </p>
          </div>
        </div>

        {/* Task-specific route mode switch (Monochrome) */}
        {onSelectRouteMode && (
          <div className="flex items-center p-1 bg-black rounded-xl border border-zinc-800 text-[11px] font-semibold">
            <button
              onClick={() => onSelectRouteMode('turbo')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                task.bondingMode === 'turbo'
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dual Turbo
            </button>
            <button
              onClick={() => onSelectRouteMode('wifi_only')}
              className={`px-2 py-1 rounded-lg transition-all ${
                task.bondingMode === 'wifi_only'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Wi-Fi Only
            </button>
            <button
              onClick={() => onSelectRouteMode('cellular_only')}
              className={`px-2 py-1 rounded-lg transition-all ${
                task.bondingMode === 'cellular_only'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              5G Only
            </button>
          </div>
        )}
      </div>

      {/* Legend & Channel Distribution Bar (Monochrome) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 px-3 rounded-2xl bg-black border border-zinc-850">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-white" /> Wi-Fi 7 Stream ({wifiSegments.length})
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-600" /> 5G Cellular Stream ({cellSegments.length})
          </span>
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm border border-zinc-400" /> Completed ({completedCount})
          </span>
        </div>

        <div className="text-[11px] font-mono text-zinc-400">
          Chunk Size: ~{formatBytes(task.totalBytes / task.threadCount, 0)} each
        </div>
      </div>

      {/* Interactive Segment Matrix Grid (Clean B&W) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-2">
        {segments.map((seg) => {
          const isSelected = selectedSegment?.id === seg.id;
          const isDone = seg.status === 'completed' || seg.downloadedBytes >= seg.totalBytes;
          const segPercent = Math.min(100, Math.floor((seg.downloadedBytes / seg.totalBytes) * 100));
          const isWifi = seg.route === 'wifi';

          return (
            <button
              key={seg.id}
              onClick={() => setSelectedSegment(seg)}
              className={`relative h-14 rounded-xl border p-1.5 flex flex-col justify-between text-left transition-all overflow-hidden ${
                isSelected
                  ? 'border-white bg-zinc-800 ring-2 ring-white scale-[1.03] z-10'
                  : isDone
                  ? 'border-zinc-700 bg-zinc-900/60'
                  : isWifi
                  ? 'border-zinc-600 bg-zinc-900 hover:border-white'
                  : 'border-zinc-800 bg-black hover:border-zinc-600'
              }`}
            >
              {/* Internal progress fill */}
              {!isDone && (
                <div
                  style={{ height: `${segPercent}%` }}
                  className={`absolute bottom-0 left-0 right-0 opacity-20 transition-all duration-300 ${
                    isWifi ? 'bg-white' : 'bg-zinc-400'
                  }`}
                />
              )}

              {/* Segment top label: ID & Route icon */}
              <div className="relative z-10 flex items-center justify-between text-[10px] w-full font-mono">
                <span className="font-bold text-zinc-300">#{seg.id + 1}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                ) : isWifi ? (
                  <Wifi className="w-3 h-3 text-white" />
                ) : (
                  <Signal className="w-3 h-3 text-zinc-400" />
                )}
              </div>

              {/* Segment bottom: Percent */}
              <div className="relative z-10 font-mono text-[9px] leading-tight">
                {isDone ? (
                  <span className="text-white font-bold">100%</span>
                ) : (
                  <span className={isWifi ? 'text-white' : 'text-zinc-400'}>
                    {segPercent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Segment Telemetry Inspector Drawer */}
      {selectedSegment && (
        <div className="p-4 rounded-2xl bg-black border border-zinc-700 animate-in fade-in duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-800">
              {selectedSegment.route === 'wifi' ? <Wifi className="w-5 h-5 text-white" /> : <Signal className="w-5 h-5 text-zinc-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Stream Segment #{selectedSegment.id + 1}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {selectedSegment.route === 'wifi' ? 'Wi-Fi 7 Link' : '5G Cellular Link'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Range: {selectedSegment.startByte.toLocaleString()} – {selectedSegment.endByte.toLocaleString()} bytes ({formatBytes(selectedSegment.totalBytes)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] block">Transferred</span>
              <span className="text-white font-semibold">{formatBytes(selectedSegment.downloadedBytes)}</span>
            </div>
            <div>
              <span className="text-zinc-500 text-[10px] block">Status</span>
              <span className="font-semibold capitalize text-white">
                {selectedSegment.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Explanatory Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-white" />
                How Flash Dual-Channel Works
              </h4>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-zinc-800"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Standard downloaders only use Wi-Fi OR Cellular at one time. Flash bonds both channels simultaneously:
            </p>
            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                <div>
                  <strong className="text-white">Parallel HTTP Range Slicing:</strong> Slices the target file into parallel byte chunks.
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                <div>
                  <strong className="text-white">Simultaneous Socket Multiplexing:</strong> Binds odd chunks to Wi-Fi and even chunks to Cellular simultaneously.
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-zinc-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                <div>
                  <strong className="text-white">Dynamic Re-routing:</strong> Automatically shifts lagging segments to whichever channel is currently faster.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
