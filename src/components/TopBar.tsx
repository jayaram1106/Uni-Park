import React from 'react';
import { QrCode, MapPin } from 'lucide-react';
import { ViewState } from '../types/parking';

interface TopBarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  hasSavedLocation: boolean;
  onOpenDemo: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  hasSavedLocation,
  onOpenDemo,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus-visible:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
            <span className="text-blue-400 font-mono text-base">P</span>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-none">
              Uni<span className="text-blue-600">Park</span>
            </span>
          </div>
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'home' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('map')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'map' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            Parking Map
          </button>
          <button
            onClick={() => onNavigate('generator')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
              currentView === 'generator' ? 'text-slate-900 font-semibold' : ''
            }`}
          >
            QR Sign Generator
          </button>
          <button
            onClick={onOpenDemo}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            Classroom Demo
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasSavedLocation ? (
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>View Saved Spot</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Spot</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
