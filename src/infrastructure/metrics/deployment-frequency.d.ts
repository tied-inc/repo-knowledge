import type { Deployment } from '../vcs/interface.js'
import type {
  DeploymentFrequencyOptions,
  DeploymentFrequencyProvider,
  DeploymentFrequencyResult
} from './interface.js'

/**
 * Calculate deployment frequency from deployment data
 * @param deployments Array of deployments
 * @param options Options for calculation
 * @returns Deployment frequency result
 */
export function calculateDeploymentFrequency(
  deployments: Deployment[],
  options: DeploymentFrequencyOptions
): DeploymentFrequencyResult

/**
 * Create a deployment frequency provider
 * @param deployments Array of deployments
 * @param options Options for calculation
 * @returns Deployment frequency provider
 */
export function createDeploymentFrequencyProvider(
  deployments: Deployment[],
  options: DeploymentFrequencyOptions
): DeploymentFrequencyProvider
