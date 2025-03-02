import * as core from '@actions/core'
import z from 'zod'
import { createGitHubVCSProvider } from './infrastructure/vcs/github.js'
import { calculateDeploymentFrequency } from './infrastructure/metrics/deployment-frequency.js'
import type { Period } from './infrastructure/metrics/interface.js'

const schema = z.object({
  method: z.enum(['collect', 'deployment-frequency']),
  period: z.enum(['day', 'week', 'month']).optional(),
  environment: z.string().optional(),
  owner: z.string().optional(),
  repo: z.string().optional()
})
type Input = z.infer<typeof schema>

const dispatchAction = async (input: Input) => {
  switch (input.method) {
    case 'collect':
      break
    case 'deployment-frequency':
      await processDeploymentFrequency(input)
      break
  }
}

/**
 * Process deployment frequency calculation using GitHub deployments
 * @param input Action input parameters
 */
const processDeploymentFrequency = async (input: Input) => {
  if (!input.owner || !input.repo) {
    throw new Error(
      'Owner and repo are required for deployment-frequency method'
    )
  }

  const period = (input.period || 'week') as Period
  const environment = input.environment

  core.debug(
    `Calculating deployment frequency for ${input.owner}/${input.repo}`
  )
  core.debug(`Period: ${period}, Environment: ${environment || 'all'}`)

  // Get GitHub token from environment
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error('GITHUB_TOKEN is required for deployment-frequency method')
  }

  // Create GitHub VCS provider
  const vcsProvider = createGitHubVCSProvider(token)

  // Get deployments
  const deployments = await vcsProvider.getDeployments(
    input.owner,
    input.repo,
    environment
  )

  core.debug(`Found ${deployments.length} deployments`)

  // Calculate deployment frequency
  const result = calculateDeploymentFrequency(deployments, {
    period,
    environment
  })

  // Output results
  core.setOutput('frequency', result.value.toString())
  core.setOutput('unit', result.unit)
  core.setOutput('period', result.period)
  core.setOutput('total_deployments', result.totalDeployments.toString())
  core.setOutput('start_date', result.startDate)
  core.setOutput('end_date', result.endDate)

  // Log results
  core.info(`Deployment frequency: ${result.value} ${result.unit}`)
  core.info(`Total deployments: ${result.totalDeployments}`)
  core.info(
    `Period: ${result.period} (${result.startDate} to ${result.endDate})`
  )
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    core.debug('Starting action')
    const input = schema.parse({
      method: core.getInput('method'),
      period: core.getInput('period') || undefined,
      environment: core.getInput('environment') || undefined,
      owner: core.getInput('owner') || undefined,
      repo: core.getInput('repo') || undefined
    })

    await dispatchAction(input)

    core.debug('Action completed')
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) {
      // For Zod validation errors, use a generic message
      if (error.name === 'ZodError') {
        core.setFailed('Action failed')
      } else {
        core.setFailed(error.message)
      }
    } else {
      core.setFailed('Action failed')
    }
  }
}
