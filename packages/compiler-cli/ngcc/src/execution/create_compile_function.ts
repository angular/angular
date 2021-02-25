
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {replaceTsWithNgInErrors} from '../../../src/ngtsc/diagnostics';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {ParsedConfiguration} from '../../../src/perform_compile';
import {getEntryPointFormat} from '../packages/entry_point';
import {makeEntryPointBundle} from '../packages/entry_point_bundle';
import {createModuleResolutionCache, SharedFileCache} from '../packages/source_file_cache';
import {PathMappings} from '../path_mappings';
import {FileWriter} from '../writing/file_writer';

import {CreateCompileFn} from './api';
import {Task, TaskProcessingOutcome} from './tasks/api';

/**
 * The function for creating the `compile()` function.
 */
export function getCreateCompileFn(
    fileSystem: FileSystem, logger: Logger, fileWriter: FileWriter,
    enableI18nLegacyMessageIdFormat: boolean, tsConfig: ParsedConfiguration|null,
    pathMappings: PathMappings|undefined): CreateCompileFn {
  return (beforeWritingFiles, onTaskCompleted) => {
    const {Transformer} = require('../packages/transformer');
    const transformer = new Transformer(fileSystem, logger, tsConfig);
    const sharedFileCache = new SharedFileCache(fileSystem);
    const moduleResolutionCache = createModuleResolutionCache(fileSystem);

    return (task: Task) => {
      const {entryPoint, formatProperty, formatPropertiesToMarkAsProcessed, processDts} = task;

      const isCore = entryPoint.name === '@angular/core';  // Are we compiling the Angular core?
      const packageJson = entryPoint.packageJson;
      const formatPath = packageJson[formatProperty];
      const format = getEntryPointFormat(fileSystem, entryPoint, formatProperty);

      // All properties listed in `propertiesToProcess` are guaranteed to point to a format-path
      // (i.e. they are defined in `entryPoint.packageJson`). Furthermore, they are also guaranteed
      // to be among `SUPPORTED_FORMAT_PROPERTIES`.
      // Based on the above, `formatPath` should always be defined and `getEntryPointFormat()`
      // should always return a format here (and not `undefined`) unless `formatPath` points to a
      // missing or empty file.
      if (!formatPath || !format) {
        onTaskCompleted(
            task, TaskProcessingOutcome.Failed,
            `property \`${formatProperty}\` pointing to a missing or empty file: ${formatPath}`);
        return;
      }

      logger.info(`Compiling ${entryPoint.name} : ${formatProperty} as ${format}`);

      const bundle = makeEntryPointBundle(
          fileSystem, entryPoint, sharedFileCache, moduleResolutionCache, formatPath, isCore,
          format, processDts, pathMappings, true, enableI18nLegacyMessageIdFormat);

      const result = transformer.transform(bundle);
      if (result.success) {
        if (result.diagnostics.length > 0) {
          logger.warn(replaceTsWithNgInErrors(
              ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host)));
        }

        const writeBundle = () => {
          fileWriter.writeBundle(
              bundle, result.transformedFiles, formatPropertiesToMarkAsProcessed);

          logger.debug(`  Successfully compiled ${entryPoint.name} : ${formatProperty}`);
          onTaskCompleted(task, TaskProcessingOutcome.Processed, null);
        };

        const beforeWritingResult = beforeWritingFiles(result.transformedFiles);

        return (beforeWritingResult instanceof Promise) ?
            beforeWritingResult.then(writeBundle) as ReturnType<typeof beforeWritingFiles>:
            writeBundle();
      } else {
        const errors = replaceTsWithNgInErrors(
            ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host));
        onTaskCompleted(task, TaskProcessingOutcome.Failed, `compilation errors:\n${errors}`);
      }
    };
  };
}
