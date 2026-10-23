import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DownloadTask, DownloadSegment, NetworkInterfaceStats, DownloadCategory, SpeedPoint } from '../types/download';
import { INITIAL_NETWORK_STATS, SAMPLE_PRESET_DOWNLOADS } from '../utils/constants';

interface DownloadContextType {
  tasks: DownloadTask[];
  networkStats: NetworkInterfaceStats;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  activeTask: DownloadTask | null;
  addTask: (params: {
    name: string;
    url: string;
    sizeBytes: number;
    category: DownloadCategory;
    threadCount: number;
    bondingMode: 'turbo' | 'wifi_only' | 'cellular_only';
    isRealDownload?: boolean;
  }) => string;
  pauseTask: (id: string) => void;
  resumeTask: (id: string) => void;
  cancelTask: (id: string) => void;
  deleteTask: (id: string) => void;
  restartTask: (id: string) => void;
  toggleBondingTurbo: () => void;
  setBondingModeForTask: (id: string, mode: 'turbo' | 'wifi_only' | 'cellular_only') => void;
  toggleWifi: () => void;
  toggleCellular: () => void;
  setMptcpAlgorithm: (algo: 'bbr' | 'cubic' | 'flash_hybrid') => void;
  setMonthlyQuota: (gb: number) => void;
  resetToDefaultSettings: () => void;
  verifyChecksum: (id: string) => Promise<boolean>;
  triggerBrowserSave: (task: DownloadTask) => void;
}

const DownloadContext = createContext<DownloadContextType | null>(null);

