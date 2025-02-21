# GitHub Deployment Data Retrieval

This document describes the implementation of GitHub deployment data retrieval
functionality in the repo-knowledge project.

## Overview

The implementation provides a way to fetch deployment data from GitHub's API
using a functional approach with closures instead of classes. It follows
TypeScript best practices with interface-based type definitions.

## Architecture

### Type Definitions (`src/infrastructure/vcs/interface.ts`)

```typescript
// Core interfaces for deployment data
export interface GitHubDeployment {
  id: number
  sha: string
  ref: string
  task: string
  environment: string
  description: string | null
  creator: {
    login: string
    id: number
  }
  created_at: string
  updated_at: string
  statuses_url: string
  repository_url: string
}

export interface DeploymentStatus {
  id: number
  deployment_id: number
  state: 'pending' | 'success' | 'failure' | 'error' | 'inactive'
  creator: {
    login: string
    id: number
  }
  description: string | null
  environment: string
  created_at: string
  updated_at: string
}

// Provider interface for VCS implementations
export interface VCSProvider {
  getDeployments: (
    owner: string,
    repo: string,
    environment?: string
  ) => Promise<GitHubDeployment[]>
  getDeploymentStatus: (
    owner: string,
    repo: string,
    deployment_id: number
  ) => Promise<DeploymentStatus[]>
}
```

### Implementation (`src/infrastructure/vcs/github.ts`)

The implementation uses a closure pattern for better encapsulation:

```typescript
export const createGitHubVCSProvider = (token?: string): VCSProvider => {
  // Private Octokit instance
  const octokit = new Octokit({ auth: token })

  // Public methods
  return {
    getDeployments: async (owner, repo, environment?) => {
      const { data } = await octokit.repos.listDeployments({
        owner,
        repo,
        ...(environment ? { environment } : {})
      })
      return data.map(/* ... */)
    },
    getDeploymentStatus: async (owner, repo, deployment_id) => {
      const { data } = await octokit.repos.listDeploymentStatuses({
        owner,
        repo,
        deployment_id
      })
      return data.map(/* ... */)
    }
  }
}
```

## Usage

```typescript
// Create a provider instance
const provider = createGitHubVCSProvider()

// Fetch deployments
const deployments = await provider.getDeployments('owner', 'repo')

// Fetch deployment status
const statuses = await provider.getDeploymentStatus(
  'owner',
  'repo',
  deploymentId
)
```

## Design Decisions

1. **Closure Pattern**: Used instead of classes to:

   - Maintain private state (Octokit instance)
   - Provide a functional approach
   - Simplify the public interface

2. **Interface-Based Types**: The project uses TypeScript interfaces for type
   definitions to:

   - Ensure consistent data structures
   - Enable easy extension for other VCS providers
   - Provide better type safety and IDE support

3. **Error Handling**: The implementation:
   - Preserves GitHub API error messages
   - Uses TypeScript type guards for better error handling
   - Maintains type safety with proper GitHub API response types

## Testing

Tests are implemented in `__tests__/infrastructure/vcs/github.test.ts` and run
against the actual GitHub API to ensure real-world compatibility.

## CI/CD Integration

The implementation includes necessary GitHub Actions permissions
(`deployments: read`) to enable deployment data access during CI/CD workflows.
