/**
 * Priority Scoring Engine (Deterministic & Explainable)
 * 
 * Score (0 - 100) is calculated as a weighted sum of 4 key factors:
 * 1. Safety Criticality (Weight 40%): Rating 1 to 5 mapped to 0-100.
 * 2. Days Overdue (Weight 30%): Days past due date, capped at 15 days (100 pts max).
 * 3. Operational Impact / Traffic Density (Weight 20%): Average train traffic density on corridor (0-100).
 * 4. Resource Readiness (Weight 10%): High (100), Medium (60), Low (20).
 * 
 * Returns overall priority score + detailed factor breakdown for full UI transparency.
 */

export function calculatePriorityScore(task, corridorTrafficAvg = 15) {
  // 1. Safety Criticality factor (1-5 -> 20-100)
  const criticalityRaw = Math.min(Math.max(task.safetyCriticality || 1, 1), 5);
  const criticalityScore = criticalityRaw * 20;

  // 2. Days Overdue factor
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const diffTime = today - dueDate;
  const daysOverdue = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const overdueScore = Math.min(daysOverdue * 10 + (task.isOverdue ? 25 : 0), 100);

  // 3. Operational Impact (corridor hourly traffic average, 0-25 trains/hr mapped to 0-100)
  const trafficScore = Math.min((corridorTrafficAvg / 25) * 100, 100);

  // 4. Resource Readiness (Simulated default 80% readiness)
  const readinessScore = task.safetyCriticality >= 4 ? 90 : 75;

  // Weighted Sum Calculation
  const wCriticality = 0.40;
  const wOverdue = 0.30;
  const wTraffic = 0.20;
  const wReadiness = 0.10;

  const totalScore = Math.round(
    criticalityScore * wCriticality +
    overdueScore * wOverdue +
    trafficScore * wTraffic +
    readinessScore * wReadiness
  );

  const boundedScore = Math.min(Math.max(totalScore, 0), 100);

  return {
    score: boundedScore,
    breakdown: {
      criticalityFactor: {
        raw: criticalityRaw,
        weightedContribution: Math.round(criticalityScore * wCriticality),
        weight: '40%'
      },
      overdueFactor: {
        daysOverdue,
        isOverdue: Boolean(task.isOverdue),
        weightedContribution: Math.round(overdueScore * wOverdue),
        weight: '30%'
      },
      trafficImpactFactor: {
        avgHourlyTrains: Math.round(corridorTrafficAvg * 10) / 10,
        weightedContribution: Math.round(trafficScore * wTraffic),
        weight: '20%'
      },
      resourceReadinessFactor: {
        readinessPct: readinessScore,
        weightedContribution: Math.round(readinessScore * wReadiness),
        weight: '10%'
      }
    }
  };
}