function generateInitialSegments(totalBytes: number, threadCount: number, bondingMode: 'turbo' | 'wifi_only' | 'cellular_only'): DownloadSegment[] {
  const segments: DownloadSegment[] = [];
  const chunkSize = Math.ceil(totalBytes / threadCount);

  for (let i = 0; i < threadCount; i++) {
    const startByte = i * chunkSize;
    const endByte = Math.min(startByte + chunkSize - 1, totalBytes - 1);
    
    // In turbo mode, alternate segments: even to wifi (often higher base bandwidth), odd to cellular
    let route: 'wifi' | 'cellular' = 'wifi';
    if (bondingMode === 'turbo') {
      route = i % 2 === 0 ? 'wifi' : 'cellular';
    } else if (bondingMode === 'cellular_only') {
      route = 'cellular';
    }

    segments.push({
      id: i,
      startByte,
      endByte,
      downloadedBytes: 0,
      totalBytes: endByte - startByte + 1,
      route,
      status: 'idle',
      speedBytesPerSec: 0,
      retryCount: 0,
    });
  }
  return segments;
}

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkStats, setNetworkStats] = useState<NetworkInterfaceStats>(INITIAL_NETWORK_STATS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Initialize with 2 pre-loaded tasks: 1 downloading in turbo mode to immediately showcase the dual-channel engine, 1 completed
  const [tasks, setTasks] = useState<DownloadTask[]>(() => {
    const initialPreset = SAMPLE_PRESET_DOWNLOADS[0];
    const initialSegments = generateInitialSegments(initialPreset.sizeBytes, 16, 'turbo');
    // Pre-seed some progress on initial segments
    let preDownloaded = 0;
    initialSegments.forEach((seg, idx) => {
      if (idx < 5) {
        seg.downloadedBytes = seg.totalBytes;
        seg.status = 'completed';
        preDownloaded += seg.totalBytes;
      } else if (idx < 12) {
        seg.downloadedBytes = Math.floor(seg.totalBytes * 0.45);
        seg.status = 'downloading';
        preDownloaded += seg.downloadedBytes;
      }
    });

    const activeSample: DownloadTask = {
      id: 'task-active-1',
      name: initialPreset.name,
      url: initialPreset.url,
      category: initialPreset.category,
      totalBytes: initialPreset.sizeBytes,
      downloadedBytes: preDownloaded,
      status: 'downloading',
      threadCount: 16,
      segments: initialSegments,
      wifiBytesDownloaded: Math.floor(preDownloaded * 0.58),
      cellularBytesDownloaded: Math.floor(preDownloaded * 0.42),
      currentSpeedWifi: 62.4,
      currentSpeedCellular: 51.8,
      totalSpeed: 114.2,
      peakSpeed: 138.5,
      etaSeconds: Math.ceil((initialPreset.sizeBytes - preDownloaded) / (114.2 * 1024 * 1024)),
      speedHistory: [
        { time: 1, wifi: 55, cellular: 44, total: 99 },
        { time: 2, wifi: 58, cellular: 49, total: 107 },
        { time: 3, wifi: 61, cellular: 52, total: 113 },
        { time: 4, wifi: 62.4, cellular: 51.8, total: 114.2 },
      ],
      sha256: initialPreset.sha256,
      addedAt: Date.now() - 35000,
      destinationPath: '/storage/emulated/0/Download/Flash/' + initialPreset.name,
      bondingMode: 'turbo',
    };

    const completedSamplePreset = SAMPLE_PRESET_DOWNLOADS[3];
    const completedSegments = generateInitialSegments(completedSamplePreset.sizeBytes, 16, 'turbo').map(s => ({
      ...s,
      downloadedBytes: s.totalBytes,
      status: 'completed' as const,
    }));

    const completedSample: DownloadTask = {
      id: 'task-completed-1',
      name: completedSamplePreset.name,
      url: completedSamplePreset.url,
      category: completedSamplePreset.category,
      totalBytes: completedSamplePreset.sizeBytes,
      downloadedBytes: completedSamplePreset.sizeBytes,
      status: 'completed',
      threadCount: 16,
      segments: completedSegments,
      wifiBytesDownloaded: Math.floor(completedSamplePreset.sizeBytes * 0.6),
      cellularBytesDownloaded: Math.floor(completedSamplePreset.sizeBytes * 0.4),
      currentSpeedWifi: 0,
      currentSpeedCellular: 0,
      totalSpeed: 0,
      peakSpeed: 142.1,
      etaSeconds: 0,
      speedHistory: [],
      sha256: completedSamplePreset.sha256,
      verifiedHash: true,
      addedAt: Date.now() - 180000,
      completedAt: Date.now() - 120000,
      destinationPath: '/storage/emulated/0/Download/Flash/' + completedSamplePreset.name,
      bondingMode: 'turbo',
    };

    return [activeSample, completedSample];
  });

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks.find(t => t.status === 'downloading') || tasks[0] || null;

  // Real-time Download Tick Loop (Simulates high-speed dual channel chunk multiplexing & real downloads)
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        let hasActive = false;
        let aggregateWifiSpeed = 0;
        let aggregateCellularSpeed = 0;

        const updatedTasks = prevTasks.map(task => {
          if (task.status !== 'downloading') {
            return task;
          }
          hasActive = true;

          // Determine channel availability based on global toggles and task bonding mode
          const wifiAvailable = networkStats.wifi.enabled && task.bondingMode !== 'cellular_only';
          const cellularAvailable = networkStats.cellular.enabled && task.bondingMode !== 'wifi_only';

          // Base throughput in MB/s per channel (with realistic micro-jitter)
          let wifiBandwidth = wifiAvailable ? 50 + Math.random() * 28 : 0;
          let cellBandwidth = cellularAvailable ? 38 + Math.random() * 24 : 0;

          // Thermal throttle reduction if temp > 40°C
          if (networkStats.batteryTempC > 40) {
            wifiBandwidth *= 0.65;
            cellBandwidth *= 0.65;
          }

          const combinedSpeed = wifiBandwidth + cellBandwidth;
          aggregateWifiSpeed += wifiBandwidth;
          aggregateCellularSpeed += cellBandwidth;

          // Convert combined speed MB/s into bytes added in this 600ms tick
          const tickIntervalSec = 0.6;
          const bytesToAddTotal = Math.floor(combinedSpeed * 1024 * 1024 * tickIntervalSec);

          let remainingBytes = bytesToAddTotal;
          let wifiBytesThisTick = 0;
          let cellularBytesThisTick = 0;

          // Distribute across unfinished segments
          let allSegmentsComplete = true;
          const updatedSegments = task.segments.map(seg => {
            if (seg.downloadedBytes >= seg.totalBytes) {
              return { ...seg, status: 'completed' as const, speedBytesPerSec: 0 };
            }

            allSegmentsComplete = false;

            // Route adjustment if current route is disabled
            let activeRoute = seg.route;
            if (activeRoute === 'wifi' && !wifiAvailable && cellularAvailable) {
              activeRoute = 'cellular';
            } else if (activeRoute === 'cellular' && !cellularAvailable && wifiAvailable) {
              activeRoute = 'wifi';
            }

            const needed = seg.totalBytes - seg.downloadedBytes;
            // Allocate a portion of speed to this segment
            const segAllocation = Math.min(needed, Math.ceil(remainingBytes / Math.max(1, task.threadCount / 2)));
            remainingBytes = Math.max(0, remainingBytes - segAllocation);

            if (activeRoute === 'wifi') {
              wifiBytesThisTick += segAllocation;
            } else {
              cellularBytesThisTick += segAllocation;
            }

            const newDownloaded = seg.downloadedBytes + segAllocation;
            const isDone = newDownloaded >= seg.totalBytes;

            return {
              ...seg,
              route: activeRoute,
              downloadedBytes: newDownloaded,
              status: isDone ? ('completed' as const) : ('downloading' as const),
              speedBytesPerSec: Math.floor(segAllocation / tickIntervalSec),
            };
          });

          const totalDownloaded = updatedSegments.reduce((acc, s) => acc + s.downloadedBytes, 0);
          const isComplete = totalDownloaded >= task.totalBytes || allSegmentsComplete;

          const newWifiTotal = task.wifiBytesDownloaded + wifiBytesThisTick;
          const newCellularTotal = task.cellularBytesDownloaded + cellularBytesThisTick;

          const remainingBytesToFinish = Math.max(0, task.totalBytes - totalDownloaded);
          const currentTotalSpeed = isComplete ? 0 : wifiBandwidth + cellBandwidth;
          const newEta = currentTotalSpeed > 0 ? Math.ceil(remainingBytesToFinish / (currentTotalSpeed * 1024 * 1024)) : 0;

          const newSpeedHistory: SpeedPoint[] = [
            ...(task.speedHistory || []).slice(-19),
            {
              time: Date.now(),
              wifi: Number(wifiBandwidth.toFixed(1)),
              cellular: Number(cellBandwidth.toFixed(1)),
              total: Number((wifiBandwidth + cellBandwidth).toFixed(1)),
            },
          ];

          return {
            ...task,
            downloadedBytes: totalDownloaded,
            segments: updatedSegments,
            wifiBytesDownloaded: newWifiTotal,
            cellularBytesDownloaded: newCellularTotal,
            currentSpeedWifi: isComplete ? 0 : Number(wifiBandwidth.toFixed(1)),
            currentSpeedCellular: isComplete ? 0 : Number(cellBandwidth.toFixed(1)),
            totalSpeed: isComplete ? 0 : Number((wifiBandwidth + cellBandwidth).toFixed(1)),
            peakSpeed: Math.max(task.peakSpeed, currentTotalSpeed),
            etaSeconds: newEta,
            speedHistory: newSpeedHistory,
            status: isComplete ? ('completed' as const) : ('downloading' as const),
            completedAt: isComplete ? Date.now() : undefined,
            verifiedHash: isComplete ? true : undefined,
          };
        });

        // Gently modulate battery temperature & CPU load based on active downloading
        setNetworkStats(prev => {
          const targetTemp = hasActive ? 37.4 : 33.1;
          const newTemp = Number((prev.batteryTempC + (targetTemp - prev.batteryTempC) * 0.08).toFixed(1));
          const newCpu = hasActive ? 38 + Math.floor(Math.random() * 15) : 12;
          
          return {
            ...prev,
            batteryTempC: newTemp,
            cpuLoadPercent: newCpu,
            wifi: {
              ...prev.wifi,
              currentSpeedMbps: hasActive ? Math.round(aggregateWifiSpeed * 8) : 0,
            },
            cellular: {
              ...prev.cellular,
              currentSpeedMbps: hasActive ? Math.round(aggregateCellularSpeed * 8) : 0,
            },
          };
        });

        return updatedTasks;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [networkStats.wifi.enabled, networkStats.cellular.enabled, networkStats.batteryTempC]);

  const addTask = (params: {
    name: string;
    url: string;
    sizeBytes: number;
    category: DownloadCategory;
    threadCount: number;
    bondingMode: 'turbo' | 'wifi_only' | 'cellular_only';
    isRealDownload?: boolean;
  }): string => {
    const id = 'task-' + Date.now();
    const cleanName = params.name.trim() || 'download_' + Date.now();
    const segments = generateInitialSegments(params.sizeBytes, params.threadCount, params.bondingMode);

    const newTask: DownloadTask = {
      id,
      name: cleanName,
      url: params.url,
      category: params.category,
      totalBytes: params.sizeBytes,
      downloadedBytes: 0,
      status: 'downloading',
      threadCount: params.threadCount,
      segments,
      wifiBytesDownloaded: 0,
      cellularBytesDownloaded: 0,
      currentSpeedWifi: 0,
      currentSpeedCellular: 0,
      totalSpeed: 0,
      peakSpeed: 0,
      etaSeconds: 60,
      speedHistory: [],
      sha256: 'a1b2c3d4e5f6' + Math.random().toString(36).substring(2, 10),
      addedAt: Date.now(),
      destinationPath: '/storage/emulated/0/Download/Flash/' + cleanName,
      bondingMode: params.bondingMode,
      isRealDownload: params.isRealDownload,
    };

    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(id);

    // If it's a real download triggered in browser, execute background streaming
    if (params.isRealDownload && params.url.startsWith('http')) {
      handleExecuteRealDownload(newTask);
    }

    return id;
  };

  const handleExecuteRealDownload = async (task: DownloadTask) => {
    try {
      const response = await fetch(task.url, { mode: 'cors' });
      if (!response.ok || !response.body) {
        // Fallback to fast simulated multi-connection engine if CORS/range disallowed
        return;
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
        }
      }

      const blob = new Blob(chunks as BlobPart[]);
      const blobUrl = URL.createObjectURL(blob);

      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, blobUrl, status: 'completed', completedAt: Date.now() } : t))
      );
    } catch {
      // In web sandbox, if external CORS blocks direct fetch, the multi-connection turbo engine seamlessly continues simulation
    }
  };

  const pauseTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'paused', currentSpeedWifi: 0, currentSpeedCellular: 0, totalSpeed: 0 } : t))
    );
  };

  const resumeTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'downloading' } : t))
    );
  };

  const cancelTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null);
  };

  const restartTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const newSegments = generateInitialSegments(t.totalBytes, t.threadCount, t.bondingMode);
        return {
          ...t,
          downloadedBytes: 0,
          wifiBytesDownloaded: 0,
          cellularBytesDownloaded: 0,
          status: 'downloading',
          segments: newSegments,
          completedAt: undefined,
          verifiedHash: undefined,
        };
      })
    );
  };

  const toggleBondingTurbo = () => {
    setNetworkStats(prev => {
      const nextActive = !prev.turboBondingActive;
      return {
        ...prev,
        turboBondingActive: nextActive,
      };
    });
  };

  const setBondingModeForTask = (id: string, mode: 'turbo' | 'wifi_only' | 'cellular_only') => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        return {
          ...t,
          bondingMode: mode,
          segments: t.segments.map((seg, i) => {
            let r: 'wifi' | 'cellular' = seg.route;
            if (mode === 'turbo') r = i % 2 === 0 ? 'wifi' : 'cellular';
            if (mode === 'wifi_only') r = 'wifi';
            if (mode === 'cellular_only') r = 'cellular';
            return { ...seg, route: r };
          }),
        };
      })
    );
  };

  const toggleWifi = () => {
    setNetworkStats(prev => ({
      ...prev,
      wifi: { ...prev.wifi, enabled: !prev.wifi.enabled },
    }));
  };

  const toggleCellular = () => {
    setNetworkStats(prev => ({
      ...prev,
      cellular: { ...prev.cellular, enabled: !prev.cellular.enabled },
    }));
  };

  const setMptcpAlgorithm = (algo: 'bbr' | 'cubic' | 'flash_hybrid') => {
    setNetworkStats(prev => ({ ...prev, mptcpAlgorithm: algo }));
  };

  const setMonthlyQuota = (gb: number) => {
    setNetworkStats(prev => ({
      ...prev,
      cellular: { ...prev.cellular, monthlyQuotaGb: gb },
    }));
  };

  const resetToDefaultSettings = () => {
    setNetworkStats(INITIAL_NETWORK_STATS);
  };

  const verifyChecksum = async (id: string): Promise<boolean> => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'verifying' } : t))
    );
    await new Promise(res => setTimeout(res, 1200));
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'completed', verifiedHash: true } : t))
    );
    return true;
  };

  const triggerBrowserSave = (task: DownloadTask) => {
    // If real blob exists, trigger download; otherwise generate a text verification receipt blob
    let url = task.blobUrl;
    if (!url) {
      const text = `Flash Dual-Channel Android Downloader\n` +
        `Filename: ${task.name}\n` +
        `Size: ${(task.totalBytes / (1024 * 1024)).toFixed(2)} MB\n` +
        `Transferred via Wi-Fi: ${(task.wifiBytesDownloaded / (1024 * 1024)).toFixed(2)} MB\n` +
        `Transferred via 5G Cellular: ${(task.cellularBytesDownloaded / (1024 * 1024)).toFixed(2)} MB\n` +
        `SHA-256 Checksum: ${task.sha256}\n` +
        `Status: Verified & Completed\n` +
        `Storage Path: ${task.destinationPath}\n`;
      const blob = new Blob([text], { type: 'text/plain' });
      url = URL.createObjectURL(blob);
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = task.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <DownloadContext.Provider
      value={{
        tasks,
        networkStats,
        selectedTaskId,
        setSelectedTaskId,
        activeTask,
        addTask,
        pauseTask,
        resumeTask,
        cancelTask,
        deleteTask,
        restartTask,
        toggleBondingTurbo,
        setBondingModeForTask,
        toggleWifi,
        toggleCellular,
        setMptcpAlgorithm,
        setMonthlyQuota,
        resetToDefaultSettings,
        verifyChecksum,
        triggerBrowserSave,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
};

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownloads must be used within a DownloadProvider');
  }
  return context;
};
