import React from 'react';
import { QrCode, MapPin, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { SAMPLE_DEMO_SPOTS } from '../utils/parkingData';

interface EmptyStateProps {
  onScanQR: () => void;
  onManualSelect: () => void;
  onQuickSpot: (spot: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onScanQR,
  onManualSelect,
  onQuickSpot,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-10 text-center space-y-8">
      {/* Visual Icon Illustration */}
      <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
        <div className="w-full h-full rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg ring-8 ring-slate-100">
          <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
          <MapPin className="w-4 h-4" />
        </div>
      </div>

      {/* Main Copy */}
      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          No Parking Spot Saved
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Scan the QR code attached to your parking bay pillar, or pick your spot manually from the 12-row interactive lot map.
        </p>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        <button
          onClick={onScanQR}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          <QrCode className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>Scan Parking QR Code</span>
        </button>

        <button
          onClick={onManualSelect}
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <MapPin className="w-4 h-4 text-slate-500" />
          <span>Manual Spot Selection</span>
        </button>
      </div>

      {/* Quick Demo Simulator for Classroom Presentation */}
      <div className="pt-6 border-t border-slate-100 max-w-lg mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Demonstration Quick Spots (1-Click Test)</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {SAMPLE_DEMO_SPOTS.slice(0, 6).map((spot) => (
            <button
              key={spot}
              onClick={() => onQuickSpot(spot)}
              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-lg text-xs font-mono font-bold transition-colors"
            >
              Test Spot {spot}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Click any spot above to test the location identification and 14-hour save workflow instantly.
        </p>
      </div>
    </div>
  );
};
