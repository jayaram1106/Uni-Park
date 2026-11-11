import React from 'react';
import { X, Navigation, Footprints, ArrowRight, MapPin, Building, ShieldCheck } from 'lucide-react';
import { SavedParkingLocation } from '../types/parking';

interface DirectionsModalProps {
  location: SavedParkingLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  location,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !location) return null;

  const steps = [
    {
      title: 'Head to Central Elevator / Stairwell Core',
      description: 'Enter the campus parking facility through the Main Concourse Gate or Central Glass Pavilion.',
      badge: 'Step 1',
    },
    {
      title: `Proceed to ${location.level}`,
      description: `Take Elevator 1 or Stairwell B directly to ${location.level}. Exit toward the ${location.zone}.`,
      badge: 'Step 2',
    },
    {
      title: `Follow Row ${location.row} Driving Aisle`,
      description: `Locate the overhead blue signage for Row ${location.row}. Walk along the pedestrian-painted safety lane.`,
      badge: 'Step 3',
    },
    {
      title: `Find Spot ${location.spotId} at ${location.nearestPillar}`,
      description: `Your vehicle is parked in stall ${location.spotId}${
        location.vehiclePlate ? ` (Vehicle Plate: ${location.vehiclePlate})` : ''
      }${location.notes ? ` · Note: "${location.notes}"` : ''}.`,
      badge: 'Arrive',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Walking Directions to Spot {location.spotId}
              </h2>
              <p className="text-xs text-slate-500">
                {location.level} · {location.zone}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Recap Badge */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-xl">
                {location.spotId}
              </div>
              <div>
                <div className="text-xs text-slate-400">Target Bay</div>
                <div className="text-sm font-semibold text-white">
                  Row {location.row} · {location.nearestPillar}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-emerald-400 font-medium">
              {location.walkingTime}
            </div>
          </div>

          {/* Step by step route */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                  {idx + 1}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Facility emergency call boxes are positioned every 40 meters along all rows.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Directions
          </button>
        </div>
      </div>
    </div>
  );
};
