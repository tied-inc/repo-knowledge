import * as core from '@actions/core'
import z from 'zod'

const schema = z.object({
  method: z.enum(['collect'])
})
type Input = z.infer<typeof schema>

const dispatchAction = (input: Input) => {
  switch (input.method) {
    case 'collect':
      break
  }
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
      method: core.getInput('method')
    })

    dispatchAction(input)

    core.debug('Action completed')
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) core.setFailed('Action failed')
  }
}
