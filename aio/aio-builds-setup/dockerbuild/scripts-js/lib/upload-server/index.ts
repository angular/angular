// TODO(gkalpak): Find more suitable way to run as `www-data`.
process.setuid('www-data');

// Imports
import {GithubPullRequests} from '../common/github-pull-requests';
import {getEnvVar} from '../common/utils';
import {CreatedBuildEvent} from './build-events';
import {uploadServerFactory} from './upload-server-factory';

// Constants
const AIO_BUILDS_DIR = getEnvVar('AIO_BUILDS_DIR');
const AIO_GITHUB_TOKEN = getEnvVar('AIO_GITHUB_TOKEN', true);
const AIO_REPO_SLUG = getEnvVar('AIO_REPO_SLUG', true);
const AIO_UPLOAD_HOSTNAME = getEnvVar('AIO_UPLOAD_HOSTNAME');
const AIO_UPLOAD_PORT = +getEnvVar('AIO_UPLOAD_PORT');

// Run
_main();

// Functions
function _main() {
  uploadServerFactory.
    create(AIO_BUILDS_DIR).
    on(CreatedBuildEvent.type, createOnBuildCreatedHanlder()).
    listen(AIO_UPLOAD_PORT, AIO_UPLOAD_HOSTNAME);
}

function createOnBuildCreatedHanlder() {
  if (!AIO_REPO_SLUG) {
    console.warn('No repo specified. Preview links will not be posted on PRs.');
    return () => null;
  }

  const githubPullRequests = new GithubPullRequests(AIO_REPO_SLUG, AIO_GITHUB_TOKEN);

  return ({pr, sha}: CreatedBuildEvent) => {
    const body = `The angular.io preview for ${sha.slice(0, 7)} is available [here][1].\n\n` +
                 `[1]: https://pr${pr}-${sha}.ngbuilds.io/`;

    githubPullRequests.addComment(pr, body);
  };
}
