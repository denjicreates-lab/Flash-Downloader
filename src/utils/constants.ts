import { DownloadCategory, DownloadTask, NetworkInterfaceStats } from '../types/download';

export const SAMPLE_PRESET_DOWNLOADS = [
  {
    name: 'Termux-Pro-Terminal-v0.119.apk',
    url: 'https://github.com/termux/termux-app/releases/download/v0.119.0/termux-app_v0.119.0.apk',
    sizeBytes: 104857600, // 100 MB
    category: 'apk' as DownloadCategory,
    threads: 16,
    sha256: '9a7e6b81d2f8319e78a4635fc92716a5ec1d310e9f1a27e43589b2184cf432a1',
    description: 'Android terminal emulator & Linux environment package',
  },
  {
    name: 'Cosmos-Laundromat-4K-HDR.mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    sizeBytes: 671088640, // 640 MB
    category: 'video' as DownloadCategory,
    threads: 32,
    sha256: '4c871df983a54b9d03163b84179321ba994ce70a312e09e13b8214f4882140a3',
    description: 'Blender Open Movie high-bitrate 4K HDR test media',
  },
  {
    name: 'Ubuntu-Core-24.04-LTS-x64.iso',
    url: 'https://releases.ubuntu.com/24.04/ubuntu-24.04-live-server-amd64.iso',
    sizeBytes: 1572864000, // 1.5 GB
    category: 'archive' as DownloadCategory,
    threads: 32,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description: 'Full multi-threaded OS image with bonded bandwidth delivery',
  },
  {
    name: 'Cyberpunk-HiRes-Audio-OST-Lossless.flac',
    url: 'https://example.com/audio/cyberpunk-ost-24bit.flac',
    sizeBytes: 241172480, // 230 MB
    category: 'music' as DownloadCategory,
    threads: 16,
    sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    description: '24-bit 96kHz Lossless Studio Master Soundtrack',
  },
  {
    name: 'TensorFlow-Lite-MobileNet-v3.tflite',
    url: 'https://storage.googleapis.com/tfhub-modules/tensorflow/lite-model/mobilenet_v3.tflite',
    sizeBytes: 41943040, // 40 MB
    category: 'document' as DownloadCategory,
    threads: 8,
    sha256: '5d41402abc4b2a76b9719d911017c592',
    description: 'Optimized Neural Engine Weight Model for Android NPU',
  },
];

export const INITIAL_NETWORK_STATS: NetworkInterfaceStats = {
  wifi: {
    enabled: true,
    ssid: 'Flash-Turbo-WiFi7-6G',
    standard: 'Wi-Fi 7 (802.11be MLO)',
    frequency: '6.0 GHz / 320 MHz',
    signalDbm: -41,
    currentSpeedMbps: 680, // ~85 MB/s
    totalDownloadedMb: 4280,
    latencyMs: 7,
  },
  cellular: {
    enabled: true,
    carrier: 'T-Mobile 5G Ultra',
    networkType: '5G SA (n41 + n258 mmWave)',
    signalDbm: -76,
    currentSpeedMbps: 520, // ~65 MB/s
    totalDownloadedMb: 2890,
    latencyMs: 14,
    monthlyQuotaGb: 50,
    monthlyUsedGb: 14.8,
  },
  turboBondingActive: true,
  mptcpAlgorithm: 'flash_hybrid',
  maxThreads: 32,
  chunkSizeMb: 8,
  thermalThrottleActive: false,
  batteryTempC: 34.2,
  cpuLoadPercent: 28,
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSpeed(mbPerSec: number): string {
  if (mbPerSec >= 1000) {
    return `${(mbPerSec / 1024).toFixed(2)} GB/s`;
  }
  return `${mbPerSec.toFixed(1)} MB/s`;
}

export function formatSeconds(sec: number): string {
  if (sec <= 0 || !isFinite(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h}h ${remM}m`;
  }
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}
