import { FeederLog } from '../types/substation';

export function formatDuration(seconds: number, language: 'hi' | 'en' = 'en'): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (language === 'hi') {
    if (hrs > 0) {
      return `${hrs} ???? ${mins} ???? ${secs} ?????`;
    }
    if (mins > 0) {
      return `${mins} ???? ${secs} ?????`;
    }
    return `${secs} ?????`;
  }

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatShortDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function calculateElapsedSeconds(isoString: string): number {
  try {
    const past = new Date(isoString).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((now - past) / 1000));
  } catch {
    return 0;
  }
}

export function exportLogsToCsv(logs: FeederLog[], filename = 'substation-arniya-feeder-logs.csv') {
  const headers = ['Log ID', 'Timestamp', 'Feeder Name', 'Feeder Hindi Name', 'Incomer', 'Previous Status', 'New Status', 'Duration in Previous State (s)', 'Duration Formatted', 'Operator', 'Reason/Remarks'];
  
  const rows = logs.map(log => [
    `"${log.id}"`,
    `"${formatDateTime(log.timestamp)}"`,
    `"${log.feederName}"`,
    `"${log.feederHindiName}"`,
    `"${log.incomerName}"`,
    `"${log.previousStatus}"`,
    `"${log.newStatus}"`,
    log.durationSecondsInPreviousState,
    `"${formatDuration(log.durationSecondsInPreviousState)}"`,
    `"${log.operatorName}"`,
    `"${log.reason || '-'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
