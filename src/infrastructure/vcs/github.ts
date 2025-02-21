import { Octokit } from '@octokit/rest'
import type {
  VCSProvider,
  GitHubDeployment,
  DeploymentStatus
} from './interface.js'

export const createGitHubVCSProvider = (token?: string): VCSProvider => {
  const octokit = new Octokit({ auth: token })

  const getDeployments = async (
    owner: string,
    repo: string,
    environment?: string
  ): Promise<GitHubDeployment[]> => {
    const params = {
      owner,
      repo,
      ...(environment ? { environment } : {})
    }

    const { data } = await octokit.repos.listDeployments(params)
    return data.map((d) => ({
      id: d.id,
      sha: d.sha,
      ref: d.ref,
      task: d.task,
      environment: d.environment,
      description: d.description,
      creator: {
        login: d.creator?.login || '',
        id: d.creator?.id || 0
      },
      created_at: d.created_at,
      updated_at: d.updated_at,
      statuses_url: d.statuses_url,
      repository_url: d.repository_url
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
    return data.map((s) => ({
      id: s.id,
      deployment_id,
      state: s.state as DeploymentStatus['state'],
      creator: {
        login: s.creator?.login || '',
        id: s.creator?.id || 0
      },
      description: s.description || null,
      environment: s.environment || '',
      created_at: s.created_at,
      updated_at: s.updated_at
    }))
  }

  return {
    getDeployments,
    getDeploymentStatus
  }
}
