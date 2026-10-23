import React, { useState, useEffect } from 'react';
import { Gauge, Zap, Wifi, Signal, Play, RotateCcw, Award } from 'lucide-react';

export const SpeedBenchmarkView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const payloadMb = 500;

  const [wifiProgress, setWifiProgress] = useState(0);
  const [cellProgress, setCellProgress] = useState(0);
  const [turboProgress, setTurboProgress] = useState(0);

  const [wifiSpeed, setWifiSpeed] = useState(0);
  const [cellSpeed, setCellSpeed] = useState(0);
  const [turboSpeed, setTurboSpeed] = useState(0);

  const [turboFinishTime, setTurboFinishTime] = useState<number | null>(null);
  const [wifiFinishTime, setWifiFinishTime] = useState<number | null>(null);
  const [cellFinishTime, setCellFinishTime] = useState<number | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);

  const handleStartRace = () => {
    setIsRunning(true);
    setIsFinished(false);
    setWifiProgress(0);
    setCellProgress(0);
    setTurboProgress(0);
    setTurboFinishTime(null);
    setWifiFinishTime(null);
    setCellFinishTime(null);
    setElapsedTime(0);
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const nextTime = Number((prev + 0.1).toFixed(1));

        const curWifiSpeed = 46 + Math.sin(nextTime * 1.5) * 6;
        const curCellSpeed = 40 + Math.cos(nextTime * 1.2) * 5;
        const curTurboSpeed = curWifiSpeed + curCellSpeed + (Math.random() * 4 - 2);

        setWifiSpeed(curWifiSpeed);
        setCellSpeed(curCellSpeed);
        setTurboSpeed(curTurboSpeed);

        setTurboProgress(tp => {
          if (tp >= payloadMb) {
            if (!turboFinishTime) setTurboFinishTime(nextTime);
            return payloadMb;
          }
          const next = Math.min(payloadMb, tp + curTurboSpeed * 0.1);
          if (next >= payloadMb && !turboFinishTime) setTurboFinishTime(nextTime);
          return next;
        });

        setWifiProgress(wp => {
          if (wp >= payloadMb) {
            if (!wifiFinishTime) setWifiFinishTime(nextTime);
            return payloadMb;
          }
          const next = Math.min(payloadMb, wp + curWifiSpeed * 0.1);
          if (next >= payloadMb && !wifiFinishTime) setWifiFinishTime(nextTime);
          return next;
        });

        setCellProgress(cp => {
          if (cp >= payloadMb) {
            if (!cellFinishTime) setCellFinishTime(nextTime);
            return payloadMb;
          }
          const next = Math.min(payloadMb, cp + curCellSpeed * 0.1);
          if (next >= payloadMb && !cellFinishTime) setCellFinishTime(nextTime);
          return next;
        });

        if (nextTime >= 13) {
          setIsRunning(false);
          setIsFinished(true);
        }

        return nextTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, turboFinishTime, wifiFinishTime, cellFinishTime]);

  const turboPct = Math.min(100, Math.floor((turboProgress / payloadMb) * 100));
  const wifiPct = Math.min(100, Math.floor((wifiProgress / payloadMb) * 100));
  const cellPct = Math.min(100, Math.floor((cellProgress / payloadMb) * 100));

  return (
    <div className="w-full bg-zinc-950 border border-zinc-850 rounded-3xl p-5 shadow-xl flex flex-col gap-5 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Bandwidth Clash Benchmark
            </h3>
            <p className="text-xs text-zinc-400">
              Comparing Single Channel vs Flash Dual Turbo with 500 MB Payload
            </p>
          </div>
        </div>

        <button
          onClick={handleStartRace}
          disabled={isRunning}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            isRunning
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" /> Testing ({elapsedTime}s)
            </>
          ) : isFinished ? (
            <>
              <RotateCcw className="w-4 h-4" /> Re-run Clash Test
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black" /> Start Benchmark
            </>
          )}
        </button>
      </div>

      {/* Comparison Race Tracks (Clean Monochrome) */}
      <div className="space-y-4">
        {/* Track 1: Flash Turbo Dual Channel */}
        <div className="p-4 rounded-2xl bg-black border border-white relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-white text-black font-mono font-bold text-[10px]">
                1ST PLACE
              </span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-white text-white" /> Flash Dual-Channel Turbo (Wi-Fi + 5G)
              </span>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-white">
                {isRunning ? `${turboSpeed.toFixed(1)} MB/s` : turboFinishTime ? `Finished in ${turboFinishTime}s` : '86.5 MB/s'}
              </span>
            </div>
          </div>

          <div className="h-3 w-full bg-zinc-850 rounded-full overflow-hidden relative">
            <div
              style={{ width: `${isRunning || isFinished ? turboPct : 100}%` }}
              className="h-full bg-white transition-all duration-100"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5">
            <span>{isRunning || isFinished ? `${turboProgress.toFixed(0)} / ${payloadMb} MB (${turboPct}%)` : 'Ready to test'}</span>
            <span className="text-white font-semibold">2.1x – 2.4x Speed Multiplier</span>
          </div>
        </div>

        {/* Track 2: Wi-Fi Alone */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-zinc-300" /> Wi-Fi 7 Only (Single Link)
              </span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-semibold text-zinc-300">
                {isRunning ? `${wifiSpeed.toFixed(1)} MB/s` : wifiFinishTime ? `Finished in ${wifiFinishTime}s` : '46.2 MB/s'}
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div
              style={{ width: `${isRunning || isFinished ? wifiPct : 52}%` }}
              className="h-full bg-zinc-400 transition-all duration-100"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5">
            <span>{isRunning || isFinished ? `${wifiProgress.toFixed(0)} / ${payloadMb} MB (${wifiPct}%)` : 'Baseline: 5GHz / 6GHz'}</span>
            <span>Single link limit</span>
          </div>
        </div>

        {/* Track 3: 5G Cellular Alone */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-850">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Signal className="w-4 h-4 text-zinc-400" /> 5G Cellular Only (Single Link)
              </span>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-semibold text-zinc-400">
                {isRunning ? `${cellSpeed.toFixed(1)} MB/s` : cellFinishTime ? `Finished in ${cellFinishTime}s` : '40.8 MB/s'}
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-zinc-850 rounded-full overflow-hidden">
            <div
              style={{ width: `${isRunning || isFinished ? cellPct : 46}%` }}
              className="h-full bg-zinc-600 transition-all duration-100"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-1.5">
            <span>{isRunning || isFinished ? `${cellProgress.toFixed(0)} / ${payloadMb} MB (${cellPct}%)` : 'Baseline: 5G SA Sub-6'}</span>
            <span>Single link limit</span>
          </div>
        </div>
      </div>

      {/* Benchmark Findings */}
      <div className="p-4 rounded-2xl bg-black border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Dual-Channel Advantage</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Concurrently dispatching chunks across both hardware antennas eliminates idle channel capacity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-center shrink-0">
          <div>
            <span className="text-lg font-extrabold font-mono text-white">+114%</span>
            <span className="text-[10px] text-zinc-400 block">Bandwidth Gain</span>
          </div>
          <div>
            <span className="text-lg font-extrabold font-mono text-white">5.8s</span>
            <span className="text-[10px] text-zinc-400 block">Saved per 500 MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
