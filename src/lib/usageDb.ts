import mysql from 'mysql2/promise';

export type UsageEventRow = {
  kind: 'cron' | 'heartbeat' | 'interactive';
  ts: number;
  day: string;
  hour: string;
  jobId: string | null;
  jobName: string | null;
  model: string | null;
  status: string | null;
  cost: number | null;
  tokens: number | null;
  sessionId: string | null;
  source: string | null;
  missingUsage: number | null; // 0/1
};

export function usageDbEnabled() {
  return String(process.env.USAGE_DB_ENABLED || '').toLowerCase() === 'true';
}

export async function getDb() {
  const host = process.env.USAGE_DB_HOST || '127.0.0.1';
  const port = Number(process.env.USAGE_DB_PORT || 3306);
  const user = process.env.USAGE_DB_USER || 'morpheuxx';
  const password = process.env.USAGE_DB_PASSWORD || '';
  const database = process.env.USAGE_DB_NAME || 'morpheuxx_usage';

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 5,
    enableKeepAlive: true,
  });
}

export async function ensureSchema() {
  const db = await getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS ingest_state (
      source VARCHAR(255) PRIMARY KEY,
      byte_offset BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS usage_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      kind ENUM('cron','heartbeat') NOT NULL,
      ts BIGINT NOT NULL,
      day CHAR(10) NOT NULL,
      hour CHAR(13) NOT NULL,
      job_id VARCHAR(64) NULL,
      job_name VARCHAR(128) NULL,
      model VARCHAR(128) NULL,
      status VARCHAR(16) NULL,
      cost DOUBLE NULL,
      tokens BIGINT NULL,
      session_id VARCHAR(64) NULL,
      source VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_event (kind, ts, job_id, session_id),
      KEY idx_day (day),
      KEY idx_hour (hour),
      KEY idx_model (model),
      KEY idx_job (job_name)
    )
  `);

  return db;
}

export async function queryUsageEvents(opts: {
  startMs: number;
  endMs: number;
}): Promise<UsageEventRow[]> {
  const db = await getDb();

  // New source of truth: usage_messages (message-level, dedup by (session_id, assistant_msg_id))
  const [rows] = await db.query(
    `SELECT kind, ts, day, hour,
            job_id as jobId, job_name as jobName,
            model, status, cost, tokens,
            session_id as sessionId,
            source,
            0 as missingUsage
     FROM usage_messages
     WHERE ts BETWEEN ? AND ?
     ORDER BY ts ASC`,
    [opts.startMs, opts.endMs]
  );

  return rows as UsageEventRow[];
}
