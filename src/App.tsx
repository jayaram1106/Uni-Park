import React, { useState, useEffect, useCallback } from 'react';
import { 
  QrCode, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

import { ParkingSpot, SavedParkingLocation, ViewState } from './types/parking';
import { getSavedLocation, saveLocation, clearSavedLocation } from './utils/storage';
import { getSpotDetails, SAMPLE_DEMO_SPOTS } from './utils/parkingData';
import { extractSpotFromInput } from './utils/qrUtils';

import { TopBar } from './components/TopBar';
import { EmptyState } from './components/EmptyState';
import { SavedLocationCard } from './components/SavedLocationCard';
import { ScannerModal } from './components/ScannerModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ParkingLotMap } from './components/ParkingLotMap';
import { QRGeneratorModal } from './components/QRGeneratorModal';
import { DemoController } from './components/DemoController';
import { HowItWorks } from './components/HowItWorks';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [savedLocation, setSavedLocation] = useState<SavedParkingLocation | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);

  // Spot pending confirmation
  const [pendingSpot, setPendingSpot] = useState<ParkingSpot | null>(null);
  const [pendingSource, setPendingSource] = useState<'qr_camera' | 'qr_demo' | 'manual_map' | 'url_parameter'>('qr_demo');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Notification banners
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Refresh saved location from storage
  const refreshStorage = useCallback(() => {
    const loc = getSavedLocation();
    setSavedLocation(loc);
  }, []);

  // Initial load: check LocalStorage and URL parameters (?spot=A1)
  useEffect(() => {
    refreshStorage();

    // Check if user arrived via QR code containing a URL parameter e.g. ?spot=A1
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      const rawParam = search || hash;

      if (rawParam && (rawParam.includes('spot=') || rawParam.includes('#'))) {
        const spotId = extractSpotFromInput(window.location.href);
        if (spotId) {
          const details = getSpotDetails(spotId);
          if (details) {
            setPendingSpot(details);
            setPendingSource('url_parameter');
            setIsConfirmOpen(true);
            showToast(`QR Code Detected: Spot ${details.id} identified from link!`, 'info');
          }
        }
      }
    }
  }, [refreshStorage]);

  // Handle spot identified via camera or demo simulator
  const handleSpotIdentified = (spotId: string, source: 'qr_camera' | 'qr_demo') => {
    const details = getSpotDetails(spotId);
    if (details) {
      setIsScannerOpen(false);
      setPendingSpot(details);
      setPendingSource(source);
      setIsConfirmOpen(true);
    } else {
      showToast(`Invalid spot identifier "${spotId}"`, 'error');
    }
  };

  // Handle spot selected from interactive parking map
  const handleMapSpotSelect = (spot: ParkingSpot) => {
    setPendingSpot(spot);
    setPendingSource('manual_map');
    setIsConfirmOpen(true);
    setCurrentView('home');
  };

  // Save spot location with 14-hour lifespan
  const handleSaveLocation = (
    data: Omit<SavedParkingLocation, 'savedAt' | 'expiresAt'>
  ) => {
    const saved = saveLocation(data);
    setSavedLocation(saved);
    setIsConfirmOpen(false);
    setPendingSpot(null);
    setCurrentView('home');
    showToast(`Parking location saved successfully! Spot ${saved.spotId} is remembered for 14 hours.`, 'success');
  };

  // Clear saved parking location
  const handleClearLocation = () => {
    clearSavedLocation();
    setSavedLocation(null);
    showToast('Saved parking spot has been cleared.', 'info');
  };

  // Handle 14-hour expiration event
  const handleExpiry = () => {
    clearSavedLocation();
    setSavedLocation(null);
    showToast('Your 14-hour parking memory has expired.', 'info');
  };

  // Quick spot trigger for demo
  const handleTriggerQuickSpot = (spotId: string, autoFillPlate?: string) => {
    const details = getSpotDetails(spotId);
    if (details) {
      setPendingSpot(details);
      setPendingSource('qr_demo');
      setIsConfirmOpen(true);
      setCurrentView('home');
      if (autoFillPlate) {
        showToast(`Demo ready: Spot ${spotId} detected. Confirm and save to test!`, 'info');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'scanner') {
            setIsScannerOpen(true);
          } else if (view === 'generator') {
            setIsGeneratorOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        hasSavedLocation={!!savedLocation}
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md animate-in slide-in-from-top duration-200">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'error'
                ? 'bg-red-900 text-white border-red-800'
                : 'bg-blue-900 text-white border-blue-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs sm:text-sm font-medium leading-relaxed">
              {toastMessage.text}
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'map' ? (
          <ParkingLotMap
            onSelectSpot={handleMapSpotSelect}
            selectedSpotId={savedLocation?.spotId}
            onBackToHome={() => setCurrentView('home')}
          />
        ) : (
          /* Home Dashboard */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
            {/* Hero Section */}
            <section className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Classroom Prototype · Smart Parking Memory</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
                Never forget where you parked.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Assign unique QR codes to parking spaces. Scan when you arrive, add your vehicle plate, and let UniPark remember your spot for 14 hours.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsScannerOpen(true)}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-sm transition-all flex items-center gap-2.5 group"
                >
                  <QrCode className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Scan Parking QR Code</span>
                </button>

                <button
                  onClick={() => setCurrentView('map')}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base rounded-xl transition-all flex items-center gap-2.5"
                >
                  <MapPin className="w-5 h-5 text-slate-500" />
                  <span>Browse 12-Row Map</span>
                </button>

                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2"
                >
                  <span>QR Sign Generator</span>
                </button>
              </div>
            </section>

            {/* Currently Saved Location Card OR Empty State */}
            <section className="max-w-3xl mx-auto">
              {savedLocation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Current Saved Parking Location
                    </span>
                    <button
                      onClick={() => setIsDemoOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Classroom Demo Controls</span>
                    </button>
                  </div>

                  <SavedLocationCard
                    location={savedLocation}
                    onClear={handleClearLocation}
                    onExpire={handleExpiry}
                    onUpdateLocation={(updated) => setSavedLocation(updated)}
                  />
                </div>
              ) : (
                <EmptyState
                  onScanQR={() => setIsScannerOpen(true)}
                  onManualSelect={() => setCurrentView('map')}
                  onQuickSpot={(spot) => handleTriggerQuickSpot(spot)}
                />
              )}
            </section>

            {/* How It Works & Architecture Guide */}
            <HowItWorks />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">UniPark</span>
            <span>·</span>
            <span>QR-Based Smart Parking Location Management</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsDemoOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              Classroom Demo Walkthrough
            </button>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Generate Pillar QRs
            </button>
            <span>LocalStorage Client-Side Prototype</span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSpotIdentified={handleSpotIdentified}
      />

      <ConfirmationModal
        spot={pendingSpot}
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingSpot(null);
        }}
        onSave={handleSaveLocation}
        source={pendingSource}
      />

      <QRGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onTestSpot={(spotId) => handleTriggerQuickSpot(spotId)}
      />

      <DemoController
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onTriggerSpot={(spotId, plate) => handleTriggerQuickSpot(spotId, plate)}
        onRefreshData={refreshStorage}
        savedLocation={savedLocation}
      />
    </div>
  );
}
