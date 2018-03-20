// Imports
import {getEnvVar} from '../common/utils';
import {uploadServerFactory} from './upload-server-factory';

// Constants
const AIO_BUILDS_DIR = getEnvVar('AIO_BUILDS_DIR');
const AIO_DOMAIN_NAME = getEnvVar('AIO_DOMAIN_NAME');
const AIO_GITHUB_ORGANIZATION = getEnvVar('AIO_GITHUB_ORGANIZATION');
const AIO_GITHUB_TEAM_SLUGS = getEnvVar('AIO_GITHUB_TEAM_SLUGS');
const AIO_GITHUB_TOKEN = getEnvVar('AIO_GITHUB_TOKEN');
const AIO_PREVIEW_DEPLOYMENT_TOKEN = getEnvVar('AIO_PREVIEW_DEPLOYMENT_TOKEN');
const AIO_REPO_SLUG = getEnvVar('AIO_REPO_SLUG');
const AIO_TRUSTED_PR_LABEL = getEnvVar('AIO_TRUSTED_PR_LABEL');
const AIO_UPLOAD_HOSTNAME = getEnvVar('AIO_UPLOAD_HOSTNAME');
const AIO_UPLOAD_PORT = +getEnvVar('AIO_UPLOAD_PORT');

// Run
_main();

// Functions
function _main() {
  uploadServerFactory.
    create({
      buildsDir: AIO_BUILDS_DIR,
      domainName: AIO_DOMAIN_NAME,
      githubOrganization: AIO_GITHUB_ORGANIZATION,
      githubTeamSlugs: AIO_GITHUB_TEAM_SLUGS.split(','),
      githubToken: AIO_GITHUB_TOKEN,
      repoSlug: AIO_REPO_SLUG,
      secret: AIO_PREVIEW_DEPLOYMENT_TOKEN,
      trustedPrLabel: AIO_TRUSTED_PR_LABEL,
    }).
    listen(AIO_UPLOAD_PORT, AIO_UPLOAD_HOSTNAME);
}
