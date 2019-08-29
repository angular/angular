/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from '../../../src/ngtsc/file_system';
import {markAsProcessed} from '../packages/build_marker';
import {PackageJsonFormatProperties} from '../packages/entry_point';
import {PackageJsonUpdater} from '../writing/package_json_updater';

import {Task, TaskProcessingOutcome} from './api';


/** A helper function for handling a task's being completed. */
export const onTaskCompleted =
    (pkgJsonUpdater: PackageJsonUpdater, task: Task, outcome: TaskProcessingOutcome): void => {
      const {entryPoint, formatPropertiesToMarkAsProcessed, processDts} = task;

      if (outcome === TaskProcessingOutcome.Processed) {
        const packageJsonPath = resolve(entryPoint.path, 'package.json');
        const propsToMarkAsProcessed: PackageJsonFormatProperties[] =
            [...formatPropertiesToMarkAsProcessed];

        if (processDts) {
          propsToMarkAsProcessed.push('typings');
        }

        markAsProcessed(
            pkgJsonUpdater, entryPoint.packageJson, packageJsonPath, propsToMarkAsProcessed);
      }
    };
