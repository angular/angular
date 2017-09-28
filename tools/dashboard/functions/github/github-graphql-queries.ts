import {githubApiV4} from './github-api';

/** GraphQL query that finds all Pull Requests and their mergeable state. */
const getOpenPullRequestsWithMergeableStateQuery = `
 query getOpenPullRequestsWithMergeableState($lastCursor: String) {
   repository(owner: "angular", name: "material2") {
     pullRequests(states: OPEN, first: 100, after: $lastCursor) {
       pageInfo {
         hasNextPage,
         endCursor
       }
       nodes {
         number,
         mergeable
       }
     }
   }
 }`;

/** Pull Request node that will be returned by the Github V4 API. */
export interface PullRequestWithMergeableState {
  number: number;
  mergeable: string;
}

/** Queries the GitHub API to find all open pull requests and their mergeable state. */
export async function getOpenPullRequestsWithMergeableState()
    : Promise<PullRequestWithMergeableState[]> {
  const nodes: PullRequestWithMergeableState[] = [];
  let lastData: any|null = null;

  while (!lastData || lastData.repository.pullRequests.pageInfo.hasNextPage) {
    lastData = await githubApiV4.request(getOpenPullRequestsWithMergeableStateQuery, {
      lastCursor: lastData && lastData.repository.pullRequests.pageInfo.endCursor
    });

    nodes.push(...lastData.repository.pullRequests.nodes);
  }

  return nodes;
}


