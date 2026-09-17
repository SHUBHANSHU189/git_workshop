import bcrypt from 'bcryptjs';
import { db, initDb, runQuery, allQuery } from './database.js';

// Realistic Corridors (Indian Railways High-Density Freight & Passenger Corridors)
const CORRIDORS = [
  {
    id: 'CORR-DEL-CNB',
    name: 'New Delhi - Kanpur Central',
    sectionFrom: 'Ghaziabad Junction (GZB)',
    sectionTo: 'Kanpur Central (CNB)',
    // 24 numbers representing hourly train count (0-23 hrs). Night hrs (01-05) have lower density
    dailyTraffic: [8, 5, 4, 3, 6, 12, 18, 22, 25, 24, 20, 19, 18, 21, 23, 24, 26, 25, 22, 19, 16, 14, 11, 9]
  },
  {
    id: 'CORR-GZB-MTC',
    name: 'Ghaziabad - Meerut City',
    sectionFrom: 'Ghaziabad Junction (GZB)',
    sectionTo: 'Meerut City (MTC)',
    dailyTraffic: [6, 4, 3, 2, 5, 10, 15, 18, 20, 19, 16, 15, 14, 16, 18, 20, 21, 19, 17, 14, 12, 10, 8, 7]
  },
  {
    id: 'CORR-HWH-KGP',
    name: 'Howrah - Kharagpur',
    sectionFrom: 'Howrah Junction (HWH)',
    sectionTo: 'Kharagpur Junction (KGP)',
    dailyTraffic: [10, 6, 5, 4, 7, 14, 20, 26, 28, 27, 24, 22, 21, 24, 27, 28, 29, 27, 24, 20, 17, 15, 12, 10]
  },
  {
    id: 'CORR-BCT-ST',
    name: 'Mumbai Central - Surat',
    sectionFrom: 'Mumbai Central (MMCT)',
    sectionTo: 'Surat (ST)',
    dailyTraffic: [12, 8, 6, 4, 8, 16, 24, 28, 30, 29, 26, 25, 24, 26, 28, 30, 31, 29, 25, 21, 18, 16, 14, 12]
  },
  {
    id: 'CORR-MAS-AJJ',
    name: 'Chennai Central - Arakkonam',
    sectionFrom: 'Chennai Central (MAS)',
    sectionTo: 'Arakkonam Junction (AJJ)',
    dailyTraffic: [7, 4, 3, 2, 5, 11, 17, 21, 23, 21, 18, 17, 16, 18, 20, 22, 23, 21, 18, 15, 12, 10, 8, 7]
  }
];

const DEPARTMENTS = ['Engineering', 'Traction Distribution', 'Signal & Telecom'];

const DEFECT_TYPES = {
  'Engineering': ['Rail Crack Repair', 'Track Relaying & Tamping', 'Ballast Cleaning', 'Routine Track Inspection'],
  'Traction Distribution': ['OHE Wire Tensioning', 'Catenary Mast Repair', 'Insulator Cleaning'],
  'Signal & Telecom': ['Point Machine Replacement', 'Signal Interlocking Test', 'Axle Counter Calibration']
};

const SECTIONS = [
  'KM 42/12-14 Up Main Line', 'KM 118/04 Down Line', 'Yard Interlocking Switch 4B',
  'KM 88/20 Catenary Portal', 'KM 15/02 Crossing Loop', 'Substation Feeder 3',
  'Signal Post 142/A', 'Track Circuit TC-409', 'KM 204/10 Triple Line Segment'
];

export async function seedDatabase() {
  console.log('Seeding SQLite database with mock Indian Railways maintenance & corridor data...');

  await initDb();

  // Clear existing records
  await runQuery(`DELETE FROM users`);
  await runQuery(`DELETE FROM corridors`);
  await runQuery(`DELETE FROM tasks`);
  await runQuery(`DELETE FROM availability_windows`);
  await runQuery(`DELETE FROM scheduled_blocks`);

  // 1. Seed Users
  const passHash = await bcrypt.hash('admin123', 10);
  await runQuery(
    `INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`,
    ['planner@railways.gov.in', passHash, 'Sr. Divisional Operations Manager', 'Chief Planner']
  );

  // 2. Seed Corridors
  for (const c of CORRIDORS) {
    await runQuery(
      `INSERT INTO corridors (id, name, section_from, section_to, daily_traffic_json) VALUES (?, ?, ?, ?, ?)`,
      [c.id, c.name, c.sectionFrom, c.sectionTo, JSON.stringify(c.dailyTraffic)]
    );
  }

  // 3. Seed ~50 Realistic Tasks
  const today = new Date();
  let taskCounter = 1;

  for (let i = 0; i < 52; i++) {
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const corridor = CORRIDORS[i % CORRIDORS.length];
    const defectTypeList = DEFECT_TYPES[dept];
    const defectType = defectTypeList[i % defectTypeList.length];
    const sectionName = SECTIONS[i % SECTIONS.length];

    // Dates & overdue logic
    const daysOffset = (i % 7) - 3; // -3 to +3 days relative to today
    const reportedDateObj = new Date(today);
    reportedDateObj.setDate(reportedDateObj.getDate() - (i % 10 + 2));

    const dueDateObj = new Date(today);
    dueDateObj.setDate(dueDateObj.getDate() + daysOffset);

    const isOverdue = dueDateObj < today ? 1 : 0;
    const safetyCriticality = ((i * 3) % 5) + 1; // 1 to 5
    const duration = ((i % 4) + 2) * 0.5 + 1; // 2.0 to 4.5 hours

    const taskId = `TASK-${String(taskCounter++).padStart(3, '0')}`;

    await runQuery(
      `INSERT INTO tasks (id, department, corridor_id, section_name, description, defect_type, reported_date, due_date, is_overdue, safety_criticality, estimated_duration_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        dept,
        corridor.id,
        `${sectionName} (${corridor.name.split(' - ')[0]} section)`,
        `Simulated ${dept} maintenance requirement: ${defectType} at ${sectionName}. [Source: ${dept === 'Engineering' ? 'TMS' : dept === 'Signal & Telecom' ? 'SMMS' : 'TDMS'}]`,
        defectType,
        reportedDateObj.toISOString().split('T')[0],
        dueDateObj.toISOString().split('T')[0],
        isOverdue,
        safetyCriticality,
        duration,
        'pending'
      ]
    );
  }

  // 4. Seed Availability Windows for Next 14 days
  for (let d = 0; d < 14; d++) {
    const dateObj = new Date(today);
    dateObj.setDate(dateObj.getDate() + d);
    const dateStr = dateObj.toISOString().split('T')[0];

    for (const c of CORRIDORS) {
      // Early morning block window (01:00 - 05:00)
      await runQuery(
        `INSERT INTO availability_windows (corridor_id, date, start_hour, end_hour, available_from_timetable, goods_train_forecast_conflict)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, dateStr, 1, 5, 1, 0]
      );

      // Mid-afternoon block window (13:00 - 16:00)
      const hasGoodsConflict = (d % 3 === 0) ? 1 : 0;
      await runQuery(
        `INSERT INTO availability_windows (corridor_id, date, start_hour, end_hour, available_from_timetable, goods_train_forecast_conflict)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, dateStr, 13, 16, 1, hasGoodsConflict]
      );
    }
  }

  console.log('Database seeding complete successfully!');
}

// Execute directly if run as script
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
