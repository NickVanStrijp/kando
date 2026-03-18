import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, resolve } from 'node:path'
import { createDatabase } from '@kando/db'
import type { CreateWorkspaceInput, RecentWorkspace, WorkspaceMetadata } from '@kando/shared'

export const RECENT_WORKSPACES_LIMIT = 20
const WORKSPACE_BOOTSTRAP_VERSION = 1

export type WorkspaceManagerErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_PATH'
  | 'WORKSPACE_ALREADY_INITIALIZED'
  | 'WORKSPACE_NOT_INITIALIZED'
  | 'WORKSPACE_STRUCTURE_INVALID'
  | 'WORKSPACE_METADATA_NOT_FOUND'

interface WorkspaceManagerOptions {
  recentsFilePath: string
  now?: () => Date
}

interface WorkspacePaths {
  rootDir: string
  workspaceDir: string
  appDbPath: string
  workspaceConfigPath: string
  stackConfigPath: string
  modelsConfigPath: string
  executionsDir: string
  docsDir: string
  productOverviewPath: string
  prdsDir: string
  storiesDir: string
}

interface WorkspaceBootstrapConfig {
  version: number
  metadataSource: 'sqlite'
  database: 'app.db'
}

export class WorkspaceManagerError extends Error {
  readonly code: WorkspaceManagerErrorCode

  constructor(code: WorkspaceManagerErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'WorkspaceManagerError'
  }
}

export class WorkspaceManager {
  private readonly recentsFilePath: string
  private readonly now: () => Date

  constructor(options: WorkspaceManagerOptions) {
    this.recentsFilePath = options.recentsFilePath
    this.now = options.now ?? (() => new Date())
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceMetadata> {
    const name = normalizeWorkspaceName(input.name)
    const description = input.description?.trim() ?? ''
    const rootPath = normalizeWorkspacePath(input.path)
    const paths = createWorkspacePaths(rootPath)

    await mkdir(paths.rootDir, { recursive: true })

    if ((await fileExists(paths.appDbPath)) || (await fileExists(paths.workspaceConfigPath))) {
      throw new WorkspaceManagerError(
        'WORKSPACE_ALREADY_INITIALIZED',
        `A workspace already exists at ${rootPath}.`
      )
    }

    await this.createWorkspaceFolders(paths)
    await this.createWorkspaceFiles(paths)

    const metadata: WorkspaceMetadata = {
      name,
      description,
      path: rootPath,
      createdAt: this.now().toISOString()
    }

    this.persistWorkspaceMetadata(paths.appDbPath, metadata)
    await this.saveRecentWorkspace(metadata)

    return metadata
  }

  async openWorkspace(path: string): Promise<WorkspaceMetadata> {
    const rootPath = normalizeWorkspacePath(path)
    const paths = createWorkspacePaths(rootPath)

    await this.ensureWorkspaceStructure(paths)

    const metadata = this.loadWorkspaceMetadata(paths.appDbPath)

    await this.saveRecentWorkspace(metadata)

    return metadata
  }

  async listRecentWorkspaces(): Promise<RecentWorkspace[]> {
    return this.readRecentWorkspaces()
  }

  private async createWorkspaceFolders(paths: WorkspacePaths): Promise<void> {
    await mkdir(paths.workspaceDir, { recursive: true })
    await mkdir(paths.executionsDir, { recursive: true })
    await mkdir(paths.docsDir, { recursive: true })
    await mkdir(paths.prdsDir, { recursive: true })
    await mkdir(paths.storiesDir, { recursive: true })
  }

  private async createWorkspaceFiles(paths: WorkspacePaths): Promise<void> {
    const workspaceBootstrap: WorkspaceBootstrapConfig = {
      version: WORKSPACE_BOOTSTRAP_VERSION,
      metadataSource: 'sqlite',
      database: 'app.db'
    }

    try {
      await writeFile(paths.workspaceConfigPath, `${JSON.stringify(workspaceBootstrap, null, 2)}\n`, {
        encoding: 'utf8',
        flag: 'wx'
      })
      await writeFile(paths.stackConfigPath, '{}\n', { encoding: 'utf8', flag: 'wx' })
      await writeFile(paths.modelsConfigPath, '{}\n', { encoding: 'utf8', flag: 'wx' })
      await writeFile(paths.productOverviewPath, '# Product Overview\n\n', {
        encoding: 'utf8',
        flag: 'wx'
      })
    } catch (error) {
      if (isNodeError(error) && error.code === 'EEXIST') {
        throw new WorkspaceManagerError(
          'WORKSPACE_ALREADY_INITIALIZED',
          `A workspace already exists at ${paths.rootDir}.`
        )
      }

      throw error
    }
  }

  private persistWorkspaceMetadata(databasePath: string, metadata: WorkspaceMetadata): void {
    const client = createDatabase(databasePath)

    try {
      client.sqlite.exec(`
        CREATE TABLE IF NOT EXISTS workspace_metadata (
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          path TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `)

      client.sqlite.prepare('DELETE FROM workspace_metadata').run()
      client.sqlite
        .prepare(
          'INSERT INTO workspace_metadata (name, description, path, created_at) VALUES (?, ?, ?, ?)'
        )
        .run(metadata.name, metadata.description, metadata.path, metadata.createdAt)
    } finally {
      client.sqlite.close()
    }
  }

  private loadWorkspaceMetadata(databasePath: string): WorkspaceMetadata {
    if (!existsSync(databasePath)) {
      throw new WorkspaceManagerError(
        'WORKSPACE_NOT_INITIALIZED',
        'Workspace database was not found. Make sure this is a valid Kando workspace.'
      )
    }

    const client = createDatabase(databasePath)

    try {
      client.sqlite.exec(`
        CREATE TABLE IF NOT EXISTS workspace_metadata (
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          path TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `)

      const row = client.sqlite
        .prepare('SELECT name, description, path, created_at as createdAt FROM workspace_metadata LIMIT 1')
        .get() as WorkspaceMetadata | undefined

      if (!row) {
        throw new WorkspaceManagerError(
          'WORKSPACE_METADATA_NOT_FOUND',
          'Workspace metadata was not found in the local database.'
        )
      }

      return {
        name: row.name,
        description: row.description,
        path: row.path,
        createdAt: row.createdAt
      }
    } finally {
      client.sqlite.close()
    }
  }

  private async ensureWorkspaceStructure(paths: WorkspacePaths): Promise<void> {
    const requiredFiles = [
      paths.appDbPath,
      paths.workspaceConfigPath,
      paths.stackConfigPath,
      paths.modelsConfigPath,
      paths.productOverviewPath
    ]

    const requiredDirs = [
      paths.workspaceDir,
      paths.executionsDir,
      paths.docsDir,
      paths.prdsDir,
      paths.storiesDir
    ]

    for (const filePath of requiredFiles) {
      if (!(await fileExists(filePath))) {
        throw new WorkspaceManagerError(
          'WORKSPACE_STRUCTURE_INVALID',
          `Workspace is missing required file: ${filePath}`
        )
      }
    }

    for (const dirPath of requiredDirs) {
      if (!(await directoryExists(dirPath))) {
        throw new WorkspaceManagerError(
          'WORKSPACE_STRUCTURE_INVALID',
          `Workspace is missing required directory: ${dirPath}`
        )
      }
    }
  }

  private async saveRecentWorkspace(metadata: WorkspaceMetadata): Promise<void> {
    const recents = await this.readRecentWorkspaces()
    const nextEntry: RecentWorkspace = {
      name: metadata.name,
      path: metadata.path,
      lastOpenedAt: this.now().toISOString()
    }

    const normalizedPath = toRecentsKey(metadata.path)
    const deduped = recents.filter((entry) => toRecentsKey(entry.path) !== normalizedPath)
    const nextRecents = [nextEntry, ...deduped].slice(0, RECENT_WORKSPACES_LIMIT)

    await mkdir(dirname(this.recentsFilePath), { recursive: true })
    await writeFile(this.recentsFilePath, `${JSON.stringify(nextRecents, null, 2)}\n`, 'utf8')
  }

  private async readRecentWorkspaces(): Promise<RecentWorkspace[]> {
    if (!(await fileExists(this.recentsFilePath))) {
      return []
    }

    try {
      const content = await readFile(this.recentsFilePath, 'utf8')
      const parsed = JSON.parse(content) as unknown

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed
        .filter((entry) => isRecentWorkspace(entry))
        .sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt))
        .slice(0, RECENT_WORKSPACES_LIMIT)
    } catch {
      return []
    }
  }
}

