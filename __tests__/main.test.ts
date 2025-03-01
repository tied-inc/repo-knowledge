/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// Mock the GitHub VCS provider
const mockGetDeployments = jest.fn()
jest.unstable_mockModule('../src/infrastructure/vcs/github.js', () => ({
  createGitHubVCSProvider: () => ({
    getDeployments: mockGetDeployments,
    getDeploymentStatus: jest.fn()
  })
}))

// Mock the deployment frequency calculation
const mockCalculateFrequency = jest.fn()
jest.unstable_mockModule(
  '../src/infrastructure/metrics/deployment-frequency.js',
  () => ({
    calculateDeploymentFrequency: mockCalculateFrequency
  })
)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'method':
          return 'collect'
        default:
          return ''
      }
    })

    // Set up environment variables
    process.env.GITHUB_TOKEN = 'mock-token'

    // Set up mock return values
    mockGetDeployments.mockImplementation(() => Promise.resolve([]))
    mockCalculateFrequency.mockImplementation(() => ({
      value: 1.5,
      unit: 'per_day',
      period: 'week',
      totalDeployments: 10,
      startDate: '2025-02-22T00:00:00.000Z',
      endDate: '2025-03-01T00:00:00.000Z',
      metadata: {}
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_TOKEN
  })

  it('Runs the collect method', async () => {
    await run()
    // Verify that the action completed successfully
    expect(core.debug).toHaveBeenCalledWith('Action completed')
  })

  it('Runs the deployment-frequency method', async () => {
    // Set up inputs for deployment frequency
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'method':
          return 'deployment-frequency'
        case 'period':
          return 'week'
        case 'owner':
          return 'tied-inc'
        case 'repo':
          return 'repo-knowledge'
        case 'environment':
          return 'production'
        default:
          return ''
      }
    })

    // Mock deployments data
    const mockDeployments = [
      {
        provider: 'github',
        environment: 'production',
        sha: 'abc123',
        createdAt: '2025-02-25T00:00:00.000Z',
        updatedAt: '2025-02-25T00:00:00.000Z'
      }
    ]
    mockGetDeployments.mockImplementation(() =>
      Promise.resolve(mockDeployments)
    )

    await run()

    // Verify that the VCS provider was called with correct parameters
    expect(mockGetDeployments).toHaveBeenCalledWith(
      'tied-inc',
      'repo-knowledge',
      'production'
    )

    // Verify that the deployment frequency calculation was called
    expect(mockCalculateFrequency).toHaveBeenCalledWith(mockDeployments, {
      period: 'week',
      environment: 'production'
    })

    // Verify that outputs were set
    expect(core.setOutput).toHaveBeenCalledWith('frequency', '1.5')
    expect(core.setOutput).toHaveBeenCalledWith('unit', 'per_day')
    expect(core.setOutput).toHaveBeenCalledWith('period', 'week')
    expect(core.setOutput).toHaveBeenCalledWith('total_deployments', '10')
    expect(core.setOutput).toHaveBeenCalledWith(
      'start_date',
      '2025-02-22T00:00:00.000Z'
    )
    expect(core.setOutput).toHaveBeenCalledWith(
      'end_date',
      '2025-03-01T00:00:00.000Z'
    )

    // Verify that the action completed successfully
    expect(core.debug).toHaveBeenCalledWith('Action completed')
  })

  it('Handles missing owner and repo for deployment-frequency', async () => {
    // Set up inputs with missing owner and repo
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'method':
          return 'deployment-frequency'
        case 'period':
          return 'week'
        default:
          return ''
      }
    })

    await run()

    // Verify that the action failed with the correct error message
    expect(core.setFailed).toHaveBeenCalledWith(
      'Owner and repo are required for deployment-frequency method'
    )
  })

  it('Handles missing GitHub token for deployment-frequency', async () => {
    // Remove GitHub token from environment
    delete process.env.GITHUB_TOKEN

    // Set up inputs for deployment frequency
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'method':
          return 'deployment-frequency'
        case 'owner':
          return 'tied-inc'
        case 'repo':
          return 'repo-knowledge'
        default:
          return ''
      }
    })

    await run()

    // Verify that the action failed with the correct error message
    expect(core.setFailed).toHaveBeenCalledWith(
      'GITHUB_TOKEN is required for deployment-frequency method'
    )
  })

  it('Sets a failed status for invalid method', async () => {
    // Clear the getInput mock and return an invalid value.
    core.getInput.mockClear().mockReturnValueOnce('dummy')

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenCalledWith('Action failed')
  })
})
