import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Car, 
  QrCode, 
  ArrowRight,
  BookOpen,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { clearSavedLocation, simulateTimeRemaining, saveLocation } from '../utils/storage';
import { getSpotDetails } from '../utils/parkingData';
import { SavedParkingLocation } from '../types/parking';

interface DemoControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSpot: (spotId: string, autoFillPlate?: string) => void;
  onRefreshData: () => void;
  savedLocation: SavedParkingLocation | null;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  isOpen,
  onClose,
  onTriggerSpot,
  onRefreshData,
  savedLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'script'>('walkthrough');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastActionMessage, setLastActionMessage] = useState<string>('');

  if (!isOpen) return null;

  const showActionFeedback = (msg: string) => {
    setLastActionMessage(msg);
    setTimeout(() => setLastActionMessage(''), 3000);
  };

  const handleStep1Reset = () => {
    clearSavedLocation();
    onRefreshData();
    setCurrentStep(2);
    showActionFeedback('State reset: Storage cleared, ready for scan demonstration');
  };

  const handleStep2ScanA1 = () => {
    onTriggerSpot('A1', 'UNI-2026');
    setCurrentStep(3);
    showActionFeedback('Simulated QR scan of Spot A1 on Pillar A-1');
  };

  const handleStep3SaveDirectly = () => {
    const details = getSpotDetails('A1');
    if (details) {
      saveLocation({
        spotId: 'A1',
        row: 'A',
        number: 1,
        level: details.level,
        zone: details.zone,
        nearestPillar: details.nearestPillar,
        walkingTime: details.walkingTime,
        vehiclePlate: 'UNI-2026',
        notes: 'East entrance beside Pillar A-1',
        source: 'qr_demo',
      });
      onRefreshData();
      setCurrentStep(4);
      showActionFeedback('Saved Spot A1 with Vehicle Plate UNI-2026');
    }
  };

  const handleStep4SimulateReload = () => {
    onRefreshData();
    showActionFeedback('LocalStorage verified! Data retained across browser reload');
    setCurrentStep(5);
  };

  const handleStep5FastForwardExpiry = () => {
    simulateTimeRemaining(2); // 2 minutes remaining
    onRefreshData();
    showActionFeedback('Countdown set to 2 minutes left to demonstrate expiration logic');
    setCurrentStep(6);
  };

  const handleStep6TriggerExpiry = () => {
    simulateTimeRemaining(0.05); // expired
    onRefreshData();
    showActionFeedback('14-Hour lifespan elapsed: Spot automatically expired');
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Classroom Presentation Companion</span>
              </h2>
              <p className="text-xs text-slate-300">
                1-click demonstration controls and presenter speaking notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'walkthrough'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Interactive Walkthrough (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'script'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Presenter Speaking Points
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {lastActionMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lastActionMessage}</span>
            </div>
          )}

          {activeTab === 'walkthrough' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                Follow these sequence steps during your live presentation to prove how UniPark identifies, saves, and remembers parking spaces:
              </div>

              {/* Step Sequence Cards */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStep === 1 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Start with Clean State
                      </h4>
                    </div>
                    <button
                      onClick={handleStep1Reset}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset State</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-8.5">
                    Clears any previously saved parking location and displays the empty state.
                  </p>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStep === 2 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                        2
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Simulate Scanning Spot A1
                      </h4>
                    </div>
                    <button
                      onClick={handleStep2ScanA1}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan Spot A1</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-8.5">
                    Demonstrates instant QR recognition. Opens the confirmation card with A1 identified.
                  </p>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStep === 3 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                        3
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Save Spot A1 with Vehicle Number
                      </h4>
                    </div>
                    <button
                      onClick={handleStep3SaveDirectly}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Quick Save A1</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-8.5">
                    Saves Spot A1 with plate "UNI-2026" and starts the 14-hour countdown.
                  </p>
                </div>

                {/* Step 4 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStep === 4 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                        4
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Prove LocalStorage Persistence
                      </h4>
                    </div>
                    <button
                      onClick={handleStep4SimulateReload}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Test Persistence</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-8.5">
                    Reads directly from localStorage to demonstrate that the data survives tab closures.
                  </p>
                </div>

                {/* Step 5 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  currentStep === 5 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                        5
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        Demonstrate 14-Hour Expiry Logic
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleStep5FastForwardExpiry}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium"
                      >
                        Fast-Forward (2m)
                      </button>
                      <button
                        onClick={handleStep6TriggerExpiry}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 rounded-lg text-xs font-medium"
                      >
                        Expire Now
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-8.5">
                    Simulates time elapsing to prove automatic cleanup without waiting 14 actual hours.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Presenter Script Tab */
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-100 rounded-lg space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block">
                  Presenter Speech Outline
                </span>
                <p className="text-slate-600">
                  You can use these key points while presenting UniPark to your professor and peers:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <strong className="text-blue-600">1. The Problem:</strong>
                  <p className="text-slate-600">
                    "Every day, thousands of drivers waste 10–20 minutes wandering campus and shopping mall parking structures trying to find where they parked."
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <strong className="text-blue-600">2. The Solution:</strong>
                  <p className="text-slate-600">
                    "UniPark turns every parking bay pillar into a smart landmark using lightweight QR codes. Drivers simply scan the sticker at their spot—no app store install, no account registration required."
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <strong className="text-blue-600">3. Zero-Server Privacy Architecture:</strong>
                  <p className="text-slate-600">
                    "Because parking data is personal, UniPark runs entirely client-side using browser LocalStorage. No centralized database tracks user movements."
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                  <strong className="text-blue-600">4. 14-Hour Expiry Lifecycle:</strong>
                  <p className="text-slate-600">
                    "Parking spots are temporal. After 14 hours—more than enough for a workday or full university class schedule—the session cleanly self-invalidates."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {savedLocation ? `Currently Saved: ${savedLocation.spotId}` : 'No spot currently saved'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-medium text-xs sm:text-sm rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Controller
          </button>
        </div>
      </div>
    </div>
  );
};
