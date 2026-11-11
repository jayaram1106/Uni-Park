import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Clock, 
  Car, 
  Trash2, 
  Navigation, 
  Share2, 
  AlertTriangle, 
  Check, 
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { SavedParkingLocation } from '../types/parking';
import { calculateCountdown, CountdownState, simulateTimeRemaining } from '../utils/storage';
import { generateSpotUrl } from '../utils/qrUtils';
import { DirectionsModal } from './DirectionsModal';

interface SavedLocationCardProps {
  location: SavedParkingLocation;
  onClear: () => void;
  onExpire: () => void;
  onUpdateLocation: (updated: SavedParkingLocation) => void;
}

export const SavedLocationCard: React.FC<SavedLocationCardProps> = ({
  location,
  onClear,
  onExpire,
  onUpdateLocation,
}) => {
  const [countdown, setCountdown] = useState<CountdownState>(() =>
    calculateCountdown(location.savedAt, location.expiresAt)
  );
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1-second live countdown timer
  useEffect(() => {
    const tick = () => {
      const state = calculateCountdown(location.savedAt, location.expiresAt);
      setCountdown(state);

      if (state.isExpired) {
        onExpire();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [location.savedAt, location.expiresAt, onExpire]);

  const handleShare = async () => {
    const url = generateSpotUrl(location.spotId);
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
        return;
      } catch {
        // Fallback
      }
    }
  };

  const formattedSavedDate = new Date(location.savedAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formattedSavedDay = new Date(location.savedAt).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-blue-600/20 shadow-xl overflow-hidden transition-all">
        {/* Top Status Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Parking Session
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">14-Hour Memory Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Spot</span>
            </button>
          </div>
        </div>

        {/* Main Card Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Spot Identity */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center font-mono shadow-md ring-4 ring-blue-100 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  SPOT
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {location.spotId}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  <span>Row {location.row}</span>
                  <span className="text-slate-300">·</span>
                  <span>{location.level}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {location.zone}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{location.nearestPillar}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{location.walkingTime}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Plate Badge */}
            <div className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-center min-w-[200px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>Vehicle Registration</span>
              </div>
              <div className="font-mono text-lg font-bold text-slate-900 tracking-wide">
                {location.vehiclePlate || (
                  <span className="text-slate-400 font-sans font-normal text-xs">
                    Not specified
                  </span>
                )}
              </div>
              {location.notes && (
                <div className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200 flex items-start gap-1.5">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate max-w-[220px]">{location.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* 14-Hour Countdown Timer Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Remaining Parking Memory
                </span>
              </div>

              <div className="text-xs text-slate-500">
                Saved on <strong className="text-slate-700">{formattedSavedDay}</strong> at{' '}
                <strong className="text-slate-700">{formattedSavedDate}</strong>
              </div>
            </div>

            {/* Huge live countdown readout */}
            <div className="flex items-baseline justify-between">
              <div className="font-mono font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight tabular-nums">
                {countdown.formatted}
              </div>
              <div className="text-xs font-semibold text-blue-700 font-mono">
                {Math.round(countdown.progressPercent)}% time remaining
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${countdown.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Automatically expires in 14 hours for device privacy</span>
              <span className="font-mono">UniPark Auto-Clear</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowDirections(true)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>Get Walking Directions</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share Spot Link</span>
                </>
              )}
            </button>
          </div>

          {/* Demo fast-forward widget (crucial for class demo) */}
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span><strong>Classroom Demo Helper:</strong> Fast-forward timer to test expiry logic</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const updated = simulateTimeRemaining(2);
                  if (updated) onUpdateLocation(updated);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium transition-colors"
              >
                Set to 2 Min Left
              </button>
              <button
                onClick={() => {
                  const updated = simulateTimeRemaining(0.1);
                  if (updated) onUpdateLocation(updated);
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-slate-700 font-medium transition-colors"
              >
                Trigger Expiry Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before Clearing */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Clear Saved Parking Spot?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This will delete your saved spot <strong>{location.spotId}</strong> from local storage. You will need to scan or select your space again.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Saved
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClear();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Clear Spot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Directions Modal */}
      <DirectionsModal
        location={location}
        isOpen={showDirections}
        onClose={() => setShowDirections(false)}
      />
    </>
  );
};
