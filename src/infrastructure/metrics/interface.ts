// Generic metrics interfaces
export interface Deployment {
  provider: string
  environment: string
  sha: string
  createdAt: string
  updatedAt: string
}

export interface MetricsProvider {
  calculate: () => Promise<MetricsResult>
}

export interface MetricsResult {
  value: number
  unit: string
  startDate: string
  endDate: string
  metadata: Record<string, unknown>
}

export type Period = 'day' | 'week' | 'month'

export interface DeploymentFrequencyOptions {
  period: Period
  environment?: string
}

export interface DeploymentFrequencyResult extends MetricsResult {
  period: Period
  environment?: string
  totalDeployments: number
}

export interface DeploymentFrequencyProvider extends MetricsProvider {
  calculate: () => Promise<DeploymentFrequencyResult>
}
