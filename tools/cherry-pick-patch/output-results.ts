import {PullsGetResponse} from '@octokit/rest';
import {cyan} from 'chalk';

/** Outputs the information of the pull requests to be cherry-picked and the commands to run. */
export function outputResults(pullRequests: PullsGetResponse[]) {
  if (!pullRequests.length) {
    console.log('No pull requests need to be cherry-picked');
    return;
  }

  console.log();
  console.log(cyan('------------------------'));
  console.log(cyan('  Results '));
  console.log(cyan('------------------------'));
  console.log();

  pullRequests.forEach(p => {
    const data = [p.number, p.merged_at, p.merge_commit_sha, p.html_url, p.title];
    console.log(data.join('\t'));
  });

  console.log();
  console.log(cyan('------------------------'));
  console.log(cyan('  Cherry Pick Commands'));
  console.log(cyan('------------------------'));

  pullRequests.forEach((pr, index) => {
    if (index % 5 === 0) {
      console.log();
    }

    console.log(`git cherry-pick -x ${pr.merge_commit_sha};`);
  });
}
