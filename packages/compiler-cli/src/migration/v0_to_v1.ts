/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import * as inquirer from 'inquirer';

/**
 * Resolves the conflicts during migration
 * - either manually by asking the user which translation to keep,
 * - or automatically by always selecting the first translation
 *
 * @internal
 */
export function resolveConflicts(
    v1ToV0: compiler.V1ToV0Map, conflicts: compiler.V1ToV0Conflicts, file: string,
    autoResolve: boolean): Promise<compiler.V0ToV1Map> {
  if (autoResolve || Object.keys(conflicts).length === 0) {
    return Promise.resolve(compiler.resolveConflictsAuto(v1ToV0));
  }

  const prompts: inquirer.Questions = Object.keys(conflicts).map(
      (v1: string) => ({
        type: 'list',
        name: v1,
        message: `Conflicts in "${file}", which translation do you want to keep?`,
        choices: conflicts[v1].map(entry => ({name: entry.msg, value: entry.id})),
      }));

  return inquirer.prompt(prompts).then(
      resolutions => compiler.resolveConflicts(v1ToV0, resolutions));
}
