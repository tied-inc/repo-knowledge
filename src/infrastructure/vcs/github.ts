import { Octokit } from '@octokit/rest'
import type { VCSProvider, Deployment, DeploymentStatus } from './interface.js'
import type { components } from '@octokit/openapi-types'

type GitHubDeployment = components['schemas']['deployment']
type GitHubDeploymentStatus = components['schemas']['deployment-status']

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
