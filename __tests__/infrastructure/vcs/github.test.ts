import { createGitHubVCSProvider } from '../../../src/infrastructure/vcs/github'

describe('GitHub VCS Provider', () => {
  const provider = createGitHubVCSProvider()
  const owner = 'tied-inc'
  const repo = 'repo-knowledge'

  it('should fetch deployments array', async () => {
    const deployments = await provider.getDeployments(owner, repo)
    expect(Array.isArray(deployments)).toBe(true)
  })

  it('should fetch deployment with correct properties when exists', async () => {
    const deployments = await provider.getDeployments(owner, repo)
    // Skip test if no deployments exist
    if (!deployments.length) {
      return
    }
    const deployment = deployments[0]
    expect(deployment.provider).toBe('github')
    expect(deployment.environment).toBeDefined()
    expect(deployment.sha).toBeDefined()
    expect(deployment.createdAt).toBeDefined()
    expect(deployment.updatedAt).toBeDefined()
  })

  it('should fetch deployment statuses array', async () => {
    const deployments = await provider.getDeployments(owner, repo)
    // Skip test if no deployments exist
    if (!deployments.length) {
      return
    }
    const statuses = await provider.getDeploymentStatus(
      owner,
      repo,
      (deployments[0] as unknown as { id: number }).id
    )
    expect(Array.isArray(statuses)).toBe(true)
  })

  it('should fetch status with correct properties when exists', async () => {
    const deployments = await provider.getDeployments(owner, repo)
    // Skip test if no deployments exist
    if (!deployments.length) {
      return
    }
    const statuses = await provider.getDeploymentStatus(
      owner,
      repo,
      (deployments[0] as unknown as { id: number }).id
    )
    // Skip test if no statuses exist
    if (!statuses.length) {
      return
    }
    const status = statuses[0]
    expect(status.deploymentId).toBeDefined()
    expect(status.state).toBeDefined()
    expect(status.createdAt).toBeDefined()
    expect(status.updatedAt).toBeDefined()
  })
})
