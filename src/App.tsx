import React, { useState } from 'react';
import { DownloadProvider, useDownloads } from './context/DownloadContext';
import { AndroidFrame } from './components/AndroidFrame';
import { ActiveNavTab } from './components/AndroidNavBar';
import { DualChannelStatusCard } from './components/DualChannelStatusCard';
import { SegmentMatrixVisualizer } from './components/SegmentMatrixVisualizer';
import { DownloadList } from './components/DownloadList';
import { SpeedBenchmarkView } from './components/SpeedBenchmarkView';
import { BrowserSnifferView } from './components/BrowserSnifferView';
import { StorageFilesView } from './components/StorageFilesView';
import { NewDownloadModal } from './components/NewDownloadModal';
import { SettingsThermalDrawer } from './components/SettingsThermalDrawer';
import { AndroidNotificationShade } from './components/AndroidNotificationShade';
import { FileViewerModal } from './components/FileViewerModal';
import { DownloadTask } from './types/download';

function MainDownloaderApp() {
  const { activeTask, setBondingModeForTask, triggerBrowserSave, verifyChecksum } = useDownloads();

  const [currentTab, setCurrentTab] = useState<ActiveNavTab>('dashboard');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [modalInitialUrl, setModalInitialUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShadeOpen, setIsShadeOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<DownloadTask | null>(null);

  const handleStartDownloadFromBrowser = (url: string, name: string) => {
    setModalInitialUrl(url);
    setIsNewModalOpen(true);
  };

  return (
    <AndroidFrame
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onOpenNewModal={() => {
        setModalInitialUrl('');
        setIsNewModalOpen(true);
      }}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenShade={() => setIsShadeOpen(true)}
      isShadeOpen={isShadeOpen}
    >
      {/* Tab: Dashboard (Dual Channel Engine + Active Segment Matrix) */}
      {currentTab === 'dashboard' && (
        <div className="space-y-4">
          <DualChannelStatusCard />
          <SegmentMatrixVisualizer
            task={activeTask}
            onSelectRouteMode={(mode) => {
              if (activeTask) setBondingModeForTask(activeTask.id, mode);
            }}
          />
          <DownloadList
            onOpenNewModal={() => {
              setModalInitialUrl('');
              setIsNewModalOpen(true);
            }}
            onPreviewFile={(t) => setPreviewTask(t)}
          />
        </div>
      )}

      {/* Tab: Downloads (Queue & Segment Inspector) */}
      {currentTab === 'downloads' && (
        <div className="space-y-4">
          <DownloadList
            onOpenNewModal={() => {
              setModalInitialUrl('');
              setIsNewModalOpen(true);
            }}
            onPreviewFile={(t) => setPreviewTask(t)}
          />
          <SegmentMatrixVisualizer
            task={activeTask}
            onSelectRouteMode={(mode) => {
              if (activeTask) setBondingModeForTask(activeTask.id, mode);
            }}
          />
        </div>
      )}

      {/* Tab: Benchmark (Speed Clash Race) */}
      {currentTab === 'benchmark' && (
        <div className="space-y-4">
          <SpeedBenchmarkView />
        </div>
      )}

      {/* Tab: Sniffer & Browser */}
      {currentTab === 'browser' && (
        <div className="space-y-4">
          <BrowserSnifferView onStartDownloadWithUrl={handleStartDownloadFromBrowser} />
        </div>
      )}

      {/* Tab: Storage & Files */}
      {currentTab === 'storage' && (
        <div className="space-y-4">
          <StorageFilesView onPreviewFile={(t) => setPreviewTask(t)} />
        </div>
      )}

      {/* Modals & Android Overlays */}
      <AndroidNotificationShade
        isOpen={isShadeOpen}
        onClose={() => setIsShadeOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <NewDownloadModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        initialUrl={modalInitialUrl}
      />

      <SettingsThermalDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <FileViewerModal
        task={previewTask}
        onClose={() => setPreviewTask(null)}
        onSaveToDevice={triggerBrowserSave}
        onVerifyHash={verifyChecksum}
      />
    </AndroidFrame>
  );
}

export default function App() {
  return (
    <DownloadProvider>
      <MainDownloaderApp />
    </DownloadProvider>
  );
}
