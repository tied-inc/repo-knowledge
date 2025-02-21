// Generic VCS interfaces
export interface Deployment {
  provider: string
  environment: string
  sha: string
  createdAt: string
  updatedAt: string
}

export interface DeploymentStatus {
  deploymentId: string
  state: 'pending' | 'success' | 'failure' | 'error' | 'inactive'
  createdAt: string
  updatedAt: string
}

// VCS Provider interface
export interface VCSProvider {
  getDeployments: (
    owner: string,
    repo: string,
    environment?: string
  ) => Promise<Deployment[]>
  getDeploymentStatus: (
    owner: string,
    repo: string,
    deployment_id: number
  ) => Promise<DeploymentStatus[]>
}
