import {
  calculateDeploymentFrequency,
  createDeploymentFrequencyProvider
} from '../../../src/infrastructure/metrics/deployment-frequency'
import type { Deployment } from '../../../src/infrastructure/vcs/interface'

describe('Deployment Frequency', () => {
  // Mock deployment data
  const createMockDeployment = (
    createdAt: string,
    environment = 'production'
  ): Deployment => ({
    provider: 'github',
    environment,
    sha: 'abc123',
    createdAt,
    updatedAt: createdAt
  })

  // Create a series of deployments over the last month
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const twoWeeksAgo = new Date(now)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const lastMonth = new Date(now)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  const mockDeployments: Deployment[] = [
    createMockDeployment(now.toISOString()),
    createMockDeployment(yesterday.toISOString()),
    createMockDeployment(twoDaysAgo.toISOString()),
    createMockDeployment(lastWeek.toISOString()),
    createMockDeployment(twoWeeksAgo.toISOString()),
    createMockDeployment(lastMonth.toISOString()),
    // Add a staging deployment
    createMockDeployment(yesterday.toISOString(), 'staging')
  ]

  describe('calculateDeploymentFrequency', () => {
    it('should calculate daily deployment frequency', () => {
      const result = calculateDeploymentFrequency(mockDeployments, {
        period: 'day'
      })

      expect(result.value).toBe(1) // 1 deployment today
      expect(result.unit).toBe('per_day')
      expect(result.period).toBe('day')
      expect(result.totalDeployments).toBe(1)
      expect(result.startDate).toBeDefined()
      expect(result.endDate).toBeDefined()
    })

    it('should calculate weekly deployment frequency', () => {
      const result = calculateDeploymentFrequency(mockDeployments, {
        period: 'week'
      })

      expect(result.value).toBe(4 / 7) // 4 deployments in the last week
      expect(result.unit).toBe('per_day')
      expect(result.period).toBe('week')
      expect(result.totalDeployments).toBe(4)
      expect(result.startDate).toBeDefined()
      expect(result.endDate).toBeDefined()
    })

    it('should calculate monthly deployment frequency', () => {
      const result = calculateDeploymentFrequency(mockDeployments, {
        period: 'month'
      })

      expect(result.value).toBe(6 / 30) // 6 deployments in the last month
      expect(result.unit).toBe('per_day')
      expect(result.period).toBe('month')
      expect(result.totalDeployments).toBe(6)
      expect(result.startDate).toBeDefined()
      expect(result.endDate).toBeDefined()
    })

    it('should filter deployments by environment', () => {
      const result = calculateDeploymentFrequency(mockDeployments, {
        period: 'week',
        environment: 'staging'
      })

      expect(result.value).toBe(1 / 7) // 1 staging deployment in the last week
      expect(result.environment).toBe('staging')
      expect(result.totalDeployments).toBe(1)
    })

    it('should handle empty deployments array', () => {
      const result = calculateDeploymentFrequency([], {
        period: 'week'
      })

      expect(result.value).toBe(0)
      expect(result.totalDeployments).toBe(0)
    })

    it('should handle no deployments in the period', () => {
      // Create deployments from 2 months ago
      const twoMonthsAgo = new Date(now)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

      const oldDeployments = [createMockDeployment(twoMonthsAgo.toISOString())]

      const result = calculateDeploymentFrequency(oldDeployments, {
        period: 'week'
      })

      expect(result.value).toBe(0)
      expect(result.totalDeployments).toBe(0)
    })
  })

  describe('createDeploymentFrequencyProvider', () => {
    it('should create a provider that calculates deployment frequency', async () => {
      const provider = createDeploymentFrequencyProvider(mockDeployments, {
        period: 'week'
      })

      const result = await provider.calculate()

      expect(result.value).toBe(4 / 7) // 4 deployments in the last week
      expect(result.unit).toBe('per_day')
      expect(result.period).toBe('week')
      expect(result.totalDeployments).toBe(4)
    })
  })
})
