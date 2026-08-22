import React, { useState } from 'react';
import { useSubstation } from '../context/SubstationContext';
import { 
  FileText, 
  Download, 
  Search, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { formatDateTime, formatDuration, exportLogsToCsv } from '../utils/formatters';

export const LogBook: React.FC = () => {
  const { logs, language, clearLogs, feeders } = useSubstation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeeder, setSelectedFeeder] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.feederName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.feederHindiName.includes(searchTerm) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.operatorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFeeder = selectedFeeder === 'ALL' || log.feederId === selectedFeeder;
    const matchesStatus = selectedStatus === 'ALL' || log.newStatus === selectedStatus;

    return matchesSearch && matchesFeeder && matchesStatus;
  });

  const handleExport = () => {
    exportLogsToCsv(filteredLogs, `Substation-Arniya-Logs-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white font-tech flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>
              {language === 'hi'
                ? 'सबस्टेशन अरनिया - दैनिक फीडर लॉगबुक व घटनाक्रम'
                : 'Substation Arniya - Daily Feeder Event Logbook'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'फीडर चालू / बंद होने का सटीक समय, अवधि, ऑपरेटर का नाम और कारण'
              : 'Exact timestamps, durations, operator names, and reasons for every feeder event'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'Excel / CSV डाउनलोड' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्रिंट रिपोर्ट' : 'Print Log'}</span>
          </button>

          {logs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(language === 'hi' ? 'क्या आप सभी लॉग्स को हटाना चाहते हैं?' : 'Clear all event logs?')) {
                  clearLogs();
                }
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition"
              title="Clear Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'फीडर, ऑपरेटर या कारण खोजें...' : 'Search feeder, operator, reason...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedFeeder}
            onChange={(e) => setSelectedFeeder(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">{language === 'hi' ? 'सभी फीडर (All Feeders)' : 'All Feeders'}</option>
            {feeders.map(f => (
              <option key={f.id} value={f.id}>
                {language === 'hi' ? f.hindiName : f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">{language === 'hi' ? 'सभी स्थितियाँ (All Statuses)' : 'All Statuses'}</option>
            <option value="ON">{language === 'hi' ? 'चालू (ON / Energized)' : 'ON / Energized'}</option>
            <option value="OFF">{language === 'hi' ? 'बंद (OFF / Shutdown)' : 'OFF / Shutdown'}</option>
            <option value="TRIPPED">{language === 'hi' ? 'ट्रिप्ड (TRIPPED / Fault)' : 'TRIPPED / Fault'}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">{language === 'hi' ? 'समय (Timestamp)' : 'Timestamp'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'फीडर का नाम' : 'Feeder Name'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'इनकमर' : 'Incomer'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'कार्रवाई / स्थिति' : 'Action / Status'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'पिछली स्थिति में अवधि' : 'Prev Duration'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'ऑपरेटर (SSO)' : 'Operator'}</th>
              <th className="py-3 px-4">{language === 'hi' ? 'कारण / रिमार्क' : 'Reason / Note'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  {language === 'hi' ? 'कोई लॉग रिकॉर्ड नहीं मिला' : 'No log records found'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isNewOn = log.newStatus === 'ON';
                const isTripped = log.newStatus === 'TRIPPED';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono-scada text-amber-400 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {language === 'hi' ? log.feederHindiName : log.feederName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {log.incomerId === 'inc-1' ? 'Incoming 1 (33kV)' : 'Incoming 2 (33kV)'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-bold text-[11px] ${
                        isNewOn
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : isTripped
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {isNewOn ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : isTripped ? (
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>
                          {isNewOn 
                            ? (language === 'hi' ? 'चालू (ON)' : 'CHARGED (ON)') 
                            : isTripped
                            ? (language === 'hi' ? 'ट्रिप्ड (TRIPPED)' : 'TRIPPED')
                            : (language === 'hi' ? 'बंद (OFF)' : 'OPEN (OFF)')}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono-scada whitespace-nowrap">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDuration(log.durationSecondsInPreviousState, language)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {log.operatorName}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={log.reason}>
                      {log.reason || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};