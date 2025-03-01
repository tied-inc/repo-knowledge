/**
 * Period type for metrics calculation
 */
export type Period = 'day' | 'week' | 'month'

/**
 * Generic metrics provider interface
 */
export interface MetricsProvider {
  calculate: () => Promise<MetricsResult>
}

/**
 * Generic metrics result interface
 */
export interface MetricsResult {
  value: number
  unit: string
  startDate: string
  endDate: string
  metadata: Record<string, unknown>
}

/**
 * Options for deployment frequency calculation
 */
export interface DeploymentFrequencyOptions {
  period: Period
  environment?: string
}

/**
 * Result of deployment frequency calculation
 */
export interface DeploymentFrequencyResult extends MetricsResult {
  period: Period
  environment?: string
  totalDeployments: number
}

/**
 * Provider for deployment frequency metrics
 */
export interface DeploymentFrequencyProvider extends MetricsProvider {
  calculate: () => Promise<DeploymentFrequencyResult>
}
