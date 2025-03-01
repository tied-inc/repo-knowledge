/**
 * Interface for metrics providers
 */

/**
 * Period type for metrics calculation
 * @typedef {'day' | 'week' | 'month'} Period
 */

/**
 * Generic metrics provider interface
 * @template T
 * @interface
 */
export class MetricsProvider {
  /**
   * Calculate metrics
   * @returns {Promise<T>} Metrics result
   */
  async calculate() {
    throw new Error('Not implemented')
  }
}

/**
 * Generic metrics result interface
 * @interface
 */
export class MetricsResult {
  /**
   * Numeric value of the metric
   * @type {number}
   */
  value

  /**
   * Unit of measurement
   * @type {string}
   */
  unit

  /**
   * Period of calculation
   * @type {Period}
   */
  period

  /**
   * Additional metadata
   * @type {Record<string, any>}
   */
  metadata
}

/**
 * Options for deployment frequency calculation
 * @interface
 */
export class DeploymentFrequencyOptions {
  /**
   * Period for calculation
   * @type {Period}
   */
  period

  /**
   * Environment to filter deployments
   * @type {string|undefined}
   */
  environment
}

/**
 * Result of deployment frequency calculation
 * @interface
 * @extends {MetricsResult}
 */
export class DeploymentFrequencyResult extends MetricsResult {
  /**
   * Environment used for calculation
   * @type {string|undefined}
   */
  environment

  /**
   * Total number of deployments in the period
   * @type {number}
   */
  totalDeployments

  /**
   * Start date of the period
   * @type {string}
   */
  startDate

  /**
   * End date of the period
   * @type {string}
   */
  endDate
}

/**
 * Provider for deployment frequency metrics
 * @interface
 * @extends {MetricsProvider<DeploymentFrequencyResult>}
 */
export class DeploymentFrequencyProvider extends MetricsProvider {}
