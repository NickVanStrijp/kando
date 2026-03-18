import Database from 'better-sqlite3'
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.ts'

export type KandoDatabase = BetterSQLite3Database<typeof schema>

export interface KandoDbClient {
  sqlite: Database.Database
  db: KandoDatabase
}

export function createDatabase(databasePath: string): KandoDbClient {
  const sqlite = new Database(databasePath)
  sqlite.pragma('journal_mode = WAL')

  const db = drizzle(sqlite, { schema })

  return {
    sqlite,
    db
  }
}

export { schema }


