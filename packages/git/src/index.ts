export interface GitStatusSummary {
  branch: string
  hasChanges: boolean
  changedFiles: string[]
}

export interface GitService {
  getCurrentBranch(repoPath: string): Promise<string>
  getStatus(repoPath: string): Promise<GitStatusSummary>
}

export class StubGitService implements GitService {
  async getCurrentBranch(_repoPath: string): Promise<string> {
    throw new Error('Not implemented: GitService.getCurrentBranch')
  }

  async getStatus(_repoPath: string): Promise<GitStatusSummary> {
    throw new Error('Not implemented: GitService.getStatus')
  }
}