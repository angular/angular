
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {replaceTsWithNgInErrors} from '../../../src/ngtsc/diagnostics';
import {FileSystem} from '../../../src/ngtsc/file_system';
import {ParsedConfiguration} from '../../../src/perform_compile';
import {Logger} from '../logging/logger';
import {PathMappings} from '../ngcc_options';
import {getEntryPointFormat} from '../packages/entry_point';
import {makeEntryPointBundle} from '../packages/entry_point_bundle';
import {FileWriter} from '../writing/file_writer';
import {InPlaceFileWriter} from '../writing/in_place_file_writer';
import {NewEntryPointFileWriter} from '../writing/new_entry_point_file_writer';
import {PackageJsonUpdater} from '../writing/package_json_updater';

import {CreateCompileFn} from './api';
import {Task, TaskProcessingOutcome} from './tasks/api';

/**
 * The function for creating the `compile()` function.
 */
export function getCreateCompileFn(
    fileSystem: FileSystem, logger: Logger, pkgJsonUpdater: PackageJsonUpdater,
    createNewEntryPointFormats: boolean, errorOnFailedEntryPoint: boolean,
    enableI18nLegacyMessageIdFormat: boolean, tsConfig: ParsedConfiguration|null,
    pathMappings: PathMappings|undefined): CreateCompileFn {
  return onTaskCompleted => {
    const fileWriter = getFileWriter(
        fileSystem, logger, pkgJsonUpdater, createNewEntryPointFormats, errorOnFailedEntryPoint);
    const {Transformer} = require('../packages/transformer');
    const transformer = new Transformer(fileSystem, logger, tsConfig);

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
      // should always return a format here (and not `undefined`).
      if (!formatPath || !format) {
        // This should never happen.
        throw new Error(
            `Invariant violated: No format-path or format for ${entryPoint.path} : ` +
            `${formatProperty} (formatPath: ${formatPath} | format: ${format})`);
      }

      const bundle = makeEntryPointBundle(
          fileSystem, entryPoint, formatPath, isCore, format, processDts, pathMappings, true,
          enableI18nLegacyMessageIdFormat);

      logger.info(`Compiling ${entryPoint.name} : ${formatProperty} as ${format}`);

      const result = transformer.transform(bundle);
      if (result.success) {
        if (result.diagnostics.length > 0) {
          logger.warn(replaceTsWithNgInErrors(
              ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host)));
        }
        fileWriter.writeBundle(bundle, result.transformedFiles, formatPropertiesToMarkAsProcessed);

        logger.debug(`  Successfully compiled ${entryPoint.name} : ${formatProperty}`);

        onTaskCompleted(task, TaskProcessingOutcome.Processed, null);
      } else {
        const errors = replaceTsWithNgInErrors(
            ts.formatDiagnosticsWithColorAndContext(result.diagnostics, bundle.src.host));
        onTaskCompleted(task, TaskProcessingOutcome.Failed, `compilation errors:\n${errors}`);
      }
    };
  };
}

function getFileWriter(
    fs: FileSystem, logger: Logger, pkgJsonUpdater: PackageJsonUpdater,
    createNewEntryPointFormats: boolean, errorOnFailedEntryPoint: boolean): FileWriter {
  return createNewEntryPointFormats ?
      new NewEntryPointFileWriter(fs, logger, errorOnFailedEntryPoint, pkgJsonUpdater) :
      new InPlaceFileWriter(fs, logger, errorOnFailedEntryPoint);
}
