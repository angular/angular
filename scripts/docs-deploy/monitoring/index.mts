import {$, cd} from 'zx';

import {ProductionDeployment} from '../deploy-to-site.mjs';
import {cloneDocsRepositoryForMajor} from '../clone-docs-repo.mjs';
import {ActiveReleaseTrains} from '@angular/ng-dev';
import {getReleaseRepoWithApi} from '../github-versioning.mjs';
import {installDepsForDocsSite} from '../docs-deps-install.mjs';
import {sites} from '../utils.mjs';

/**
 * Runs monitoring tests for the given docs repository, ensuring that the
 * specified remote URL is properly functioning.
 */
export async function runMonitorTests(docsRepoDir: string, remoteUrl: string) {
  cd(docsRepoDir);

  await $`node ./tools/audit-docs.js ${remoteUrl}`;
}

/** Runs the monitoring tests for the stable release train. */
export async function runMonitorTestsForStable() {
  const repo = await getReleaseRepoWithApi();
  const active = await ActiveReleaseTrains.fetch(repo);
  const stableMajor = active.latest.version.major;
  const docsRepoDir = await cloneDocsRepositoryForMajor(stableMajor);

  await installDepsForDocsSite(docsRepoDir);
  await runMonitorTests(docsRepoDir, sites.stable.remoteUrl);
}

/** Runs monitoring tests for all specified production deployments. */
export async function runMonitoringTests(docsRepoDir: string, targets: ProductionDeployment[]) {
  for (const target of targets) {
    await runMonitorTests(docsRepoDir, target.site.remoteUrl);
  }
}
