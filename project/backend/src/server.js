import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import { initDb, runQuery, getQuery, allQuery } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { generateSchedule } from './engines/schedulerEngine.js';
import { calculatePriorityScore } from './engines/priorityEngine.js';
import { parseWhatIfScenario, generatePlanSummary } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'railblock_secret_key_2026';

app.use(cors());
app.use(express.json());

// Initialize database on startup
initDb().then(async () => {
  const userCount = await getQuery(`SELECT COUNT(*) as count FROM users`);
  if (!userCount || userCount.count === 0) {
    await seedDatabase();
  }
}).catch(console.error);

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// Auth Routes
// ----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  try {
    const existing = await getQuery(`SELECT * FROM users WHERE email = ?`, [email]);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userRole = role || 'Maintenance Planner';

    const result = await runQuery(
      `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
      [email, password_hash, name, userRole]
    );

    const token = jwt.sign(
      { id: result.lastID, email, name, role: userRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastID, email, name, role: userRole }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Data & Schedule API Endpoints
// ----------------------------------------------------

/**
 * GET /api/corridors
 * Integration marker: Replaces mock database corridors with live COA (Control Office Application) Corridor API
 */
app.get('/api/corridors', authenticateToken, async (req, res) => {
  try {
    const rows = await allQuery(`SELECT * FROM corridors`);
    const corridors = rows.map(r => ({
      id: r.id,
      name: r.name,
      sectionFrom: r.section_from,
      sectionTo: r.section_to,
      dailyTrainTrafficByHour: JSON.parse(r.daily_traffic_json)
    }));
    res.json(corridors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tasks
 * Integration marker: Replaces mock SQLite query with live TMS (Track Management System),
 * SMMS (Signal Maintenance Management System), and TDMS (Traction Distribution Management System) REST endpoints
 */
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await allQuery(`SELECT * FROM tasks`);
    const corridors = await allQuery(`SELECT * FROM corridors`);

    const scoredTasks = tasks.map(t => {
      const corr = corridors.find(c => c.id === t.corridor_id);
      let avgTraffic = 15;
      if (corr && corr.daily_traffic_json) {
        const traffic = JSON.parse(corr.daily_traffic_json);
        avgTraffic = traffic.reduce((a, b) => a + b, 0) / 24;
      }
      const { score, breakdown } = calculatePriorityScore(t, avgTraffic);
      return {
        id: t.id,
        department: t.department,
        corridorId: t.corridor_id,
        sectionName: t.section_name,
        description: t.description,
        defectType: t.defect_type,
        reportedDate: t.reported_date,
        dueDate: t.due_date,
        isOverdue: Boolean(t.is_overdue),
        safetyCriticality: t.safety_criticality,
        estimatedDurationHours: t.estimated_duration_hours,
        status: t.status,
        priorityScore: score,
        priorityBreakdown: breakdown
      };
    });

    res.json(scoredTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/schedule?horizon=weekly|monthly
 * Core constraint-aware deterministic scheduler execution
 */
app.get('/api/schedule', authenticateToken, async (req, res) => {
  try {
    const horizon = req.query.horizon || 'weekly';
    const tasks = await allQuery(`SELECT * FROM tasks`);
    const windows = await allQuery(`SELECT * FROM availability_windows`);
    const corridors = await allQuery(`SELECT * FROM corridors`);

    const schedule = generateSchedule({
      tasks,
      availabilityWindows: windows,
      corridors,
      horizon
    });

    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/what-if
 * Call AI Layer (Anthropic API) to parse natural language scenario, then re-run scheduler
 * to generate a cascading impact diff (before vs. after).
 */
app.post('/api/what-if', authenticateToken, async (req, res) => {
  const { prompt, horizon = 'weekly' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const corridors = await allQuery(`SELECT * FROM corridors`);
    const tasks = await allQuery(`SELECT * FROM tasks`);
    const windows = await allQuery(`SELECT * FROM availability_windows`);

    // 1. Run baseline schedule
    const baselineSchedule = generateSchedule({ tasks, availabilityWindows: windows, corridors, horizon });

    // 2. Call AI Layer (Claude API) to parse natural language prompt into structured constraint
    const parsedConstraint = await parseWhatIfScenario(prompt, corridors);

    // 3. Re-run deterministic scheduler with new custom constraint applied
    const newSchedule = generateSchedule({
      tasks,
      availabilityWindows: windows,
      corridors,
      horizon,
      customConstraints: [parsedConstraint]
    });

    // 4. Compute Cascading Impact Diff
    const baselineBlockIds = new Set(baselineSchedule.scheduledBlocks.map(b => b.id));
    const newBlockIds = new Set(newSchedule.scheduledBlocks.map(b => b.id));

    const shiftedBlocks = [];
    newSchedule.scheduledBlocks.forEach(newB => {
      const oldB = baselineSchedule.scheduledBlocks.find(b => b.corridorId === newB.corridorId && b.mergedTaskIds[0] === newB.mergedTaskIds[0]);
      if (oldB && (oldB.date !== newB.date || oldB.startHour !== newB.startHour)) {
        shiftedBlocks.push({
          blockId: newB.id,
          corridorId: newB.corridorId,
          oldTime: `${oldB.date} ${String(oldB.startHour).padStart(2, '0')}:00 - ${String(oldB.endHour).padStart(2, '0')}:00`,
          newTime: `${newB.date} ${String(newB.startHour).padStart(2, '0')}:00 - ${String(newB.endHour).padStart(2, '0')}:00`,
          reason: `Shifted due to ${parsedConstraint.unavailabilityType || 'resource constraint'}`
        });
      }
    });

    // Flag tasks crossing overdue/critical deadlines
    const deadlineCrossedTasks = newSchedule.pendingUnassignedTasks.filter(t => t.safetyCriticality >= 4 || t.isOverdue);

    res.json({
      prompt,
      parsedConstraint,
      baselineSchedule,
      newSchedule,
      cascadingDiff: {
        totalBlocksBefore: baselineSchedule.scheduledBlocks.length,
        totalBlocksAfter: newSchedule.scheduledBlocks.length,
        blocksShiftedCount: shiftedBlocks.length,
        shiftedBlocks,
        deadlineCrossedTasksCount: deadlineCrossedTasks.length,
        deadlineCrossedTasks: deadlineCrossedTasks.map(t => ({
          id: t.id,
          department: t.department,
          corridorId: t.corridorId,
          defectType: t.defectType,
          safetyCriticality: t.safetyCriticality,
          dueDate: t.dueDate,
          isOverdue: t.isOverdue
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ai-summary
 * Calls Anthropic API to generate/regenerate plain-English executive plan summary
 */
app.post('/api/ai-summary', authenticateToken, async (req, res) => {
  const { horizon = 'weekly' } = req.body;
  try {
    const tasks = await allQuery(`SELECT * FROM tasks`);
    const windows = await allQuery(`SELECT * FROM availability_windows`);
    const corridors = await allQuery(`SELECT * FROM corridors`);

    const schedule = generateSchedule({ tasks, availabilityWindows: windows, corridors, horizon });
    const summaryText = await generatePlanSummary(schedule, horizon);

    res.json({ summary: summaryText, horizon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed endpoint reset helper
app.post('/api/seed/reset', authenticateToken, async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', app: 'RailBlock AI API Server' });
});

app.listen(PORT, () => {
  console.log(`RailBlock AI Express Backend running on http://localhost:${PORT}`);
});
