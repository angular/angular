/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Task} from './api';

/** Stringify a task for debugging purposes. */
export const stringifyTask = (task: Task): string =>
    `{entryPoint: ${task.entryPoint.name}, formatProperty: ${task.formatProperty}, processDts: ${task.processDts}}`;