export function normalizeWorkspaceName(name: string): string {
  const trimmed = name.trim()

  if (!trimmed) {
    throw new WorkspaceManagerError('INVALID_NAME', 'Workspace name is required.')
  }

  return trimmed
}

export function normalizeWorkspacePath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed) {
    throw new WorkspaceManagerError('INVALID_PATH', 'Workspace path is required.')
  }

  return resolve(trimmed)
}

export function createWorkspacePaths(rootPath: string): WorkspacePaths {
  return {
    rootDir: rootPath,
    workspaceDir: join(rootPath, '.workspace'),
    appDbPath: join(rootPath, '.workspace', 'app.db'),
    workspaceConfigPath: join(rootPath, '.workspace', 'workspace.json'),
    stackConfigPath: join(rootPath, '.workspace', 'stack.json'),
    modelsConfigPath: join(rootPath, '.workspace', 'models.json'),
    executionsDir: join(rootPath, '.workspace', 'executions'),
    docsDir: join(rootPath, 'docs'),
    productOverviewPath: join(rootPath, 'docs', 'product-overview.md'),
    prdsDir: join(rootPath, 'docs', 'prds'),
    storiesDir: join(rootPath, 'docs', 'stories')
  }
}

function toRecentsKey(path: string): string {
  return normalize(path).toLowerCase()
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const fileStats = await stat(path)
    return fileStats.isFile()
  } catch {
    return false
  }
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    const fileStats = await stat(path)
    return fileStats.isDirectory()
  } catch {
    return false
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error
}

function isRecentWorkspace(value: unknown): value is RecentWorkspace {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<RecentWorkspace>

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.path === 'string' &&
    typeof candidate.lastOpenedAt === 'string'
  )
}

