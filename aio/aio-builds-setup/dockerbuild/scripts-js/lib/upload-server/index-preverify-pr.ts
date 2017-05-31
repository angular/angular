// Imports
import {getEnvVar} from '../common/utils';
import {BuildVerifier} from './build-verifier';

// Run
_main();

// Functions
function _main() {
  const secret = 'unused';
  const githubToken = getEnvVar('AIO_GITHUB_TOKEN');
  const repoSlug = getEnvVar('AIO_REPO_SLUG');
  const organization = getEnvVar('AIO_GITHUB_ORGANIZATION');
  const allowedTeamSlugs = getEnvVar('AIO_GITHUB_TEAM_SLUGS').split(',');
  const pr = +getEnvVar('AIO_PREVERIFY_PR');

  const buildVerifier = new BuildVerifier(secret, githubToken, repoSlug, organization, allowedTeamSlugs);

  // Exit codes:
  // - 0: The PR author is a member.
  // - 1: An error occurred.
  // - 2: The PR author is not a member.
  buildVerifier.getPrAuthorTeamMembership(pr).
    then(({author, isMember}) => {
      if (isMember) {
        process.exit(0);
      } else {
        const errorMessage = `User '${author}' is not an active member of any of the following teams: ` +
                             `${allowedTeamSlugs.join(', ')}`;
        onError(errorMessage, 2);
      }
    }).
    catch(err => onError(err, 1));
}

function onError(err: string, exitCode: number) {
  console.error(err);
  process.exit(exitCode || 1);
}
