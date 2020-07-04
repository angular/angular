/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />

import * as cluster from 'cluster';

import {Logger} from '../../../../src/ngtsc/logging';
import {parseCommandLineOptions} from '../../command_line_options';
import {getSharedSetup} from '../../ngcc_options';
import {CreateCompileFn} from '../api';
import {getCreateCompileFn} from '../create_compile_function';
import {stringifyTask} from '../tasks/utils';

import {MessageToWorker} from './api';
import {ClusterWorkerPackageJsonUpdater} from './package_json_updater';
import {sendMessageToMaster} from './utils';

// Cluster worker entry point
if (require.main === module) {
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
}

export async function startWorker(logger: Logger, createCompileFn: CreateCompileFn): Promise<void> {
  if (cluster.isMaster) {
    throw new Error('Tried to run cluster worker on the master process.');
  }

  const compile = createCompileFn(
      transformedFiles => sendMessageToMaster({
        type: 'transformed-files',
        files: transformedFiles.map(f => f.path),
      }),
      (_task, outcome, message) => sendMessageToMaster({type: 'task-completed', outcome, message}));


  // Listen for `ProcessTaskMessage`s and process tasks.
  cluster.worker.on('message', async (msg: MessageToWorker) => {
    try {
      switch (msg.type) {
        case 'process-task':
          logger.debug(
              `[Worker #${cluster.worker.id}] Processing task: ${stringifyTask(msg.task)}`);
          return await compile(msg.task);
        default:
          throw new Error(
              `[Worker #${cluster.worker.id}] Invalid message received: ${JSON.stringify(msg)}`);
      }
    } catch (err) {
      switch (err && err.code) {
        case 'ENOMEM':
          // Not being able to allocate enough memory is not necessarily a problem with processing
          // the current task. It could just mean that there are too many tasks being processed
          // simultaneously.
          //
          // Exit with an error and let the cluster master decide how to handle this.
          logger.warn(`[Worker #${cluster.worker.id}] ${err.stack || err.message}`);
          return process.exit(1);
        default:
          await sendMessageToMaster({
            type: 'error',
            error: (err instanceof Error) ? (err.stack || err.message) : err,
          });
      }
    }
  });

  // Return a promise that is never resolved.
  return new Promise(() => undefined);
}
