import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkspaceManager } from '@kando/core'
import type { CreateWorkspaceInput } from '@kando/shared'

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow: BrowserWindow | null = null
let workspaceManager: WorkspaceManager | null = null

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    title: 'Kando',
    webPreferences: {
      preload: join(currentDir, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    return
  }

  void mainWindow.loadFile(join(currentDir, '../renderer/index.html'))
}

function getWorkspaceManager(): WorkspaceManager {
  if (!workspaceManager) {
    throw new Error('Workspace manager is not initialized yet.')
  }

  return workspaceManager
}

function registerWorkspaceIpcHandlers(): void {
  ipcMain.handle('workspace:create', async (_event, payload: CreateWorkspaceInput) =>
    getWorkspaceManager().createWorkspace(payload)
  )

  ipcMain.handle('workspace:open', async (_event, workspacePath: string) =>
    getWorkspaceManager().openWorkspace(workspacePath)
  )

  ipcMain.handle('workspace:list-recent', async () => getWorkspaceManager().listRecentWorkspaces())

  ipcMain.handle('workspace:pick-folder', async () => {
    const options: OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory']
    }

    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, options)
      : await dialog.showOpenDialog(options)

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0] ?? null
  })
}

app.whenReady()
  .then(() => {
    workspaceManager = new WorkspaceManager({
      recentsFilePath: join(app.getPath('userData'), 'recent-workspaces.json')
    })

    registerWorkspaceIpcHandlers()
    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })
  .catch((error: unknown) => {
    console.error('Failed to start Electron main process.', error)
    app.quit()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
