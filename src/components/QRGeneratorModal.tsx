import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  X, 
  Download, 
  ExternalLink, 
  Printer, 
  Check, 
  Sparkles, 
  Copy,
  ArrowRight
} from 'lucide-react';
import { generateQRCodeDataUrl, generateSpotUrl } from '../utils/qrUtils';
import { SAMPLE_DEMO_SPOTS, isValidSpotId, normalizeSpotId } from '../utils/parkingData';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestSpot: (spotId: string) => void;
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  isOpen,
  onClose,
  onTestSpot,
}) => {
  const [selectedSpot, setSelectedSpot] = useState<string>('A1');
  const [customInput, setCustomInput] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isSignMode, setIsSignMode] = useState<boolean>(false);

  // Generate QR code whenever selectedSpot changes
  useEffect(() => {
    if (!isOpen) return;

    const spotId = normalizeSpotId(selectedSpot) || 'A1';
    const url = generateSpotUrl(spotId);
    setTargetUrl(url);

    generateQRCodeDataUrl(url)
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
      });
  }, [selectedSpot, isOpen]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput) return;
    const clean = normalizeSpotId(customInput);
    if (clean) {
      setSelectedSpot(clean);
      setCustomInput('');
    }
  };

  const handleCopyUrl = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `unipark-spot-${selectedSpot}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Parking Spot QR Code Generator
              </h2>
              <p className="text-xs text-slate-500">
                Generate real scannable QR codes for parking pillars and bays
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Spot Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Sample Parking Spot:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {['A1', 'A2', 'B1', 'C5', 'D10', 'G15', 'L30'].map((spot) => (
                <button
                  key={spot}
                  onClick={() => setSelectedSpot(spot)}
                  className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                    selectedSpot === spot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {spot}
                </button>
              ))}

              {/* Custom Spot Input */}
              <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 ml-auto">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
                  placeholder="Custom spot (e.g. E8)..."
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                  maxLength={5}
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Set
                </button>
              </form>
            </div>
          </div>

          {/* Toggle between standard view and Pillar Sign mockup */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-slate-500">
              Generated for Spot <strong>{selectedSpot}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSignMode(!isSignMode)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isSignMode ? 'Show QR Only' : 'Preview as Pillar Sign'}</span>
              </button>
            </div>
          </div>

          {/* The QR Display / Pillar Sign Card */}
          {isSignMode ? (
            /* Printable Parking Pillar Sign Preview */
            <div className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-slate-800 shadow-xl flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
              <div className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-md">
                CAMPUS PARKING FACILITY
              </div>
              <div className="space-y-0.5">
                <div className="text-xs uppercase font-semibold text-slate-400">
                  RESERVED BAY IDENTIFIER
                </div>
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  SPOT {selectedSpot}
                </div>
              </div>

              {qrDataUrl && (
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for spot ${selectedSpot}`}
                    className="w-48 h-48 object-contain"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  SCAN WITH PHONE CAMERA
                </div>
                <div className="text-[11px] text-slate-400 max-w-xs">
                  Automatically remembers your vehicle parking location for 14 hours. No app download needed.
                </div>
              </div>
            </div>
          ) : (
            /* Standard QR Code Showcase */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for Spot ${selectedSpot}`}
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                    Generating...
                  </div>
                )}
              </div>

              <div className="space-y-3 text-left w-full">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Scannable Target URL
                  </span>
                  <div className="mt-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 break-all select-all flex items-center justify-between gap-2">
                    <span className="truncate">{targetUrl}</span>
                    <button
                      onClick={handleCopyUrl}
                      className="p-1 hover:text-blue-600 text-slate-400 shrink-0"
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <p>
                    <strong>How to test with your smartphone:</strong>
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                    <li>Point your phone camera at the QR code above.</li>
                    <li>Open the detected link in your browser.</li>
                    <li>UniPark will immediately identify Spot <strong>{selectedSpot}</strong>!</li>
                  </ol>
                </div>

                {/* Direct Test button */}
                <button
                  onClick={() => {
                    onClose();
                    onTestSpot(selectedSpot);
                  }}
                  className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test Spot {selectedSpot} in UniPark Directly</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Sign</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
