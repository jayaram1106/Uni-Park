import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Check, X, Car, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { ParkingSpot, SavedParkingLocation } from '../types/parking';
import { audioFeedback } from '../utils/audioFeedback';

interface ConfirmationModalProps {
  spot: ParkingSpot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SavedParkingLocation, 'savedAt' | 'expiresAt'>) => void;
  source: 'qr_camera' | 'qr_demo' | 'manual_map' | 'url_parameter';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  spot,
  isOpen,
  onClose,
  onSave,
  source,
}) => {
  const [vehiclePlate, setVehiclePlate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen || !spot) return null;

  const handleSave = () => {
    setIsSaving(true);
    audioFeedback.playSuccessChime();

    // Trigger subtle celebratory confetti for a satisfying save moment!
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563EB', '#10B981', '#0F172A', '#38BDF8'],
      });
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      onSave({
        spotId: spot.id,
        row: spot.row,
        number: spot.number,
        level: spot.level,
        zone: spot.zone,
        nearestPillar: spot.nearestPillar,
        walkingTime: spot.walkingTime,
        vehiclePlate: vehiclePlate.trim().toUpperCase() || undefined,
        notes: notes.trim() || undefined,
        source,
      });
      setIsSaving(false);
    }, 250);
  };

  const getSourceBadge = () => {
    switch (source) {
      case 'qr_camera':
        return 'Scanned via Live Camera';
      case 'qr_demo':
        return 'Simulated QR Scan';
      case 'url_parameter':
        return 'Identified via QR Link';
      case 'manual_map':
        return 'Selected on Parking Map';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Location Identified
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{getSourceBadge()}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Confirm Parking Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center"
            aria-label="Cancel confirmation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Identified Spot Highlight Box */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="space-y-1 z-10">
              <div className="text-xs text-slate-400 font-medium">Selected Parking Space</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                  {spot.id}
                </span>
                <span className="text-sm font-semibold text-blue-400">
                  Row {spot.row}
                </span>
              </div>
              <div className="text-xs text-slate-300 pt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{spot.level}</span>
                <span className="text-slate-500">·</span>
                <span>{spot.zone}</span>
              </div>
            </div>

            <div className="text-right z-10 border-l border-slate-800 pl-4">
              <div className="text-xs text-slate-400">Pillar Landmark</div>
              <div className="text-sm font-mono font-bold text-white mt-0.5">
                {spot.nearestPillar}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {spot.walkingTime}
              </div>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vehicle Registration Number</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">Optional</span>
              </label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. KA 01 AB 1234 or UNI-2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono uppercase text-slate-900 placeholder:text-slate-400 placeholder:normal-case focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={16}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Helps you confirm your car if multiple similar models are parked in the row.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Parking Notes or Landmark</span>
                <span className="text-[11px] font-normal text-slate-500">Optional</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Near East elevator entrance, yellow barrier"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={80}
              />
            </div>
          </div>

          {/* 14-Hour Storage Guarantee info banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl flex items-start gap-3">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-950 space-y-0.5">
              <span className="font-semibold block">Automatic 14-Hour Memory</span>
              <p className="text-blue-800 leading-relaxed">
                This spot will be saved to your browser's private local storage. It remains accessible even if you close the tab, and automatically expires after 14 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Change Spot
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Parking Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
