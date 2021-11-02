#!/usr/bin/env node

/**
 * Fetches a specified artifact by name from the given workflow and writes
 * the downloaded zip file to the stdout.
 *
 * Command line usage:
 *   ./fetch-workflow-artifact.js <gh-token> <workflow-id> <artifact-name>
 */

import octokit from '@octokit/rest';

async function main() {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/', 2);
  const [token, workflowId, artifactName] = process.argv.slice(2);
  const github = new octokit.Octokit({auth: token});
  const artifacts = await github.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: workflowId,
  });

  const matchArtifact = artifacts.data.artifacts.find(artifact => artifact.name === artifactName);

  const download = await github.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: matchArtifact.id,
    archive_format: 'zip',
  });

  process.stdout.write(Buffer.from(download.data));
}

await main();
