/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {migrateFor} from './fors';
import {migrateIf} from './ifs';
import {migrateSwitch} from './switches';
import {AnalyzedFile, MigrateError} from './types';
import {canRemoveCommonModule, processNgTemplates, removeImports} from './util';

/**
 * Actually migrates a given template to the new syntax
 */
export function migrateTemplate(
    template: string, templateType: string, node: ts.Node,
    file: AnalyzedFile): {migrated: string, errors: MigrateError[]} {
  let errors: MigrateError[] = [];
  let migrated = template;
  if (templateType === 'template') {
    const ifResult = migrateIf(template);
    const forResult = migrateFor(ifResult.migrated);
    const switchResult = migrateSwitch(forResult.migrated);
    migrated = processNgTemplates(switchResult.migrated);
    file.removeCommonModule = canRemoveCommonModule(template);

    errors = [
      ...ifResult.errors,
      ...forResult.errors,
      ...switchResult.errors,
    ];
  } else {
    migrated = removeImports(template, node, file.removeCommonModule);
  }

  return {migrated, errors};
}
