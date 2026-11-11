import React from 'react';
import { QrCode, Search, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Scan QR at Your Spot',
      description: 'Park your vehicle in any bay. Scan the unique QR code on the parking pillar or wall sign.',
      icon: QrCode,
      tag: 'No app download needed',
    },
    {
      step: '02',
      title: 'Automatic Identification',
      description: 'UniPark instantly detects your bay number (e.g. A1), level, row, and closest pedestrian landmark.',
      icon: Search,
      tag: 'Instant URL parameter',
    },
    {
      step: '03',
      title: 'Save with 14-Hour Memory',
      description: 'Add optional vehicle plate number and tap Save. The location is securely stored in your browser.',
      icon: ShieldCheck,
      tag: 'Browser LocalStorage',
    },
    {
      step: '04',
      title: 'Effortless Retrieval',
      description: 'When returning, open UniPark to view your saved spot, live countdown, and walking directions.',
      icon: MapPin,
      tag: 'Auto-expires after 14 hrs',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            System Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            How UniPark Works
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-sm">
          A frictionless four-step journey designed for campus parking lots, airports, and commercial decks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 relative overflow-hidden transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {item.step}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item.tag}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 14-Hour Storage Architecture Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <Clock className="w-4 h-4" />
            <span>Built-in Privacy & Zero Database Footprint</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Why 14-Hour Automatic Expiry?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            University class schedules, shopping trips, and workdays typically span under 14 hours. UniPark stores your parking data client-side inside browser LocalStorage. After 14 hours, the record self-invalidates and purges automatically, ensuring clutter-free devices without tracking your identity.
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shrink-0 w-full md:w-auto text-center md:text-left space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">
            Storage Engine
          </div>
          <div className="font-mono text-base font-bold text-emerald-400">
            Browser LocalStorage
          </div>
          <div className="text-xs text-slate-400">
            Persistent across page refreshes
          </div>
        </div>
      </div>
    </section>
  );
};
