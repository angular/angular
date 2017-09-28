import {https} from 'firebase-functions';
import {getOpenPullRequestsWithMergeableState} from './github/github-graphql-queries';

/**
 * Firebase HTTP trigger that responds with a list of Pull Requests that have merge conflicts.
 */
export const pullRequestsWithConflicts = https.onRequest(async (_request, response) => {
  const pullRequests = (await getOpenPullRequestsWithMergeableState())
    .filter(pullRequest => pullRequest.mergeable === 'CONFLICTING');

  response.status(200).json(pullRequests);
});

