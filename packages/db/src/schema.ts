import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const workspaceMetadata = sqliteTable('workspace_metadata', {
  name: text('name').notNull(),
  description: text('description').notNull(),
  path: text('path').notNull(),
  createdAt: text('created_at').notNull()
})
