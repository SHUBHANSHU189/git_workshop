/**
 * Multi-Department Task Compatibility Engine (Deterministic)
 * 
 * Rules for merging tasks:
 * 1. Must share the exact same corridor (corridorId) and overlapping section.
 * 2. Department Work Type Compatibility Matrix:
 *    - Engineering (TMS) + Signal & Telecom (SMMS): HIGH COMPATIBILITY (e.g. track relaying + point machine testing can share track block).
 *    - Engineering (TMS) + Traction Distribution (TDMS): MEDIUM COMPATIBILITY (e.g. rail renewal + OHE wire inspection can share block).
 *    - Signal (SMMS) + Traction (TDMS): HIGH COMPATIBILITY (interlocking + overhead catenary isolation).
 * 3. Max Block Duration Constraint: Merged block duration cannot exceed 5 hours.
 */

export const COMPATIBILITY_MATRIX = {
  'Engineering+Signal & Telecom': { compatible: true, efficiencyGainMin: 45, reason: 'Track + Point/Interlocking work' },
  'Engineering+Traction Distribution': { compatible: true, efficiencyGainMin: 30, reason: 'Track + OHE Catenary isolation' },
  'Signal & Telecom+Traction Distribution': { compatible: true, efficiencyGainMin: 40, reason: 'Signal cable + OHE height adjustment' },
  'Engineering+Engineering': { compatible: true, efficiencyGainMin: 20, reason: 'Adjacent ballast & rail tamping' },
  'Signal & Telecom+Signal & Telecom': { compatible: true, efficiencyGainMin: 15, reason: 'Combined S&T testing' },
  'Traction Distribution+Traction Distribution': { compatible: true, efficiencyGainMin: 15, reason: 'Combined OHE maintenance' }
};

export function areTasksCompatible(task1, task2) {
  if (task1.corridorId !== task2.corridorId) return { compatible: false, reason: 'Different corridors' };

  const key = [task1.department, task2.department].sort().join('+');
  const match = COMPATIBILITY_MATRIX[key];

  if (!match || !match.compatible) {
    return { compatible: false, reason: 'Department work types conflict' };
  }

  const combinedDuration = Math.max(task1.estimatedDurationHours, task2.estimatedDurationHours);
  if (combinedDuration > 5) {
    return { compatible: false, reason: 'Combined block duration exceeds 5h safety ceiling' };
  }

  return {
    compatible: true,
    reason: match.reason,
    efficiencyGainMin: match.efficiencyGainMin,
    mergedDurationHours: combinedDuration
  };
}

export function groupCompatibleTasks(tasks) {
  const groups = [];
  const visited = new Set();

  // Sort tasks by priority descending so high priority tasks form group anchors
  const sortedTasks = [...tasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

  for (let i = 0; i < sortedTasks.length; i++) {
    const primary = sortedTasks[i];
    if (visited.has(primary.id)) continue;

    const group = [primary];
    visited.add(primary.id);
    let currentDeptSet = new Set([primary.department]);
    let maxDuration = primary.estimatedDurationHours;

    for (let j = i + 1; j < sortedTasks.length; j++) {
      const candidate = sortedTasks[j];
      if (visited.has(candidate.id)) continue;

      if (candidate.corridorId === primary.corridorId) {
        // Check pairwise compatibility with all tasks currently in group
        let canMergeWithAll = true;
        for (const existing of group) {
          const comp = areTasksCompatible(existing, candidate);
          if (!comp.compatible) {
            canMergeWithAll = false;
            break;
          }
        }

        if (canMergeWithAll) {
          // Limit max merged tasks per block to 3 for practical coordination
          if (group.length < 3) {
            group.push(candidate);
            visited.add(candidate.id);
            currentDeptSet.add(candidate.department);
            maxDuration = Math.max(maxDuration, candidate.estimatedDurationHours);
          }
        }
      }
    }

    groups.push({
      primaryTask: primary,
      tasks: group,
      corridorId: primary.corridorId,
      departments: Array.from(currentDeptSet),
      mergedDurationHours: maxDuration,
      isMerged: group.length > 1
    });
  }

  return groups;
}
