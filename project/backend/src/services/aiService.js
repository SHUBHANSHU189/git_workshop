import dotenv from 'dotenv';
dotenv.config();

/**
 * AI Service Layer - Calls Anthropic API (Claude) strictly for:
 * 1. Natural Language What-If Scenario Parsing
 * 2. Plain-English Executive Plan Summary Brief Generation
 * 
 * NOTE: The core scheduling, priority scoring, and compatibility logic remain 100% deterministic.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export async function parseWhatIfScenario(userPrompt, corridors) {
  if (!ANTHROPIC_API_KEY) {
    console.log('[AI Service] No Anthropic API Key provided, returning fallback mock parse response.');
    return fallbackWhatIfParse(userPrompt, corridors);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: `You are an AI assistant for Indian Railways block planning. Your task is to extract structured scheduling constraints from natural language inputs.
Return ONLY a JSON object with the following schema:
{
  "department": "Engineering" | "Traction Distribution" | "Signal & Telecom" | null,
  "corridorId": string | null,
  "date": "YYYY-MM-DD" | null,
  "unavailabilityType": string,
  "explanation": string
}
Corridors available: ${JSON.stringify(corridors.map(c => ({ id: c.id, name: c.name })))}
No markdown, no conversation, output valid JSON only.`,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      const parsedJson = JSON.parse(data.content[0].text.trim());
      return parsedJson;
    }
    return fallbackWhatIfParse(userPrompt, corridors);
  } catch (err) {
    console.error('[AI Service] Error calling Anthropic API for What-If parse:', err.message);
    return fallbackWhatIfParse(userPrompt, corridors);
  }
}

export async function generatePlanSummary(scheduleData, horizon = 'weekly') {
  if (!ANTHROPIC_API_KEY) {
    console.log('[AI Service] No Anthropic API Key provided, returning fallback mock summary.');
    return fallbackPlanSummary(scheduleData, horizon);
  }

  try {
    const promptSummary = `
Plan Horizon: ${horizon}
Total Scheduled Blocks: ${scheduleData.metrics.scheduledBlocksCount}
Tasks Combined into Blocks: ${scheduleData.metrics.totalTasksScheduled}
Blocks Avoided via Merging: ${scheduleData.metrics.blocksAvoided}
Coordination Impact Score: ${scheduleData.metrics.coordinationImpactScore}
Risk breakdown: ${JSON.stringify(scheduleData.scheduledBlocks.map(b => ({ id: b.id, risk: b.riskTag, depts: b.departments, corridor: b.corridorId })))}
    `;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: `You are an executive railway operations analyst. Generate a concise 3-4 sentence plain-English briefing for senior Indian Railways officials summarizing the generated maintenance block schedule. Focus on total tasks combined, blocks saved, safety-critical items prioritized, and risk profile. Keep tone formal and official.`,
        messages: [{ role: 'user', content: promptSummary }]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim();
    }
    return fallbackPlanSummary(scheduleData, horizon);
  } catch (err) {
    console.error('[AI Service] Error calling Anthropic API for Plan Summary:', err.message);
    return fallbackPlanSummary(scheduleData, horizon);
  }
}

// Fallback logic when API key is omitted
function fallbackWhatIfParse(userPrompt, corridors) {
  const promptLower = userPrompt.toLowerCase();
  
  let dept = null;
  if (promptLower.includes('track') || promptLower.includes('engineering') || promptLower.includes('tms')) dept = 'Engineering';
  else if (promptLower.includes('signal') || promptLower.includes('telecom') || promptLower.includes('smms')) dept = 'Signal & Telecom';
  else if (promptLower.includes('traction') || promptLower.includes('ohe') || promptLower.includes('tdms')) dept = 'Traction Distribution';

  let matchedCorridor = corridors[0] ? corridors[0].id : 'CORR-DEL-CNB';
  for (const c of corridors) {
    const cName = c.name.toLowerCase();
    const cId = c.id.toLowerCase();
    const fromName = c.section_from ? c.section_from.toLowerCase() : '';
    const toName = c.section_to ? c.section_to.toLowerCase() : '';

    if (
      promptLower.includes(cName) || 
      promptLower.includes(cId) ||
      (fromName && promptLower.includes(fromName.split(' ')[0])) ||
      (toName && promptLower.includes(toName.split(' ')[0])) ||
      (cName.includes('meerut') && promptLower.includes('meerut')) ||
      (cName.includes('kanpur') && promptLower.includes('kanpur')) ||
      (cName.includes('surat') && promptLower.includes('surat')) ||
      (cName.includes('kharagpur') && promptLower.includes('kharagpur'))
    ) {
      matchedCorridor = c.id;
      break;
    }
  }

  const dateStr = new Date().toISOString().split('T')[0];

  return {
    department: dept,
    corridorId: matchedCorridor,
    date: dateStr,
    unavailabilityType: 'Department Resource Maintenance Hold',
    explanation: `Parsed requirement: ${dept || 'Maintenance teams'} resource constraint applied to corridor ${matchedCorridor} on ${dateStr}.`
  };
}

function fallbackPlanSummary(scheduleData, horizon) {
  const metrics = scheduleData.metrics;
  const blocks = scheduleData.scheduledBlocks || [];
  const comfortable = blocks.filter(b => b.riskTag === 'comfortable').length;
  const tight = blocks.filter(b => b.riskTag === 'tight').length;
  const overrun = blocks.filter(b => b.riskTag === 'likely-overrun').length;

  return `This ${horizon} maintenance schedule successfully merges ${metrics.totalTasksScheduled} pending tasks into ${metrics.scheduledBlocksCount} coordinated multi-department blocks across key corridors, avoiding ${metrics.blocksAvoided} unnecessary track possessions. Safety-critical overdue items on high-density lines are prioritized during early-morning low-traffic availability windows. The overall risk profile stands at ${comfortable} comfortable, ${tight} tight, and ${overrun} likely-overrun blocks, delivering an estimated ${metrics.totalTrainDelayMinutesSaved} train-delay-minutes saved.`;
}
