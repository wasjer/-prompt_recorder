import initSqlJs from 'sql.js';
import * as fs from 'fs';
import path from 'path';
import { createSchema, Database } from './schema';
import { Prompt, CreatePromptDto, UpdatePromptDto, PromptQuery } from '../models/Prompt';

const DB_PATH = path.join(process.cwd(), 'data', 'prompts.db');

// Helper function to escape SQL strings
function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

export class PromptDatabase {
  private db: Database | null = null;
  private SQL: any = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Start async initialization
    this.initPromise = this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Initialize SQL.js
      // sql.js will automatically find the wasm file in node_modules
      this.SQL = await initSqlJs();

      // Load existing database or create new one
      if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        this.db = new this.SQL.Database(new Uint8Array(buffer)) as Database;
      } else {
        this.db = new this.SQL.Database() as Database;
        createSchema(this.db);
        this.save();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  // Wait for database to be initialized
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
  }

  private getDb(): Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  private save() {
    if (!this.db) return;
    const data = (this.db as any).export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }

  async create(data: CreatePromptDto): Promise<Prompt> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;
    
    // Get last insert ID before insert (to know what ID will be used)
    const countStmt = db.prepare('SELECT MAX(id) as maxId FROM prompts');
    countStmt.step();
    const maxIdResult = countStmt.get();
    const currentMaxId = Array.isArray(maxIdResult) ? (maxIdResult[0] || 0) : (maxIdResult || 0);
    countStmt.free();
    const nextId = (currentMaxId as number) + 1;
    
    // Use Beijing time (UTC+8) for timestamp
    const beijingTime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
    
    db.run(
      `INSERT INTO prompts (content, source, url, metadata, tags, category, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.content,
        data.source,
        data.url || null,
        metadataJson,
        data.tags || null,
        data.category || null,
        beijingTime
      ]
    );

    this.save();
    
    // Get the full record using prepare
    const fullStmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
    fullStmt.bind([nextId]);
    
    if (!fullStmt.step()) {
      // If not found by nextId, try last_insert_rowid
      fullStmt.free();
      const idStmt = db.prepare('SELECT last_insert_rowid() as id');
      idStmt.step();
      const idResult = idStmt.get();
      const actualId = Array.isArray(idResult) ? idResult[0] : idResult;
      idStmt.free();
      
      const retryStmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
      retryStmt.bind([actualId]);
      if (!retryStmt.step()) {
        retryStmt.free();
        throw new Error('Failed to retrieve created prompt');
      }
      const rowValues = retryStmt.get();
      retryStmt.free();
      
      const columnNames = ['id', 'content', 'source', 'url', 'timestamp', 'metadata', 'tags', 'category'];
      const row: any = {};
      if (Array.isArray(rowValues)) {
        rowValues.forEach((val: any, index: number) => {
          if (index < columnNames.length) {
            row[columnNames[index]] = val;
          }
        });
      }
      return this.mapRowToPrompt(row);
    }
    
    const rowValues = fullStmt.get();
    fullStmt.free();
    
    // Map values to object manually
    const columnNames = ['id', 'content', 'source', 'url', 'timestamp', 'metadata', 'tags', 'category'];
    const row: any = {};
    if (Array.isArray(rowValues)) {
      rowValues.forEach((val: any, index: number) => {
        if (index < columnNames.length) {
          row[columnNames[index]] = val;
        }
      });
    }
    
    return this.mapRowToPrompt(row);
  }

  async findById(id: number): Promise<Prompt | null> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    const stmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
    stmt.bind([id]);
    
    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row = this.stmtToObject(stmt);
    stmt.free();
    return this.mapRowToPrompt(row);
  }

  async findAll(query: PromptQuery = {}): Promise<{ prompts: Prompt[]; total: number }> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    const {
      search,
      source,
      tags,
      category,
      startDate,
      endDate,
      llm,
      limit = 50,
      offset = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = query;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (search) {
      whereConditions.push('content LIKE ?');
      params.push(`%${search}%`);
    }

    if (source) {
      whereConditions.push('source = ?');
      params.push(source);
    }

    if (tags) {
      whereConditions.push('tags LIKE ?');
      params.push(`%${tags}%`);
    }

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    if (startDate) {
      whereConditions.push('timestamp >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('timestamp <= ?');
      params.push(endDate);
    }

    // Filter by LLM/platform from metadata JSON
    // Since sql.js doesn't support JSON1 extension, we use LIKE to search in JSON string
    if (llm) {
      whereConditions.push('metadata LIKE ?');
      params.push(`%"platform":"${llm}"%`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count using prepare
    let total = 0;
    if (whereClause) {
      const countStmt = db.prepare(`SELECT COUNT(*) as count FROM prompts ${whereClause}`);
      countStmt.bind(params);
      if (countStmt.step()) {
        total = countStmt.get()[0] as number;
      }
      countStmt.free();
    } else {
      const countStmt = db.prepare('SELECT COUNT(*) as count FROM prompts');
      if (countStmt.step()) {
        total = countStmt.get()[0] as number;
      }
      countStmt.free();
    }

    // Get prompts using prepare
    const orderBy = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    const querySql = `SELECT * FROM prompts ${whereClause} ${orderBy} LIMIT ? OFFSET ?`;
    const stmt = db.prepare(querySql);
    stmt.bind([...params, limit, offset]);

    const prompts: Prompt[] = [];
    while (stmt.step()) {
      const row = this.stmtToObject(stmt);
      prompts.push(this.mapRowToPrompt(row));
    }
    stmt.free();

    return { prompts, total };
  }

  async update(id: number, data: UpdatePromptDto): Promise<Prompt | null> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }

    if (data.tags !== undefined) {
      updates.push('tags = ?');
      params.push(data.tags);
    }

    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (data.metadata !== undefined) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(data.metadata));
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    db.run(
      `UPDATE prompts 
       SET ${updates.join(', ')} 
       WHERE id = ?`,
      params
    );

    this.save();
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    const stmt = db.prepare('DELETE FROM prompts WHERE id = ?');
    stmt.bind([id]);
    stmt.step();
    const changed = db.getRowsModified() > 0;
    stmt.free();
    this.save();
    return changed;
  }

  async deleteAll(): Promise<number> {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    // Get count before deletion
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM prompts');
    countStmt.step();
    const count = countStmt.get()[0] as number;
    countStmt.free();

    // Delete all
    const stmt = db.prepare('DELETE FROM prompts');
    stmt.step();
    stmt.free();
    this.save();
    return count;
  }

  async getStats() {
    await this.ensureInitialized();
    const db = this.getDb() as any;

    // Get total
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM prompts');
    totalStmt.step();
    const total = totalStmt.get()[0] as number;
    totalStmt.free();

    // Get by source
    const sourceStmt = db.prepare(`
      SELECT source, COUNT(*) as count 
      FROM prompts 
      GROUP BY source
    `);
    const bySource: Array<{ source: string; count: number }> = [];
    while (sourceStmt.step()) {
      const row = sourceStmt.get();
      bySource.push({
        source: row[0] as string,
        count: row[1] as number
      });
    }
    sourceStmt.free();

    // Get by category
    const categoryStmt = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM prompts 
      WHERE category IS NOT NULL
      GROUP BY category
    `);
    const byCategory: Array<{ category: string; count: number }> = [];
    while (categoryStmt.step()) {
      const row = categoryStmt.get();
      byCategory.push({
        category: row[0] as string,
        count: row[1] as number
      });
    }
    categoryStmt.free();

    // Get recent (last 7 days)
    const recentStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM prompts 
      WHERE timestamp >= datetime('now', '-7 days')
    `);
    recentStmt.step();
    const recent = recentStmt.get()[0] as number;
    recentStmt.free();

    return {
      total,
      bySource,
      byCategory,
      recent
    };
  }

  private stmtToObject(stmt: any): any {
    const obj: any = {};
    const values = stmt.get();
    // sql.js stmt.get() returns an array of values
    // We need to map them to column names based on the SELECT query order
    // For SELECT * queries, the order is: id, content, source, url, timestamp, metadata, tags, category
    const columnNames = ['id', 'content', 'source', 'url', 'timestamp', 'metadata', 'tags', 'category'];
    
    // Handle different return formats
    if (Array.isArray(values)) {
      values.forEach((val: any, index: number) => {
        if (index < columnNames.length) {
          obj[columnNames[index]] = val;
        }
      });
    } else if (values && typeof values === 'object') {
      // If it's already an object, return it
      return values;
    }
    
    return obj;
  }

  private mapRowToPrompt(row: any): Prompt {
    return {
      id: row.id,
      content: row.content,
      source: row.source,
      url: row.url,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      tags: row.tags,
      category: row.category
    };
  }

  close() {
    if (this.db) {
      (this.db as any).close();
    }
  }
}

// Singleton instance
let dbInstance: PromptDatabase | null = null;

export function getDatabase(): PromptDatabase {
  if (!dbInstance) {
    dbInstance = new PromptDatabase();
  }
  return dbInstance;
}
