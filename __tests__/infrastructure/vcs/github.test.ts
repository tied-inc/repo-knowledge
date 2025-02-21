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
    expect(deployment).toHaveProperty('id')
    expect(deployment).toHaveProperty('sha')
    expect(deployment).toHaveProperty('environment')
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
      deployments[0].id
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
      deployments[0].id
    )
    // Skip test if no statuses exist
    if (!statuses.length) {
      return
    }
    const status = statuses[0]
    expect(status).toHaveProperty('id')
    expect(status).toHaveProperty('state')
    expect(status).toHaveProperty('environment')
  })
})
