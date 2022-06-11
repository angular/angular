import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {$} from 'zx';
import {SiteTarget} from './utils.mjs';

interface Deployment {
  projectId: string;
  site: SiteTarget;
}

/** Interface describing a production deployment. */
export interface ProductionDeployment extends Deployment {
  description: string;
}

/** Interface describing a temporary preview deployment. */
export interface PreviewDeployment extends Deployment {
  channelId: string;
  expires: string;
}

/** Type describing a Firebase deployment. */
export type DeploymentInfo = ProductionDeployment | PreviewDeployment;

/** Path to a temporary file for the GCP service key credentials file. */
const gcpServiceKeyTmpFile = path.join(os.tmpdir(), 'mat-docs-deploy-gcp-key.json');

/**
 * Deploys the docs site at the specified directory to Firebase with respect
 * to the deployment information provided.
 *
 * The deployment info either describes the production deployment information,
 * or a preview temporary deployment that will expire automatically.
 */
export async function deployToSite(
  projectPath: string,
  firebaseServiceKey: string,
  info: DeploymentInfo,
) {
  const firebase = async (...cmd: string[]) =>
    $`yarn --cwd ${projectPath} firebase --non-interactive ${cmd}`;

  // Setup GCP service key for the docs-app deployment.
  // https://firebase.google.com/docs/admin/setup.
  await fs.promises.writeFile(gcpServiceKeyTmpFile, firebaseServiceKey);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = gcpServiceKeyTmpFile;

  await firebase('use', info.projectId);
  await firebase('target:clear', 'hosting', 'mat-aio');
  await firebase('target:apply', 'hosting', 'mat-aio', info.site.firebaseSiteId);

  if (isPreviewDeployment(info)) {
    const channelId = info.channelId;
    const expires = info.expires;

    await firebase('hosting:channel:deploy', channelId, '--only', 'mat-aio', '--expires', expires);
  } else {
    await firebase('deploy', '--only', 'hosting:mat-aio', '--message', info.description);
  }

  // Remove the temporary service key file (this is an optional step and just for sanity).
  await fs.promises.rm(gcpServiceKeyTmpFile, {force: true});
}

/** Whether the given deployment info corresponds to a preview deployment. */
export function isPreviewDeployment(info: DeploymentInfo): info is PreviewDeployment {
  return (info as Partial<PreviewDeployment>).channelId !== undefined;
}

/** Whether the given deployment info corresponds to a production deployment. */
export function isProductionDeployment(info: DeploymentInfo): info is ProductionDeployment {
  return !isPreviewDeployment(info);
}
