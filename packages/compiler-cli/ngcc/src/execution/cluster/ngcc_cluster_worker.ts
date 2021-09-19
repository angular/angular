/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommandLineOptions} from '../../command_line_options';
import {getSharedSetup} from '../../ngcc_options';
import {getCreateCompileFn} from '../create_compile_function';

import {ClusterWorkerPackageJsonUpdater} from './package_json_updater';
import {startWorker} from './worker';

// Cluster worker entry point
(async () => {
  process.title = 'ngcc (worker)';

  try {
    const {
      logger,
      pathMappings,
      enableI18nLegacyMessageIdFormat,
      fileSystem,
      tsConfig,
      getFileWriter,
    } = getSharedSetup(parseCommandLineOptions(process.argv.slice(2)));

    // NOTE: To avoid file corruption, `ngcc` invocation only creates _one_ instance of
    // `PackageJsonUpdater` that actually writes to disk (across all processes).
    // In cluster workers we use a `PackageJsonUpdater` that delegates to the cluster master.
    const pkgJsonUpdater = new ClusterWorkerPackageJsonUpdater();
    const fileWriter = getFileWriter(pkgJsonUpdater);

    // The function for creating the `compile()` function.
    const createCompileFn = getCreateCompileFn(
        fileSystem, logger, fileWriter, enableI18nLegacyMessageIdFormat, tsConfig, pathMappings);

    await startWorker(logger, createCompileFn);
    process.exitCode = 0;
  } catch (e) {
    console.error(e.stack || e.message);
    process.exit(1);
  }
})();
