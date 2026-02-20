const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database file
const dbPath = path.join(dataDir, 'livestock.json');

// Default data structure
const defaultData = {
  users: [],
  animals: [],
  records: [],
  _meta: {
    lastUserId: 0,
    lastAnimalId: 0,
    lastRecordId: 0
  }
};

// Initialize database
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Initialize database (load or create)
async function init() {
  await db.read();
  
  // If database is empty, initialize with default structure
  if (!db.data || Object.keys(db.data).length === 0) {
    db.data = defaultData;
    await db.write();
  }
  
  // Ensure _meta exists
  if (!db.data._meta) {
    db.data._meta = {
      lastUserId: Math.max(0, ...db.data.users.map(u => u.id || 0)),
      lastAnimalId: Math.max(0, ...db.data.animals.map(a => a.id || 0)),
      lastRecordId: Math.max(0, ...db.data.records.map(r => r.id || 0))
    };
    await db.write();
  }
  
  console.log('Database initialized successfully');
  return db;
}

// Initialize on module load
init().catch(err => {
  console.error('Database initialization error:', err);
});

module.exports = db;
