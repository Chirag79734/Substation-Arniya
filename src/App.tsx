import React from 'react';
import { SubstationProvider, useSubstation } from './context/SubstationContext';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { IncomerSection } from './components/IncomerSection';
import { SingleLineDiagram } from './components/SingleLineDiagram';
import { AnalyticsView } from './components/AnalyticsView';
import { LogBook } from './components/LogBook';
import { Zap, Radio } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeTab } = useSubstation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <OverviewCards />
            <div className="space-y-6">
              <IncomerSection incomerId="inc-1" />
              <IncomerSection incomerId="inc-2" />
            </div>
          </div>
        )}

        {/* Incoming 1 Tab */}
        {activeTab === 'incomer1' && (
          <div>
            <IncomerSection incomerId="inc-1" />
          </div>
        )}

        {/* Incoming 2 Tab */}
        {activeTab === 'incomer2' && (
          <div>
            <IncomerSection incomerId="inc-2" />
          </div>
        )}

        {/* Single Line Diagram Tab */}
        {activeTab === 'diagram' && (
          <div>
            <SingleLineDiagram />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AnalyticsView />
          </div>
        )}

        {/* LogBook Tab */}
        {activeTab === 'logs' && (
          <div>
            <LogBook />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-400">
              33/11 KV Substation Arniya SCADA Automation System
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>RTU Telemetry Online</span>
            </span>
            <span className="text-slate-600">�</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <SubstationProvider>
      <DashboardContent />
    </SubstationProvider>
  );
}

export default App;
