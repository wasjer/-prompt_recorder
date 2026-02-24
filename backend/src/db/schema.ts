import initSqlJs from 'sql.js';

// Database type from sql.js
export type Database = Awaited<ReturnType<typeof initSqlJs>>['Database'];

export function createSchema(db: Database) {
  // Create prompts table
  (db as any).run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('browser', 'cursor', 'vscode', 'manual')),
      url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      tags TEXT,
      category TEXT
    )
  `);

  // Create indexes for better query performance
  (db as any).run(`
    CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source);
    CREATE INDEX IF NOT EXISTS idx_prompts_timestamp ON prompts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
  `);
}

export { initSqlJs };
