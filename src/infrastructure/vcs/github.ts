import { Octokit } from '@octokit/rest'
import type { VCSProvider, Deployment, DeploymentStatus } from './interface.js'

// GitHub-specific types
interface GitHubDeployment {
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

interface GitHubDeploymentStatus {
  id: number
  deployment_id: number
  state: DeploymentStatus['state']
  creator: {
    login: string
    id: number
  }
  description: string | null
  environment: string
  created_at: string
  updated_at: string
}

export const createGitHubVCSProvider = (token?: string): VCSProvider => {
  const octokit = new Octokit({ auth: token })

  const getDeployments = async (
    owner: string,
    repo: string,
    environment?: string
  ): Promise<Deployment[]> => {
    const params = {
      owner,
      repo,
      ...(environment ? { environment } : {})
    }

    const { data } = await octokit.repos.listDeployments(params)
    const githubDeployments = data as GitHubDeployment[]
    return githubDeployments.map((d) => ({
      provider: 'github',
      environment: d.environment,
      sha: d.sha,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }))
  }

  const getDeploymentStatus = async (
    owner: string,
    repo: string,
    deployment_id: number
  ): Promise<DeploymentStatus[]> => {
    const { data } = await octokit.repos.listDeploymentStatuses({
      owner,
      repo,
      deployment_id
    })
    const githubStatuses = data as GitHubDeploymentStatus[]
    return githubStatuses.map((s) => ({
      deploymentId: deployment_id.toString(),
      state: s.state as DeploymentStatus['state'],
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }))
  }

  return {
    getDeployments,
    getDeploymentStatus
  }
}
