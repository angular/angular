// Imports
import {AIO_DOWNLOADS_DIR} from '../common/constants';
import {
  AIO_ARTIFACT_MAX_SIZE,
  AIO_ARTIFACT_PATH,
  AIO_BUILDS_DIR,
  AIO_CIRCLE_CI_TOKEN,
  AIO_DOMAIN_NAME,
  AIO_GITHUB_ORGANIZATION,
  AIO_GITHUB_REPO,
  AIO_GITHUB_TEAM_SLUGS,
  AIO_GITHUB_TOKEN,
  AIO_PREVIEW_SERVER_HOSTNAME,
  AIO_PREVIEW_SERVER_PORT,
  AIO_SIGNIFICANT_FILES_PATTERN,
  AIO_TRUSTED_PR_LABEL,
} from '../common/env-variables';
import {PreviewServerFactory} from './preview-server-factory';

// Run
_main();

// Functions
function _main(): void {
  PreviewServerFactory
    .create({
      buildArtifactPath: AIO_ARTIFACT_PATH,
      buildsDir: AIO_BUILDS_DIR,
      circleCiToken: AIO_CIRCLE_CI_TOKEN,
      domainName: AIO_DOMAIN_NAME,
      downloadSizeLimit: AIO_ARTIFACT_MAX_SIZE,
      downloadsDir: AIO_DOWNLOADS_DIR,
      githubOrg: AIO_GITHUB_ORGANIZATION,
      githubRepo: AIO_GITHUB_REPO,
      githubTeamSlugs: AIO_GITHUB_TEAM_SLUGS.split(','),
      githubToken: AIO_GITHUB_TOKEN,
      significantFilesPattern: AIO_SIGNIFICANT_FILES_PATTERN,
      trustedPrLabel: AIO_TRUSTED_PR_LABEL,
    })
    .listen(AIO_PREVIEW_SERVER_PORT, AIO_PREVIEW_SERVER_HOSTNAME);
}
