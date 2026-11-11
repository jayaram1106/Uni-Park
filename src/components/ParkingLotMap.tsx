import React, { useState, useMemo } from 'react';
import { Search, Info, MapPin, Zap, ArrowRight, Check, Compass } from 'lucide-react';
import { PARKING_ROWS, getSpotDetails } from '../utils/parkingData';
import { ParkingSpot } from '../types/parking';

interface ParkingLotMapProps {
  onSelectSpot: (spot: ParkingSpot) => void;
  selectedSpotId?: string;
  onBackToHome: () => void;
}

export const ParkingLotMap: React.FC<ParkingLotMapProps> = ({
  onSelectSpot,
  selectedSpotId: initialSelectedId,
  onBackToHome,
}) => {
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(initialSelectedId || null);

  const selectedSpotDetails = useMemo(() => {
    return selectedSpotId ? getSpotDetails(selectedSpotId) : null;
  }, [selectedSpotId]);

  // Filter rows by level
  const displayedRows = useMemo(() => {
    return PARKING_ROWS.filter(row => {
      if (activeLevelFilter === 'all') return true;
      if (activeLevelFilter === 'G') return row.row <= 'C';
      if (activeLevelFilter === '1') return row.row >= 'D' && row.row <= 'F';
      if (activeLevelFilter === '2') return row.row >= 'G' && row.row <= 'I';
      if (activeLevelFilter === '3') return row.row >= 'J';
      return true;
    });
  }, [activeLevelFilter]);

  const handleSpotClick = (spotId: string) => {
    setSelectedSpotId(spotId);
  };

  const handleConfirmSelection = () => {
    if (selectedSpotDetails) {
      onSelectSpot(selectedSpotDetails);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const clean = searchQuery.trim().toUpperCase();
    const details = getSpotDetails(clean);
    if (details) {
      setSelectedSpotId(details.id);
      // Automatically scroll to the row element
      const element = document.getElementById(`row-${details.row}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Interactive Parking Map</span>
            <span>·</span>
            <span>12 Rows · 360 Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Parking Spot
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tap the spot where your vehicle is currently parked to save its exact location.
          </p>
        </div>

        {/* Back and Search */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              placeholder="Jump to spot (e.g. A1)..."
              className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-56"
              maxLength={4}
            />
          </form>
          <button
            onClick={onBackToHome}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Scope Disclaimer Callout */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Facility Layout Guide:</strong> This is a visual map of the parking bays for memory and navigation. UniPark does not monitor live space occupancy or vacancy sensors.
        </p>
      </div>

      {/* Level Filter Tabs & Row Jump Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Level Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Levels (A–L)' },
            { id: 'G', label: 'Level G (Rows A–C)' },
            { id: '1', label: 'Level 1 (Rows D–F)' },
            { id: '2', label: 'Level 2 (Rows G–I)' },
            { id: '3', label: 'Level 3 (Rows J–L)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLevelFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeLevelFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Row Quick Jump */}
        <div className="flex items-center gap-1 text-xs text-slate-500 overflow-x-auto pb-1 sm:pb-0">
          <span className="hidden lg:inline text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
            Jump:
          </span>
          {PARKING_ROWS.map((r) => (
            <a
              key={r.row}
              href={`#row-${r.row}`}
              className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
            >
              {r.row}
            </a>
          ))}
        </div>
      </div>

      {/* Map Rows Visual Grid */}
      <div className="space-y-6">
        {displayedRows.map((row) => (
          <div
            key={row.row}
            id={`row-${row.row}`}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            {/* Row Header Banner */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold font-mono text-base shadow-sm"
                  style={{ backgroundColor: row.color }}
                >
                  {row.row}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Row {row.row}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs font-normal text-slate-600">{row.zone}</span>
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {row.level} · 30 Parking Bays
                  </div>
                </div>
              </div>

              {/* Wayfinding Indicators */}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="hidden sm:inline">Pillars {row.row}-1 to {row.row}-6</span>
                <span className="text-slate-300 hidden sm:inline">·</span>
                <span className="font-mono text-slate-700">Driving Lane {row.row}</span>
              </div>
            </div>

            {/* Driving Aisle Markings */}
            <div className="px-4 py-1.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500 tracking-wider">
              <span>◄ VEHICLE DRIVING AISLE · SPEED LIMIT 10 KM/H ◄</span>
              <span className="hidden sm:inline">CENTRAL ELEVATOR ACCESS</span>
            </div>

            {/* Parking Stalls Grid (30 bays per row) */}
            <div className="p-4 overflow-x-auto">
              <div className="grid grid-flow-col grid-rows-2 auto-cols-[minmax(64px,1fr)] sm:auto-cols-[minmax(72px,1fr)] gap-2 min-w-[700px]">
                {Array.from({ length: row.spotCount }, (_, i) => {
                  const spotNum = i + 1;
                  const spotId = `${row.row}${spotNum}`;
                  const isSelected = selectedSpotId === spotId;
                  const isAccessible = row.accessibleSpots.includes(spotNum);
                  const isEv = row.evSpots.includes(spotNum);

                  return (
                    <button
                      key={spotId}
                      onClick={() => handleSpotClick(spotId)}
                      className={`relative flex flex-col items-center justify-between p-2 rounded-lg border-2 transition-all group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-500/30 scale-105 z-10'
                          : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50'
                      }`}
                      style={{ height: '76px' }}
                    >
                      {/* Top tag or icon */}
                      <div className="w-full flex items-center justify-between text-[10px]">
                        {isAccessible && (
                          <span className="text-blue-600 font-bold" title="Accessible Parking">
                            ♿
                          </span>
                        )}
                        {isEv && (
                          <span title="EV Charging">
                            <Zap className="w-3 h-3 text-emerald-600" />
                          </span>
                        )}
                        {!isAccessible && !isEv && <span />}

                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Main Spot Identifier */}
                      <span
                        className={`font-mono font-bold text-sm sm:text-base ${
                          isSelected ? 'text-blue-700 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {spotId}
                      </span>

                      {/* Bottom Parking Stall Line Marking */}
                      <div
                        className={`w-full h-1 rounded-full ${
                          isSelected ? 'bg-blue-600' : 'bg-slate-300 group-hover:bg-blue-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Selection Action Bar */}
      {selectedSpotDetails && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-extrabold text-xl shadow-inner">
              {selectedSpotDetails.id}
            </div>
            <div>
              <div className="text-xs text-slate-400">Selected Parking Space</div>
              <div className="text-sm font-semibold text-white">
                Row {selectedSpotDetails.row} · {selectedSpotDetails.nearestPillar}
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedSpotDetails.level}
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmSelection}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <span>Confirm Spot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
