/**
 * Deployment frequency calculation implementation
 */

/**
 * Calculate deployment frequency from deployment data
 * @param {import('../vcs/interface.js').Deployment[]} deployments Array of deployments
 * @param {import('./interface.js').DeploymentFrequencyOptions} options Options for calculation
 * @returns {import('./interface.js').DeploymentFrequencyResult} Deployment frequency result
 */
export const calculateDeploymentFrequency = (deployments, options) => {
  // Filter deployments by environment if specified
  const filteredDeployments = options.environment
    ? deployments.filter((d) => d.environment === options.environment)
    : deployments

  // Sort deployments by creation date
  const sortedDeployments = [...filteredDeployments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  // If no deployments, return zero frequency
  if (sortedDeployments.length === 0) {
    const now = new Date()
    const startDate = getPeriodStartDate(now, options.period)

    return {
      value: 0,
      unit: getFrequencyUnit(),
      period: options.period,
      environment: options.environment,
      totalDeployments: 0,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      metadata: {}
    }
  }

  // Calculate start and end dates
  const endDate = new Date()
  const startDate = getPeriodStartDate(endDate, options.period)

  // Filter deployments within the period
  const deploymentsInPeriod = sortedDeployments.filter(
    (d) =>
      new Date(d.createdAt) >= startDate && new Date(d.createdAt) <= endDate
  )

  // Calculate frequency
  const totalDeployments = deploymentsInPeriod.length
  const frequency = calculateFrequencyValue(totalDeployments, options.period)

  return {
    value: frequency,
    unit: getFrequencyUnit(),
    period: options.period,
    environment: options.environment,
    totalDeployments,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    metadata: {
      deploymentDates: deploymentsInPeriod.map((d) => d.createdAt)
    }
  }
}

/**
 * Get the start date for a period
 * @param {Date} endDate End date
 * @param {import('./interface.js').Period} period Period type
 * @returns {Date} Start date
 */
const getPeriodStartDate = (endDate, period) => {
  const startDate = new Date(endDate)

  switch (period) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1)
      break
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
  }

  return startDate
}

/**
 * Calculate frequency value based on period
 * @param {number} totalDeployments Total number of deployments
 * @param {import('./interface.js').Period} period Period type
 * @returns {number} Frequency value
 */
const calculateFrequencyValue = (totalDeployments, period) => {
  switch (period) {
    case 'day':
      return totalDeployments // deployments per day
    case 'week':
      return totalDeployments / 7 // average deployments per day over a week
    case 'month':
      return totalDeployments / 30 // average deployments per day over a month
  }
}

/**
 * Get frequency unit based on period
 * @returns {string} Frequency unit
 */
const getFrequencyUnit = () => {
  return 'per_day' // We always return frequency per day
}

/**
 * Create a deployment frequency provider
 * @param {import('../vcs/interface.js').Deployment[]} deployments Array of deployments
 * @param {import('./interface.js').DeploymentFrequencyOptions} options Options for calculation
 * @returns {import('./interface.js').DeploymentFrequencyProvider} Deployment frequency provider
 */
export const createDeploymentFrequencyProvider = (deployments, options) => {
  return {
    calculate: async () => {
      return calculateDeploymentFrequency(deployments, options)
    }
  }
}
