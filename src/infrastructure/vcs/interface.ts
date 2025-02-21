// GitHub Deployment data types
export interface GitHubDeployment {
  id: number
  sha: string
  ref: string
  task: string
  environment: string
  description: string | null
  creator: {
    login: string
    id: number
  }
  created_at: string
  updated_at: string
  statuses_url: string
  repository_url: string
}

export interface DeploymentStatus {
  id: number
  deployment_id: number
  state: 'pending' | 'success' | 'failure' | 'error' | 'inactive'
  creator: {
    login: string
    id: number
  }
  description: string | null
  environment: string
  created_at: string
  updated_at: string
}

// VCS Provider interface
export interface VCSProvider {
  getDeployments: (
    owner: string,
    repo: string,
    environment?: string
  ) => Promise<GitHubDeployment[]>
  getDeploymentStatus: (
    owner: string,
    repo: string,
    deployment_id: number
  ) => Promise<DeploymentStatus[]>
}
