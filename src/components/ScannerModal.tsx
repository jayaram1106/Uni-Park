import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, X, Sparkles, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { extractSpotFromInput } from '../utils/qrUtils';
import { SAMPLE_DEMO_SPOTS } from '../utils/parkingData';
import { audioFeedback } from '../utils/audioFeedback';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotIdentified: (spotId: string, source: 'qr_camera' | 'qr_demo') => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onSpotIdentified,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'denied' | 'unsupported'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [simulatedInput, setSimulatedInput] = useState<string>('A1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Stop camera stream safely
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Start camera stream and frame scanning
  const startCamera = async () => {
    stopCamera();
    setCameraState('requesting');
    setErrorMessage('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Camera access is not supported by this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraState('active');
        scanFrameLoop();
      }
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setCameraState('denied');
      const msg = err instanceof Error ? err.message : 'Camera permission denied or camera unavailable in this environment.';
      setErrorMessage(msg);
    }
  };

  // Continuously scan video frames using jsQR
  const scanFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        const spotId = extractSpotFromInput(code.data);
        if (spotId) {
          setIsProcessing(true);
          audioFeedback.playScanBeep();
          stopCamera();
          onSpotIdentified(spotId, 'qr_camera');
          return;
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrameLoop);
  };

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleSimulateScan = (spot: string) => {
    const identified = extractSpotFromInput(spot);
    if (identified) {
      audioFeedback.playScanBeep();
      stopCamera();
      onSpotIdentified(identified, 'qr_demo');
    } else {
      setErrorMessage(`Invalid spot identifier "${spot}". Use A1 through L30.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Scan Parking Spot QR</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Point your camera at the QR code located on your parking pillar or bay sign
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Viewfinder Window */}
          <div className="relative w-full aspect-square max-h-72 sm:max-h-80 mx-auto rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraState === 'active' ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Live Camera Reticle & Scan Laser */}
            {cameraState === 'active' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-blue-400/40 rounded-xl overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br" />
                  
                  {/* Moving laser beam */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-scan-laser" />
                </div>
              </div>
            )}

            {/* Fallback & State Overlays */}
            {cameraState === 'requesting' && (
              <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium">Accessing device camera...</p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Please allow camera permission in your browser if prompted.
                </p>
              </div>
            )}

            {(cameraState === 'denied' || cameraState === 'unsupported') && (
              <div className="flex flex-col items-center gap-3 text-slate-300 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Camera Access Inactive</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {errorMessage || 'Camera unavailable in this iframe sandbox. Use the instant simulation buttons below for demonstration!'}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Scanning Section (Classroom Priority) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Classroom Demo · Quick Spot Simulator
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Instant QR Test</span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Click any sample spot below to instantly simulate scanning its physical QR code:
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SAMPLE_DEMO_SPOTS.map((spot) => (
                <button
                  key={spot}
                  onClick={() => handleSimulateScan(spot)}
                  className={`py-2 px-1 text-center font-mono font-bold text-sm rounded-lg border transition-all ${
                    spot === 'A1'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-700 scale-105'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {spot}
                </button>
              ))}
            </div>

            {/* Custom Spot Input */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="text"
                value={simulatedInput}
                onChange={(e) => setSimulatedInput(e.target.value.toUpperCase())}
                placeholder="Or type spot (e.g. C14)"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
              <button
                onClick={() => handleSimulateScan(simulatedInput)}
                className="px-4 py-2 bg-slate-900 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Simulate Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {errorMessage && cameraState !== 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Format: Spot identifiers A1 through L30</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
