import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WorkspaceManager, createWorkspacePaths } from '../src/index'

function createNowGenerator(): () => Date {
  let current = new Date('2026-03-12T10:00:00.000Z').getTime()

  return () => {
    current += 1000
    return new Date(current)
  }
}

describe('WorkspaceManager', () => {
  it('creates workspace structure, metadata, and bootstrap files', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'kando-workspace-create-'))

    try {
      const workspacePath = join(tempRoot, 'alpha')
      const manager = new WorkspaceManager({
        recentsFilePath: join(tempRoot, 'launcher', 'recent-workspaces.json'),
        now: createNowGenerator()
      })

      const metadata = await manager.createWorkspace({
        name: 'Alpha Workspace',
        description: 'Milestone 2 create test',
        path: workspacePath
      })

      const paths = createWorkspacePaths(workspacePath)

      await expect(stat(paths.workspaceDir)).resolves.toMatchObject({ isDirectory: expect.any(Function) })
      await expect(stat(paths.executionsDir)).resolves.toMatchObject({ isDirectory: expect.any(Function) })
      await expect(stat(paths.docsDir)).resolves.toMatchObject({ isDirectory: expect.any(Function) })
      await expect(stat(paths.prdsDir)).resolves.toMatchObject({ isDirectory: expect.any(Function) })
      await expect(stat(paths.storiesDir)).resolves.toMatchObject({ isDirectory: expect.any(Function) })
      await expect(stat(paths.appDbPath)).resolves.toMatchObject({ isFile: expect.any(Function) })
      await expect(stat(paths.workspaceConfigPath)).resolves.toMatchObject({ isFile: expect.any(Function) })
      await expect(stat(paths.stackConfigPath)).resolves.toMatchObject({ isFile: expect.any(Function) })
      await expect(stat(paths.modelsConfigPath)).resolves.toMatchObject({ isFile: expect.any(Function) })
      await expect(stat(paths.productOverviewPath)).resolves.toMatchObject({ isFile: expect.any(Function) })

      expect(metadata.name).toBe('Alpha Workspace')
      expect(metadata.description).toBe('Milestone 2 create test')
      expect(metadata.path).toBe(workspacePath)
      expect(metadata.createdAt).toBe('2026-03-12T10:00:01.000Z')
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  it('loads an existing workspace from sqlite metadata', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'kando-workspace-open-'))

    try {
      const workspacePath = join(tempRoot, 'alpha')
      const recentsFilePath = join(tempRoot, 'launcher', 'recent-workspaces.json')
      const now = createNowGenerator()
      const manager = new WorkspaceManager({ recentsFilePath, now })
      const created = await manager.createWorkspace({
        name: 'Alpha Workspace',
        description: 'Open flow',
        path: workspacePath
      })

      const reader = new WorkspaceManager({ recentsFilePath, now })
      const opened = await reader.openWorkspace(workspacePath)

      expect(opened).toEqual(created)
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  it('persists workspace metadata across service instances', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'kando-workspace-persist-'))

    try {
      const workspacePath = join(tempRoot, 'persisted')
      const recentsFilePath = join(tempRoot, 'launcher', 'recent-workspaces.json')
      const creator = new WorkspaceManager({ recentsFilePath, now: createNowGenerator() })

      await creator.createWorkspace({
        name: 'Persisted Workspace',
        description: 'SQLite authoritative metadata',
        path: workspacePath
      })

      const reader = new WorkspaceManager({ recentsFilePath, now: createNowGenerator() })
      const loaded = await reader.openWorkspace(workspacePath)

      expect(loaded.name).toBe('Persisted Workspace')
      expect(loaded.description).toBe('SQLite authoritative metadata')
      expect(loaded.path).toBe(workspacePath)
      expect(loaded.createdAt).toBe('2026-03-12T10:00:01.000Z')
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  it('writes workspace.json as a minimal bootstrap file', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'kando-workspace-bootstrap-'))

    try {
      const workspacePath = join(tempRoot, 'bootstrap')
      const manager = new WorkspaceManager({
        recentsFilePath: join(tempRoot, 'launcher', 'recent-workspaces.json'),
        now: createNowGenerator()
      })

      await manager.createWorkspace({
        name: 'Bootstrap Workspace',
        description: 'Bootstrap contract test',
        path: workspacePath
      })

      const workspaceConfigRaw = await readFile(join(workspacePath, '.workspace', 'workspace.json'), 'utf8')
      const workspaceConfig = JSON.parse(workspaceConfigRaw) as Record<string, string | number>

      expect(workspaceConfig).toEqual({
        version: 1,
        metadataSource: 'sqlite',
        database: 'app.db'
      })
      expect(workspaceConfig).not.toHaveProperty('name')
      expect(workspaceConfig).not.toHaveProperty('description')
      expect(workspaceConfig).not.toHaveProperty('path')
      expect(workspaceConfig).not.toHaveProperty('createdAt')
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })

  it('persists recent workspaces globally with dedupe and cap', async () => {
    const tempRoot = await mkdtemp(join(tmpdir(), 'kando-workspace-recents-'))

    try {
      const recentsFilePath = join(tempRoot, 'launcher', 'recent-workspaces.json')
      const manager = new WorkspaceManager({ recentsFilePath, now: createNowGenerator() })

      for (let index = 1; index <= 21; index += 1) {
        await manager.createWorkspace({
          name: `Workspace ${index}`,
          description: `Desc ${index}`,
          path: join(tempRoot, `ws-${index}`)
        })
      }

      const recents = await manager.listRecentWorkspaces()

      expect(recents).toHaveLength(20)
      expect(recents[0]?.name).toBe('Workspace 21')
      expect(recents[19]?.name).toBe('Workspace 2')

      await manager.openWorkspace(join(tempRoot, 'ws-10'))
      const deduped = await manager.listRecentWorkspaces()

      expect(deduped).toHaveLength(20)
      expect(deduped[0]?.path).toBe(join(tempRoot, 'ws-10'))
      expect(deduped.filter((entry) => entry.path === join(tempRoot, 'ws-10'))).toHaveLength(1)
    } finally {
      await rm(tempRoot, { recursive: true, force: true })
    }
  })
})
