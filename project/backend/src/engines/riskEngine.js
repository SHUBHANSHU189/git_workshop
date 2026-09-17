/**
 * Overrun Risk Tagging Engine (Deterministic Heuristic)
 * 
 * Historical Planned vs. Actual Overrun Lookup Table by Task/Defect Type:
 * - Rail Crack / Deep Screening: 35% typical overrun -> 🔴 likely-overrun
 * - OHE Wire Replacement / Catenary repair: 25% overrun -> 🟡 tight
 * - Signal Point Machine Overhaul: 15% overrun -> 🟢 comfortable / 🟡 tight
 * - Routine Inspection / Lubrication: 5% overrun -> 🟢 comfortable
 */

export const OVERRUN_LOOKUP = {
  'Rail Crack Repair': { historicalOverrunPct: 35, varianceStdDevHours: 0.8 },
  'Track Relaying & Tamping': { historicalOverrunPct: 30, varianceStdDevHours: 0.6 },
  'Ballast Cleaning': { historicalOverrunPct: 25, varianceStdDevHours: 0.5 },
  'OHE Wire Tensioning': { historicalOverrunPct: 20, varianceStdDevHours: 0.4 },
  'Catenary Mast Repair': { historicalOverrunPct: 22, varianceStdDevHours: 0.5 },
  'Point Machine Replacement': { historicalOverrunPct: 15, varianceStdDevHours: 0.3 },
  'Signal Interlocking Test': { historicalOverrunPct: 12, varianceStdDevHours: 0.2 },
  'Axle Counter Calibration': { historicalOverrunPct: 8, varianceStdDevHours: 0.2 },
  'Routine Track Inspection': { historicalOverrunPct: 5, varianceStdDevHours: 0.1 }
};

export function evaluateBlockRisk(mergedTasks, availableWindowHours) {
  if (!mergedTasks || mergedTasks.length === 0) {
    return { riskTag: 'comfortable', maxOverrunRiskPct: 5, reason: 'Low complexity single task' };
  }

  // Find max risk across merged tasks
  let totalEstimatedDuration = 0;
  let maxOverrunPct = 0;
  let hasMultipleDepts = new Set(mergedTasks.map(t => t.department)).size > 1;

  mergedTasks.forEach(task => {
    totalEstimatedDuration = Math.max(totalEstimatedDuration, task.estimatedDurationHours);
    const lookup = OVERRUN_LOOKUP[task.defectType] || { historicalOverrunPct: 15, varianceStdDevHours: 0.3 };
    if (lookup.historicalOverrunPct > maxOverrunPct) {
      maxOverrunPct = lookup.historicalOverrunPct;
    }
  });

  // Multi-department coordination complexity penalty (+10% overrun probability)
  if (hasMultipleDepts) {
    maxOverrunPct += 10;
  }

  // Buffer check: remaining window time vs estimated duration
  const bufferMarginHours = availableWindowHours - totalEstimatedDuration;

  let riskTag = 'comfortable';
  let reason = 'Generous time window buffer & low historical variance';

  if (bufferMarginHours < 0.5 || maxOverrunPct >= 35) {
    riskTag = 'likely-overrun';
    reason = 'Tight corridor window margin (<30 mins) or high historical task overrun propensity (>35%)';
  } else if (bufferMarginHours < 1.0 || maxOverrunPct >= 20) {
    riskTag = 'tight';
    reason = 'Moderate buffer margin (<1hr) with multi-department coordination requirements';
  }

  return {
    riskTag,
    maxOverrunRiskPct: maxOverrunPct,
    bufferMarginHours: Math.max(0, bufferMarginHours),
    reason
  };
}
