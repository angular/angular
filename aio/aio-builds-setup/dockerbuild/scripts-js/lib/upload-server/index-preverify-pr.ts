// Imports
import {GithubApi} from '../common/github-api';
import {GithubPullRequests} from '../common/github-pull-requests';
import {GithubTeams} from '../common/github-teams';
import {getEnvVar} from '../common/utils';
import {BuildVerifier} from './build-verifier';

// Run
_main();

// Functions
function _main() {
  const githubToken = getEnvVar('AIO_GITHUB_TOKEN');
  const githubOrg = getEnvVar('AIO_GITHUB_ORGANIZATION');
  const githubRepo = getEnvVar('AIO_GITHUB_REPO');
  const allowedTeamSlugs = getEnvVar('AIO_GITHUB_TEAM_SLUGS').split(',');
  const trustedPrLabel = getEnvVar('AIO_TRUSTED_PR_LABEL');
  const pr = +getEnvVar('AIO_PREVERIFY_PR');

  const githubApi = new GithubApi(githubToken);
  const prs = new GithubPullRequests(githubApi, githubOrg, githubRepo);
  const teams = new GithubTeams(githubApi, githubOrg);
  const buildVerifier = new BuildVerifier(prs, teams, allowedTeamSlugs, trustedPrLabel);

  // Exit codes:
  // - 0: The PR can be automatically trusted (i.e. author belongs to trusted team or PR has the "trusted PR" label).
  // - 1: An error occurred.
  // - 2: The PR cannot be automatically trusted.
  buildVerifier.getPrIsTrusted(pr).
    then(isTrusted => {
      if (!isTrusted) {
        console.warn(
            `The PR cannot be automatically verified, because it doesn't have the "${trustedPrLabel}" label and the ` +
            `the author is not an active member of any of the following teams: ${allowedTeamSlugs.join(', ')}`);
      }

      process.exit(isTrusted ? 0 : 2);
    }).
    catch(err => {
      console.error(err);
      process.exit(1);
    });
}
