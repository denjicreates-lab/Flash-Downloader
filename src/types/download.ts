export type DownloadCategory = 'apk' | 'video' | 'music' | 'document' | 'archive' | 'image' | 'other';

export type DownloadStatus = 'downloading' | 'paused' | 'completed' | 'queued' | 'error' | 'verifying';

export type NetworkRoute = 'wifi' | 'cellular';

export interface DownloadSegment {
  id: number;
  startByte: number;
  endByte: number;
  downloadedBytes: number;
  totalBytes: number;
  route: NetworkRoute;
  status: 'idle' | 'downloading' | 'verifying' | 'completed';
  speedBytesPerSec: number;
  retryCount: number;
}

export interface SpeedPoint {
  time: number; // timestamp or index
  wifi: number; // MB/s
  cellular: number; // MB/s
  total: number; // MB/s
}

export interface DownloadTask {
  id: string;
  name: string;
  url: string;
  category: DownloadCategory;
  totalBytes: number;
  downloadedBytes: number;
  status: DownloadStatus;
  threadCount: number;
  segments: DownloadSegment[];
  wifiBytesDownloaded: number;
  cellularBytesDownloaded: number;
  currentSpeedWifi: number; // MB/s
  currentSpeedCellular: number; // MB/s
  totalSpeed: number; // MB/s
  peakSpeed: number; // MB/s
  etaSeconds: number;
  speedHistory: SpeedPoint[];
  sha256: string;
  verifiedHash?: boolean;
  addedAt: number;
  completedAt?: number;
  isRealDownload?: boolean;
  blobUrl?: string;
  destinationPath: string;
  bondingMode: 'turbo' | 'wifi_only' | 'cellular_only';
}

export interface NetworkInterfaceStats {
  wifi: {
    enabled: boolean;
    ssid: string;
    standard: string; // e.g. "Wi-Fi 7 (802.11be)"
    frequency: string; // "6.0 GHz"
    signalDbm: number; // -42
    currentSpeedMbps: number;
    totalDownloadedMb: number;
    latencyMs: number;
  };
  cellular: {
    enabled: boolean;
    carrier: string; // "Verizon Wireless"
    networkType: string; // "5G Ultra Wideband (n78+n258)"
    signalDbm: number; // -78
    currentSpeedMbps: number;
    totalDownloadedMb: number;
    latencyMs: number;
    monthlyQuotaGb: number;
    monthlyUsedGb: number;
  };
  turboBondingActive: boolean;
  mptcpAlgorithm: 'bbr' | 'cubic' | 'flash_hybrid';
  maxThreads: number;
  chunkSizeMb: number;
  thermalThrottleActive: boolean;
  batteryTempC: number;
  cpuLoadPercent: number;
}
