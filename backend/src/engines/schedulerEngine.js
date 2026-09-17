import { groupCompatibleTasks } from './compatibilityEngine.js';
import { evaluateBlockRisk } from './riskEngine.js';
import { calculatePriorityScore } from './priorityEngine.js';

/**
 * Constraint-Aware Scheduler (Deterministic Rule-Based Engine)
 * 
 * Hard Constraints:
 * 1. No train timetable conflict (must fall strictly within an available window).
 * 2. No goods train forecast conflict (goodsTrainForecastConflict must be 0/false).
 * 3. Corridor availability window respected (startHour >= window.startHour, endHour <= window.endHour).
 * 4. Max block duration <= window length.
 * 
 * Soft Objectives:
 * 1. Minimize total number of scheduled blocks by merging compatible tasks across departments.
 * 2. Schedule critical/overdue tasks first in low-density traffic windows.
 */

export function generateSchedule({ tasks, availabilityWindows, corridors, customConstraints = [] }) {
  // 1. Calculate Priority Scores for all pending tasks
  const scoredTasks = tasks.map(t => {
    const corridorId = t.corridor_id || t.corridorId;
    const corridor = corridors.find(c => c.id === corridorId);
    let avgTraffic = 15;
    if (corridor && corridor.daily_traffic_json) {
      const traffic = typeof corridor.daily_traffic_json === 'string' 
        ? JSON.parse(corridor.daily_traffic_json) 
        : corridor.daily_traffic_json;
      avgTraffic = traffic.reduce((a, b) => a + b, 0) / 24;
    }

    const { score, breakdown } = calculatePriorityScore(t, avgTraffic);
    return {
      ...t,
      id: t.id,
      department: t.department,
      corridorId: corridorId,
      sectionName: t.section_name || t.sectionName,
      description: t.description,
      defectType: t.defect_type || t.defectType,
      estimatedDurationHours: Number(t.estimated_duration_hours || t.estimatedDurationHours || 2),
      safetyCriticality: Number(t.safety_criticality || t.safetyCriticality || 3),
      isOverdue: Boolean(t.is_overdue !== undefined ? t.is_overdue : t.isOverdue),
      dueDate: t.due_date || t.dueDate,
      status: t.status || 'pending',
      priorityScore: score,
      priorityBreakdown: breakdown
    };
  });

  // Filter only pending tasks for scheduling
  const pendingTasks = scoredTasks.filter(t => (t.status || 'pending').toLowerCase() === 'pending');

  // Check custom constraints (e.g. from What-If NLP parser)
  const activePendingTasks = pendingTasks.filter(t => {
    const isBlocked = customConstraints.some(c => 
      (c.department ? c.department.toLowerCase() === t.department.toLowerCase() : true) &&
      (c.corridorId ? c.corridorId === t.corridorId : true)
    );
    return !isBlocked;
  });

  // Group tasks into compatible bundles
  const taskBundles = groupCompatibleTasks(activePendingTasks);

  const scheduledBlocks = [];
  const assignedTaskIds = new Set();
  const usedWindowKeys = new Set(); // Prevent assigning multiple blocks to exact same window slot

  // Process available windows
  const validWindows = [...availabilityWindows].filter(w => {
    const isAvail = Number(w.available_from_timetable !== undefined ? w.available_from_timetable : w.availableFromTimetable) === 1;
    const noGoodsConflict = Number(w.goods_train_forecast_conflict !== undefined ? w.goods_train_forecast_conflict : w.goodsTrainForecastConflict) === 0;

    const winCorridorId = w.corridor_id || w.corridorId;
    const winDate = w.date;

    const isWindowConstrained = customConstraints.some(c => 
      (c.corridorId ? c.corridorId === winCorridorId : true) &&
      (c.date ? c.date === winDate : true)
    );

    return isAvail && noGoodsConflict && !isWindowConstrained;
  });

  let blockCounter = 1;

  for (const bundle of taskBundles) {
    const unassignedTasks = bundle.tasks.filter(t => !assignedTaskIds.has(t.id));
    if (unassignedTasks.length === 0) continue;

    const bundleCorridorId = bundle.corridorId;
    const requiredHours = bundle.mergedDurationHours;

    const matchingWindows = validWindows.filter(w => (w.corridor_id || w.corridorId) === bundleCorridorId);

    for (const win of matchingWindows) {
      const winStart = Number(win.start_hour !== undefined ? win.start_hour : win.startHour);
      const winEnd = Number(win.end_hour !== undefined ? win.end_hour : win.endHour);
      const windowKey = `${win.corridor_id || win.corridorId}_${win.date}_${winStart}_${winEnd}`;

      if (usedWindowKeys.has(windowKey)) continue;

      const windowSpan = winEnd - winStart;
      if (windowSpan >= requiredHours) {
        const startHour = winStart;
        const endHour = Math.min(winEnd, startHour + Math.ceil(requiredHours));

        const mergedTaskIds = unassignedTasks.map(t => t.id);
        const depts = Array.from(new Set(unassignedTasks.map(t => t.department)));

        const risk = evaluateBlockRisk(unassignedTasks, windowSpan);

        scheduledBlocks.push({
          id: `BLK-${String(blockCounter++).padStart(3, '0')}`,
          corridorId: bundleCorridorId,
          date: win.date,
          startHour,
          endHour,
          mergedTaskIds,
          departments: depts,
          riskTag: risk.riskTag,
          riskReason: risk.reason,
          status: 'recommended',
          tasks: unassignedTasks
        });

        unassignedTasks.forEach(t => assignedTaskIds.add(t.id));
        usedWindowKeys.add(windowKey);
        break;
      }
    }
  }

  // Coordination Impact Metrics
  const totalTasksScheduled = assignedTaskIds.size;
  const blocksCreated = scheduledBlocks.length;
  const blocksAvoided = Math.max(0, totalTasksScheduled - blocksCreated);
  const avgDelayMinutesSavedPerBlock = 45;
  const totalTrainDelayMinutesSaved = blocksAvoided * avgDelayMinutesSavedPerBlock;

  const coordinationImpactScore = blocksAvoided * avgDelayMinutesSavedPerBlock;

  return {
    scheduledBlocks,
    pendingUnassignedTasks: scoredTasks.filter(t => !assignedTaskIds.has(t.id)),
    allScoredTasks: scoredTasks,
    metrics: {
      totalTasksScheduled,
      scheduledBlocksCount: blocksCreated,
      blocksAvoided,
      avgDelayMinutesSavedPerBlock,
      totalTrainDelayMinutesSaved,
      coordinationImpactScore
    }
  };
}
